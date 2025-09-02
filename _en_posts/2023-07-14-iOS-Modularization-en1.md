---
layout: post
lang: zh
title: "iOS Modularization Practice 1: Preface"
subtitle: ""
date: 2023-07-14
author: "PaysonChen"
header-img: "img/home-bg-geek.jpg"
tags: []

---

# Preface

Over the past decade, the domestic mobile Internet has surged, and the construction of mobile applications has also sprung up. From the beginning, around 2011, amateur developers made a player and put it on the App Store, which could generate up to millions of monthly revenues<sup>[1]</sup>. Now, there are a lot of apps, and people cherish their mobile phone space like gold and are unwilling to install more ordinary apps. After experiencing wave after wave of technological innovation, since CocoaPods compiled the first public version<sup>[2]</sup> on September 1, 2011, it opened the era of iOS projects having application-level dependency managers.

As the mobile internet sector has evolved from a blue ocean to a red ocean, the early stages of project development have gradually shifted from a loosely defined architecture to a component-based architecture.

## 1. Loosely Defined Architecture Design

This can be understood as a method for...

1. Some vendors quickly trial and error, quickly launching into the market to verify the feasibility of their business models.

2. Some vendors outsource projects for rapid, cost-effective delivery.

A common point among these practices is that they fail to consider the costs and expenses of ongoing maintenance.

A loosely structured architecture typically exists in the following ways:

**1.1. Early iOS projects primarily consist of project-based projects, often culled from the internet**

1. Code blocks
2. Various functional classes
3. Certain open or private libraries (integrated as libraries or frameworks)

Patched together,

**1.2. After the introduction of CocoaPods**

1. Code blocks
2. Various functional classes
3. Certain open or private libraries (integrated as libraries or frameworks)
4. Integrating public and private libraries (wheels) via CocoaPods

A loosely structured architecture is generally used for small to medium-sized products with a short delivery timeframe. This approach allows for rapid implementation and visible delivery, while neglecting sustainable maintenance.

As some vendors rapidly capture the market and validate their work through trial and error, these teams face spiraling maintenance costs due to factors such as haphazard project and architecture approaches, unstable personnel, the broken window effect, and the growing corporate focus on cost reduction and efficiency.

## 2. Component-Based Architecture Design

### 2.1 The Current Situation of Inattentive Architecture Design

What are the current situations faced by an architecture team that is inattentive? These can be broadly summarized as follows:

1. **Excessive historical issues:** Code redundancy prevents many historical issues from being discovered in a timely manner.
2. **Difficulty in locating and fixing issues:** Code is chaotic, problem-solving code is fragmented, resulting in high locating costs and incomplete fixes.
3. **Long requirements development cycle:** Lack of clear planning leads to repetitive requirements development, increasing R&D costs.

### 2.2 Problems Solved by Component-Based Architecture Design

What problems will an inattentive architecture design encounter over time? The problems can be broadly summarized as follows:

1. Chaos: Code is written uniformly within a single project, making it difficult to identify and locate issues.
2. Redundancy: Multiple implementations of the same functionality result in incomplete fixes.
3. Non-reusability: No reusable modules, requiring duplicate implementation across multiple apps.

### 2.3 Problems Caused by Component-Based Architecture

Component-based architecture can address many of the shortcomings of a more sloppy architecture, reducing the ongoing maintenance costs and expense of a project. What improvements can it achieve? It can be roughly summarized as follows:

1. **Efficient Problem Solving:** Code is divided into modules, creating a closed loop of problem fixing and iterative maintenance to improve efficiency.
2. **Clear Code Architecture**: A clear call chain prevents issues like missed or incomplete fixes that escape into production.
3. **Reusability**: The ability to co-build across apps reduces maintenance costs.

## 3. Componentization Cycle

Based on my observations across various teams (startups to top-tier BAT teams), the typical time required for componentization varies from 10 to 100 man-months per end-user, depending on the project size, team size, and the number of requirements. My previous company, a large-scale, large-scale company, invested 5 to 10 people in total, taking about 1 year and 6 months to complete the initial componentization of an existing project. For early-stage startups, this cost is often only 10% of the initial effort. Considering the cost, componentization is best done sooner rather than later.

## 4. Component-Based Architecture Design

1. Clear Definition and Division of Functional Components
2. Hierarchical Design of Basic Modules
3. Decoupling of Upper-Level Business Modules

![/img/1-1.png](/img/1-1.png)