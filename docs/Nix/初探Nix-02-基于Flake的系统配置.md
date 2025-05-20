---
title: 初探Nix-02-基于Flake的系统配置
createTime: 2024/11/03 23:06:40
permalink: /article/ulsks6i8/
tags:
- Linux
- Nix
- Flake
---

上一次我们使用基于Flake的构建系统构建了一些程序，今天我们来亲手用Flake搭建我们的系统配置。

## 配置入口

NixOS系统配置作为Flake输出函数的一部分导出，下面我们简单的编写一个OS配置的入口：

```nix
{
  description = "Nix system configuration with a desktop environment";

  inputs = {
    nixpkgs = {
      url = "github:nixos/nixpkgs?ref=nixos-unstable";
    };
  };

  outputs = inputs@{ nixpkgs, ... }: {
      nixosConfigurations = {
        your-os-name = nixpkgs.lib.nixosSystem {
          system = "x86_64-linux";
          modules = [
            ./path/to/entry.nix
          ];
        };
      };
  };
}

```

现在我们来一步步解析这个入口，首先，我们的所有系统配置都位于Flake输出的`nixosConfigurations`，这个配置项是一个键值对结构体，键是我们系统的名字，值是系统配置，Nix提供了工具函数`nixosSystem`来帮助我们构建系统。

因为键值对可以容纳多个系统配置，如果我们在这里编写的系统配置多于一个，就需要在构建时指定系统名，为了简单考虑，我们在这里只构建一个系统配置。

我们直接将目光转移到`nixosSystem`内部，`system`代表该构建的目标，这个标志会传递给`nixpkgs`，帮助他找到符合当前架构和系统的的软件包集合。`modules`是系统配置真正的入口，如果你刚刚安装NixOS，那么你的`/etc/nixos`下往往会有`configuration.nix`文件，你可以直接把该文件路径加入`modules`中，来完成传统配置到Flake配置的迁移。

## 关于OS Module

Nix下面的模块化配置项很多，为了区分，我们将`modules`下的所有文件都称为OS Module，简单来说，他们和过去的`configuration.nix`别无二致，但因为有了Flake的加持，你可以声明式的管理软件源，修改OS Module的参数，以及复用别人的系统配置。

定义OS Module的方式有两种，分别是简化配置和完整配置，比如，我们需要启用`wget`包：

```nix
# 简化配置
{ pkgs, ... }:
{
  environment.systemPackages = with pkgs; [
    wget
  ];
}
```

如果使用完整配置，我们的配置项应该写在`config`下：

```nix
{ pkgs, ... }:
{
  config = {
    environment.systemPackages = with pkgs; [
      wget
    ];
  };
}
```

实际上，一个完整的OS Module应当有以下条目，简化模式只是省略了`options`部分，且允许不在`config`内就可以编写配置：

```nix
{ ... }:
{
  imports = [
    # 该模块的子模块
  ];

  options = {
    # 该模块的选项声明
  };

  config = {
    # 该模块的选项定义，根据`options`中的条目输出的最终配置
  };
}
```

我们可以把上面`wget`的例子修改一下：

```nix
{ pkgs, lib, ... }:
let 
  cfg = config.modules.packages.wget;
  inherit (lib) mkEnableOption mkIf;
in
{
  options.modules.packages.wget = {
    enable = mkEnableOption "Enable wget";
  };

  config = mkIf cfg.enable {
    environment.systemPackages = with pkgs; [
      wget
    ];
  };
}
```

这时，我们如果将该文件导入配置，则不会向系统中添加`wget`，要启用该模块，我们要在配置的其他位置调用：

```nix
{ ... }:

{
  # ...
  modules.packages.wget.enable = true;
  # ...
}
```

## 使用模块定义系统配置

