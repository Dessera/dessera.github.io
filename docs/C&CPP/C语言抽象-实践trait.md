---
title: C语言抽象-实践trait
createTime: 2025/02/27 15:17:55
permalink: /article/3acise8k/
---

几个月前跟朋友说过关于`C`的抽象问题，最后得出的结论是`C`只能尽可能的模仿其他语言的抽象范式，但无法更进一步（比如严格的类型检查云云），这几天对于抽象这方面有了新的灵感，写一下关于`C`的抽象实践。

## 首先，为什么抽象？

抽象是一种很常见的代码工程技巧，其最根本的目的就是代码复用，笔者看来，它最重要也是唯一的准则就是：依赖接口，而不是实现。

在其他的语言里，我们有内置的抽象范式支持（作为编程范式的一部分），比如在`C++`中我们有类和元编程共同实现动态抽象和静态抽象，在`Rust`中我们也有诸如`Box`和`trait`这样类似的概念，但了解`C`的读者知道，`C`语言本身并没有提供这样的抽象支持，但它本身的**弱类型**性质为抽象提供了可能。

> 有读者可能认为`C`是强类型语言，但笔者的观点是，只要该语言有类似`any`这样的类型，那么它就是弱类型语言，显然`void*`就是`C`语言中的`any`类型。

## 如何抽象？

笔者了解过几种抽象方法，这里列举一二（有些名字是我取的，了解其概念即可）：

1. **函数指针**：通过留下全局或者局部函数指针，让用户动态替换这些函数来达到动态抽象的目的，这种方法最为原始，在嵌入式平台略有应用。
2. **选择编译**：通过编译期宏选择编译实现，很多`C/C++`库利用这种特性来为不同平台提供不同的实现。
3. **面向对象**：通过继承、多态等特性实现基于父子关系的抽象和复用，非常常见。
4. **接口模式**：和面向对象有些类型，但它强调纯虚父类，用一个只包含纯虚函数的父类来约束子类。
5. **trait**：更复杂的接口模式，允许复合、派生接口，虽然听起来像是由面向对象继承发展而来，但它实际上是函数式编程的副产品，通常通过元编程等静态手段实现。

前面的几种手段都较为常见，我们主要聊一聊`trait`。

## 什么是 trait ？

`trait`是`Rust`中的一种抽象机制，它允许我们定义一组接口，其他类型可以实现这些接口，来满足该`trait`，一旦某个类型满足了某个`trait`，那么我们就可以直接使用与`trait`相关的所有方法。

在`C++`中，我们有`concept`实现类似的功能，比如我们可以编写如下函数：

```cpp
#include <concepts>

template <typename T>
concept Addable = requires(T a, T b) {
    { a + b } -> std::same_as<T>;
};

template <Addable T>
T add(T a, T b) {
    return a + b;
}
```

这样，所有实现了`operator+`的类型都可以使用`add`函数。

## 在 C 中应用 trait 思想

为什么我不说“在 C 中实现 trait”，因为要做到这个是几乎不可能的！但是我们可以模仿`trait`的思想，实现类似的功能。

如何实现呢，我们可以回忆一下`Linux`内核的一些工具类，比如`list_head`，它作为一个链表节点，当使用它时，我们将该实例传入对应的函数，操作完成后，我们使用`container_of`获取到对应的结构体指针，从而实现了链表功能的复用。

等等，我们想到了什么，如果把这个`list_head`换成`IsList`，我们就会发现这是一个天然的`trait`实现！任何包含了`list_head`的结构体都可以看作实现了`IsList`，他们就可以直接使用`list_head`提供的所有方法。

但我们还忽略了一件事，`trait`的目的不仅是复用旧有的函数，还需要约束派生类，这些约束操作该如何实现？答案就是函数指针。

有了这个想法，我们很快就能写出如下代码，假设我们来实现一个`IsReader`，方便起见，我们让他返回字符串常量：

```c
// 一个 IsReader 接口，要求实现 read 方法
struct IsReader
{
  const char* (*read)(struct IsReader* self);
};
```

接下来，实现一个`AReader`：

```c
// 实现 IsReader 接口的 AReader，通过包含 IsReader 来声明自己实现了它
struct AReader
{
  struct IsReader base;
};

// AReader 的 read 方法
const char*
read_a(struct IsReader* /* self */)
{
  return "a";
}

// 工具函数，用于初始化 AReader
void
init_a_reader(struct AReader* self)
{
  self->base.read = read_a;
}
```

这样，任何需要`Reader`的地方，我们都可以使用`IsReader`作为其类型，比如：

