---
title: Qt-MVC实践01-编写树形Model
createTime: 2024/11/15 23:26:58
permalink: /article/jya0uzwf/
tags:
- C++
- Qt
- GUI
- MVC
---

笔者近期比较沉迷于 Qt ，朋友非常热情的跟我说了很多关于 Qt 的话题，勾起了我对它的兴趣，作为前端程序员，我也很好奇 Qt 是如何实现的 MVC 架构，于是便有了这篇文章。

> 代码来自笔者的Qt练习项目

## 关于MVC

MVC实际上就是 Model-View-Controller 的缩写，它代表了一种用户交互方式，简单来说就是：

- Model： 负责存储数据
- View： 负责展示数据
- Controller： 负责对数据的操作

三者构成了循环关系， Model 为 View 提供了渲染内容， View 又引导用户进行操作， Controller 改变数据的内容，进而引发重新渲染，因为 MVC 清晰的区分了三者的关系，因此以这样的方式构建 UI 可以提高代码的健壮性和可读性，某种程度上，分离的模块也为其提供了可复用性。

## Qt 的 MVC

事先要说明的是，笔者**不认为** Qt 实现了标准的 MVC 架构，因为在 Qt MVC 中，实际上是没有 Controller 的，这是因为 Qt 本身存在一套元对象系统，交互是依赖信号和槽进行的，特地去封装 Controller 显得没那么重要。

> 笔者认为，相比 Model 和 View ， Controller 确实没那么重要，比如在前端我们的架构通常被称为 MVVM ，这是因为 Controller 被嵌入了 View 和 Model 中

## 编写一个 Model

### 数据结构

一切的 Model 都是从`QAbstractItemModel`延伸的，为了实现一个 Model ，我们需要重写它身上的方法，但在那之前，我们需要先有需要表示的数据结构，以`TodoTask`为例子：

```cpp
enum class TodoTaskStatus
{
  InProgress,
  Done
};

enum class TodoTaskPriority
{
  Low,
  Medium,
  High
};

struct TodoTask
{
  constexpr static int INVALID_ID = -1;
  constexpr static TodoTask* INVALID_TASK = nullptr;

  using ConstPtr = const TodoTask*;
  using Ptr = TodoTask*;

  int id;
  QString name;
  QString description;

  QDateTime start;
  QDateTime end;

  TodoTaskStatus status{ TodoTaskStatus::InProgress };
  TodoTaskPriority priority{ TodoTaskPriority::Medium };

  int parent_id{ INVALID_ID };

  static bool is_valid(TodoTask::ConstPtr task);
  static bool is_valid(TodoTask::Ptr task);
};
```

这段代码简要描述了一个任务，我们为其继承一个 Model ：

```cpp
class TodoTaskModel : public QAbstractItemModel
{
  Q_OBJECT
public:
  TodoTaskModel(QList<TodoTask> tasks = {}, QObject* parent = nullptr);
  ~TodoTaskModel() override;

private:
  QList<TodoTask> m_tasks;
};
```

在重写方法之前，我们需要先了解`ModelIndex`类。

### QModelIndex

为了能让 Model 传送任意类型的数据和适配任意类型的 View ， Qt 抽象了模型的索引，它表示在 View 的角度下，一个数据的位置。

