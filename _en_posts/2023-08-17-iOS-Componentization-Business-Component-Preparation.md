---
layout: post
lang: en
title: "iOS Modularization: Business Component Preparation"
subtitle: ""
date: 2023-08-17
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []

---

# iOS Componentization: Business Component Preparation

## 1. Background

When basic components are decomposed to a certain extent, the remaining files in the main project are mostly class files related to the view interface (VC, View, etc.). At this point, you can consider designing and planning the business components. However, the project still has the following issues:

- Redundant files:
- Redundant class files that exist in the project directory but aren't referenced by the project.
- Non-redundant but unused files.
- Class files that aren't used by other classes.

To reduce the workload and complexity of the business components, it's best to purify/clean up the project beforehand.

Specific cleaning methods include manual or scripted methods.

According to our estimates, the execution time complexity is n². If there are 1,000 files in the main project (before the business components are extracted), a single search would require 1 million searches, and an M2 chip would take approximately 2 hours to execute. Manual searches take even longer and suffer from the problem of increasing marginal returns.

This script solves the above problems with near-zero marginal cost, allowing specific algorithms to be consolidated for use in other projects.

## 2. Project Cleanup

### 2.1 Redundant File Cleanup

Recursively traverse the project directory and match each class name against the contents of the XXX.xcodeproj/project.pbxproj file. Failure to match is:

```
Redundant class files that are not referenced by the project but exist in the project directory
```

The specific approach can be implemented as follows:

```shell
# Set the project directory
project_directory="project directory"
project_path="xxx.xcodeproj/project.pbxproj directory"

# Find all files ending in ViewController.m and output a list
# Find all files ending in ViewController.m and output the file name without the suffix
all_file_path=$(find "$project_directory" -type f \( -name "*.h" \))

for src_file in $all_file_path; do
# echo $src_file
filename=$(basename "$src_file" .h)
if ! grep -q "\b$filename\b" "$project_path"; then
echo "project does not contain: "$filename"
fi
done
```

### 2.2 Unused File Cleanup

#### 2.2.1 [fui Tool](https://github.com/dblock/fui)

```shell
sudo gem install fui -n /usr/local/bin

fui find #Execute in the current directory
fui --path=~/source/project/Name find #Execute in a specified directory
```

I haven't looked at the source code of the fui tool in detail yet, but I've noticed a problem: it doesn't recognize comment dereferences:

For example, if A imports B, but the import line is commented out:

```Objective-C
//
//
// A.m
// Example
//
// Created by PSC on 2023/8/15
// Copyright © 2023 PSC. All rights reserved.
//

#import "A.h"
//#import "B.h"

……
```

In the execution result of `fui`, `B` is not considered unused.

#### 2.2.2 Custom Tool

To address the issues with the fui tool described above and make some optimizations, the design strategy for the custom tool is as follows:

- Traverse all implementation classes in the project directory: .m files (excluding categories)
- Match the class name line by line against all files in the project except itself (including categories)
- If a line that does not begin with // or #import is found, it is considered referenced; otherwise, it is considered unreferenced
- Output the paths of unmatched files
- Remove the matched files and execute again (because the first layer is removed, more unreferenced classes may be exposed)
- Continue until no unused classes are matched.

-

