---
layout: post
lang: en
title: "Build Pipeline Practice"
subtitle: ""
date: 2023-11-08
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
mermaid: true
tags: []

---

## 1 Background

 To meet the automation needs of various projects, and given the continuous iteration and evolution of build methods and capabilities, maintaining multiple build scripts simultaneously is costly and inefficient. Therefore, we extracted the common capabilities of the packaging scripts and used them to build different projects through configuration parameters.

```
# [Purpose]
# To make pipeline construction more maintainable, easy to maintain, and portable, we modularize the build logic and divide the main build process into three modules: pre-build, build, and post-build.
#
# Pre-build: Parameter configuration, version number setting
# Build: Pod install, xcbuild
# Post-build: Archiving, distribution, and notification
#
# Current post-build options:
# Archiving: Simple Cloud (ipa + dSYM), Bugly (dSYM)
# Distribution: Dandelion, Alibaba Cloud OSS, AppStore
# Notification: DingTalk bot
# In future continuous integration processes, you can replace the archiving, distribution, and notification schemes without having to read or modify the build process.
```

## 2 Getting Started

The build script consists of three modules: the build entry point, the main build process, and the additional processes.

{% mermaid %}

graph TB
START --> Input Parameter Configuration
Parameter Configuration --> Pre-Build - Third-Party API KEY Configuration
Pre-Build - Third-Party API KEY Configuration --> Pre-Build - Set Build Version Number Auto-Increment
Pre-Build - Set Build Version Number Auto-Increment --> Pre-Build - Get Project Configuration
Pre-Build - Get Project Configuration --> During Build - Set Environment Variables
During Build - Set Environment Variables --> During Build - Install Pod Dependencies
During Build - Install Pod Dependencies --> During Build - Execute Build
During Build - Execute Build --> Build - Archive
During Build - Execute Archive --> Build - Execute Distribution
During Build - Execute Distribution --> Build - Execute Notification
During Build - Execute Notification --> END

{% endmermaid %}

### 2.1 Build Entry

The build entry is executed by UniversalBuild.sh and is responsible for variable parameter declaration and script parameter processing.

Parameter Description:

```
# [Parameter]
# -cfg #Packaging method: configuration (0:DailyBuild | 1:TestFlight | 2:Release | 3:TFInner)
# -target_name #Project configuration: Target name to be packaged
# -channel_name #Channel number: PGY download URL suffix
# -notify #Enable notifications. Passing a value of 1 enables group notifications, 2 enables internal group notifications
# -publish #Distribution method: 1 Enable OSS | 2 Enable PGY+OSS | Else PGY
```

The following uses [Demo] as an example:

Target is PSCDemoiOS

```
# [Instructions]
# Using the gitsubmodule build component, compatible with git checkout. Requires git submodule update --init --recursive first.
# git submodule update --init --recursive
# Pull from module update
# git submodule update --remote
#
# Packaging method: configuration(0:DailyBuild|1:TestFlight|2:Release|3:TFInner)
# configuration=0
#
# Project configuration (TargetName must match the source code directory):
# targetName=PSCDemoiOS
#
# Channel ID: pgy download URL suffix
# pgyChannel=129
#
# Whether to enable notifications. Passing a value of 1 enables group notifications, 2 enables internal group notifications
# notify=1
#
# 1 Enables OSS. 2 Enables pgy+OSS, else pgy
# publish=0
#
# sh PSC_iOS_Build_SH/UniversalBuild.sh -cfg $configuration -target_name $targetName -channel_name $pgyChannel -notify $notify -publish $publish
```

### 2.2 Main Build Process

The main build process is performed by build_sh.sh Execution, responsible for iOS builds. This part is closely related to packaging, relatively stable, and rarely requires frequent modifications, so it has been separated.

A brief description of the main process:

```shell
function build()
{
#Add time statistics
export build_start_time=$(date + %s.%N)

#Initialize the environment
bInitEnv
print_time_cost "Pre-build configuration"

#Execute pod
bPodInstall
print_time_cost "Execute pod"

#Execute the build
bBuildProject
print_time_cost "Execute the build"

#Execute the post-build archiving process: ipa & dsym
bCollection
print_time_cost "Execute the build archiving operation"

#Execute the post-build distribution process: upload (publish) the installation package for download and installation
bDistribution
print_time_cost "Execute the distribution operation"

#Execute the post-build notification process
bNotification
print_time_cost "Execute the notification operation"
}
```

