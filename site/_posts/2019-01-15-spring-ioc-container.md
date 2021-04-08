---
title: Spring IoC容器
---

# Spring IoC容器

<post-meta date="2019-01-15" style="margin-bottom: 1rem" />

Spring 最为核心的理念是 IoC（控制反转）和 AOP（面向切面编程），其中 IoC 是 Spring 的基础。

本文我们将要讨论的是 Spring 的 IoC 容器，Spring IoC 容器可以容纳我们所开发的各种 Bean，并且我们可以通过描述获取各种发布在 Spring IoC 容器里的 Bean。

## Spring IoC容器的设计

&nbsp;<font color="red">Spring IoC 容器的设计主要是基于 BeanFactory 和 ApplicationContext 两个接口，其中 ApplicationContext 是 BeanFactory 的子接口之一</font>，换句话说 BeanFactory 是 Spring IoC 容器所定义的最底层接口，而 ApplicationContext 是其高级接口之一，并且对 BeanFactory 功能做了许多有用的扩展，所以在绝大部分的工作场景下，都会使用 ApplicationContext 作为 Spring IoC 容器。下图展示了 Spring 相关的 IoC 容器接口的主要设计。

<img :src="$withBase('/assets/img/20190115/spring-ioc-container/spring-ioc-interface.png')" alt="spring-ioc-interface.png">

<center style="margin: .5rem 0 1rem">Spring IoC 容器接口的设计</center>

从这张设计图中我们可以看到 BeanFactory 位于设计的最底层，它提供了 Spring IoC 最底层的设计，为此我们先看看它的源码：
```java
/**
 * Spring Version: 5.1.3.RELEASE
 */
public interface BeanFactory {

	String FACTORY_BEAN_PREFIX = "&";

	Object getBean(String name) throws BeansException;

	<T> T getBean(String name, Class<T> requiredType) throws BeansException;

	/**
	 * @since 2.5
	 */
	Object getBean(String name, Object... args) throws BeansException;

	/**
	 * @since 3.0
	 */
	<T> T getBean(Class<T> requiredType) throws BeansException;

	/**
	 * @since 4.1
	 */
	<T> T getBean(Class<T> requiredType, Object... args) throws BeansException;

	/**
	 * @since 5.1
	 */
	<T> ObjectProvider<T> getBeanProvider(Class<T> requiredType);

	/**
	 * @since 5.1
	 */
	<T> ObjectProvider<T> getBeanProvider(ResolvableType requiredType);

	boolean containsBean(String name);

	boolean isSingleton(String name) throws NoSuchBeanDefinitionException;

	/**
	 * @since 2.0.3
	 */
	boolean isPrototype(String name) throws NoSuchBeanDefinitionException;

	/**
	 * @since 4.2
	 */
	boolean isTypeMatch(String name, ResolvableType typeToMatch) throws NoSuchBeanDefinitionException;

	/**
	 * @since 2.0.1
	 */
	boolean isTypeMatch(String name, Class<?> typeToMatch) throws NoSuchBeanDefinitionException;

	/**
	 * @since 1.1.2
	 */
	@Nullable
	Class<?> getType(String name) throws NoSuchBeanDefinitionException;

	String[] getAliases(String name);

}
```

- getBean 的多个方法用于获取配置给 Spring IoC 容器的 Bean。从参数类型看可以是字符串，也可以是 Class 类型，由于 Class 类型可以扩展接口也可以继承父类，所以在一定程度上会存在使用父类类型无法准确获得实例的异常，比如获取学生类，但是学生子类有男学生和女学生两类，这个时候通过学生类就无法从容器中得到实例，因为容器无法判断具体的实现类。
- isSingleton 用于判断是否单例，如果判断为真，其意思是该 Bean 在容器中是作为一个唯一单例存在的。而 isPrototype 则相反，如果判断为真，意思是当你从容器中获取Bean，容器就为你生成了个新的实例。<font color="red">在默认情况下，Spring 会为 Bean 创建一个单例</font>，也就是默认情况下 isSingleton 返回 true，而 isPrototype 返回 false。
- 关于 type 的匹配，这是一个按 Java 类型匹配的方式。
- getAliases 方法是获取别名的方法。

