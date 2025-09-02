---
layout: post
lang: zh
title: "iOS Modularization Practice II: Problems Encountered During Practice"
subtitle: ""
date: 2023-07-20
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []

---

## 1 Continuous Requirements Insertion

### 1.1 Problem Description:

Generally speaking, teams facing componentization are likely to undergo a process of continuous iteration, which inevitably involves the insertion of new business requirements. How to ensure both the fulfillment of business requirements and the implementation of componentization is a complex issue that requires comprehensive consideration.

### 1.2 Problem Solving

Since requirements and iterations are parallel to componentization, componentization requires defining milestones, with each milestone corresponding to an iteration bus. For example, if we iterate a version monthly, componentization can be done on a monthly basis, with milestones every 1 to x months, and each milestone following an iteration. This ensures that the bus contains both the business requirements of the iteration and the changes to the componentization milestones. Remember to synchronize with other project teams, such as the product team, the lead (if necessary), and the testing team (absolutely).

## 2 Multi-person Collaboration Issues

### 2.1 Background

Generally speaking, a team facing componentization will likely not consist of just one developer (because a project and team with only one developer is likely small and therefore has little demand for componentization). Instead, it will likely be at least small or medium-sized. This means that multiple people will likely work on both requirements and componentization simultaneously, requiring periodic code merges. Because componentization involves significant changes to the framework (not only moving classes to pod repositories, but also renaming, adding and deleting classes, etc.), this can lead to frequent conflicts when merging branches.

### 2.2 Solution

#### 2.2.1 Branch Management

##### 2.2.1.1 Main Project

Regular requirement iterations follow GitFlow branch management, with a parallel componentized branch, let's say feature/modulization. If the feature triggers an automatic merge, to avoid frequent conflicts, consider creating a custom branch name (personal/xxx/modulization). After merging dev and master and tagging each release, merge code from the release branch into the modularization branch.

Because the main project in the componentized branch frequently involves class additions, deletions, and class name modifications, this can cause extensive changes to the project.pbxproj file. Therefore, when merging code, there may be numerous conflicts in the project.pbxproj file.

Here is a solution:

**If the main project framework has changed significantly since the last merge, consider resolving conflicts using the project.pbxproj version from the modularization branch. Fix conflicts based on compilation errors or by pre-recording the newly added files.**

##### 2.2.1.2 Component Library

Since the components that the modularization project depends on require frequent modification, frequent tagging is not particularly necessary. Furthermore, component library tags must be strictly managed to ensure that normal progress is not affected.

Here's a solution:

Create a new branch for all component libraries in progress: moduleModulization, and specify it in the Podfile dependency:

```ruby
pod 'PSCDebugModule' , :git => 'ssh://PSC-devops.psc.com:30022/PSC/PSC-ios/Pods/Private/PSCDebugModule.git' , :configurations => ['Debug', 'DailyBuild', 'TFInner'], :branch => 'master'
pod 'PSCCommonUI' , :git => 'ssh://PSC-devops.psc.com:30022/PSC/PSC-ios/Pods/Private/PSCCommonUI.git', :branch => 'master'
pod 'PSCFrameWork' , :git => 'ssh://PSC-devops.psc.com:30022/PSC/PSC-ios/Pods/Private/PSCFrameWork.git', :branch => 'master' 
pod 'PSCLogModule' , :git => 'ssh://PSC-devops.psc.com:30022/PSC/PSC-ios/Pods/Private/PSCLogModule.git' , :branch => 'master' 
pod 'PSCAbility' , :git => 'ssh://PSC-devops.psc.com:30022/PSC/PSC-ios/Pods/Private/PSCAbility.git' , :branch => 'master' 
pod 'PSCResource' , :git => 'ssh://PSC-devops.psc.com:30022/PSC/PSC-ios/Pods/Private/PSCResource.git', :branch => 'master' 
pod 'PSCLogModule' , :git => 'ssh://PSC-devops.psc.com:30022/PSC/PSC-ios/Pods/Private/PSCLogModule.git' , :branch => 'master' 
pod 'PSCBaseModule' , :git => 'ssh://PSC-devops.psc.com:30022/PSC/PSC-ios/Pods/Private/PSCBaseModule.git' , :branch => 'master'
```

At the same time in Podfile_local (Podfile_local can see [imy-bin](https://github.com/MeetYouDevs/cocoapods-imy-bin)) configuration

```ruby
plugin 'cocoapods-imy-bin'

target 'PSCEvogoiOS' do 
pod 'PSCAbility', :path => '../../../../../CocoaPods/Private/PSCAbility' 
pod 'PSCDebugModule', :path => '../../../../../CocoaPods/Private/PSCDebugModule' 
pod 'PSCBaseModule', :path => '../../../../../CocoaPods/Private/PSCBaseModule' 
pod 'PSCCommonUI', :path => '../../../../../CocoaPods/Private/PSCCommonUI' 
pod 'PSCFrameWork', :path => '../../../../../CocoaPods/Private/PSCFrameWork' 
pod 'PSCLogModule', :path => '../../../../../CocoaPods/Private/PSCLogModule' 
pod 'PSCResource', :path => '../../../../../CocoaPods/Private/PSCResource' 
pod 'PSCHybridModule', :path => '../../../../../CocoaPods/Private/PSCHybridModule' 
pod 'PSCThirdPartyModule', :path => '../../../../../CocoaPods/Private/PSCThirdPartyModule'
end
```

When building locally, you can use:

```shell
bdpod bin install
```

When building in a pipeline, you can restore branch dependencies as follows:

```shell
bdpod install --repo-update
```

#### 2.2.2 Branch Merge

 There are many conflicts that need to be resolved when merging branches. The following situations generally occur:

##### 2.2.2.1 Code Conflicts

 Standard conflicts are resolved in the standard way, so I won't go into detail here. Source Tree is generally recommended for visual operations.

##### 2.2.2.2 project.pbxproj Conflicts

If conflicts are few, standard methods can be used to resolve them. If conflicts are numerous and the resolution is too costly, refer to the recommended method in 2.2.1.1 above.

##### 2.2.2.3 File Conflicts

File conflicts typically occur when a file is moved from the main project to the component library or a class name is changed, and someone on another branch modifies the same file. This creates a file conflict. In this case, you need to compare the changes in the component library or the newly renamed class with the conflicting file.

Here's a solution: use FileMerge (included in Xcode) to compare them.

```
/Applications/Xcode.app/Contents/Applications/FileMerge.app
```