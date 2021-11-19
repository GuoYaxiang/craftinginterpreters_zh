# III.A BYTECODE VIRTUAL MACHINE

> Our Java interpreter, jlox, taught us many of the fundamentals of programming languages, but we still have much to learn. First, if you run any interesting Lox programs in jlox, you’ll discover it’s achingly slow. The style of interpretation it uses—walking the AST directly—is good enough for some real-world uses, but leaves a lot to be desired for a general-purpose scripting language.

我们的Java解释器jlox教会了我们许多编程语言的基础知识，但我们仍然有许多东西需要学习。首先，如果你在jlox中运行任何Lox程序，你会发现它非常慢。它所使用的解释方式——直接遍历AST，对于某些实际应用来说已经足够了，但是对于通用脚本语言来说还有很多不足之处。

> Also, we implicitly rely on runtime features of the JVM itself. We take for granted that things like instanceof in Java work somehow. And we never for a second worry about memory management because the JVM’s garbage collector takes care of it for us.

另外，我们隐式地依赖于JVM本身的运行时特性。我们想当然地认为像`instanceof`这样的语句在Java中是可以工作的。而且我们从未担心过内存管理，因为JVM的垃圾收集器为我们解决了这个问题。

> When we were focused on high-level concepts, it was fine to gloss over those. But now that we know our way around an interpreter, it’s time to dig down to those lower layers and build our own virtual machine from scratch using nothing more than the C standard library . . . 

当我们专注于高层次概念时，我们可以忽略这些。但现在我们已经对解释器了如指掌，是时候深入到这些底层，从头开始构建我们自己的虚拟机，只用C语言标准库就可以了……