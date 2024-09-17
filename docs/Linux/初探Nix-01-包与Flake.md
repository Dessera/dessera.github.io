---
title: 初探Nix-01-包与Flake
createTime: 2024/09/14 15:36:04
permalink: /article/szm6xukr/
---

笔者认为，要熟练掌握某项技术或工具，就需要深入地亲自体会它，强迫自己进入“探索-碰壁-再探索”这一良性循环。学习某一语言如此，学习使用某个工具亦如。

以笔者本人为例，笔者以大一的某次比赛为契机接触了Linux，并花费进一年的时间扎根于Linux系统的使用，从Ubuntu到Manjaro，再到ArchLinux，最后深入NixOS，这个过程为笔者带来了大量的实践经验。

笔者举上面的例子旨在说明，学习Nix的过程十分艰难，我们如果认定学习Ubuntu的难度不高，学习Arch的难度较高，那么学习Nix的难度就是非常高。因为它不像Arch那样有完整的文档和成熟的社区支持，Nix的文档是灾难性的——它分布及广、信息量低且几乎没有中文支持。

为了解决一些共性问题和分享一些见解，笔者计划编写新的系列文章，本文是该系列文章的第一篇。

## 所以，什么是Nix？

事实上，上文我们将Nix与其他Linux发行版并列的做法是错误的，严格意义上说，Nix可以是一门编程语言，也可以是一个通用Linux包管理器，但它实际上不是发行版本身。而基于Nix包管理器的Linux发行版被称为NixOS。

