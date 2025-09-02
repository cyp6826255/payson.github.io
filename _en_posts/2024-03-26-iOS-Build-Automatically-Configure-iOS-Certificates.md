---
layout: post
lang: en
title: "iOS Build: Automatically Configure iOS Certificates"
subtitle: "Automated Certificate Deployment"
date: 2024-03-26
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [Certificate]

---

## 1. Background

Apple development certificates expire once a year. Certificate mismatches, pipelines in new environments, and potential clustered builds may require manual certificate configuration before builds can run properly.

## 2. Solution

To eliminate the need for manual maintenance of the build pipeline due to annual certificate updates, it is desirable to add a certificate deployment step to the build process. To accommodate various pipelines, a simple shell script is used here.

### 2.1 Obtaining and Renewing Certificates

#### 2.1.1 Certificate Categories

-  p12
-  Cer
-  mobileprovision

#### 2.1.2 Creating a Certificate Git Repository

Apply for a certificate in the [Apple Developer Dashboard](https://developer.apple.com/) and submit it to a Git repository. The following structure can be used.

```
Sign
├─install_cer.sh
├─p12
| ├─p12Debug.p12
| └p12Release.p12
├─Cer
| ├─development.cer
| └distribution.cer
├─PSCiOSProjectA
| ├─Push
| | ├─PSCiOSProjectAPush.mobileprovision
| | ├─PSCiOSProjectAPushAppStore.mobileprovision
| | └PSCiOSProjectAPushDistribution.mobileprovision
| ├─App
| | ├─PSCiOSProjectAAppStore.mobileprovision
| | ├─PSCiOSProjectADistribution.mobileprovision
| | └PSCiOSProjectAOnline.mobileprovision
├─PSCiOSProjectB
| ├─Push
| | ├─PSCiOSProjectBPush.mobileprovision
| | └PSCiOSProjectBPushAppStore.mobileprovision
| ├─App
| | ├─PSCiOSProjectBAppStore.mobileprovision
| | ├─PSCiOSProjectBDistribution.mobileprovision
| | └PSCiOSProjectBOnline.mobileprovision

```

Multiple iOS projects are distinguished by target names or other identifiers. The directory structure is as follows:

- Execution scripts
- p12 certificate folder
- Cer certificate folder
- Project certificate folder
- App: Project certificate
- Push: Push certificate

### 2.2 Installing the certificate before building

#### 2.2.1 Obtaining the certificate

A new step has been added before building to pull the Apple developer certificate from the Git repository and install it.

```objc
git clone ssh://PSC-devops.psc.com:30022/PSC/PSC-ios/Tools/Sign.git
cd Sign
sh install_cer.sh PSCiOSProjectA $P12_PWD
```

Where

- Parameter 1: Project name - the certificate for the project to be updated
- Parameter 2: P12 certificate password

#### 2.2.2 Certificate Installation

Certificate installation is divided into three parts: installing P12, installing CER, and installing MobileProvision:

```shell
#!/bin/bash
# Traverse the specified directory and automatically install certificates
# author: Chenyp34
# [Purpose]
# Automated installation of developer certificates

# [Description]
# 1. Traverse the certificates in the specified directory
# 2. Install P12, CER, and MobileProvision in the directory
#
# [Parameters]
# 1. Parameter 1: Project ID
# 2. Parameter 2, P12 certificate password
#
# [Instructions]
# sh install_cer.sh PSCiOSProjectA $P12_PWD

function installFromFold()
{
local func=$1

echo "installFromFold para:1="$1" 2="$2

# Use the find command to find all files and iterate through them with a for loop

find "$2" -type f | while read -r file; do
# Perform an action on each file here, such as printing the file name
if [[ $(basename "$file") != .* ]]; then
echo "$file"
# If you want to perform more complex actions on each file, you can add them here
# For example, use another command to process the file or perform some operation on the file name
echo "installFromFold:$file"
$func $file
else
echo "Unexecuted file:$file"
fi
done
}

function installP12()
{
# Set the certificate file path: "p12/p12Release.p12"

CERTIFICATE_PATH=$1
# Set the password used when importing the certificate
CERTIFICATE_PASSWORD=$p12PWD

# Specify the path to the keychain (in this case, the login keychain)
KEYCHAIN_PATH=~/Library/Keychains/login.keychain-db

# Install the certificate to the keychain
security import "$CERTIFICATE_PATH" -k "$KEYCHAIN_PATH" -P "$CERTIFICATE_PASSWORD" -T /usr/bin/codesign

# Verify that the certificate was successfully installed
security find-identity -p codesigning

echo "P12 installation is completed."
}

function installCer()
{

CERTIFICATE_PATH=$1

# Specify the path to the keychain (in this case, the login keychain)
KEYCHAIN_PATH=~/Library/Keychains/login.keychain-db

# Import the .cer certificate into the keychain
security import "$CERTIFICATE_PATH" -k "$KEYCHAIN_PATH" -T /usr/bin/codesign

echo "Certificate ($CERTIFICATE_PATH) installation is completed."
}

function installProfile()
{
# Set the .mobileprovision file path
MOBILEPROVISION_PATH=$1

# Get the UUID from the profile file
UUID=`grep UUID -A1 -a $MOBILEPROVISION_PATH | grep -io '[-A-F0-9]\{36\}'`
echo "uuid="$UUID"

# Copy to a directory recognized by Xcode
cp "$MOBILEPROVISION_PATH" ~/Library/MobileDevice/Provisioning\ Profiles/$UUID.mobileprovision

echo "Mobile Provisioning Profile installation is completed." $MOBILEPROVISION_PATH ==> $UUID
}

#Configure project name
ProjName=$1

#P12 certificate password
p12PWD=$2

installFromFold installP12 ./p12

installFromFold installCer ./Cer

installFromFold installProfile ./$ProjName

```

## 4. Supplementary App Installation and Certificate Instructions for New Devices

Without a $299/year enterprise certificate, new devices are often added to your team. This requires frequent updates to the device list and profiles in the Apple Developer Manager. These updates can be categorized as follows:

| Adding a new device to the device list | Updating the profile (adding a new device to the profile) | Building directly with the bundler | Building after reinstalling the certificate on the bundler | Whether the new device can be installed |
| -------------------------------------- | --------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------- | --------------------------------------- |
| ✅                                      |                                                           |                                    |                                                            | ❌                                       |
| ✅                                      |                                                           | ✅                                  |                                                            |                                         |
| ✅                                      | ✅                                                         |                                    |                                                            | ❌                                       |
| ✅                                      | ✅                                                         |                                    | ✅                                                          |                                         |
| ✅                                      | ✅                                                         |                                    | ✅                                                          | ✅                                       |

Based on the above practice, we conclude that when adding a test device, the following steps must be completed simultaneously:

- [x] Add the new device to the device list
- [x] Update the profile (add the new device to the profile)
- [x] Reinstall the certificate on the bundler and build

## 3. Continuously updating