如果 Model 只需要支持列表，那么我们甚至不必为它实现索引方法，参考 [Qt 的官方教程](https://doc.qt.io/qt-6/model-view-programming.html)，只需要实现`rowCount`和`data`即可。

但如果 Model 需要支持树形视图，事情就变得复杂了，因为一个索引必须能够找到它的父子和兄弟索引。同时，之前对`data`方法的实现也会失效。

我们需要先实现针对索引的方法：

```cpp{8-16}
class TodoTaskModel : public QAbstractItemModel
{
  Q_OBJECT
public:
  TodoTaskModel(QList<TodoTask> tasks = {}, QObject* parent = nullptr);
  ~TodoTaskModel() override;

  [[nodiscard]] QModelIndex index(
    int row,
    int column,
    const QModelIndex& parent = QModelIndex()) const override;
  [[nodiscard]] QModelIndex parent(const QModelIndex& index) const override;
  [[nodiscard]] QModelIndex sibling(int row,
                                    int column,
                                    const QModelIndex& index) const override;
  [[nodiscard]] bool hasChildren(const QModelIndex& parent) const override;

private:
  QList<TodoTask> m_tasks;
};
```

我们马上就能发现问题，`data`方法依赖`index`的创建，但`index`的创建又依赖数据结构本身（因为要引用`parent_id`），那么，该如何防止循环调用呢？

答案在于根 index 的创建，我们观察`index`函数的声明，在`parent`为默认值时，该函数实际上在请求根 index ，我们看一下该函数的实现：

```cpp
QModelIndex
TodoTaskModel::index(int row, int column, const QModelIndex& parent) const
{
  if (row < 0 || row >= this->rowCount(parent) || column < 0 ||
      column >= this->columnCount(parent)) {
    return {};
  }

  const auto* parent_task = TodoTask::from_index(parent);
  auto current_tasks = this->tasks(
    TodoTask::is_valid(parent_task) ? parent_task->id : TodoTask::INVALID_ID);
  if (row >= current_tasks.size()) {
    return {};
  }
  const auto* task = current_tasks.at(row);
  return this->createIndex(row, column, task);
}
```

我们推理一下该函数在`parent`为默认值时的行为，首先`rowCount`函数此时不需要依赖父索引数据，它在根索引时只需要查找所有`parent_id`为`INVALID_ID`的数据即可：

```cpp
int
TodoTaskModel::rowCount(const QModelIndex& parent) const
{
  const auto* parent_task = TodoTask::from_index(parent);
  auto count =
    this
      ->tasks((TodoTask::is_valid(parent_task)) ? parent_task->id : TodoTask::INVALID_ID)
      .size();
  return static_cast<int>(count);
}
```

`TodoTask::from_index`是工具函数，它调用`internalPointer`返回**我们插入的自定义数据**，因此，对无效的索引，该指针一定无效。

根索引不需要依赖任何父子，因此对于默认情况，`index`函数不会造成循环引用。因为根索引已经被创建，其它索引都可以通过根索引一步步获得。我们将数据指针放入了`internalPointer`，因此获得了索引就相当于获得了数据本身。

依据此，我们可以实现`data`方法：

```cpp
QVariant
TodoTaskModel::data(const QModelIndex& index, int role) const
{
  const auto* task = TodoTask::from_index(index);
  if (!TodoTask::is_valid(task)) {
    return {};
  }

  if (role == Qt::DisplayRole || role == Qt::EditRole) {
    return task->name;
  }

  return {};
}
```

### 更多索引函数

我们还可以实现寻找父索引和兄弟索引的方法：

```cpp
QModelIndex
TodoTaskModel::parent(const QModelIndex& index) const
{
  const auto* task = TodoTask::from_index(index);
  if (!TodoTask::is_valid(task)) {
    return {};
  }

  const auto* parent_task = this->get_parent(task);
  if (!TodoTask::is_valid(parent_task)) {
    return {};
  }

  int v_row = this->row_of_task(task);
  int v_column = index.column();
  return this->createIndex(v_row, v_column, parent_task);
}
```

这里面也涉及到几个 Helper ，分别是`get_parent`和`row_of_task`：

```cpp
TodoTask::ConstPtr
TodoTaskModel::get_parent(TodoTask::ConstPtr task) const
{
  if (!TodoTask::is_valid(task)) {
    return TodoTask::INVALID_TASK;
  }

  auto it_parent =
    std::find_if(m_tasks.begin(), m_tasks.end(), [task](const auto& t) {
      return t.id == task->parent_id;
    });
  return it_parent != m_tasks.end() ? &(*it_parent) : TodoTask::INVALID_TASK;
}

int
TodoTaskModel::row_of_task(TodoTask::ConstPtr task) const
{
  auto tasks = this->tasks(task->parent_id);
  return static_cast<int>(tasks.indexOf(task));
}
```

他们分别寻找当前节点的父节点和当前节点在父节点中的位置。

获取兄弟索引同理，先获取父索引下的节点列表，然后通过传入的位置寻找对应的数据：

```cpp
QModelIndex
TodoTaskModel::sibling(int row, int column, const QModelIndex& index) const
{
  if (row < 0 || column < 0 || !index.isValid()) {
    return {};
  }

  const auto* current_task = TodoTask::from_index(index);
  if (!TodoTask::is_valid(current_task)) {
    return {};
  }

  auto tasks = this->tasks(current_task->parent_id);
  if (row >= tasks.size()) {
    return {};
  }

  const auto* sibling_task = tasks.at(row);
  return this->createIndex(row, column, sibling_task);
}
```

最后是`hasChildren`函数，它只是把当前索引的数据拿出来，根据`id`查找子节点：

```cpp
bool
TodoTaskModel::hasChildren(const QModelIndex& parent) const
{
  const auto* parent_task = TodoTask::from_index(parent);
  if (!TodoTask::is_valid(parent_task)) {
    return true;
  }

  auto tasks = this->tasks(parent_task->id);
  return !tasks.isEmpty();
}
```

### 支持修改 Model

我们需要实现两个函数以支持 Model 的修改，分别是`flags`和`setData`：

```cpp

class TodoTaskModel : public QAbstractItemModel
{
  Q_OBJECT
public:
  TodoTaskModel(QList<TodoTask> tasks = {}, QObject* parent = nullptr);
  ~TodoTaskModel() override;

  [[nodiscard]] Qt::ItemFlags flags(const QModelIndex& index) const override;

  [[nodiscard]] bool setData(const QModelIndex& index,
                             const QVariant& value,
                             int role = Qt::EditRole) override;

private:
  QList<TodoTask> m_tasks;
};

```

`flags`是对索引的标记，标记它能够进行什么操作，我们重写这个函数，并添加`Qt::ItemIsEditable`：

```cpp
Qt::ItemFlags
TodoTaskModel::flags(const QModelIndex& index) const
{
  Qt::ItemFlags flags = QAbstractItemModel::flags(index);
  if (!index.isValid()) {
    return flags;
  }

  flags |= Qt::ItemIsSelectable | Qt::ItemIsEnabled | Qt::ItemIsEditable;
  return flags;
}
```

`setData`并没有什么特殊的，因为我们只展示了`name`，所以`setData`只设置数据的`name`：

```cpp
bool
TodoTaskModel::setData(const QModelIndex& index,
                       const QVariant& value,
                       int role)
{
  if (role != Qt::EditRole) {
    return false;
  }

  auto* task = TodoTask::from_index_mut(index);
  if (!TodoTask::is_valid(task)) {
    return false;
  }

  task->name = value.toString();
  emit dataChanged(index, index);
  return true;
}
```

## 结语

写下来感觉我贴了太多代码，没有什么说明，但我本人也比较纠结。实现 TreeModel 的根本是通过`internalPointer`传递数据，只要理解了这个，其他的内容都不需要解释什么。

这个例子比较原始，我们用的还是`QList`模拟真实的数据，如果读者感兴趣的话，可以参考 Qt 自己的[QFileSystemModel](https://github.com/qt/qt/blob/4.8/src/gui/dialogs/qfilesystemmodel.h)（虽然是4.8的实现，但仍然非常有用）。