---
title: 深度学习笔记-MNN Session创建流程
createTime: 2025/10/23 22:54:30
permalink: /article/swxazfys/
tags:
  - C++
  - 深度学习
  - MNN
---

接续[上一次构建流程](./深度学习笔记-MNN上位机编译.md)，在构建完成后，我们直接来看推理相关的 API ，根据 MNN 文档，目前一共有两套推理 API：

- Session：提供会话式的推理接口
- Module：提供表达式的推理接口

本文首先分析 Session 接口，主要聚焦在`Interpreter`类以上的逻辑部分。

## 创建一个推理会话

为了进行模型推理，用户需要按顺序创建`Interpreter`和`Session`，二者分别有各自的职责：

- `Interpreter`：负责模型数据的管理
- `Session`：负责推理相关资源的管理

这样听起来有些模糊，首先要理清模型和推理资源的关系。

抛却 MNN 本身来谈，如果要进行一次推理，任何框架大概率都会进行如下步骤：

1. 从文件中读取模型数据
2. 将模型转化为计算图
3. 进行计算

上文我们提到的“模型数据”即从文件中读取的模型数据，而“推理资源”则是转化的计算图（张量、算子等计算时数据）。

按照 MNN 文档的说法，就是：

> `Interpreter`是模型数据的持有者；`Session`通过`Interpreter`创建，是推理数据的持有者。

我们可以查看`tools/cpp/mobilenetTest.cpp`了解其创建流程，为了方便阅读，笔者删去了`config`的初始化：

```cpp
std::shared_ptr<Interpreter> net(Interpreter::createFromFile(argv[1]));

ScheduleConfig config;
Session* session = net->createSession(config);
```

## Interpreter 的创建细节

上面的代码通过`createFromFile`创建了解释器，实际上，所有的`createFrom`族函数都只做了两件事，其一是加载`Content`类，其二是调用`createFromBufferInternal`。

抛除文件加载部分，我们可以通过`createFromBuffer`来分析最简单的创建流程：

```cpp
Interpreter* Interpreter::createFromBuffer(const void* buffer, size_t size);
```

其首先初始化了一个`Content`，然后将指针和长度赋值给它：

```cpp
    auto net = new Content;
    net->buffer.reset((int)size);
    ::memcpy(net->buffer.get(), buffer, size);
```

最后调用`createFromBufferInternal`：

```cpp
    return createFromBufferInternal(net, true);
```

`createFromBufferInternal`的签名如下：

```cpp
Interpreter* Interpreter::createFromBufferInternal(Content* net, bool enforceAuth);
```

虽然它有`enforceAuth`这个参数，但实际上没有任何作用，该函数会先检查模型有效性，再检查模型`oplists`的有效性。

检查模型有效性，并初始化模型：

```cpp
// 检查模型有效性
auto valid = OpCommonUtils::checkNet(net->buffer.get(), net->buffer.size());

// 从 buffer 中还原网络
net->net = GetNet(net->buffer.get());
```

检查`oplists`：

```cpp
    // 获取 oplists ，检查其有效性
    if (nullptr == net->net->oplists()) {
        MNN_ERROR("Model has no oplist\n");
        delete net;
        return nullptr;
    }

    // 检查其中每一个 Op 的有效性
    int opSize = net->net->oplists()->size();
    for (int i = 0; i < opSize; ++i) {
        auto op = net->net->oplists()->GetAs<Op>(i);
        if (nullptr == op || nullptr == op->outputIndexes()) {
            MNN_ERROR("Invalid Model, the %d op is empty\n", i);
            delete net;
            return nullptr;
        }
    }
```

### 网络和算子

我们在编译时通过脚本生成了`schema`，而`Net`和`oplists`相关的内容结构就是在这个时候被生成的，以`Net`为例，其本质是`flatbuffers::Table`实现的偏移量表，而获取`oplists`，实际上就是按照偏移量获取其某个位置的指针：

