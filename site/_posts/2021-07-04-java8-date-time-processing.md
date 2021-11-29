# Java8 之日期处理，工作必用

<post-meta date="2021-07-04" />

## 1、简介

Java 处理日期、日历和时间的方式一直为社区所诟病，将 java.util.Date 设定为可变类型，以及 SimpleDateFormat 的非线程安全使其应用非常受限。

伴随 lambda、streams 以及一系列的小优化，Java8 推出了全新的日期时间 API，不同于老版本，新 API 基于 ISO 标准日历系统，java.time 包下的所有类都是不可变类型且是线程安全的。

## 2、关键类

| 类名                                                         | 描述                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [Instant](https://www.matools.com/file/manual/jdk_api_1.8_google/java/time/Instant.html) | 在时间线上的瞬间点                                           |
| [Duration](https://www.matools.com/file/manual/jdk_api_1.8_google/java/time/Duration.html) | 基于时间的时间量（持续时间、时间差），如：34.5 秒            |
| [LocalDate](https://www.matools.com/file/manual/jdk_api_1.8_google/java/time/LocalDate.html) | 日期的描述，如：2007-12-03                                   |
| [LocalTime](https://www.matools.com/file/manual/jdk_api_1.8_google/java/time/LocalTime.html) | 时间的描述，如：10:15:30                                     |
| [LocalDateTime](https://www.matools.com/file/manual/jdk_api_1.8_google/java/time/LocalDateTime.html) | 日期和时间的描述，如：2007-12-03T10:15:30                    |
| [Period](https://www.matools.com/file/manual/jdk_api_1.8_google/java/time/Period.html) | ISO-8601日历系统中的日期时间，例如：2年3个月4天              |
| [ZoneOffset](https://www.matools.com/file/manual/jdk_api_1.8_google/java/time/ZoneOffset.html) | 与格林威治/ UTC的时区偏移量，如：+02:00                      |
| [ZonedDateTime](https://www.matools.com/file/manual/jdk_api_1.8_google/java/time/ZonedDateTime.html) | 具有时区的日期时间的不可变表示，如：2007-12-03T10:15:30+01:00 Europe/Paris |
| [Clock](https://www.matools.com/file/manual/jdk_api_1.8_google/java/time/Clock.html) | 使用时区提供对当前即时，日期和时间的访问的时钟               |
| [java.time.format.DateTimeFormatter](https://www.matools.com/file/manual/jdk_api_1.8_google/java/time/format/DateTimeFormatter.html) | 格式化器用于打印和解析日期时间对象                           |

## 3、实战

### 3.1 获取今天的日期

```java
public void getCurrentDate() {
    LocalDate today = LocalDate.now();
    System.out.println("Today's Local date: " + today);
}
```

> Today's Local date: 2021-07-04

### 3.2 获取年、月、日信息

LocalDate 提供了获取年、月、日的快捷方法，其实例还包含很多其他的日期属性。通过调用这些方法就可以很方便的得到需要的日期信息，不用像以前一样需要依赖 java.util.Calendar 类了。

```java
public void getDetailDate() {
    LocalDate today = LocalDate.now();
    int year = today.getYear();
    int month = today.getMonthValue();
    int day = today.getDayOfMonth();
    System.out.printf("Year: %d  Month: %d  day: %d", year, month, day);
}
```

> Year: 2021  Month: 7  day: 4

### 3.3 处理特定日期

我们通过静态工厂方法 `now()` 非常容易地创建了当天日期。我们还可以调用另一个有用的工厂方法 `LocalDate.of()` 创建任意日期， 该方法需要传入年、月、日做参数，返回对应的 LocalDate 实例。这个方法的好处是没再犯老 API 的设计错误，比如年度起始于 1900，月份是从 0 开始等等。日期所见即所得，就像下面这个例子表示了6月21日，直接明了。

```java
public void handleSpecificDate() {
    LocalDate dateOfBirth = LocalDate.of(2021, 6, 21);
    System.out.println("The specific date is: " + dateOfBirth);
}
```

> The specific date is: 2021-06-21

### 3.4 判断两个日期是否相等

LocalDate 重载了 equals 方法

```java
public void compareDate() {
    LocalDate today = LocalDate.now();
    LocalDate date1 = LocalDate.of(2021, 7, 4);
    if (date1.equals(today)) {
        System.out.printf("TODAY %s and DATE1 %s are same date%n", today, date1);
    }
}
```

> TODAY 2021-07-04 and DATE1 2021-07-04 are same date

### 3.5 检查像生日这种周期性事件

Java 中另一个日期时间的处理就是检查类似生日、纪念日、法定假日（如：国庆、春节）或者每个月固定时间发送邮件给客户这种周期性事件。

Java 中如何检查这些节日或其它周期性事件呢？答案就是 `MonthDay` 类。这个类组合了月份和日，去掉了年，这意味着你可以用它判断每年都会发生的事件。和这个类相似的还有一个 `YearMonth` 类。

```java
public void cycleDate() {
    LocalDate today = LocalDate.now();
    LocalDate dateOfBirth = LocalDate.of(2021, 6, 21);
    MonthDay birthday = MonthDay.of(dateOfBirth.getMonth(), dateOfBirth.getDayOfMonth());
    MonthDay currentMonthDay = MonthDay.from(today);
    if (currentMonthDay.equals(birthday)) {
        System.out.println("Many Many happy returns of the day!");
    } else {
        System.out.println("Sorry, today is not your birthday.");
    }
}
```

> Sorry, today is not your birthday.

### 3.6 获取当前时间

```java
public void getCurrentTime() {
    LocalTime time = LocalTime.now();
    System.out.println("local time now: " + time);
}
```

> local time now: 10:34:47.668

### 3.7 在现有的时间上增加小时

Java 8 提供了更好的 `plusHours()` 方法替换 `add()`，并且是兼容的。注意，这些方法返回一个全新的 LocalTime 实例，由于其不可变性，返回后一定要用变量赋值。

```java
public void plusHours() {
    LocalTime time = LocalTime.now();
    LocalTime newTime = time.plusHours(2);  // 增加两小时
    System.out.println("Time after 2 hours: " + newTime);
}
```

> Time after 2 hours: 12:39:11.459

### 3.8 计算一个星期之后的日期

LocalDate 日期不包含时间信息，它的 `plus()` 方法用来增加天、周、月，ChronoUnit 类声明了这些时间单位。

```java
public void nextWeek() {
    LocalDate today = LocalDate.now();
    LocalDate nextWeek = today.plus(1, ChronoUnit.WEEKS);
    System.out.println("Today is: " + today);
    System.out.println("Date after 1 week: " + nextWeek);
}
```

> Today is: 2021-07-04
>
> Date after 1 week: 2021-07-11

### 3.9 计算一年前或一年后的日期

```java
public void minusDate() {
    LocalDate today = LocalDate.now();
    LocalDate previousYear = today.minus(1, ChronoUnit.YEARS);
    System.out.println("Date before 1 year: " + previousYear);
    LocalDate nextYear = today.plus(1, ChronoUnit.YEARS);
    System.out.println("Date after 1 year: " + nextYear);
}
```

> Date before 1 year: 2020-07-04
>
> Date after 1 year: 2022-07-04

### 3.10 使用 Java 8 的 Clock 时钟类

Java 8 增加了一个 Clock 时钟类用于获取当时的时间戳，或当前时区下的日期时间信息。以前用到 `System.currentTimeInMillis()` 和 `TimeZone.getDefault()` 的地方都可用 Clock 替换。

```java
public void clock() {

    // 根据系统时间返回当前时间并设置为 UTC
    Clock clock = Clock.systemUTC();
    System.out.println("Clock: " + clock);

    // 根据系统时钟区域返回时间
    Clock defaultClock = Clock.systemDefaultZone();
    System.out.println("Clock: " + clock);
}
```

> Clock: SystemClock[Z]
>
> Clock: SystemClock[Z]

### 3.11 判断日期是早于还是晚于另一个日期

LocalDate 类有两类方法 `isBefore()` 和 `isAfter()` 用于比较日期。调用 `isBefore()` 方法时，如果给定日期小于当前日期则返回 true.

```java
public void isBeforeOrIsAfter() {
    LocalDate today = LocalDate.now();
    LocalDate tomorrow = LocalDate.of(2021, 7, 5);
    if (tomorrow.isAfter(today)) {
        System.out.println("Tomorrow comes after today");
    }

    // 减去一天
    LocalDate yesterday = today.minus(1, ChronoUnit.DAYS);
    if (yesterday.isBefore(today)) {
        System.out.println("Yesterday is day before today");
    }
}
```

> Tomorrow comes after today
>
> Yesterday is day before today

### 3.12 处理时区

Java 8 不仅分离了日期和时间，还把时区也分离出来了。现在有一系列单独的类如 ZoneId 来处理特定时区，ZoneDateTime 类来表示某时区下的时间。

```java
public void getZoneTime() {
    ZoneId america = ZoneId.of("America/New_York");
    LocalDateTime localDateTime = LocalDateTime.now();
    ZonedDateTime dateAndTimeInNewYork = ZonedDateTime.of(localDateTime, america);
    System.out.println(dateAndTimeInNewYork);
}
```

> 2021-07-04T11:03:47.703-04:00[America/New_York]

### 3.13 如何体现出固定日期

例如：表示信用卡到期这类固定日期。与 MonthDay 检查重复事件的例子相似，YearMonth 是另一个组合类，用于表示信用卡到期日、FD到期日、期货期权到期日等。

还可以用这个类得到当月共有多少天，YearMonth 实例的 `lengthOfMonth()` 方法可以返回当月的天数，在判断2 月有 28 天还是 29 天时非常有用。

```java
public void checkCardExpiry() {
    YearMonth currentYearMonth = YearMonth.now();
    System.out.printf(
        "Days in month year: %s, length of month: %d%n",
        currentYearMonth,
        currentYearMonth.lengthOfMonth()
    );

    YearMonth creditCardExpiry = YearMonth.of(2028, Month.FEBRUARY);
    System.out.printf("Your credit card expires on %s%n", creditCardExpiry);
}
```

> Days in month year: 2021-07, length of month: 31
>
> Your credit card expires on 2028-02

### 3.14 检查闰年

```java
public void isLeapYear() {
    LocalDate today = LocalDate.now();
    if (today.isLeapYear()) {
        System.out.println("This year is Leap year.");
    } else {
        System.out.println(today.getYear() + " is not a Leap year.");
    }
}
```

> 2021 is not a Leap year.

### 3.15 计算两个日期之间的天数和月数

有一个常见日期操作是计算两个日期之间的天数、周数或月数。在 Java 8 中可以用 java.time.Period 类来做计算。

```java
public void calcDateDays() {
    LocalDate today = LocalDate.now();
    LocalDate java8Release = LocalDate.of(2021, Month.SEPTEMBER, 14);
    Period periodToNextJavaRelease = Period.between(today, java8Release);
    System.out.println("Months left between today and Java 8 release: "
                       + periodToNextJavaRelease.getMonths());
}
```

> Months left between today and Java 8 release: 2

### 3.16 包含时差信息的日期和时间

ZoneOffset 类用来表示时区，举例来说印度与 GMT 或 UTC 标准时区相差 +05:30，可以通过 ZoneOffset.of() 静态方法来获取对应的时区。一旦得到了时差就可以通过传入 LocalDateTime 和 ZoneOffset 来创建一个 OffSetDateTime 对象。

```java
public void zoneOffset() {
    LocalDateTime datetime = LocalDateTime.of(2021, Month.JULY, 4, 19, 30);
    ZoneOffset offset = ZoneOffset.of("+05:30");
    OffsetDateTime date = OffsetDateTime.of(datetime, offset);
    System.out.println("Date and Time with timezone offset in Java: " + date);
}
```

> Date and Time with timezone offset in Java: 2021-07-04T19:30+05:30

### 3.17 获取当前的时间戳

Instant 类有一个静态工厂方法 `now()` 会返回当前的时间戳。

```java
public void getTimestamp() {
    Instant timestamp = Instant.now();
    System.out.println("What is value of this instant " + timestamp);
}
```

> What is value of this instant 2021-07-04T03:27:03.213Z

### 3.18 使用预定义的格式化工具去解析或格式化日期

Java 8 引入了全新的日期时间格式工具，线程安全而且使用方便。它自带了一些常用的内置格式化工具。

下面这个例子使用了 BASIC_ISO_DATE 格式化工具将 2021 年 7 月 4 日格式化成 20210704.

```java
public void formatDate() {
    String dateStr = "20210704";
    LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.BASIC_ISO_DATE);
    System.out.printf("Date generated from String %s is %s%n", dateStr, date);
}
```

> Date generated from String 20210704 is 2021-07-04

### 3.19 获取本月的第一天和最后一天

```java
LocalDate firstDay = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
LocalDate lastDay = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());
System.out.println("First day of the month: " + firstDay);
System.out.println("Last day of the month: " + lastDay);
```

> First day of the month: 2021-11-01
>
> Last day of the month: 2021-11-30

### 3.20 获取上个月的第一天和最后一天

```java
LocalDate firstDay = LocalDate.now().minusMonths(1).with(TemporalAdjusters.firstDayOfMonth());
LocalDate lastDay = LocalDate.now().minusMonths(1).with(TemporalAdjusters.lastDayOfMonth());
System.out.println("First day of last month: " + firstDay);
System.out.println("Last day of last month: " + lastDay);
```

> First day of last month: 2021-10-01
>
> Last day of last month: 2021-10-31

### 3.21 获取本周的周一、周日日期

```java
LocalDate monday = LocalDate.now().with(DayOfWeek.MONDAY);
LocalDate sunday = LocalDate.now().with(DayOfWeek.SUNDAY);
System.out.println("This Monday is: " + monday);
System.out.println("This Sunday is: " + sunday);
```

> This Monday is: 2021-11-29
>
> This Sunday is: 2021-12-05

### 4、总结

Java 8 日期时间 API 的重点：

- 提供了 javax.time.ZoneId 获取时区。
- 提供了 LocalDate 和 LocalTime 类。
- Java 8 的所有日期和时间 API 都是不可变类并且线程安全，而现有的 Date 和 Calendar API 中的 java.util.Date 和 SimpleDateFormat 是非线程安全的。
- 主包是 java.time，包含了表示日期、时间、时间间隔的一些类。里面有两个子包 java.time.format 用于格式化， java.time.temporal 用于更底层的操作。
- 时区代表了地球上某个区域内普遍使用的标准时间。每个时区都有一个代号，格式通常由区域/城市构成（Asia/Tokyo），再加上与格林威治或 UTC 的时差。例如：东京的时差是 +09:00。



> **参考文章及来源**
>
> 文章转自：[https://segmentfault.com/a/1190000012922933](https://segmentfault.com/a/1190000012922933)
>
> 参考文档：[https://www.matools.com/api/java8](https://www.matools.com/api/java8)