在讨论接下来的内容之前，我们要介绍一下如何查询NixOS的系统配置项，你可以访问[NixOS Search](https://search.nixos.org/options?)来获取当前版本所有的系统配置。

进行系统配置是一个完全主观的活动，每个人的项目组织能力和偏好都各不相同，因此每个人的系统配置项目也各不相同，笔者在这里记录的是自己的系统配置法，我的个人系统配置位于[DesseraNix](https://github.com/Dessera/dessera-nix)，其中大部分基于完整的模块写法，将主要功能作为接口暴露给外部配置。

当然，尽管沉淀了将近半年的时间，我的配置也并非十分成熟，我也在持续不断的改进我的配置，但就目前来说，我们可以将系统配置拆分为几个部分：

- 硬件配置
- 启动引导配置
- 本地化
- 服务
- 软件包
- 用户配置

### 硬件配置

首先，我建议各位先浏览一下[NixOS-Hardware](https://github.com/NixOS/nixos-hardware)，如果有你的硬件配置，你完全可以直接引入，跳过硬件配置的步骤。

如果没有你的硬件，你也可以引入它`common`模块下的配置来快速搭建自己的硬件配置。

手动硬件配置主要关注处理器和显卡：

```nix
{ lib, config, ... }:

{
  # ...
  # INTEL CPU 微码
  hardware.cpu.intel.updateMicrocode = lib.mkDefault config.hardware.enableRedistributableFirmware;
  # AMD
  hardware.cpu.amd.updateMicrocode = lib.mkDefault config.hardware.enableRedistributableFirmware;
  # ...
}
```

显卡驱动可以参考上面的NixOS-Hardware的配置，我们稍微简化一下（我们假定你在`nixpkgs>24.05`）：

```nix
# intel
{ pkgs, ... }:

{
  boot.initrd.kernelModules = [ "i915" ];

  hardware.graphics.extraPackages = with pkgs; [
    intel-vaapi-driver
    intel-ocl
    intel-media-driver
    intel-compute-runtime
    vpl-gpu-rt
  ];

  hardware.graphics.extraPackages32 = with pkgs; [ 
    driversi686Linux.intel-vaapi-driver
    driversi686Linux.intel-media-driver
  ];
}
```

```nix
# nvidia
{ pkgs, ... }:

{
  services.xserver.videoDrivers = lib.mkDefault [ "nvidia" ];
  hardware.nvidia =
  {
    modesetting.enable = lib.mkDefault true;
    open = lib.mkIf (lib.versionAtLeast config.hardware.nvidia.package.version "555") true;

    prime =
    {
      intelBusId  = "PCI:0:2:0";
      nvidiaBusId = "PCI:1:0:0";
    };
  };
}
```

这里的注意事项是，`prime`条目内的两个BusId是要用户手动检测的，该条目会启用`nvidia-prime`来辅助进行显卡的切换，使用`sudo lshw -c display`来展示显卡信息。

> 显卡驱动配置项经过了一次API变动，如果你正在使用`nixpkgs-24.05`，请使用`hardware.opengl`，该条目的配置不在此处赘述。

### 启动引导配置

引导配置位于`boot`下，`hardware-configuration.nix`提供的配置实际上非常详尽，这里展示以下我的配置：

```nix
{ pkgs, ... }:

{
  boot = {
    loader = {
      grub = {
        enable = true;
        device = "nodev";
        efiSupport = true;
        useOSProber = true;
      };
      efi = {
        canTouchEfiVariables = true;
        efiSysMountPoint = "/boot";
      };
    };
    initrd.availableKernelModules = [
      "xhci_pci"
      "thunderbolt"
      "vmd"
      "nvme"
      "usb_storage"
      "sd_mod"
    ];
    kernelModules = [ "kvm-intel" ];
    kernelPackages = pkgs.linuxPackages_latest;
    kernelParams = [
      "nowatchdog"
      "quiet"
    ];
  };
}
```

这里主要解释`useOSProber`选项，这个选项会启用`GRUB_DISABLE_OS_PROBER=false`，如果你有双系统，该条目是必须的，因为它可以检测额外的Windows系统分区并添加到GRUB启动项中。

### 本地化

本地化这个话题实际上可以分为两部分，分别是时区和Locale。

下面是一个本地化配置实例：

```nix
{ pkgs, ... }:

{
  # 设置时区
  time.timeZone = "Asia/Shanghai";
  time.hardwareClockInLocalTime = true;

  # 设置Locale
  i18n = {
    defaultLocale = "zh_CN.UTF-8";
  };
}

```

> 关于输入法和字体的话题，会和桌面环境一起讨论。

### 服务

服务是一个相当巨大的话题，因为每个人都有他们自己的服务项，比如我需要运行学校指定的网络客户端来连接网络，还需要一些udev规则来让我能够连接开发板等等。

我们这里列出一些必须的服务项：

```nix
{ lib, pkgs, ... }:

{
  hardware.bluetooth = {
    enable = true;
    powerOnBoot = true;
  };

  networking = {
    hostName = "your_os_name";
    useDHCP = lib.mkDefault true;
    networkmanager.enable = true;
    hosts = {
      "199.232.96.133" = [ "raw.githubusercontent.com" ];
    };
  };
}

```

这份配置定义了蓝牙和网络服务。

> 同样的，关于xserver，我们将之后讨论

### 软件包

你可以在[NixOS Search](https://search.nixos.org/packages)中查询软件包，或者使用[NUR](https://github.com/nix-community/NUR)。

定义系统软件包有两种方式，一种是`programs`，一种是`environment.systemPackages`，前者是`nixpkgs`预定义的一些软件，他们往往有良好的配置接口，后者是用户主动安装的程序包，他们虽然也会提供`override`式的配置接口，但便利性较差。

```nix
{ pkgs, ... }:

{
  # 通过 programs
  programs = {
    direnv = {
      enable = true;
      enableZshIntegration = true;
    };
    neovim = {
      enable = true;
      viAlias = true;
      vimAlias = true;
    };
  };

  # 通过 environment
  environment.systemPackages = with pkgs; [
    wget
    fastfetch
  ];
}

```

### 用户配置

用户配置暴露于`users`，它可以配置整个系统中所有的普通用户：

```nix
{
  pkgs,
  ...
}:

{
  users = {
    defaultUserShell = pkgs.zsh;
    users = {
      dessera = {
        isNormalUser = true;
        extraGroups = [
          "wheel"
          "networkmanager"
          "video"
          "audio"
        ];
      };
    };
  };
}

```

借助Home Manager，Nix有管理用户目录下配置文件的能力，有关用户配置管理和桌面环境，我们留到之后讨论。
