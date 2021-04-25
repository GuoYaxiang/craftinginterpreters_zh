# craftinginterpreters_zh
手撸解释器教程《Crafting Interpreters》中文翻译。

这是一个还在进行中的翻译项目，原项目是[craftinginterpreters](https://github.com/munificent/craftinginterpreters)，同时还有配套的英文书，可免费[在线阅读](http://www.craftinginterpreters.com/)。

该书由一门小型的自创语言Lox开始，分别使用Java和C实现了两种类型的解释器，jlox和clox，其中前者是将语法解析成Java中的表示代码，主要依赖Java本身的语法能力实现代码的真正运行；后者则采用了类似编译和虚拟机的机制，实现了一个看上去“更高效”的解释器。

该书中并不是只灌输概念或者只贴出代码，相反，作者经过悉心拆解解释器相关的概念，在每一章节中逐步进行讲解和实现，并且保证每个章节结束之后都有一个可以运行的解释器版本。内容上不会有太过深入的理论，对于普通编程爱好者也可以很容易地上手学习。

如果您的英语阅读能力比较强，建议直接阅读原文，同时也欢迎您参与本项目，分享自己学习的成果，帮助更多的人。

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
| 8        | Statements and State                                         | 语句和状态   | 进行中   |
| 9        | Control Flow                                                 | 控制流       | 未开始   |
| 10       | Functions                                                    | 函数         | 未开始   |
| 11       | Resolving and Binding                                        | 解析和绑定   | 未开始   |
| 12       | Classes                                                      | 类           | 未开始   |
| 13       | Inheritance                                                  | 继承         | 未开始   |
| III      | A BYTECODE VIRTUAL MACHINE                                   | clox介绍     | 未开始   |
| 14       | Chunks of Bytecode                                           | 字节码       | 未开始   |
| 15       | A Virtual Machine                                            | 虚拟机       | 未开始   |
| 16       | Scanning on Demand                                           | 扫描         | 未开始   |
| 17       | Compiling Expressions                                        | 编译表达式   | 未开始   |
| 18       | Types of Values                                              | 值类型       | 未开始   |
| 19       | Strings                                                      | 字符串       | 未开始   |
| 20       | Hash Tables                                                  | 哈希表       | 未开始   |
| 21       | Global Variables                                             | 全局变量     | 未开始   |
| 22       | Local Variables                                              | 局部变量     | 未开始   |
| 23       | Jumping Back and Forth                                       | 来回跳转     | 未开始   |
| 24       | Calls and Functions                                          | 调用和函数   | 未开始   |
| 25       | Closures                                                     | 闭包         | 未开始   |
| 26       | Garbage Collection                                           | 垃圾回收     | 未开始   |
| 27       | Classes and Instances                                        | 类和实例     | 未开始   |
| 28       | Methods and Initializers                                     | 方法和初始化 | 未开始   |
| 29       | Superclasses                                                 | 超类         | 未开始   |
| 30       | Optimization                                                 | 优化         | 未开始   |
| ❧        | BACKMATTER                                                   | 后记         | 未开始   |
| A1       | Appendix I: Lox Grammar                                      | Lox语法      | 未开始   |
| A2       | Appendix II: Generated Syntax Tree Classes                   | 语法树类     | 未开始   |

