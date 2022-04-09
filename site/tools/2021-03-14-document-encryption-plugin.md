# 文档加密插件

<post-meta date="2021-03-14" />

## 效果演示

文档内容加密测试，<span style="color: red">密码：hxl</span>

::: encrypt encrypted key=demoKey owners=root
48oyx+5G5Yf8Z1mrj81IadaqUR/gE3UfiyRpyK8sDzIZRV871zj84iPmfHuNLAy+slVW4YnVGMfmNgS
c0uT7ritUQtcsI7jCg0mYQhVaMDaK/QquM36VVM4gwOpH9y++yraQYTk6pBpnZPnsQp452GFY71Qk09
7k2DheDB3260Thd6aoXdJOQOflr93JwJLjbgb7JU1OU0FMv37seCuHOaRbUNnVbMR2dM5sA5InFjy4T
LfkswnccQcj+d2k3SqiJuItLcMOH529NZEA6k2/XNxYxxrTlh+q7RkQwnJ8cOJkrbJR2zDi8JRKo/iO
ectuGT6TbDuZ4eyEMi5/coc*
:::

## 注意事项

<font color="red">待加密的 Markdown 文档一定要用 Linux 的 LF 格式换行符</font>

## 语法样例

```
::: encrypt key=demoKey owners=root
**bilibili 演唱会，嗨起来~~~**
<Bilibili aid="67884868" cid="117659978" />
:::
```

