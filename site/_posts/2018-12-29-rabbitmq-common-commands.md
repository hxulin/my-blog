---
title: RabbitMQ常用命令总结
---

# RabbitMQ常用命令总结

<post-meta date="2018-12-29" />

## 虚拟机相关命令

```bash
rabbitmqctl add_vhost {vhost_name}     # 添加虚拟机
rabbitmqctl delete_vhost {vhost_name}  # 删除虚拟机

rabbitmqctl list_vhosts  # 查看虚拟机列表
```

## 用户管理

```bash
rabbitmqctl add_user {username} {password}  # 添加用户
rabbitmqctl delete_user {username}          # 删除用户
rabbitmqctl change_password {username} {new_password}  # 修改密码

# tag可以为administrator, monitoring, management
rabbitmqctl set_user_tags {username} {tag ...}         # 设置用户角色
```

## 权限管理

```bash
# 设置访问权限，后面三个.*分别代表：配置权限、写权限、读权限
rabbitmqctl set_permissions -p {vhost_name} {username} ".*" ".*" ".*"
```

## 服务器相关命令

```bash
service rabbitmq-server restart  # 重启服务

service rabbitmq-server stop     # 停止服务
service rabbitmq-server start    # 启动服务
```

## 队列相关命令

```bash
rabbitmqctl list_queues                  # 查看"/"虚拟机的队列信息
rabbitmqctl list_queues -p {vhost_name}  # 查看指定虚拟机的队列信息

rabbitmqctl purge_queue {queue_name} -p {vhost_name}  # 清空指定队列的数据
```

（完）