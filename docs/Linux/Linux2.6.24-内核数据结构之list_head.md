---
title: Linux2.6.24-内核数据结构之list_head
createTime: 2024/11/06 21:50:09
permalink: /article/l6rq29eh/
tags:
- Linux
- C
- 数据结构
---

笔者近期正在阅读 *深入Linux内核架构 (Wolfgang Mauerer)* 作为Linux内核学习的入门书籍，几个月前，我的朋友曾极力向我推荐这本书，他对于内核数据结构实现的赞美勾起了我的兴趣。

本文的目的是拆解最简单的Linux数据结构`list_head`，并分析其最重要的宏调用`container_of`，我们不会关注太多的操作系统细节（包括内存同步、实现优化等）。

> 本文的构建环境是Linux-2.6.24 和 gcc-4.8.5

## 最基本的数据结构

链表，或者说循环链表，是整个内核中最基本的数据结构之一，它的头文件位于`include/linux/list.h`，如果我们没有启用`CONFIG_DEBUG_LIST`，`list_head`的所有方法都在该文件内实现，且不会进行参数检查，我们以私有函数`__list_add`为例，在DEBUG模式下，它的实现如下：

```c
void
__list_add(struct list_head* new,
           struct list_head* prev,
           struct list_head* next)
{
  if (unlikely(next->prev != prev)) {
    printk(KERN_ERR "list_add corruption. next->prev should be "
                    "prev (%p), but was %p. (next=%p).\n",
           prev,
           next->prev,
           next);
    BUG();
  }
  if (unlikely(prev->next != next)) {
    printk(KERN_ERR "list_add corruption. prev->next should be "
                    "next (%p), but was %p. (prev=%p).\n",
           next,
           prev->next,
           prev);
    BUG();
  }
  next->prev = new;
  new->next = next;
  new->prev = prev;
  prev->next = new;
}
```

该实现会先检查函数参数的有效性，如果参数无效，会调用`printk`打印日志，通过`BUG`宏记录错误信息并陷入死循环，该实现是为了调试而存在的。

如果没有设置`CONFIG_DEBUG_LIST`，我们最终看到的实现是这样的：

```c
static inline void
__list_add(struct list_head* new,
           struct list_head* prev,
           struct list_head* next)
{
  next->prev = new;
  new->next = next;
  new->prev = prev;
  prev->next = new;
}
```

该实现不进行任何参数检查，且使用`inline`将其内联。

## 链表数据结构

内核实现的`list_head`是**通用链表**，也就是说，它能够为任何需要链表的数据结构提供该功能，一般而言，这在C语言中是很难做到的，在这里，内核使用了一种取巧的方案，将链表节点作为单独的数据结构拆分了出来，其定义为：

```c
struct list_head
{
  struct list_head *next, *prev;
};
```

要为特定的数据结构嵌入链表，我们只需要将该单元插入对应的结构，我们对`list_head`实现的所有功能就都可以复用于新的数据结构：

```c
struct kobject {
  // ...
  struct list_head entry;
  // ...
};
```

但在这个过程中，我们忽略了一件事，我们不能使用节点来索引到对应的结构体，因为`list_head`中没有任何成员指向了它对应的结构体。

想象一下，我们在C++中是如何做到这件事的？如果我们有一个`LinkedList`类，要使用它通常要使用如下方法：

```cpp
LinkedList<int> arr = { };
```

但现在，我们只有`list_head`这一个符号，我们缺少什么？我们缺少了目标类（准确来说，是它的元信息）！我们发现，在C++中我们默认知道了链表的目标类，还在链表实现中指定了二者的关系。

C++能够自动帮我们维护这三者的关系，但在C语言中，我们需要自己来做这件事，因此，我们很容易想到创建一个宏，它的参数分别是链表节点、目标类名和二者之间的关系，这就是`container_of`宏的由来。

比较抽象的一点是，什么是链表和目标类之间的关系？在C++中，我们可以认为目标类实例是链表结构的一个成员，表示为`node.data`，在C中，我们认为链表节点是目标类的一个成员，表示为`data.node`，这是二者之间存在关系的浅显表示。实际上，这样的关系指明了二者在内存上的连续关系，只要我们获得了二者之间的偏移量，就能够轻易的在二者之间转换。

幸运的是，`<stddef.h>`提供了`offsetof`宏，它计算结构体成员在结构体内的偏移量，出于各种原因，你可能需要自己实现一个，你可以参考Linux内核：

```c
#ifdef __compiler_offsetof
#define offsetof(TYPE,MEMBER) __compiler_offsetof(TYPE,MEMBER)
#else
#define offsetof(TYPE, MEMBER) ((size_t) &((TYPE *)0)->MEMBER)
#endif
```

内核的备用实现模拟了一个位于地址`0`的结构体，并获取它对应成员的指针，将其强转为`size_t`即为该成员的内存位置，因为结构体起始于`0`，所以该内存位置即为该成员的偏移量。

## `container_of`

一旦我们知道了该成员的偏移量，我们就可以从该成员的内存位置反推目标位置，这就是`container_of`实现的功能：

```c
#define container_of(ptr, type, member)                                        \
  ({                                                                           \
    const typeof(((type*)0)->member)* __mptr = (ptr);                          \
    (type*)((char*)__mptr - offsetof(type, member));                           \
  })
```

`container_of`使用了大量的GNU拓展，`typeof()`获取对应变量的类型，因此`typeof(((type*)0)->member)`的意思是：`type`结构体中`member`成员的类型。

该宏第一行将传入的指针转换为它的实际类型（可能是`list_head`、`hlist_node`等等）。

在第二行，将该指针强制转换为`char*`，并减去我们计算好的偏移量，正如上文所说，成员指针减去成员偏移量即为目标类的位置。

我们注意到没有任何代码将该结果返回给外部，这里利用了GNU表达式的拓展，将该块最后一行作为整个表达式的值。

我们可以不依靠GNU拓展达成这个目的（但会损失部分安全性）：

```c
#define container_of_no_gnu(ptr, type, member)                                 \
  ((type*)((char*)(ptr) - offsetof(type, member)))
```

我们移除了第一行的转换来将表达式缩减为一行，这样就不需要任何GNU拓展就能使用该宏，但正如我上面说的，这样的做法可能会损失一些类型安全性，导致错误被隐藏到运行时。

## 对链表成员的一些理解

将`list_head`嵌入目标类在笔者看来并非一种**无可奈何**之举，如果我们细究其编程思想，可以认为其表达了面向对象的继承思路，因为缺少元编程的支持，所以改为使用继承的方式实现功能复用，以这种视角理解`container_of`也可以看作对面向对象编程功能的一种补足。

## 写在后面

笔者最近开始了**伟大而漫长的**学习路程，具体来说，一半出于兴趣，一半出于对自己就业方向的考量，我开始了Linux内核和驱动开发的学习，该文章是我内核学习的第一步。

如果读者不想阅读内核代码，可以借助笔者的练习项目[linux-stl-caontainers](https://github.com/Dessera/linux-stl-containers)来速览内核数据结构的使用，该项目跟随我的学习进度，同时练习C/C++的项目组织管理能力。

> 当然，数据结构实现移除了`rcu`等特殊方法

之后会介绍笔者的Linux2.6.24的构建笔记。
