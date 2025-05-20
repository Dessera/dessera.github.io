---
title: Nix-打包Tauri应用
createTime: 2025/02/03 00:54:45
permalink: /article/qbac9sif/
tags:
- Linux
- Nix
- Flake
- Tauri
---

`Tauri v2`发布也有一段时间了，笔者曾多次想在`NixOS`上复现基于它的开发环境，但苦于不知道其依赖组成（虽然可以通过一些手段获取，但我懒，真的），所以一直没有动手。

最近正好有了时间，同时也看到[Tauri官网](https://tauri.app/)为`NixOS`编写了一份依赖清单，于是便有了这篇文章。

## 注意事项

本文涉及到的项目使用`yarn 4.4.1`和`rustc 1.84.1`编译。

## 首先，你得创建项目不是？

要快速创建项目，可以使用`nix run`或者`nix shell`: 

```bash
# 进入含有 yarn 的 nix shell
nix shell nixpkgs#corepack

# 创建项目
yarn create tauri-app
```

创建完成后，进入项目目录，我们需要修改`yarn`版本: 

```bash
corepack use yarn@4.4.1   # 使用 yarn 4.4.1
```

以及，编辑`.yarnrc.yml`，加入以下内容: 

```yaml
nodeLinker: node-modules
```

> 笔者自己没有搞明白如何在`vite`项目中使用`PnP`，所以这里直接使用`node-modules`。

## 打包第一步，前端产物

我们首先要编写前端产物的构建逻辑，这里推荐[yarn-plugin-nixify](https://github.com/stephank/yarn-plugin-nixify)

这个插件在每次运行`yarn`时，都会生成一份`yarn-project.nix`文件，该文件定义了一个`yarn`项目的打包器，可以用于`nix`构建。

我们运行: 

```bash
yarn plugin import https://raw.githubusercontent.com/stephank/yarn-plugin-nixify/main/dist/yarn-plugin-nixify.js
```

第一次运行时，它会生成一份`default.nix`文件，但我们不使用这份，而是把它写成`nix`的包函数: 

```nix
{
  callPackage,
  nodejs_23,
}:
let
  pageTarget =
    (callPackage ./yarn-project.nix {
      nodejs = nodejs_23;
    } { src = ./.; }).overrideAttrs
      (old: {
        buildPhase = ''
          runHook preBuild

          yarn build

          runHook postBuild
        '';
      });
in
pageTarget
```

这个包函数调用了`yarn-project.nix`，因为这个文件并不包含默认的`buildPhase`，所以我们要手动添加`buildPhase`，这里我们直接调用`yarn build`。

接下来我们编写`flake.nix`文件:

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs =
    {
      flake-parts,
      nixpkgs,
      ...
    }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      perSystem =
        { pkgs, ... }:
        let
          target = pkgs.callPackage ./default.nix { };
        in
        {
          packages = {
            default = target;
          };

          devShells = {
            default = pkgs.mkShell {
              inputsFrom = [ target ];

              packages = with pkgs; [
                nixd
                nixfmt-rfc-style
              ];
            };
          };
        };
    };
}

