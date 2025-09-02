---
layout: post
lang: en
title: "A Brief Analysis of iOS Hot Fix Solutions"
subtitle: "HotFix"
date: 2025-07-25
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [hot fix, JSPatch, OCRunner]

---

## 1. Background

Native code is not like front-end code, which can be updated seamlessly. When critical issues arise online, without AB Testing or other remote configurations, a release is often required to resolve them. However, native releases require market review, which often takes a long time (typically 12 hours, or even more than 24 hours).

## 2. Technical Solution

The JSPatch solution was rejected by the App Store, so we had to turn to a binary hot-update solution.

OCRunner, by compiling a binary patch, should theoretically pass App Store review (to be tested later).

## 3. Practical Steps

[OCRunner](https://cocoapods.org/pods/OCRunner)

```shell
git clone --recursive https://github.com/SilverFruity/OCRunner.git
```

For detailed information, please refer to: https://github.com/SilverFruity/OCRunner/blob/master/README-CN.md

First, create a crash code:

```objc
+ (void)willCrash
{
NSLog(@"TestCrash will crash");

dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
NSArray *a = @[];
a[0];
NSLog(@"TestCrash do not crash");
});
}

```

 After calling the above code, it will crash, and the crash log is as follows:

```
2025-07-25 09:31:03.097029+0800 PSCPatchModule_Example[13445:1707171] PSCTestCrash will crash
2025-07-25 09:31:04.112481+0800 PSCPatchModule_Example[13445:1707171] PSCTestCrash crashing 1
2025-07-25 09:31:04.112714+0800 PSCPatchModule_Example[13445:1707171] PSCTestCrash crashing 2
2025-07-25 09:31:04.112792+0800 PSCPatchModule_Example[13445:1707171] PSCTestCrash crashing 3
2025-07-25 09:31:04.113585+0800 PSCPatchModule_Example[13445:1707171] *** Terminating app due to uncaught exception 'NSRangeException', reason: '*** -[__NSArray0 objectAtIndex:]: index 0 beyond bounds for empty NSArray'
*** First throw call stack:
(0x1cb39ed94 0x1c445c3d0 0x1cb4adc94 0x104b584f8 0x1051aa038 0x1051ad1b4 0x1051c3e30 0x1051ba5f8 0x1051ba2dc 0x1cb42dd18 0x1cb40f650 0x1cb4144dc 0x20667435c 0x1cd7a037c 0x1cd79ffe0 0x104b583d4 0x1ea89cdec)
libc++abi: terminating due to uncaught exception of type NSException
*** Terminating app due to uncaught exception 'NSRangeException', reason: '*** -[__NSArray0 objectAtIndex:]: index 0 beyond bounds for empty NSArray'
terminating due to uncaught exception of type NSException
```

Fix this code again

```objective-c
NSLog(@"PSCTestCrash will crash");
dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
NSArray *a = @[];
NSLog(@"PSCTestCrash crashing 1");
NSLog(@"PSCTestCrash crashing 2");
NSLog(@"PSCTestCrash crashing 3");

//After removing the crash code
// a[0];
NSLog(@"PSCTestCrash do not crash");
});
```

Execute the compiled binary fix file:

```sh
./PatchGenerator -files PSCTestCrash.m -refs Scripts.bundle -output binarypatch
```

Log output:

```
2025-07-25 09:39:17.113022+0800 PSCPatchModule_Example[13424:1699794] PSCTestCrash will crash
2025-07-25 09:39:18.152015+0800 PSCPatchModule_Example[13424:1699794] PSCTestCrash crashing 1
2025-07-25 09:39:18.152216+0800 PSCPatchModule_Example[13424:1699794] PSCTestCrash crashing 2
2025-07-25 09:39:18.152286+0800 PSCPatchModule_Example[13424:1699794] PSCTestCrash crashing 3
2025-07-25 09:39:18.152352+0800 PSCPatchModule_Example[13424:1699794] PSCTestCrash do not crash
```

## 4. Demo

github: https://github.com/Payson-Chen/PSCPatchModule