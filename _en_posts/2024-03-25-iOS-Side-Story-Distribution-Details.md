---
layout: post
lang: en
title: "iOS Side Story: Distribution Details"
subtitle: "Distribution"
date: 2024-03-25
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [Distribution]

---

## 1. Background

Without a robust mobile CI/CD platform (such as Tencent BlueShield), we need to find our own distribution solution. Currently, we use the Dandelion app's internal distribution platform. However, the free version has limitations, such as limits on the number of version numbers and storage size. We plan to deploy a more user-friendly CI/CD service to address this issue.

## 2. Build Certificate Details

Analysis of the four build methods:

- `App Store`: Used for publishing to the App Store, compiled using a distribution certificate.
- Certificate Type: `production`
- exportOptionsPlist method: `app-store`
- signingCertificate: Apple Distribution
- `Ad Hoc`: This can be used on devices whose `UDID` has been added to the developer account, compiled using a distribution certificate. (`production`)
- Certificate Type: `production`
- exportOptionsPlist method: `ad-hoc`
- signingCertificate: Apple Distribution
- `Enterprise`: This is for enterprise distribution, compiled using an enterprise certificate.
- This item is not covered at this time.
- `Development`: This can be used on devices whose `UDID` has been added to the developer account, compiled using a development certificate. (Development)
- Certificate Type: Development
- ExportOptionsPlist Method: Development
- SigningCertificate: Apple Development

## 3. Ad-Hoc vs. Development

Unlike Enterprise vs. App Store, Ad-Hoc vs. Development, according to Apple:

```
Create an ad hoc provisioning profile to run your app on devices without Xcode. Before you begin, you need an App ID, a single distribution certificate, and multiple registered devices.
```

iOS apps have always had a strict (and closed) approach to installation package management, which impacts the iOS development and testing process. Both Ad-Hoc and Development require "registered devices"—devices must be registered with Apple before distribution. The difference between the two is this:

Ad Hoc is closer to verification prior to distribution through the App Store, but can only be installed on registered devices. Push device tokens and in-app purchases are considered production environments.

[Development] can only be installed on registered devices. Push device tokens are different from Ad Hoc devices, and in-app purchases are not considered production environments.

## 4. App Store vs. Enterprise

[App Store] Apple's official distribution and listing path

[Enterprise] is not distributed through Apple's official App Store, does not require pre-registration of devices, and requires a $299/year license.