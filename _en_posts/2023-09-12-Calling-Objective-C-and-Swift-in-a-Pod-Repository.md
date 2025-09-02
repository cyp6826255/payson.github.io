---
layout: post
lang: en
title: "Calling Objective-C and Swift in a Pod Repository"
subtitle: ""
date: 2023-09-12
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []

---

# Calling Objective-C and Swift in a Pod Repository

## 1. Calling Swift from Objective-C in a Pod

Swift class declarations in a Pod require the following:

```swift
@objcMembers open
```

For example:

```swift
import Foundation

@objcMembers open class SwiftBridge : UIViewController {
open override func viewDidLoad() {
self.view.backgroundColor = UIColor.red
}
}

```

Import on the class you need to use

```objective-c
#import "YourPodName/YourPodName-Swift.h"
```

If you need to call it in multiple places, you can also add it in podspec

```ruby
s.prefix_header_contents = <<-EOS
#if __has_include(<xxxModule/xxxModule-Swift.h>)
#import <xxxModule/xxxModule-Swift.h>
#else
#import "xxxModule/xxxModule-Swift.h"
#endif
EOS
```

XXX-Swift.h mechanism can refer to the key value in Build Setting

```
Objective-C Generated Interface Header Name=$(SWIFT_MODULE_NAME)-Swift.h
```

![1](/img/iosswiift/image1.png)

## 2. Calling OC from Swift in Pod

Pod specifies source_files, where .h files will be loaded into xxxModule-umbrella , which can be directly accessed inside the Pod

```ruby
s.source_files = 'xxxModule/Classes/**/*'
```

xxxModule-umbrella.h

```objc
#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "OCForSwiftUse.h"
#import "xxxModule.h"

FOUNDATION_EXPORT double xxxModuleVersionNumber;
FOUNDATION_EXPORT const unsigned char xxxModuleVersionString[];

```

swift file:

```swift
importFoundation

@objcMembers open class SwiftBridge : UIViewController { 
open override func viewDidLoad() { 
self.view.backgroundColor = UIColor.red 
let ocs = OCForSwiftUse() 
// other codes 
}
}
```