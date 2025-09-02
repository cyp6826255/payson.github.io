---
layout: post
title: "Jenkins Migration"
subtitle: "This is a subtitle"
date: 2021-06-20
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
lang: en
tags: []
---

## 1. Jenkins Migration Directory

### 1.1 Jenkins Installation Directory

The Jenkins installation process will not be repeated here; please refer to https://www.jenkins.io/doc/book/installing/.

After installation, the Jenkins directory is hidden. You can display it via the command line:

```shell
defaults write com.apple.finder AppleShowAllFiles -boolean true 
killall Finder
```

### 1.2 jobs

The `jobs` directory is where Jenkins stores **project configurations** and **build history**.

![img](/img/jenkins_qy/jenkins_catalog.png)

- `config.xml`: project configuration  
- `builds`: build history, including:

  - **build.xml**  
    Build information includes: actions, queueId, timestamp, startTime, result, duration, charset, keepLog, builtOn, workspace, hudsonVersion, scm, culprits.

  - **changelog.xml**  
    Code commit records

    ```
    commit 571f1f4e25f8d35234f31a4e5270ab4eea5f7623
    tree 11663eebbb089bc414048ffbf7c91de331d021cc
    parent 0a3d1d8057ba3e33055d8bfafcb25d00f3a5f93b
    author xxx <xxx@xxx.com> 2021-06-30 14:27:29 +0800
    committer xxx <xxx@xxx.com> 2021-06-30 14:27:29 +0800
    
        Fix issue: dual-SIM carrier switching not updating
    ```

  - **log**  
    Build logs, i.e., console output from Jenkins build history.

---

## 2. Migrating Project Configurations

### 2.1 Manual Migration

Manual migration can complete Jenkins migration but is cumbersome and does not guarantee integrity. It is better to abandon this method at the beginning.

### 2.2 Backup Jobs Migration

**Step 1:** Enable SSH service on the target machine.  

**Step 2:** On the source machine, use the `scp` command to copy the required project folder from the `jobs` directory to the target machine under `.jenkins/jobs`:

```shell
scp -r /Users/chen/.jenkins/jobs/SPM_iOS xxx@xx.xx.xxx.xxx:/Users/xx/.jenkins/jobs/SPM_iOS
```

**Step 3:** If the Git account configured in Jenkins differs on the target machine, update the Git credentials.  

**Step 4:** Refresh configuration on the target machine.  

![image-20210811104136231](/img/jenkins_qy/jenkins_mng.png)  

![image-20210811104136231](/img/jenkins_qy/jenkins_reload.png)  

**Step 5:** If there are external script calls (sh, Python), copy the corresponding scripts to the target machine in the same relative path using `scp`.  

**Step 6:** Try to build.  
- If successful, ignore the following steps.  
- If failed, the build may fail due to environment inconsistencies, e.g., `uglifyjs` not installed.  

```
uglifyjs: command not found
Build step 'Execute shell' marked build as failure
```

**Step 7:** Install missing environments (in this example, `uglifyjs`; for others, install accordingly):  

```shell
npm install uglify-js -g   
```

**Step 8:** If you still encounter failures after Step 7, add the following to the Jenkins shell configuration to refresh the current environment:  

```
source ~/.bash_profile
```

![image-20210811104136231](/img/jenkins_qy/jenkins_shell.png)

---

## 3. Others

Finally, if there are no further requirements, it is recommended to disable the SSH service on the target machine.
