---
title: 安装NixOS
createTime: 2025/01/30 19:32:53
permalink: /nix/64k2nr74/
tags:
- Linux
- Nix
- Flake
---

一切的一切都要从`nix`的安装说起，想要得到`nix`包管理器，我们有两种方式：

1. 安装`NixOS`，一个纯粹基于`nix`的发行版
2. 在别的发行版中安装`nix`包管理器

我们将使用第一种方式，安装`NixOS`，本章主要参考了[NixOS CN](https://nixos-cn.org/)。

> 不纯粹的不可变性就是可变性，因此，笔者认为基于其他发行版的`nix`包管理器是不可靠的。

## 首先，制作安装介质

安装一个操作系统的第一步是制作安装介质，如果读者们使用过`Archlinux`，那么`NixOS`的安装也能够轻松上手。

我们可以在[Install NixOS](https://nixos.org/download/)这里下载到最新的`NixOS`安装镜像，然后将其烧录到U盘上，有几种方法：

1. 使用`dd`命令
2. 使用`balena etcher`，一个跨平台的GUI烧录工具

无论如何，我们最终都会得到一个烧录好安装介质的U盘，接下来，重启进入`BIOS`，将U盘设置为第一启动项，然后重启进入安装界面。

## 加载安装器

刚一进入安装界面，安装器会给我们几种选项：

```
NixOS <version> Installer
NixOS <version> Installer (nomodeset)
NixOS <version> Installer (copytoram)
NixOS <version> Installer (debug)
NixOS <version> Installer (serial console=ttyS0,115200n8)
Memtest86+
```

我们一般只需要关注前三项，他们的区别主要是：

- `nomodeset`：禁用内核部分显卡功能，在安装过程中，如果遇到显卡驱动问题，可以尝试使用这个选项。
- `copytoram`：将安装器复制到内存中，这样在安装过程中，即使U盘被拔出，安装器也不会丢失。

一般情况下，我们选择第一项即可。

顺利的话，我们会进入终端界面（如果在step1出现了问题，可以尝试回退镜像版本）：

```shell
[nixos@nixos:~]$
```

## 连接网络

有几种方法可以连接网络，比如有线、USB连接和WIFI，前两种不需要过多配置，我们主要关注WIFI连接：

首先，我们要启用`wpa_supplicant`服务：

```shell
sudo systemctl enable wpa_supplicant
```

然后，进入`wpa_cli`：

```shell
[nixos@nixos:~]$ wpa_cli

> add_network
0
> set_network 0 ssid "WIFI NAME"
OK
> set_network 0 psk "WIFI PASSWORD"
OK
> set_network 0 key_mgmt WPA-PSK
OK
> enable_network 0
OK
> quit
```

## 分区

因为我们是全新安装，不考虑是否有旧系统，所以直接在单块硬盘上进行分区，我们使用`cfdisk`进行分区，结果如下：

```plaintext
EFI System Partition 1G
Linux Swap <和你的内存大小一致>
Linux Filesystem <剩余空间>
```

这里的分区更多