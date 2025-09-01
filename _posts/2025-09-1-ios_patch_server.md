---
layout: post
title: "移动端热更新方案之服务端逻辑"
subtitle: "HotFix"
date: 2025-09-01
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [热更新,JSPatch,OCRunner]
---

## 1、背景

​	在客户端具备应用Patch功能后，需要有一个可靠的服务端来分发生产环境的Patch，以实现高效、安全的补丁推送。以下是服务端Patch分发能力的核心模块与实现逻辑。

## 2、技术方案

### 2.1、Patch生成技术方案

#### 2.1.1、生成Patch

通过OCRunner自带的PatchGenerator工具，可以对需要修改的类进行Patch编译：

```shell
./PatchGenerator -files TestCrash.m -refs Scripts.bundle -output binarypatch
```

#### 2.1.2、Git差异化编译

为保证后续Patch生成的流程规范化，可以通过git差异化自动编译

```shell

#!/bin/bash
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# 构建 PatchGenerator 的完整路径
PATCH_GEN_PATH="$SCRIPT_DIR"

# 检查文件是否存在且可执行
if [ -x "$PATCH_GEN_PATH" ]; then
    # 临时添加到 PATH（仅当前脚本会话有效）
    echo "正确：PatchGenerator "$PATCH_GEN_PATH
    export PATH="$PATCH_GEN_PATH:$PATH"
else
    echo "错误：PatchGenerator 不存在或不可执行"
    echo "路径检查：$PATCH_GEN_PATH"
    exit 1
fi

# 检查参数数量（需提供两个commitID）
if [ $# -ne 2 ]; then
    echo "用法: $0 <commitID1> <commitID2>"
    echo "示例: $0 a1b2c3d e5f6g7h"
    exit 1
fi

# 定义目标commit范围
commit1=$1
commit2=$2

# 临时文件存储差异列表（避免空格问题）
temp_file=$(mktemp)
trap "rm -f $temp_file" EXIT  # 脚本退出时自动清理临时文件

# 获取差异文件列表（保留目录结构）
git diff --name-only --diff-filter=ACMRTUXB "${commit1}" "${commit2}" > "$temp_file"

# 检查是否有差异文件
if [ ! -s "$temp_file" ]; then
    echo "警告：未检测到文件差异，无需生成补丁"
    exit 0
fi


repo_root=$(pwd)   # 记录仓库根路径

files=()
while IFS= read -r file; do
    abs_path="$repo_root/$file"
    if [ -e "$abs_path" ]; then
        files+=("$abs_path")
        echo "[add] file: $abs_path"
    else
        echo "[跳过] 文件不存在: $abs_path"
    fi
done < "$temp_file"


# 检查目标工具是否存在
if ! command -v PatchGenerator &> /dev/null; then
    echo "错误：未找到 PatchGenerator 工具，请确认已安装并加入PATH"
    exit 1
fi

# 执行补丁生成命令
output_path="$repo_root/binarypatch"

# 执行补丁生成命令
echo "正在生成补丁（共 ${#files[@]} 个文件）..."
PatchGenerator -files "${files[@]}" -refs Scripts.bundle -output "$output_path"

# 检查命令执行结果
if [ $? -eq 0 ]; then
    echo "补丁生成成功！"
    echo "$output_path"   # 👈 输出补丁路径
else
    echo "错误：补丁生成失败"
    exit 1
fi

```

使用方法：

```sh
patch_path=$(sh XXX/Tools/auto_build.sh 0742e1b d1e8636)
echo "PATCH PATH: $patch_path"
#后续可以将这个路径文件发布到服务端上补丁下载路径
#...
```



### 2.2、Patch传输方案技术方案

- ​	md5校验，避免重复下载
- ​	版本号校验，避免非必要下载

```js
app.post("/api/patch/version", (req, res) => {
  const { version, md5 } = req.body;

  if (!version) {
    return res.status(400).json({ error: "version required" });
  }


  if (version === CURRENT_VERSION) {
    return res.json({ update: false });
  }

  // 需要更新
  const patchFile = path.join(PATCH_DIR, "patch");
  if (!fs.existsSync(patchFile)) {
    return res.status(500).json({ error: "Patch file not found" });
  }

    // 计算服务器端补丁文件 MD5
  const fileBuffer = fs.readFileSync(patchFile);
  const serverMD5 = crypto.createHash("md5").update(fileBuffer).digest("hex");

  // 如果客户端 MD5 和服务端一致 -> 说明已经有最新补丁
  if (md5 === serverMD5) {
    return res.json({ update: false, message: "Already up-to-date patch" });
  }

  // 生成临时随机 key
  const token = crypto.randomBytes(16).toString("hex");
  const expireTime = Date.now() + TEMP_LINK_EXPIRE;

  tempLinks.set(token, { path: patchFile, expire: expireTime });

  // 返回临时下载链接
  res.json({
    update: true,
    version: CURRENT_VERSION,
    url: `/api/patch/download/${token}`
  });
});

```



## 3、补充说明

### 3.1、可拓展的优化

- 断点续传

由于OCRunner的Patch一般不会过大，因此省略

- 增量更新

在敏捷的移动互联网项目中，Patch一般不具备可持续发布性，因此省略

- 其他更安全策略

更严格的加解密、Patch文件完整性校验等。

当然如果需要，也可以自行补充。

### 3.2、 提升用户体验的措施

- 灰度发布 

通过灰度补丁发布，可以验证修复效果稳定性，避免全量发布造成的可能更大面积新问题

- 预热/阻塞更新

可根据补丁优先级进行强制下载/预热下载，在修复低优先级问题可以使用闲时预热下载，高优先级可进行阻塞更新

