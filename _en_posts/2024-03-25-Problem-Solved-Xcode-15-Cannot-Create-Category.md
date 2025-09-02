---
layout: post
lang: en
title: "Problem Solved: Xcode 15 Cannot Create Category"
subtitle: "Xcode Bug Fix"
date: 2024-03-25
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [Xcode]

---

## 1. Background

After upgrading Xcode, I found that creating the category file failed.

## 2. Solution

Through research, I found that Xcode 15 was missing two files:

- CategoryNSObject

The path is as follows:

```sh
vi /Applications/Xcode.app/Contents/Developer/Library/Xcode/Templates/File\ Templates/MultiPlatform/Source/Objective-C\ File.xctemplate/CategoryNSObject/___VARIABLE_extendedClass/identifier___+___VARIABLE_productName/identifier___.h
```

Copy the following content

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

Copy the following content

```objc
//___FILEHEADER___

#import "___VARIABLE_extendedClass:identifier___+___VARIABLE_productName:identifier___.h"

@implementation ___VARIABLE_extendedClass:identifier___ (___VARIABLE_productName:identifier___)

@end

```



- ExtensionNSObject: 

The path is as follows: 

```shell 
/Applications/Xcode.app/Contents/Developer/Library/Xcode/Templates/File\ Templates/MultiPlatform/Source/Objective-C\ File.xctemplate/ExtensionNSObject/___VARIABLE_extendedClass/identifier___+___VARIABLE_productName/identifier___ 
```

Copy the following content

```objc
//___FILEHEADER___

___IMPORTHEADER_extendedClass___

NS_ASSUME_NONNULL_BEGIN

@interface ___VARIABLE_extendedClass:identifier___ ()

@end

NS_ASSUME_NONNULL_END

```