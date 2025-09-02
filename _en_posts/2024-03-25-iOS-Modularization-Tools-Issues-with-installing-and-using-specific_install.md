---
layout: post
lang: en
title: "iOS Modularization: Tools: Issues with installing and using specific_install"
subtitle: "Gem Tools"
date: 2024-03-25
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: [gem]

---

## 1. Introduction to specific_install

A RubyGems plugin that allows you to install a gem from its GitHub repository (like 'edge') or from an arbitrary URL.

## 2. Installation

Generally speaking, specific_install can be installed directly from the RubyGems repository.

```shell
$ gem install specific_install
```

If there are permission issues, use:

```shell
$ sudo gem install specific_install
```

However, what is installed here is the open source version released to rubygem, which is generally sufficient.

## 3. Exceptions

Since not all Macs have administrator privileges (some organizations' security policies may revoke administrator privileges), the above solution will not work properly using the last step of specific_install.

```
gem install
```

Error:

```shell
ERROR: While executing gem ... (Gem::FilePermissionError)
You don't have write permissions for the /Library/Ruby/Gems/2.6.0 directory.
```

## 4. Solution

### 4.1 Installing with sudo

```shell
sudo gem specific_install http://xxx/xxx.git
```

Generally, the installation should proceed smoothly up to this point.

### 4.2 Other Exception Solutions

Sudo may also cause git clone exceptions. When git If the clone exception occurs, you need to modify the source code.

According to the error message, review the source code and find the following:

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

Modify the installation code:

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

## 5. Compile and Install

After modifying the code, you need to re-encode and install locally.

```shell
sudo gem uninstall specific_install && sudo gem build specific_install.gemspec && sudo gem install specific_install-x.x.x.gem
```