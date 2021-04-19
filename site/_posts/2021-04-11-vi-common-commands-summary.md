---
title: VI 常用命令总结
---

# VI 常用命令总结

<post-meta date="2021-04-11" />

 ## 1. 移动光标到首行或末行

移动光标到首行：`gg`

移动光标到末行：`G`

## 2. 翻屏

向上翻屏：`ctrl + b` (before) 或 `PgUp`

向下翻屏：`ctrl + f` (after) 或 `PgDn`

向上翻半屏：`ctrl + u` (up)

向下翻半屏：`ctrl + d` (down)

## 3. 快速定位光标到指定行

`行号 + G`

如 150G 代表快速移动光标到第 150 行

在末行模式中，也可使使用 `: + 行号`

## 4. 命令模式下修改当前字符

移动光标到选中的字符，按 `r + 新字符`

## 5. 复制/粘贴

复制当前行：`yy`

在光标所在行的后面粘贴：`p`，在光标所在行的前面粘贴：`P`

从当前行开始复制指定的行数，如复制 5 行：`5yy`

::: tip 拓展

使用末行模式复制当前行到文档结尾上一行位置的内容：`:.,$-1y`

`:` 表示末行模式，`.` 表示当前行，`,` 分隔符，`$` 表示文档最后一行

:::

## 6. 剪切/删除

在 VI 编辑器中，剪切与删除都是 `dd`

剪切/删除当前行：`dd` （删除之后下一行上移）

删除当前行到文件结尾部分：`dG`

粘贴：`p`

剪切/删除多行：`数字dd`

特殊用法：`D` （删除后当前行会变成空行）

> dd 严格意义上说是剪切命令，如果剪切后不粘贴就是删除的效果。

## 7. 撤销/恢复

撤销：`u`（undo）

恢复：`ctrl + r` 恢复之前的撤销操作（redo）

## 8. 保存/退出

保存：`:w`

退出：`:q`

保存并退出：`:wq`

不保存强制退出：`q!`

`:x` 如果文件修改过，相当于 `:wq`，如果文件未修改过，相当于 `:q`

::: tip 提示

如果一个文件在编辑时没有名字，则可以使用 `wq 文件名称` ，表示保存退出并命名文件。

:::

## 9. 查找/搜索

`/ + 关键词`

多个搜索结果，`n` 查看下一个，`N` 查看上一个

搜索后关键词会被高亮，输入 `:noh` 取消高亮（no highlight）

## 10. 文件内容替换

### 替换光标所在行第一个满足条件的结果（只能替换 1 次）

**把 hello world 中的 world 替换为 linux**

`:s/world/linux`

### 替换光标所在行所有满足条件的结果（替换多次，只能替换 1 行）

`:s/world/linux/g` （g 表示 global 全部替换）

 ### 针对文档所有行，只替换每一行第一个满足条件的结果

`:%s/world/linux`

### 全文替换

`:%s/world/linux/g`

## 11. 显示行号

`:set nu`

取消显示行号：`:set nonu`

## 12. set paste 模式

为什么要使用 paste 模式？

问题：在终端 Vi 中粘贴代码时，发现插入的代码会有多余的缩进，而且会逐行累加。原因是终端把粘贴的文本存入键盘缓存（Keyboard Buffer）中，Vi 则把这些内容作为用户的键盘输入来处理。导致在遇到换行符的时候，如果 Vi 开启了自动缩进，就会默认的把上一行缩进插入到下一行的开头，最终使代码变乱。

在粘贴数据之前，输入下面命令开启 paste 模式

`:set paste`

粘贴完毕后，输入下面命令关闭 paste 模式

`:set nopaste`

## 13. 命令模式进入编辑模式

`i`：insert 缩写，在光标之前插入内容

`a`：append 缩写，在光标之后插入内容

## 14. 可视化模式下复制

按键：`ctrl + v` （可视块）或 `V` （可视行）或 `v` （可视），然后按下 ↑ ↓ ← → 方向键来选中需要复制的区块，按下 `y` 键进行复制（不要按yy），最后按下 `p` 键粘贴

退出可视化模式按下 Esc

## 15. VIM 可视模式添加/取消多行注释

**添加多行注释**

- 光标置于行首
- ctrl + v，进入可视块模式
- 按 ↑ ↓ ← → 方向键移动光标，选中的位置会高亮显示
- shift + i，进入 insert 模式
- 输入 #
- Esc

**取消多行注释**

- 光标置于行首
- ctrl + v，进入可视块模式
- 按 ↑ ↓ ← → 方向键移动光标，选中的位置会高亮显示
- 按 d

::: tip 提示

**添加多行注释** 在 VIM 中可用，在 VI 中测试不可用。

:::
