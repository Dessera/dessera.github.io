---
title: 项目笔记-QUIP聊天服务器01-协议设计
createTime: 2025/09/28 21:58:58
permalink: /article/px5k17km/
tags:
- 计算机网络
- Rust
- 草稿
---

<script setup>
import RepoCard from 'vuepress-theme-plume/features/RepoCard.vue'
</script>

笔者最近在编写一个由 Rust 实现的聊天服务器，本意是作为协程应用的练习，在这个过程中收获颇丰，因
此编写一些项目笔记。

## 关于 QUIP

QUIP是笔者第一次动手设计一个应用层协议，相比已经成熟的协议，QUIP的简化主要体现在以下几点：

- 不实现复杂编码，名义上只支持 UTF-8 （基于Rust String）
- 不支持文件传输
- 暂不支持复杂的用户验证

截至笔者撰写本文时， QUIP 已经实现了如下功能：

- 基于内存的用户存储后端
- 简单（无加密）用户验证
- 消息传递和服务器主动推送
- 消息缓存

详情请见：

<RepoCard repo="Dessera/quip" />

## 参考 IMAP4 协议框架

对于**任何**基于 TCP 的应用层协议来说，我们要解决的第一件事永远都是——如何解决粘包拆包问题，或者说更本质的，我们要保证客户端能够分辨一条完整的响应，服务端能够分辨一条完整的请求。

除此之外，我们还要求客户端能够对应它发送的请求和服务端返回的响应，这是为了客户端程序能够正确分响应。

我们可以借鉴 IMAP4 来构建最基本的消息，IMAP4 的请求格式大致如下：

```plaintext
<TAG> <COMMAND> <ARG1> <ARG2> ...
```

譬如，对于 IMAP4 来说，一条登录指令应该为如下样式：

```plaintext
A000 LOGIN "Dessera" "Password"
```

发送时，还需要为消息添加`\r\n`作为分隔符，这是为了在发生粘包拆包问题时，我们能够正确的分辨一条消息，同样地，响应也应当添加分隔。

每一条指令都有一个`TAG`，这是为了让客户端对应请求与响应，当服务器返回响应时，`TAG`会作为响应头被加入到响应之中。

响应的格式有两种（对于 IMAP4 而言则不止如此，但我们这里只做简要介绍）：

```plaintext
* <STATUS> <MSG>
```

或者

```plaintext
<TAG> <STATUS> <MSG>
```

比如 IMAP4 可能会返回如下响应：

```plaintext
* OK Some message
A000 AUTHENTICATE XOAUTH2
```

第一种响应代表没有对应的请求、或者响应的数据部分，而后者则对应着请求的`TAG`，一般用来表示请求的响应状态。

同样地，响应也以`\r\n`结束。

基于对 IMAP4 的简单理解，我们可以实现一个简单的协议模型。

## QUIP 基本请求和响应

QUIP 的基本请求和响应格式与 IMAP4 类似，每条消息由若干个 Tokens 组成，Tokens 之间以空格分隔，Token 的格式如下：

- 没有空格的纯文本，通过`\`转义特殊字符：`Login`、`Hello`、`Some\ Message`等
- 带有引号的文本，内部的空格将被保留，同样可以通过`\`进行转义：`"Hello \"world\"!"`等

请求格式如下，每个尖括号代表一个 Token ：

```plaintext
<TAG> <COMMAND> <ARG1> <ARG2> ...
```

对于 QUIP 来说，所有的参数都是字符串，协议支持的命令如下：

- `Send`：`A000 Send Receiver Message`
- `Login`：`A000 Login Username Password`
- `Nop`：`A000 Nop`
- `Logout`：`A000 Logout`

响应格式如下：

```plaintext
<TAG>|* <STATUS> (<MSG>)
```

如果没有对应请求则返回`*`，如果没有消息则不返回，所有响应状态如下：

- `Recv`：`* Recv Sender Message`
- `Success`：`A000 Success Message`（可能没有消息）
- `Error`：`A000 Error ErrorCode`（如果命令解析失败则没有`TAG`）
