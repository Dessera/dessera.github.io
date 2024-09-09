---
title: 使用cv2的VideoCapture进行摄像头定时拍摄
tags:
- Python
- cv2
createTime: 2024/09/09 22:10:39
permalink: /article/9adgk4ek/
---

## 问题的引入

这几天做一个项目，需要用到cv2对摄像头进行定时拍摄，最开始我觉得这是个很简单的任务，于是我写了如下代码：

```python
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    cv2.imshow("frame", frame)
    if cv2.waitKey(1) & 0xFF == 27:
        break
```

上面是最经典的无延时cv2展示，接下来我们加点延时：

```python
@contextmanager
def fps_controller(fps: float):
    start_time = time.time()
    yield
    end_time = time.time()
    time_cost = end_time - start_time
    time_left = 1 / fps - time_cost
    if time_left > 0:
        time.sleep(time_left)

cap = cv2.VideoCapture(0)

while True:
    with fps_controller(1):
      ret, frame = cap.read()
      if not ret:
          break
      cv2.imshow("frame", frame)
      if cv2.waitKey(1) & 0xFF == 27:
          break
```

这个时候`waitKey`实际上作用就不大了，不过我们这里是测试的代码，不用考虑太多。

这个时候代码就应该正常工作了，但如果我们真正运行了它，就会发现——它根本不能工作！

发生了什么？按理说，这份代码会每秒拍摄一次摄像头**当前**的画面，并将他展示到显示屏中，但在实际使用中，它会自行预存大量的画面，导致在第一次调用`read()`之后，每一次的`read()`结果都不是当前的画面，而是**很久之前**的画面。

> 实际上我查阅了大量的资料，这些资料给出的理由是”VideoCapture的缓存机制“，上面的产生原因是我根据这句话推断的。

## 一些思路

发现了这个问题之后，我探索了几种解决方法：

- 每次拍摄完都销毁实例，使用时再重新创建：该方法是最简单的办法，但一次拍摄时间会因此延长到之前的一百倍，极度不推荐。
- 修改缓冲区大小：貌似`VideoCapture`有一个参数名为`CAP_PROP_BUFFERSIZE`，在我的摄像头下，该参数默认值是`4`，我尝试修改其为`1`，但情况并没有好转。
- 协程多任务式的帧数转换：利用`asyncio`创建两个任务，第一个任务以高帧率拍摄画面并存入`Buffer`,第二个任务以低帧率从`Buffer`中获取画面，但在帧率差距明显时，低帧率任务很难执行，大部分的运行时间都被高帧率任务夺走（个人认为是因为`cv2`本身是同步的，混入异步框架会占用大量CPU时间）。
- 基于多进程的帧数转换：大体类似于协程帧数转换，但将任务替换为两个进程。

> 为什么没有线程？考虑一下python的多核能力！

## 最终解：基于进程的帧数转换

我最终选用的是基于进程的帧数转换，利用`multiprocessing`模块，我们可以轻易实现多进行通信：

```python
from multiprocessing import Manager, Process

class MultiProcessCameraReader():
    """利用多进程的摄像头读取器

    多进程用于对帧率进行转换，解决了 VideoCapture 类中内置的缓存机制导致的画面滞后问题。
    """

    __camera_id: int
    __fps: float
    __manager: Manager  # type: ignore
    __queue: Any
    __process: Process | None

    def __init__(self, camera_id: int = 0, fps: float = 30):
        self.__camera_id = camera_id
        self.__fps = fps
        self.__manager = Manager()
        self.__queue = self.__manager.Queue(maxsize=5)  # type: ignore

    @staticmethod
    def __read_process(camera_id: int, fps: float, queue: Any):
        camera = VideoCapture(camera_id)
        while camera.isOpened():
            with fps_controller(fps):
                ret, frame = camera.read()
                if not ret:
                    continue
                if queue.full():
                    queue.get()
                queue.put(frame)
        camera.release()

    def read(self) -> MatLike | None:
        if self.__queue.empty():
            return None
        frame = self.__queue.get()
        return frame

    def start(self):
        self.__process = Process(
            target=self.__read_process,
            args=(self.__camera_id, self.__fps, self.__queue),
        )
        self.__process.start()

    def stop(self):
        if self.__process is not None:
            self.__process.terminate()
            self.__process.join()
            self.__process = None
```

虽然我个人不太喜欢`start`和`stop`这种额外初始化方法，不过不得不承认，他们在某些情况下确实比较好用。

简单拆解一下这个类：

- `start`：启动扫描进程，会初始化进程对象并启动。
- `stop`：停止扫描进程，向扫描进程发送中断信号，并等待其结束。
- `read`：封装的读取方法
- `__read_process`：扫描进程的执行函数

测试一下，在帧率比为`30/1`、`30/2`、`30/4`的情况下，均正常工作。