```

我们使用`flake-parts`来编写`flake.nix`，在`devShell`中引用我们刚刚写好的产物。

运行`nix build .`，我们可以看到在`result/libexec/<项目名>/dist`目录下生成了前端产物。

## Rust编译

`Rust`侧的工作稍微有一些复杂，按照惯例，我们先引用`rust-overlay`作为`rustc`和`cargo`的来源: 

```nix {4-7,23-32}
{
  inputs = {
    # ...
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

    outputs =
    {
      flake-parts,
      rust-overlay,
      nixpkgs,
      ...
    }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } {
      # ...

      perSystem =
        { system, ... }:
        let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [ (import rust-overlay) ];
          };
          rsPkgDev = pkgs.rust-bin.stable.latest.default.override {
            extensions = [
              "rust-analyzer"
              "rust-src"
            ];
          };

          # ...
        in
        {
          # ...
        };
    };
}
```

然后修改`default.nix`文件，添加依赖项: 

```nix {4-6,8-19,22-24}
{
  callPackage,

  pkg-config,               # Tauri nativeBuildInputs
  gobject-introspection,
  cargo-tauri,

  at-spi2-atk,              # Tauri buildInputs
  atkmm,
  cairo,
  gdk-pixbuf,
  glib,
  gtk3,
  harfbuzz,
  librsvg,
  libsoup_3,
  pango,
  webkitgtk_4_1,
  openssl,
  nodejs_23,

  rust-bin,                 # Rust
  rsPkg ? rust-bin.stable.latest.default,
  makeRustPlatform,
}:
let
  rustPlatform = makeRustPlatform {
    cargo = rsPkg;
    rustc = rsPkg;
  };

  # pageTarget 同上 ...

  tauriTarget = rustPlatform.buildRustPackage {
    pname = "<项目名>";
    version = "<版本号>";
    src = ./src-tauri;

    doCheck = false;

    cargoLock = {
      lockFile = ./src-tauri/Cargo.lock;
      allowBuiltinFetchGit = true;
    };

    unpackPhase = ''
      runHook preUnpack

      mkdir dist
      cp -r ${pageTarget}/libexec/<项目名>/dist/* dist
      cp -r $src/* ./

      runHook postUnpack
    '';

    buildPhase = ''
      cargo-tauri build --no-bundle --config '{ "build": { "beforeBuildCommand": "", "frontendDist": "./dist" } }'
    '';

    installPhase = ''
      mkdir -p $out/bin
      cp target/release/<项目名> $out/bin
    '';

    checkPhase = '''';

    nativeBuildInputs = [
      pkg-config
      gobject-introspection
      rsPkg
      cargo-tauri
    ];

    buildInputs = [
      at-spi2-atk
      atkmm
      cairo
      gdk-pixbuf
      glib
      gtk3
      harfbuzz
      librsvg
      libsoup_3
      pango
      webkitgtk_4_1
      openssl
    ] ++ pageTarget.buildInputs;  # 把前端依赖也加进来，主要是为了方便构建devShell
  };
in
tauriTarget
```

我们一步步拆解该文件: 

在`tauriTarget`的构建中，我们首先要关注的是`nativeBuildInputs`和`buildInputs`，这部分基本来自[Tauri Prerequisites](https://tauri.app/start/prerequisites/)，我们直接复制过来即可。

> 记得把他给的`cargo`删了

然后是我们重写的几个`phase`，在`unpackPhase`中，我们需要把前端产物复制到目前的构建目录里，因此重写为如下脚本: 

```bash
runHook preUnpack

mkdir dist
cp -r ${pageTarget}/libexec/<项目名>/dist/* dist
cp -r $src/* ./

runHook postUnpack
```

> 因为我们覆盖了`unpackPhase`，所以源代码的迁移不会默认执行，我们需要手动复制

因为打包`tauri`项目时，我们的根目录是`src-tauri`，因此原先在`tauri.conf.json`中配置的内容有一部分是需要修改的，我们使用`cargo-tauri`来混入: 

```bash
cargo-tauri build --no-bundle --config '{ "build": { "beforeBuildCommand": "", "frontendDist": "./dist" } }'
```

我们移除`beforeBuildCommand`，因为这部分我们已经手动执行了，并把`frontendDist`指向我们刚刚复制的前端产物。

值得注意的是我们只需要构建二进制，所以传入`--no-bundle`，禁止`cargo-tauri`打包`deb`等文件。

由于`buildRustPackage`的默认`phase`依赖固定的构建路径，我们修改了`buildPhase`，因此我们还需要重写`installPhase`和`checkPhase`，我们只需要复制二进制文件到指定位置即可，因此我们重写为如下脚本:

```bash
mkdir -p $out/bin
cp target/release/<项目名> $out/bin
```

写完打包逻辑后，如果直接使用会出依赖问题(找不到`rust-tls`)，我们需要修改`cargo`依赖: 

```toml
tauri = { version = "2", features = ["native-tls"] }
```

为`tauri`开启`native-tls`特性，这样就可以正常打包了，至此我们的前后端打包均已配置完成。

## DevShell

最后我们来构建`devShell`，因为我们的软件包已经编写完成，我们只要把它加入到`devShell`即可，我们修改`flake.nix`文件中的`devShells`部分:

```nix
devShells = {
  default = pkgs.mkShell {
    inputsFrom = [ (target.override { rsPkg = rsPkgDev; }) ];

    packages = with pkgs; [
        nixd
        nixfmt-rfc-style
    ];
  };
};
```

我们在编写软件包时故意留下了`rsPkg`这个变量，它可以指定我们使用的`rust`工具链，为了正确启动语言服务器，我们需要开启`rust-src`和`rust-analyzer`特性，将我们重写的工具链赋值给`rsPkg`即可。

现在，我们就可以使用`nix develop`进入开发环境了。

Enjoy :)