---
layout: post
title: "App Optimization Practice: Batch Conversion to WebP Format"
subtitle: "WebP"
date: 2022-09-25
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
lang: en
tags: []

---

## 0x00 Background

WebP already uses a lot in major Internet companies. The advantage of WebP is that it has better image data compression algorithms that bring smaller sizes and visual quality that recognizes the naked eye as non-differentiated; and that it has non-destructive and damaging compression patterns, Alpha transparency and animation features, with very good, stable and uniform transformation effects on JPEG and PNG.

## 0x01 comparative advantage

- PNG Conversion WebP with a compression rate higher than the PNG original compression rate, equally supportive of damage and lossless compression
- The converted WebP volume has been significantly reduced, and the quality of the pictures has been secured (while the difference is almost invisible to the naked eye)
- Converted WebP to support alpha transparency and 24-bit colours, there are no problems with PNG8 colours and the possibility of hair edges in browsers



## 0x02 Practice

The resources are generally designed to be compressed @2x, @3x condensed packages, so it is possible to convert these compressed packages into batches:

Write a script: Transfer2webp.sh

```shell
for file in ./*
do
    suffix=zip
    if [ "${file##*.}" = "$suffix" ]; then
        echo $file 'zip'
        dir=${file%.*}
        unar -e GBK $file #没有unar环境可以安装下https://blog.csdn.net/dawn_after_dark/article/details/83504421
        for subfile in ./${dir}/*
        do
            cwebp -q 90 "${subfile}" -o "${subfile%.*}.webp"
        done

    elif test -d $file ; then
        echo $file 'fold'
    else
        echo $file 'other'
    fi
done

```

Note: Unar instead of unzip is chosen because many design resources are likely to be packaged in Chinese, the use of unzip in the initial programme has a problem with the use of unzip and the use of unar in order to be compatible with the Chinese compression package