For detailed steps, see the relevant modules in the code.

### 2.3 Additional Processes

The separation of additional processes is designed to allow for subsequent operations such as uploading, notification, and archiving, which are part of the packaging process and do not need to be coupled with the packaging process. This separation also enables hot-swappable module replacement.

#### 2.3.1 Distribution

Currently supports the following three distribution methods:

- Dandelion
- Alibaba Cloud OSS
- AppStore

Invoke the distribution logic for the installation package

```shell
sh build_ext/build_publish.sh
```

Execute the distribution logic in build_publish.sh.

```shell
function upload_ipa ()
{
export upload_start_time=$(date +%s.%N)
echo '///upload_ipa configurationName = '${configurationName}
if [ "${packedToAppStore}" == "1" ]; then
echo 'Time cost of uploading TFInner, TestFlight, and AppStore to the AppStore'
upload_ipa_to_AppStore
print_upload_time_cost "Upload to AppStore"

else
#Others
#Upload the package to PGY when PGY is enabled
if [ "${use_pgy_publish}" = "1" ]; then
echo '///Enable PGY upload, time statistics'
upload_ipa_to_pgyer
print_upload_time_cost "Upload PGY"
fi

#Enable OSS
if [ "${use_oss_publish}" = "1" ]; then
echo '///Enable OSS upload, time statistics'
upload_ipa_to_aliyunOSS
print_upload_time_cost "Upload OSS"
fi
fi
}

function upload()
{
#Publish ipa
upload_ipa
}

#Archive
upload
```

To upload a test package, you can switch from the current Dandelion to Fir or Simple Cloud. You don't need to worry about the packaging process; you only need to switch the upload module method.

- **dailybuild**

 Dandelion:

 Used for test package building. The installation package is currently uploaded to Dandelion (the server environment can be switched).

 Logic for uploading to Dandelion:

```shell
#Publish to third-party distribution platform: Dandelion
function upload_ipa_to_pgyer ()
{
echo '/// Start uploading PGY IPA_PATH='${IPA_PATH}
echo '/// Start uploading PGY channel='${channel_name}
echo '/// Start uploading PGY commit git_log='${git_log}

compileEnvironment="${buildName}:${git_log}"
echo '/// Start uploading PGY content='${compileEnvironment}

if [ -z "$channel_name" ]; then
# If the channel is empty, the default upload method is used.
# Change to 2.0 API

echo '/// Start uploading PGY. Channel is empty.'

bash $build_ext_path/publish_res/pgyer_upload.sh -k ${pgyAPIKey} -d ${compileEnvironment} ${IPA_PATH}
else
# If the channel is not empty, use the channel associated with the download address.
# Change to 2.0 API

echo '/// Start uploading PGY. Channel='${channel_name}'

bash $build_ext_path/publish_res/pgyer_upload.sh -k ${pgyAPIKey} -d ${compileEnvironment} -c ${pgyDownloadUrlSubfix} ${IPA_PATH}
fi

echo '/// End uploading PGY.'
}
```

Alibaba Cloud OSS:

