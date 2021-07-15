# 一个 MySQL 存储过程的样例，备查

<post-meta date="2021-07-15" style="margin-bottom: 1rem" />

这是我在实际项目中遇到的一个数据库表升级变更的案例，以此为原型抽取出 <b>用户表，报告表，报告详情子项表</b> 三张表用于本文演示。

## 变更前

一个用户有一份报告，一份报告有多份报告子项。历史版本的数据表设计图如下：

<img :src="$page.baseUrl + 'assets/img/20210715/mysql-procedure-samples/physical-diagram-1.jpg'" alt="physical-diagram-1.jpg" style="margin-bottom: 1rem">

建表 SQL 及初始化测试数据：

```sql
/* 用户表 */
create table t_user
(
   id                   bigint primary key comment '用户ID',
   username             varchar(50) comment '用户名'
) comment '用户表';
```

```sql
/* 报告表 */
create table t_report
(
   id                   bigint primary key comment '报告ID',
   user_id              bigint comment '用户ID',
   content              varchar(255) comment '报告内容'
) comment '报告表';
```

```sql
/* 报告子项表 */
create table t_report_item
(
   id                   bigint primary key comment '报告子项ID',
   user_id              bigint comment '用户ID',
   item_content         varchar(255) comment '报告子项内容'
) comment '报告子项表';
```

```sql
/* 初始化数据 */
insert into t_user(id, username) VALUES (1, 'zhangsan'), (2, 'lisi');
insert into t_report(id, user_id, content) VALUES (1, 1, 'zhangsan report'), (2, 2, 'lisi report');
insert into t_report_item(id, user_id, item_content) VALUES (1, 1, 'zhangsan report item1'), (2, 1, 'zhangsan report item2'), (3, 2, 'lisi report item1'), (4, 2, 'lisi report item2');
```

以上的关联设计可能不合理，但历史数据表就是如此完成了早期的需求。

## 变更后

一个用户可以有多份报告，一份报告有多份报告子项。<b>此时报告子项直接关联用户将不知道它是属于哪份报告，会造成混淆，</b>因此修改设计如下：

<img :src="$page.baseUrl + 'assets/img/20210715/mysql-procedure-samples/physical-diagram-2.jpg'" alt="physical-diagram-2.jpg">

从上图可以看出，变更前后需要转换表结构之间的依赖关系，并且需要维护历史数据关系，这里的存储过程就是用于刷历史数据关系的。

```sql
/* 更新表结构 */
alter table t_report_item add column report_id bigint after id;
```

```sql
/* 使用存储过程刷新历史数据 */
DROP PROCEDURE IF EXISTS hxl_update_data;
DELIMITER$$
CREATE PROCEDURE hxl_update_data() BEGIN
DECLARE i INT DEFAULT 0;
DECLARE cnt INT DEFAULT 0;
DECLARE _id INT DEFAULT 0;
DECLARE _user_id INT DEFAULT 0;
SELECT COUNT(1) INTO cnt FROM t_report_item;
WHILE i < cnt DO
  SELECT id, user_id INTO _id, _user_id FROM t_report_item ORDER BY id LIMIT i, 1;
  SET @report_id = 0;
  SET @sql_str = CONCAT('SELECT id INTO @report_id FROM t_report WHERE user_id = ', _user_id, ' LIMIT 1');
  PREPARE stmt FROM @sql_str;
  EXECUTE stmt;
  IF @report_id != 0 THEN
	UPDATE t_report_item SET report_id = @report_id WHERE id = _id;
  END IF;
  SET i = i + 1;
END WHILE;
COMMIT;
END$$
DELIMITER ;
CALL hxl_update_data();
DROP PROCEDURE IF EXISTS hxl_update_data;
```

