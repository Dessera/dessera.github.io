---
title: 利用poetry搭建工程化python开发环境
createTime: 2024/10/15 10:13:28
permalink: /article/55fg352e/
tags:
- Poetry
- Python
---

想象一个场景，当你手中有一份python工具函数库或程序，你该如何将它分发给别人？不同的人对这个问题应当有完全不同的解法，但大体来说，你有两种方式：

1. 分发源代码
2. 分发打包的库文件

我们对第一种方式都比较熟悉，只要生成一份`requirements.txt`，任何拿到这份代码的人都能复现出我们的开发环境，但这种原始的方式会产生大量问题。

首先，`requirements.txt`并不完全符合我们的开发环境，在没有工程管理的项目中，该文件通常是自动生成或者人工维护的，在这个过程中，会丢失部分库的额外元信息，举个例子，我们的应用用到了`fastapi`，而该库其实有三个版本，分别是`fastapi`、`fastapi[standard]`和`fastapi[all]`，后二者会附加一些额外的依赖来帮助开发和调试。

其次，这样分发源代码忽略了使用者的感受，代码的使用者可能需要费劲心思去将这份代码合并到他的项目中，这其中涉及到复杂的代码合并和依赖合并。

我们应当有一个更加优秀的源代码分发手段，实际上我们早就有，借由打包工具，我们可以以构建产物的方式分发我们的代码，使用者只需要使用`pip`或者其他工具进行安装就可以了，这也是大部分`python`工具的做法。

## Poetry

打包工具有很多，我们今天使用的是`poetry`，这是一个较为流行的`python`项目管理工具，几乎能够覆盖软件的开发周期，详情可以参考[Poetry官网](https://python-poetry.org/)，本文使用`poetry 1.8.3`

## 首先，写一份配置文件

相信使用过其他语言的朋友可能抱怨过`python`混乱的项目管理，在诸如`javascript`或者`rust`这样的语言里，我们的开发都需要始于一个配置文件，例如`package.json`或者`Cargo.toml`。

实际上`python`也有这样的文件——`pyproject.toml`，但头疼的是，根据你使用打包工具的不同，该文件的格式也会随之变化，我们今天主要介绍`poetry`的格式。

要定义一个项目，首先，你需要以下条目：

1. 项目元数据

    分别定义了项目名称，版本，介绍，作者，开源协议，readme：

    ```toml
    [tool.poetry]
    name = "my_tool"
    version = "0.1.0"
    description = ""
    authors = ["name <your@email.com>"]
    license = "MIT"
    readme = "README.md
    ```

2. 项目构建系统

    定义了项目构建系统，下面是`poetry`的默认设置：

    ```toml
    [build-system]
    requires = ["poetry-core"]
    build-backend = "poetry.core.masonry.api"
    ```

3. 项目依赖

    定义了项目的依赖表，也可以通过`poetry add <package>`自动更新：

    ```toml
    [tool.poetry.dependencies]
    python = "^3.12"
    typer = "^0.12.5"
    fastapi = {extras = ["standard"], version = "^0.115.2"}
    ```

## 然后，写点函数

`poetry`会默认将项目根目录下，与项目同名的目录当作`python`包，以上面的配置文件为例，我们要创建`my_tool/`文件夹，并加入`__init__.py`，在该文件中加入我们的工具函数：

```shell
cat my_tool/__init__.py
def get_hello(name: str):
    return f"Hello {name}!"
```

我们可以通过`poetry install`来将我们的包“动态安装”到环境中：

```shell
poetry install    # 安装当前包
python
Python 3.12.5 (main, Aug  6 2024, 19:08:49) [GCC 13.3.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import my_tool
>>> my_tool.get_hello("world")
'Hello world!'
```

这样，我们就可以在该环境内使用我们的软件包，同时，如果我们更改了代码，包也会动态更新，因为该包以编辑模式安装。

## 导出一个`cli`

我们可以通过`tool.poetry.scripts`向外导出一个命令行工具，我们再次修改我们的`__init__.py`：

```python
def get_hello(name: str):
    return f"Hello {name}!"

def main():
    print(get_hello("world"))
```

然后，我们在`pyproject.toml`中加入新的条目：

```toml
[tool.poetry.scripts]
my_tool = 'my_tool:main'
```

上面，我们定义了一个新的`script`，名为`my_tool`，使用它将运行包`my_tool`下的`main`函数，我们来运行一下：

```shell
# 没有install，可以用poetry run
poetry run my_tool
Hello world!
```

这个过程中可能会有警告，我们可以忽略，如果我们运行了`poetry install`，则可以直接调用，不需要`poetry run`。

## 构建、分发

运行`poetry build`来构建我们的库：

```shell
poetry build
ls dist
my_tool-0.1.0-py3-none-any.whl  my_tool-0.1.0.tar.gz
```

这些包可以直接被pip安装，也可以按照规则上传到pypi供所有人下载：

```shell
pip install my_tool-0.1.0.tar.gz
```

通过安装该包，我们就可以在**任何**符合包要求的环境中使用该包，同时获得上面的命令行工具和函数库。