```shell
#Add git log when downloading QR codes
function add_log_commit_title_msg_to_qrcode ()
{
#Print version information on the QR code
#TODO: You need to install the ImageMgick tool [brew install ImageMgick]
#check_command_and_install "convert" "ImageMgick"
bash $build_ext_path/build_tools/build_tools.sh "convert" "ImageMagick"

title=$xcodeVersion3number.${channel_name}.$configurationName.${BuildNo}

if [ $1 = "1" ]; then
dst_line_cnt=0
#FIXME: Will this result in an empty string?? ${source_log_arr}
export oss_source_log_arr=(`echo $source_log_str | tr '}{' ' '`)
export oss_log_line_count=${#oss_source_log_arr[@]}
echo '/// OSS distribution: Add QR code msg log_line_count='$oss_log_line_count'
echo '/// OSS distribution: Add QR code msg source_log_arr count='${#source_log_arr[@]}'

for(( i=0;i<${oss_log_line_count};i++))
do
single_len=$(echo -n "${oss_source_log_arr[i]}" | wc -m)
if [ -z "${oss_source_log_arr[i]}" ]; then
oss_singleStr=${oss_source_log_arr[i]};
echo '///--Traverse '${oss_source_log_arr[i]}' is empty. Text length: '$single_len'
dst_line_cnt=$((dst_line_cnt+1))
else
line_max_len=30
ingle_cnt=$((single_len / line_max_len))

if ((ingle_cnt > 0)); then
for(( j=0;j<=${ingle_cnt};j++))
do
string=${oss_source_log_arr[i]}
single_line1=${string:(line_max_len * j):line_max_len}
echo '///--Traverse ' ${oss_source_log_arr[i]}'. Text length: '$single_len'. Over-threshold stage: Line '$j': '$single_line1'
oss_singleStr+="\n"${single_line1};
dst_line_cnt=$((dst_line_cnt+1))
done;
else
echo '///--Traverse' ${oss_source_log_arr[i]}' Text length: '$single_len
dst_line_cnt=$((dst_line_cnt+1))
oss_singleStr+="\n"${oss_source_log_arr[i]};
fi
fi
done;
msg=$oss_singleStr
echo "/// oss render msg="$msg

contentsize_width=600
contentsize_height=$((contentsize_width + $dst_line_cnt * 25 + 40 + 40)) #The first 40 is the title height, the second 40 is the bottom margin
echo "contentsize_height="$contentsize_height 
#Change the size of the original image 
convert $qrcode_path -resize ${contentsize_width}x${contentsize_width}^ -gravity center ${qrcode_path}_1.png 
echo "1 convert："${contentsize_width}x${contentsize_width} 

#Get high, compatible with msg 
convert ${qrcode_path}_1.png -gravity north -extent ${contentsize_width}x${contentsize_height} ${qrcode_path}_2.png 
echo "2 convert："${contentsize_width}x${contentsize_height} 

#汉字font 
chn_tff_path=$build_ext_path/publish_res/chn.ttf 

#render title 
convert ${qrcode_path}_2.png -gravity north -pointsize 30 -font $chn_tff_path -fill black -annotate +0+${contentsize_width} $title ${qrcode_path}_3.png 
echo "3 convert:title:"${title} 

#render msg 
if [ -z "$msg" ]; then 
echo "4 convert: msg: empty" 
fi 

convert ${qrcode_path}_3.png -gravity north -pointsize 20 -font $chn_tff_path -fill black -annotate +0+$((${contentsize_width}+40)) $msg ${qrcode_path}_4.png 
echo "4 convert:msg:"${msg} 

if test -e "${qrcode_path}_4.png"; then 
echo "4 convert: msg exists" 
qrcode_path_with_msg=${qrcode_path}_4.png 
else 
echo "4 convert: msg does not exist use 3" qrcode_path_with_msg=${qrcode_path}_3.png
fi

else
#Not passing 1, no msg needed, only the title
convert $qrcode_path -gravity south -pointsize 10 -fill gray -annotate +0+0 $qrcode_print_msg $qrcode_path_with_msg
echo '/// OSS distribution: Add QR code title='${title}'
fi

}

#Publish to Alibaba Cloud OSS
function upload_ipa_to_aliyunOSS ()
{
#Update the key-value pairs in the plist:
# /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${version3number}" ${WeSingNotificationServiceExtension_plist}
manifest_path=${exportPath}/manifest.plist
echo '/// OSS distribution: manifest_path='${manifest_path} 

oss_bucket="oss_bucket_name" 
oss_platform="iOS" 
oss_bucket_path=$oss_platform/${TARGET_NAME}/$configurationName/${channel_name}/${BuildNo}/${TARGET_NAME}_${channel_name}_$configurationName_${BuildNo} 
oss_path="oss://$oss_bucket/$oss_bucket_path" 
oss_url="https://$oss_bucket.oss-cn-beijing.aliyuncs.com/$oss_bucket_path" 

oss_ipa_upload_url=$oss_path".ipa" 
oss_ipa_url=$oss_url".ipa" 

#iconDownload address configuration oss_icon_url="${aliyunOSSBuicket}/icon/icon.png" 
oss_icon_fs_url="${aliyunOSSBuicket}/icon/icon_fs.png" 


#Modify ipa download address 
/usr/libexec/PlistBuddy -c "Set :items:0:assets:0:url $oss_ipa_url" $manifest_path 

#Modify icon address 
/usr/libexec/PlistBuddy -c "Set :items:0:assets:1:url $oss_icon_url" $manifest_path 

#Modify icon full size address 
/usr/libexec/PlistBuddy -c "Set :items:0:assets:2:url $oss_icon_fs_url" $manifest_path 


#Transfer ipa
ossutil cp ${IPA_PATH} $oss_ipa_upload_url -f

#Transfer manifest
oss_manifest_extension="plist"
oss_manifest_upload_url=$oss_path"."$oss_manifest_extension
oss_manifest_url=$oss_url"."$oss_manifest_extension
ossutil cp ${manifest_path} $oss_manifest_upload_url -f

#After archiving the above, generate a download QR code
download_url="itms-services://?action=download-manifest&url="$oss_manifest_url
qrcode_path=${exportPath}/${TARGET_NAME}_${BuildNo}.png

#TODO: You need to install the qrencode tool [brew install qrencode]
bash $build_ext_path/build_tools/build_tools.sh "qrencode"

qrencode -o $qrcode_path $download_url

#Upload the QR code to OSS
oss_qrencode_extension="png"
oss_qrencode_upload_url=$oss_path"."$oss_qrencode_extension
qrcode_path_with_msg=${qrcode_path}_with_msg

#Call this if you need to include a log message with the QR code
need_msg=1
add_log_commit_title_msg_to_qrcode $need_msg

#Upload to Alibaba Cloud OSS
ossutil cp ${qrcode_path_with_msg} $oss_qrencode_upload_url -f

#Send the QR code URL to the notification
export oss_app_download_qrcode_url=$oss_url"."$oss_qrencode_extension
echo '/// OSS distribution: QR code oss_app_download_qrcode_url='${oss_app_download_qrcode_url}
```

