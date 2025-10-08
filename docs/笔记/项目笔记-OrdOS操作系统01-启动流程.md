---
title: 项目笔记-OrdOS操作系统01-启动流程
createTime: 2025/08/14 16:08:21
permalink: /article/d7qqxor8/
tags:
- OS
- C
- ASM
- Multiboot2
---

笔者在重写自己的操作系统内核，在这个过程中，我发现通过`MBR + Loader + Kernel`的三段式启动非常不方便，而且完全不好移植，因此，笔者前去了解了一下现代操作系统的启动流程。

> 注意，本文代码部分进行了一定的简化，省略了错误处理和参数检查流程，详细请参考[OrdOS](https://github.com/Dessera/OrdOS)，截至本文完成，所有的代码均托管于`ordos/v2`分支。

## Loader

我们都知道，传统操作系统中，需要使用 Loader 作为踏板来启动操作系统，Loader 的作用可以分为以下两个部分：

- 按照`elf`段加载内核
- 进行一些平台特定的设置（比如打开A20端口等）

在我们编写的轻量内核中，这部分往往是我们自己编写的，但在现代操作系统中，往往有一个功能更强大的“Generic Loader”，想要实现通用的启动流程，就必须要有通用的协议来规定加载时的细则，上位机开发中，这个协议一般是 Multiboot2 。

## Multiboot2

Multiboot2 是现代操作系统通用的启动协议，常见的 Loader 均支持该协议（例如GRUB2），其大致约定如下内容：

- 操作系统镜像的前`32768`字节内，必须包含 Multiboot2 头结构，其内存结构以`8`字节对齐
- Multiboot2 会传递初始化数据帮助内核进行初始化
- MUltiboot2 会负责一些架构层次的初始化

### Multiboot2 Header

Multiboot2 Header 是根据`tags`组织的变长结构，其包括一个头部和若干个`tag`节点，这里只列出其中比较主要的部分：

- 头部：

  | 位置（字节） | 类型 | 名称 | 描述 |
  | ----- | ----- | ----- | ----- |
  | 0 | `u32` | magic | `0xE85250D6` |
  | 4 | `u32` | architecture | 架构代码，`i386`为`0` |
  | 8 | `u32` | header_length | 头部长度，包括所有`tag` |
  | 12 | `u32` | checksum | `-(magic + architecture + header_length)` |

- EFI32 入口：

  | 位置（字节） | 类型 | 名称 | 描述 |
  | ----- | ----- | ----- | ----- |
  | 0 | `u16` | type | `8` |
  | 2 | `u16` | flags | `tag`的额外属性 |
  | 4 | `u32` | size | 该`tag`的长度 |
  | 8 | `u32` | entry_addr | 入口地址 |

- 通用入口（除 EFI 外）：

  | 位置（字节） | 类型 | 名称 | 描述 |
  | ----- | ----- | ----- | ----- |
  | 0 | `u16` | type | `3` |
  | 2 | `u16` | flags | `tag`的额外属性 |
  | 4 | `u32` | size | 该`tag`的长度 |
  | 8 | `u32` | entry_addr | 入口地址 |

> 在 EFI 启动下，后者会被忽略，但在传统 BIOS 启动时，前者会报错（error: unsupported tag: 0x08），我们需要指定`flags`最低位为1,含义为该`tag`可选。

我们根据上表构建启动头：

```asm
// multiboot.S

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

头文件：

```c
// multiboot.h

#pragma once

#define MULTIBOOT_HEADER_MAGIC 0xE85250D6

#define MULTIBOOT_HEADER_ARCH_1386 0

#define MULTIBOOT_HEADER_TAG_TYPE_END 0
#define MULTIBOOT_HEADER_TAG_TYPE_ENTRY_ADDRESS 3
#define MULTIBOOT_HEADER_TAG_TYPE_ENTRY_ADDRESS_EFI32 8

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

我们也可以不指定入口`tag`,因为在没有入口`tag`的情况下，Loader 会直接跳转到我们内核的最开始：

```asm
.section .text.init, "ax"

  .globl _start
_start:
  jmp multiboot_start:

multiboot_header:
  MULTIBOOT_HEADER(_multiboot_header, MULTIBOOT_HEADER_ARCH_1386)
    MULTIBOOT_HEADER_TAG_END(_multiboot_end)
  MULTIBOOT_HEADER_END(_multiboot_header)

multiboot_start:
  // start logic
```

刚刚提到，Multiboot2 在架构层面做了初始化工作，在`i386`上，这个时候我们已经打开了 A20 地址线，除此之外，`eax`和`ebx`会被放入特殊的值：

- `eax`：`0x36D76289`魔数
- `ebx`：一个变长结构，以`tags`的形式组织初始化信息

## Kernel Prelude

在进入内核后，要处理以下问题：

- 切换到新的函数栈
- 清空`eflags`
- 解析 Multiboot2 参数

因为我们还没有初始化内存子系统，这个时候想要分配内存是极为困难的，所以我们习惯临时在数据段中申请一块内存来当作函数栈：

```asm
.section .bss.init, "wa"
_boot_stack:
  .zero ORDOS_INIT_STACKSIZE
```

然后，在`_start`中首先加载栈：

```asm
movl $(_boot_stack + ORDOS_INIT_STACKSIZE), %esp
```

> 这里，`ORDOS_INIT_STACKSIZE`的大小是`0x1000` 也就是`4kb`。

然后，我们清除`eflags`：

```asm
pushl $0
popf
```

鉴于 Multiboot2 的`tags`比较难以解析，笔者建议使用C语言进行处理，在汇编侧进行调用：

```asm
pushl %ebx
pushl %eax
call kprelude
```

C语言函数：

```c
__asm_linkage __prelude void
kprelude(u32 magic, void* info);
```

我们的`kprelude`的工作也可以分为两部分：

- 解析`multiboot2`的`tags`，并传递给内核（作为初始化参数）
- 初始化早期内存管理

### 调用链分析

对于 Multiboot2 的`tags`，必须要声明的是，它和我们刚刚定义的头部`tags`完全不是一回事，现在我们要解析的`tags`是 Multiboot2 为我们获取的系统信息，其中比较重要的有**内存信息**和**启动参数**两部分。

因为正式进入内核需要我们加载内核虚拟空间，因此我们需要在 Prelude 阶段初始化一部分内存子系统来完成对页表的申请，基于以上需求，`kprelude`调用链可以简化为如下形式：

```plaintext
kprelude                # 初始化入口
  init_from_multiboot   # 解析 Multiboot2 Tags
    init_mmap           # 初始化内存信息
    init_cmdline        # 初始化启动参数
  init_mem              # 初始化早期内存管理
    init_bootmem        # 初始化自举内存分配器
    init_pagetable      # 初始化页表
    init_gdt            # 初始化GDT
```

### 解析 Multiboot2 Tags

Multiboot2 的`tag`基本都是变长的，但他们都有相同的前置结构：

```c
struct multiboot_tag
{
  u32 type;
  u32 size;
};
```

也就是说，我们可以先将地址转换为这个通用结构，通过`type`识别具体类型再进行一次转换，其中我们需要的`tags`有以下两种：

```c

#define MULTIBOOT_TAG_TYPE_END 0
#define MULTIBOOT_TAG_TYPE_CMDLINE 1
#define MULTIBOOT_TAG_TYPE_MMAP 6

struct multiboot_mmap
{
  struct multiboot_tag tag;
  u32 entry_size;
  u32 entry_version;
  struct multiboot_mmap_entry entries[0];
};

struct multiboot_cmdline
{
  struct multiboot_tag tag;
  char string[0];
};
```

这里我们用上了零长数组，代表结构体是变长的。

解析 Multiboot2 传入的指针时，需要注意传入的指针也是有头部的，我们直接略过他：

对应`kprelude`部分如下：

```c
struct init_info* init = vaccess(&__init);

__init_from_multiboot(init,
                      poffset(info, sizeof(struct multiboot_info_header)));
```

`multiboot_info_header`结构：

```c
struct multiboot_info_header
{
  u32 total_size;
  u32 reserved;
};
```

OrdOS 有对指针进行位移的宏`poffset`，我们向`__init_from_multiboot`传参时通过该宏略过了`multiboot_info_header`，下面是`poffset`的实现：

```c
#define poffset(ptr, offs) ((void*)((uintptr_t)(ptr) + (offs)))
```

OrdOS 还有专为初始化设计的结构体`__init`，因为其位于内核虚拟空间，所以要使用`vaccess`访问该结构体，`vaccess`是对`poffset`的封装：

```c
#define vaccess(ptr) (poffset(ptr, -ORDOS_KERNEL_VADDR))
```

`ORDOS_KERNEL_VADDR`是内核虚拟空间的起始地址，这里是`0xC0000000`。

在`__init_from_multiboot`中，遍历`tags`：

```c
__prelude static void
__init_from_multiboot(struct init_info* init, void* tags)
{
  struct multiboot_mmap* mmap = NULL;
  struct multiboot_cmdline* cmdline = NULL;

  for (struct multiboot_tag* tag = tags; tag->type != MULTIBOOT_TAG_TYPE_END;
       tag = poffset(tag, align_up(tag->size, MULTIBOOT_TAG_ALIGN))) {
    if (tag->type == MULTIBOOT_TAG_TYPE_MMAP) {
      mmap = (struct multiboot_mmap*)tag;
    }

    if (tag->type == MULTIBOOT_TAG_TYPE_CMDLINE) {
      cmdline = (struct multiboot_cmdline*)tag;
    }
  }

  __init_mmap(init, mmap);
  __init_cmdline(init, cmdline);
}
```

我们遍历`tags`，直到碰到结束`tag`，这里必须注意的是，`tags`也是八字节对齐的，在移位指针的时候必须将`size`对齐。

拿到`mmap`和`cmdline`之后，我们实际上要做的就是把他们移动到初始化结构体中：

```c
__prelude static void
__init_mmap(struct init_info* init, struct multiboot_mmap* mmap)
{
  for (struct multiboot_mmap_entry* entry = mmap->entries;
       (void*)entry < poffset(mmap, mmap->tag.size);
       entry = poffset(entry, mmap->entry_size)) {
    init->mmap[init->mmap_cnt].type = entry->type;
    init->mmap[init->mmap_cnt].addr = entry->addr;
    init->mmap[init->mmap_cnt].len = entry->len;
    ++init->mmap_cnt;
  }
}

__prelude static void
__init_cmdline(struct init_info* init, struct multiboot_cmdline* cmdline)
{
  char* src = cmdline->string;
  char* dest = init->cmdline;
  size_t size = ORDOS_INIT_ARGS_BUFSIZE;
  while (size-- && (*dest++ = *src++)) {
  }
}
```

从`multiboot_mmap_entry`到`__init`中的`mmap_entry`是完全没有变化的，他们的结构如下：

```c
struct multiboot_mmap_entry
{
  u64 addr;
  u64 len;
  u64 type;
};
```

### 初始化内存

内存初始化依赖内存信息，我们的自举分配器实际上就是维护了两个内存指针，我们初始化内存就是将内核的终点和内存区域的终点分别赋值给自举分配器：

```c
void
bootmem_init(void)
{
  struct init_info* init = vaccess(&__init);

  __bootmem_start = compiler_kernel_end_paddr();

  for (size_t i = 0; i < init->mmap_cnt; ++i) {
    if (init->mmap[i].type != PMEM_AVAILABLE) {
      continue;
    }

    u64 memsize = init->mmap[i].addr + init->mmap[i].len;
    if (memsize > __bootmem_end) {
      __bootmem_end = memsize;
    }
  }
}
```

每分配一块内存，指针就上移相应的大小：

```c
void*
bootmem_alloc(size_t size)
{
  uintptr_t base = align_up(__bootmem_start, size);
  __bootmem_start = base + size;

  return (void*)base;
}
```

拥有分配内存的能力后，就可以着手初始化页表了，我们映射所有的 NORMAL 内存到内核虚拟地址和`0`地址（为了保证 Prelude 正常运行）：

```c
__prelude static void
__init_pagetable(struct init_info* init)
{
  pde_t* pd = bootmem_alloc(ORDOS_KERNEL_PAGE_SIZE);
  size_t pde_cnt =
    min(div_up(bootmem_end() / ORDOS_KERNEL_PAGE_SIZE, VPAGE_DESC_CNT),
        pde_index(MEM_TYPE_HIGH_START));
  pte_t* pt = bootmem_alloc(pde_cnt * ORDOS_KERNEL_PAGE_SIZE);
  size_t pte_cnt = pde_cnt * VPAGE_DESC_CNT;

  void* pt_iter = pt;
  for (size_t i = 0; i < pde_cnt; ++i) {
    pd[i] = pde_desc(pt_iter, PG_PRESENT | PG_WRITABLE | PG_KERNEL);
    pd[i + pde_index(ORDOS_KERNEL_VADDR)] = pd[i];
    pt_iter = poffset(pt_iter, ORDOS_KERNEL_PAGE_SIZE);
  }

  for (size_t i = 0; i < pte_cnt; ++i) {
    pt[i] = pte_desc(i * ORDOS_KERNEL_PAGE_SIZE,
                     PG_PRESENT | PG_WRITABLE | PG_KERNEL);
  }

  vpage_load(pd);
  vpage_enable();

  init->kernel_pd = pd;
  init->kernel_pde_cnt = pde_cnt;
  init->kernel_pt = pt;
  init->kernel_pte_cnt = pte_cnt;
}
```

最后，我们加载 GDT ：

```c
gdtr_t gdtr = gdt_create_ptr(__gdt, ORDOS_MEM_GDT_DESC_CNT);
asm_exec("lgdt %0" : : "m"(gdtr));
asm_exec("ljmp %0, $1f;"
         "1:" : : "i"(gdt_sel_kcode()));
asm_exec("movw %%ax, %%ds;"
         "movw %%ax, %%es;"
         "movw %%ax, %%fs;"
         "movw %%ax, %%gs;"
         "movw %%ax, %%ss;" : : "a"(gdt_sel_kdata()));
```

## 进入内核之前

我们完成了 Prelude 之后，要进入内核还需要修改栈指针，因为我们很快就会移除低地址的映射：

```asm
addl $ORDOS_KERNEL_VADDR, %esp
```

最后，我们调用`kmain`：

```asm
call kmain
```

至此，我们的内核初始化流程完整结束。

## 项目链接

[![OrdOS](https://github-readme-stats.vercel.app/api/pin/?username=Dessera&repo=OrdOS)](https://github.com/Dessera/OrdOS)
