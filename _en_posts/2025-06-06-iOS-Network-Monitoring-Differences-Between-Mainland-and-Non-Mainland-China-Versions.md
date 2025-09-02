---
layout: post
lang: en
title: "iOS Network Monitoring: Differences Between Mainland and Non-Mainland China Versions"
subtitle: "Network Monitoring"
date: 2025-06-06
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: []

---

## 1. Background

When installing an app for the first time, a pop-up window will appear asking you to click "Allow xxx to use wireless data." Only after clicking "Allow" will network permissions be granted.

![1](/img/ios-network/1.jpg)

Some network operations for the first configuration need to be performed after this pop-up window, so we need to perform network monitoring:

```objective-c
/// Start monitoring
- (void)startMonitoringWithCallback:(void (^)(PSCAppNetworkStatus status))callback {
if (!callback) return;

nw_path_monitor_set_update_handler(_monitor, ^(nw_path_t path) {
PSCAppNetworkStatus status = NetworkStatusUnavailable;

if (nw_path_get_status(path) == nw_path_status_satisfied) {
BOOL usesWiFi = nw_path_uses_interface_type(path, nw_interface_type_wifi);
BOOL usesCellular = nw_path_uses_interface_type(path, nw_interface_type_cellular);

if (usesWiFi && usesCellular) {
status = NetworkStatusWiFiCellular;
} else if (usesWiFi) {
status = NetworkStatusWiFi;
} else if (usesCellular) {
status = NetworkStatusCellular;
}
}
callback(status); // Network status callback
});

nw_path_monitor_start(_monitor);
}
```

## 2. Problem

 Initially, verification on most devices was successful, until one test device failed to trigger the callback. On most versions of devices, the "Allow xxx to use wireless data" pop-up window (pictured above) popped up on first boot. This device never displayed this pop-up during initial installation.

 Research revealed that different versions of devices use network permissions differently.

![3](/img/ios-network/3.jpg)

Mainland China Version Settings->xxApp

![4](/img/ios-network/4.jpg)

Overseas Version Settings->xxApp

After turning off cellular data, the pop-up window for overseas devices without WiFi turned on is as follows:

![2](/img/ios-network/2.jpg)

## 3. Solution

 Overseas devices will enter the nw_path_monitor_set_update_handler callback when the network is switched, but will not when it is installed and opened for the first time.

 Mainland China devices will trigger the nw_path_monitor_set_update_handler callback when the network is switched and when it is installed and opened for the first time.

 In order to be compatible with overseas scenarios, after starting monitoring, determine whether the network is connected. If it is connected. The callback will return the connectivity status.

Modify the code as follows:

```Objective-C
/// Start monitoring
- (void)startMonitoringWithCallback:(void (^)(PSCAppNetworkStatus status))callback {
if (!callback) return;

nw_path_monitor_set_update_handler(_monitor, ^(nw_path_t path)) {
PSCAppNetworkStatus status = NetworkStatusUnavailable;

if (nw_path_get_status(path) == nw_path_status_satisfied) {
BOOL usesWiFi = nw_path_uses_interface_type(path, nw_interface_type_wifi);
BOOL usesCellular = nw_path_uses_interface_type(path, nw_interface_type_cellular);

if (usesWiFi && usesCellular) {
status = NetworkStatusWiFiCellular;
} else if (usesWiFi) {
status = NetworkStatusWiFi;
} else if (usesCellular) {
status = NetworkStatusCellular;
}
}

callback(status); // Callback for network status
});

nw_path_monitor_start(_monitor);
// Compatible with overseas versions, no callback for the first time.
if ([[PSCRequestManager sharedInstance] isNetworkReachable]) {
callback(NetworkStatusWiFiCellular); // Callback for network status
}
}
```