> 事实上，社区还维护了一个基于Nix的发行版，叫做[NixNG](https://github.com/nix-community/NixNG)，这里不做讨论

Nix是一个“函数式”的软件包管理器，它以配置文件的方式管理系统中所有的软件和其配置，这样的好处是，其完全遵守函数式编程中纯函数的理念，能够保证同样的配置文件能够产出完全相同的配置结果。

当然，Nix的神秘魅力并不能用上面那句“假大空”的宣传语概括，只有我们深入了解它，我们才能体会到它带给我们的各种便利。

## Flake

> 到现在为止，Flake在事实上仍然是一个实验性项目，但鉴于其使用的广泛程度，本文不会介绍旧的配置方法，而是直接使用Flake

Flake是Nix生态最重要的组成部分，它是大多数Nix项目的基石。

Flake本质上是一个函数，它接受其他Flakes作为输入，并返回一个巨大的结构，其返回内容可以是一个软件包、一个开发环境、一个系统配置等等。

举个例子，我的项目是一个软件`my-tool`，那么我就可以使用Flake将我的软件分发给其他Nix使用者，其他人拿到我的软件包，只需要运行`nix build .`就可以构建我的软件，如果他们想要使用我的软件，只要将我的Flake加入到他们系统的Flake中，就可以在整个系统中安装我的软件。

要创建一个Flake，需要在任意项目的根目录初始化一份`flake.nix`，下面是一个简单的Flake：

```nix
{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }: {

    packages.x86_64-linux.hello = nixpkgs.legacyPackages.x86_64-linux.hello;

    packages.x86_64-linux.default = self.packages.x86_64-linux.hello;

  };
}

```

这是一个最基础的`Hello World`配置，会导出一个名为`hello`的程序，我们主要关注其`inputs`和`outputs`两项。

`inputs`是`outputs`的参数，它的来源是其他的Flakes，在这里，我们通过引用`nixos/nixpkgs`来导入Nix官方软件源，`outputs`就是我们想要导出的内容，`packages`下的内容意为导出软件包，这里，我们将软件源中的`hello`导出。

接着，我们运行`nix run .`就可以运行该软件包：

```shell
❯ nix run .
世界你好！
```

我们也可以使用`nix build .`来构建该软件包

```shell
❯ nix build .
❯ ls
flake.lock  flake.nix  result
```

在`result/bin`中，我们就可以看到构建的软件：

```shell
❯ ls result/bin/
hello
```

我们也可以使用`nix develop .`进入这个包的开发环境：

```shell
❯ nix develop .

[your_name@your_pc:/path/to/project]$ 
```

到这，有些朋友可能发现了，在Nix中，只要我们定义好了我们的软件包，那么我们就可以一键完成其构建过程、构建环境和开发环境。而更可怕的是，这才是Flake的冰山一角。

除却`packages`之外，我们还有`devShells`、`nixosConfigurations`等等配置项，足够支撑Flake进行几乎**任何**项目的开发。

## 使用Flake进行开发

要使用Flake,首先要进行一次系统配置，在没有启动Flake之前，NixOS的系统配置存在于`/etc/nixos`中，我们需要在配置文件中加入下面的内容：

```nix
nix.settings = {
  experimental-features = [ "nix-command" "flakes" ];
};

programs.direnv.enable = true;
```

然后使用`sudo nixos-rebuild switch`切换系统配置，使用以上的配置，我们启用了Flake实验功能，并下载了`direnv`。

接下来，我们来到我们的项目文件夹下，例如，我的项目文件夹在`/data/project/my-tool`，我们先编写一个最简单的C程序：

```c
// my-tool.c
#include <stdio.h>

int main() {
  printf("hello world!\n");
  return 0;
}
```

接下来，我们准备该程序的打包文件：

```nix
# default.nix
{ stdenv }:
stdenv.mkDerivation {
  name = "my-tool";
  src = ./.;
  
  buildPhase = ''
    $CC -o my-tool my-tool.c
  '';

  installPhase = ''
    mkdir -p $out/bin
    cp my-tool $out/bin
  '';
}
```

该文件是一个通用Nix包格式，能被`pkgs`中的`callPackage`函数调用，在这段逻辑中，我们引入了标准环境`stdenv`，其中包含`gcc`和相应的C标准库。

在`buildPhase`中，我们定义了该包的构建逻辑，这里使用`$CC`引用`gcc`。

在`installPhase`中，我们定义该包的安装逻辑，我们使用`$out`引用导出路径，先创建`bin`文件夹，然后将构建好的程序复制到指定位置。

最后，我们创建`flake.nix`，将该包暴露出去：

```nix
{
  description = "A flake that builds a simple my-tool";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }: 
  {
    packages.x86_64-linux.my-tool = nixpkgs.legacyPackages.x86_64-linux.callPackage ./default.nix {};
    packages.x86_64-linux.default = self.packages.x86_64-linux.my-tool;
  };
}
```

这里的写法和上文的`hello`几乎一致，值得一提的是，因为包是我们自己写的，所以要使用`callPackage`函数将其转化为正确的包格式。

现在，我们可以使用`nix build`、`nix run`和`nix develop`，其效果和上文基本一致。

```shell
❯ nix run .
hello world!
```

我们还可以使用上面安装的`direnv`，它可以让我们一进入该目录，就进入包的开发环境，首先编写`.envrc`：

```shell
# .envrc
use flake
```

然后，在项目目录下运行`direnv allow`：

```shell
❯ direnv allow
direnv: loading /data/projects/my-tool/.envrc
direnv: using flake
direnv: nix-direnv: Renewed cache
direnv: export +AR +AS +CC +CONFIG_SHELL +CXX +HOST_PATH +IN_NIX_SHELL +LD +NIX_BINTOOLS +NIX_BINTOOLS_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu +NIX_BUILD_CORES +NIX_CC +NIX_CC_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu +NIX_CFLAGS_COMPILE +NIX_ENFORCE_NO_NATIVE +NIX_HARDENING_ENABLE +NIX_LDFLAGS +NIX_STORE +NM +OBJCOPY +OBJDUMP +RANLIB +READELF +SIZE +SOURCE_DATE_EPOCH +STRINGS +STRIP +__structuredAttrs +buildInputs +buildPhase +builder +cmakeFlags +configureFlags +depsBuildBuild +depsBuildBuildPropagated +depsBuildTarget +depsBuildTargetPropagated +depsHostHost +depsHostHostPropagated +depsTargetTarget +depsTargetTargetPropagated +doCheck +doInstallCheck +dontAddDisableDepTrack +installPhase +mesonFlags +name +nativeBuildInputs +out +outputs +patches +propagatedBuildInputs +propagatedNativeBuildInputs +shell +src +stdenv +strictDeps +system ~PATH ~XDG_DATA_DIRS
```

接下来，我们就可以使用这个开发环境安装的所有软件，查看一下`gcc`：

```shell
❯ gcc -v
使用内建 specs。
COLLECT_GCC=/nix/store/x8rg4vhgd20i8vzykm1196f9qdb8klhh-gcc-13.3.0/bin/gcc
COLLECT_LTO_WRAPPER=/nix/store/x8rg4vhgd20i8vzykm1196f9qdb8klhh-gcc-13.3.0/libexec/gcc/x86_64-unknown-linux-gnu/13.3.0/lto-wrapper
目标：x86_64-unknown-linux-gnu
配置为：../gcc-13.3.0/configure --prefix=/nix/store/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-gcc-13.3.0 --with-gmp-include=/nix/store/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-gmp-6.3.0-dev/include --with-gmp-lib=/nix/store/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-gmp-6.3.0/lib --with-mpfr-include=/nix/store/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-mpfr-4.2.1-dev/include --with-mpfr-lib=/nix/store/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-mpfr-4.2.1/lib --with-mpc=/nix/store/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-libmpc-1.3.1 --with-native-system-header-dir=/nix/store/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-glibc-2.39-52-dev/include --with-build-sysroot=/ --with-gxx-include-dir=/nix/store/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-gcc-13.3.0/include/c++/13.3.0/ --program-prefix= --enable-lto --disable-libstdcxx-pch --without-included-gettext --with-system-zlib --enable-static --enable-languages=c,c++ --disable-multilib --enable-plugin --disable-libcc1 --with-isl=/nix/store/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-isl-0.20 --disable-bootstrap --build=x86_64-unknown-linux-gnu --host=x86_64-unknown-linux-gnu --target=x86_64-unknown-linux-gnu
线程模型：posix
支持的 LTO 压缩算法：zlib
gcc 版本 13.3.0 (GCC) 
```

## 未完待续

本文我们简单了解了Flake如何构建软件，之后的文章我们会探讨Flake构建系统、以及高级软件包构建流程。
