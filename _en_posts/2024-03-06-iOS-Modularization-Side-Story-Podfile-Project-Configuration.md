---
layout: post
lang: en
title: "iOS Modularization Side Story: Podfile Project Configuration"
subtitle: "cocoaPods"
date: 2024-03-06
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [podfile]

---

## 1. Generate organization information in cocoapods

Template modification

Add the following to the podfile:

```ruby
post_install do |installer|
installer.pods_project.root_object.attributes["ORGANIZATIONNAME"] = "YOUR ORGANIZATIONNAME"
end
```

In execution

```shell
pod install
```

After that, the "ORGANIZATIONNAME" field of the project will be automatically filled with the value you want:

![1](/img/2024-3-6-podfile/img1.png)

## 2. Main project signature

```ruby
post_install do |installer|
installer.pods_project.targets.each do |target|
target.build_configurations.each do |config|
config.build_settings["DEVELOPMENT_TEAM"] = "xxxxx" #Specify the signature here to avoid compilation errors and manual specification
end
end
end
```

## 3. Other parameter configuration

```ruby
post_install do |installer|
installer.pods_project.root_object.attributes["ORGANIZATIONNAME"] = "YOUR ORGANIZATIONNAME"
installer.pods_project.targets.each do |target|
target.build_configurations.each do |config|
config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0' #Set the minimum iOS version
config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = "arm64" #Support M-series simulators

config.build_settings['CODE_SIGNING_ALLOWED'] = "NO" #Resolve the error "error: Signing for 'XX' requires a development team." encountered when running in Xcode 14
config.build_settings['EXPANDED_CODE_SIGN_IDENTITY'] = ""
config.build_settings['CODE_SIGNING_REQUIRED'] = "NO"

config.build_settings['DEVELOPMENT_TEAM'] = "xxxx" #Specify the signature here to avoid compilation errors and manual specification
end
end
end
```