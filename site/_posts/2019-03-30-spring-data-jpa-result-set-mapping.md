---
title: Spring Data JPA使用原生SQL做复杂查询，结果封装到自定义实体
---

# Spring Data JPA使用原生SQL做复杂查询，结果封装到自定义实体

<post-meta date="2019-03-30" style="margin-bottom: 1rem" />

最近工作中使用到 `Spring Data JPA` 做持久层框架，个人感觉这个框架在做常规的查询时非常方便，在做定制化的高级查询时不够灵活。尤其是处理结果集的映射没有 `MyBatis` 方便。

>**本文概要：**
>
>**1、spring-data-jpa 提供的 @Query 注解可以执行原生 SQL，其返回类型为 List<Object[]>**
>
>**<font color="red">2、优雅地将 `List<Object[]>` 映射到我们自定义的实体中</font>**
>
>**3、使用到的知识点：自定义注解、反射**

## 直接上代码

> **说明：** 此处的案例比较简单，只是为了演示此方案，复杂的查询使用方法一样。

### 实体类

```java
@Entity
public class User {
    @Id
    private Integer id;
    private String username;
    private String name;
    private Integer age;
    private BigDecimal balance;
    // getter、setter...
}
```

### VO 对象

```java
import cn.huangxulin.jpa.utils.vo.Sign;

import java.math.BigDecimal;

/**
 * 功能描述:
 *
 * @author hxulin
 */
public class UserVO {
    private Integer id;
    private String username;
    private String name;
    private Integer age;
    private BigDecimal balance;

    @Sign
    public UserVO(Integer id, String username, String name, Integer age, BigDecimal balance) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.age = age;
        this.balance = balance;
    }

    @Sign(1)
    public UserVO(Integer id, String username) {
        this.id = id;
        this.username = username;
    }

    @Sign(2)
    public UserVO(String name, BigDecimal balance) {
        this.name = name;
        this.balance = balance;
    }
    
    // getter、setter...
}
```

> @Sign 注解用于区分不同的构造器。后面使用到 `ModelMap.mapping(List<Object[]> list, Class<T> clazz, int sign)` 方法做结果集映射，第三个参数 sign 传入此处注解定义的值。

> **<font color="red">注意点：</font>**
>
> 1、**VO 对象构造器中的参数类型、数量和数据库查询结果集的类型、列数一定要保持一致。** 参数名称和列名可以不同。
>
> 2、**自定义实体类 VO 的字段尽量使用包装类型（Integer、Long...），不使用基本类型（int、long...）**。当数据库查询的字段为 NULL 时，映射到 int、long 等基本类型会报错。

### DAO 层 JPA 处理接口

```java
public interface UserRepository extends JpaRepository<User, Integer> {

    @Query(value = "SELECT * FROM user", nativeQuery = true)
    List<Object[]> query();

    @Query(value = "SELECT id, username FROM user", nativeQuery = true)
    List<Object[]> query1();

    @Query(value = "SELECT name, balance FROM user", nativeQuery = true)
    List<Object[]> query2();

}
```

此处直接调用 `JPA` 接口方法，将会返回 `List<Object[]>` 类型，格式如下，非常不方便我们进行数据处理。

<img :src="$page.baseUrl + 'assets/img/20190330/spring-data-jpa-result-set-mapping/list-object-log.png'" alt="list-object-log.png">

### Service 层方法

```java
public List<UserVO> query() {
    List<Object[]> list = userRepository.query();
    return ModelMap.mapping(list, UserVO.class);
}

public List<UserVO> query1() {
    List<Object[]> list = userRepository.query1();
    // 第三个参数 1 和 @Sign 注解标记在 UserVO 构造器上的值对应
    return ModelMap.mapping(list, UserVO.class, 1);
}

public List<UserVO> query2() {
    List<Object[]> list = userRepository.query2();
    // 第三个参数 2 和 @Sign 注解标记在 UserVO 构造器上的值对应
    return ModelMap.mapping(list, UserVO.class, 2);
}
```

### 测试类

```java
@Test
public void testQuery() {
    List<UserVO> result = userService.query2();
    String json = JSONUtils.toJson(result);
    logger.info(json);
}
```

<img :src="$page.baseUrl + 'assets/img/20190330/spring-data-jpa-result-set-mapping/test-result.png'" alt="test-result.png">

<center>根据构造器的自定义参数映射后的结果</center>

## 实现数据映射的两个核心类

### `@Sign` 注解：标记构造器，区分不同的结果集映射

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 功能描述: 自定义标记注解，贴在VO的构造器上，用于JPA查询结果的封装
 *
 * @author hxulin
 */
@Target(ElementType.CONSTRUCTOR)
@Retention(RetentionPolicy.RUNTIME)
public @interface Sign {
    int value() default 0;
}
```

### `ModelMap`：完成结果集映射

```java
import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.List;

/**
 * 功能描述: JPA查询结果映射工具类
 *
 * @author hxulin
 */
public final class ModelMap {

    private ModelMap() {

    }

    /**
     * 说明: 将JPA查询的List<Object[]>结果集封装到自定义对象中
     *
     * @param list 待处理数据
     * @param clazz 待映射对象类型，该对象的构造方法需要结合@Sign注解使用
     * @param sign 待映射对象构造器上的注解值，用于匹配不同的结果集映射
     * @param <T> 待映射对象泛型
     * @return 映射后的结果集
     *
     */
    @SuppressWarnings("unchecked")
    public static <T> List<T> mapping(List<Object[]> list, Class<T> clazz, int sign) {
        if (list != null) {
            Constructor<?>[] constructors = clazz.getConstructors();
            for (Constructor<?> constructor : constructors) {
                if (constructor.isAnnotationPresent(Sign.class)) {
                    if (sign == constructor.getAnnotation(Sign.class).value()) {
                        List<Object> result = new ArrayList<>(list.size());
                        try {
                            for (Object[] data : list) {
                                result.add(constructor.newInstance(data));
                            }
                            return (List<T>) result;
                        } catch (Exception e) {
                            throw new RuntimeException(e);
                        }
                    }
                }
            }
            throw new RuntimeException("\"" + clazz.getName() + "\" constructor need use annotation \"" + Sign.class.getName() + "\"");
        }
        return null;
    }
    
    /**
     * 说明: 将JPA查询的List<Object[]>结果集封装到自定义对象中
     *      为默认的注解值提供一个便捷的方法，不用传递注解参数0
     */
    public static <T> List<T> mapping(List<Object[]> list, Class<T> clazz) {
        return mapping(list, clazz, 0);
    }

}
```

完整项目地址：[https://github.com/hxulin/whampoa/tree/master/spring-data-jpa](https://github.com/hxulin/whampoa/tree/master/spring-data-jpa)

参考文档：

> [Spring Data Jpa框架自定义查询语句返回自定义实体的解决方案](https://blog.csdn.net/pp_fzp/article/details/80530588)
>
> [Spring Data JPA 查询结果返回至自定义实体](https://blog.csdn.net/liuyunyihao/article/details/81106799)

（完）

