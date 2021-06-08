# VMware 安装 CentOS7 开机优化

<post-meta date="2021-05-12" />

## 1、VMware 虚拟网络配置

<img :src="$page.baseUrl + 'assets/img/20210512/centos7-boot-optimization/vmware-network-setup-1.png'" alt="vmware-network-setup-1.png" style="border: 1px solid #CCC; margin-bottom: 1rem">

<img :src="$page.baseUrl + 'assets/img/20210512/centos7-boot-optimization/vmware-network-setup-2.png'" alt="vmware-network-setup-2.png" style="border: 1px solid #CCC; margin-bottom: 1rem">

<img :src="$page.baseUrl + 'assets/img/20210512/centos7-boot-optimization/vmware-network-setup-3.png'" alt="vmware-network-setup-3.png" style="border: 1px solid #CCC">

## 2、CentOS7 安装项配置

<img :src="$page.baseUrl + 'assets/img/20210512/centos7-boot-optimization/centos7-installation-summary.png'" alt="centos7-installation-summary.png" style="margin-bottom: 1rem">

## 3、开机优化

### 3.1 编辑网卡配置，设置静态 IP

```bash
vi /etc/sysconfig/network-scripts/ifcfg-ens33
```

```properties {4,13,15-20}
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=dhcp    # 改为none
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=ens33
UUID=2437316e-c76f-44ef-893d-fcc1fa2f5346    # 删除此行，防止冲突
DEVICE=ens33
ONBOOT=no                # 改为yes
GATEWAY=10.0.0.2         # 新增网关配置，地址可从VMware NAT设置中查看
IPADDR=10.0.0.20         # 新增此行，配置静态IP
NETMASK=255.255.255.0    # 新增此行，配置子网掩码
DNS1=10.0.0.2            # 新增此行，添加内网DNS解析
DNS2=1.2.4.8             # 新增此行，添加外网DNS解析
```

重启网络服务

```bash
systemctl restart network
```

### 3.2 解决设置静态 IP 后 SSH 登录过慢问题

修改 ssh 配置文件：

```bash
vi /etc/ssh/sshd_config
```

找到如下配置节点：

```properties
#UseDNS yes
```

修改为：

```properties
UseDNS no
```

重启 ssh 服务，使配置生效：

```bash
systemctl restart sshd
```

::: tip 快速修改

```bash
sed -i 's/#UseDNS yes/UseDNS no/g' /etc/ssh/sshd_config
systemctl restart sshd.service
```

:::

### 3.3 yum 源优化

将默认 yum 源改为国内 yum 源

```bash
# 备份
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak

# 下载阿里源
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

# 清理并重建缓存
yum clean all && yum makecache
```

添加 epel 源

```bash
# 查看系统是否已有 epel
rpm -qa | grep epel

# 如果有的话先卸载之前的 epel 以免受影响
rpm -e epel-release

# 下载阿里的 epel 源
curl -o /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo

# 清理并重建缓存
yum clean all && yum makecache
```

### 3.4 优化网络管理

```bash
systemctl stop NetworkManager
systemctl disable NetworkManager
```

> **相关文章**
>
> <a :href="$withBase('/2021/03/27/centos7-turn-off-selinux-firewall/')" target="_blank">CentOS7 关闭 selinux、防火墙</a>
>
> <a :href="$withBase('/2021/03/27/centos7-set-timezone-hostname-hosts/')" target="_blank">CentOS7 集群环境设置时区、主机名，配置 hosts 文件</a>

