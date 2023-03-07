---
layout: post
title: "Github多账号配置SSH"
subtitle: ""
date: 2022-09-26
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []
---

## 0x00 背景

​	有时候需要多个github的账号，比如Github Page，如果有需要开多个可能就需要同时管理多个github账号

## 0x01 实践

​	在ssh管理上使用常规的config配置文件:

```
# github2
Host XXX.github.com
Port 22
User XXX
HostName github.com
PreferredAuthentications publickey
IdentityFile ~/.ssh/id_rsa_github_XXX

# github 
Host YYY.github.com
Port 22
User YYY
HostName github.com
PreferredAuthentications publickey
IdentityFile ~/.ssh/id_rsa_github_YYY

```

一开始还可以用

## 0x02 问题

过了一段时间想继续使用，发现出问题了

```
git clone git@github.com:nickname/web.git 


Cloning into 'XXX.github.io'...
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.
```

## 0x03 解决

clone时 改为 git@other.github.com:nickname/web.git 即可

```
git@other.github.com:nickname/web.git 
```

## 0x04 其他问题

```
Cloning into 'yyy'...
/Users/xxxx/.ssh/config line 21: Bad key types 'publickey'.
/Users/xxxx/.ssh/config: terminating, 1 bad configuration options
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

此时表示 publickey 不符合这个仓库的加密类型尝试改成

```
PubkeyAcceptedAlgorithms publickey
=>
PubkeyAcceptedAlgorithms +ssh-rsa
```





