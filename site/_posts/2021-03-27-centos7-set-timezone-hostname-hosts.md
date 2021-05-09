---
title: CentOS7 集群环境设置时区、主机名，配置 hosts 文件
---

# CentOS7 集群环境设置时区、主机名，配置 hosts 文件

<post-meta date="2021-03-27" style="margin-bottom: 1rem" />

1、准备 3 台干净的 CentOS 虚拟机，假设为：node01、node02、node03

2、设置统一的时区

```bash
timedatectl set-timezone Asia/Shanghai  # 3 台机器都执行
```

3、查看硬件时间

```bash
hwclock -r
```

4、将硬件时钟同步到系统时钟

```bash
hwclock -s
```

::: tip 提示

若硬件时钟不对，可以手动更新系统时间，再同步到硬件。

```bash
# 设置系统时间
date -s "2021-03-27 14:03:00"

# 将系统时钟同步到硬件时钟
hwclock -w
```

:::

5、分别设置主机名为 node01，node02，node03

```bash
hostnamectl set-hostname node01  # node01 执行
hostnamectl set-hostname node02  # node02 执行
hostnamectl set-hostname node03  # node03 执行
```

6、查看 3 台机器的 IP 地址

```bash
ip addr
```

7、修改 hosts 文件

```bash
vi /etc/hosts  # 3 台机器都执行
```

```
192.168.202.211 node01
192.168.202.212 node02
192.168.202.213 node03
```

::: tip 提示

此处也可以直接使用以下命令修改 hosts 文件。

```bash
cat << EOF >> /etc/hosts
192.168.202.211 node01
192.168.202.212 node02
192.168.202.213 node03
EOF
```

:::

8、重启网络服务（一般可省略此步）

```bash
systemctl restart network  # 3 台机器都执行
```

