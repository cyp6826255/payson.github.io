---
layout: post
lang: zh
title: "iOS话外篇：分发详解"
subtitle: "分发"
date: 2024-03-25
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [分发]
---

## 1.背景

在没有良好的移动端CI/CD（比如腾讯蓝盾）背景下，需要先通过自行寻找分发方案，当前使用蒲公英应用内侧分发平台进行分发，由于免费版存在使用限制，比如对版本号数量限制、以及存储大小限制等。后续考虑部署较为友好的CICD服务来解决此问题。

## 2.构建证书详解

4种构建方式解析：

- `App Store` : 用来发布到App Store， 使用发布证书编译。
  - 证书类型：`production`
  - exportOptionsPlist method：app-store
  - signingCertificate：Apple Distribution
- `Ad Hoc` : 在开发者账号中添加过`UDID`的设备可以使用，使用发布证书编译。(`production`)
  - 证书类型：`production`
  - exportOptionsPlist method：ad-hoc
  - signingCertificate：Apple Distribution
- `Enterprise` : 企业发布，使用企业证书编译。
  - 这一项暂不涉及
- `Development`: 在开发者账号中添加过`UDID`的设备设备可以使用，使用开发证书编译。(`Development`)
  - 证书类型：`Development`
  - exportOptionsPlist method：development
  - signingCertificate：Apple Development

## 3. Ad-Hoc与Development

有别于【Enterprise】与【App Store】，【Ad-Hoc】与【Development】根据Apple的说明：

```
Create an ad hoc provisioning profile to run your app on devices without needing Xcode. Before you begin, you need an App ID, a single distribution certificate, and multiple registered devices.
```

iOS App对于安装包的管理一贯的严格（封闭）风格，影响着iOS的开发测试流程，【Ad-Hoc】与【Development】需要“registered devices”，需要事先先把设备注册到Apple才能实现分发，而这两者的区别在于：

【Ad Hoc】更贴近于通过App Store分发之前的验证，差别是只能通过注册的设备安装。诸如推送的device token、App内购属于生产环境，

【Development】只能通过注册的设备安装，推送的device token有别于Ad Hoc、App内购不是生产环境

## 4. App Store与Enterprise

【App Store】Apple官方的分发上架路径

【Enterprise】不通过Apple官方应用商店App Store分发，不需要提前注册设备，需要299美金/年证书

