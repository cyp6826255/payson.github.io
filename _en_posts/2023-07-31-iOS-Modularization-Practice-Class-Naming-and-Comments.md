---
layout: post
lang: en
title: "iOS Modularization Practice: Class Naming and Comments"
subtitle: ""
date: 2023-07-31
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []

---

# iOS Componentization Practice: Class Naming and Comments

## 1. Problem Description

When creating components, CocoaPods provides a good way to manage naming conventions: using a unified prefix, typically prefixed with a project/organization abbreviation.

After componentization, inconsistent file names may affect code readability and maintainability.

In addition, due to code iterations by different people, or even different organizations (for outsourced projects), some file comment templates may differ.

## 2. Standardizing Class Naming

### 2.1 Before renaming a class

You need to confirm whether the current class or related classes exist in the [CocoaPods](https://cocoapods.org/) public repository. If so, you can directly import them through Pods (using dependencies within the component).

For example, if the classes you need to rename are: SDWebImage, SDWebImageXXX, SDXXX, this is clearly a direct integration of SDWebImage through code. Since SDWebImage has a large number of classes and is a mature framework, if you are sure no unauthorized changes have been made to the logic, you can consider removing them directly and importing them through Pods (using dependencies within the component).

Of course, if there are unused classes, this is also a good time to remove them!

**‼ ️ Important Note: Before renaming, you need to confirm whether the class name you want to change already exists in the project. If it does, continuing to modify it will cause many incorrect replacements, complex compilation issues, and difficulty reversing. **

For example, if you want to change ABCWebView to PSCWebView, and if PSCWebView already exists in the project, changing ABCWebView to PSCWebView will cause confusion between all ABCWebViews and PSCWebViews. Reverting will be extremely difficult unless the change is a single one (the previous change has already been committed).

### 2.2 General Class Renaming

You can use Xcode's built-in rename function to rename a class:

![](/img/name/1.png)

Replace the class name with the desired prefix.

![WX20230731-191648](/img/name/2.png)

The replacement may not be complete. You will need to retrieve the old class name, perform a global replacement, and ensure that the project compiles successfully.

### 2.3 Category Renaming

Categories cannot be renamed using the above method; they can only be renamed using the standard file name modification and global replacement methods.

It's worth noting that if a base class has multiple categories with a single function, such as UIButton + Category1, UIButton + Category2, etc., these may have duplicate functionality. Consider retaining one of them, refactoring, merging, or reclassifying the functionalities.

## 3. Unifying Class Comment Templates:

Addressing these situations may require two steps:

### 3.1 Step 1: Standardizing Existing Class Comments

For existing class comments, we use a script to batch-execute them. The specific approach is as follows:

- Traverse the subdirectories of the specified directory (the current directory if no parameter is passed)
- Match all iOS project class files: .h .m .swift
- Replace their comment header templates
- Match and obtain the author of the current class. If no match is found, use a default value (needs to be defined)
- Match and obtain the time of the current class. If no match is found, use a default value (needs to be defined)
- Replace the copyright information (needs to be defined)

- -

```shell
#!/bin/bash

# Traverse and update all iOS project class files in the current directory (including subdirectories): .h .m .swift, and replace their comment header templates.
# author: Chenyp34
# [Purpose]
#
# After componentization and organization, inconsistent file names may affect code readability and maintainability.
# In addition, due to code iterations by different people, or even different organizations (for outsourced projects), some file comment templates may differ.
# This script aims to address the issue of consistent comment headers for existing class files.
#
# [Directory]
# - replace_class_header_anotation.sh Script to traverse and update Git repositories in subdirectories of the current directory.
#
# [Description]
# 1. Traverse subdirectories within the specified directory (the current directory if no parameter is passed).
# 2. Match all iOS project class files: .h .m .swift
# 3. Replace the comment header template
#
# [Parameters]
# 1. Parameter 1: Specify a directory
#
# [Instructions]
# 1. If no directory is specified, the current directory is used: sh replace_class_header_anotation.sh
# 2. If a directory is specified: sh replace_class_header_anotation.sh /User/xxx/xx
# This script is used to replace the following comments with a unified comment template:
# 1:
#//
#// FileName.h
#// ProjectName
#//
#// Created by Author on Date.
#// (No copyright information)
#//
#
# 2:
# /********************************************************************************************
# * Copyright: Copyright (c) 2012-2021 xxxx. All rights reserved.
# * Author: Author (2021/3/12)
# * Interface Description: Interface Description
# *****************************************************************************************/
#
# Third:
# Without any comments
#
#
# Replace with a unified comment template:
#
#//
#// "$filename"
#// "$project_name"
#//
#// Created by "$auth" on "$date".
#// "$copyright_str"
#//
#
# Define copyright information
export copyright_str="Copyright (C) 2023 Your Company Name Technology Limited. All rights reserved."

# Define default user information: PaysonChen
export def_author_str="PaysonChen"

# Define default date: Current date
export def_time_str=`date +%Y/%m/%d`

function get_creator_name_with_template_2() {
file=$1
creator_name=$(sed -n 's/.*Author: \(.*\).*/\1/p' $file)

echo "creator_name="$creator_name" in file="$file

if [ -z "$creator_name" ]; then

echo '///Get creator. Second template retrieval. If empty, use the default value.'

creator_name=$def_author_str

fi
}

function get_creator_name() {
file=$1
creator_name=$(sed -n 's/.*Created by \(.*\) on.*/\1/p' $file)

if [ -z "$creator_name" ]; then

get_creator_name_with_template_2 $file

fi

echo "--------creator_name=【"$creator_name"】" in file="$file

}

function get_creator_time_with_template_2() {
file=$1
creator_time=$(sed -n 's/.*Creation date: \(.*\).*/\1/p' $file)
echo "-------Creation date = ["$creator_time"] in file="$file

if [ -z "$creator_time" ]; then
# echo '///Get creation time. Second template gets empty. Use default value.'

creator_time=$def_time_str
fi
}

function format_creator_time() {
creator_time=$1

length=${#creator_time}

# Truncate except the last character

creator_time=${creator_time:0:length-1}
#echo "String after truncating the last character: $creator_time"
}

function get_creator_time() {
file=$1

if [ -z "$2" ]; then
line=5
else
line=$2
fi
#creator_time=$(sed -n '5s/.*\(.\{10\}\)$/\1/p' $file) 
creator_time=$(awk 'NR=='$line' {print $NF}' $file) 

echo "-------creator_time=【"$creator_time"】 line = "$line" in file="$file
# date_regex='^(19|20)[0-9]{2}/(0?[1-9]|1[0-2])/(0?[1-9]|[1-2][0-9]|3[0-1]).$' 
#date_regex='^(19[0-9]{2}|20[0-9]{2}|[0-9]{2})/(0?[1-9]|1[0-2])/(0?[1-9]|[1-2][0-9]|3[0-1]).$' date_regex='^(19[0-9]{2}|20[0-9]{2}|[0-9]{2})([-/])(0?[1-9]|1[0-2])([-/])(0?[1-9]|[1-2][0-9]|3[0-1]).$'

# Perform regular expression matching
if [[ $creator_time =~ $date_regex ]]; then
echo "The date format is correct, truncating the last decimal."
format_creator_time $creator_time
else
if [ -z "$2" ]; then
discount=1
new_line=$((line-discount))
echo "If the regular call fails to match the result, perform another iteration, search upwards for the "$discount" line, and perform recursion:"$new_line
get_creator_time $file $new_line
else
echo "The date format is incorrect, performing the second match."
get_creator_time_with_template_2 $file
fi
fi
echo "********creator_time=["$creator_time"]" in file="$file
}

function replace_header_anoation() {
file=$1

#Define the string to be replaced
#File name
filename=$(echo "$file" | sed 's#.*/##')
#Project name
project_name="PSCProject"

#Also, get the author information from the current class. If it's not available, use the default value.
auth=$creator_name

#Also, get the author information from the current class. If it's not available, use the default value.
date=$creator_time

#The following is the replacement template.
new_content="//
// "$filename"
// "$project_name"
//
// Created by "$auth" on "$date".
// "$copyright_str"
//"

new_content_escaped=$(echo "$new_content" | sed 's/$/\\/' # Escape newlines
sed -i '' -e "1,7c\\
$new_content_escaped" "$file"

# A few issues remain to be optimized
#1. If there's no comment at the beginning, it will be overwritten, or if the comment is less than 7 lines long
#2. If the date regular expression isn't in the format of YYYY/MM/DD or YY/MM/DD (where both / and - apply), then both are valid.
#2.1 (But compatible with single-digit dates like 2023/8/1)
#2.2 If the date is 8/1/23, this will cause a recognition error and will be replaced with today's date.

}

# Unify class header comments
function unify_header_annotation() {
file=$1

# Also retrieve author information from the current class. If not available, use the default value.
get_creator_name $file

# Also retrieve author information from the current class. If not available, use the default value.
get_creator_time $file

# Don't pass the second parameter Replacement is performed, but not executed if passed.
if [ -z "$2" ]; then
replace_header_anoation $file
fi
}

function main() {
file_path=$1

if [ -z "$file_path" ]; then
echo '///No path specified, file_path is the current path.'
file_path=.
fi

#Traverse all OC classes in the current path
find $file_path -type f -name "*.swift" -o -name "*.h" -o -name "*.m" | while read file; do
unify_header_anoation $file $2
done
}

main $1 $2

```

### 3.2 Step 2: Create a new class annotation template

Incremental management can be limited using the project's built-in templates. The specific steps are as follows:

#### 3.2.1 Global Specification

Globally specify a new file named: IDETemplateMacros.plist in the following path.

The following content is:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
<key>FILEHEADER</key>
<string>
//
// ___FILENAME___
// ___PACKAGENAME___
//
// Created by ___FULLUSERNAME___ on ___DATE___
// ___COPYRIGHT___
//

</string>

</dict>
</plist>

```

Path (sorted by priority from lowest to highest: if an IDETemplateMacros appears in a higher priority directory, it will overwrite the IDETemplateMacros in a lower priority directory)

xcWorkspace:

```
XXX.xcworkspace/xcshareddata/IDETemplateMacros.plist
```

xcodeproj (higher priority than xcworkspace):

```
XXX.xcodeproj/xcshareddata/IDETemplateMacros.plist
```

The IDETemplateMacros.plist file in the xcshareddata folder of the xcodeproj will override the IDETemplateMacros.plist file in the xcworkspace folder (this means the IDETemplateMacros.plist file in the xcshareddata folder of the xcworkspace folder will not take effect).

<u>**In summary: The IDETemplateMacros file in the xcworkspace folder takes effect only if the IDETemplateMacros file in the xcodeproj folder within the xcworkspace folder is not specified**</u>

#### 3.2.2 User-specified

The aforementioned xcodeproj and xcworkspace folders each have their own xcuserdata file. Within this xcuserdata folder, there is a folder named username.xcuserdatad for each user. The IDETemplateMacros.plist file is stored in this folder. , takes precedence over xcshareddata.

```
XXX.xcworkspace/xcuserdata/IDETemplateMacros.plist
XXX.xcodeproj/xcuserdata/IDETemplateMacros.plist
```

***<u>Priority is the same as described in 2.2.1: IDETemplateMacros under xcshareddata in xcworkspace/xcodeproj takes effect when IDETemplateMacros is not specified in xcuserdata in xcworkspace/xcodeproj</u>***

#### 3.2.3 Local Specification

Except for the above:

***<u>If IDETemplateMacros.plist does not exist in any of the above, the local directory will take effect</u>***:

```
/Users/Mac login name/Library/Developer/Xcode/UserData/IDETemplateMacros.plist
```