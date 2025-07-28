---
layout: post
title: "基于iOS端自生成跨平台App容器的实践"
subtitle: "App跨平台容器化"
date: 2025-07-28
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [App容器,自生成]
---

## 一、前言

在搬运前端App（h5、小程序）等，到App的过程中，原生无需实现具体的业务行为，更多的是提供基础能力。因此提供一个容器化的壳工程的过程变得重复、但同时也可程序化。

## 二、App新建过程

这里简单介绍一款iOS的App的新建过程（仅限我的视角，不足之处欢迎指出），以下简单介绍一些主要步骤

1、新建iOS App工程

2、基础设置（设置包名、显示名称、最低版本、组织设置、URL Scheme等）

3、配置Podfile

4、配置icon、启动图等图片资源

5、证书配置（Apple Developer 新建bundle ID、Provision等）

6、构建流水线配置

7、其他配置（跨平台参数、各类三方依赖库APPKEY等）

8、分发（AppStore、其他内侧渠道）

……

## 三、壳工程自动生成介绍

github项目地址：https://github.com/Payson-Chen/PSCiOSMiddleWareProj

### 1、检查配置

	配置 res/content.json，详细说明	参考：[res/README.md](res/README.md)

### 2、注册三方依赖

	根据第三方依赖情况，分别申请对应的appkey，例如需要:

- Push（离线推送）

- LBS（定位服务）

  则需要申请

- 友盟离线推送appkey

- 高德地图appkey

### 3、准备资源

	参考：[res/README.md](res/README.md)

### 4、申请证书

	步骤如下：

1. 登录 [Apple开发者后台](https://developer.apple.com/)，以提供的bundleID 申请相关的Provisioning Profiles
2. 下载到本地安装
3. 打开工程时，在工程中配置Provisioning Profiles

### 5、Git仓库创建

到Git仓库上创建与配置中的 appName 一致的，建好之后的git一般为：

```shell
git@github.com:Payson-Chen/$NAME.git
```

### 6、流水线搭建

步骤:

1. 添加 构建仓库 submodule，

   ```shell
   git submodule add git@github.com:Payson-Chen/PSC_iOS_Build_SH.git
   ```

2. 构建配置

   准备 debug 和 release 两份，分别通过Xcode Archive，进行Debug 和 AppStore的Export

   ExportOptions.plist

   		=>修改 method 字段 debuging -> development

   ExportOptionsAppStore.plist

   		=>无需修改

   放置到当前git仓库根目录（项目上一级目录）

   

### 7、分发配置

如果是选择pgy分发，首次打完包之后，需到pgy上创建渠道修改后缀名（可参考其他方式）

### 8、离线推送开通

登录友盟后台开通离线推送

1. [创建p8证书](https://developer.apple.com/account/resources/authkeys/list)（如当前开发者账号不存在）

2. [友盟后台](https://upush.umeng.com/apps/list/createApp) 上传p8证书

3. 测试离线推送

   启动App打印 deviceToken，在友盟测试推送处测试是否能收到离线推送

## 四、配置介绍

### 1、配置content.json

content.json说明：

- 1.bundleId：包名
- 2.appName：工程名称
- 3.displayName：安装到手机桌面展示的名称
- **4.index：首页地址（不存在tab时为入口单页面应用）**
- **5.login：登录页面地址（应用需要登录必填，不存在则没有判断token切换首页的逻辑）**
- 6.mainColor：主题色，tab文字等主题色，不传以tab-icon的选中色为准
- 7.tab：首页Tab地址（同时存在index时，tab优先级较高）
  - url：内容地址
  - title：标题
  - icon：图标
- 8.cfg：依赖配置
  - apm：性能监控
    - enable：是否启用
    - key：友盟APM监控appkey
  - pay：支付模块
    - aliPay：支付宝支付
      - enable：是否启用
    - wx：微信
      - enable：是否启用
      - key：微信appid
      - univesalLink：微信支付后回调
  - push：离线推送
    - enable：是否启用
    - key：友盟push的appkey
  - dataAnalysis：
    - enable：是否启用
    - key：上报地址
  - LBS
    - enable：是否启用
    - key：高德地图key
- 9.customCfg
  - UICfg
    - isFullScreen：是否全屏显示（顶部安全区域是否占满）
    - isHideNavBar：是否默认隐藏原生导航条（跨平台自行管理导航条样式及显隐）

  - logiCfg
    - needCheckUpdate：是否需要进行App更新的检测


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
        "key" : "yyy",
        "univesalLink" : "https://zzz.com/example-ios/"
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
  "displayName" : "App展示在桌面的名称",
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



### 2、配置资源文件

#### 2.1 src图片

#### 2.1.1 桌面图标

- 图标尺寸：1024x1024
- 图标路径：res/src/icon/1024x1024.png

#### 2.1.2 启动图

	图片尺寸：1125x2436
	
	图片路径：res/src/bg/1125x2436.png

#### 2.1.3 Tab图标（可选）

	如果需要以Tab的形式承载，需要指定Tab图标
	
	图片尺寸：任意，最好大于72x72
	
	图片路径：res/src/tab/t0/n.png(常规)、res/src/tab/t0/s.png(选中) …… 有几个tab就几个，**如果没有预制则无法生成，需要手动设置图标**



### 2.2 目标图片

#### 2.2.1 Images.xcassets：资源路径

- AppIcon.appiconset：app图标

  - Contents.json：图标配置

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
          "filename" : "76x76.png",
          "idiom" : "universal",
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
          "filename" : "192x192.png",
          "idiom" : "universal",
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

  - 自动生成

    	脚本会根据上述的content.json,定义的格式，自动生成：xx.png：具体尺寸图标

    ```json
    1024x1024.png
    58x58.png
    60x60.png
    76x76.png
    80x80.png
    87x87.png
    114x114.png
    120x120 1.png
    120x120.png
    128x128.png
    136x136.png
    152x152.png
    167x167.png
    180x180.png
    192x192.png
    40x40.png
    ```

  

  #### 2.2.2 LaunchBg.imageset：启动图

  - Contents.json：启动图配置

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

  - xx.png：启动图片

    ```
    1125x2436.png
    375x812.png
    750x1624.png
    ```

  
