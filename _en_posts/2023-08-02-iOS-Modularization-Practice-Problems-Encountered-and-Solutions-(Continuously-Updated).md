---
layout: post
lang: en
title: "iOS Modularization Practice: Problems Encountered and Solutions (Continuously Updated)"
subtitle: ""
date: 2023-08-02
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []

---

# iOS Componentization Practice: Problems Encountered and Solutions (Continuously Updated)

## 1. Compilation Errors

### 1.1 MsgHandlingError

```shell
Build service could not create build operation: unknown error while handling message: MsgHandlingError(message: "unable to initiate PIF transfer session (operation in progress?)")

```

After consulting Google, the solution was to clear the compile and build index. Since this still occurs quite frequently, I wrote a script:

```shell
#!/bin/bash

# [Background]
# During componentization, the following compilation error often occurs:
# Build service could not create build operation: unknown error while handling message: MsgHandlingError(message: "unable to initiate PIF transfer session (operation in progress?)")
#
# author: Chenyp34
# [Purpose]
# To resolve the above error, you need to clean the build index directory and restart Xcode. Since this operation is repetitive, consider extracting a shell script.
#
# [Directory]
# - auto_clean.sh
# [Instructions]
# 1. CD to the [specified Xcode build index directory] directory
# 2. Recursively delete all files under the current directory
# 3. Restart Xcode
#
# [Parameters]
# 1. Parameter 1: Specifies the Xcode build index directory
# 1. Parameter 2: Specifies the Xcode project directory to open
#
# [Instructions]
# 1. If no directory is specified, the current directory is used: sh auto_clean.sh
# 2. If a specified directory is specified: sh auto_clean.sh /xcode build index directory/ /Xcode project directory to open/

export XcodeDerivedDataPath=/Users/YourMacName/Library/Developer/Xcode/DerivedData
export XcodeWorkspacePath=/Users/YourMacName/Documents/PCS/git/Project/xxx.xcworkspace

if [ -z "$1" ]; then
echo '///Parameter 1 is empty, using the default Xcode build index directory: '${XcodeDerivedDataPath}'
else
XcodeDerivedDataPath=$1
echo '///Parameter 1 is not empty, Xcode build index directory: '${XcodeDerivedDataPath}'
fi

if [ -z "$2" ]; then
echo '///Parameter 2 is empty, using the default Xcode project directory: '${XcodeWorkspacePath}'
else
XcodeWorkspacePath=$2
echo /// Parameter 2 is not empty, Xcode project directory: ${XcodeWorkspacePath}
fi

#cd to the Xcode build index directory
cd $XcodeDerivedDataPath

#Delete all artifact indexes in the current directory
rm -rf *

#Restart Xcode
killall Xcode

#Sleep for a while, otherwise you may get an error if you open it directly
sleep 0.1

#Open the project
open $XcodeWorkspacePath

```

### 1.2 Duplicate interface definition for class

```
duplicate interface definition for class XXX
```

After eliminating the possibility of duplicate definitions in the error message, I later discovered that it was an import issue. I deleted the original import "xxx.h" and replaced it with import <PSCXXModule/xxx.h>

## 2. Runtime Error

### 2.1 Swapping the (void)load method causes an infinite loop

#### 2.1.1 Problem Description:

During componentization, a UIControl Category was heavily coupled with a UIButton Category. Because the latter was heavily coupled, I separated the former into the component library first. This compiled and ran without issues, but caused an infinite loop only during the UIButton click event.

#### 2.1.2 Problem Analysis:

The Crash stack trace reveals that the following method recursive call is causing an infinite loop.

```objective-c
- (void)mySendAction:(SEL)action to:(id)target forEvent:(UIEvent *)event
```

A detailed code review revealed that the UIControl Category and UIButton Category have identical load methods. Swapping them:

```objc
+ (void)load{
static dispatch_once_t onceToken;
dispatch_once(&onceToken, ^{
SEL selA = @selector(sendAction:to:forEvent:);
SEL selB = @selector(mySendAction:to:forEvent:);
Method methodA = class_getInstanceMethod(self, selA);
Method methodB = class_getInstanceMethod(self, selB);
// Implementation of methodB Adding to the system method. In other words, adding the method pointer of methodA to methodB. The return value indicates whether the addition was successful.
BOOL isAdd = class_addMethod(self, selA, method_getImplementation(methodB), method_getTypeEncoding(methodB));
// Successful addition indicates that methodB does not exist in this class. Therefore, the implementation pointer of methodB must be replaced with that of methodA; otherwise, methodB will not be implemented.
if (isAdd) {
class_replaceMethod(self, selB, method_getImplementation(methodA), method_getTypeEncoding(methodA));
}else{
// Failed to add. This indicates that an implementation of methodB exists in this class. In this case, simply swap the IMPs of methodA and methodB.
method_exchangeImplementations(methodA, methodB);
}
});
}
```

