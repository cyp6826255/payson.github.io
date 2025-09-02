---
layout: post
lang: en
title: "iOS Side Story: Build Details"
subtitle: ""
date: 2023-08-08
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []

---

# iOS Side Story: Build Details

## 1. Background

Most iOS developers are probably familiar with using Xcode's built-in archive packaging. Those accustomed to the GUI may prefer archive packaging. While archive packaging has many advantages, including visualization, a low learning threshold, and clear error reporting, its drawbacks become apparent in team collaboration and daily builds:

- Multiple steps

 You need to synchronize code before packaging, select a signature during packaging, archive the package after packaging, and choose where to upload the package (distribution channel or App Store).

- Long processing time

Build times are getting longer with each project iteration. Large, full-scale builds can take tens of minutes. Archives can block current R&D processes, preventing the use of computing cluster resources beyond local computing power, impacting R&D efficiency.

- Lack of flexibility

The build process may require automatic build number incrementing, archiving dsym files, and building notifications. Using archives, all of these tasks must be performed manually.

- Lack of reliability

Manual maintenance is required to match branches, code, signatures, and build methods. This multi-step process is prone to errors and unreliable.

## 2. Build Design

To design a common build script, it is necessary to layer and categorize the core build process, design parameter inputs, and use the build environment. The program entry point is as follows:

```shell
# Read custom parameters via external parameters 2: target_name
# 2 Required
customSettings $2

# 3 (Optional) Dandelion channel number, concatenated URL
publishSettings $3

# 4 (Optional) Silent notifications. If a value is set, no notifications will be sent.
notificationSettings $4

# Start the build 1: configuration (0: DailyBuild | 1: TestFlight | 2: Release | 3: TFInner)
# 1 Required
build $1
```

### 2.1 Parameter Design:

#### 2.1.1 Parameter 1: Build Method

Corresponds to Configuration in the project, enumeration value: 0: DailyBuild | 1: TestFlight | 2: Release | 3: TFInner

- DailyBuild: For daily builds, CI/CD

- TestFlight: For grayscale builds

- Release: Used for building production packages

- TFInner: Used for building internal TF packages

Special Note: Due to the stringent requirements for Apple's Enterprise license ($299/year), this solution can temporarily address the issue of insufficient 100 test devices.

#### 2.1.2 Parameter 2: Target Name

Project TargetName:

![iOS_Build1](/img/ios-build/iOS_Build1.png)

<a name="2.1.3"></a>

#### 2.1.3 Parameter 3 (Optional): Channel Number

