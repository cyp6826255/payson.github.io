---
layout: post
lang: en
title: "iOS Modularization in Action: Creating a New Pod Component Library"
subtitle: ""
date: 2023-07-26
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []

---

## 0. Background

During the iOS componentization process,

- During the planning phase, you need to define components, divide their functionality, and design their interfaces.
- During the implementation phase, you need to create components and migrate the main engineering capabilities.

During this process, you'll need to frequently create Pod component libraries. Therefore, it's important to understand how to create Pod components and how to use and modify their templates.

## 1. Creating via a Regular Template

CocoaPods provides the following creation commands:

```shell
pod lib create xx
```

The output shows:

```shell
Cloning `https://github.com/CocoaPods/pod-template.git` into `xx`.
```

This command downloads the default template from [github Pod-template](https://github.com/CocoaPods/pod-template) and creates the component. After answering a few questions,

```shell
What platform do you want to use? [iOS / macOS]
>
ios
What language do you want to use? use?? [Swift/ObjC] 
>
swift
Would you like to include a demo application with your library? [ Yes / No ] 
>
yes
Which testing frameworks will you use? [ Quick / None ] 
>
quick
Would you like to do view based testing? [ Yes / No ] 
>
yes
```

A Pod warehouse is generated under the current path, and the Spec file is as follows:

```ruby
Pod::Spec.new do |s| 
s.name = 'xx' 
s.version = '0.1.0' 
s.summary = 'A short description of xx.'

# This description is used to generate tags and improve search results.
# * Think: What does it do? Why did you write it? What is the focus?
# * Try to keep it short, snappy and to the point.
# * Write the description between the DESC delimiters below.
# * Finally, don't worry about the indent, CocoaPods strips it! 

s.description = <<-DESC
TODO: Add long description of the pod here. 
DESC 

s.homepage = 'https://github.com/chenyp/xx' 
# s.screenshots = 'www.example.com/screenshots_1', 'www.example.com/screenshots_2' 
s.license = { :type => 'MIT', :file => 'LICENSE' } 
s.author = { 'chenyp' => '165685965@qq.com' } 
s.source = { :git => 'https://github.com/chenyp/xx.git', :tag => s.version.to_s } 
# s.social_media_url = 'https://twitter.com/<TWITTER_USERNAME>' s.ios.deployment_target = '10.0'

s.source_files = 'xx/Classes/**/*'

# s.resource_bundles = {
# 'xx' => ['xx/Assets/*.png']
# }

# s.public_header_files = 'Pod/Classes/**/*.h'
# s.frameworks = 'UIKit', 'MapKit'
# s.dependency 'AFNetworking', '~> 2.3'
end
```

## 2. Creating with a Custom Template

Generally speaking, the above method is not recommended. By default, the default template uses the name and email fields from the Git global configuration, plus the GitHub homepage, as many fields created by the default template must be modified (unable to deploy via private components without modification):

```ruby
s.homepage = 'https://github.com/chenyp/xx'
s.author = { 'chenyp' => '165685965@qq.com' }
s.source = { :git => 'https://github.com/chenyp/xx.git', :tag => s.version.to_s }
……
```

Since the componentization process requires the frequent creation of multiple component repositories, modifying the above fields each time could lead to errors or omissions, resulting in inefficiency. Based on the unwritten principle that laziness is a programmer's virtue (actually, it should be about streamlining repetitive workflows as much as possible), we set about modifying the above template.

Creating a custom template:

```shell
git clone git@github.com:CocoaPods/pod-template.git
```

By modifying the relevant fields in the "**NAME.podspec**" file in the repository

```ruby
s.homepage = 'https://intranetgithost/name/xx'
s.author = { 'Intranet git commit name' => 'Intranet git commit email' }
s.source = { :git => 'https://intranetgithost/name/xx.git', :tag => s.version.to_s } #clone component library address
……
```

After modification, place the above template in the Git repository and execute:

```shell
pod lib create xx --template-url=ssh://intranetgithost/ios/Pods/Tmplate/XXX_Pod_Tmplate.git
```

## 3. Creating with a highly customized template

Generally speaking, the above steps complete basic template customization, reducing the need to repeatedly modify fields after creating a private library. However, for consistency in the following options, it would be better to eliminate redundancy and improve uniformity:

- [x] Redundancy in platform selection (iOS)

- [x] Unified coding style (class name prefixes)

- [ ] Language consistency (iOS/Swift)

- [x] Demo project

- [x] Test dependencies

This requires modifying the Ruby code in pod-template to eliminate the need for repeated template interaction settings:

Template configuration: TemplateConfigurator.rb

```ruby
def run
@message_bank.welcome_message

platform = self.ask_with_answers("What platform do you want to use?", ["iOS", "macOS"]).to_sym

case platform
when :macos
ConfigureMacOSSwift.perform(configurator: self)
when :ios
framework = self.ask_with_answers("What language do you want to use?", ["Swift", "ObjC"]).to_sym
case framework
when :swift
ConfigureSwift.perform(configurator: self)

when :objc
ConfigureIOS.perform(configurator: self)
end
end

