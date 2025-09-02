---
layout: post
lang: en
title: "A Practical Guide to Self-Generated Cross-Platform App Containers on iOS"
subtitle: "Cross-Platform App Containerization"
date: 2025-07-28
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [App container, self-generated]

---

## 1. Introduction

When migrating front-end apps (e.g., HTML5, mini-programs) to apps, native code doesn't need to implement specific business behaviors; it's more about providing basic capabilities. Therefore, the process of creating a containerized shell becomes repetitive, yet also programmatic.

## 2. App Creation Process

This is a brief introduction to the iOS app creation process (from my perspective only; any shortcomings are welcome). The following briefly describes the main steps.

1. Create an iOS App Project

2. Basic Settings (set package name, display name, minimum version, organization settings, URL scheme, etc.)

3. Configure the Podfile

4. Configure resources such as icons and launch images

5. Certificate Configuration (Create a bundle ID and provision from Apple Developer)

6. Build Pipeline Configuration

7. Other Configuration (cross-platform parameters, AppKeys for various third-party libraries, etc.)

8. Distribution (App Store, other internal channels)

…

## 3. Introduction to Automatic Shell Project Generation

GitHub Project Address: https://github.com/Payson-Chen/PSCiOSMiddleWareProj

### 1. Check Configuration

Configure res/content.json. For detailed instructions, refer to [res/README.md](res/README.md)

### 2. Register Third-Party Dependencies

Apply for the corresponding appkeys based on the third-party dependencies. For example, if you need:

- Push (offline push)

- Location-Based Services (LBS)

You will need to apply for:

- Umeng offline push appkey

- Amap appkey

### 3. Prepare Resources

Reference: [res/README.md](res/README.md)

### 4. Apply for a Certificate

Steps as follows:

1. Log in to the [Apple Developer Backend](https://developer.apple.com/) and apply for the relevant Provisioning Profiles using the provided bundle ID.

2. Download and install locally.
3. When you open the project, configure the Provisioning Profiles in the project.

### 5. Create a Git Repository

Create a Git repository with the same appName as in the configuration. The git directory after creation will typically be:

```shell
git@github.com:Payson-Chen/$NAME.git
```

### 6. Pipeline Setup

Steps:

1. Add the build repository submodule.

```shell
git submodule add git@github.com:Payson-Chen/PSC_iOS_Build_SH.git
```

2. Build Configuration

Prepare debug and release builds, using Xcode Archive for debugging and AppStore export respectively.

ExportOptions.plist

=>Change the method field from debuging -> development

ExportOptionsAppStore.plist

=>No modification required

Place this in the current Git repository's root directory (one level above the project directory).

### 7. Distribution Configuration

If you choose PGY distribution, after the initial package build, you will need to create a channel on PGY and modify the suffix (see other methods for more information).

### 8. Enable Offline Push

Log in to the Umeng backend to enable offline push.

1. [Create a p8 certificate](https://developer.apple.com/account/resources/authkeys/list) (if the current developer account does not exist)

2. [Umeng Backend](https://upush.umeng.com/apps/list/createApp) Upload the p8 certificate

3. Test Offline Push

Start the app to print the deviceToken, and test whether offline push notifications are received in the Umeng test push section.

## IV. Configuration Introduction

### 1. Configure content.json

content.json Description:

- 1. bundleId: Package name
- 2. appName: Project name
- 3. displayName: Name displayed on the phone's desktop
- **4. index: Homepage address (if no tab exists, this is a single-page app entry)**
- **5. login: Login page address (required for app login; if not present, there will be no token validation to switch to the homepage)**
- 6. mainColor: Theme color, used for tab text and other themes. If not specified, the selected color of the tab icon will be used.
- 7.tab: Home page tab address (if an index exists, tab takes precedence)
- url: Content URL
- title: Title
- icon: Icon
- 8.cfg: Dependency Configuration
- apm: Performance Monitoring
- enable: Enabled
- key: Umeng APM Monitoring app key
- pay: Payment Module
- aliPay: Alipay Payment
- enable: Enabled
- wx: WeChat
- enable: Enabled
- key: WeChat app ID
- univesalLink: WeChat payment callback
- push: Offline push
- enable: Enabled
- key: Umeng Push app key
- dataAnalysis:
- enable: Enabled
- key: Reporting URL
- LBS
- enable: Enabled
- key: Amap key
- 9.customCfg
- UICfg
- isFullScreen: Whether to display in full screen (whether the top safe area is fully occupied)
- isHideNavBar: Whether to hide the native navigation bar by default (cross-platform navigation bar style and visibility can be managed independently)

- logiCfg
- needCheckUpdate: Whether to check for app updates

- - -


```json
{ 
"appName" : "PSCProj", 
"bundleId" : "com.psc.proj.app", 
"cfg" : { 
"apm" : { 
"enable" : 1, 
"key" : "456" 
}, 
"dataAnalysis" : { 
"enable" : 1, 
"key" : "https://dddd.com" 
}, 
"LBS" : { 
"enable" : 1, 
"key" : "e2d5e63e3b53e95ec3c4d4e93d30748f" 
}, 
"pay" : { 
"aliPay" : { 
"enable" : 1 
}, 
"wx" : { 
"enable" : 1, 
"key" : "yyy", "univesalLink" : "https://zzz.com/example-ios/"
}
},
"push" : {
"enable" : 1,
"key" : "aaa"
}
},
"customCfg" : {
"logicCfg" : {
"needCheckUpdate" : 1
},
"UICfg" : {
"isFullScreen" : 1
}
},
"displayName" : "App name displayed on the desktop",
"index" : "http://business-h5.dev.psc.com/pages/index/index",
"login" : "http://business-h5.dev.psc.com/pages/login/index",
"mainColor" : "0xffffff",
"tab" : [
{
"icon" : "tab_home",
"title" : "t1",
"url" : "https://www.baidu.com"
},
{
"icon" : "tab_message",
"title" : "t2",
"url" : "https://www.sina.com.cn"
},
{
"icon" : "tab_mine",
"title" : "t3",
"url" : "https://www.qq.com"
}
]
}
```

### 2. Configuring Resource Files

#### 2.1 src Image

#### 2.1.1 Desktop Icon

- Icon Size: 1024x1024
- Icon Path: res/src/icon/1024x1024.png

#### 2.1.2 Startup Image

Image Size: 1125x2436

Image path: res/src/bg/1125x2436.png

#### 2.1.3 Tab Icon (Optional)

If you want to host the app as a tab, you need to specify a tab icon.

Image size: Any, preferably larger than 72x72.

Image path: res/src/tab/t0/n.png (normal), res/src/tab/t0/s.png (selected) ... Use as many tabs as you want. **If there are no pre-made icons, they will not be generated and you will need to manually set them**

### 2.2 Target Image

#### 2.2.1 Images.xcassets: Resource Path

- AppIcon.appiconset: App Icon

- Contents.json: Icon Configuration

```json
{
"images" : [
{
"filename" : "40x40.png",
"idiom" : "universal",
"platform" : "ios",
"scale" : "2x", 
"size" : "20x20" 
}, 
{ 
"filename" : "60x60.png", 
"idiom" : "universal", 
"platform" : "ios", 
"scale" : "3x", 
"size" : "20x20" 
}, 
{ 
"filename" : "58x58.png", 
"idiom" : "universal", 
"platform" : "ios", 
"scale" : "2x", 
"size" : "29x29" 
}, 
{ 
"filename" : "87x87.png", 
"idiom" : "universal", 
"platform" : "ios", 
"scale" : "3x", 
"size" : "29x29" 
}, 
{ 
"filename" : "76x76.png", "idiom" : "universal", 
"platform" : "ios", 
"scale" : "2x", 
"size" : "38x38" 
}, 
{ 
"filename" : "114x114.png", 
"idiom" : "universal", 
"platform" : "ios", 
"scale" : "3x", 
"size" : "38x38" 
}, 
{ 
"filename" : "80x80.png", 
"idiom" : "universal", 
"platform" : "ios", 
"scale" : "2x", 
"size" : "40x40" 
}, 
{ 
"filename" : "120x120.png", 
"idiom" : "universal", 
"platform" : "ios", 
"scale" : "3x", 
"size" : "40x40" 
}, 
{ 
"filename" : "120x120 1.png", 
"idiom" : "universal", 
"platform" : "ios", 
"scale" : "2x", 
"size" : "60x60" 
}, 
{ 
"filename" : "180x180.png", 
"idiom" : "universal", 
"platform" : "ios", 
"scale" : "3x", 
"size" : "60x60" 
}, 
{ 
"filename" : "128x128.png", 
"idiom" : "universal", 
"platform" : "ios", 
"scale" : "2x", 
"size" : "64x64" 
}, 
{ 
"filename" : "192x192.png", "idiom" : "universal", 
"platform" : "ios", 
"scale" : "3x", 
"size" : "64x64" 
}, 
{ 
"filename" : "136x136.png", 
"idiom" : "universal", 
"platform" : "ios", 
"scale" : "2x", 
"size" : "68x68" 
}, 
{ 
"filename" : "152x152.png", 
"idiom" : "universal", 
"platform" : "ios", 
"scale" : "2x", 
"size" : "76x76" 
}, 
{ 
"filename" : "167x167.png", 
"idiom" : "universal", 
"platform" : "ios", 
"scale" : "2x", 
"size" : "83.5x83.5"
},
{
"filename" : "1024x1024.png",
"idiom" : "universal",
"platform" : "ios",
"size" : "1024x1024"
}
],
"info" : {
"author" : "xcode",
"version" : 1
}
}

```

- Automatic Generation

The script will automatically generate the following icons based on the format defined in content.json: xx.png: specific size icons.

```json
1024x1024.png
58x58.png
60x60.png
76x76.png
80x80.png
87x87.png
114x114.png
120x120.png 
120x120.png 
128x128.png 
136x136.png 
152x152.png 
167x167.png 
180x180.png 
192x192.png 
40x40.png 
```

#### 2.2.2 LaunchBg.imageset: Launch Image

- Contents.json: Launch Image Configuration

```json
{
"images" : [
{
"filename" : "375x812.png",
"idiom" : "universal",
"size" : "375x812",
"scale" : "1x"
},
{
"filename" : "750x1624.png",
"idiom" : "universal",
"size" : "375x812",
"scale" : "2x"
},
{
"filename" : "1125x2436.png",
"idiom" : "universal",
"size" : "375x812",
"scale" : "3x"
}
],
"info" : {
"author" : "xcode",
"version" : 1
}
}

```

- xx.png: Startup image

```
1125x2436.png
375x812.png
750x1624.png
```