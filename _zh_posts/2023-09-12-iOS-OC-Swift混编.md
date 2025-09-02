---
layout: post
lang: zh
title: "Pod仓库内OC与Swift调用"
subtitle: ""
date: 2023-09-12
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []



---

# Pod仓库内OC与Swift调用

## 1、Pod内OC调Swift

Pod内Swift类的声明需加上 

```swift
@objcMembers open
```

例如：

```swift
import Foundation

@objcMembers open class SwiftBridge : UIViewController {
    open override func viewDidLoad() {
        self.view.backgroundColor = UIColor.red        
    }
}

```



在需要使用的类上 import

```objective-c
  #import "YourPodName/YourPodName-Swift.h"
```

如果需要在多处调用也可以在podspec中添加

```ruby
  s.prefix_header_contents = <<-EOS
  #if __has_include(<xxxModule/xxxModule-Swift.h>)
  #import <xxxModule/xxxModule-Swift.h>
  #else
  #import "xxxModule/xxxModule-Swift.h"
  #endif
  EOS
```



XXX-Swift.h 机制可以参考Build Setting里的key value

```
Objective-C Generated Interface Header Name=$(SWIFT_MODULE_NAME)-Swift.h
```

![1](/img/iosswiift/image1.png)

## 2、Pod内Swift调OC

Pod指定了source_files，其中.h文件会被加载到xxxModule-umbrella 中，在Pod内部可以直接访问

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

swift文件:

```swift
import Foundation

@objcMembers open class SwiftBridge : UIViewController {
    open override func viewDidLoad() {
        self.view.backgroundColor = UIColor.red
        let ocs = OCForSwiftUse()
        // other codes
    }
}
```

