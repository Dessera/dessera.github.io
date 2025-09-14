---
title: C++漫谈-GCC虚函数分析
createTime: 2025/09/09 22:03:21
permalink: /article/lii8n7qg/
tags:
- 草稿
---

这篇文章是[C++漫谈-面向对象](../C&CPP/C++漫谈-面向对象.md)的后续，旨在详细地通过汇编分析虚函数表原理，笔者会按照单继承、链式继承、多继承、虚继承的顺序进行分析。

为了方便关注主要逻辑，我们使用[Compiler Explorer](https://gcc.godbolt.org/)进行编译，环境为`x86_64`，编译器为 GCC15 。

## 单继承

单继承的虚表是最简单的，我们构造如下案例：

```cpp
class BaseA {
public:
    virtual void do_a() = 0;
};

class DeriveA : public BaseA {
public:
    void do_a() override {}
};

int
main()
{
  DeriveA instance{};
  BaseA* pinstance = &instance;

  pinstance->do_a();
}
```

其汇编结果为：

```asm
main:
        push    rbp
        mov     rbp, rsp
        sub     rsp, 16                                 // 申请栈帧
        mov     eax, OFFSET FLAT:vtable for DeriveA+16
        mov     QWORD PTR [rbp-16], rax                 // 初始化虚表指针
        lea     rax, [rbp-16]
        mov     QWORD PTR [rbp-8], rax                  // 初始化变量pinstance
        mov     rax, QWORD PTR [rbp-8]
        mov     rax, QWORD PTR [rax]
        mov     rdx, QWORD PTR [rax]                    // 获取虚函数指针
        mov     rax, QWORD PTR [rbp-8]
        mov     rdi, rax                                // 装载this指针
        call    rdx                                     // 调用虚函数
        mov     eax, 0
        leave
        ret
vtable for DeriveA:
        .quad   0
        .quad   typeinfo for DeriveA
        .quad   DeriveA::do_a()
```

在对象模型比较简单的情况下，GCC一般倾向于省略构造函数调用，我们观察构造流程，首先，为变量申请栈帧：

```asm
        mov     rbp, rsp    // 保存原有rsp
        sub     rsp, 16     // 从rsp中 “分配” 16个字节
```

> 为什么是16个字节，因为一个指针占有8字节，而`DeriveA`只包含一个虚表指针，也是8字节。

因为`DeriveA`没有任何成员，因此只要将虚表指针移动到实例中就能完成构造：

```asm
        mov     eax, OFFSET FLAT:vtable for DeriveA+16  // 获取虚表指针
        mov     QWORD PTR [rbp-16], rax                 // 将指针移入实例
```

我们发现，将虚表指针移入实例时，我们将虚表指针位移了16个字节，也就是说，实际上在类的内部，虚表是从虚函数指针起始的，不包含前面的头部。

关于前面的头部，我们现在能看到一个`0`和`typeinfo`指针，后者是为 RTTI 服务的，前者的作用笔者会在后面揭晓。

接下来我们构造了`BaseA`的指针：

```asm
        lea     rax, [rbp-16]           // 将实例指针移动到rax
        mov     QWORD PTR [rbp-8], rax  // 将实例指针赋值给pinstance
```

接下来，我们进行一次虚函数的调用：

```asm
        mov     rax, QWORD PTR [rbp-8]    // 将实例指针赋值给rax
        mov     rax, QWORD PTR [rax]      // 将虚表指针赋值给rax
        mov     rdx, QWORD PTR [rax]      // 将虚表中第一个函数赋值给rdx
        mov     rax, QWORD PTR [rbp-8]    // 将实例指针赋值给rax （this指针）
        mov     rdi, rax                  // 将this赋值给rdi
        call    rdx                       // 执行函数调用
```

我们经常说，虚函数调用会有效率损耗，其原因就是需要先从虚表中拿到函数指针，再进行调用，我们可以对比一般函数调用：

```asm
        lea     rax, [rbp-16]             // 将实例指针赋值给rax （this指针）
        mov     rdi, rax                  // 将this赋值给rdi
        call    DeriveA::do_a()           // 执行函数调用
```

不难发现，一般函数调用比虚函数调用节省了三次`mov`。

## 链式继承

我们升级一下刚刚的例子，现在我们的继承链中有一个中间类：

```cpp
class BaseA {
public:
    virtual void do_a() = 0;
};

class BaseDeriveA : public BaseA {
public:
    virtual void do_a2() = 0;
};

class DeriveA : public BaseDeriveA {
public:
    void do_a() override {}
    void do_a2() override {}
};

int
main()
{
  DeriveA instance{};
  BaseDeriveA* p1 = &instance;
  BaseA* p2 = &instance;

  p1->do_a2();
  p2->do_a();
}
```

汇编结果如下：

```asm
main:
        push    rbp
        mov     rbp, rsp
        sub     rsp, 32
        mov     eax, OFFSET FLAT:vtable for DeriveA+16
        mov     QWORD PTR [rbp-24], rax
        lea     rax, [rbp-24]
        mov     QWORD PTR [rbp-8], rax
        lea     rax, [rbp-24]
        mov     QWORD PTR [rbp-16], rax
        mov     rax, QWORD PTR [rbp-8]
        mov     rax, QWORD PTR [rax]
        add     rax, 8
        mov     rdx, QWORD PTR [rax]
        mov     rax, QWORD PTR [rbp-8]
        mov     rdi, rax
        call    rdx
        mov     rax, QWORD PTR [rbp-16]
        mov     rax, QWORD PTR [rax]
        mov     rdx, QWORD PTR [rax]
        mov     rax, QWORD PTR [rbp-16]
        mov     rdi, rax
        call    rdx
        mov     eax, 0
        leave
        ret
vtable for DeriveA:
        .quad   0
        .quad   typeinfo for DeriveA
        .quad   DeriveA::do_a()
        .quad   DeriveA::do_a2()
```

流程没有任何区别，我们跳过。

## 多继承

现在开始，情况才会变得有趣起来，我们让`DeriveA`继承两个基类：

```cpp
class BaseA {
public:
    virtual void do_a() = 0;
};

class BaseB {
public:
    virtual void do_b() = 0;
};

class DeriveA : public BaseA , public BaseB {
public:
    void do_a() override {}
    void do_b() override {}
};

int
main()
{
  DeriveA instance{};
  BaseA* pa = &instance;
  BaseB* pb = &instance;

  pa->do_a();
  pb->do_b();
}
```

汇编结果如下：

```asm
        .set    .LTHUNK0,DeriveA::do_b()
non-virtual thunk to DeriveA::do_b():
        sub     rdi, 8
        jmp     .LTHUNK0
main:
        push    rbp
        mov     rbp, rsp
        sub     rsp, 32
        mov     eax, OFFSET FLAT:vtable for DeriveA+16
        mov     QWORD PTR [rbp-32], rax
        mov     eax, OFFSET FLAT:vtable for DeriveA+48
        mov     QWORD PTR [rbp-24], rax
        lea     rax, [rbp-32]
        mov     QWORD PTR [rbp-8], rax
        lea     rax, [rbp-32]
        add     rax, 8
        mov     QWORD PTR [rbp-16], rax
        mov     rax, QWORD PTR [rbp-8]
        mov     rax, QWORD PTR [rax]
        mov     rdx, QWORD PTR [rax]
        mov     rax, QWORD PTR [rbp-8]
        mov     rdi, rax
        call    rdx
        mov     rax, QWORD PTR [rbp-16]
        mov     rax, QWORD PTR [rax]
        mov     rdx, QWORD PTR [rax]
        mov     rax, QWORD PTR [rbp-16]
        mov     rdi, rax
        call    rdx
        mov     eax, 0
        leave
        ret
vtable for DeriveA:
        .quad   0
        .quad   typeinfo for DeriveA
        .quad   DeriveA::do_a()
        .quad   DeriveA::do_b()
        .quad   -8
        .quad   typeinfo for DeriveA
        .quad   non-virtual thunk to DeriveA::do_b()
```

我们发现，栈帧的大小变为了32个字节，这是两个基类指针和我们子类的总大小，指针总共占16字节，说明我们现在的实例大小是16字节，其中包含了两个虚表指针（每个基类都有一个虚表指针）。

每个基类都有一个虚表指针，而且这两个指针实际上是不同的，在构造时，我们会发现：

```asm
        mov     eax, OFFSET FLAT:vtable for DeriveA+16
        mov     QWORD PTR [rbp-32], rax
        mov     eax, OFFSET FLAT:vtable for DeriveA+48
        mov     QWORD PTR [rbp-24], rax
```

对于`BaseA`，我们将虚表指针偏移了16字节，但是对于`BaseB`，我们将虚表指针偏移了48字节，观察虚表结构：

```asm
vtable for DeriveA:
        .quad   0
        .quad   typeinfo for DeriveA
        .quad   DeriveA::do_a()
        .quad   DeriveA::do_b()
        .quad   -8
        .quad   typeinfo for DeriveA
        .quad   non-virtual thunk to DeriveA::do_b()
```

我们发现，`BaseA`的虚表指针仍然由`DeriveA::do_a()`起始，然而，`BaseB`的虚表指针却从奇怪的`non-virtual thunk to DeriveA::do_b()`起始，这是个什么东西？我们直接顺着符号找到该位置：

```asm
        .set    .LTHUNK0,DeriveA::do_b()
non-virtual thunk to DeriveA::do_b():
        sub     rdi, 8
        jmp     .LTHUNK0
```

`thunk`是一种特殊的函数，它们一般是编译器生成的，用来包装其他函数的装饰器，这里生成的`thunk`，在调用`do_b`之前，我们将`rdi`减少了8，我们上文分析过，`rdi`在调用中存储的是`this`指针，因此，该语句的含义是将`this`指针向前移动8字节。

为什么要移动8字节，我们将目光转向初始化`BaseB`类型的指针上：

```asm
        lea     rax, [rbp-32]
        add     rax, 8
        mov     QWORD PTR [rbp-16], rax
```

不难发现，编译器在初始化`BaseB`的指针时，将指针向后移动了8字节，其目的是为了保证该指针确实是`BaseB`的指针，换句话说，`BaseB`指针必须符合`BaseB`的内存模型，因此我们要跳过属于`BaseA`的内存。

而在调用`do_b`时，该函数是由`DeriveA`实现的，它需要的是`DeriveA`的指针，`thunk`的目的就是将`BaseB`的指针转换回`DeriveA`的指针。

我们现在可以正确的审视虚表了，对于`DeriveA`的虚函数表来说，它需要有三部分：

- `DeriveA`指针使用的表：从第二项开始
- `BaseA`指针使用的表：从第二项开始
- `BaseB`指针使用的表：从第六项开始

而`BaseA`不需要调整偏移量，只是因为其恰好排布在子类的最开始而已。

我们在看虚表头部的第一项，对于`BaseA`来说，它是`0`，对于`BaseB`来说，它是`-8`，我们就能猜到，该位置记录的是基类指针距离实际子类指针的偏移量。

> GCC 会尽量保证第一个父类位于子类的起始以防止我们生成不必要的`thunk`函数。

## 虚继承（菱形继承）

菱形继承无疑是对象结构最复杂的 Case ，我们只分析简单的菱形继承情况：

```cpp
class BaseA {
public:
    virtual void do_a() = 0;
};

class BaseDeriveA : virtual public BaseA {
public:
    virtual void do_a() = 0;
};

class BaseDeriveB : virtual public BaseA {
public:
    virtual void do_a() = 0;
};

class DeriveA : public BaseDeriveA , public BaseDeriveB {
public:
    void do_a() override {}
};

int
main()
{
  DeriveA instance{};
  BaseDeriveA* pa = &instance;
  BaseDeriveB* pb = &instance;

  pa->do_a();
  pb->do_a();
}
```

汇编结果如下：

```asm
        .set    .LTHUNK0,DeriveA::do_a()
virtual thunk to DeriveA::do_a():
        mov     r10, QWORD PTR [rdi]
        add     rdi, QWORD PTR [r10-24]
        jmp     .LTHUNK0
        .set    .LTHUNK1,DeriveA::do_a()
non-virtual thunk to DeriveA::do_a():
        sub     rdi, 8
        jmp     .LTHUNK1
BaseA::BaseA() [base object constructor]:
        push    rbp
        mov     rbp, rsp
        mov     QWORD PTR [rbp-8], rdi
        mov     edx, OFFSET FLAT:vtable for BaseA+16
        mov     rax, QWORD PTR [rbp-8]
        mov     QWORD PTR [rax], rdx
        nop
        pop     rbp
        ret
        .set    BaseA::BaseA() [complete object constructor],BaseA::BaseA() [base object constructor]
BaseDeriveA::BaseDeriveA() [base object constructor]:
        push    rbp
        mov     rbp, rsp
        mov     QWORD PTR [rbp-8], rdi
        mov     QWORD PTR [rbp-16], rsi
        mov     rax, QWORD PTR [rbp-16]
        mov     rdx, QWORD PTR [rax]
        mov     rax, QWORD PTR [rbp-8]
        mov     QWORD PTR [rax], rdx
        mov     rax, QWORD PTR [rbp-8]
        mov     rax, QWORD PTR [rax]
        sub     rax, 32
        mov     rax, QWORD PTR [rax]
        mov     rdx, rax
        mov     rax, QWORD PTR [rbp-8]
        add     rdx, rax
        mov     rax, QWORD PTR [rbp-16]
        mov     rax, QWORD PTR [rax+8]
        mov     QWORD PTR [rdx], rax
        nop
        pop     rbp
        ret
BaseDeriveB::BaseDeriveB() [base object constructor]:
        push    rbp
        mov     rbp, rsp
        mov     QWORD PTR [rbp-8], rdi
        mov     QWORD PTR [rbp-16], rsi
        mov     rax, QWORD PTR [rbp-16]
        mov     rdx, QWORD PTR [rax]
        mov     rax, QWORD PTR [rbp-8]
        mov     QWORD PTR [rax], rdx
        mov     rax, QWORD PTR [rbp-8]
        mov     rax, QWORD PTR [rax]
        sub     rax, 32
        mov     rax, QWORD PTR [rax]
        mov     rdx, rax
        mov     rax, QWORD PTR [rbp-8]
        add     rdx, rax
        mov     rax, QWORD PTR [rbp-16]
        mov     rax, QWORD PTR [rax+8]
        mov     QWORD PTR [rdx], rax
        nop
        pop     rbp
        ret
DeriveA::DeriveA() [complete object constructor]:
        push    rbp
        mov     rbp, rsp
        sub     rsp, 16
        mov     QWORD PTR [rbp-8], rdi
        mov     rax, QWORD PTR [rbp-8]
        mov     rdi, rax
        call    BaseA::BaseA() [base object constructor]
        mov     rax, QWORD PTR [rbp-8]
        mov     edx, OFFSET FLAT:VTT for DeriveA+8
        mov     rsi, rdx
        mov     rdi, rax
        call    BaseDeriveA::BaseDeriveA() [base object constructor]
        mov     rax, QWORD PTR [rbp-8]
        add     rax, 8
        mov     edx, OFFSET FLAT:VTT for DeriveA+24
        mov     rsi, rdx
        mov     rdi, rax
        call    BaseDeriveB::BaseDeriveB() [base object constructor]
        mov     edx, OFFSET FLAT:vtable for DeriveA+32
        mov     rax, QWORD PTR [rbp-8]
        mov     QWORD PTR [rax], rdx
        mov     edx, OFFSET FLAT:vtable for DeriveA+32
        mov     rax, QWORD PTR [rbp-8]
        mov     QWORD PTR [rax], rdx
        mov     edx, OFFSET FLAT:vtable for DeriveA+72
        mov     rax, QWORD PTR [rbp-8]
        mov     QWORD PTR [rax+8], rdx
        nop
        leave
        ret
main:
        push    rbp
        mov     rbp, rsp
        sub     rsp, 32
        mov     QWORD PTR [rbp-32], 0
        mov     QWORD PTR [rbp-24], 0
        lea     rax, [rbp-32]
        mov     rdi, rax
        call    DeriveA::DeriveA() [complete object constructor]
        lea     rax, [rbp-32]
        mov     QWORD PTR [rbp-8], rax
        lea     rax, [rbp-32]
        add     rax, 8
        mov     QWORD PTR [rbp-16], rax
        mov     rax, QWORD PTR [rbp-8]
        mov     rax, QWORD PTR [rax]
        mov     rdx, QWORD PTR [rax]
        mov     rax, QWORD PTR [rbp-8]
        mov     rdi, rax
        call    rdx
        mov     rax, QWORD PTR [rbp-16]
        mov     rax, QWORD PTR [rax]
        mov     rdx, QWORD PTR [rax]
        mov     rax, QWORD PTR [rbp-16]
        mov     rdi, rax
        call    rdx
        mov     eax, 0
        leave
        ret
vtable for DeriveA:
        .quad   0
        .quad   0
        .quad   0
        .quad   typeinfo for DeriveA
        .quad   DeriveA::do_a()
        .quad   -8
        .quad   -8
        .quad   -8
        .quad   typeinfo for DeriveA
        .quad   non-virtual thunk to DeriveA::do_a()
VTT for DeriveA:
        .quad   vtable for DeriveA+32
        .quad   construction vtable for BaseDeriveA-in-DeriveA+32
        .quad   construction vtable for BaseDeriveA-in-DeriveA+32
        .quad   construction vtable for BaseDeriveB-in-DeriveA+32
        .quad   construction vtable for BaseDeriveB-in-DeriveA+64
        .quad   vtable for DeriveA+32
        .quad   vtable for DeriveA+72
construction vtable for BaseDeriveA-in-DeriveA:
        .quad   0
        .quad   0
        .quad   0
        .quad   typeinfo for BaseDeriveA
        .quad   __cxa_pure_virtual
construction vtable for BaseDeriveB-in-DeriveA:
        .quad   -8
        .quad   0
        .quad   0
        .quad   typeinfo for BaseDeriveB
        .quad   __cxa_pure_virtual
        .quad   8
        .quad   8
        .quad   typeinfo for BaseDeriveB
        .quad   __cxa_pure_virtual
vtable for BaseA:
        .quad   0
        .quad   typeinfo for BaseA
        .quad   __cxa_pure_virtual
```

Oops，即便是最简单的菱形继承 Case ，其复杂度也远胜于我们刚刚分析过的任何汇编，不过不用着急，我们先从最大的变化点着手。

我们发现，这次，编译器生成了一系列构造函数：

```asm
BaseA::BaseA() [base object constructor]:
BaseDeriveA::BaseDeriveA() [base object constructor]:
BaseDeriveB::BaseDeriveB() [base object constructor]:
DeriveA::DeriveA() [complete object constructor]:
```

什么是`base-object-constructor`和`complete-object-constructor`？我们可以简单区分为，我们在 C++ 中主动调用的是`complete-object-constructor`，它完成了对象初始化的完整流程；而由编译器在构造函数中隐式调用的是`base-object-constructor`，它只完成对象构造中的部分流程。

我们从`DeriveA::DeriveA()`着手：

```asm
        mov     QWORD PTR [rbp-8], rdi
        mov     rax, QWORD PTR [rbp-8]  
        mov     rdi, rax                                        // this从rdi复制到[rbp-8]
        call    BaseA::BaseA() [base object constructor]        // 调用基类构造
        mov     rax, QWORD PTR [rbp-8]                          // 恢复this指针
        mov     edx, OFFSET FLAT:VTT for DeriveA+8              
        mov     rsi, rdx                                                // 将VTT作为第二个参数
        mov     rdi, rax                                                // this第一个参数
        call    BaseDeriveA::BaseDeriveA() [base object constructor]    // 调用中间类构造
        mov     rax, QWORD PTR [rbp-8]
        add     rax, 8
        mov     edx, OFFSET FLAT:VTT for DeriveA+24
        mov     rsi, rdx
        mov     rdi, rax
        call    BaseDeriveB::BaseDeriveB() [base object constructor]    // 与上面几乎一致，不同的是BaseB的指针进行了位移8
        mov     edx, OFFSET FLAT:vtable for DeriveA+32                  // 仍然是移动到第一个虚函数
        mov     rax, QWORD PTR [rbp-8]
        mov     QWORD PTR [rax], rdx                                    // 虚表指针赋值（给BaseA）
        mov     edx, OFFSET FLAT:vtable for DeriveA+32
        mov     rax, QWORD PTR [rbp-8]
        mov     QWORD PTR [rax], rdx                                    // 同上，但是这次是给BaseDeriveA的，但因为起始点相同，所以流程完全相同
        mov     edx, OFFSET FLAT:vtable for DeriveA+72
        mov     rax, QWORD PTR [rbp-8]
        mov     QWORD PTR [rax+8], rdx                                  // 同上，但是是给BaseDeriveB的，指向了`non-virtual thunk`
```

`BaseA`的`base-object-constructor`：

```asm
        mov     QWORD PTR [rbp-8], rdi
        mov     edx, OFFSET FLAT:vtable for BaseA+16
        mov     rax, QWORD PTR [rbp-8]
        mov     QWORD PTR [rax], rdx                    // 初始化了BaseA的虚表
        .set    BaseA::BaseA() [complete object constructor],BaseA::BaseA() [base object constructor]

```

我们在这一步是为了确保`BaseA`指针能够正常发挥它的作用，因此实际上这个`base-object-constructor`完全没有用处，因为它的虚表初始化是我们之后做的。

因为对于基类来说，构造简单，所以它还充当了`complete-object-constructor`。

`BaseDeriveA`的`base-object-constructor`：

```asm
        mov     QWORD PTR [rbp-8], rdi          // 存 this 指针到栈上
        mov     QWORD PTR [rbp-16], rsi         // 存 VTT 到栈上
        mov     rax, QWORD PTR [rbp-16]
        mov     rdx, QWORD PTR [rax]            // 拿 VTT 首位
        mov     rax, QWORD PTR [rbp-8]
        mov     QWORD PTR [rax], rdx            // 把 VTT首位移动到this的头部（construction vtable for BaseDeriveX-in-DeriveA+32）指向这个虚假的vtable的对应起点
        mov     rax, QWORD PTR [rbp-8]
        mov     rax, QWORD PTR [rax]
        sub     rax, 32                         // 取 虚假虚表， 向前四个字节，就是我们前面提到的偏移量
        mov     rax, QWORD PTR [rax]
        mov     rdx, rax                        // 拿偏移量
        mov     rax, QWORD PTR [rbp-8]
        add     rdx, rax                        // 根据偏移量计算this指针真正的起点
        mov     rax, QWORD PTR [rbp-16]         // VTT
        mov     rax, QWORD PTR [rax+8]          // VTT第二位（A+32/B+64）
        mov     QWORD PTR [rdx], rax            // 赋值给实际this的首位
```