这就是 Spring IoC 最底层的设计，所有关于 Spring IoC 的容器将会遵循它所定义的方法。

从 <a :href="$withBase('/assets/img/20190115/spring-ioc-container/spring-ioc-interface.png')" target="_blank">IoC 容器接口的设计图</a> 中可以看到，为了扩展更多的功能，ApplicationContext 接口扩展了许许多多的接口，因此它的功能十分强大，而 WebApplicationContext 也扩展了它，在实际应用中常常使用的是 ApplicationContext 接口，因为 BeanFactory 的方法和功能较少。具体的 ApplicationContext 的实现类会使用在某一个领域，比如 Spring MVC 的 GenericWebApplicationContext，就广泛使用于 Java Web 工程中。 


## ClassPathXmlApplicationContext

**案例：** 使用 ApplicationContext 的实现类 <font color="red">**ClassPathXmlApplicationContext**</font> 初始化 Spring IoC 容器，并从 IoC 容器中获取资源。 

```java
ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
Person p = ctx.getBean("person", Person.class);
System.out.println(p);
```


## Spring IoC容器的初始化和依赖注入

Bean 的定义和初始化在 Spring IoC 容器中分为两大步骤，它是先定义，然后初始化和依赖注入。

Bean 的定义分为3步：

（1）Resource 定位，这步是 Spring IoC 容器根据开发者的配置，进行资源定位，在 Spring 的开发中，通过 XML 或者注解都是十分常见的方式，定位的内容是由开发者所提供的。

（2）BeanDefinition 的载入，这个时候只是将 Resource 定位到的信息，保存到 Bean 定义（BeanDefinition）中，此时并不会创建 Bean 的实例。

（3）BeanDefinition 的注册，这个过程就是将 BeanDefinition 的信息发布到 Spring IoC 容器中，注意，此时仍旧没有对应的 Bean 的实例创建。

做完了这3步，Bean 就在 Spring IoC 容器中被定义了，而没有被初始化，更没有完成依赖注入，也就是没有注入其配置的资源给 Bean，那么它还不能完全使用。对于初始化和依赖注入，Spring Bean 还有一个配置选项 —— lazy-init，其含义就是是否初始化 Spring Bean。在没有任何配置的情况下，它的默认值为 default，实际值为 false，也就是 <font color="red">~~Spring IoC 默认会自动初始化 Bean~~</font> 。如果将其设置为 tue，那么只有当我们使用 Spring IoC 容器的 getBean 方法获取它时，它才会进行初始化，完成依赖注入。

> <font color="red">**读书批注：**</font>
>
> **使用 BeanFactory 创建的 IoC 容器有延迟初始化（懒：lazy）的特点，创建容器的时候，不会立刻创建容器中管理的 Bean 对象，而是要等到从容器中去获取对象的时候，才会创建对象。**
>
> **使用 ApplicationContext 创建 IoC 容器的时候，会把容器中管理的 Bean 立即初始化，而不会等到获取 Bean 的时候才去初始化。**

## Spring Bean的生命周期

Spring IoC 容器的本质目的就是为了管理 Bean。对于 Bean 而言，在容器中存在其生命周期，它的初始化和销毁也需要一个过程，在一些需要自定义的过程中，我们可以插入代码去改变它们的一些行为，以满足特定的需求，这就需要使用到 Spring Bean 生命周期的知识了。

生命周期主要是为了了解 Spring IoC 容器初始化和销毁 Bean 的过程，通过对它的学习就可以知道如何在初始化和销毁的时候加入自定义的方法，以满足特定的需求。

<img :src="$withBase('/assets/img/20190115/spring-ioc-container/bean-life-cycle.png')" alt="bean-life-cycle.png">

<center style="margin-top: .3rem">Bean 的生命周期</center>


