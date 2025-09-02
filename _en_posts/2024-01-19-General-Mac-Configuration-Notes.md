---
layout: post
lang: en
title: "General Mac Configuration Notes"
subtitle: "Some Common Tools and Environment Configuration Notes"
date: 2024-01-19
author: "PaysonChen"
header-img: "img/post-bg-2015.jpg"
tags: []

---

# General Mac Configuration Notes

## 1 Preparation

1. Set keyboard modifier keys: command <—> option (personal preference)

2. Mouse => Disable natural scrolling (personal preference)

3. Show hidden files

```
defaults write com.apple.finder AppleShowAllFiles -bool true

killall Finder
```

## 2 App Installation

1. Chrome (https://google.com/chrome/)

2. SourceTree (https://www.sourcetreeapp.com/)

3. Sogou Input Method (https://shurufa.sogou.com/)

## 3 Development Environment Configuration

### 3.1. Homebrew

Installation Command:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Setting the Path

```
(echo; echo 'eval "$(/opt/homebrew/bin/brew shellenv)"') >> /Users/`whoami`/.zprofile
source ~/.zprofile
```

### 3.2. Gems

Mac comes with Ruby.

### 3.3. Pods

Installation:

```
gem install cocoapods
```

### 3.4. zshrc

oh-my-zsh installation command:

```
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### 3.5. Shortcut Configuration

```shell
# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="robbyrussell"

# Set list of themes to pick from when loading at random
# Setting this variable when ZSH_THEME=random will cause zsh to load
# a theme from this variable instead of looking in $ZSH/themes/
# If set to an empty array, this variable will have no effect.
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment one of the following lines to change the auto-update behavior
# zstyle ':omz:update' mode disabled  # disable automatic updates
# zstyle ':omz:update' mode auto      # update automatically without asking
# zstyle ':omz:update' mode reminder  # just remind me to update when it's time

# Uncomment the following line to change how often to auto-update (in days).
# zstyle ':omz:update' frequency 13

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS="true"

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
# ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# You can also set it to another string to have that shown instead of the default red dots.
# e.g. COMPLETION_WAITING_DOTS="%F{yellow}waiting...%f"
# Caution: this setting can cause issues with multiline prompts in zsh < 5.7.1 (see #5765)
# COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# You can set one of the optional three formats:
# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# or set a custom format using the strftime function format specifications,
# see 'man strftime' for details.
# HIST_STAMPS="mm/dd/yyyy"

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(git)

source $ZSH/oh-my-zsh.sh

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
# export EDITOR='vim'
#else
# export EDITOR='mvim'
#fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"

export PATH="$PATH:/usr/local/mongodb/bin"
export PATH="$PATH:/usr/bin"
#export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"

export nodejs_debug=1
#Add the following code
#export JAVA_8_HOME="$(/usr/libexec/java_home -v 1.8)"
#export JAVA_11_HOME="$(/usr/libexec/java_home -v 11)"
#export JAVA_8_HOME="/usr/bin/java"
#export JAVA_11_HOME="/opt/homebrew/opt/openjdk/bin/java"
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"

alias jdk8='export PATH="/usr/bin:$PATH"'
alias jdk11='export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"'

# Path configuration ShellTools/auto_clean.sh
alias clean_xcode='sh /Users/`whoami`/Documents/PSC/git/Tools/ShellTools/auto_clean.sh'

# Path configuration ShellTools/pod_lib_ceate_with_psc_temp.sh
alias PSC_pod_template='sh /Users/`whoami`/Documents/PSC/git/Tools/ShellTools/pod_lib_ceate_with_psc_temp.sh'

alias bdpod="export debug=0
bundle exec pod"

alias bdpod_dbg="export debug=1
bundle exec pod"

alias bdpod_git="export debug=0
export use_git=1
bundle exec pod"

# Configure the repo repository name. PSCPodPublicRepos points to the public repository git directory.
alias pod_push_public="pod push --spec-repo=PSCPodPublicRepos"

# Add RVM to the PATH for scripting. Make sure this is the last PATH variable changed.
export PATH="$PATH:$HOME/.rvm/bin"

# Switch to Ruby
#export RUBY_HOME=/usr/local/opt/ruby/bin
export RUBY_HOME=/usr/bin

export PATH="$RUBY_HOME:$PATH"
export GEM_HOME="$HOME/.gem"
```

### 3.6 SSH Private Key Configuration

To configure multiple Git SSH private keys, please refer to [[Multi-Account GIT Configuration](https://paysonchen.cn/2021/10/18/git/)]

## 4. Development Tools

### 4.1 IDEs

Mobile:

-  Xcode
-  Android Studio

Front-end:

-  HbuildX

WeChat Mini Program Development Tools

-  Node
-  Visual Studio Code

Others

-  PyCharm

### 4.2 Tools

-  Lookin
-  JSON Validation (JSON data format validation)
-  VisualXML (XML data format validation)
-  ApiPost7 (HTTP request simulation)
-  MySQLWorkbench (MySQL management)
-  Charles (packet capture)
-  Appium Server GUI (automated testing)