---
title: C++漫谈-解析函数内联
createTime: 2025/07/14 19:02:50
permalink: /article/u97w6qbk/
tags:
- C++
- ASM
---

作为C++程序员，优化是我们绝对绕不开的话题之一，一般来说，优化手段总是因地制宜的，一个优秀的程序员能够从架构、算法、数据结构、编译器优化等多个角度出发，找到最合适的优化方案，从而提升程序的运行效率。

不过，即便优化的手段如此丰富，也存在着一些适用于大部分场景、屡试不爽的“万金油”，在C++中，最常见的便是**函数内联**，其适用于几乎任何的现代C++程序，并且无需对程序进行复杂的修改。

本文将重点介绍函数内联和其误区。

> 注，本文涉及到对汇编代码的解析，所使用的环境是`x86_64-linux`，编译器是`GCC 14.3.0`。

## `inline`：长久的误会

很多人，包括笔者，长久以来都觉得`inline`关键字的功能是进行内联优化，但这种理解是完全错误的，参考`cppreference`的描述，一个被标记为`inline`的函数，其符合以下特点：

- 函数必须在当前编译单元中有定义。
- 如果该函数被声明为外部链接，它在每个编译单元中的声明和定义都必须一致。
- 如果该函数被声明为外部链接，所有编译单元中的该函数都必须声明为`inline`。
- 如果该函数被声明为外部链接，它在每个编译单元中的地址必须相同。

简单来说，`inline`关键字的目的是告诉编译器，出现在每个编译单元中的该函数都指向同一个函数，而不是每个编译单元都生成一份函数的拷贝，从而避免函数的重复定义。

更直观的说法，我们以前在头文件中**定义**的函数如果不声明为`static`，那么每个源文件都会生成一份函数的拷贝，从而造成重复定义的错误，但如果声明为`static`，则会导致一定程度上的二进制膨胀，而`inline`关键字则可以避免这种情况，它告诉编译器，每个编译单元中的该函数都指向同一个函数，从而避免重复定义和二进制膨胀。

在`c++17`后，`inline`关键字也可以用于变量，其语义没有变化。

符号在以下情况下是隐式`inline`的：

- `class`内的成员函数
- `constexpr`修饰的函数（`c++11`后）
- `consteval`修饰的函数（`c++20`后）
- `constexpr`修饰的类静态成员变量（`c++17`后）

> `inline`的语义是“允许重定义”

我们可以透过汇编来理解`inline`的原理：

```cpp
inline int
add(int a, int b)
{
        return a + b;
}
```

该函数生成的汇编可能是（笔者清理了一些无关紧要的信息）：

```asm
        .weak   _Z3addii
        .type   _Z3addii, @function
_Z3addii:
.LFB0:
        pushq   %rbp
        movq    %rsp, %rbp
        movl    %edi, -4(%rbp)
        movl    %esi, -8(%rbp)
        movl    -4(%rbp), %edx
        movl    -8(%rbp), %eax
        addl    %edx, %eax
        popq    %rbp
        ret
.LFE0:
        .size   _Z3addii, .-_Z3addii
```

可以看到，`inline`关键字修饰的函数，在生成汇编时加入了`.weak`伪指令，该指令的作用是在链接时，如果该符号没有定义，则使用当前代码段，否则舍弃该代码段，借此实现了“允许重定义”的语义。

> `__attribute__((weak))`也是使用`.weak`伪指令实现的

## `__attribute__((always_inline))`：真正的内联优化

> 我们只讨论支持GNU拓展的编译器，如GCC

`__attribute__((always_inline))`是GCC编译器提供的拓展关键字，其作用是告诉编译器，该函数必须内联，内联函数必须声明为`inline`，否则编译器会警告，因此我们经常会在代码中看到如下宏：

```cpp
#define ALWAYS_INLINE __attribute__((always_inline)) inline
```

我们编写一个简单的例子：

```cpp
#include <stdio.h>

inline __attribute__((always_inline)) int
add(int a, int b)
{
        return a + b;
}

int
main()
{
        printf("%d", add(1, 2));
        return 0;
}
```

该程序生成的汇编如下：

```asm
        .file   "hello.alwaysinline.cpp"
        .text
        .section        .rodata
.LC0:
        .string "%d"
        .text
        .globl  main
        .type   main, @function
main:
.LFB1:
        pushq   %rbp
        movq    %rsp, %rbp
        subq    $16, %rsp
        movl    $1, -4(%rbp)
        movl    $2, -8(%rbp)
        movl    -4(%rbp), %edx
        movl    -8(%rbp), %eax
        addl    %edx, %eax
        movl    %eax, %esi
        movl    $.LC0, %edi
        movl    $0, %eax
        call    printf
        movl    $0, %eax
        leave
        ret
.LFE1:
        .size   main, .-main
        .ident  "GCC: (GNU) 14.3.0"
        .section        .note.GNU-stack,"",@progbits
```

可以看到，编译器甚至没有生成`add`的函数体，而是直接将`add`的函数体展开到了`main`函数中，这就是内联优化的效果。
