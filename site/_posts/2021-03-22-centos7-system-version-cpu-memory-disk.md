---
title: 查看系统版本，CPU核数，内存、磁盘使用情况
---

# 查看系统版本，CPU核数，内存、磁盘使用情况

<post-meta date="2021-03-22" />

## 查看 CentOS 版本

```bash
cat /etc/redhat-release
```

## 查看 CPU 信息

```bash
lscpu
```

::: tip 查看 CPU 核数

总核数 = 物理CPU个数 X 每颗物理CPU的核数

总逻辑CPU数 = 物理CPU个数 X 每颗物理CPU的核数 X 超线程数

```bash
# 查看物理CPU个数
cat /proc/cpuinfo | grep "physical id" | sort | uniq | wc -l

# 查看每个物理CPU中core的个数（即核数）
cat /proc/cpuinfo | grep "cpu cores" | uniq

# 查看逻辑CPU的个数
cat /proc/cpuinfo | grep "processor" | wc -l
```

:::

## 实时查看进程，系统负载，CPU、内存使用情况

```bash
top
```

## 查看内存使用情况

```bash
free -h
```

## 查看磁盘使用情况

```bash
df -Th
```

## 查看文件大小、目录大小

```bash
du -sh /usr/bin/
```

## 查看 1 分钟，5 分钟，15 分钟系统平均负载

```bash
uptime
```

## 查看在线用户

```bash
who
```

## 其他常用命令

```bash
last  # 查看最近一段时间，谁操作过系统的重要指令
```

