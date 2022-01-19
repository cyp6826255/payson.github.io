---
layout: post
title: "iOS应用接收文件打开类型"
subtitle: ""
date: 2022-01-19
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []
---

## 0x00 背景

​	K歌音频上传工具1.0需求调研，在探索上传的几种方式当中，涉及到引导用户从QQ微信打开，并提供能力。这就牵涉到从其他应用讲音视频文件导入（打开/传入）到K歌的需要。

## 0x01 技术方案

​	通过设置Xcode Document Types，可以设置项目可接收的文件类型，附带一份：[官方提供的文件类型列表](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html#//apple_ref/doc/uid/TP40009259-SW1)。

​	![](img/2022-01-19-iOS-OpenType/doctypes.png)



## 0x02 项目实现

当前iOS应用的生命周期管理有以下两种方式

- ##### UIApplicationDelegate

  iOS13之前，Appdelegate的职责全权处理App生命周期和UI生命周期：

  ![](img/2022-01-19-iOS-OpenType/appdelegate.jpg)

  在不需要多Window场景下，在AppDelegate中实现

  ```objc
  -(BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
      NSLog(@"url=%@---options=%@", url, options);
      return YES
  }
  ```

  输出：

  ```
  url=file:///private/var/mobile/Containers/Data/Application/32D902CA-E0EB-487B-8C08-8C5A277967E3/Documents/Inbox/RPReplay_Final1641554324-31.MP3---options={
      UIApplicationOpenURLOptionsOpenInPlaceKey = 0;
  }
  ```

  

- #### UIWindowSceneDelegate	

​	iOS13之后，`Appdelegate`不在负责UI生命周期，所有UI生命周期交给`SceneDelegate`处理：

![](img/2022-01-19-iOS-OpenType/scene_Appdelegate.jpg)

![](img/2022-01-19-iOS-OpenType/scene_delegate.jpg)

在SceneDelegate场景中实现回调监听：

```objective-c
- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts {
    NSLog(@"scene = %@", URLContexts);
}
```

输出：

```
{(
    <UIOpenURLContext: 0x2817cc760; URL: file:///private/var/mobile/Containers/Data/Application/F63608F2-7BA5-4374-9ADB-6D6B1135C771/Documents/Inbox/RPReplay_Final1641554324-20.MP3; options: <UISceneOpenURLOptions: 0x2802b09c0; sourceApp: (null); annotation: (null); openInPlace: NO; _eventAttribution: (null)>>
)}
```

## 0x03 备注

#### 音频文件导入：

QQ分享的音频可以支持其他应用打开，导入到第三方应用

微信分享的音频可以支持其他应用打开，导入到第三方应用

#### 视频文件导入：

QQ分享的视频可以支持其他应用打开，导入到第三方应用

微信分享的视频无法导入



## 0x04 补充资料

Document Types Data包含关系如下：

![](img/2022-01-19-iOS-OpenType/public.data.gif)



各类型说明：[iOS系统更多应用打开](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html#//apple_ref/doc/uid/TP40009259-SW1)





