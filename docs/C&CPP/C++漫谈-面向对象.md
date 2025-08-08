---
title: C++漫谈-面向对象
createTime: 2025/08/08 14:35:34
permalink: /article/nin3762j/
tags:
- C++
---

面向对象是一种以对象为中心的编程思想，其三大特征是封装、继承和多态，这是比较官方的说法。

笔者认为，面向对象和面向过程，实际上是从两个方面去思考问题，我们最终的目的都是要解决需求，我们举一个例子，现在我们要烹饪：

- 对于面向过程来说，我们必须要知道要做什么菜，比如我们要做炒鸡蛋，那么面向过程才能告诉你：我们要先打蛋，切葱切辣椒，起锅烧油...
- 对于面向对象来说，我们不需要知道我们要做什么，因为无论要做什么，我们都需要原料和厨具，而他们的处理和使用方法都是大体一致的，而将二者组合在一起的流程，我们需要的其实是菜谱。

这里关键的区别在于，面向对象在达成目的之前，会先将需求拆分为由对象组织成的逻辑链，每个对象之间不知道对方的工作细节，只知道对方**是什么**，这样的好处就是任何**是**该对象的组件都能够轻易地替换原先的组件，不必对整个流程大动干戈。

说回刚刚烹饪的例子，原材料就是一个对象，而鸡蛋、葱和辣椒**是**原材料，这体现了原材料和后者之间的**继承关系**；此三者都能够进行“处理”，但处理的过程不尽相同，这就是**多态**，外界不必全然了解我们的“处理”操作，这就叫做**封装**。

## 现实案例

我们来一个比较实际的例子，笔者正在编写一个邮件客户端，该客户端要支持多种邮件协议（SMTP、POP3、IMAP4），按照常理，我们要编写三段完全不同的客户端逻辑，这是不可避免的。但我们的UI层不应该去了解这些细节，如果使用面向过程的逻辑编写，每次我们用到客户端功能，都要判断一下正在使用哪个协议，进行不同的操作，这样不现实也难以维护！这个时候，面向对象的思维告诉我们，我们需要的一个**客户端接口**，也就是基类：

```cpp
class BaseClient {
public:
  BaseClient() = default;
  virtual ~BaseClient() = default;

  virtual void login(const std::string& username, const std::string& password) = 0;
  virtual void send(const char* data) = 0;
};
```

现在，我们有了一个基类，也就是上文提到的对象或者接口，它声明，一切符合`Client`的类都需要有`login`和`send`方法。现在，我们让实际的客户端分别继承该类：

> 当然，这里的类只是笔者需求的简化版本，笔者的项目实际上有更为复杂的需求

```cpp
class IMAPClient {
public:
  IMAPClient() = default;
  ~IMAPClient() override = default;

  void login(const std::string& username, const std::string& password) override 
  {
    // imap login logic
  }

  void send(const char* data) override 
  {
    // imap send logic
  }
};

class SMTPClient {
public:
  SMTPClient() = default;
  ~SMTPClient() override = default;

  void login(const std::string& username, const std::string& password) override 
  {
    // smtp login logic
  }  
  
  void send(const char* data) override 
  {
    // smtp send logic
  }
};

class POPClient {
public:
  POPClient() = default;
  ~POPClient() override = default;

  void login(const std::string& username, const std::string& password) override 
  {
    // pop login logic
  }

  void send(const char* data) override 
  {
    // pop send logic
  }
};
```

任何依赖了一个客户端的过程，我们都可以声明一个`BaseClient`的指针或引用，当使用该过程时，我们可以任意传入一个`IMAPClient`、`SMTPClient`或者`POPClient`的指针或引用，这样就达成了逻辑复用，比如，下面这个函数对三种客户端全部适用：

```cpp
void 
send_hello_email(BaseClient& client,
                 const std::string& username,
                 const std::string& password)
{
  client.login();
  client.send("HELLO!");
}
```

## C++面向对象的背后

我们现在聊完了面向对象能干什么，现在我们该聊聊，C++是怎么实现它的。

我们都知道，在一般的编译器实现中，一个类实例的内存模型实际上与结构体并没有什么太大的区别（在没有面向对象时），它们实例的所有内存空间都用来存储其成员变量，至于成员函数，他们实际上就是带有隐式`this`参数的全局函数，静态函数和成员就更不用提了，因此，要让一个类**继承**另一个类，我们首先需要解决的便是成员变量：

> 当然，上面我们只是讨论了实例的内存模型，类本身还有其元信息和我们提到的成员函数、静态成员这些部分，他们广义上也应该算作类的一部分。

### 成员变量

成员变量如何被容纳进子类中，这个问题实际上很简单：继承一个类，相当于同时包含了这个类所有的成员变量，至于实际的变量顺序，没有标准规定，不过对于GCC和Clang，他们一般会将基类的内存空间放在子类后面。

> 继承要保证基类结构的完整性，所以编译器不会将基类的内存对齐空间让渡给子类的成员变量。

在这种情况下，我们可以认为子类的大小是基类大小和子类实际大小的和，当然，这是我们不考虑虚函数得到的。

### 成员函数（虚函数）

