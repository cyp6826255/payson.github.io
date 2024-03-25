---
layout: post
title: "iOS组件化：工具篇  specific_install 安装使用遇到的问题"
subtitle: "This is a subtitle"
date: 2024-03-25
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: []
---

## 1、specific_install简介

​	rubygems plugin that allows you you to install a gem from from its github repository (like 'edge'), or from an arbitrary URL

## 2、安装

一般而言，specific_install的安装直接从rubygem的源上安装就行

```shell
$ gem install specific_install
```

当有权限问题时使用：

```shell
$ sudo gem install specific_install
```

然而在此安装的是发布到rubygem的开源版本，一般情况下是足够用了，

## 3、异常情况

由于不是所有的Mac都拥有管理员权限（部分单位的安全管控策略会收回管理员权限），因此上述方案无法正常使用specific_install最后一步

```
gem install
```

 报错:

```shell
ERROR:  While executing gem ... (Gem::FilePermissionError)
    You don't have write permissions for the /Library/Ruby/Gems/2.6.0 directory.
```

## 4、解决

### 4.1 使用sudo进行安装

```shell
sudo gem specific_install http://xxx/xxx.git
```

一般到此也能正常安装

### 4.2 其他异常解决

sudo还可能发生git clone异常，当出现git clone异常时，就需要修改源码

根据报错信息查看源码发现：

```ruby
def install_gemspec
 gem = find_or_build_gem
    if gem
      install_options = {}
      install_options[:user_install] = options[:userinstall].nil? ? nil : true
      inst = Gem::DependencyInstaller.new install_options
      inst.install gem
    else
      nil
    end
end
```

修改安装的代码：

```ruby
  def install_gemspec
      gem = find_or_build_gem
      if gem
          puts "gem = #{gem}"
          command = "sudo gem install #{gem}"
          output = `#{command}`
          puts output
          output
      else
        puts "gem = nil"
        nil
      end
  end
```

## 5、编译与安装

​	修改完代码后，需要重新编码，本地安装

```shell
sudo gem uninstall specific_install && sudo gem build specific_install.gemspec  && sudo gem install  specific_install-x.x.x.gem
```

