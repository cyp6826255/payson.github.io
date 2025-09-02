---
layout: post
title: "iOS application file opening type for receiving files"
subtitle: ""
date: 2022-01-19
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
lang: en
tags: []
---

## 0x00 Background

The K Audio Uploading Tool 1.0 needs study, among several ways to explore uploading, involves directing users to open from QQ micromails and providing capabilities. This involves the need to import (open/inbound) from other audio-speaker video files to K Songs.

## 0x01 Technical programme

By setting Xcode Document Types, you can set the type of file that the project can receive, with a copy: [List of official file types](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html#//apple_ref/doc/uid/TP40009259-SW1)I don't know.

 ![](/img/2022-01-19-iOS-OpenType/doctypes.png)



## 0x02 Project realization

The life-cycle management of current iOS applications is carried out in two ways:

- ##### UIApplicationDelegate

  Prior to iOS13, Appdelegate had exclusive responsibility for the App life cycle and UI life cycle:

  ![](/img/2022-01-19-iOS-OpenType/appdelegate.jpg)

  It's done in AppDelegate without more Windows scenes.

  ```objc
  -(BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
      NSLog(@"url=%@---options=%@", url, options);
      return YES
  }
  ```

  Output:

  ```
  url=file:///private/var/mobile/Containers/Data/Application/32D902CA-E0EB-487B-8C08-8C5A277967E3/Documents/Inbox/RPReplay_Final1641554324-31.MP3---options={
      UIApplicationOpenURLOptionsOpenInPlaceKey = 0;
  }
  ```

  

- #### UIWindowSceneDelegate

After iOS13, `Appdelegate`Not in charge of UI life cycle, all UI life cycle handed over `SceneDelegate`Processing:

![](/img/2022-01-19-iOS-OpenType/scene_Appdelegate.jpg)

![](/img/2022-01-19-iOS-OpenType/scene_delegate.jpg)

In the context of the SceneDelegate scene, backtracking is possible:

```objective-c
- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts {
    NSLog(@"scene = %@", URLContexts);
}
```

Output:

```
{(
    <UIOpenURLContext: 0x2817cc760; URL: file:///private/var/mobile/Containers/Data/Application/F63608F2-7BA5-4374-9ADB-6D6B1135C771/Documents/Inbox/RPReplay_Final1641554324-20.MP3; options: <UISceneOpenURLOptions: 0x2802b09c0; sourceApp: (null); annotation: (null); openInPlace: NO; _eventAttribution: (null)>>
)}
```

## 0x03 Remarks

#### Audio file import:

Audio shared by QQ supports other applications to open and import to third-party applications

Micromail shared audio can support other applications to open and import to third-party applications

#### Video file import:

A video shared by QQ supports other applications to open and import to third-party applications

Can not get message: %s %s



## 0x04 Supplementary information

Document Types Data contains the following:

![](/img/2022-01-19-iOS-OpenType/public.data.gif)



Description of types: [Open up more iOS applications](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html#//apple_ref/doc/uid/TP40009259-SW1)





