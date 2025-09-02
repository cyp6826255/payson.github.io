---
layout: post
lang: en
title: "iOS Automated Debugging: Automatic Compilation and Startup"
subtitle: "Automation"
date: 2024-04-22
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: []

---

# iOS Automated Debugging: Automatic Compilation and Startup

I recently encountered a strange bug: the program crashed as soon as it started, and the crash stack trace was quite confusing:

```
0 libobjc.A.dylib _cache_getImp + 8
1 libobjc.A.dylib _object_getMethodImplementation + 212
2 CoreFoundation __NSIsNSString + 136
3 CoreFoundation -[NSTaggedPointerString isEqual:] + 176
4 CoreFoundation _CFEqual + 748
5 CoreFoundation __CFURLComponentsCopyString + 480
6 CoreFoundation __CFURLComponentsCopyURLRelativeToURL + 24
7 Foundation -[__NSConcreteURLComponents URL] + 44
8 Foundation -[NSURL(NSURL) initWithString:relativeToURL:encodingInvalidCharacters:] + 436
9 Foundation +[NSURL(NSURL) URLWithString:relativeToURL:] + 44

10 TheRouter -[TheRouter pathComponentsWithURLString:] (TheRouter.m:263)
11 TheRouter -[TheRouter registURLString:openHandler:] (TheRouter.m:53)
12 TheRouter -[TheRouter(Annotation) registController:storyBoard:path:] (TheRouter+Annotation.m:84)
13 TheRouter __55-[TheRouter(Annotation) registPathAnnotationsWithHost:]_block_invoke (TheRouter+Annotation.m:47)
```

After searching for answers and consulting chatgpt, I came to some conclusions:

Possible crash causes and solutions:

- **Memory access issues**: The most common crash cause is accessing freed memory or invalid objects. Please check whether the objects used in the block are properly released or whether there are dangling pointers.
- **Thread safety issues**: If multiple threads access and modify shared data simultaneously, race conditions and data inconsistencies may occur. Ensure that appropriate synchronization mechanisms are used in multi-threaded environments to protect shared data.
- **Exception handling**: Check for code in the block that may raise exceptions and ensure that exceptions are properly handled and caught to avoid program crashes.
- **Debugging and logging**: Add detailed logging output to relevant code to track the program execution path and identify the specific cause of the crash.

Modification attempt: After removing the asynchronous code, I tried launching the app multiple times to verify the fix. After back-and-forth with GPT and several revisions, I created the following script, which partially meets my needs:

```shell
#!/bin/bash

# Set variables, replacing them with your app name, Xcode project path, and device UDID xcworkspace xcodeproj
APP_NAME="APP_NAME"
PROJECT_PATH="xx/demo.xcworkspace"
DEVICE_UDID="00008030-000E050C21D2802E"
bundle_id="com.yourcompany.app"
AppPath="/XXX/demo-enujmiuwqdhgvfcldwlvhjxzzewr/Build/Products/Debug-iphoneos/demo.app"
sleepToDebug=20
# Loop through the debugging and installation process
while true
do
echo "Building and installing" $APP_NAME..."

# TODO: If you don't need to compile, comment the following line. Build the app using xcodebuild
# xcodebuild -workspace "$PROJECT_PATH" -scheme "$APP_NAME" -configuration Debug \
-destination "id=$DEVICE_UDID"

#clean build

# Check the build results. If successful, install the app on the device.
# if [ $? -eq 0 ]; then
# Install the app on the device using ios-deploy
ios-deploy --id "$DEVICE_UDID" --bundle $AppPath --justlaunch

# Check the installation results. If successful, continue to the next loop.
if [ $? -eq 0 ]; then
echo "App installed successfully!"
else
echo "Failed to install app."
fi
# else
# echo "Build failed."
# fi

# Wait for a while before continuing to the next loop. For example, wait for sleepToDebug seconds.
# sleep $sleepToDebug
done

```