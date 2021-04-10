---
title: CentOS7 关闭 selinux、防火墙
---

# CentOS7 关闭 selinux、防火墙

<post-meta date="2021-03-27" />

```bash
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config && \
setenforce 0 && \
systemctl stop firewalld && \
systemctl disable firewalld
```

:::tip 提示

查看防火墙是否关闭，没有拦截规则表示关闭

```bash
iptables -L
```

查看 selinux 是否关闭（Mode from config file: disabled）

```bash
sestatus
```

:::

