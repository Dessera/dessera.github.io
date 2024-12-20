---
title: C语言资源管理实践-DEFER
createTime: 2024/12/20 12:18:17
permalink: /article/qwdr1dau/
tags:
- C
- GNU
- 资源管理
---

笔者近来和朋友谈论了有关C语言的资源管理方式，在ISO C中，资源管理一直都以很原始的方式进行——函数库提供`open`和`close`接口，由程序员亲自管理销毁资源的时机，更进一步无非是使用`goto`这样原始的关键字来去重。

## GNU C 资源管理

在GNU Extensions的加持下，我们有`cleanup`属性，可以为变量指定一个在离开作用域时自动执行的函数：

```c{15}
#include <stdio.h>

void
fcleanup(FILE** fp)
{
  printf("cleaning\n");
  if (*fp) {
    fclose(*fp);
  }
}

int
main()
{
  FILE* fp __attribute__((cleanup(fcleanup))) = fopen("file.txt", "w");
}
```

`fp`离开作用域时，也就是主函数结束时，会自动运行`fcleanup`，如果使用`-std=gnu23`，那么也可以这么书写属性：

```c
FILE* fp [[gnu::cleanup(fcleanup)]] = fopen("file.txt", "w");
```

这个方案适用于`clang`和`gcc`，但缺点是我们需要为每个类型重写一个释放函数。

> 因为如果要释放`FILE*`类型的资源，我们需要用以`FILE**`为参数的函数

## DEFER

写过`zig`等语言的读者可能会了解`defer`这个关键字，简单来说，`defer`定义一段表达式，它会在离开当前作用域时执行：

```zig
const std = @import("std");
const print = std.debug.print;

pub fn main() !void {
    defer print("exec third\n", .{});

    if (false) {
        defer print("will not exec\n", .{});
    }

    defer {
        print("exec second\n", .{});
    }
    defer {
        print("exec first\n", .{});
    }
}
```

`zig`用这种语法将资源申请和释放写在一起，这样既保证了不会遗漏释放流程，也确保了**释放**流程的可自定义性，我们希望C语言也能有类似的功能，该如何实现呢？

## GNU Nested Function

实际上，GNU C允许用户定义嵌套函数：

```c
int 
main() {
  int foo() {
    return 0;
  }

  return foo();
}
```

> 这种特性只有gcc支持，clang不支持，甚至g++也不支持。

我们可以利用这个特性来封装一块代码块：

```c
int 
main()
{
  void fcleanup(int**) {
    // code block here
  }
  int* fcleanup_placeholder __attribute__((cleanup(fcleanup), unused)) = NULL;
}

```

这样，我们写在函数中的代码就可以做出类似`defer`一样的行为，我们将该功能封装成宏：

```c
// 用来生成不重复ID的工具宏
#define DEFER_CONCAT(a, b) DEFER_CONCAT_INNER(a, b)
#define DEFER_CONCAT_INNER(a, b) a##b
#define DEFER_UNIQUE_NAME(base) DEFER_CONCAT(base, __COUNTER__)

// DEFER 实现
#define DEFER_IMPL(fname, phname, ...)                                   \
  void fname(int**)                                                      \
  {                                                                      \
    __VA_ARGS__                                                          \
  }                                                                      \
  int* phname __attribute__((cleanup(fname), unused)) = NULL
#define DEFER(...)                                                       \
  DEFER_IMPL(DEFER_UNIQUE_NAME(defer_block),                             \
             DEFER_UNIQUE_NAME(defer_block_ph),                          \
             __VA_ARGS__)
```

测试一下：

```c
int 
main() 
{
  DEFER(printf("on exit\n"););

  printf("in function body\n");
}
```

输出：

```plaintext
in function body
on exit
```

## Blocks

说完了gcc，我们来看clang，对于clang来说，没有嵌套函数这样方便的功能，但它有名为`blocks`的特性，通过`-fblocks`开启，它定义了一种新的函数指针，可以将代码块封装为函数：

```c
int
main()
{
  void(^fblock)(void) = ^{
    printf("hello in block");
  };
}
```

这样的一个代码块可以作为函数被调用，那么，我们可以直接为它定义一个`cleanup`属性，让其在`cleanup`时调用自己：

```c
void
defer_block_cleanup(void (^*block)(void))
{
  if (*block) {
    (*block)();
  }
}

int
main()
{
  void(^fblock)(void) __attribute__((cleanup(defer_block_cleanup), unused)) = ^{
    printf("hello in block");
  };
}
```

同样将其封装为宏：

```c
void
defer_block_cleanup(void (^*block)(void))
{
  if (*block) {
    (*block)();
  }
}

#define DEFER(...)                                                       \
  void (^DEFER_UNIQUE_NAME(defer_block))(void)                           \
    __attribute__((cleanup(defer_block_cleanup), unused)) = (^{          \
      __VA_ARGS__ })
#define DEFER_IF(cond, ...) DEFER(if (cond){ __VA_ARGS__ })
```

能够做到和上面相同的效果。

> 这里也解释了为什么gcc的实现使用空指针，因为clang的实现必须占用一个函数指针，为了宏的效果相同，所以gcc版本使用指针占位符

## 写在后面

本文代码仓库：[cdefer](https://github.com/Dessera/cdefer)

说实在的，这种实现高度依赖编译器特性，不应看作一种**行之有效**的解决方案，但无奈标准直到C23都没有进一步优化资源管理手段，文中提到的`blocks`、`cleanup`和`defer`等特性也是遥遥无期。

作为C语言爱好者，笔者真切希望标准能给出官方的新资源管理方案。
