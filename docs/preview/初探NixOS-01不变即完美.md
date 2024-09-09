---
title: 初探NixOS-01不变即完美
tags:
- Linux
- NixOS
- Flake
createTime: 2024/05/01 15:16:01
permalink: /article/9f12aw72/
---

很长一段时间，我的工作环境都搭建在 Archlinux 上，不得不承认，Archlinux 是极其优秀的发行版，它的优秀体现在高度可定制性、完整的社区支持和丰富的软件源。这一切都很美好，直到我遇到了 NixOS。

NixOS 是一个特殊的 Linux 发行版，它基于一个名为 Nix 的 **不可变**包管理器，允许用户通过编写`nix`配置文件来构建可复现的操作系统。只需要写一份配置文件，然后在任何平台上都可以通过一些简单的命令重新构建出操作系统。听起来是一个很美好的愿景，不是吗？这正是 NixOS 的强大之处。

但凡事都有两面性，对于国内用户来说，NixOS 的学习门槛非常高，主要原因有以下几点：

- 资料的分散和不完整
- 资料的汉化程度不高

由于以上种种问题，通向 NixOS 之路困难重重。

本文的目的是记录我在使用 NixOS 时遇到的种种问题和它们的解决方法。

## 伊始 - 关于 NixOS 的安装

和其他的发行版一样，你需要下载 NixOS 的镜像文件，并制作启动媒介。前往该页面下载 NixOS 的镜像文件 [NixOS下载](https://nixos.org/download/)，注意，我们要下载的是 NixOS 而不是 Nix。

在下载页面，我们有两种选择——图形化ISO和最简ISO，图形化ISO顾名思义，它可以用图形的方式进行系统安装，但缺点是可定制性很差；而最简ISO则可完全定义我们的安装流程。简单来说，如果你不想使用`ext4`或者想要深度定制一些内容，我更推荐使用最简ISO。

下载好镜像，我们将其制作为USB启动器（我使用的是Ventoy），从USB启动并进入镜像，我们就进入了 NixOS 的安装程序（或者说 LiveCD）。

详细的安装过程可以参考[NixOS CN](https://nixos-cn.org/)。

## Nix 配置文件

NixOS 采用名为 Nix 的函数式语言作为配置语言，在传统模式下，系统配置的根文件为`/etc/nixos/configuration.nix`，在 Flake 模式下，入口可以是任何位置。

下面是一个传统的`configuration.nix`配置：

```nix
# 配置函数参数
{ config, lib, pkgs, ... }:

{
  imports = [
    # 导入子模块
    # 硬件配置文件
    ./hardware-configuration.nix
  ];

  # 各种配置项

  system.stateVersion = "24.05";
}
```

配置 NixOS 的过程，就是修改这个文件，然后重新生成系统的过程。

例如，我们可以添加以下配置项以应用`grub2`：

```nix
boot.loader = {
  grub = {
    enable = true;
    device = "nodev";
    efiSupport = true;
  };
  efi = {
    canTouchEfiVariables = true;
    efiSysMountPoint = "/boot";
  };
};
```

## Flake

传统的`configuration.nix`模式会从`nix-channel`配置的源中下载需要的包，这种模式实际上无法保证每次下载到的包是完全相同的，即无法保证可复现性。

为了解决这一问题，NixOS 引入了 Flake，简单来说，Flake 将软件源统一为了`input`变量，并将该变量传递给名为`output`的函数（将软件源的配置也变成了声明式）。同时，引入了现代构建系统的`lock`文件来锁定软件版本，保证每一次构建获得的软件版本相同。

Flake 配置的入口是`flake.nix`，下面是一个系统配置的入口：

```nix
{
  # 工程的描述
  description = "Dessera's NixOS configuration";

  # 输入源配置
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  # 输出函数定义
  outputs = { self, nixpkgs, ... }@inputs: {
    nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        # 将 configuration无缝迁移到flake配置
        ./configuration.nix
      ];
    };
  };
}
```

## 配置参考

要查看`nix`模块的所有配置选项，可以参考[Nix Options](https://search.nixos.org/options)

要查看`pkgs`中包含的包，可以参考[Nix Packages](https://search.nixos.org/packages)

## 不变性实现

NixOS 依靠上述的配置文件不仅*统一*了系统级的大部分配置文件，而且为它的函数式模式提供了保障。我们实际上是编写了一个巨大的系统配置函数，并规定了它的输入，通过这种方式生成的系统因为输入和函数本身的不变性和无状态性，天然就保证了可复现性。

NixOS 中，我们可以通过以下命令生成新的系统，我们称之为**世代**：

```shell
sudo nixos-rebuild switch
```

等待一段时间后，如果命令没有错误输出，我们便成功生成了新的世代，并切换到了新的系统。

> 没错，NixOS 的重新生成大部分情况下可以热重载。
>
> 如果不希望直接切换到新的系统，你可以将`switch`换为`boot`，它将在下次重启时切换到新的系统。

我们在配置文件中声明的任何内容，都将被下载到`/nix/store`中，包或者配置文件以`${digest}-${name}`的方式存储在该路径下，例如，下载的`clang`可能存在于：

```shell
/nix/store/afxm7yvnadvv9a3vcrhzjvnmfhdgbfc0-clang-18.1.4
```

该路径是一个只读文件系统，也就是所，我们不能在运行时更改该目录下的任何内容（除非通过nix），要清理该目录下没有使用的包，可以使用：

```shell
nix-collect-garbage -d
# 或者
nix store gc
```

在系统启动时，Nix 会根据当前选择的系统，将该目录下的内容动态链接至`/run/current-system/`中，并基于此启动系统。

例如，我们实际的`sddm`主题目录位于：

```shell
/run/current-system/sw/share/sddm/themes
```
