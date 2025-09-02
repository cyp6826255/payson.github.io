---
layout: post
lang: en
title: "Solutions for Intranet Debugging of iOS Clients"
subtitle: ""
date: 2023-08-03
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []

---

# Solution for Intranet Debugging of iOS Clients

## 1. Background

When working on a certain requirement, if the backend interface is deployed on the R&D intranet, debugging may encounter the following issues:

## 2. Problem Description:

Certificate verification failed during intranet debugging:

The test device needs to be connected to WiFi: XXX_DEV. This WiFi cannot access the Internet, resulting in certificate verification failures.

Therefore, each compilation requires:

- Switching to the Internet before compilation
- Switching to the intranet after compilation

This significantly impacts R&D efficiency.

## 3. Solution:

### 3.1 Solution 1: Test Machine

Automate via iPhone Shortcuts:

- Using a SIM card
- Add an automation line: Turn off Wi-Fi and turn on cellular when the app is closed, allowing access to the external network to verify the certificate during compilation.
- Add another automation line: Turn off cellular and turn on Wi-Fi when the app is running, and set Wi-Fi settings to automatically join only WiFi: XXX_DEV.

This temporarily resolves the above issue. If a complete solution is needed in the future and security controls cannot be circumvented, you will need to push the backend to deploy the dev environment to the external network.

### 3.2 Solution 2: Simulator Debugging

Simulator debugging does not require network verification of the certificate, so you can connect your Mac to WiFi: XXX_DEV for simulator debugging.

### 3.3 Solution 3: Deploy to the R&D External Network

Consult with backend developers to prioritize external deployment during development.

### 3.4 Solution 4: Whitelisting Certificate Verification on the Intranet

According to Apple's official documentation (https://support.apple.com/zh-cn/HT210060), the domain name for certificate verification is: ppq.apple.com

| Host               | Port    | Protocol | OS                                | Description                                   | Supported Proxy |
| :----------------- | :------ | :------- | :-------------------------------- | :-------------------------------------------- | :-------------- |
| *.itunes.apple.com | 443, 80 | TCP      | iOS, iPadOS, tvOS, and macOS      | Store content, such as apps, books, and music | Yes             |
| *.apps.apple.com   | 443     | TCP      | iOS, iPadOS, tvOS, and macOS      | Store content, such as apps, books, and music | Yes             |
| *.mzstatic.com     | 443     | TCP      | iOS, iPadOS, Apple tvOS and macOS | Store content, such as apps, books, and music | —               |
| itunes.apple.com   | 443, 80 | TCP      | iOS, iPadOS, tvOS, and macOS      |                                               | Yes             |
| ppq.apple.com      | 443     | TCP      | iOS, iPadOS, tvOS, and macOS      | Enterprise app verification                   | —               |