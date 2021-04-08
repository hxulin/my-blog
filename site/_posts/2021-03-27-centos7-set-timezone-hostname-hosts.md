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

3、分别设置主机名为 node01，node02，node03

```bash
hostnamectl set-hostname node01  # node01 执行
hostnamectl set-hostname node02  # node02 执行
hostnamectl set-hostname node03  # node03 执行
```

4、查看 3 台机器的 IP 地址

```bash
ip addr
```

5、修改 hosts 文件

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

6、重启网络服务（一般可省略此步）

```bash
systemctl restart network  # 3 台机器都执行
```

