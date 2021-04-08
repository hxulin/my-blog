---
title: Gluster 分布式存储系统快速安装步骤
---

# Gluster 分布式存储系统快速安装步骤

<post-meta date="2021-03-28" />

## 安装环境

1、3 台服务器，因为存储需要至少 3 个节点，假设为：node01、node02、node03

2、操作系统：CentOS 7.x

3、可连接互联网（在线安装，有离线安装方式，但此文档不涉及）

## 安装步骤

1、统一时区，设置主机名，配置 hosts 文件

[参考]：<a :href="$withBase('/2021/03/27/centos7-set-timezone-hostname-hosts/')">CentOS7 集群环境设置时区、主机名，配置 hosts 文件</a>

2、下载 Gluster 源并安装

```bash
yum -y install centos-release-gluster  # 3 台机器都执行
```

3、安装 Gluster

```bash
yum -y install glusterfs-server  # 3 台机器都执行
```

4、启动 Gluster

```bash
systemctl enable glusterd && systemctl start glusterd  # 3 台机器都执行
```

5、关闭防火墙或者开放 24007 端口

[参考]：<a :href="$withBase('/2021/03/27/centos7-turn-off-selinux-firewall/')">CentOS7 关闭 selinux、防火墙</a>

::: tip 提示

开放来自指定 IP 的所有端口：

```bash
iptables -I INPUT -p all -s <ip-address> -j ACCEPT
```

:::

6、登录到任意一台服务器，比如 node01，执行：

```bash
gluster peer probe node02
gluster peer probe node03
```

::: tip 注意

使用主机名时，需要确保 3 台服务器相互都可以通过域名访问，此处也可以使用 IP 地址，如果上述命令失败，绝大多数原因就是因为网络不通或防火墙设置问题。

上述命令只需要在任意一台机器执行即可。

:::

7、检查 peer 的状态

```bash
gluster peer status
```

应该可以看到以下输出（UUID是不同的）

```
Number of Peers: 2
Hostname: node02
Uuid: d707d6e2-03b4-4610-9736-0ed7e3c8ed10
State: Peer in Cluster (Connected)
Hostname: node03
Uuid: 4aa4efaf-edf3-4543-8fb3-879eb63b7b71
State: Peer in Cluster (Connected)
```

因为有 3 个节点，除了自身服务器外，可以看到 2 个 peer，并且状态是已连接的状态，说明 3 台服务器已经在一个池子里了。

该检查命令在任何一台服务器执行都能看到上述输出。

8、创建存储目录

在所有的服务器上创建一个存储目录用于后面创建存储卷使用，一般是相同目录，也可以不同。假设在 3 台服务器分别创建 /data/brick1/gv0 目录作为存储目录：

```bash
mkdir -p /data/brick1/gv0  # 3 台机器都执行
```

9、创建存储卷

纠删码式（推荐）：

```bash
gluster volume create gv0 disperse 3 \
node01:/data/brick1/gv0 \
node02:/data/brick1/gv0 \
node03:/data/brick1/gv0
```

复制卷式：

```bash
gluster volume create gv0 replica 3 \
node01:/data/brick1/gv0 \
node02:/data/brick1/gv0 \
node03:/data/brick1/gv0
```

其中 gv0 只是个卷名，不是和目录对应的。replica 是创建 3 个分片，后面陆续需要写上 3 个存储服务器，格式为：服务器名（或IP） + 冒号 + 存储位置（上一步创建的）

::: warning 注意：此处有可能报以下错误。

volume create: gv0: failed: The brick node01:/data/brick1/gv0 is being created in the root partition. It is recommended that you don't use the system's root partition for storage backend. Or use 'force' at the end of the command if you want to override this behavior.

这是因为我们创建的 brick 在系统盘，gluster 默认情况下是不允许的，生产环境也尽可能与系统盘分开，如果必须这样，在命令行后添加 force

:::

10、启动存储卷

```bash
gluster volume start gv0  # 1 台机器执行即可
```

我之前忘记了启动，导致在 mount 的时候会失败。

11、查看存储卷启动状态

```bash
gluster volume info
```

正常情况下会看到如下输出：

```
Volume Name: gv0
Type: Disperse
Volume ID: 851748f3-8e20-4cd4-ba0c-2bc306a7e2ee
Status: Started
Snapshot Count: 0
Number of Bricks: 1 x (2 + 1) = 3
Transport-type: tcp
Bricks:
Brick1: node01:/data/brick1/gv0
Brick2: node02:/data/brick1/gv0
Brick3: node03:/data/brick1/gv0
Options Reconfigured:
storage.fips-mode-rchecksum: on
transport.address-family: inet
nfs.disable: on
```

如果上述输出的 Status 没有显示为 Started，可以到 /var/log/glusterfs/glusterd.log 查看日志。

12、创建挂载点并设置目录访问权限

```bash
mkdir -p /mnt/gv0 && chmod -R a+rw /mnt/gv0  # 3 台机器都执行
```

13、挂载存储卷

```bash
mount -t glusterfs node01:/gv0 /mnt/gv0  # 3 台机器都执行此命令，不用修改 node01
```

node01:/gv0 格式为服务名（或IP）+ 冒号 + 存储卷位置路径（与创建存储卷时提供的参数格式不同）。

## 测试

测试存储，在挂载过存储卷的目录（比如上述步骤是 /mnt/gv0 目录）创建一个文件后，会发现在所有节点（比如上述步骤是 /data/brick1/gv0 目录）中均会出现该文件。表示分布式存储设置成功。

## 开机挂载

修改 /etc/fstab 文件，配置自动挂载，3 台机器都执行：

```bash
cat << EOF >> /etc/fstab
node01:/gv0 /mnt/gv0 glusterfs defaults,_netdev 0 0
EOF
```

