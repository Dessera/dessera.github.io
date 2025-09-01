---
title: 项目笔记-OrdOS操作系统01-启动流程
createTime: 2025/08/14 16:08:21
permalink: /article/d7qqxor8/
tags:
- 草稿
---

笔者在重写自己的操作系统内核，在这个过程中，我发现通过MBR+Loader+内核的三段式启动非常不方便，而且完全不好移植，因此，笔者前去了解了一下现代操作系统的启动流程：

关于Loader

我们都知道，传统操作系统中，需要使用Loader作为踏板来启动操作系统，Loader的作用是

- 按照ELF段加载内核
- 进行一些平台特定的设置（比如进入保护模式）

一般来说，在我们编写的操作系统DEMO中，这部分往往是我们自己编写的，但在现代操作系统中，我们往往有一个功能更强大的Generic Loader,想要达成通用的启动流程，我们就必须要有通用的“协议”来规定加载时的细则，这个协议，就是multiboot我们主要了解multiboot2

multiboot2

multiboot2是现代操作系统通用的启动协议，任何符合multiboot2规范的elf（或者镜像），都可以被支持multiboot2的启动器启动，在这个过程中，multiboot2会传递特定的参数给操作系统（包括当前环境的信息和用户信息），以帮助操作系统初始化

multiboot2要求，操作系统镜像的前 32768 字节内，必须包含一个名为 Multiboot2 header 的数据结构，并且起始地址必须以8bytes对齐（multiboot头的所有信息都必须以8bytes对齐）

我们简单看一下header的结构：

| 位置（`bytes`） | 类型 | 名称 | 描述 |
| ----- | ----- | ----- | ----- |
| 0 | u32 | magic | `0xE85250D6` |
| 4 | u32 | architecture | 架构代码，`i386`为`0` |
| 8 | u32 | header_length | 头部长度，包括所有`tag` |
| 12 | u32 | checksum | `-(magic + architecture + header_length)` |

接下来，为了让Loader知道我们的内核入口，我们还需要使用`tags`标记我们的入口：

有两种`tag`可以标记入口（其实是3种，但我们假设我们在i386下）：

EFI32 tag可以标记EFI启动下的入口，其结构如下：

| 位置（`bytes`） | 类型 | 名称 | 描述 |
| ----- | ----- | ----- | ----- |
| 0 | u16 | type | `8` |
| 2 | u16 | flags | `tag`的额外属性 |
| 4 | u32 | size | 该`tag`的长度 |
| 8 | u32 | entry_addr | 入口地址 |

还有通用的程序入口地址：

| 位置（`bytes`） | 类型 | 名称 | 描述 |
| ----- | ----- | ----- | ----- |
| 0 | u16 | type | `3` |
| 2 | u16 | flags | `tag`的额外属性 |
| 4 | u32 | size | 该`tag`的长度 |
| 8 | u32 | entry_addr | 入口地址 |

在EFI启动下，后者会被忽略，但在传统BIOS启动时，前者会报错（error: unsupported tag: 0x08），我们需要指定flags最低位为1,含义为该tag可选，因此，我们可以构建一个通用的启动头：

头文件：