#……Omit the following code here……#
end
```

Change to:

```ruby
def run
@message_bank.welcome_message

# Custom template optimization: This bypasses some questions (no need to answer iOS, ObjC). Of course, if you want to set it to something else, you can call other methods or restore the query-based configuration.
ConfigureIOS.perform(configurator: self)

# platform = self.ask_with_answers("What platform do you want to use?", ["iOS", "macOS"]).to_sym
#
# case platform
# when :macos
# ConfigureMacOSSwift.perform(configurator: self)
# when :ios
# framework = self.ask_with_answers("What language do you want to use?", ["Swift", "ObjC"]).to_sym
# case framework
# when :swift
# ConfigureSwift.perform(configurator: self)
#
# when :objc
# ConfigureIOS.perform(configurator: self)
# end
# end

#…The following code is omitted here…#
end
```

After selecting the relevant language, configure the subsequent settings in the Configure section for that language. For example, if you selected iOS, configure the following in ConfigureIOS.rb:

```ruby 
def perform 

keep_demo = configurator.ask_with_answers("Would you like to include a demo application with your library", ["Yes", "No"]).to_sym 

framework = configurator.ask_with_answers("Which testing frameworks will you use", ["Specta", "Kiwi", "None"]).to_sym 
case framework 
when :specta 
configurator.add_pod_to_podfile "Specta" 
configurator.add_pod_to_podfile "Expecta" 

configurator.add_line_to_pch "@import Specta;" 
configurator.add_line_to_pch "@import Expecta;" 

configurator.set_test_framework("specta", "m", "ios") 

when :kiwi 
configurator.add_pod_to_podfile "Kiwi" 
configurator.add_line_to_pch "@import Kiwi;" 
configurator.set_test_framework("kiwi", "m", "ios") 

when :none 
configurator.set_test_framework("xctest", "m", "ios") 
end 

snapshots = configurator.ask_with_answers("Would you like to do view based testing", ["Yes", "No"]).to_sym 
case snapshots 
when :yes 
configurator.add_pod_to_podfile "FBSnapshotTestCase" 
configurator.add_line_to_pch "@import FBSnapshotTestCase;" 

if keep_demo == :no 
puts "Putting demo application back in, you cannot do view tests without a host application." 
keep_demo = :yes 
end 

if framework == :specta configurator.add_pod_to_podfile "Expecta+Snapshots"
configurator.add_line_to_pch "@import Expecta_Snapshots;"
end
end

prefix = nil

loop do
prefix = configurator.ask("What is your class prefix").upcase

if prefix.include?(' ')
puts 'Your class prefix cannot contain spaces.'.red
else
break
end
end
#……Omit the following code here……#
end

```

Find the relevant Q&A section:

```ruby
def perform
#Custom template optimization: The default setting is demo. If you want to set it differently, you can call other methods or restore the query-based configuration.
keep_demo = "yes" #configurator.ask_with_answers("Would you like to include a demo application with your library", ["Yes", "No"]).to_sym
#Custom template optimization: By default, no testing frameworks are required. If you want to set a different one, you can call other methods or restore the query-based configuration.

framework = "none" #configurator.ask_with_answers("Which testing frameworks will you use", ["Specta", "Kiwi", "None"]).to_sym

case framework

when :specta

configurator.add_pod_to_podfile "Specta"

configurator.add_pod_to_podfile "Expecta"

configurator.add_line_to_pch "@import Specta;"

configurator.add_line_to_pch "@import Expecta;"

configurator.set_test_framework("specta", "m", "ios")

when :kiwi

configurator.add_pod_to_podfile "Kiwi"

configurator.add_line_to_pch "@import Kiwi;"
configurator.set_test_framework("kiwi", "m", "ios")

when :none
configurator.set_test_framework("xctest", "m", "ios")
end

# Custom template optimization: View-based testing is not required by default. If you want to set it differently, you can call other methods or restore the query-based configuration.
snapshots = "no"#configurator.ask_with_answers("Would you like to do view-based testing", ["Yes", "No"]).to_sym
case snapshots
when :yes
configurator.add_pod_to_podfile "FBSnapshotTestCase"
configurator.add_line_to_pch "@import FBSnapshotTestCase;"

if keep_demo == :no
puts "Putting the demo application back in, you cannot do view tests without a host application."
keep_demo = :yes
end

if framework == :specta
configurator.add_pod_to_podfile "Expecta+Snapshots"
configurator.add_line_to_pch "@import Expecta_Snapshots;"
end
end

prefix = nil

loop do
# Custom template optimization: The default prefix here is PSC. Of course, if you want to set it to something else, you can also call other methods or restore the query-based configuration.
prefix = "PSC" # configurator.ask("What is your class prefix").upcase

if prefix.include?(' ')
puts 'Your class prefix cannot contain spaces.'.red
else
break
end
end
# …Omit the following code here…#
end
```

Now that the optimized custom template is complete, create another Git repository (if you want to keep the simple customization above) to store it. Create a more customized pod library template with one click: let's try

```shell
pod lib create xx --template-url=ssh://intranet.githost/ios/Pods/Tmplate/PSC_iOS_Objc_Demo_NoneTest.git
```

## 4. If you are still using Gem to manage Pod plugins

Generally speaking, in a multi-person team, Gems are needed to manage Pod plugin versions to avoid integration and compilation issues caused by inconsistent Pod versions. If you still need to configure a Gemfile, the template configuration code ends with:

```ruby
# There must be a single file in the Classes directory
# or a framework won't be created, which is now the default
`touch Pod/Classes/ReplaceMe.m`

