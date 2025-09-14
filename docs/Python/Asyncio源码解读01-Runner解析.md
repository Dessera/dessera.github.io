---
title: Asyncio源码解读01-Runner解析
createTime: 2025/09/13 16:38:43
permalink: /article/d7zgcrhf/
tags:
- Python
- Asyncio
---

提到 Python 协程，我们一般会想到 Asyncio ，它是 Python 标准库实现的协程框架，代表了 Python 协程事实上的标准实现。

本系列文章旨在由浅至深地分析 Asyncio 的所有模块，剖析其实现原理。

> 本系列分析的`cpython`源码位于`main`分支，提交时间为 Fri Sep 12 22:25:18 2025 +0100，提交ID为`805e3368d6d07e58430654d1365283924fdf4143`。
>
> 为了简化代码分析，笔者会删除一部分`debug`代码。

## 协程和协程框架

在开始正式的代码解析之前，我们要先确立一个共识：**协程并不能等同于协程框架**。协程是一种高级函数，它表示一个能随时从某个断点跳出，并且能随时恢复到该断点继续执行的函数；而协程框架（或者说异步框架）是利用协程实现的异步开发框架，其包含了对上层开发需求的封装（例如IO、延时等）。

根据协程实现的方式不同，我们可以将其分类为**有栈**和**无栈**两种，有栈协程从操作系统的线程和进程切换获得灵感，通过保存和切换上下文实现断点的跳出和恢复；无栈协程则不同，它通过一个状态机维护当前函数的执行点，并用外部结构保存函数的所有状态（将其生命周期提升到函数生命周期之外），通过状态机选择每次进入函数的执行位置，以达成断点的跳出和恢复。

根据上面的描述，我们不难看出有栈协程和无栈协程的特点：

- 有栈协程：便于实现，但在断点必须确定下一个进入的协程，因此协程调度器需要以侵入式的方式传递给协程，并且每个协程都需要维护其栈空间，可能造成内存浪费。
- 无栈协程：实现困难（通常需要语言本身对其进行支持），但只需要维护状态机和栈空间，协程本身不与上层调度混杂，只需要固定的内存空间。

> 实际上，也有方法优化有栈协程的内存浪费，我们称为**共享栈**，但实际上无非是时间效率和空间效率的二选一。

编程语言一般更喜欢对无栈协程进行支持，再由第三方或者语言自身的标准库提供运行时支持，这里比较有名的有 Python 的 Asyncio 、Rust 的 Tokio 和 C++20 协程等。

## Asyncio

Asyncio 将协程封装为`Task`，使用事件循环机制调度任务直到所有的任务完成，而`Runner`是 Asyncio 暴露给外部的任务执行方法，其管理事件循环的生命周期。

`Runner`类存储于`runners.py`中，是该库中较为简单的部分。

## Asyncio Runner

当我们调用`asyncio.run(coro)`的时候，思考一下，Python 会在这个时候做什么？答案便位于`runners.py`中：

```python
def run(main, *, debug=None, loop_factory=None):
    if events._get_running_loop() is not None:
        raise RuntimeError(
            "asyncio.run() cannot be called from a running event loop")

    with Runner(debug=debug, loop_factory=loop_factory) as runner:
        return runner.run(main)
```

该函数分为两个部分：检查事件循环和启动`Runner`。

`asyncio.run`的目的是在一个没有任务的上下文中初始化一个任务，并等待它运行完成，因此，在进入`Runner`之前，我们必须保证事件循环没有在运行（即将要运行的任务是唯一可运行的任务）。

`Runner`支持了`with`语句，保证了`Runner`在构造和析构时执行初始化和清理操作（但实际上更重要的是清理行为，详见后文）。

### Runner 初始化

`Runner`的`with`表达式会调用`_lazy_init`，`_lazy_init`是一种初始化保证，它保证`Runner`在调用该函数后，一定处于就绪状态：

```python
    def __enter__(self):
        self._lazy_init()
        return self

    def _lazy_init(self):
        if self._state is _State.CLOSED:
            raise RuntimeError("Runner is closed")
        if self._state is _State.INITIALIZED:
            return
        if self._loop_factory is None:
            self._loop = events.new_event_loop()
            if not self._set_event_loop:
                events.set_event_loop(self._loop)
                self._set_event_loop = True
        else:
            self._loop = self._loop_factory()
        self._context = contextvars.copy_context()
        self._state = _State.INITIALIZED
```

在解读之前，我们必须说明的是，`running_loop`和`event_loop`并不等同，他们是两套体系，一套存储于`EventLoopPolicy`中，一套存储于`thread_local`的`_running_loop`中。

