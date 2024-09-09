---
title: 浅析C++所有权机制
tags:
- C++
- 所有权
createTime: 2024/04/04 09:39:41
permalink: /article/w5vsqu3d/
---

说到现代C++，我们就不得不提到智能指针，这些模板类自C++11起被引入进标准库，不涉及操作系统、不涉及繁琐的内存申请流程，甚至你自己就能实现一个简单的智能指针。但即便如此，直到今天，仍然有人没有了解过，也不去使用智能指针。

实际上我认为，智能指针为 C++ 这门语言带来了一个新的概念，即所有权。智能指针表面上管理了一块由用户申请的内存，但实际上它是管理了这一块资源的所有权。这一概念在 Rust 语言中被更加明确地表达出来，但在 C++ 中，我们也可以通过智能指针来实现。

## 所有权

为什么会产生所有权机制？回想一下你在古老的 C/C++ 工作时，你不得不手动申请内存，手动管理他们的销毁时机，使用对象，还要时刻提防可能存在的拷贝操作（后来还要提防一些移动操作）。这些东西一开始就该由程序员管理，但是别忘了，我们在谈论一个现代语言！

在我看来，现代语言是高级语言的一个子集，它们应当在某一领域，解决过去程序员们的痛点。专注于底层的现代语言，如 Zig，它保留了内存管理的能力、并在语言层面支持了 Allocator, 扩充了内存管理的能力。而另一些现代语言，如 Rust，它在语言层面支持了所有权机制，使得程序员不再需要关心内存的申请和释放。

我们在谈论C++，从C++11开始，这门古老的语言开始了自己的现代化之路，而其中一个最显著的改变就是智能指针和其带来的所有权机制。

简单来说，所有权是一种属于关系，在这种关系下定义的对象其本身不会有隐式的复制和移动操作，将一个对象赋值、传递给另一个对象，只不过是将所有权转移给了另一个对象，在这个过程中，没有任何内存的拷贝和移动操作。

## 所有权的实现

对于 C++ 来说，所有权有两种，一种是独占所有权，另一种是共享所有权。独占所有权是指一个对象只能被一个所有者拥有，而共享所有权是指一个对象可以被多个所有者拥有。独占所有权在 C++ 中由 `std::unique_ptr` 实现，而共享所有权则由 `std::shared_ptr` 实现。

在一些场景（尤其是嵌入式领域）中，我们通常会针对每一个通信协议创建一个类，他们负责与其他设备的通信实现，而一些上层应用类，它们会需要调用这些协议类的方法。

创建这个协议类有两种方式：

- 由应用类自己创建
- 从外部创建，传递给应用类

但一般情况下，这些协议类的 IO 通道都是有限的，我们不希望应用类创建多个相同的协议类，这时候我们就可以使用智能指针来管理这些协议类的所有权。

由此可以引申出两种情况：

- 一个协议类只服务于一个应用类，这时候我们可以使用 `std::unique_ptr` 来管理这个协议类的所有权
- 一个协议类可能会被多个应用类使用，这时候我们可以使用 `std::shared_ptr` 来管理这个协议类的所有权

## `std::unique_ptr`

`std::unique_ptr` 是一个独占所有权的智能指针，它只能有一个所有者，当这个所有者被销毁时，它所管理的资源也会被销毁。

```cpp
#include <memory>

class Protocol {
  // ...
};

class Application {
 public:
  // 构造时，将协议类的所有权转移给 Application
  Application(std::unique_ptr<Protocol> protocol) : protocol_(std::move(protocol)) {}

 private:
  std::unique_ptr<Protocol> protocol_;
};

int main() {
  // 创建一个协议类，此时所有权掌握在 main 函数中
  std::unique_ptr<Protocol> protocol = std::make_unique<Protocol>();

  // 创建一个应用类，将协议类的所有权转移给 Application
  Application app(std::move(protocol));
}
```

## `std::shared_ptr`

`std::shared_ptr` 是一个共享所有权的智能指针，它可以有多个所有者，当最后一个所有者被销毁时，它所管理的资源也会被销毁。

```cpp
#include <memory>

class Protocol {
  // ...
};

class Application {
 public:
  // 构造时，将协议类的所有权转移给 Application
  Application(std::shared_ptr<Protocol> protocol) : protocol_(protocol) {}

 private:
  std::shared_ptr<Protocol> protocol_;
};

int main() {
  // 创建一个协议类，此时所有权掌握在 main 函数中
  std::shared_ptr<Protocol> protocol = std::make_shared<Protocol>();

  // 创建一个应用类，将协议类的所有权转移给 Application
  Application app(protocol);

  // 创建另一个应用类，共享协议类的所有权
  Application app2(protocol);
}
```

## 论所有权的转让与移动

很多人都有一个误解，认为移动语义体现了所有权的转让，但是，二者是不同的。

不论什么情况下，移动构造一定会重新创建资源对象，而至于资源内部的数据是如何移动的，这是对象的实现决定的，但针对资源对象本身，在这个过程中一定会重新创建一个资源对象。

而所有权的转让是另一回事，它直接将自己拥有的资源本身交予了另一个对象，在这个过程中，没有任何资源的拷贝和移动操作（实际上，在计算机眼中，这个过程什么也没发生）。

有趣的一点是，所有权的转让这一操作的实现依靠了移动语义，`std::unique_ptr` 不允许拷贝，但允许移动，刚才我们提到移动一定会创建新对象，而`std::unqiue_ptr`的移动虽然创建了新的`std::unique_ptr`，但其内部的指针仍然指向同一个资源对象，这就是所有权的转让的实现。

`std::shared_ptr`维护了一个引用计数，这让它可以进行拷贝，也可以进行移动，引用计数会时刻保证资源对象的生命周期，当最后一个所有者被销毁时，资源对象也会被销毁。

## 论资源的所有者和引用者

上文我们忽略的一种情况，有一些类或函数并不拥有资源，但他们需要暂时的资源使用权。对于我们已经建立的资源所有权模型，每一种所有权模式都有其对应的引用类型。

`std::unique_ptr` 对应的引用类型是原生指针，它指向资源对象本身，但在语义上不拥有它，只是暂时的使用。

`std::shared_ptr` 对应的引用类型是 `std::weak_ptr`，它指向资源对象，但不会增加引用计数，当资源对象被销毁时，`std::weak_ptr` 会被置空。

```cpp
#include <memory>

class Protocol {
  // ...
};

class Application {
 public:
  // 构造时，将协议类的所有权转移给 Application
  Application(std::shared_ptr<Protocol> protocol) : protocol_(protocol) {}

 private:
  std::shared_ptr<Protocol> protocol_;
};

void foo(std::weak_ptr<Protocol> weak_protocol) {
  // 使用 weak_ptr
}

int main() {
  // 创建一个协议类，此时所有权掌握在 main 函数中
  std::shared_ptr<Protocol> protocol = std::make_shared<Protocol>();

  // 创建一个应用类，将协议类的所有权转移给 Application
  Application app(protocol);

  // 创建一个 weak_ptr，暂时使用协议类
  std::weak_ptr<Protocol> weak_protocol = protocol;

  // 调用函数，传递 weak_ptr
  foo(weak_protocol);
}
```

值得注意的一点是，`std::weak_ptr` 不能直接使用，它需要通过 `lock` 方法转换为 `std::shared_ptr` 才能使用。

## 总结

新的资源管理模型标志着现代 C++ 的到来，我一直秉承着一个观点——任何拥有内存申请和释放的程序都应当使用智能指针，这不仅仅是为了避免内存泄漏，更是为了通过所有权这一概念更好地构建应用逻辑模型。