`mv ./templates/ios/* ./`

# remove podspec for osx
`rm ./NAME-osx.podspec`
```

Place your own Gemfile in the same directory as the Podfile:

```ruby
# frozen_string_literal: true

source "https://rubygems.org"

gem 'cocoapods', '1.11.2'

git_source(:github) {|repo_name| "https://github.com/#{repo_name}" }

# gem "rails"

```

## 5 Final Ignores

After the template is created, Pod install will be executed. As with a regular project, a new Pod folder will be created under Example to store the Pod dependency library. This folder should be ignored during commit. In line with the principle of minimizing repetitive work, let's modify .gitignore:

Find the .gitignore file in the root directory. Since it starts with a ., it's hidden by default. Add the folders you want to ignore in the following code:

```shell
# macOS
.DS_Store

# Xcode
build/
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata/
*.xccheckout
*.moved-aside
DerivedData
*.hmap
*.ipa

#Bundler
.bundle

# Add this line if you want to avoid checking in source code from Carthage dependencies.
#Carthage/Checkouts

Carthage/Build

# We recommend against adding the Pods directory to your .gitignore. However
# you should judge for yourself, the pros and cons are mentioned at:
# https://guides.cocoapods.org/using/using-cocoapods.html#should-i-ignore-the-pods-directory-in-source-control
#
# Note: If you ignore the Pods directory, make sure to uncomment it.
# `pod install` in .travis.yml
#
# Pods/ #Comment this to ignore the following Example /Pods/

# You can continue to add ignored files and folders below.
```

## 6. Extension: Podfile Dependencies

Generally speaking, the Podfile in a created private Pod repository contains a simple template:

```ruby
use_frameworks!

platform :ios, '10.0'

target '${POD_NAME}_Example' do
pod '${POD_NAME}', :path => '../'

target '${POD_NAME}_Tests' do
inherit! :search_paths

${INCLUDED_PODS}
end
end
```

This may be sufficient for a single Pod component library. However, if we are in the process of componentization and need to interact with and depend on existing private libraries, such as business libraries depending on foundational libraries,

For convenience, and to avoid having to configure the Podfile every time we create a private library (I'm just too lazy 😭), we modified the Podfile:

```ruby
source 'ssh://private-repository-git-address/Specs.git'
source 'https://github.com/CocoaPods/Specs.git'

use_frameworks!

platform:ios, '12.0' #The Podfile used in this article defaults to 10.0. You can change it to your desired platform.

post_install do |installer|

installer.generated_projects.each do |project|

project.targets.each do |target|

target.build_configurations.each do |config|

config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'

config.build_settings["DEVELOPMENT_TEAM"] = "xxxxx" #Specify the signature here to avoid compilation errors and manual specification.

end
end
end
end

use_frameworks!

target '${POD_NAME}_Example' do

#Pull in the private library when creating the template for the new Pod library.

def debug_pod(pod_name)

this_pod_name = "${POD_NAME}"

puts "debug_pod :pod_name = #{pod_name} and this_pod_name is #{this_pod_name}"

if this_pod_name == pod_name

puts "#{this_pod_name} is equal to args #{pod_name} do not pod"

elseif
#For ease of management, it is recommended to place all private libraries here in the same directory.

pod "#{pod_name}", :path => "../../#{pod_name}/"

end

#To avoid duplicate definitions, we will handle this uniformly as follows. Since the current pod is already matched below, it does not need to be commented out.

pod '${POD_NAME}', :path => '../'

#Define the names of all private libraries to be imported here.

private_pods = ["Basic Component 1", "Basic Component 2", "Basic Component 3", "Capability Component 1", "Capability Component 2", "Capability Component 3", "Business Component 1", "Business Component 2"

# Here, all private library names are matched with paths for pod creation.
private_pods.each do |private_pod|
debug_pod(private_pod)
end

# If the above method doesn't work or isn't effective, you can use the more traditional method below:
#pod 'Basic Component 1', :path => '../../Basic Component 1/'
#pod 'Basic Component 2', :path => '../../Basic Component 2/'
#pod 'Basic Component 3', :path => '../../Basic Component 3/'

#pod 'Capability Component 1', :path => '../../Capability Component 1/'
#pod 'Capability Component 2', :path => '../../Capability Component 2/'
#pod 'Capability Component 3', :path => '../../Capability Component 3/'

#pod 'Business Component 1', :path => '../../Business Component 1/'
#pod 'Business Component 2', :path => '../../Business Component 2/'

target '${POD_NAME}_Tests' do
inherit! :search_paths
${INCLUDED_PODS}
end
end

```

It's worth noting that all Dev Pods should be placed in the same directory to avoid path management issues.

At this point, the generated Pod component library template meets the requirements of the componentization process.