```cpp
const flatbuffers::Vector<flatbuffers::Offset<Op>> *oplists() const {
  return GetPointer<const flatbuffers::Vector<flatbuffers::Offset<Op>> *>(10);
}
```

## Session 的创建细节

`Session`的创建依赖于`createSession`族函数，其中涉及到两个配置结构：

- `ScheduleConfig`: `Session`的运行时信息（推理后端/线程数量等）
- `BackendConfig`：后端需要注意的配置信息（精度/内存策略/供电策略）

所有的`Session`创建流程最终都会汇集到`createMultiPathSession`，其签名为：

```cpp
Session* Interpreter::createMultiPathSession(const std::vector<ScheduleConfig>& configs, const RuntimeInfo& runtime);
```

值得注意的是，`Session`可以将模型推导分为多个子路径，`createMultiPathSession`支持传入一个配置列表来创建多个推理路径，每个路径拥有不同的配置选项。

该接口的第二参数是运行时信息，其本质是一张包含了所有推理后端的`std::map`：

```cpp
typedef std::pair<std::map<MNNForwardType, std::shared_ptr<Runtime>>,  std::shared_ptr<Runtime>> RuntimeInfo;
```

`Runtime`是推理使用的后端实例，负责真正的计算和推理资源管理，而`MNNForwardType`是后端类型，其典型值为：

```cpp
typedef enum {
    MNN_FORWARD_CPU = 0,
    MNN_FORWARD_AUTO = 4,
    MNN_FORWARD_CUDA = 2,
    MNN_FORWARD_OPENCL = 3,
    MNN_FORWARD_OPENGL = 6,
    MNN_FORWARD_VULKAN = 7,

    // ...
} MNNForwardType;
```

`RuntimeInfo`的第一项是所有可用的后端列表，第二项是固定的 CPU 后端。

### 后端创建

`createSession`会调用`createMultiPathSession`的变体，其接口如下：

```cpp
Session* Interpreter::createMultiPathSession(const std::vector<ScheduleConfig>& configs);
```

该函数会根据我们填写的配置自动创建`RuntimeInfo`，通过`createRuntime`：

```cpp
RuntimeInfo Interpreter::createRuntime(const std::vector<ScheduleConfig>& configs);
```

其实现可以总结为通过`configs`创建不同的后端，并自动选择`MNN_FORWARD_CPU`作为默认后端，限于篇幅不做展开。

> 如果有相同类型但不同配置的后端，后初始化的会覆盖先初始化的。

### Session的创建

当创建好后端之后，就可以继续创建`Session`了，`createMultiPathSession`的后续流程可以总结为以下部分：

- 配置后端（`setRuntimeHint`）
- 创建`SessionInfo`（张量和其他运行时数据的真正位置）
- 设置会话缓存（加速部分后端初始化）
- 创建`Session`
- 写入会话缓存

我们主要看`SessionInfo`和`Session`的创建。

`SessionInfo`的创建使用了`Schedule::schedule`：

```cpp
bool Schedule::schedule(ScheduleInfo& scheduleInfo, const Net* net, const std::vector<ScheduleConfig>& configs, const RuntimeInfo& runtimeInfo);
```

该函数的流程非常复杂，这里暂且把它看作一个黑盒子，其大致实现就是将模型复原为张量，并保存在`info`中，如果创建失败则返回`false`。

创建好`SessionInfo`后，函数会初始化一个`Session`的`unique_ptr`，其由`Interpreter`托管，最终返回给用户的是`unique_ptr`的 Handle，也就是指针本身。

```cpp
auto newSession =
    std::unique_ptr<Session>(new Session(std::move(info), mNet->modes, std::move(rt)));
auto result = newSession.get();

// ...

mNet->sessions.emplace_back(std::move(newSession));

// ...

return result;
```

> 笔者在这里省略了大部分内部实现，这些部分笔者可能会放在其他专题展开分析。

## 后记

笔者后续还会继续分析 Session API 的其他部分实现细节，尽请期待。
