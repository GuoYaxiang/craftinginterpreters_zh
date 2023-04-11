# craftinginterpreters_zh

[ [在线阅读](https://readonly.link/books/https://raw.githubusercontent.com/GuoYaxiang/craftinginterpreters_zh/main/book.json) ]

手撸解释器教程《Crafting Interpreters》中文翻译。

这是一个已基本完成的翻译项目，原项目是[craftinginterpreters](https://github.com/munificent/craftinginterpreters)，同时还有配套的英文书，可免费[在线阅读](http://www.craftinginterpreters.com/)。

该书由一门小型的自创语言Lox开始，分别使用Java和C实现了两种类型的解释器，jlox和clox，其中前者是将语法解析成Java中的表示代码，主要依赖Java本身的语法能力实现代码的真正运行；后者则采用了类似编译和虚拟机的机制，实现了一个看上去“更高效”的解释器。

该书中并不是只灌输概念或者只贴出代码，相反，作者经过悉心拆解解释器相关的概念，在每一章节中逐步进行讲解和实现，并且保证每个章节结束之后都有一个可以运行的解释器版本。内容上不会有太过深入的理论，对于普通编程爱好者也可以很容易地上手学习。

如果您的英语阅读能力比较强，建议直接阅读原文，同时也欢迎您参与本项目，分享自己学习的成果，帮助更多的人。

囿于本人能力限制，在译文难免有错漏或者含混之处，请积极留言，我会悉心听取大家的意见，争取可以让这篇译文帮助到更多人。

如果您觉得这篇译文对您的学习有所帮助，可以奖励作者一杯奶茶:)

<img src="http://img.codinghonest.space/donate/alipay.png" alt="支付宝" width="300" height="300" />                    <img src="http://img.codinghonest.space/donate/wechat.png" alt="微信支付" width="300" height="300" />

### 进度

| 章节序号 | 章节名                                                       | 内容简介     | 完成情况 |
| -------- | ------------------------------------------------------------ | ------------ | -------- |
| I        | [WELCOME](./content/I.WELCOME.md)                            | 导读         | 已完成   |
| 1        | [Introduction](./content/1.前言.md)                          | 前言         | 已完成   |
| 2        | [A Map of the Territory](./content/2.领土地图.md)            | 解释器简介   | 已完成   |
| 3        | [The Lox Language](./content/3.Lox语言.md)                   | Lox语言介绍  | 已完成   |
| II       | [A TREE-WALK INTERPRETER](./content/II.A_TREE-WALK_INTERPRETER.md) | jlox介绍     | 已完成   |
| 4        | [Scanning](./content/4.扫描.md)                              | 扫描器相关   | 已完成   |
| 5        | [Representing Code](./content/5.表示代码.md)                 | 表示代码     | 已完成   |
| 6        | [Parsing Expressions](./content/6.解析表达式.md)             | 解析表达式   | 已完成   |
| 7        | [Evaluating Expressions](./content/7.表达式求值.md)          | 执行表达式   | 已完成   |
| 8        | [Statements and State](./content/8.表达式和状态.md)          | 语句和状态   | 已完成   |
| 9        | [Control Flow](./content/9.控制流.md)                        | 控制流       | 已完成   |
| 10       | [Functions](./content/10.函数.md)                            | 函数         | 已完成   |
| 11       | [Resolving and Binding](./content/11.解析和绑定.md)          | 解析和绑定   | 已完成   |
| 12       | [Classes](./content/12.类.md)                                | 类           | 已完成   |
| 13       | [Inheritance](./content/13.继承.md)                          | 继承         | 已完成   |
| III      | [A BYTECODE VIRTUAL MACHINE](./content/III.A_BYTECODE_VIRTUAL_MACHINE.md) | clox介绍     | 已完成   |
| 14       | [Chunks of Bytecode](./content/14.字节码块.md)               | 字节码       | 已完成   |
| 15       | [A Virtual Machine](./content/15.虚拟机.md)                  | 虚拟机       | 已完成   |
| 16       | [Scanning on Demand](./content/16.按需扫描.md)               | 扫描         | 已完成   |
| 17       | [Compiling Expressions](./content/17.编译表达式.md)          | 编译表达式   | 已完成   |
| 18       | [Types of Values](./content/18.值类型.md)                    | 值类型       | 已完成   |
| 19       | [Strings](./content/19.字符串.md)                            | 字符串       | 已完成   |
| 20       | [Hash Tables](./content/20.哈希表.md)                        | 哈希表       | 已完成   |
| 21       | [Global Variables](./content/21.全局变量.md)                 | 全局变量     | 已完成   |
| 22       | [Local Variables](./content/22.局部变量.md)                  | 局部变量     | 已完成   |
| 23       | [Jumping Back and Forth](./content/23.来回跳转.md)           | 来回跳转     | 已完成   |
| 24       | [Calls and Functions](./content/24.调用和函数.md)            | 调用和函数   | 已完成   |
| 25       | [Closures](./content/25.闭包.md)                             | 闭包         | 已完成   |
| 26       | [Garbage Collection](./content/26.垃圾回收.md)               | 垃圾回收     | 已完成   |
| 27       | [Classes and Instances](./content/27.类与实例.md)            | 类和实例     | 已完成   |
| 28       | [Methods and Initializers](./content/28.方法和初始化器.md)   | 方法和初始化 | 已完成   |
| 29       | [Superclasses](./content/29.超类.md)                         | 超类         | 已完成   |
| 30       | [Optimization](./content/30.优化.md)                         | 优化         | 已完成   |
| ❧        | [BACKMATTER](./content/后记.md)                             | 后记         | 已完成   |
| A1       | [Appendix I: Lox Grammar](./content/附录I.md)               | Lox语法      | 已完成   |
| A2       | [Appendix II: Generated Syntax Tree Classes](./content/附录II.md) | 语法树类     | 已完成   |



PS：

文本中使用了很多Typora功能语法，建议使用[Typora](https://typora.io/)阅读，



### 特别鸣谢
感谢[xieyuheng](https://github.com/xieyuheng)提供的在线阅读支持，为需要在线阅读markdown文档的同学推荐[read-only项目](https://github.com/readonlylink/readonlylink)，样式简约大方，值得一试。