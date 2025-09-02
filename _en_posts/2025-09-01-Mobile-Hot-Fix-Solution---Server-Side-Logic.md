---
layout: post
lang: en
title: "Mobile Hot Fix Solution - Server-Side Logic"
subtitle: "HotFix"
date: 2025-09-01
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [Hot Fix, JSPatch, OCRunner]

---

## 1. Background

Once the client has the ability to apply patches, a reliable server is required to distribute patches to the production environment for efficient and secure patch push. The following describes the core modules and implementation logic of the server-side patch distribution capability.

## 2. Technical Solution

### 2.1. Patch Generation Technical Solution

#### 2.1.1. Generate Patch

Using the PatchGenerator tool provided by OCRunner, you can perform patch compilation on the class that needs to be modified:

```shell
./PatchGenerator -files TestCrash.m -refs Scripts.bundle -output binarypatch
```

#### 2.1.2. Git differential compilation

To ensure the standardization of the subsequent patch generation process, you can use git differential automatic compilation

```shell
#!/bin/bash
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# Build the full path of PatchGenerator
PATCH_GEN_PATH="$SCRIPT_DIR"

# Check if the file exists and is executable
if [ -x "$PATCH_GEN_PATH" ]; then
# Temporarily add to PATH (valid only for the current script session)
echo "Correct: PatchGenerator "$PATCH_GEN_PATH"
export PATH="$PATCH_GEN_PATH:$PATH"
else
echo "Error: PatchGenerator does not exist or is not executable"
echo "Path check: $PATCH_GEN_PATH"
exit 1
fi

# Check the number of arguments (two commitIDs are required)
if [ $# -ne 2 ]; then
echo "Usage: $0 <commitID1> <commitID2>"
echo "Example: $0 a1b2c3d e5f6g7h"
exit 1
fi

# Define the target commit range
commit1=$1
commit2=$2

# Temporary file to store the diff list (avoid whitespace issues)
temp_file=$(mktemp)
trap "rm -f $temp_file" EXIT # Automatically clean up temporary files when the script exits.

# Get a list of diffed files (preserving directory structure)
git diff --name-only --diff-filter=ACMRTUXB "${commit1}" "${commit2}" > "$temp_file"

# Check for diffed files
if [ ! -s "$temp_file" ]; then
echo "Warning: No file differences detected, no patch generated"
exit 0
fi

repo_root=$(pwd) # Record the repository root path

files=()
while IFS= read -r file; do
abs_path="$repo_root/$file"
if [ -e "$abs_path" ]; then
files+=("$abs_path")
echo "[add] file: $abs_path"
else
echo "[skipped] File does not exist: $abs_path"
fi
done < "$temp_file"

# Check if the target tool exists
if ! command -v PatchGenerator &> /dev/null; then
echo "Error: PatchGenerator tool not found, please confirm it is installed and added to PATH"
exit 1
fi

# Execute patch generation command
output_path="$repo_root/binarypatch"

# Execute patch generation command
echo "Generating patches (total ${#files[@]} files)..."
PatchGenerator -files "${files[@]}" -refs Scripts.bundle -output "$output_path"

# Check command execution results
if [ $? -eq 0 ]; then
echo "Patch generated successfully!"
echo "$output_path" # 👈 Output patch path
else
echo "Error: Patch generation failed"
exit 1
fi

```

Usage:

```sh
patch_path=$(sh XXX/Tools/auto_build.sh 0742e1b d1e8636)
echo "PATCH PATH: $patch_path"
# You can later publish this path file to the patch download path on the server.
#...
```

### 2.2. Patch Transfer Solution Technical Solution

- MD5 verification to avoid duplicate downloads
- Version verification to avoid unnecessary downloads

```js
// index.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const vc = require("./verisonCompare");

const app = express();
const PORT = 3001;

// Support JSON request bodies
app.use(express.json());

// Static file directory
app.use(express.static(path.join(__dirname, "public")));

// ---- Configuration ----
const PATCH_DIR = path.join(__dirname, "patch"); // Patch file storage directory
const CURRENT_VERSION = "1.1.1"; // Current latest version
const TEMP_LINK_EXPIRE = 60 * 1000; // Temporary link validity period: 1 minute
const tempLinks = new Map(); // Store temporary download links

app.get('/api/endpoint', (req, res) => {
res.json({ foo: 'bar' });
});

// ---- API: Check version ----
app.post("/api/patch/version", (req, res) => {
const { version, md5 } = req.body;

if (!version) {
return res.status(400).json({ error: "version required" });
}

// Check version Updates are supported for versions up to and including the current version.
// You can also set the update only when the version number is equal, that is, == 0
if (vc(version, CURRENT_VERSION) > 0) {
return res.status(400).json({ error: "Invalid version" });
}

// Update required
const patchFile = path.join(PATCH_DIR, "patch");
if (!fs.existsSync(patchFile)) {
return res.status(500).json({ error: "Patch file not found" });
}

// Calculate the server-side patch file MD5
const fileBuffer = fs.readFileSync(patchFile);
const serverMD5 = crypto.createHash("md5").update(fileBuffer).digest("hex");

// If the client MD5 matches the server MD5, the latest patch is available.
if (md5 === serverMD5) {
return res.json({ update: false, message: "Already up-to-date patch" });
}

// Generate a temporary random key
const token = crypto.randomBytes(16).toString("hex");
const expireTime = Date.now() + TEMP_LINK_EXPIRE;

tempLinks.set(token, { path: patchFile, expire: expireTime });

// Return a temporary download link
res.json({
update: true,
version: CURRENT_VERSION,
url: `/api/patch/download/${token}`
});
});

// ---- Download interface: temporary link ----
app.get("/api/patch/download/:token", (req, res) => {
const { token } = req.params;
const link = tempLinks.get(token);

if (!link) {
return res.status(404).send("Invalid or expired link");
}

if (Date.now() > link.expire) {
tempLinks.delete(token);
return res.status(403).send("Link expired");
}

// Set download header
res.download(link.path, "patch.zip", (err) => {
// Delete the temporary link after downloading
tempLinks.delete(token);
});
});

// ---- Start the server ----
app.listen(PORT, () => {
console.log(`File server started: http://localhost:${PORT}`);
});

```

## 3. Supplementary Notes

### 3.1. Scalable Optimization

- Resumable download

Since OCRunner patches are generally not too large, this section is omitted.

- Incremental Updates

In agile mobile internet projects, patches are generally not sustainable, so this section is omitted.

- Other Security Strategies

Stricter encryption and decryption, patch file integrity verification, etc.

Of course, you can also add your own if needed.

### 3.2 Measures to Improve User Experience

- Grayscale Releases

Grayscale patch releases allow you to verify the stability of patch effects and avoid the potential for new, more widespread issues caused by a full release.

- Pre-release/Blocked Updates

Patches can be forced or pre-released based on their priority. For low-priority fixes, pre-releases can be used during off-peak hours, while high-priority fixes can be blocked.