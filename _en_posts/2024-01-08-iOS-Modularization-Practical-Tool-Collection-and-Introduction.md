---
layout: post
lang: en
title: "iOS Modularization: Practical Tool Collection and Introduction"
subtitle: "During the componentization process, there are some repetitive/frequent problems that need to be solved. Manually solving them will result in time lost due to repeated work and efficiency loss due to lack of accumulation. To avoid these losses, we have accumulated some tools for sharing."
date: 2024-01-08
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: []

---

# 1. Background

During the componentization process, there are some repetitive/frequent problems that need to be solved. Manually solving them will result in time lost due to repeated work and efficiency loss due to lack of accumulation. To avoid these losses, we have accumulated some tools for sharing.

# 2. Componentization Tool Introduction

## 2.1 Xcode Compilation Error Troubleshooting Tool

```shell
#!/bin/bash

# [Background]
# During the componentization process, the following compilation error often occurs:
# Build service could not create build operation: unknown error while handling message: MsgHandlingError(message: "unable to initiate PIF transfer session (operation in progress?)")
#
# author: PaysonChen
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
# 1. Parameter 1: Specify the Xcode build index directory
# 1. Parameter 2: Specify the Xcode project directory to open
#
# [Instructions]
# 1. If no directory is specified, the current directory is used: sh auto_clean.sh
# 2. If a directory is specified: sh auto_clean.sh /Xcode build index directory/ /Xcode project directory to open/

# Get the current user name
user_name=$(whoami)

export XcodeDerivedDataPath=/Users/$user_name/Library/Developer/Xcode/DerivedData
export XcodeWorkspacePath=/Applications/Xcode.app

if [ -z "$1" ]; then
echo '/// If parameter 1 is empty, use the default Xcode build index directory: '${XcodeDerivedDataPath}'
else
XcodeDerivedDataPath=$1
echo '/// If parameter 1 is not empty, use the default Xcode build index directory: '${XcodeDerivedDataPath}'
fi

if [ -z "$2" ]; then
echo '///Parameter 2 is empty, using the default Xcode project directory: '${XcodeWorkspacePath}'
else
XcodeWorkspacePath=$2
echo '///Parameter 2 is not empty, Xcode project directory: '${XcodeWorkspacePath}'
fi

#cd to the Xcode build index directory
cd $XcodeDerivedDataPath

exit_status=$?

if [ $exit_status -ne 0 ]; then
echo '///Directory switch failed: '${XcodeDerivedDataPath}'
exit -1
else
echo '///Directory switch successful: '${XcodeDerivedDataPath}'
fi

#Delete all artifacts in the current directory
rm -rf *

#Restart Xcode
killall Xcode

#Sleep for a while, otherwise the restart may fail
sleep 0.1

#Restart the project
open $XcodeWorkspacePath

```

## 2.2 Private component batch update tool

```shell
#!/bin/bash

# Script to traverse and update Git repositories in subdirectories of the current directory
# author: PaysonChen
# [Purpose]
# During component-based development and subsequent collaborative development, team members often update component library code and the main project. Main projects are easy to update, but as the number of pod libraries increases, the repetitive work of updating component library repositories each time needs to be improved.
#
# [Directory]
# - auto_update_git.sh.sh Script to traverse and update Git repositories in subdirectories of the current directory
#
# [Instructions]
# 1. Traverse subdirectories of the specified directory (the current directory if no parameter is passed)
# 2. cd to a subdirectory
# 3. Check the current branch
# 4. Pull the current branch from the remote repository
#
# [Parameters]
# 1. Parameter 1: Specify a directory
#
# [Instructions]
# 1. If no directory is specified, the current directory is used: sh auto_update_git.sh
# 2. Specify a directory: sh auto_update_git.sh /User/xxx/xx

if [ -z "$1" ]; then
export dist_path=*/
echo '///Specified directory is empty:'${dist_path}
else
export dist_path=$1/*/
echo '///Specified directory is not empty:'${dist_path}
fi

# Traverse the subdirectories of the specified directory
for dir in ${dist_path}; do
cd "$dir" # Enter a subdirectory
echo '/// Enter a subdirectory:'${dir}

# Check if it is a Git repository
if [ -d .git ]; then
echo "Updating git repository in $dir"
current_branch=`git branch --show-current`
echo "current_branch is $current_branch"

git config pull.rebase false # Merge (default strategy)
git pull origin $current_branch # Update the Git repository using the git pull command
else
echo "Skipping non-git repository in $dir"
fi

cd .. # Return to the previous directory
done

```

## 2.3 Private Component Batch Submission Tool

##

```shell
#!/bin/bash

# Script to traverse and update Git repositories in subdirectories of the current directory
# author: PaysonChen
# [Purpose]
# During component-based development and subsequent collaborative development, team members often update component library code and the main project. Main projects are easy to update, but as the number of pod libraries increases, the repetitive work of updating component library repositories each time needs to be improved.
#
# [Directory]
# - auto_commit_git.sh Script to traverse and update Git repositories in subdirectories of the current directory
#
# [Instructions]
# 1. Traverse subdirectories of the specified directory (the current directory if no parameter is passed)
# 2. cd to a subdirectory
# 3. Check the current branch
# 4. Commit changes
# 5. Commit and push
#
# [Parameters]
# 1. Parameter 1: Specify a directory
# 2. Parameter 2: Commit message
#
# [Instructions]
# 1. If no directory is specified, the current directory is used: sh auto_commit_git.sh
# 2. Specify a directory: sh auto_commit_git.sh /User/xxx/xx "Commit information"

if [ -z "$1" ]; then
export dist_path=*/
echo '///Specified directory is empty:'${dist_path}
else
export dist_path=$1/*/
echo '///Specified directory is not empty:'${dist_path}
fi

echo '///Specified:'$1
echo '///Specified:'$2

# Traverse subdirectories of the specified directory
for dir in ${dist_path}; do
cd "$dir" # Enter a subdirectory
echo '///Enter a subdirectory:'${dir}

# Check if it is a git repository
if [ -d .git ]; then
echo "committing git repository in $dir"
current_branch=`git branch --show-current`
echo "current_branch is $current_branch"

git add .
msg=""
if [ -z "$2" ]; then
msg="--update: Update code"
echo '///Commit record is empty:'$msg
else
msg=$2
echo '///Commit record is not empty:'$msg
fi

git commit -m "$msg"
git push -f origin master
else
echo "Skipping non-git repository in $dir"
fi

cd .. # Return to the previous directory
done

```

## 2.4 Private component batch release tool

```shell
#!/bin/bash

# Traverse the current directory and automatically add new versions of private libraries
# author: PaysonChen
# [Purpose]
# During the component-based development process and subsequent collaborative development, some global changes require a unified release.
#
# [Directory]
# - auto_publish_git.sh traverses the current directory and automatically publishes versions of private repositories
#
# [Instructions]
# 1. Traverses subdirectories under the specified directory (the current directory if no parameter is passed)
# 2. cd to a subdirectory
# 3. Check the current branch
# 4. Automatically publish versions
#
# [Parameters]
# 1. Parameter 1, specify a directory
#
# [Instructions]
# 1. If no directory is specified, the current directory is used: sh auto_publish_git.sh
# 2. If a specified directory is specified: sh auto_publish_git.sh /Users/xxx/xx

if [ -z "$1" ]; then
export dist_path=*/
echo '///Specified directory is empty:'${dist_path}
else
export dist_path=$1/*/
echo '///Specified directory is not empty:'${dist_path}
fi

# Traverse the subdirectories of the specified directory
for dir in ${dist_path}; do
cd "$dir" # Enter the subdirectory
echo '///Enter subdirectory:'${dir}

# Check if it is a Git repository
if [ -d .git ]; then
echo "Updating git repository in $dir"
current_branch=`git branch --show-current`
echo "current_branch is $current_branch"
if [ -z "$2" ]; then
echo "tag is empty, using auto-increment tags"
pod push
else
echo "tag is not empty, tag="$2"
pod push $2
fi
else
echo "Skipping non-git repository in $dir"
fi
cd .. # Return to the previous directory
done

```

pod push relies on the cocapods plugin (to be explained in a subsequent article)

## 2.5 Private Component Batch Release Tool - Optimization

```shell
#!/bin/bash

# Traverses the current directory and automatically increments the private repository release only when the latest commit is not a tag record (i.e., a release is required).
# author: PaysonChen
# [Purpose]
# During component-based development and subsequent collaborative development, some global changes require a unified release.
#
# [Directory]
# - auto_tag_if_need_git.sh Traverses the current directory and automatically increments the private repository release based on whether a release is required.
#
# [Instructions]
# 1. Traverses subdirectories within the specified directory (the current directory if no parameter is passed).
# 2. cd to a subdirectory.
# 3. Check the current branch.
# 4. Automatically release a release.
#
# [Parameters]
# 1. Parameter 1: Specify a directory.
#
# [Instructions]
# 1. If no directory is specified, the current directory is used: sh auto_tag_if_need_git.sh
# 2. Specify a directory: sh auto_tag_if_need_git.sh /User/xxx/xx

if [ -z "$1" ]; then
export dist_path=*/
echo '///Specify directory is empty:'${dist_path}
else
export dist_path=$1/*/
echo '///Specify directory is not empty:'${dist_path}
fi

function get_tag()
{
latest_tag=$(git describe --exact-match --tags $(git log -n1 --pretty='%h') 2>/dev/null)
echo "${latest_tag}"
}

function push_if_need()
{
if git describe --exact-match --tags $(git log -n1 --pretty='%h') >/dev/null 2>&1; then

latest_tag=$(get_tag)
echo "[push_if_need]: Latest commit is a tag (${latest_tag})$1."
return 0
else
latest_tag=$(get_tag)
echo "[push_if_need]: Latest commit is not a tag (${latest_tag})$1."
pod push
latest_tag=$(get_tag)
echo "[push_if_need]: Packaged tag (${latest_tag})$1."
return 1
fi
}

# Traverse subdirectories of a specified directory
allTaged=""

modifyTaged=""

for dir in ${dist_path}; do
cd "$dir" # Enter a subdirectory
echo '///Enter subdirectory:'${dir}

# Check if it's a git repository
if [ -d .git ]; then
result=false
echo "Updating git repository in $dir"
current_branch=`git branch --show-current`

echo "current_branch is $current_branch"

git config pull.rebase false # Merge (default strategy)

git pull origin $current_branch # Update the Git repository using the git pull command

if [ -z "$2" ]; then

echo "tag is empty, using auto-increment tags"
# pod push

push_if_need $dir
result=$?

else
echo "tag is not empty, full release tag="$2"

pod push $2
fi

latest_tag=$(get_tag)

pod_name=${dir%%/*}

allTaged="$allTaged pod \"$pod_name\",'$latest_tag' \n"

if [ $result -eq 1 ]; then
# latest_tag=$(get_tag)
# pod_name=${dir%%/*}

modifyTaged="$modifyTaged pod \"$pod_name\",'$latest_tag' \n"

# echo "Variable is true. "$dir
# echo "Variable is true. "$tmp

echo "Variable is true. "$modifyTaged

else
echo "Variable is false. "

fi

else
echo "Skipping non-git repository in $dir"

fi

cd .. # Return to the previous directory

done

echo "------------------------"
echo "allTaged (all components): = \n"$allTaged
echo "------------------------"

echo "------------------------"
echo "allTaged (components released this time): = \n"$modifyTaged
echo "------------------------"

```

# 3. Other Tools

## 3.1 Tool for Deleting Commented-Out #import Lines

```objective-c
//#import "xxx.h"
```

```shell
#!/bin/bash

# Script to iterate through classes in a specified directory and delete commented-out import lines
# author: PaysonChen
# [Purpose]
# Periodically organize unused imports (comment them out) in a project
#
# [Directory]
# - delete_unused_import_annotation.sh
#
# [Instructions]
# 1. Iterate through a specified directory
# 2. Search for lines of code
# 3. Match the given condition: //import
# 4. Delete lines of code
#
# [Parameters]
# 1. Parameter 1: Specify a directory
#
# [Instructions]
# 1 Instruction example: sh delete_unused_import_annotation.sh your_path

find $1 -type f \( -name "*.h" -o -name "*.m" \) -exec sed -i '' '/\/\/#import/d' {} \;

```

## 3.2 Unreferenced Class File Cleanup Tool

```shell
#!/bin/bash

# [Background]
# When basic components are decomposed to a certain extent, the remaining classes in the main project are mostly related to the view interface (VC, View, etc.). At this point, you can consider designing and planning your business components. However, the project still has the following issues:
# Redundant Files:
# Redundant class files that are not referenced by the project but exist in the project directory.
#
# author: PaysonChen
# [Purpose]
# To reduce the workload and complexity of the business components, it's best to purify/clean up the project beforehand.
#
# [Directory]
# - find_all_file_no_project.sh
# [Description]
# 1. Recursively traverse the project directory and match each found class name with the contents of the XXX.xcodeproj/project.pbxproj file.
# 2. If a match fails, output a file list.
# 3. [Manually] check the file list one by one, and if any are redundant, delete them from the project.
#
# [Parameters]
# 1. Parameter 1 specifies the directory where the main project class of the Xcode project itself is located, not the directory where the project is located.
# For example, XXX/ProjectName/ProjectName.xcodeproj/project.pbxproj
# XXX/ProjectName/ProjectName/AppDelegate.h
# The following address needs to be passed in:
# XXX/ProjectName/ProjectName
# [Instructions]
# 1. If no directory is specified, the current directory is used: sh find_all_file_no_project.sh
# 2. If a specified directory is specified: sh find_all_file_no_project.sh /Users/xxxxx/Project-IOS/ProjectName/ProjectName

#!/bin/bash

function main() {

# Set the project directory
project_directory=$1

if [ -z "$1" ]; then
# If no parameter is passed, the current directory is used
project_directory=.
fi

# Set a different directory
parent_path=$(dirname "$project_directory")
echo "Project path: "$parent_path"

current_dir=$(basename "$project_directory")
echo "Current path folder name: "$current_dir"

project_path=$(find "$parent_path"/$current_dir.xcodeproj -type f \( -name "*.pbxproj" \)) 
echo "project path:"$project_path 

all_file_path=$(find "$project_directory" -type f \( -name "*.h" \)) 
all_file_path_cnt=$(find "$project_directory" -type f \( -name "*.h" \) | wc -l) 

echo "Number of main project header files:"$all_file_path_cnt 

for src_file in $all_file_path; do 
# echo $src_file 
filename=$(basename "$src_file" .h) 
if ! grep -q "\b$filename\b" "$project_path"; then 
echo "project does not contain:"$src_file 
fi 
done
}


main $1

```

## 3.3 Unused class file cleaning tool

```shell
#!/bin/bash

# [Background]
# When the basic components are decomposed to a certain extent, the remaining files in the main project are mostly class files related to the view interface (VC, View, etc.). At this point, you can consider designing and planning your business components. However, the project still has the following issues:
# Redundant Files:
# Non-redundant but Unused Files
#
# author: PaysonChen
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
# 2. Specify a directory: sh find_unused_class.sh /Users/xxxxx/ProjectName-IOS/ProjectName/ProjectName

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

file_cnt=0

for file in $all_class_path; do
file_cnt=$((file_cnt+1))
done
echo "*******file_cnt:"$file_cnt

for file in $all_class_path; do
filename=$(basename "$file" .m)
echo "***********Start traversing file names:"$filename
is_referenced=false
for other_file in $all_file_path; do
other_file_name=$(basename "$other_file")
#Get the class name other than the own: does not include the name of the extension to avoid reference checks in the own .h and .m files.
other_file_name_without_extension=$(echo "$other_file_name" | cut -d. -f1)
# Get the main category name of the category
other_file_name_without_extension_before_plus=$(echo "$other_file_name_without_extension" | awk -F'+' '{print $1}')
if [ "$other_file_name_without_extension_before_plus" != "$filename" ] ; then
# if [ "$other_file" != "$file" ] && ([ "${other_file##*.}" = "m" ] ); then
if grep -q "\b$filename\b" "$other_file"; then
# Check if there are any comment lines in the file
has_comment=false
while IFS= read -r line; do
echo "Line by line: "$line
if ! grep -qE "^[[:space:]]*//" <<< "$line"; then
if [[ ! $line =~ ^[[:space:]]*#import ]]; then
has_comment = true
echo "In file: "$other_file" matches "$filename" and is not a comment code or import break ("$line
break
fi

fi
done <<< "$(grep "\b$filename\b" "$other_file")"

if [ "$has_comment" = true ]; then
is_referenced = true
break
fi
fi
fi
done

if [ "$is_referenced" = false ]; then
echo "Unreferenced file: "$file
unused_files="$unused_files$file\n"
fi
echo "***********"
done

# Output a list of unreferenced files
if [ -n "$unused_files" ]; then
echo -e "Unused class files:\n$unused_files" 
total_unused_file_name="$total_unused_file_name$unused_files\n" 

#Mv the retrieved file out 
mkdir -p ./unused_files/$cycle_idx/ 
array=(`echo $unused_files | tr '\n' ' '`) 
for element in "${array[@]}"; do 
element=$(echo "$element" | tr -d '\n') 
echo "Unused class = "$element 
element_filename=$(basename "$element" .m) 
element_dirname=$(dirname "$element") 

destFoldName="./unused_files/$cycle_idx/${element_dirname}/${element_filename}" 
mkdir -p $destFoldName 

cp -f ${element_dirname}/${element_filename}.h $destFoldName/$element_filename.h
cp -f ${element_dirname}/${element_filename}.m $destFoldName/$element_filename.m
done

#If the cycle_deal parameter is empty, the loop will not be executed.

if [ -z "$cycle_deal" ]; then

echo "If the cycle_deal parameter is empty, the loop will not be executed."

exit 0

else
#If cycle_deal is not empty, the loop will be executed until no new files are checked out.

echo -e "Loop execution"
cycle_idx=$((cycle_idx+1))
main $1
fi

else
echo "No unused ViewController files found."$all_file_path
echo "**************************"
echo "total_unused_file_name class files:\n$total_unused_file_name"
echo "**************************"

exit 0
fi
}

main $1

```

