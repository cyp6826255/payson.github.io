---
layout: post
lang: zh
title: "Podfile_local介绍、集成与使用"
subtitle: "Podfile本地化调试依赖"
date: 2025-11-13
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [Pod,Podfile,依赖]
---

## 1、背景

​	在iOS、OSX等Apple系开发中，使用cocoapods进行依赖管理的场景下，如果使用自研组件会遇到一个问题：就是对组件的集成调试经常需要修改Podfile文件，而在多人协作团队中，难免误提交Podfile造成依赖污染。

## 2、Podfile_local介绍

​	与Podfile语法一致，没有额外学习成本，具体有如下几个优点：

### 2.1 **本地化配置**

​	存放本地依赖路径（如 `:path`）、私有源配置等，避免将本地修改提交到远程仓库

### 2.2 **优先级高于 Podfile**

​	Podfile_local 中的配置会覆盖 Podfile 中的同名配置，适合临时调整依赖版本或路径

### 3.3 **避免冲突**

​	将本地化配置与主 Podfile 分离，防止团队协作时因配置差异引发冲突

## 3、使用介绍

### 3.1、集成

​	直接集成

```shell
 gem specific_install ssh://psc-devops.psc.com/psc/psc-ios/Gems/cocoapods-psc-bin.git
```

​	使用Gemfile集成（推荐）

​	在项目工程文件根目录Gemfile 加入：

```ruby
# frozen_string_literal: true

source "https://rubygems.org"

gem 'cocoapods', '1.12.1'

gem 'cocoapods-psc-bin', git: 'ssh://psc-devops.psc.com/psc/psc-ios/Gems/cocoapods-psc-bin.git', branch: 'master'

git_source(:github) {|repo_name| "https://github.com/#{repo_name}" }

# gem "rails"

```

​	执行rubygem安装依赖命令：

```shell
bundle install
```

### 3.2、使用

直接集成；

```shell
pod bin install
```

Gemfile：

```shell
bundle exec pod bin install
```

## 4 遇到的问题

集成过程中，由于环境和工具的升级不同步，造成cocoapods版本、ruby版本、bundler版本、各类依赖库兼容性问题，后续有机会再展开