- **TestFlight**

Building a grayscale package uploads the ipa app to the App Store backend (the server environment is the production environment; future grayscale deployments can be switched to grayscale if external networks are needed).

- **Release**

Building a production package uploads the ipa app to the App Store backend (the server environment is the production environment).

- **TFinner**

Building a grayscale package allows colleagues who haven't added test devices to download, solving the problem of 100 devices not being enough (with debug mode, switchable environments, and upload to the App Store).

App Store distribution:

```shell
#Publish to App Store
function upload_ipa_to_AppStore()
{
echo '/// Upload to App Store started'

xcrun altool --validate-app -f $IPA_PATH --type ios --apiKey $appStore_apikey --apiIssuer $appStore_apiIssuer

xcrun altool --upload-app -f $IPA_PATH --type ios --apiKey $appStore_apikey --apiIssuer $appStore_apiIssuer
echo '/// App Store upload completed'
}
```

#### 2.3.2 Notifications

The notification module currently uses DingTalk for notifications, but it is possible to switch to email or other methods in the future. This is also under consideration. The notification implementation content can be customized. The test team needs to be notified of updates only when the notify parameter is not empty:

```shell
if [ -z "$notify" ]; then
# Empty, no notification
echo '/// Silent build, no notification.'
else
....
fi
```

The notification logic is implemented in build_notification.sh as follows:

```shell
#Build Notification
function notification()
{
param=$1
if [ -z "$param" ]; then
echo '///Build notification (parameter is empty)'
notify
else
echo '///Build notification (parameter is not empty):'$param
if [ "${param}" = "AppStore" ]; then
echo '///Build notification AppStore'
notify_AppStore
else
echo '///Build exception (parameter:)'$param
notify_fail $param
fi
fi

}

echo '///Build notification ('$1')'

#Notification
notification $1
```

Notification compatible download links for pgy.com and OSS:

```sh
# Execute notification logic
function notify()
{
modify_msg=${git_log}
ProductName=${xcodeProductName}
downloadPrefix=${PrefixID}
channel=${channel_name}
title=${buildName}

app_donwnload_url=""
pgy_app_donwnload_url=""
# Enable pgy
if [ "${use_pgy_publish}" = "1" ]; then
# Use direct channel suffix
shortUrl=${downloadPrefix}${ProductName}${channel}

pgy_app_donwnload_url="https://www.xcxwo.com/${shortUrl}"
echo "short_download_url = "$short_download_url"
if [ -z "$short_download_url" ]; then
app_donwnload_url=$pgy_app_donwnload_url
else
app_donwnload_url=$short_download_url
fi
#Dandelion download address
echo "Notice: Dandelion distribution, download address: '${app_donwnload_url}'"
fi

#Enable OSS upload
if [ "${use_oss_publish}" = "1" ]; then
if [ -z "$oss_app_download_qrcode_url" ]; then
#OSS download address is empty
echo "Notice: If oss_app_download_qrcode_url is empty, download address: '${app_donwnload_url}'"
else
echo "Notice: If oss_app_download_qrcode_url is not empty, download address: '${app_donwnload_url}' and '$oss_app_download_qrcode_url'"
app_donwnload_url=${pgy_app_donwnload_url}'\n\n'OSS download address:$oss_app_download_qrcode_url

fi
fi

echo "Notification COME download address: '${app_donwnload_url}'"
echo "Notification content: '${ProductName}' App update: '${title}'\n'${modify_msg}'\nDownload address: '${app_donwnload_url}'"

if [ "${notify}" = "1" ]; then
echo '/// This notification is sent to the group.'
elif [ "${notify}" = "2" ]; then
echo '/// This notification is sent to the internal group.'
access_token=$internal_access_token
else
echo '/// This notification parameter is '${notify}'
fi

if [ -z "$notify" ]; then
# Empty, no notification sent
echo '/// Silently pack this time, no notification sent'

else
echo '/// Send a notification for this pack'
# Send a release notification
curl 'https://oapi.dingtalk.com/robot/send?access_token='${access_token}' \
-H 'Content-Type: application/json' \
-d '{"msgtype": "text",
"at": {
"atMobiles":[
"xx1"
"xx2"
"xx3"
"xx4"
"xx5"
"xx6"
"xx7"
],
"isAtAll": false
},
"text": {
"content": "'${ProductName}' App update: '${title}'\n'${modify_msg}'\nDownload address: '${app_donwnload_url}'" }
}'

echo '///-------------------------------------------------------'
echo '/// Notify Come3'
echo '///-------------------------------------------------------'
fi

}
```

Build failure notification:

```sh
#Notify when a packaging error occurs
function notify_fail()
{
#Publish to the internal mobile group
access_token=$internal_access_token
#Product
ProductName=${xcodeProductName}
#Channel name
channel=${channel_name}
#Pipeline name
title=${buildName}

#Failure reason
reson=$1

echo '/// This packaging error: Send notification to the internal group'
#Send release notification
curl 'https://oapi.dingtalk.com/robot/send?access_token='${access_token} \
-H 'Content-Type: application/json' \
-d '{"msgtype": "text",
"at": {
"atMobiles":[
"DD1",
"DD2"
],
"isAtAll": false
},
"text": {
"content": "❌Build failed:\nApp:'${ProductName}'\nReason:'${reson}'\nPipeline:'${title}'\nChannel:'${buildName}'"}

echo '///-------------------------------------------------------'
echo '///Build notification'
echo '///-------------------------------------------------------'
}

```

When building to the App Store, the test team needs to verify the release: a notification is also sent.

```sh
#Package the App Store notification and send it to the group with the TestFlight download link QR code.
function notify_AppStore()
{
#Publish to the internal mobile group
access_token=$internal_access_token
#Product
ProductName=${xcodeProductName}
#Channel name
channel=${channel_name}
#Pipeline name
title=${buildName}

#TestFlight QR code in OSS
downloadTF="${aliyunOSSBuicket}/AppStoreValid/testflight.png"

echo '/// This build is being packaged and uploaded to the AppStore: Send notification to the internal group'
#Send release notification
curl 'https://oapi.dingtalk.com/robot/send?access_token='${access_token}' \
-H 'Content-Type: application/json' \
-d '{"msgtype": "text",
"at": {
"atMobiles":[
"DD1",
"DD2"
],
"isAtAll": false
},
"text": {
"content": "✅AppSore build successful:\nApp: '${ProductName}'\nBuild name: '${configurationName}'\nPipeline: '${title}'\nVersion number: '${xcodeVersion3number}'\nBuild number: '${BuildNo}'\nTestFlight: '${downloadTF}'"}
}'

echo '///-------------------------------------------------------'
echo '/// Build notification'
echo '///-------------------------------------------------------'
}
```

