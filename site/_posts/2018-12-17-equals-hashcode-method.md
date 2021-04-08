---
title: Java 中的 equals() 和 hashCode() 方法
---

# Java 中的 equals() 和 hashCode() 方法

<post-meta date="2018-12-17" style="margin-bottom: 1rem" />

Java语言有一个重要的理念：万物皆对象。本文我们将要探讨的是，每一个对象中都存在的 equals 和 hashCode 方法。

下图是 JDK 中顶级父类 Object 的结构图，从图中我们可以看到 Object 类为子类提供了可访问的 equals 和 hashCode 方法。

<img :src="$withBase('/assets/img/20181217/equals-hashcode-method/object-structure.png')" alt="object-structure.png" style="margin-bottom: .3rem">

Object 类的结构图

## equals 方法

**equals 方法用来判断其他对象是否和该对象相等。**

在 Object 中的源码如下：

```java
/**
 * Object 类的 equals 方法
 */
public boolean equals(Object obj) {
    return (this == obj);
}
```

在这里，Object 类给出了最简单的实现，比较两个对象的内存地址是否相等。两个对象的内存地址相等，则是同一个对象，当然也是相等的。

在实际的业务场景中，我们需要比较的往往是两个对象是否 <font color="red">逻辑相等</font>，例如：比较字符串时，我们更关心的是两个字符串的内容是否相同。因此 JDK 中对 String 类的 equals 方法做了相关的重写。

```java
/**
 * String 类的 equals 方法
 */
public boolean equals(Object anObject) {
    if (this == anObject) {
        return true;
    }
    if (anObject instanceof String) {
        String anotherString = (String)anObject;
        int n = value.length;
        if (n == anotherString.value.length) {
            char v1[] = value;
            char v2[] = anotherString.value;
            int i = 0;
            while (n-- != 0) {
                if (v1[i] != v2[i])
                    return false;
                i++;
            }
            return true;
        }
    }
    return false;
}
```

## equals 方法的性质

> - 自反性（reflexive）：对于任何非空引用值 x，x.equals(x) 都应返回 true。
> - 对称性（symmetric）：对于任何非空引用值 x 和 y，当且仅当 y.equals(x) 返回 true 时，x.equals(y) 才应返回 true。
> - 传递性（transitive）：对于任何非空引用值 x、y 和 z，如果 x.equals(y) 返回 true，并且 y.equals(z) 返回 true，那么 x.equals(z) 应返回 true。
> - 一致性（consistent）：对于任何非空引用值 x 和 y，多次调用 x.equals(y) 始终返回 true 或始终返回 false，前提是对象上 equals 比较中所用的信息没有被修改。
> - 对于任何非空引用值 x，x.equals(null) 都应返回 false。

## hashCode 方法

```java
/**
 * Object 类的 hashCode 方法
 */
public native int hashCode();
```

hashCode 方法是一个本地方法，底层通过一定的算法，为每一个对象计算一个 hash 值。

hashCode 方法也是用于判断对象相等的，两个因素决定了 hashCode() 和 equals() 应该结合使用：
**1、重写的 equals() 一般比较复杂，效率比较低；hashCode() 计算 hash 值效率比较高。**
**2、hashCode() 比较结果不完全可靠（存在哈希碰撞的可能）；equals() 比较的结果一定是准确的。**

<p style="color: red">hashCode() 不等对象一定不相等，hashCode() 相等对象不一定相等。</p>

因此我们在比较对象是否相等时是将 hashCode() 和 equals() 结合使用：
**1、首先比较 hashCode()，若 hashCode() 不同，表示两个对象不相等（不必使用 equals() 再比较）**
**2、如果 hashCode() 相同，再比较 equals() 是否相同，如果 equals() 也相同，表示两个对象确实相等。**

在 HashSet、HashMap 等散列结构中，hashCode() 尤为重要，这类数据结构都是通过 hashCode() 来查找对象在散列表中的位置的。

## hashCode 方法的常规协定

> - 在 Java 应用程序执行期间，在对同一对象多次调用 hashCode 方法时，必须一致地返回相同的整数，前提是将对象进行 equals 比较时所用的信息没有被修改。从某一应用程序的一次执行到同一应用程序的另一次执行，该整数无需保持一致。
> - 如果根据 equals(Object) 方法，两个对象是相等的，那么对这两个对象中的每个对象调用 hashCode 方法都必须生成相同的整数结果。
> - 如果根据 equals(java.lang.Object) 方法，两个对象不相等，那么对这两个对象中的任一对象上调用 hashCode 方法不要求一定生成不同的整数结果。但是，程序员应该意识到，为不相等的对象生成不同整数结果可以提高哈希表的性能。

## 重写 equals 和 hashCode 方法

重写时应当遵循 equals 方法的性质、hashCode 方法的常规协定，建议使用开发工具生成，Eclipse 和 IDEA 都可以一键生成。

## 小结

<font color="red">以下是我个人实践的一些见解。</font>

在开发中，我们应该重写实体类的  equals 和 hashCode 方法，重写有很多好处，其中一点就是方便我们利用HashSet、HashMap等散列结构的特性提高效率。

**实体类逻辑相等的依据一般是关联数据库主键的字段，即主键相同，对象相等。** 封装实体类时，可以封装一个基础实体类，其他实体类继承此类以简化代码：

```java
import java.io.Serializable;

/**
 * 基础实体类，封装了主键属性，重写了 hashCode 和 equals 方法，提供给子类继承
 */
public class BaseEntity implements Serializable {

	private static final long serialVersionUID = 5821534518845657338L;
	
	/**
	 * 对应数据库表的主键 id
	 * 一般认为主键相同，则对象相等
	 */
	protected String id;

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		BaseEntity other = (BaseEntity) obj;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		return true;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
	
}
```

参考文档：

>[Java Platform Standard Edition 6 API 规范](http://tool.oschina.net/apidocs/apidoc?api=jdk-zh)
>
>[面试官爱问的 equals 与 hashCode](https://juejin.im/post/5a4379d4f265da432003874c)
>
>[hashcode() 和 equals() 的作用、区别、联系](https://www.cnblogs.com/keyi/p/7119825.html)
>
>[在 Java 中正确地使用 equals() 和 hashCode() 方法](https://boxingp.github.io/blog/2015/02/24/use-equals-and-hashcode-methods-in-java-correctly/)

（完）