```shell
#!/bin/bash

# [Background]
# When the basic components are decomposed to a certain extent, the remaining files in the main project are mostly class files related to the view interface (VC, View, etc.). At this point, you can consider designing and planning your business components. However, the project still has the following issues:
# Redundant Files:
# Non-redundant but Unused Files
#
# author: Chenyp34
#
# [Purpose]
# This script addresses the issue of "non-redundant but unused files"
#
# [Directory]
# - find_unused_class.sh
# [Description]
# 1 Traverses all implementation classes in the project directory: .m files (excluding categories)
# 2 Matches the class name line by line with all files in the project except itself (including categories)
# 3 If a line that does not begin with // or #import is found, it is considered referenced; otherwise, it is unreferenced
# 4 Outputs the paths of unmatched files
# 5 Remove the matched files and execute again (because the first layer has been removed, more unreferenced classes may be exposed)
# 6 Continue until no unused classes are found
#
# [Parameters]
# 1. Parameter 1: Specify the Xcode project directory (if not specified, the current directory is used)
#
# [Instructions]
# 1. If no directory is specified, the current directory is used: sh find_unused_class.sh
# 2. Specify a directory: sh find_unused_class.sh /Users/xxxxx/Project-IOS/Project/Project

#!/bin/bash

# Repeat until no unused files are found

export cycle_deal=1
export cycle_idx=1
total_unused_file_name=''
function main() {

# Set the project directory
project_directory=$1

if [ -z "$1" ]; then
# If no parameter is passed as the current directory
project_directory=.
fi

# Initialize parameters:
unused_files=''

# Find all files ending with ViewController.m and output a list
all_class_path=$(find "$project_directory" -type f \( -name "*.m" \) | grep -v '+')

all_file_path=$(find "$project_directory" -type f \( -name "*.m" -o -name "*.h" \) )

for file in $all_class_path; do
filename=$(basename "$file" .m)
echo "***********Start traversing file names: "$filename
is_referenced=false
for other_file in $all_file_path; do
other_file_name=$(basename "$other_file")
# Get the class name other than the own: excluding the name of the extension, to avoid reference checks in the own .h and .m files
other_file_name_without_extension=$(echo "$other_file_name" | cut -d. -f1)
# Get the main class name of the category
other_file_name_without_extension_before_plus=$(echo "$other_file_name_without_extension" | awk -F'+' '{print $1}')
if [ "$other_file_name_without_extension_before_plus" != "$filename" ] ; then
# if [ "$other_file" != "$file" ] && ([ "${other_file##*.}" = "m" ] ); then
if grep -q "\b$filename\b" "$other_file"; then
# Check if there are comment lines in the file
has_comment=false
while IFS= read -r line; do
echo "Line by line: "$line"
if !grep -qE "^[[:space:]]*//" <<< "$line"; then
if [[ !$line =~ ^[[:space:]]*#import ]]; then
has_comment=true
echo "In file: "$other_file" matches "$filename" exists and is not Comment code or import break ("$line
break
fi

fi
done <<< "$(grep "\b$filename\b" "$other_file")"

if [ "$has_comment" = true ]; then
is_referenced=true
break
fi
fi
fi
done

if [ "$is_referenced" = false ]; then
echo "Unreferenced files:"$file
unused_files="$unused_files$file\n"
fi
echo "***********"
done

# Output a list of unreferenced files
if [ -n "$unused_files" ]; then
echo -e "Unused class files:\n$unused_files"
total_unused_file_name="$total_unused_file_name$unused_files\n"

# Mv the retrieved files
mkdir -p ./unused_files/$cycle_idx/ 
array=(`echo $unused_files | tr '\n' ' '`) 
for element in "${array[@]}"; do 
element=$(echo "$element" | tr -d '\n') 
echo "Unused class = "$element 
element_filename=$(basename "$element" .m) 
element_dirname=$(dirname "$element") 
mv -f ${element_dirname}/${element_filename}.h ./unused_files/$cycle_idx/$element_filename.h 
mv -f ${element_dirname}/${element_filename}.m ./unused_files/$cycle_idx/$element_filename.m 
done 

If the #cycle_deal parameter is empty, the cycle will not be executed. 
if [ -n "$cycle_deal" ]; then 
exit 
else 
#cycle_deal If not empty, loop until no new files are detected.

echo -e "Loop execution"

cycle_idx=$((cycle_idx+1))

main $1

done

else

echo "No unused ViewController files found."$all_file_path

echo "**************************"

echo -e "total_unused_file_name class files:\n$total_unused_file_name"

echo "**************************"

exit 0

fi
}

main $1

```

#### 2.2.3 Still Improving

The current tool only matches one level of unreferenced content and may not be compatible with the following situations:

- Two or more classes reference each other but are not used by other classes. However, the above script cannot currently identify this.
- Some classes contain methods in other API classes, general classes, utility classes, etc., but these methods are not called. In this case, these methods and classes can also be removed. However, the above script cannot currently identify this.