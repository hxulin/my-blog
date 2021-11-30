# 逻辑删除和唯一索引

<post-meta date="2021-11-29" />

## 1、背景

数据唯一性校验是日常开发中非常常见的一个需求，比如：<b>注册的用户名不能重复</b>。

在中小型项目（未分库分表）中，唯一索引是解决这类问题非常有效的一个方案。

以 MySQL 为例，建表语句如下：

```sql
create table sys_user
(
    id                   bigint not null auto_increment comment '主键',
    username             varchar(100) comment '用户名',
    create_time          datetime default current_timestamp comment '创建时间',
    update_time          datetime default current_timestamp on update current_timestamp comment '更新时间',
    primary key (id),
    unique key uk_username (username)
) comment '用户表';
```

第一次插入数据：

```sql
insert into sys_user(username) values('foo');
```

> insert into sys_user(username) values('foo')
>
> Affected rows: 1
>
> 时间: 0.002s

再次执行上面的语句，插入用户名为 foo 的数据将会被唯一索引限制，插入失败：

> insert into sys_user(username) values('foo')
>
> 1062 - Duplicate entry 'foo' for key 'uk_username'
>
> 时间: 0.002s

使用唯一索引来校验数据有如下一些明显的优势：

- 降低了业务代码的复杂度

- 在并发场景下始终能保证数据校验的可靠性

## 2、问题演进，逻辑删除的引入

现在的很多系统中，一般不会轻易删除数据库的数据，而是通过引入删除标记字段的方式进行标记删除，即通常所说的逻辑删除。

给 sys_user 表添加删除标记字段 deleted：

```sql
alter table sys_user add column deleted bit default 0 comment '删除标识（0存在，1删除）' after username;
```

此时逻辑删除 foo 用户：

```sql
update sys_user set deleted = 1 where username = 'foo' and deleted = 0;
```

<font color="red"><b>此时从业务角度考虑，foo 用户已被删除，应该可以新注册同名的 foo 用户了；</b></font>

<font color="red"><b>但从数据库索引角度思考，此时还是插入不了新的 foo 用户。</b></font>

<b>引出的问题就是逻辑删除和唯一索引冲突了。</b>

## 3、联合索引方案

分析已删除的表记录和即将要插入的表记录区别：

| 已删除的 foo 用户           | 需要新插入的 foo 用户       |
| --------------------------- | --------------------------- |
| username: foo<br>deleted: 1 | username: foo<br>deleted: 0 |

从业务上，以上两种记录是合法的，不应该被唯一索引限制。

由此很容易想到使用联合索引来解决这个问题：

```sql
-- 删除原索引
drop index uk_username on sys_user;

-- 添加联合索引
alter table sys_user add unique index uk_username_deleted(username, deleted);
```

此时，新增 -> 删除 -> 再新增已经可以解决了。（小进步）🎉

```sql
-- 清理测试数据
truncate table sys_user;

-- 新增用户
insert into sys_user(username) values('foo');

-- 删除用户
update sys_user set deleted = 1 where username = 'foo' and deleted = 0;

-- 再新增用户
insert into sys_user(username) values('foo');
```

查询表数据：

```
+----+----------+---------+---------------------+---------------------+
| id | username | deleted | create_time         | update_time         |
+----+----------+---------+---------------------+---------------------+
|  1 | foo      | 1       | 2021-11-29 23:16:28 | 2021-11-29 23:16:33 |
|  2 | foo      | 0       | 2021-11-29 23:16:37 | 2021-11-29 23:16:37 |
+----+----------+---------+---------------------+---------------------+
```

但是，再删除又会冲突了。

> 第二次删除 foo 用户会出现两条 username = foo，deleted = 1 的记录，违背了联合索引的约束。

## 4、联合索引方案优化

从上面的方案可以看出，要保证逻辑删除和唯一索引不冲突，同一个用户，就需要保证每一次删除的删除标识不重复。

:::tip 我的方案

将逻辑删除字段 deleted 改为和主键 id 字段类型一致；

deleted 为 0 表示该条记录存在，deleted 非 0（等于主键 id）表示该条记录已被删除。

:::

```sql
-- 修改字段类型，bit -> bigint
alter table sys_user modify column deleted bigint default 0 comment '删除标识（0存在，非0删除）';

-- 清洗历史已删除的数据
update sys_user set deleted = id where deleted = 1;
```

最终，逻辑删除 foo 用户的 SQL 如下：

```sql
update sys_user set deleted = id where username = 'foo' and deleted = 0;
```

至此，多次执行增删操作，可验证完美解决了逻辑删除和唯一索引的冲突问题。🎉🎉🎉

```
+----+----------+---------+---------------------+---------------------+
| id | username | deleted | create_time         | update_time         |
+----+----------+---------+---------------------+---------------------+
|  1 | foo      |       1 | 2021-11-29 23:16:28 | 2021-11-29 23:16:33 |
|  2 | foo      |       2 | 2021-11-29 23:16:37 | 2021-11-29 23:25:28 |
|  3 | foo      |       3 | 2021-11-29 23:27:02 | 2021-11-29 23:27:07 |
|  4 | foo      |       4 | 2021-11-29 23:27:08 | 2021-11-29 23:27:10 |
|  5 | foo      |       0 | 2021-11-29 23:27:12 | 2021-11-29 23:27:12 |
+----+----------+---------+---------------------+---------------------+
```

## 5、拓展

MySQL 唯一索引的字段长度是有限制的，如果对于大字段需要做唯一索引，可以考虑使用一列附加列，用于存储大字段的 MD5 值，然后对 MD5 值的列增加唯一索引。

