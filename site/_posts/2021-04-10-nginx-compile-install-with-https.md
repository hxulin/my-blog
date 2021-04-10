---
title: Nginx 编译安装，支持 HTTPS
---

# Nginx 编译安装，支持 HTTPS

<post-meta date="2021-04-10" />

## 安装准备

- CentOS7 操作系统
- Nginx 1.16.1 源码包（nginx-1.16.1.tar.gz）

```bash
cat /etc/redhat-release  # CentOS Linux release 7.9.2009 (Core)
```

## 安装步骤

### 安装编译 Nginx 的基础依赖

```bash
yum -y install gcc pcre-devel openssl-devel
```

### 配置安装目录，添加 ssl 模块

```bash
./configure --prefix=/usr/local/nginx --with-http_ssl_module
```

### 编译安装 Nginx

```bash
make && make install
```

### 检查是否安装成功

```bash
ls /usr/local | grep nginx
```

### 查看指定的编译参数是否起作用

```bash
/usr/local/nginx/sbin/nginx -V
```

### 设置 Nginx 系统服务

```bash
cat << EOF > /usr/lib/systemd/system/nginx.service
[Unit]
Description=nginx service
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/nginx/sbin/nginx
ExecReload=/usr/local/nginx/sbin/nginx -s reload
ExecStop=/usr/local/nginx/sbin/nginx -s quit
PrivateTmp=true

[Install]
WantedBy=multi-user.target

EOF
```

### 刷新 systemctl 服务

```bash
systemctl daemon-reload
```

### 设置开机自启

```bash
systemctl enable nginx
```

### 使用 systemctl 管理 Nginx 服务

```bash
# 查看 nginx 运行状态
systemctl status nginx

# 启动 nginx
systemctl start nginx

# 关闭 nginx
systemctl stop nginx

# 重启 nginx
systemctl reload nginx
```