## 3.4 Conflict Resolution Tools

```shell
#!/bin/bash

# [Background]
# The componentization process inevitably encounters the following issues:
# The componentization process is generally long, and business requirements are inevitably introduced during this process. This can lead to a situation:
# The componentization branch has already migrated classes from the main project to the pod repository, and during this time, the business requirement code has modified these migrated classes.
# When merging code from the main branch (or other branch), if the main branch (or other branch) has modified the classes that were previously migrated, merge conflicts will occur.
# This conflict occurs when the entire class is marked with a plus sign (+) without a conflict sign. In this case, it cannot be easily resolved using tools or conflict signs.
#
# author: PaysonChen
# [Purpose]
# To reduce the workload and complexity of merging componentized branches into the main branch
#
# [Table of Contents]
# - merge.sh
# [Instructions]
# 1. Organize the conflicting file path list for the project
# 2. Organize the conflicting path list in each pod repository
# 3. On the unmerged branch, first move a copy of the organized pod repository path list to the main project
# 4. Merge the branches
# 5. After resolving conflicts, move the above list from the main project to each pod repository
# 6. Submit the code for each pod repository
# 7. Organize project files and project classes
# 8. Submit the project code
#
# [Parameters]
# 1. Parameter 1: Source path: Move the file path list in parameter 1 to the path corresponding to parameter 2 (index)
# For example, merge_pods_files.txt
# 2. Parameter 2: Target path list
# For example, merge_project_files.txt
#
# [Instructions]
# 1. Requires a specified directory
# Move from Pod to main project: sh merge.sh merge_pods_files.txt merge_project_files.txt
# Move from main project to Pod: sh merge.sh merge_project_files.txt merge_pods_files.txt

# Read the source and destination file paths from an external file
#"source_paths.txt"
source_file=$1
#"destination_paths.txt"
destination_file=$2

# Check if the source file exists
if [ ! -f "$source_file" ]; then
echo "Source file '$source_file' does not exist."
exit 1
fi

# Check if the destination file exists
if [ ! -f "$destination_file" ]; then
echo "Source file '$source_file' does not exist."
exit 1
fi

# Ensure each record has a carriage return (the last line without a carriage return will be ignored)
while IFS= read -r source_path && IFS= read -r destination_folder <&3; do
source_paths+=("$source_path")
destination_paths+=("$destination_folder")
done < $source_file 3< $destination_file

# Output array length
echo "Source file path array length: ${#source_paths[@]}"
echo "Destination folder path array length: ${#destination_paths[@]}"

#exit 0
# Traverse index
for index in "${!source_paths[@]}"; do
echo "Traverse destination folder path array, index="$index
source_path="${source_paths[$index]}"
destination_path="${destination_paths[$index]}"

# Construct the full path to the destination file
# destination_path="${destination_folder}${source_path}"

# Check if the destination file exists and delete it if it does
if [ -e "$destination_path" ]; then
rm "$destination_path"
fi

# Ensure the destination folder exists
mkdir -p "$(dirname "$destination_path")"

# Copy the source file to the destination path
mv "$source_path" "$destination_path"
done

echo "File copy completed."

```

## 3.5 Copyright Information Batch Synchronization Tool

```shell
#!/bin/bash

# Traverse and update all iOS project class files (.h, m, swift) in the current directory (including subdirectories) and replace their comment header templates.
# author: PaysonChen
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
# 2. Match all iOS project class files (.h, m, swift).
# 3. Replace their comment header templates.
#
# [Parameters]
# 1. Parameter 1: Specify a directory
#
# [Instructions]
# 1. If no directory is specified, the current directory is used: sh replace_class_header_anotation.sh
# 2. If a directory is specified: sh replace_class_header_anotation.sh /Users/xxx/xx
# This script replaces the following comments with a unified comment template:
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
# ********************************************************************************************************/
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
export copyright_str="Copyright (C) $(date +%Y) Your CompanyName Limited. All rights reserved."

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
project_name="YourProjectName"

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