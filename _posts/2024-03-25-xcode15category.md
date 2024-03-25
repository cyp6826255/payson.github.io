---
layout: post
title: "问题解决：Xcode15无法创建Category"
subtitle: "This is a subtitle"
date: 2024-03-25
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: []
---

## 1、背景

升级了xcode之后，发现创建category文件失败

## 2、解决

通过查找资料，发现xcode15 缺乏两组文件：

- CategoryNSObject

  路径如下：

```sh
vi /Applications/Xcode.app/Contents/Developer/Library/Xcode/Templates/File\ Templates/MultiPlatform/Source/Objective-C\ File.xctemplate/CategoryNSObject/___VARIABLE_extendedClass/identifier___+___VARIABLE_productName/identifier___.h
```

复制如下内容

```objc
//___FILEHEADER___

___IMPORTHEADER_extendedClass___

NS_ASSUME_NONNULL_BEGIN

@interface ___VARIABLE_extendedClass:identifier___ (___VARIABLE_productName:identifier___)

@end

NS_ASSUME_NONNULL_END

```



```sh
vi /Applications/Xcode.app/Contents/Developer/Library/Xcode/Templates/File\ Templates/MultiPlatform/Source/Objective-C\ File.xctemplate/CategoryNSObject/___VARIABLE_extendedClass/identifier___+___VARIABLE_productName/identifier___.m
```

复制如下内容

```objc
//___FILEHEADER___

#import "___VARIABLE_extendedClass:identifier___+___VARIABLE_productName:identifier___.h"

@implementation ___VARIABLE_extendedClass:identifier___ (___VARIABLE_productName:identifier___)

@end

```



- ExtensionNSObject：

  路径如下：

  ```shell
  /Applications/Xcode.app/Contents/Developer/Library/Xcode/Templates/File\ Templates/MultiPlatform/Source/Objective-C\ File.xctemplate/ExtensionNSObject/___VARIABLE_extendedClass/identifier___+___VARIABLE_productName/identifier___
  ```

  复制如下内容

```objc
//___FILEHEADER___

___IMPORTHEADER_extendedClass___

NS_ASSUME_NONNULL_BEGIN

@interface ___VARIABLE_extendedClass:identifier___ ()

@end

NS_ASSUME_NONNULL_END

```