```c
#define MULTIBOOT_HEADER_MAGIC 0xE85250D6

#define MULTIBOOT_HEADER_ARCH_1386 0

#define MULTIBOOT_HEADER_TAG_TYPE_END 0
#define MULTIBOOT_HEADER_TAG_TYPE_INFORMATION_REQUEST 1
#define MULTIBOOT_HEADER_TAG_TYPE_ADDRESS 2
#define MULTIBOOT_HEADER_TAG_TYPE_ENTRY_ADDRESS 3
#define MULTIBOOT_HEADER_TAG_TYPE_CONSOLE_FLAGS 4
#define MULTIBOOT_HEADER_TAG_TYPE_FRAMEBUFFER 5
#define MULTIBOOT_HEADER_TAG_TYPE_MODULE_ALIGN 6
#define MULTIBOOT_HEADER_TAG_TYPE_EFI_BS 7
#define MULTIBOOT_HEADER_TAG_TYPE_ENTRY_ADDRESS_EFI32 8
#define MULTIBOOT_HEADER_TAG_TYPE_ENTRY_ADDRESS_EFI64 9
#define MULTIBOOT_HEADER_TAG_TYPE_RELOCATABLE 10

#define MULTIBOOT_HEADER_TAG_FLAG_OPTIONAL 1

#define MULTIBOOT_HEADER(name, isa)                                            \
  name:                                                                        \
  .align 8;                                                                    \
  .long MULTIBOOT_HEADER_MAGIC;                                                \
  .long isa;                                                                   \
  .long name##_end - name;                                                     \
  .long - (MULTIBOOT_HEADER_MAGIC + isa + name##_end - name);

#define MULTIBOOT_HEADER_END(name) name##_end:

#define MULTIBOOT_HEADER_TAG_EFI32_ENTRY(name, addr)                           \
  name:                                                                        \
  .align 8;                                                                    \
  .short MULTIBOOT_HEADER_TAG_TYPE_ENTRY_ADDRESS_EFI32;                        \
  .short MULTIBOOT_HEADER_TAG_FLAG_OPTIONAL;                                   \
  .long name##_end - name;                                                     \
  .long addr;                                                                  \
  name##_end:

#define MULTIBOOT_HEADER_TAG_BIOS_ENTRY(name, addr)                            \
  name:                                                                        \
  .align 8;                                                                    \
  .short MULTIBOOT_HEADER_TAG_TYPE_ENTRY_ADDRESS;                              \
  .short 0;                                                                    \
  .long name##_end - name;                                                     \
  .long addr;                                                                  \
  name##_end:

#define MULTIBOOT_HEADER_TAG_END(name)                                         \
  name:                                                                        \
  .align 8;                                                                    \
  .short MULTIBOOT_HEADER_TAG_TYPE_END;                                        \
  .short 0;                                                                    \
  .long name##_end - name;                                                     \
  name##_end:
```

汇编：

```asm
.section .text.init, "ax"

  .globl _start
_start:
  // start logic

.section .rodata.init.multiboot, "a"
  MULTIBOOT_HEADER(_multiboot_header, MULTIBOOT_HEADER_ARCH_1386)
    MULTIBOOT_HEADER_TAG_EFI32_ENTRY(_multiboot_efi32_entry, _start)
    MULTIBOOT_HEADER_TAG_BIOS_ENTRY(_multiboot_bios_entry, _start)
    MULTIBOOT_HEADER_TAG_END(_multiboot_end)
  MULTIBOOT_HEADER_END(_multiboot_header)
```

注意，这里为了保证符合multiboot2规范，笔者将.rodata.init编译在了.text.init前面（可以不这么做，一般情况下，我们的start部分都不会长于32768字节）

我们也可以不指定这些tag,因为在没有这些tag的情况下，loader会直接跳转到我们内核的最开始：

```asm
.section .text.init, "ax"

  .globl _start
_start:
  jmp multiboot_start:

multiboot_header:
  MULTIBOOT_HEADER(_multiboot_header, MULTIBOOT_HEADER_ARCH_1386)
    MULTIBOOT_HEADER_TAG_EFI32_ENTRY(_multiboot_efi32_entry, _start)
    MULTIBOOT_HEADER_TAG_BIOS_ENTRY(_multiboot_bios_entry, _start)
    MULTIBOOT_HEADER_TAG_END(_multiboot_end)
  MULTIBOOT_HEADER_END(_multiboot_header)

multiboot_start:
  // start logic
```

笔者最后还是选择了前者，这样更**规范**一些。

multiboot规范确定了进入内核时的计算机状态，在i386上，这个时候我们已经进入了保护模式，除此之外，我们的eax和ebx会被放入特殊的值

eax：magic 0x36D76289
ebx：一个变长结构，以tags的形式组织系统信息

简单来说，我们在进入内核后，要处理以下问题：

- 新的函数栈：我们不能继续用Loader的栈
- 清空eflags
- 解析multiboot参数

处理完这些信息后，我们能得到对于系统初始化来说最重要的信息（启动参数、内存），我们接下来关注启动流程：

一般来说，我们习惯临时在数据段中申请一块内存来当作函数栈，因为我们还没有初始化页表（也就是说，现在我们并没有处于内核虚拟空间），最重要的是，我们的内存子系统还没有初始化（栈也没初始化），这个时候想要分配内存是极为困难的，但鉴于此时我们的栈不会有过大的增长，我们可以直接在数据段里防止一块区域作为我们的临时栈：

```asm
.section .bss.init, "wa"
_boot_stack:
  .zero ORDOS_INIT_STACKSIZE
```

然后，在_start中首先加载栈：

```asm
movl $(_boot_stack + ORDOS_INIT_STACKSIZE), %esp
```

这里，`ORDOS_INIT_STACKSIZE`的大小是0x1000 （4kb）