> <font color="red">**读书批注：**</font>
>
> **Spring 只帮我们管理单例模式 Bean 的完整生命周期，对于 prototype 的 Bean ，Spring 在创建好交给使用者之后则不会再管理后续的生命周期。**

从图中可以看到，Spring IoC 容器对 Bean 的管理还是比较复杂的，Spring IoC 容器在执行了初始化和依赖注入后，会执行一定的步骤来完成初始化，通过这些步骤我们就能自定义初始化，而在 Spring IoC 容器正常关闭的时候，它也会执行一定的步骤来关闭容器，释放资源。除需要了解整个生命周期的步骤外，还要知道这些生命周期的接口是针对什么而言的，首先介绍生命周期的步骤。

- 如果 Bean 实现了接口 BeanNameAware 的 setBeanName 方法，那么它就会调用这个方法。

- 如果 Bean 实现了接口 BeanFactoryAware 的 setBeanFactory 方法，那么它就会调用这个方法。

- 如果 Bean 实现了接口 **<font color="red">ApplicationContextAware</font>** 的 setApplicationContext 方法，且 Spring IoC 容器也必须是一个 ApplicationContext 接口的实现类，那么才会调用这个方法，否则是不调用的。

- 如果Bean实现了接口 BeanPostProccssor 的 postProcessBeforelnitialization 方法，那么它就会调用这个方法。

- 如果 Bean 实现了接口 BeanFactoryPostProcessor 的 afterPropertiesSet 方法，那么它就会调用这个方法。

- 如果 Bean 自定义了初始化方法，它就会调用已定义的初始化方法。

- 如果 Bean 实现了接口 BeanPostProcessor 的 postProcessAfterlnitialization 方法，完成了这些调用，这个时候 Bean 就完成了初始化，那么 Bean 就生存在 Spring IoC 的容器中了，使用者就可以从中获取 Bean 的服务。

当服务器正常关闭，或者遇到其他关闭 Spring IoC 容器的事件，它就会调用对应的方法完成 Bean 的销毁，其步骤如下:

- 如果 Bean 实现了接口 DisposableBean 的 destroy 方法，那么就会调用它。

- 如果定义了自定义销毁方法，那么就会调用它。



注意 <a :href="$withBase('/assets/img/20190115/spring-ioc-container/bean-life-cycle.png')" target="_blank">Bean 生命周期图</a> 中的注释文字，因为有些步骤是在一些条件下才会执行的，如果不注意这些，往往就发现明明实现了一些接口，但是该方法并没有被执行。上面的步骤结合 <a :href="$withBase('/assets/img/20190115/spring-ioc-container/spring-ioc-interface.png')" target="_blank">IoC 容器接口的设计图</a> 看，就会发现所有的 Spring IoC 容器最低的要求是实现 BeanFactory 接口而己，而非 ApplicationContext 接口，<font color="red">如果采用了非 ApplicationContext 子类创建 Spring IoC 容器，那么即使是实现了 ApplicationContextAware 的 setApplicationContext 方法，它也不会在生命周期之中被调用。</font>

此外，还要注意这些接口是针对什么而言的，上述生命周期的接口，大部分是针对单个 Bean 而言的；BeanPostProcessor 接口则是针对所有 Bean 而言的。当一个 Bean 实现了上述的接口，我们只需要在 Spring IoC 容器中定义它就可以了，Spring IoC 容器会自动识别，并且按照 <a :href="$withBase('/assets/img/20190115/spring-ioc-container/bean-life-cycle.png')" target="_blank">Bean 生命周期图</a> 的顺序执行。

---
本文是个人读书笔记，整理自：[Java EE互联网轻量级框架整合开发](https://book.douban.com/subject/27090950/)，相关测试代码见：[Spring 练习第 4 小节](https://github.com/hxulin/whampoa/tree/master/spring#4spring-bean-%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)
关于 Spring Bean 生命周期的介绍，这里再推荐一篇文章：[Spring Bean 生命周期](https://github.com/crossoverJie/JCSprout/blob/master/MD/spring/spring-bean-lifecycle.md)


（完）

