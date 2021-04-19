---
title: 批量复制 War/Jar 文件
---

# 批量复制 War/Jar 文件

<post-meta date="2018-11-25" style="margin-bottom: 1rem" />

这个工具是操作 War/Jar 文件的，下面针对 War 文件进行介绍，Jar 文件也同样适用。

**这个工具能做什么？**

批量复制 War 文件，复制的过程中，可动态修改 War 文件中包含的文本文件（如数据库的连接信息）

## 基本介绍
### 项目地址

[https://github.com/hxulin/batch-package](https://github.com/hxulin/batch-package)

### 运行原理

解压待复制的 War 文件，修改指定的文本文件内容，再进行二次打包。

<img :src="$page.baseUrl + 'assets/img/20181125/batch-package/batch-package.png'" alt="简单的说明图">

### 环境要求

运行环境：JDK1.7 或更高版本

## 快速开始

1. 下载项目中的 [batch-package-1.0.RELEASE-dist.zip](https://raw.githubusercontent.com/hxulin/batch-package/master/batch-package-1.0.RELEASE-dist.zip) 文件，并解压

2. 在解压目录中，运行以下命令：
   ```bash
   java -jar batch-package-1.0.jar
   ```
   > windows系统也可以直接双击运行startup.bat

   此时在你的目录中会生成 \_bak，\_gen，\_tmp三个目录，**\_gen目录中就存放着最终生成的文件**。

   &emsp;&emsp;以上是一个快速的测试用例。你可以查看配置文件 config.json 以及最终生成的文件，了解它的配置方法。\_gen目录中测试生成的每一个 ROOT.war 是可以直接放到 Tomcat 中运行并访问的。

3. 将你准备复制的 ROOT.war 文件放到解压目录中，替换测试的 ROOT.war

4. 修改 config.json 文件中的配置

5. 接着执行第 2 步就可以自定义生成了

## 核心配置

程序完成个性化的复制操作，需要在核心配置文件 config.json 中进行相关设置。config.json 的结构如下：

<img :src="$page.baseUrl + 'assets/img/20181125/batch-package/config-file-structure.png'" style="margin: .3rem 0 1rem" alt="JSON配置文件结构图">

**下面对 JSON 配置的各个节点进行相关说明：**

### warFileName 节点
配置待复制的 War 文件名，默认是 ROOT.war，可以修改成需要的。
### strategy 节点
生成策略的配置，该节点的配置是针对于 configuration 节点的，有以下四个字段可配置。
> default: 默认策略，默认情况生成 configuration 中配置的所有项
>
> include: 包含策略，指定生成时包含的项，多个项用 | 分隔
>
> exclude: 排除策略，指定生成时排除的项，多个项用 | 分隔
>
> active: 当前激活哪一个策略，可设置的值为 default、include、exclude
### configuration 节点
configuration 节点下可以配置多个对象，一个对象就对应着将要复制生成的一个 War 文件，每个对象下面又有两个子节点：generateFolder 和 items。

generateFolder 的值唯一，既表示复制后的 War 文件的存放目录，又是 strategy 节点用来配置生成策略的。

items 下的对象表示需要修改的文本文件，可以配置多个。items 的配置比较灵活，其中 configFileName 字段表示待修改的文件名（在 War 中的绝对路径）。其他字段都是自定义的，表示修改的行号，有多种灵活的写法。
```
修改第5行内容为AAA（修改单行）
{
    "5": "AAA",
    ...
}
```
```
第5-7行内容改为 AAA、BBB、CCC（修改多个连续的行）
{
    "5": "AAA",
    "6": "BBB",
    "7": "CCC",
    ...
}

或者
{
    "5-7": [
        "AAA", "BBB", "CCC"
    ],
    ...
}
```
```
第5-7行每一行都改为AAA（修改多个连续的行为同一个值）
{
    "5": "AAA",
    "6": "AAA",
    "7": "AAA",
    ...
}

或者
{
    "5-7": "AAA",
    ...
}
```
**行号没有先后顺序，如：先配置第 7 行，再配置第 5 行也是可以的。**

（完）