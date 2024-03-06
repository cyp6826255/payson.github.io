---
layout: post
title: "iOS组件化话外篇：Podfile 工程配置"
subtitle: "This is a subtitle"
date: 2024-03-06
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [podfile]
---



## 1、cocopaods生成 组织信息

​	模板修改

​	podfile新增：

```ruby
post_install do |installer|
    installer.pods_project.root_object.attributes["ORGANIZATIONNAME"] = "YOUR ORGANIZATIONNAME"
end
```

在执行

```shell
pod install
```

之后，工程项目的“ORGANIZATIONNAME”的字段自动填充你所要的值：

![1](/img/2024-3-6-podfile/img1.png)



## 2、主工程签名

```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings["DEVELOPMENT_TEAM"] = "xxxxx"  #这里指定签名，避免编译出错还要手动指定
    end
  end
end
```

## 3、其他参数配置

```ruby
post_install do |installer|
  installer.pods_project.root_object.attributes["ORGANIZATIONNAME"] = "YOUR ORGANIZATIONNAME"
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'	#设置最低iOS版本
      config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"	#支持M系列模拟器
      
			config.build_settings['CODE_SIGNING_ALLOWED'] = "NO"# 解决xcode14 运行报错运行遇到的报错 “error: Signing for “XX” requires a development team.”
			config.build_settings['EXPANDED_CODE_SIGN_IDENTITY'] = ""
      config.build_settings['CODE_SIGNING_REQUIRED'] = "NO"
      
      config.build_settings["DEVELOPMENT_TEAM"] = "xxxx"  #这里指定签名，避免编译出错还要手动指定
    end
  end
end
```

