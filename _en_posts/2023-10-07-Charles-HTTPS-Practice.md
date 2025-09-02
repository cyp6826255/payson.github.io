---
layout: post
lang: en
title: "Charles HTTPS Practice"
subtitle: ""
date: 2023-10-07
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []

---

# Charles HTTPS Practice

## 1. Background

To build charging pile capabilities, we needed to collect and evaluate competitive product data. Previously, we collected data using screenshots and OCR, which was inefficient and unable to meet timely data updates. We now needed a more efficient approach.

## 2. Solution Selection

After consulting with a test team that had previously performed similar work, they were unable to provide a reliable solution. Initially, we chose a reverse engineering approach, conducting an internal mobile team evaluation and consulting with industry security engineers. However, this reverse engineering approach was costly, lacked the necessary expertise, and presented unmanageable risks.

We decided to try capturing packets from a map app to verify its feasibility.

## 3. Packet Capture

Wireshark cannot (and is quite difficult to) parse the HTTPS protocol.

Using Charles to capture packets:

### 3.1. Setting Up a Proxy

Open Charles and select Help->Local IP Address in the top status bar.

![local_IP](/img/2023-10-09-Charles/local_IP.png)

Get the IP address of the proxy machine on the LAN.

![local_IP2](/img/2023-10-09-Charles/local_IP2.png)

Manually set up a proxy on the device (iPhone):

![device](/img/2023-10-09-Charles/device.png)

Set the proxy to the IP address of the proxy machine mentioned above + Port number 8888

![device2](/img/2023-10-09-Charles/device2.png)

### 3.2. Install the certificate

In the top status bar, select Help->SSL Proxying->Install Charles Root Certification on a Mobile Device or Remote Broswer:

![ssl_cert](/img/2023-10-09-Charles/ssl_cert.png)

![ssl_cert2](/img/2023-10-09-Charles/ssl_cert2.png)

Access the device: chls.pro/ssl

Download the certificate, then install/trust the certificate in Settings->General->About->Certificate Trust and enable the certificate.

![device3](/img/2023-10-09-Charles/device3.png)

### 3.3. Message Parsing

After completing the above instructions, parse the HTTPS messages for the domain you want to crawl:

Top Status Bar: Proxy -> SSL Proxying Settings

![ssl_proxy](/img/2023-10-09-Charles/ssl_proxy.png)

Add the domain name and port number (port number is 443):

![ssl_proxy2](/img/2023-10-09-Charles/ssl_proxy2.png)

Open a map app, search for relevant keywords, and view the results in Charles:

![data](/img/2023-10-09-Charles/data.png)