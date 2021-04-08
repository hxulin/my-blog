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

