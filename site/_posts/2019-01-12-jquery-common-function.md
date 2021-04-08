---
title: jQuery一些常用函数的小结
---

# jQuery一些常用函数的小结

<post-meta date="2019-01-12" />

## jQuery.map(arr | obj, callback)

**将一个数组中的元素转换到另一个数组中。**

示例1：将原数组中每个元素加 4 转换为一个新数组。

```javascript
$.map([0,1,2], function(n) {
    return n + 4;
});
```

> 结果：[4, 5, 6]

示例2：原数组中大于 0 的元素加 1，否则删除。

```javascript
$.map([0,1,2], function(n) {
    return n > 0 ? n + 1 : null;
});
```

> 结果：[2, 3]

## data([key], [value])

**在节点上存取数据，<font color="red">获取 H5 自定义属性的值</font>。**

示例：

```html
<div data-content="Hello World!">测试获取 H5 自定义属性的数据。</div>
```

```javascript
$('div').data('content');  // Hello World
```

## prop(name | properties | key, value | fn)

**获取匹配的元素集中第一个元素的属性（property）值或设置每一个匹配元素的一个或多个属性。**

示例1：获取复选框是否被选中。

```javascript
$('input[type=checkbox]').prop('checked')
```

示例2：反选页面上所有的复选框。

```javascript
$("input[type='checkbox']").prop("checked", function(index, value) {
    return !value;
});
```

## jQuery.param(obj, [traditional])

**将表单元素数组或者对象序列化。是.serialize()的核心方法。**

```javascript
var params = { width:1680, height:1050 };
var str = jQuery.param(params);
$("#results").text(str);
```

> 结果：width=1680&height=1050

## jQuery.inArray(value, array, [fromIndex])

**确定第一个参数在数组中的位置，从0开始计数（如果没有找到则返回-1）。**

```javascript
var arr = [4, "Pete", 8, "John"];
$.inArray("John", arr);     // 3
$.inArray(4, arr);          // 0
$.inArray("David", arr);    // -1
$.inArray("Pete", arr, 2);  // -1
```

## index([selector | element])

**搜索匹配的元素，并返回相应元素的索引值，从0开始计数。**

```html
<ul>
    <li id="foo">foo</li>
    <li id="bar">bar</li>
    <li id="baz">baz</li>
</ul>
```

```javascript
$('li').index(document.getElementById('bar'));  // 传递一个DOM对象，返回这个对象在原先集合中的索引位置
$('li').index($('#bar'));  // 传递一个jQuery对象
$('li').index($('li:gt(0)'));  // 传递一组jQuery对象，返回这个对象中第一个元素在原先集合中的索引位置
$('#bar').index('li');  // 传递一个选择器，返回#bar在所有li中的做引位置
$('#bar').index();  // 不传递参数，返回这个元素在同辈中的索引位置。  
```

## closest(expr | object | element)

**从元素本身开始，逐级向上级元素匹配，并返回最先匹配的元素。**

```html
<ul>
    <li>1.1</li>
    <li>1.2</li>
</ul>
<ul>
    <li>2.1</li>
</ul>
```

```javascript
$('li').click(function() {
    var ul = $(this).closest('ul');
    ul.css('color', 'red');
});
```

## toggleClass(class | fn[,sw])

**如果存在（不存在）就删除（添加）一个类。**

```html
<p>Hello World!</p>
<button>点我</button>
```

```css
.red-font {
    color: red;
}
```

```javascript
$('button').click(function() {
    $('p').toggleClass('red-font');
});
```

## clone([Even[,deepEven]])

**克隆匹配的DOM元素并且选中这些克隆的副本。**

示例：创建一个按钮，他可以复制自己，并且他的副本也有同样功能。

```html
<button>Clone Me!</button>
```

```javascript
$("button").click(function() {
    $(this).clone(true).insertAfter(this);  // 连同事件一起拷贝
});
```

## on(events, [selector], [data], fn)

**在选择元素上绑定一个或多个事件的事件处理函数。**<font color="red">(统一事件绑定)</font>

```javascript
function myHandler(event) {
    alert(event.data.foo);
}

$("p").on("click", {foo: "bar"}, myHandler);
```

```javascript
$("form").on("submit", function(event) {
    event.preventDefault();  // 阻止表单提交
});
```

（完）