我们多态的实现依靠了虚函数，其行为相交一般函数有很大不同，虚函数是由基类规范的，根据子类不同而实现不同的函数，为了实现虚函数，我们需要一种方法能在运行时判断我们该调用什么函数。

不难注意到，即便在使用时我们无法区分各个子类，但在构造时我们是清楚地知道它是谁的，于是，我们可以在构造时为这个类塞入一个列表，这个表标记了我们类中所有的虚函数，在调用虚函数时，我们不直接使用函数符号，而是在这张表内索引到函数指针，再调用这个函数指针，就能够找到我们真正要调用的函数。这个表，就是我们说的**虚表**或者**虚函数表**。

我们的下一个问题是，这张表在类模型中的什么位置？我们简单地汇编一下：

```cpp
class Base {
private:
    int _a{0};
public:
    virtual void foo() {}
};

class Derive : public Base {
private:
    int _b{1};

public:
    void foo() override {}
};

int main() {
    Base b{};
    Derive d{};

    Base* pd = &d;
    pd->foo();
}
```

使用GCC15，得到以下汇编（这里使用的是`Compiler Explorer`，其输出与正常编译器有细微的不同）：

```asm
Base::foo():
        push    rbp
        mov     rbp, rsp
        mov     QWORD PTR [rbp-8], rdi
        nop
        pop     rbp
        ret
Derive::foo():
        push    rbp
        mov     rbp, rsp
        mov     QWORD PTR [rbp-8], rdi
        nop
        pop     rbp
        ret
main:
        push    rbp
        mov     rbp, rsp
        sub     rsp, 48
        mov     eax, OFFSET FLAT:vtable for Base+16
        mov     QWORD PTR [rbp-32], rax
        mov     DWORD PTR [rbp-24], 0
        mov     eax, OFFSET FLAT:vtable for Derive+16
        mov     QWORD PTR [rbp-48], rax
        mov     DWORD PTR [rbp-40], 0
        mov     DWORD PTR [rbp-36], 1
        lea     rax, [rbp-48]
        mov     QWORD PTR [rbp-8], rax
        mov     rax, QWORD PTR [rbp-8]
        mov     rax, QWORD PTR [rax]
        mov     rdx, QWORD PTR [rax]
        mov     rax, QWORD PTR [rbp-8]
        mov     rdi, rax
        call    rdx
        mov     eax, 0
        leave
        ret
vtable for Derive:
        .quad   0
        .quad   typeinfo for Derive
        .quad   Derive::foo()
vtable for Base:
        .quad   0
        .quad   typeinfo for Base
        .quad   Base::foo()
typeinfo for Derive:
        .quad   vtable for __cxxabiv1::__si_class_type_info+16
        .quad   typeinfo name for Derive
        .quad   typeinfo for Base
typeinfo name for Derive:
        .string "6Derive"
typeinfo for Base:
        .quad   vtable for __cxxabiv1::__class_type_info+16
        .quad   typeinfo name for Base
typeinfo name for Base:
        .string "4Base"
```

我们单独截取构造函数：

```asm
        mov     eax, OFFSET FLAT:vtable for Derive+16
        mov     QWORD PTR [rbp-48], rax
        mov     DWORD PTR [rbp-40], 0
        mov     DWORD PTR [rbp-36], 1
```

首先我们要知道栈底在高地址，栈是向低地址增长的，也就是说，`rbp-48`的位置一定在类的末尾，而`rbp-36`的位置一定在类的最开始。

我可以发现，在GCC15中，虚表位于类的末尾，其中包括类中所有的虚函数和类的部分元信息地址，在构造时，构造函数会按照虚表，基类，成员变量的顺序对实例进行构造（但这并不代表构造只能这么进行）。

我们来看调用虚函数的部分：

```asm
        mov     rax, QWORD PTR [rbp-8]
        mov     rax, QWORD PTR [rax]
        mov     rdx, QWORD PTR [rax]
        mov     rax, QWORD PTR [rbp-8]
        mov     rdi, rax
        call    rdx
```

这里的栈中存储着我们的对象实例，可见，调用虚函数时会先从虚表中取出函数指针再调用，这比一般的函数调用多了一个步骤，会导致性能损失。

### 虚继承

虚继承是为了解决菱形继承问题而存在的，我们现在很少遇到这种场景。

菱形继承的含义是两组中间子类源于相同的基类，又被同一个类继承，形成了菱形的形状，这样会导致最开始的基类在最终的子类中有两份，解决问题的最终方案是使用虚继承，即继承最开始的基类时，使用`public virtual`而非简单的`public`：

在GCC中，虚继承会将基类从子类中提出并放在最终子类中，在构造两个中间子类时，将基类以某种方式隐式传递给他们，受限于笔者能力和篇幅，我们不在此分析其汇编。

## 总结

很多时候，笔者相比具体实现还是更看重语义的正确性，面向对象实际上是给予了我们更强大的逻辑工具，让我们能够构建更灵活的代码语义。笔者认为，我们应该培养从语义角度出发看待一些编程问题的能力，在某些情况下，这样的能力有助于我们化繁为简，窥视复杂结构中的真谛。