```c
struct Foo
{
  // 包含 IsReader 接口， 但无所谓它具体是什么
  struct IsReader *rd;
  int some_magic_value;
};

void
foo()
{
  struct Foo foo;
  foo.some_magic_value = 42;

  // 初始化 AReader
  struct AReader a_reader;
  init_a_reader(&a_reader);

  // 只将 AReader 的 base 赋值给 Foo 的 rd
  foo.rd = &a_reader.base;

  // 使用 AReader 的 read 方法，但是 Foo 并不知道
  printf("%s\n", foo.rd->read(foo.rd));
}


// 同理，这个函数也不会知道 Reader 具体是什么
void 
bar(struct IsReader* reader)
{
  printf("%s\n", reader->read(reader));
}
```

好，我们现在实现了简易的`trait`模式，但这还不够，我们该如何约束复合`trait`？我的解决方案是使用`payload`，首先，我们再写一个`IsWriter`：

```c
struct IsWriter
{
  void (*write)(struct IsWriter* self, const char* str);
};
```

何为`payload`？简单来说，为了约束多个类型，我们把他们放进一个结构体就可以了，比如：

```c
// 一个 payload,作为在实际类型和接口之间的桥梁
// 其语义为：实际类型依赖 IsReader 和 IsWriter
struct IsReaderAndWriter
{
  struct IsReader *rd;
  struct IsWriter *wr;
};
```

如果一个类型需要同时实现`IsReader`和`IsWriter`，它仍然要同时包含`IsReader`和`IsWriter`，但是，同时需要`Reader`和`Writer`的函数可以引用这个`IsReaderAndWriter`，我们改进一下上面的`Foo`类：

> 假设我们实现了一个`AWriter`

```c
// 一个依赖 IsReader 和 IsWriter 的类型
struct Foo
{
  struct IsReader *rd;
  struct IsWriter *wr;
  int some_magic_value;
};

// 这个函数可以接受任何依赖了 IsReader 和 IsWriter 的类型
void
do_copy(struct IsReaderAndWriter* rw)
{
  rw->wr->write(rw->wr, rw->rd->read(rw->rd));
}

int
main(void)
{
  struct Foo foo;
  foo.some_magic_value = 42;

  struct AReader a_reader;
  init_a_reader(&a_reader);

  struct AWriter a_writer;
  init_a_writer(&a_writer);

  foo.rd = &a_reader.base;
  foo.wr = &a_writer.base;

  // 创建一个 payload
  struct IsReaderAndWriter rw;
  rw.rd = foo.rd;
  rw.wr = foo.wr;

  // 使用 payload 调用函数
  do_copy(&rw);
}
```

这样，我们就实现了复合`trait`的约束，当然，返回符合约束同理：

```c
struct IsReaderAndWriter
do_create_rw()
{
  struct Foo foo = malloc(sizeof(struct Foo));
  foo.some_magic_value = 42;

  struct AReader a_reader;
  init_a_reader(&a_reader);

  struct AWriter a_writer;
  init_a_writer(&a_writer);

  foo.rd = &a_reader.base;
  foo.wr = &a_writer.base;

  // 创建一个 payload
  struct IsReaderAndWriter rw;
  rw.rd = foo.rd;
  rw.wr = foo.wr;

  // 返回 payload 来代表 Foo
  return rw;
}
```

如果外层函数知道这个类型是`Foo`，该如何得到`Foo`的指针呢？我们可以使用`container_of`宏（重命名一下，为`instanceof`）：

```c
#define instanceof(ptr, type, member)                                        \
  ({                                                                         \
    const typeof(((type*)0)->member)* __mptr = (ptr);                        \
    (type*)((char*)__mptr - offsetof(type, member));                         \
  })

int
main(void)
{
  struct IsReaderAndWriter rw = do_create_rw();
  struct Foo* foo = instanceof(rw.rd, struct Foo, rd);
  printf("%d\n", foo->some_magic_value);

  // 一般你还要实现一个`do_free_rw`来释放这个`Foo`
  free(foo);
}
```

当然，这里有一个BUG，我们可以传入不同所有者的`rd`和`wr`，这会导致`instanceof`返回错误的指针，不过我不打算研究如何修复这个问题（因为它很可能无法修复），如果你有好的解决方案，欢迎告诉我。

读者可能注意到，我们刻意区分了包括指针和包括变量，这是语义的不同导致的：

```c
// 表示该类型是 IsReader 的一个实现
// 因为它就是 IsReader，这里使用指针只会增加复杂度
struct AReader
{
  struct IsReader base;
};

// 表示该类依赖了 IsReader
// 这里不能使用值参数，因为那样会造成不必要的拷贝
struct Foo
{
  struct IsReader *rd;
  int some_magic_value;
};

// 是上面类型的简化版，表示任何依赖于 IsReader 和 IsWriter 的类型
// 原因同上
struct IsReaderAndWriter
{
  struct IsReader *rd;
  struct IsWriter *wr;
};
```

## 总结

上文我们有意隐去了内存管理问题，这是为了简化问题，在实际应用中要根据需要对模块进行内存管理。

笔者认为`trait`是一种极佳的设计模式，这篇文章也只是笔者总结的一个简易模型，作为参考尚可，作为生产应用则还需打磨。