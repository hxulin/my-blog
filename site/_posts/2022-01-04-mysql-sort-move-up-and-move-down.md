# MySQL 中自定义排序，上移、下移功能的设计

<post-meta date="2022-01-04" />

## 1、背景

指定数据列表的排序顺序、上移下移、指定位置插入是日常开发中一些比较常见的需求，比如：<b>支付宝中用户扣款银行卡的先后顺序，QQ 好友分组的按序展示、上移下移调整</b>。

本文以一个用户表为例，假定用户的展示顺序有严格要求，并且支持上移下移自定义调整。

探讨在 MySQL 中设计和实现该功能，建表语句如下：

```sql
create table sys_user
(
    id                   bigint not null auto_increment comment '主键',
    username             varchar(100) not null comment '用户名',
    sort                 bigint not null comment '排序字段',
    deleted              bigint not null default 0 comment '删除标识（0存在，非0删除）',
    create_time          datetime default current_timestamp comment '创建时间',
    update_time          datetime default current_timestamp on update current_timestamp comment '更新时间',
    primary key (id),
    unique key uk_username (username, deleted)
) comment '用户表';
```

其中的 sort 字段为排序字段，预定最小值为 1，按 sort 降序排序；deleted 为逻辑删除字段。

## 2、初始化数据

```sql
insert into sys_user(id, username, sort) values (1, 'zhangsan', 1);
insert into sys_user(id, username, sort) values (2, 'lisi', 2);
```

```sql
SELECT * FROM sys_user order by sort desc
```

## 3、删除数据，逻辑删除

```sql
update sys_user set deleted = 1 where id = #{id}
```

## 4、插入数据

### 4.1 不指定排序位置插入数据（默认）

```sql
insert into sys_user(username, sort)
select 'wangwu', (select ifnull(max(sort), 0) + 1 from sys_user where deleted = 0)
```

### 4.2 指定排序位置插入数据

新增时指定插入到 sort = 2021 的位置

**step1：原有数据调整顺序，sort >= 2001 的数据项 sort 加一**

```sql
update sys_user
set sort = sort + 1
where sort >= 2021
  and deleted = 0
```

**step2：将新的数据插入到 sort = 2001 的位置上**

```sql
insert into sys_user(username, sort)
select 'zhaoliu', (select least(2021, (select ifnull(max(sort), 0) + 1 from sys_user where deleted = 0)))
```

> 如果表中排序最大值未达到 2021，将取表中最大排序值加 1

### 4.3 插入语句在 MyBatis 中合并处理

```xml
insert into sys_user(username, sort)
select 'zhangsan',
<choose>
    <when test="sort != null and sort > 0">
        (select least(#{sort}, (select ifnull(max(sort), 0) + 1 from sys_user where deleted = 0)))
    </when>
    <otherwise>
        (select ifnull(max(sort), 0) + 1 from sys_user where deleted = 0)
    </otherwise>
</choose>
```

## 5、上移下移功能

### 5.1 上移

**step1：根据当前数据行 ID 查询上一条有效记录的 ID**

```sql
select id
from sys_user
where sort > (select sort from sys_user where id = #{id})
  and deleted = 0
  order by sort
  limit 1
```

**step2：使用自连接交换两条数据的 sort**

```sql
update sys_user t1
join sys_user t2
on (t1.id = #{oneId} and t2.id = #{otherId}) or (t1.id = #{otherId} and t2.id = #{oneId})
set t1.sort = t2.sort,
t2.sort = t1.sort
```

### 5.2 下移

**step1：根据当前数据行 ID 查询下一条有效记录的 ID**

```sql
select id
from sys_user
where sort < (select sort from sys_user where id = #{id})
  and deleted = 0
  order by sort desc
  limit 1
```

**step2：使用自连接交换两条数据的 sort（附带更新 updateUid 字段）**

```sql
update sys_user t1
join sys_user t2
on (t1.id = #{oneId} and t2.id = #{otherId}) or (t1.id = #{otherId} and t2.id = #{oneId})
set t1.sort = t2.sort,
t1.update_uid = #{updateUid},
t2.sort = t1.sort,
t2.update_uid = #{updateUid}
```

