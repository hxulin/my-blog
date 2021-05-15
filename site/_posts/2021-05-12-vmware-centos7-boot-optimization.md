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
ONBOOT=no                # 改为 yes
GATEWAY=192.168.30.2     # 新增此行
IPADDR=192.168.30.100    # 新增此行
NETMASK=255.255.255.0    # 新增此行
DNS1=192.168.30.2        # 新增此行，添加内网DNS解析
DNS2=1.2.4.8             # 新增此行，添加外网DNS解析
```

重启网络服务

```bash
systemctl restart network
```

### 3.2 yum 源优化

将默认 yum 源改为国内 yum 源

```bash
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
```

```bash
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```

```bash
curl -o /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
```

清空并建立缓存

```bash
yum clean all && yum makecache
```

### 3.3 优化网络管理

```bash
systemctl stop NetworkManager
systemctl disable NetworkManager
```

> **相关文章**
>
> <a :href="$withBase('/2021/03/27/centos7-turn-off-selinux-firewall/')" target="_blank">CentOS7 关闭 selinux、防火墙</a>
>
> <a :href="$withBase('/2021/03/27/centos7-set-timezone-hostname-hosts/')" target="_blank">CentOS7 集群环境设置时区、主机名，配置 hosts 文件</a>