在`_lazy_init`中，首先检查状态机：

```python
        if self._state is _State.CLOSED:        # CLOSE 不应当再次初始化
            raise RuntimeError("Runner is closed")
        if self._state is _State.INITIALIZED:   # 已经初始化，直接退出
            return
```

接着，函数会检查`Runner`初始化时有没有传入事件循环工厂`_loop_factory`，如果有，直接使用工厂获取事件循环，否则使用默认实现：

```python
            self._loop = events.new_event_loop()
            if not self._set_event_loop:            # 只设置一次事件循环
                events.set_event_loop(self._loop)
                self._set_event_loop = True
```

只有第一次初始化时，我们才通过`set_event_loop`设置全局事件循环，这是为了防止在子观察器上多次调用`attach_loop`，具体细节我们会在分析事件循环时进行解释。

最后，`Runner`拷贝了当前环境的上下文，作为新协程的默认上下文：

```python
        self._context = contextvars.copy_context()
```

`contextvars`是 Python 提供的上下文库，它提供了比`thread_local`更封闭的`task_local`隔离。

其实这里，笔者觉得有些不大合理，如果我们构建如下案例：

```python
import asyncio
import contextvars

somevalue = contextvars.ContextVar("somevalue")
somevalue.set("ORIGINAL")

async def foo():
    print(somevalue.get())

with asyncio.Runner() as runner:
    somevalue.set("EDITED")
    runner.run(foo())
```

该案例最终的运行结果是`ORIGINAL`，也就是说，在我们调用`run`方法时，协程内的初始上下文并不严格等于调用者的上下文。但考虑到我们几乎不会自己调用`Runner.run`，因此也无伤大雅。

### Runner 运行

实际上，`run`方法内部已经包含了对`running_loop`的检查和`_lazy_init`，这就是为什么笔者说`with`的作用更多是确保清理行为，移除重复部分后，`run`方法如下：

```python
    def run(self, coro, *, context=None):
        if not coroutines.iscoroutine(coro):
            if inspect.isawaitable(coro):
                async def _wrap_awaitable(awaitable):
                    return await awaitable

                coro = _wrap_awaitable(coro)
            else:
                raise TypeError('An asyncio.Future, a coroutine or an '
                                'awaitable is required')

        if context is None:
            context = self._context

        task = self._loop.create_task(coro, context=context)

        if (threading.current_thread() is threading.main_thread()
            and signal.getsignal(signal.SIGINT) is signal.default_int_handler
        ):
            sigint_handler = functools.partial(self._on_sigint, main_task=task)
            try:
                signal.signal(signal.SIGINT, sigint_handler)
            except ValueError:
                sigint_handler = None
        else:
            sigint_handler = None

        self._interrupt_count = 0
        try:
            return self._loop.run_until_complete(task)
        except exceptions.CancelledError:
            if self._interrupt_count > 0:
                uncancel = getattr(task, "uncancel", None)
                if uncancel is not None and uncancel() == 0:
                    raise KeyboardInterrupt()
            raise
        finally:
            if (sigint_handler is not None
                and signal.getsignal(signal.SIGINT) is sigint_handler
            ):
                signal.signal(signal.SIGINT, signal.default_int_handler)
```

看起来略显复杂，我们可以一步步拆解分析，首先，该函数检查入参是否为协程：

```python
        if not coroutines.iscoroutine(coro):
            if inspect.isawaitable(coro):   # 不是协程，但可以等待，进行一次封装
                async def _wrap_awaitable(awaitable):
                    return await awaitable

                coro = _wrap_awaitable(coro)
            else:
                raise TypeError('An asyncio.Future, a coroutine or an '
                                'awaitable is required')
```

如代码所示，如果入参不是协程而是可等待类型，就用一层包装将其转换为协程，否则抛出异常。

> `iscoroutine`表示标记为协程的函数的返回值，`isawaitable`比较宽松，它只要求类型实现了`__await__`。

类型检查后，我们根据入参获取协程的上下文，如果没有指定，则使用我们刚刚复制好的上下文，然后，让事件循环创建任务：

```python
        task = self._loop.create_task(coro, context=context)
```

为了正确处理`SIGINT`，需要拦截`SIGINT`，但`SIGINT`回调只注册一次，并且必须在主线程中进行（保证信号处理的唯一性）：

```python
        # 注册 SIGINT 回调
        if (threading.current_thread() is threading.main_thread()
            and signal.getsignal(signal.SIGINT) is signal.default_int_handler
        ):
            sigint_handler = functools.partial(self._on_sigint, main_task=task)
            try:
                signal.signal(signal.SIGINT, sigint_handler)
            except ValueError:
                sigint_handler = None
        else:
            sigint_handler = None

        # 初始化中断次数
        self._interrupt_count = 0
```