#### 2.3.3 Archiving

Currently, when packaging for Release and TestFlight, the ipa and dysm files are uploaded to the Simple Cloud Product Library.

Build the archive and compile the ipa and dysm files into a zip file.

```shell
function ProductCollection()
{
if [ "${configurationName}" = "Release" ] || [ "${configurationName}" = "TestFlight" ]; then

dSYMCollection

IPACollection

export ProductCollectionPath=${dSYM_dict_PATH}/ProductCollection.zip
echo "ProductCollectionPath="$ProductCollectionPath
zip $ProductCollectionPath ${dSYMZip_PATH} ${IPAZip_PATH}
# Execute the archive (ipa + dSYM) and save them somewhere.
bash $build_ext_path/$collection_sh
fi

}

function dSYMCollection()
{
# zip and copy dSY 
echo "dSYMCollection" 

cd ${build_path}/Build/Products/${configurationName}-iphoneos 
find . -name '*.dSYM' | zip -r ${dSYMZip_PATH} -@ 
find . -name '*.dSYM' -exec cp -R {} ${dSYM_dict_PATH} \; 
cd- 
echo "Copy dSYM.zip file success save path:" ${dSYMZip_PATH}
}

function IPACollection()
{ 
# zip and copy dSYM 
echo "IPACollection" 
cd ${build_path}/Build/Products/${configurationName}-iphoneos 
find . -name '*.ipa' | zip -r ${IPAZip_PATH} -@ 
find . -name '*.ipa' -exec cp -R {} ${dSYM_dict_PATH} \;
cd -
echo "Copy IPAZip_PATH.zip file successfully saved path:" ${IPAZip_PATH}
}
```

 Archive the zip package to Simple Cloud

```shell
function upload_to_store()
{
export p=$1
echo '/// Upload the dSYM IPA to the artifact repository '${v}' pkgName='${pkgName}'
echo "dSYMZip_PATH = "${dSYMZip_PATH}" https://PSC-devops.com/pkg/PSC/raw/OperationsAppAnddSYM/release?version="${v}"&pkgName="${pkgName}"
# Upload the Simple Cloud artifact repository
curl -F "file=@"${p} -u Simple Cloud account: Simple Cloud password "https://PSC-devops.com/pkg/PSC/raw/OperationsAppAnddSYM/release?version="${v}"&pkgName="${pkgName} -k
}

```

Upload the dSYM to Bugly for locating online crashes:

```sh
function upload_dSYM_to_bugly()
{
export p=${dSYM_dict_PATH}

if [ "${TARGET_NAME}" = "PSCDemoiOS" ]; then
bugly_appid=$Demo_bugly_appid
bugly_appkey=$Demo_bugly_appkey
fi

if [ "${TARGET_NAME}" = "Operations" ]; then
bugly_appid=$operations_bugly_appid
bugly_appkey=$operations_bugly_appkey
fi

echo "/// Upload dSYM path ${p}"

echo "/// Upload dsym target ${TARGET_NAME}"

echo "/// Upload dsym bugly_appid ${bugly_appid}"

echo "/// Upload dsym bugly_appkey ${bugly_appkey}"

echo '/// Upload dsym bugly '${versionName}' pkgName='${pkgName}'

# Switching Java versions is done in the pipeline and cannot be done here.

java -version
# jdk8
# java -version

bugly_jar_path=$build_ext_path/collection_res/buglyqq-upload-symbol/buglyqq-upload-symbol.jar

java -jar ${bugly_jar_path} -appid ${bugly_appid} -appkey ${bugly_appkey} -bundleid ${pkgName} -version ${versionName} -platform IOS -inputSymbol ${p}
}
```

## 3. Additional Notes

The packaging scripts are extracted into a git submodule for integration across various projects, reducing maintenance costs. If they are not updated with the main project, the latest scripts must be synchronized with each build.

```shell
#Using the gitsubmodule build component, this is incompatible with git checkout. You must first run git submodule update --init --recursive
git submodule update --init --recursive
#Pull from module update
git submodule update --remote
```

## 4. Author

If you have any questions, please contact: wangshu2015@gmail.com