If you are not using a pipeline that supports iOS app distribution (similar to Tencent's Blue Whale (Blue Shield) pipeline): This example uses Dandelion for app distribution. To ensure compatibility with multiple channels, this is used to concatenate the download URLs for distribution.

![iOS_Build2](/img/ios-build/iOS_Build2.png)

##### 2.1.3.1 Third-Party Distribution: Dandelion

The pipeline distributes apps via the API. The following describes the cases where the channel number is empty and non-empty:

```shell
# Upload other build packages to pgy
echo '/// Upload PGY Start IPA_PATH='${IPA_PATH}'
echo '/// Upload PGY Start Channel='${pgyChannel}'
compileEnvironment="${buildName}:${git_log}"

if [ -z "$pgyChannel" ]; then
# If the channel is empty, use the default upload method without specifying a channel number.
curl -F 'file=@'${IPA_PATH} -F '_api_key='${pgyAPIKey} -F 'buildUpdateDescription='${compileEnvironment} https://www.pgyer.com/apiv2/app/upload
else
# If the channel is not empty, use the download address associated channel.
curl -F 'file=@'${IPA_PATH} -F '_api_key='${pgyAPIKey} -F 'buildUpdateDescription='${compileEnvironment} -F 'buildChannelShortcut='${pgyDownloadUrlSubfix} https://www.pgyer.com/apiv2/app/upload
fi

echo '/// Uploading PGY completed'
```

##### 2.1.3.2 Extension: Alibaba Cloud OSS Cloud Storage Distribution

Dandelion-based distribution is limited by Dandelion's upstream bandwidth and charging thresholds. We are exploring a disaster recovery distribution method to ensure robustness in the event of future Dandelion service anomalies.

Self-distribution requires Ad-Hoc mode and follows Apple's protocol: itms-services://?action=download-manifest&url=

```shell
#Add commit information to the QR code image
function add_log_commit_title_msg_to_qrcode ()
{
#Print version information on the QR code
#TODO: You need to install the ImageMgick tool [brew install ImageMgick]
title=$xcodeVersion3number.${channel_name}.$configurationName.${BuildNo}

if [ $1 = "1" ]; then
dst_line_cnt=0
export oss_source_log_arr=(`echo $source_log_str | tr '][' ' '`)
export oss_log_line_count=${#oss_source_log_arr[@]}
echo '/// OSS distribution: Add QR code msg log_line_count='$oss_log_line_count'

for(( i=0;i<${oss_log_line_count};i++)) 
do 
single_len=$(echo -n "${oss_source_log_arr[i]}" | wc -m) 
if [ -z "${oss_source_log_arr[i]}" ]; then 
oss_singleStr=${oss_source_log_arr[i]}; 
echo '///--Traversing '${oss_source_log_arr[i]}' is empty text length: '$single_len 
dst_line_cnt=$((dst_line_cnt+1)) 
else 
line_max_len=30 
ingle_cnt=$((single_len / line_max_len)) 


if ((ingle_cnt > 0)); then 
for(( j=0;j<=${ingle_cnt};j++))
do
string=${oss_source_log_arr[i]}
single_line1=${string:(line_max_len * j):line_max_len}
echo '///--Traverse ' ${oss_source_log_arr[i]}' Text length: '$single_len' Superthreshold stage: Line '$j': '$single_line1'
oss_singleStr+="\n"${single_line1};
dst_line_cnt=$((dst_line_cnt+1))
done;
else
echo '///--Traverse ' ${oss_source_log_arr[i]}' Text length: '$single_len'
dst_line_cnt=$((dst_line_cnt+1))
oss_singleStr+="\n"${oss_source_log_arr[i]};
fi
fi
done;
msg=$oss_singleStr
echo "/// oss render msg="$msg

contentsize_width=600
contentsize_height=$((contentsize_width + $dst_line_cnt * 25 + 40 + 40)) #The first 40 is the title height, the second 40 is the bottom margin.
echo "contentsize_height="$contentsize_height
#Change the original image size
convert $qrcode_path -resize ${contentsize_width}x${contentsize_width}^ -gravity center ${qrcode_path}_1.png

#Increase height, compatible with msg
convert ${qrcode_path}_1.png -gravity north -extent ${contentsize_width}x${contentsize_height} ${qrcode_path}_2.png 

#汉字font 
chn_tff_path=$build_ext_path/publish_res/chn.ttf 

#render title 
convert ${qrcode_path}_2.png -gravity north -pointsize 30 -font $chn_tff_path -fill black -annotate +0+${contentsize_width} $title ${qrcode_path}_3.png 

#render msg 
convert ${qrcode_path}_3.png -gravity north -pointsize 20 -font $chn_tff_path -fill black -annotate +0+$((${contentsize_width}+40)) $msg ${qrcode_path}_4.png 
qrcode_path_with_msg=${qrcode_path}_4.png 
else 
#Not passed 1 No msg is required, only title is given 
convert $qrcode_path -gravity south -pointsize 10 -fill gray -annotate +0+0 $qrcode_print_msg $qrcode_path_with_msg
echo '/// OSS distribution: Add QR code title='${title}'
fi

}

#Publish to Alibaba Cloud OSS
function upload_ipa_to_aliyunOSS ()
{
#Update the key-value pairs in the plist:
manifest_path=${exportPath}/manifest.plist
echo '/// OSS distribution: manifest_path='${manifest_path}'

oss_bucket="cbs-apps-test"
oss_platform="iOS" 
oss_bucket_path=$oss_platform/${TARGET_NAME}/$configurationName/${channel_name}/${BuildNo}/${TARGET_NAME}_${channel_name}_$configurationName_${BuildNo} 
oss_path="oss://$oss_bucket/$oss_bucket_path" 
oss_url="https://$oss_bucket.oss-cn-beijing.aliyuncs.com/$oss_bucket_path" 

oss_ipa_upload_url=$oss_path".ipa" 
oss_ipa_url=$oss_url".ipa" 

#iconDownload address configuration 
oss_icon_url="https://cbs-apps-test.oss-cn-beijing.aliyuncs.com/iOS/${TARGET_NAME}/icon/icon.png" oss_icon_fs_url="https://cbs-apps-test.oss-cn-beijing.aliyuncs.com/iOS/${TARGET_NAME}/icon/icon_fs.png"

#Change the ipa download address
/usr/libexec/PlistBuddy -c "Set :items:0:assets:0:url $oss_ipa_url" $manifest_path

#Change the icon address
/usr/libexec/PlistBuddy -c "Set :items:0:assets:1:url $oss_icon_url" $manifest_path

#Change the full-size icon address
/usr/libexec/PlistBuddy -c "Set :items:0:assets:2:url $oss_icon_fs_url" $manifest_path

#Upload the ipa file
ossutil cp ${IPA_PATH} $oss_ipa_upload_url -f

#Upload the manifest
oss_manifest_extension="plist"
oss_manifest_upload_url=$oss_path"."$oss_manifest_extension
oss_manifest_url=$oss_url"."$oss_manifest_extension
ossutil cp ${manifest_path} $oss_manifest_upload_url -f

#After archiving the above, generate a downloadable QR code
download_url="itms-services://?action=download-manifest&url="$oss_manifest_url
qrcode_path=${exportPath}/${TARGET_NAME}_${BuildNo}.png

#TODO: You need to install the qrencode tool here [brew install qrencode]
qrencode -o $qrcode_path $download_url

#Upload the QR code to OSS
oss_qrencode_extension="png"
oss_qrencode_upload_url=$oss_path"."$oss_qrencode_extension
qrcode_path_with_msg=${qrcode_path}_with_msg

#Call this function if you need to add log information to the QR code.
need_msg=1
add_log_commit_title_msg_to_qrcode $need_msg

#Upload to Alibaba Cloud OSS
ossutil cp ${qrcode_path_with_msg} $oss_qrencode_upload_url -f

#QR code URL is notified

export oss_app_download_qrcode_url=$oss_url"."$oss_qrencode_extension

echo '/// OSS distribution: QR code oss_app_download_qrcode_url='${oss_app_download_qrcode_url}'
}
```

#### 2.1.4 Parameter 4 (optional): Silent Notification

This example uses the DingTalk API to send notifications to a DingTalk group. By default, the "Send" field is left blank; if a value is set, no notification is sent. The notification content integrates the dual-distribution solution:

The following code shows the notification sending logic. Please replace the corresponding variables with your own parameters.

```shell
modify_msg=${git_log}
ProductName=${xcodeProductName}
downloadPrefix=${PrefixID}
channel=${pgyChannel}
title=${buildName}

# Use direct channel suffix
shortUrl=${downloadPrefix}${ProductName}${channel}

# Dandelion download address
pgy_app_download_url="https://www.pgyer.com/${shortUrl}"

# OSS download address
if [ -z "$oss_app_download_qrcode_url" ]; then
# If empty, use pgy
echo "Notice: If oss_app_download_qrcode_url is empty, use pgy: '${app_donwnload_url}'"

app_donwnload_url=$pgy_app_donwnload_url

else
#If not empty, use pgy + oss

echo "Notice: If oss_app_download_qrcode_url is not empty, use pgy + oss. If not empty, use pgy + oss: '${app_donwnload_url}' and '$oss_app_download_qrcode_url'"

app_donwnload_url=${pgy_app_donwnload_url}'\n'OSS download address: $oss_app_download_qrcode_url

fi
# app_donwnload_url=$oss_app_download_qrcode_url

echo "Notice COME download address: '${app_donwnload_url}'"

curl 'https://oapi.dingtalk.com/robot/send?access_token='${access_token}' \
-H 'Content-Type: application/json' \
-d '{"msgtype": "text",
"at": {
"atMobiles":[
"Here"
"Here"
"Is"
"Ding"
"Ding"
"Account"
"Number"
],
"isAtAll": false
},
"text": {
"content": "'${ProductName}' App Update: '${title}'\n'${modify_msg}'\nDownload URL: https://www.pgyer.com/'${app_donwnload_url}'" }
}'
echo '///-------------------------------------------------------'
echo '/// Send notification '
echo '///-------------------------------------------------------'
```

### 2.2 Process Design:

#### 2.2.1 Before Building:

- Input Parameter Settings

```shell
# Input Parameter Settings
function coustomSettings()
{
#Target to be packaged
if [ -z "$1" ]; then
echo "error: TARGET_NAME cannot be empty. Exit"
exit 1
else
export TARGET_NAME=$1
fi

#Project directory. If in the root directory, use ${WORKSPACE}

if [ -z "$2" ]; then
export projectDir=${TARGET_NAME}
else
export projectDir=$2
fi
# export projectDir=YPCProject
echo "TARGET_NAME="$TARGET_NAME"
echo "projectDir="$projectDir"

}
```

- Publishing Settings:

```shell
# Publishing and archiving related settings
function publishSettings()
{
if [ -z "$1" ]; then
echo '///Channel number parameter is empty'
export pgyChannel=Dev
else
echo '///Channel number parameter is not empty'
export pgyChannel=$1
fi

echo "////Channel number"${pgyChannel}

#Declare the pgyAPIKey for calling the Dandelion distribution API
export pgyAPIKey="pgyAPIKey"

#Access token for the DingTalk notification bot
export access_token="access_token"

#AppStore token
export appStore_apiIssuer="appStore_apiIssuer"
export appStore_apikey="appStore_apikey"

#Bugly token
export bugly_appid="bugly_appid"
export bugly_appkey="bugly_appkey"
}
```

- Notification Settings

```shell
#Notification-related settings (pgy channel and API key)
function notificationSettings()
{
notificationSettings=$1
if [ ${notificationSettings} = "1" ]; then
echo '///Silent parameter is not empty'
export notificationSilent=$notificationSettings
else
echo '///Silent parameter is empty or not 1, no notification will be sent'
fi

echo "////Silent notification="${notificationSilent}"
}

```

- Parameter Retrieval:

Use Xcode tools to retrieve project parameters

-

```shell
#Get project configuration information
function initInfoPlistParms()
{
#Hard-code the Plist first. You may consider switching to a search later.
cd ${CurDir}/${projectDir}
versionKey="MARKETING_VERSION"
bundleID="PRODUCT_BUNDLE_IDENTIFIER"
bundleNo="CURRENT_PROJECT_VERSION"
platformName="PLATFORM_NAME"
productName="PRODUCT_NAME"
#Set the key to be retrieved as an array
buildSettingsGrepKeyArray=($versionKey $bundleID $bundleNo $platformName $productName)
buildSettingsGrepKey=""
for((i=0;i<${#buildSettingsGrepKeyArray[@]};i++))
do
echo "[Get Plist Parameters] Traverse idx="$i" value="${buildSettingsGrepKeyArray[i]}
if [ -z "$buildSettingsGrepKey" ]; then
buildSettingsGrepKey=${buildSettingsGrepKeyArray[i]};
else
buildSettingsGrepKey+="\|"${buildSettingsGrepKeyArray[i]};
fi
done;
#Concatenate the array into grep parameters
echo "[Get Plist Parameters] key: "$buildSettingsGrepKey"

#-w prevents fuzzy matching, such as PRODUCT_NAME and FULL_PRODUCT_NAME
buildSettings=`xcodebuild -showBuildSettings -target ${TARGET_NAME} | grep -w $buildSettingsGrepKey`
echo "[Get Plist Parameters] result: "$buildSettings

#Get value array
buildSettingsGrepValueArray=[]
for((i=0;i<${#buildSettingsGrepKeyArray[@]};i++))
do
#Right truncation
value=${buildSettings#*${buildSettingsGrepKeyArray[i]} = }
for(( j=0;j<${#buildSettingsGrepKeyArray[@]};j++))
do
#Since the grep order is not guaranteed, traverse all keys and perform right truncation
value=${value%${buildSettingsGrepKeyArray[j]}*}
done;
value=`echo ${value} | sed 's/\ //g'`
echo "【Get Plist parameters】i="$i "value="$value"。"
#Fill back the value array
buildSettingsGrepValueArray[i]=${value}
done;

#Define all variables
export xcodeVersion3number=${buildSettingsGrepValueArray[0]}
echo "【Get Plist parameters】Version number: "$xcodeVersion3number"。"

export xcodeBundleID=${buildSettingsGrepValueArray[1]}
echo "【Get Plist parameters】Package name: "$xcodeBundleID"."

export xcodebundleNo=${buildSettingsGrepValueArray[2]}
echo "【Get Plist parameters】Build number: "$xcodebundleNo"."

export xcodePlatformName=${buildSettingsGrepValueArray[3]}
echo "【Get Plist parameters】PlatformName: "$xcodePlatformName"."

export xcodeProductName=${buildSettingsGrepValueArray[4]}
echo "【Get Plist parameters】ProductName: "$xcodeProductName"."
cd ..
}

```

- Build number setting:

Setting a build number can avoid duplicate builds, which can cause confusion when managing builds in the App Store backend. It also makes it easier to track build code versions. Setting the build number automatically would be even better. Here's a setup idea: Get the current date and the pipeline build number (auto-incrementing) to ensure global uniqueness within the pipeline:

```shell
#Automatically (auto-increment) modify the build number
function modify_build_no()
{
cd ${CurDir}/${projectDir}
export BuildNo=`date +%Y%m%d`
#BuildNo: You can use the concatenation of the date + build method + pipeline auto-incrementing number to identify the source of the build package (build method: dailybuild, TestFlight, Release, TFInner)
BuildNo=${BuildNo}.$1.${SYS_PIPELINE_BUILD_NUMBER}
# plist_path=${CurDir}/${projectDir}/${projectDir}/Info.plist
echo "[Get Plist Parameters] Path: "$plist_path"

echo "[Set Plist Parameters] Build: "$BuildNo"
# /usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${BuildNo}" ${plist_path}

agvtool new-version -all ${BuildNo}

cd -

}
```

#### 2.2.2 Building:

- Executing the Build:

After completing all necessary pre-build settings, you can proceed with the build process:

```shell
#Execute the Build
function build()
{
if [ -z "$1" ]; then

echo "error: configurationName cannot be empty. Exit"

exit 1

fi
#Define the project prefix, used when generating files

export PrefixID=PSC_

#Set the root directory

export CurDir=`pwd`

#Packaging schemeName

export schemeName=dailybuildipa

#Specify the compilation configuration
configurationNameArray=(DailyBuild TestFlight Release TFInner)
export configurationName=${configurationNameArray[$1]}

#Specify the build script path
#TODO: This needs to match the current script directory
export buildsh_dir=${CurDir}/PSC_iOS_Build_SH

#Set plist parameters
modify_build_no $1

#Read plist parameters
initInfoPlistParms

#Execute the build
bash $buildsh_dir/build_sh.sh
}
```

The build process design includes:

- Setting environment variables
- Setting internal variables

- Initializing the environment

- mPaaS settings (optional)

- Executing pods

- Build tool adaptation (optional)

- Executing the build

```shell
function build()
{
#Set internal environment variables
initDevopsEnv

#Set internal environment variables
createInternalEnv

#Initialize the environment
init_env

# Before executing the pod, configure the mPaaS configuration file for the current environment.
mPaaSConfigSet

# Execute the pod
pod_install

# Fix Xcode 14.3 CocoaPods bug
fiXCode143

# Execute the build
buildProject

# Execute the build archive operation
collection

# Upload (publish) the installation package for download and installation
bash $buildsh_dir/$build_ext_fold/$publish_sh

if [ ${configurationName} = "DailyBuild" ]; then
# Notification
bash $buildsh_dir/$build_ext_fold/$notification_sh
fi
}
```

For detailed build instructions, please refer to the source code; I will not elaborate on them here.

#### 2.2.3 After the build:

- Archiving

Why Archiving:

Archiving is primarily used to maintain a one-to-one correspondence between the built installation package (IPA) and its dSYM. Since dailybuilds are distributed within the team, archiving is only performed for TestFlight and the AppStore.

In addition, if you use Bugly for crash detection, Bugly no longer supports manual dSYM uploads; this must be done during the build process.

```shell
function upload_dSYM()
{
# You can save the dSYM file here depending on your needs.
}

function upload_dSYM_to_bugly()
{
export p=${dSYM_dict_PATH}

# Set this for different applications
if [ ${TARGET_NAME} = "PSCiOS" ]; then
bugly_appid=xxx
bugly_appkey=yyy
fi

echo '/// Upload dsym bugly '${v}' pkgName='${pkgName}'

# Switch Java version
java -version
jdk8
java -version

bugly_jar_path=$buildsh_dir/$build_ext_fold/collection_res/buglyqq-upload-symbol/buglyqq-upload-symbol.jar

java -jar ${bugly_jar_path} -appid ${bugly_appid} -appkey ${bugly_appkey} -bundleid ${pkgName} -version ${v} -platform IOS -inputSymbol ${p}
}

function collection()
{
export v=${xcodeVersion3number}.${BuildNo}
export pkgName=${xcodeBundleID}

#Upload to the Bugly symbol table
upload_dSYM_to_bugly

#Upload dSYM
upload_dSYM
}

#Archive
collection

```

- Release

After archiving, the installation package is distributed. Distribution is also divided into dailybuild and release:

dailybuild: Currently released to the Dandelion channel: [2.1.3 Parameter 3 (optional): channel number](#2.1.3)

Release: Release to the AppStore

```shell
if [ ${configurationName} = "Release" ] || [ ${configurationName} = "TestFlight" ] || [ ${configurationName} = "TFInner" ]; then
#Upload TFInner, TestFlight, and AppStore to the AppStore
echo '/// App Store upload begins'
xcrun altool --validate-app -f $IPA_PATH --type ios --apiKey $appStore_apikey --apiIssuer $appStore_apiIssuer
xcrun altool --upload-app -f $IPA_PATH --type ios --apiKey $appStore_apikey --apiIssuer $appStore_apiIssuer
echo '/// App Store upload completes'
fi

```

- Notifications

Notifications can be implemented in many ways. Since my team uses DingTalk, I'll use a DingTalk bot as an example: [2.1.4 Parameter 4 (optional): Silent notifications](#2.1.4)