注册完成后，初始化`_interrupt_count`，其代表了程序被中断的次数，在`_on_sigint`中被使用：

```python
    def _on_sigint(self, signum, frame, main_task):
        self._interrupt_count += 1
        if self._interrupt_count == 1 and not main_task.done(): # 第一次中断，取消
            main_task.cancel()
            self._loop.call_soon_threadsafe(lambda: None)
            return
        raise KeyboardInterrupt()                               # 后续中断，直接结束程序
```

如果第一次被中断，则取消`main_task`，并向事件循环推入一个空回调函数防止长时间停滞在`select`等调用上，这段操作实际上并不保证任务一定被取消。

如果第二次被中断，则直接触发`KeyboardInterrupt`，直接结束程序。

做好完全准备后，执行任务，直到任务完成：

```python
        try:
            return self._loop.run_until_complete(task)  # 等待任务完成
        except exceptions.CancelledError:               # 处理取消
            if self._interrupt_count > 0:
                uncancel = getattr(task, "uncancel", None)
                if uncancel is not None and uncancel() == 0:
                    raise KeyboardInterrupt()
            raise
        finally:
            # 移除 SIGINT 回调
            if (sigint_handler is not None
                and signal.getsignal(signal.SIGINT) is sigint_handler
            ):
                signal.signal(signal.SIGINT, signal.default_int_handler)
```

如果发生了取消异常，分为两种情况：

- 该操作是人为的（`_interrupt_count > 0`），并且任务只被取消了一次（`uncancel`和`cancel`成对出现，表示减少取消计数和增加取消计数），是正常的取消操作，将其转换为`KeyboardInterrupt`。
- 不符合以上条件，是非正常的取消，直接抛出取消异常。

最后，我们移除`SIGINT`的回调（本次运行结束，不需要继续处理中断）。

### Runner 清理

`Runner`自己的生命周期末期，需要调用`close`来清理事件循环：

```python
    def close(self):
        if self._state is not _State.INITIALIZED:
            return
        try:
            loop = self._loop

            # 取消所有任务
            _cancel_all_tasks(loop)

            # 关闭所有异步生成器
            loop.run_until_complete(loop.shutdown_asyncgens())

            # 关闭默认 Executor
            loop.run_until_complete(
                loop.shutdown_default_executor(constants.THREAD_JOIN_TIMEOUT))
        finally:
            if self._set_event_loop:
                events.set_event_loop(None)
            loop.close()
            self._loop = None
            self._state = _State.CLOSED
```

取消操作总共分为三步：

- 取消所有任务
- 关闭所有异步生成器
- 关闭默认`executor`

在将事件循环内部清理干净之后，我们移除全局时间循环，并将其关闭。

`_cancel_all_tasks`的逻辑为：

```python
def _cancel_all_tasks(loop):
    to_cancel = tasks.all_tasks(loop)
    if not to_cancel:
        return

    for task in to_cancel:
        task.cancel()

    loop.run_until_complete(tasks.gather(*to_cancel, return_exceptions=True))

    for task in to_cancel:
        if task.cancelled():
            continue
        if task.exception() is not None:
            loop.call_exception_handler({
                'message': 'unhandled exception during asyncio.run() shutdown',
                'exception': task.exception(),
                'task': task,
            })
```

该函数对事件循环中所有的任务调用取消，并等待他们退出（不抛出异常）：

```python
    for task in to_cancel:  # 循环标记取消所有任务
        task.cancel()

    # 等待所有任务都退出
    loop.run_until_complete(tasks.gather(*to_cancel, return_exceptions=True))
```

然后，一个个遍历取消的任务，如果有非取消异常，我们需要特殊处理（交给事件循环）：

```python
    for task in to_cancel:
        if task.cancelled():                # 取消成功，下一个
            continue
        if task.exception() is not None:    # 有异常，交给事件循环
            loop.call_exception_handler({
                'message': 'unhandled exception during asyncio.run() shutdown',
                'exception': task.exception(),
                'task': task,
            })
```

## 总结

`Runner`是距离我们用户最近的 Asyncio 接口，它的目的是管理事件循环的生命周期并帮助我们执行主任务，其中的设计无疑是值得称赞的——作为暴露给外部的接口，无论用户如何使用`Runner`，它都尽最大努力保证操作正常完成。

之后的章节会从`Runner`延伸，解析 Asyncio 的核心模块。
