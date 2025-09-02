---
layout: post
lang: zh
title: "iOS Modularization Practice: Resource Component Library"
subtitle: ""
date: 2023-07-26
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []

---

# iOS Componentization Implementation: Resource Component Library

## 1 What are the Resources?

 Generally speaking, anything that isn't a code file can be considered a resource file. Examples include, but are not limited to: images, audio, video, animations, fonts, multi-language files (.strings), various resource bundles, built-in databases, and binary encrypted files.

## 2 Why?

 There are some reusable resources. Examples include, but are not limited to:

- Universal style icons

Navigation bar icons, avatars, buttons, single/checkboxes, universal background images, etc.

- Universal media files

Universal click sounds, notification sounds, transitions, loading animations, etc.

- Other common files

City lists, fonts, third-party presets, etc.

Since some resources are common, extracting them and forming components can serve more projects, improving integration efficiency and reducing R&D costs.

## 3 How to do it

### 3.1 Create a new Pod private library

[10,000 words omitted here (see another article)](https://paysonchen.cn/2023/07/26/4-iOS%E7%BB%84%E4%BB%B6%E5%8C%96%E6%A8%A1%E6%9D%BF/)

### 3.2 Migrate main project resources

Main project:

Resources in the project are often scattered throughout, meaning they may not all be stored in the asset collection. You can use the search bar at the bottom of the Xcode Project Navigator to search by file extension (.png / .jpg / .webp / .mp3 /, mp4 ...) Retrieve resources

Resource component library:

The asset folder stores the migrated resources for the main project.

Storage can be in the following formats:

- xcassets collection
- Scattered resource files

Configure podspec:

Configure resources by specifying resource_bundles

```ruby
s.resource_bundles = {
'PSCResource' => [
'PSCResource/Assets/PSCCommon.xcassets',
'PSCResource/Assets/PSCCommonResources/**/*',
'PSCResource/Assets/XXProj.xcassets',
'PSCResource/Assets/XXProjResources/**/*']
}
```

### 3.3 Resource Reading Methods

Before resource componentization, the general usage was

```objective-c
//Image:imageNamed
[UIImage [imageNamed:@"pic"];

//Resources: via mainBundle:
[[NSBundle mainBundle] pathForResource:@"name" ofType:@"ext"];
```

This is because resources in the main project are generally packaged into the root directory of xx.app (xcasset exists as asset.car).

Resources in the component library are packaged into xx.framework/xx.bundle

```shell
…/Debug-iphoneos/xxx.app/Frameworks/xx.framework/xx.bundle/pic.png
…/Debug-iphoneos/xxx.app/Frameworks/xx.framework/xx.bundle/asset.car
…
```

Directly accessing the resource using the following method will result in an empty result.

```Objective-C
//Component library resources: Accessing the resource using the following method will result in a nil result.
[UIImage imageNamed:@"pic"];
[[NSBundle mainBundle] pathForResource:@"name" ofType:@"ext"];
```

To obtain component library resources, add a category to the following class.

- UIImage:

```Objective-C
@interface UIImage (PSCResource)

/// Get a UIImage from a PSCResource by image name
/// - Parameter name: Image name
+ (UIImage *)pscImageNamed:(NSString *)name;

@end

@implementation UIImage (PSCResource)

+ (UIImage *)pscImageNamed:(NSString *)name{
NSBundle *bundle = [NSBundle bundleForClass:NSClassFromString(kCurResPodName)];
NSURL *url = [bundle URLForResource:kCurResBundleName withExtension:@"bundle"];
if (url) {
NSBundle *imageBundle = [NSBundle bundleWithURL:url;
UIImage *img = [UIImage imageNamed:name inBundle:imageBundle compatibleWithTraitCollection:nil];
if (img) {
return img;
}
}
// For the record, when compatible resources are still in the main project, use mainBundle.
return [UIImage imageNamed:name];
}

@end
```

- NSBundle:

```Objective-C
@interface NSBundle (PSCResource)
/// Get resources from a private library
/// - Parameters:
/// - name: Resource name
/// - ext: Resource type
+ (NSString *)pscPathForResource:(NSString *)name ofType:(NSString *)ext;
@end

@implementation NSBundle (PSCResource)
+ (NSString *)pscPathForResource:(NSString *)name ofType:(NSString *)ext {

NSBundle *bundle = [NSBundle bundleForClass:NSClassFromString(kCurResPodName)];
NSURL *url = [bundle URLForResource:kCurResBundleName withExtension:@"bundle"];
if (url) {
NSBundle *resBundle = [NSBundle bundleWithURL:url];
NSString *path = [resBundle pathForResource:name ofType:ext];
if (path) {
return path;
}
}
// For the sake of brevity, when compatible resources are still in the main project, use mainBundle
return [[NSBundle mainBundle] pathForResource:name ofType:ext];
}
@end
```

### 3.4 Main Project Read and Replace

Retrieve all methods in the main project:

```objc
[UIImage imageNamed:@"pic"];
[[NSBundle mainBundle] pathForResource:@"name" ofType:@"ext"];
```

Replace with:

```Objective-C
[UIImage pscImageNamed:@"xx"]
NSString *hotPath = [NSBundle pscPathForResource:@"yy" ofType:@"zz"];
```

Finally, verify that the above call is working correctly.