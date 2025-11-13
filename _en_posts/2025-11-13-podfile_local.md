---
layout: post
lang: zh
title: "Introduction, integration and use of Podfile_local"
subtitle: "Podfile local debugging dependencies"
date: 2025-11-13
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [Pod,Podfile,dependencies]
---

## 1. Background

​	In iOS, OSX, and other Apple-based development scenarios, when using CocoaPods for dependency management, a problem arises when using self-developed components: integrating and debugging components often requires modifying the Podfile file. In multi-person collaborative teams, it's inevitable that Podfiles will be accidentally committed, causing dependency pollution.。

## 2. Introduction to Podfile_local

It has the same syntax as Podfile, requiring no additional learning curve, and has the following advantages:：

### 2.1 **Localized Configuration**

Stores local dependency paths (e.g., `:path`), private source configurations, etc., avoiding committing local changes to the remote repository.

### 2.2 **Higher Priority than Podfile**

Configurations in `Podfile_local` will override configurations with the same name in the `Podfile`, suitable for temporarily adjusting dependency versions or paths.

### 3.3 **Avoid Conflicts**

Separates localized configurations from the main `Podfile` to prevent conflicts caused by configuration differences during team collaboration.

## 3. Usage Introduction

### 3.1 Integration

Direct Integration

```shell
 gem specific_install ssh://psc-devops.psc.com/psc/psc-ios/Gems/cocoapods-psc-bin.git
```

Integrating with Gemfile (Recommended)

Add the following to the Gemfile folder in the root directory of your project:

```ruby
# frozen_string_literal: true

source "https://rubygems.org"

gem 'cocoapods', '1.12.1'

gem 'cocoapods-psc-bin', git: 'ssh://psc-devops.psc.com/psc/psc-ios/Gems/cocoapods-psc-bin.git', branch: 'master'

git_source(:github) {|repo_name| "https://github.com/#{repo_name}" }

# gem "rails"

```

Execute the rubygem command to install dependencies:

```shell
bundle install
```

### 3.2、Use

Direct integration;

```shell
pod bin install
```

Gemfile：

```shell
bundle exec pod bin install
```

## 4. Problems Encountered

During the integration process, asynchronous upgrades of the environment and tools caused compatibility issues with CocoaPods, Ruby, Bundler versions, and various dependency libraries. This will be discussed further later.