(Let's not complain about CV for now)

**Why didn't it cause an infinite loop before componentization, but did it after? **

#### 2.1.3 Problem Identification:

Using the control variable method, we can preliminarily determine that the crash is caused by a change in the Pod integration method.**

The load method is called during class loading. We suspect that a change in the loading sequence may have exposed the crash.

We then conducted a class loading experiment: exploring class loading in the main project and Pods:

Loading classes in Pod libraries:

```
2023-06-28 09:19:26.104245+0800 TestUI[2809:1230318] [+ (void)load]:[Pod] UIControl (ClickTimeSpace) load
2023-06-28 09:19:26.108615+0800 TestUI[2809:1230318] [+ (void)load]:[Pod] UIImage (Bundle) load
2023-06-28 09:19:26.108626+0800 TestUI[2809:1230318] [+ (void)load]:[Pod] UIImage (Custom) load
2023-06-28 09:19:26.108637+0800 TestUI[2809:1230318] [+ (void)load]:[Pod] UIImageView (YPCCreateQRCode) load
2023-06-28 09:19:26.108647+0800 TestUI[2809:1230318] [+ (void)load]:[Pod] UILabel (YPCSpaceLabel) load
2023-06-28 09:19:26.108670+0800 TestUI[2809:1230318] [+ (void)load]:[Pod] UIResponder (KTRouter) load
2023-06-28 09:19:26.110711+0800 TestUI[2809:1230318] [+ (void)load]:[Project]NSObject (Sb) load
2023-06-28 09:19:26.110743+0800 TestUI[2809:1230318] [+ (void)load]:[Project]UITextField (Sub) load
2023-06-28 09:19:26.110777+0800 TestUI[2809:1230318] [+ (void)load]:[Project]UIResponder (Super) load
2023-06-28 09:19:26.110787+0800 TestUI[2809:1230318] [+ (void)load]: [Project]UIControl (Test) load
2023-06-28 09:19:26.114212+0800 TestUI[2809:1230318] [+ (void)load]: [Project]UIView (Base) load
```

Only the main project class is loaded:

```
2023-06-28 09:25:27.432494+0800 TestUI[2821:1235269] [+ (void)load]: [Project]UIImageView (SubImgV) load
2023-06-28 09:25:27.432528+0800 TestUI[2821:1235269] [+ (void)load]:[Project]NSObject (Sb) load
2023-06-28 09:25:27.432559+0800 TestUI[2821:1235269] [+ (void)load]:[Project]UITextField (Sub) load
2023-06-28 09:25:27.432570+0800 TestUI[2821:1235269] [+ (void)load]:[Project]UITextView (SubTv) load
2023-06-28 09:25:27.432580+0800 TestUI[2821:1235269] [+ (void)load]:[Project]UIButton (Test) load
2023-06-28 09:25:27.432592+0800 TestUI[2821:1235269] [+ (void)load]:[Project]UIResponder (Super) load
2023-06-28 09:25:27.432602+0800 TestUI[2821:1235269] [+ (void)load]:[Project]UIControl (Test) load
2023-06-28 09:25:27.435639+0800 TestUI[2821:1235269] [+ (void)load]:[Project]UIView (Base) load
```

The above log printout shows that the classes in the Pod library are loaded before the main project.

Therefore, the conclusion is that in the main project, the UIButton load method is loaded first, while UIButton does not have this method:

```objc
//This method exists in UIControl, but not in UIButton:
- (void)sendAction:(SEL)action to:(nullable id)target forEvent:(nullable UIEvent *)event;
```

After swapping the sendAction method in UIButton and then swapping the sendAction method in UIControl, the sendAction method swaps normally.

Conversely, in the Pod project, swapping the sendAction method in UIControl and then swapping the sendAction method in UIButton is equivalent to not swapping at all. When the method is called:

```objc
//When the button click event sendsAction, mySendAction will be executed
- (void)mySendAction:(SEL)action to:(id)target forEvent:(UIEvent *)event
{
//xxx
//Here, the IMPs of methodA and methodB are swapped, effectively executing sendAction; thus, there's no infinite loop.
[self mySendAction:action to:target forEvent:event];
}
```

Unable to return to sendAction, causing an infinite loop. After a detailed code review, I found that the UIControl Category and UIButton Category had identical load methods. Swapped: