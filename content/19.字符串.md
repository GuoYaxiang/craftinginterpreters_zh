# 19.字符串 Strings

> “Ah? A small aversion to menial labor?” The doctor cocked an eyebrow. “Understandable, but misplaced. One should treasure those hum-drum tasks that keep the body occupied but leave the mind and heart unfettered.”
>
> ​															——Tad Williams, *The Dragonbone Chair*

“啊？对琐碎的劳动有点反感？”医生挑了挑眉毛，“可以理解，但这是错误的。一个人应该珍惜那些让身体忙碌，但让思想和心灵不受束缚的琐碎工作。”（泰德-威廉姆斯，《龙骨椅》）

> Our little VM can represent three types of values right now: numbers, Booleans, and `nil`. Those types have two important things in common: they’re immutable and they’re small. Numbers are the largest, and they still fit into two 64-bit words. That’s a small enough price that we can afford to pay it for all values, even Booleans and nils which don’t need that much space.

我们的小虚拟机现在可以表示三种类型的值：数字，布尔值和`nil`。这些类型有两个重要的共同点：它们是不可变的，它们很小。数字是最大的，而它仍可以被2个64比特的字容纳。这是一个足够小的代价，我们可以为所有值都支付这个代价，即使是不需要那么多空间的布尔值和nil。

> Strings, unfortunately, are not so petite. There’s no maximum length for a string. Even if we were to artificially cap it at some contrived limit like 255 characters, that’s still too much memory to spend on every single value.

不幸的是，字符串就没有这么小了。一个字符串没有最大的长度，即使我们人为地将其限制在255个字符[^1]，这对于每个单独的值来说仍然花费了太多的内存。

> We need a way to support values whose sizes vary, sometimes greatly. This is exactly what dynamic allocation on the heap is designed for. We can allocate as many bytes as we need. We get back a pointer that we’ll use to keep track of the value as it flows through the VM.

我们需要一种方法来支持那些大小变化（有时变化很大）的值。这正是堆上动态分配的设计目的。我们可以根据需要分配任意多的字节。我们会得到一个指针，当值在虚拟机中流动时，我们会用该指针来跟踪它。

> ## 19 . 1 Values and Objects

## 19.1 值与对象

> Using the heap for larger, variable-sized values and the stack for smaller, atomic ones leads to a two-level representation. Every Lox value that you can store in a variable or return from an expression will be a Value. For small, fixed-size types like numbers, the payload is stored directly inside the Value struct itself.

将堆用于较大的、可变大小的值，将栈用于较小的、原子性的值，这就导致了两级表示形式。每个可以存储在变量中或从表达式返回的Lox值都是一个Value。对于小的、固定大小的类型（如数字），有效载荷直接存储在Value结构本身。

> If the object is larger, its data lives on the heap. Then the Value’s payload is a *pointer* to that blob of memory. We’ll eventually have a handful of heap-allocated types in clox: strings, instances, functions, you get the idea. Each type has its own unique data, but there is also state they all share that [our future garbage collector](http://www.craftinginterpreters.com/garbage-collection.html) will use to manage their memory.

如果对象比较大，它的数据就驻留在堆中。那么Value的有效载荷就是指向那块内存的一个指针。我们最终会在clox中拥有一些堆分配的类型：字符串、实例、函数，你懂的。每个类型都有自己独特的数据，但它们也有共同的状态，我们未来的垃圾收集器会用这些状态来管理它们的内存。

![Field layout of number and obj values.](19.字符串/value.png)

> We’ll call this common representation “Obj”. Each Lox value whose state lives on the heap is an Obj. We can thus use a single new ValueType case to refer to all heap-allocated types.

我们将这个共同的表示形式称为“Obj”[^2]。每个状态位于堆上的Lox值都是一个Obj。因此，我们可以使用一个新的ValueType来指代所有堆分配的类型。

*<u>value.h，在枚举ValueType中添加代码：</u>*

```c
  VAL_NUMBER,
  // 新增部分开始
  VAL_OBJ
  // 新增部分结束
} ValueType;
```

> When a Value’s type is `VAL_OBJ`, the payload is a pointer to the heap memory, so we add another case to the union for that.

当Value的类型是`VAL_OBJ`时，有效载荷是一个指向堆内存的指针，因此我们在联合体中为其添加另一种情况。

*<u>value.h，在结构体Value中添加代码：</u>*

```c
    double number;
    // 新增部分开始
    Obj* obj;
    // 新增部分结束
  } as; 
```

> As we did with the other value types, we crank out a couple of helpful macros for working with Obj values.

正如我们对其它值类型所做的那样，我们提供了几个有用的宏来处理Obj值。

*<u>value.h，在结构体Value后添加代码：</u>*

```c
#define IS_NUMBER(value)  ((value).type == VAL_NUMBER)
// 新增部分开始
#define IS_OBJ(value)     ((value).type == VAL_OBJ)
// 新增部分结束
#define AS_BOOL(value)    ((value).as.boolean)
```

> This evaluates to `true` if the given Value is an Obj. If so, we can use this:

如果给定的Value是一个Obj，则该值计算结果为`true`。如果这样，我们可以使用这个：

*<u>value.h，添加代码：</u>*

```c
#define IS_OBJ(value)     ((value).type == VAL_OBJ)
// 新增部分开始
#define AS_OBJ(value)     ((value).as.obj)
// 新增部分结束
#define AS_BOOL(value)    ((value).as.boolean)
```

> It extracts the Obj pointer from the value. We can also go the other way.

它会从值中提取Obj指针。我们也可以反其道而行之。

*<u>value.h，添加代码：</u>*

```c
#define NUMBER_VAL(value) ((Value){VAL_NUMBER, {.number = value}})
// 新增部分开始
#define OBJ_VAL(object)   ((Value){VAL_OBJ, {.obj = (Obj*)object}})
// 新增部分结束
typedef struct {
```

> This takes a bare Obj pointer and wraps it in a full Value.

该方法会接受一个Obj指针，并将其包装成一个完整的Value。

> ## 19 . 2 Struct Inheritance

## 19.2 结构体继承

> Every heap-allocated value is an Obj, but Objs are not all the same. For strings, we need the array of characters. When we get to instances, they will need their data fields. A function object will need its chunk of bytecode. How do we handle different payloads and sizes? We can’t use another union like we did for Value since the sizes are all over the place.

每个堆分配的值都是一个Obj，但Obj并不都是一样的。对于字符串，我们需要字符数组。等我们有了实例，它们需要自己的数据字段。一个函数对象需要的是其字节码块。我们如何处理不同的有效载荷和大小？我们不能像Value那样使用另一个联合体，因为这些大小各不相同。

> Instead, we’ll use another technique. It’s been around for ages, to the point that the C specification carves out specific support for it, but I don’t know that it has a canonical name. It’s an example of [*type punning*](https://en.wikipedia.org/wiki/Type_punning), but that term is too broad. In the absence of any better ideas, I’ll call it **struct inheritance**, because it relies on structs and roughly follows how single-inheritance of state works in object-oriented languages.

相对地，我们会使用另一种技术。它已经存在了很久，以至于C语言规范为它提供了明确的支持，但我不知道它是否有一个正式的名字。这是一个[类型双关](https://en.wikipedia.org/wiki/Type_punning)的例子，但这个术语太宽泛了。鉴于没有更好的想法，我将其称为**结构体继承**，因为它依赖于结构体，并大致遵循了面向对象语言中状态的单继承工作方式。

> Like a tagged union, each Obj starts with a tag field that identifies what kind of object it is—string, instance, etc. Following that are the payload fields. Instead of a union with cases for each type, each type is its own separate struct. The tricky part is how to treat these structs uniformly since C has no concept of inheritance or polymorphism. I’ll explain that soon, but first lets get the preliminary stuff out of the way.

与带标签的联合体一样，每个Obj开头都是一个标签字段，用于识别它是什么类型的对象——字符串、实例，等等。接下来是有效载荷字段。每种类型都有自己单独的结构，而不是各类型结构的联合体。棘手的部分是如何统一处理这些结构，因为C没有继承或多态的概念。我很快就会对此进行解释，但是首先让我们先弄清楚一些基本的东西。

> The name “Obj” itself refers to a struct that contains the state shared across all object types. It’s sort of like the “base class” for objects. Because of some cyclic dependencies between values and objects, we forward-declare it in the “value” module.

“Obj”这个名称本身指的是一个结构体，它包含所有对象类型共享的状态。它有点像对象的“基类”。由于值和对象之间存在一些循环依赖关系，我们在“value”模块中对其进行前置声明。

*<u>value.h，添加代码：</u>*

```c
#include "common.h"
// 新增部分开始
typedef struct Obj Obj;
// 新增部分结束
typedef enum {
```

> And the actual definition is in a new module.

实际的定义是在一个新的模块中。

*<u>object.h，创建新文件：</u>*

```c
#ifndef clox_object_h
#define clox_object_h

#include "common.h"
#include "value.h"

struct Obj {
  ObjType type;
};

#endif
```

> Right now, it contains only the type tag. Shortly, we’ll add some other bookkeeping information for memory management. The type enum is this:

现在，它只包含一个类型标记。不久之后，我们将为内存管理添加一些其它的簿记信息。类型枚举如下：

*<u>object.h，添加代码：</u>*

```c
#include "value.h"
// 新增部分开始
typedef enum {
  OBJ_STRING,
} ObjType;
// 新增部分结束
struct Obj {
```

> Obviously, that will be more useful in later chapters after we add more heap-allocated types. Since we’ll be accessing these tag types frequently, it’s worth making a little macro that extracts the object type tag from a given Value.

显然，等我们在后面的章节中添加了更多的堆分配类型之后，这个枚举会更有用。因为我们会经常访问这些标记类型，所以有必要编写一个宏，从给定的Value中提取对象类型标签。

*<u>object.h，添加代码：</u>*

```c
#include "value.h"
// 新增部分开始
#define OBJ_TYPE(value)        (AS_OBJ(value)->type)
// 新增部分结束
typedef enum {
```

> That’s our foundation.

这是我们的基础。

> Now, let’s build strings on top of it. The payload for strings is defined in a separate struct. Again, we need to forward-declare it.

现在，让我们在其上建立字符串。字符串的有效载荷定义在一个单独的结构体中。同样，我们需要对其进行前置声明。

*<u>value.h，添加代码：</u>*

```c
typedef struct Obj Obj;
// 新增部分开始
typedef struct ObjString ObjString;
// 新增部分结束
typedef enum {
```

> The definition lives alongside Obj.

这个定义与Obj是并列的。

*<u>object.h，在结构体Obj后添加代码：</u>*

```c
};
// 新增部分开始
struct ObjString {
  Obj obj;
  int length;
  char* chars;
};
// 新增部分结束
#endif
```

> A string object contains an array of characters. Those are stored in a separate, heap-allocated array so that we set aside only as much room as needed for each string. We also store the number of bytes in the array. This isn’t strictly necessary but lets us tell how much memory is allocated for the string without walking the character array to find the null terminator.

字符串对象中包含一个字符数组。这些字符存储在一个单独的、由堆分配的数组中，这样我们就可以按需为每个字符串留出空间。我们还会保存数组中的字节数。这并不是严格必需的，但可以让我们迅速知道为字符串分配了多少内存，而不需要遍历字符数组寻找空结束符。

> Because ObjString is an Obj, it also needs the state all Objs share. It accomplishes that by having its first field be an Obj. C specifies that struct fields are arranged in memory in the order that they are declared. Also, when you nest structs, the inner struct’s fields are expanded right in place. So the memory for Obj and for ObjString looks like this:

因为ObjString是一个Obj，它也需要所有Obj共有的状态。它通过将第一个字段置为Obj来实现这一点。C语言规定，结构体的字段在内存中是按照它们的声明顺序排列的。此外，当结构体嵌套时，内部结构体的字段会在适当的位置展开。所以Obj和ObjString的内存看起来是这样的：

![The memory layout for the fields in Obj and ObjString.](19.字符串/obj.png)

> Note how the first bytes of ObjString exactly line up with Obj. This is not a coincidence—C mandates it. This is designed to enable a clever pattern: You can take a pointer to a struct and safely convert it to a pointer to its first field and back.

注意ObjString的第一个字节是如何与Obj精确对齐的。这并非巧合——是C语言强制要求的[^3]。这是为实现一个巧妙的模式而设计的：你可以接受一个指向结构体的指针，并安全地将其转换为指向其第一个字段的指针，反之亦可。

> Given an `ObjString*`, you can safely cast it to `Obj*` and then access the `type` field from it. Every ObjString “is” an Obj in the OOP sense of “is”. When we later add other object types, each struct will have an Obj as its first field. Any code that wants to work with all objects can treat them as base `Obj*` and ignore any other fields that may happen to follow.

给定一个`ObjString*`，你可以安全地将其转换为`Obj*`，然后访问其中的`type`字段。每个ObjString“是”一个Obj，这里的“是”指OOP意义上的“是”。等我们稍后添加其它对象类型时，每个结构体都会有一个Obj作为其第一个字段。任何代码若想要面向所有对象，都可以把它们当做基础的`Obj*`，并忽略后面可能出现的任何其它字段。

> You can go in the other direction too. Given an `Obj*`, you can “downcast” it to an `ObjString*`. Of course, you need to ensure that the `Obj*` pointer you have does point to the `obj` field of an actual ObjString. Otherwise, you are unsafely reinterpreting random bits of memory. To detect that such a cast is safe, we add another macro.

你也能反向操作。给定一个`Obj*`，你可以将其“向下转换”为一个`ObjString*`。当然，你需要确保你的`Obj*`指针确实指向一个实际的ObjString中的`obj`字段。否则，你就会不安全地重新解释内存中的随机比特位。为了检测这种类型转换是否安全，我们再添加另一个宏。

*<u>object.h，添加代码：</u>*

```c
#define OBJ_TYPE(value)        (AS_OBJ(value)->type)
// 新增部分开始
#define IS_STRING(value)       isObjType(value, OBJ_STRING)
// 新增部分结束
typedef enum {
```

> It takes a Value, not a raw `Obj*` because most code in the VM works with Values. It relies on this inline function:

它接受一个Value，而不是原始的`Obj*`，因为虚拟机中的大多数代码都使用Value。它依赖于这个内联函数：

*<u>object.h，在结构体ObjString后添加代码：</u>*

```c
};
// 新增部分开始
static inline bool isObjType(Value value, ObjType type) {
  return IS_OBJ(value) && AS_OBJ(value)->type == type;
}
// 新增部分结束
#endif
```

> Pop quiz: Why not just put the body of this function right in the macro? What’s different about this one compared to the others? Right, it’s because the body uses `value` twice. A macro is expanded by inserting the argument *expression* every place the parameter name appears in the body. If a macro uses a parameter more than once, that expression gets evaluated multiple times.

突击测试：为什么不直接把这个函数体放在宏中？与其它函数相比，这个函数有什么不同？对，这是因为函数体使用了两次`value`。宏的展开方式是在主体中形参名称出现的每个地方插入实参*表达式*。如果一个宏中使用某个参数超过一次，则该表达式就会被求值多次。

> That’s bad if the expression has side effects. If we put the body of `isObjType()` into the macro definition and then you did, say,
>
> ```
> IS_STRING(POP())
> ```
>
> then it would pop two values off the stack! Using a function fixes that.

如果这个表达式有副作用，那就不好了。如果我们把`isObjType()`的主体放到宏的定义中，假设你这么使用

```c
IS_STRING(POP())
```

那么它就会从堆栈中弹出两个值！使用函数可以解决这个问题。

> As long as we ensure that we set the type tag correctly whenever we create an Obj of some type, this macro will tell us when it’s safe to cast a value to a specific object type. We can do that using these:

只要我们确保在创建某种类型的Obj时正确设置了类型标签，这个宏就会告诉我们何时将一个值转换为特定的对象类型是安全的。我们可以用下面这些函数来做转换：

*<u>object.h，添加代码：</u>*

```c
#define IS_STRING(value)       isObjType(value, OBJ_STRING)
// 新增部分开始
#define AS_STRING(value)       ((ObjString*)AS_OBJ(value))
#define AS_CSTRING(value)      (((ObjString*)AS_OBJ(value))->chars)
// 新增部分结束
typedef enum {
```

> These two macros take a Value that is expected to contain a pointer to a valid ObjString on the heap. The first one returns the `ObjString*` pointer. The second one steps through that to return the character array itself, since that’s often what we’ll end up needing.

这两个宏会接受一个Value，其中应当包含一个指向堆上的有效ObjString指针。第一个函数返回 `ObjString*` 指针。第二个函数更进一步返回了字符数组本身，因为这往往是我们最终需要的。

> ## 19 . 3 Strings

## 19.3 字符串

> OK, our VM can now represent string values. It’s time to add strings to the language itself. As usual, we begin in the front end. The lexer already tokenizes string literals, so it’s the parser’s turn.

好了，我们的虚拟机现在可以表示字符串值了。现在是时候向语言本身添加字符串了。像往常一样，我们从前端开始。词法解析器已经将字符串字面量标识化了，所以现在轮到解析器了。

*<u>compiler.c，替换1行：</u>*

```c
  [TOKEN_IDENTIFIER]    = {NULL,     NULL,   PREC_NONE},
  // 替换一行开始
  [TOKEN_STRING]        = {string,   NULL,   PREC_NONE},
  // 替换一行结束
  [TOKEN_NUMBER]        = {number,   NULL,   PREC_NONE},
```

> When the parser hits a string token, it calls this parse function:

当解析器遇到一个字符串标识时，会调用这个解析函数：

*<u>compiler.c，在number()方法后添加代码：</u>*

```c
static void string() {
  emitConstant(OBJ_VAL(copyString(parser.previous.start + 1,
                                  parser.previous.length - 2)));
}
```

> This takes the string’s characters directly from the lexeme. The `+ 1` and `- 2` parts trim the leading and trailing quotation marks. It then creates a string object, wraps it in a Value, and stuffs it into the constant table.

这里直接从词素中获取字符串的字符[^4]。`+1`和`-2`部分去除了开头和结尾的引号。然后，它创建了一个字符串对象，将其包装为一个Value，并塞入常量表中。

> To create the string, we use `copyString()`, which is declared in `object.h`.

为了创建字符串，我们使用了在`object.h`中声明的`copyString()`。

*<u>object.h，在结构体ObjString后添加代码：</u>*

```c
};
// 新增部分开始
ObjString* copyString(const char* chars, int length);
// 新增部分结束
static inline bool isObjType(Value value, ObjType type) {
```

> The compiler module needs to include that.

编译器模块需要引入它。

*<u>compiler.h，添加代码：</u>*

```c
#define clox_compiler_h
// 新增部分开始
#include "object.h"
// 新增部分结束
#include "vm.h"
```

> Our “object” module gets an implementation file where we define the new function.

我们的“object”模块有了一个实现文件，我们在其中定义新函数。

*<u>object.c，创建新文件：</u>*

```c
#include <stdio.h>
#include <string.h>

#include "memory.h"
#include "object.h"
#include "value.h"
#include "vm.h"

ObjString* copyString(const char* chars, int length) {
  char* heapChars = ALLOCATE(char, length + 1);
  memcpy(heapChars, chars, length);
  heapChars[length] = '\0';
  return allocateString(heapChars, length);
}
```

> First, we allocate a new array on the heap, just big enough for the string’s characters and the trailing terminator, using this low-level macro that allocates an array with a given element type and count:

首先，我们在堆上分配一个新数组，其大小刚好可以容纳字符串中的字符和末尾的结束符，使用这个底层宏来分配一个具有给定元素类型和数量的数组：

*<u>memory.h，添加代码：</u>*

```c
#include "common.h"
// 新增部分开始
#define ALLOCATE(type, count) \
    (type*)reallocate(NULL, 0, sizeof(type) * (count))
// 新增部分结束    
#define GROW_CAPACITY(capacity) \
```

> Once we have the array, we copy over the characters from the lexeme and terminate it.

有了数组以后，就把词素中的字符复制过来并终止[^5]。

> You might wonder why the ObjString can’t just point back to the original characters in the source string. Some ObjStrings will be created dynamically at runtime as a result of string operations like concatenation. Those strings obviously need to dynamically allocate memory for the characters, which means the string needs to *free* that memory when it’s no longer needed.

你可能想知道为什么ObjString不能直接执行源字符串中的原始字符。由于连接等字符串操作，一些ObjString会在运行时被动态创建。这些字符串显然需要为字符动态分配内存，这也意味着该字符串不再需要这些内存时，要*释放*它们。

> If we had an ObjString for a string literal, and tried to free its character array that pointed into the original source code string, bad things would happen. So, for literals, we preemptively copy the characters over to the heap. This way, every ObjString reliably owns its character array and can free it.

如果我们有一个ObjString存储字符串字面量，并且试图释放其中指向原始的源代码字符串的字符数组，糟糕的事情就会发生。因此，对于字面量，我们预先将字符复制到堆中。这样一来，每个ObjString都能可靠地拥有自己的字符数组，并可以释放它。

> The real work of creating a string object happens in this function:

创建字符串对象的真正工作发生在这个函数中：

*<u>object.c，添加代码：</u>*

```c
#include "vm.h"
// 新增部分开始
static ObjString* allocateString(char* chars, int length) {
  ObjString* string = ALLOCATE_OBJ(ObjString, OBJ_STRING);
  string->length = length;
  string->chars = chars;
  return string;
}
// 新增部分结束
```

> It creates a new ObjString on the heap and then initializes its fields. It’s sort of like a constructor in an OOP language. As such, it first calls the “base class” constructor to initialize the Obj state, using a new macro.

它在堆上创建一个新的ObjString，然后初始化其字段。这有点像OOP语言中的构建函数。因此，它首先调用“基类”的构造函数来初始化Obj状态，使用了一个新的宏。

*<u>object.c，添加代码：</u>*

```c
#include "vm.h"
// 新增部分开始
#define ALLOCATE_OBJ(type, objectType) \
    (type*)allocateObject(sizeof(type), objectType)
// 新增部分结束    
static ObjString* allocateString(char* chars, int length) {
```

> Like the previous macro, this exists mainly to avoid the need to redundantly cast a `void*` back to the desired type. The actual functionality is here:

跟前面的宏一样，这个宏[^6]的存在主要是为了避免重复地将`void*`转换回期望的类型。实际的功能在这里：

*<u>object.c，添加代码：</u>*

```c
#define ALLOCATE_OBJ(type, objectType) \
    (type*)allocateObject(sizeof(type), objectType)
// 新增部分开始    
static Obj* allocateObject(size_t size, ObjType type) {
  Obj* object = (Obj*)reallocate(NULL, 0, size);
  object->type = type;
  return object;
}
// 新增部分结束
static ObjString* allocateString(char* chars, int length) {
```

> It allocates an object of the given size on the heap. Note that the size is *not* just the size of Obj itself. The caller passes in the number of bytes so that there is room for the extra payload fields needed by the specific object type being created.

它在堆上分配了一个给定大小的对象。注意，这个大小*不仅仅*是Obj本身的大小。调用者传入字节数，以便为被创建的对象类型留出额外的载荷字段所需的空间。

> Then it initializes the Obj state—right now, that’s just the type tag. This function returns to `allocateString()`, which finishes initializing the ObjString fields. *Voilà*, we can compile and execute string literals.

然后它初始化Obj状态——现在这只是个类型标签。这个函数会返回到 `allocateString()`，它来完成对ObjString字段的初始化。就是这样，我们可以编译和执行字符串字面量了。

> ## 19 . 4 Operations on Strings

## 19.4 字符串操作

> Our fancy strings are there, but they don’t do much of anything yet. A good first step is to make the existing print code not barf on the new value type.

我们的花哨的字符串已经就位了，但是它们还没有发挥什么作用。一个好的第一步是使现有的打印代码不要排斥新的值类型。

*<u>value.c，在printValue()方法中添加代码：</u>*

```c
    case VAL_NUMBER: printf("%g", AS_NUMBER(value)); break;
    // 新增部分开始
    case VAL_OBJ: printObject(value); break;
    // 新增部分结束
  }
```

> If the value is a heap-allocated object, it defers to a helper function over in the “object” module.

如果该值是一个堆分配的对象，它会调用“object”模块中的一个辅助函数。

*<u>object.h，在copyString()方法后添加代码：</u>*

```c
ObjString* copyString(const char* chars, int length);
// 新增部分开始
void printObject(Value value);
// 新增部分结束
static inline bool isObjType(Value value, ObjType type) {
```

> The implementation looks like this:

对应的实现的这样的：

*<u>object.c，在copyString()方法后添加代码：</u>*

```c
void printObject(Value value) {
  switch (OBJ_TYPE(value)) {
    case OBJ_STRING:
      printf("%s", AS_CSTRING(value));
      break;
  }
}
```

> We have only a single object type now, but this function will sprout additional switch cases in later chapters. For string objects, it simply prints the character array as a C string.

我们现在只有一个对象类型，但是这个函数在后续的章节中会出现更多case分支。对于字符串对象，只是简单地将字符数组作为C字符串打印出来[^7]。

> The equality operators also need to gracefully handle strings. Consider:

相等运算符也需要优雅地处理字符串。考虑一下：

```c
"string" == "string"
```

> These are two separate string literals. The compiler will make two separate calls to `copyString()`, create two distinct ObjString objects and store them as two constants in the chunk. They are different objects in the heap. But our users (and thus we) expect strings to have value equality. The above expression should evaluate to `true`. That requires a little special support.

这是两个独立的字符串字面量。编译器会对`copyString()`进行两次单独的调用，创建两个不同的ObjString对象，并将它们作为两个常量存储在字节码块中。它们是堆中的不同对象。但是我们的用户（也就是我们）希望字符串的值是相等的。上面的表达式计算结果应该是`true`。这需要一点特殊的支持。

*<u>value.c，在valuesEqual()中添加代码：</u>*

```c
    case VAL_NUMBER: return AS_NUMBER(a) == AS_NUMBER(b);
    // 新增部分开始
    case VAL_OBJ: {
      ObjString* aString = AS_STRING(a);
      ObjString* bString = AS_STRING(b);
      return aString->length == bString->length &&
          memcmp(aString->chars, bString->chars,
                 aString->length) == 0;
    }
    // 新增部分结束
    default:         return false; // Unreachable.
```

> If the two values are both strings, then they are equal if their character arrays contain the same characters, regardless of whether they are two separate objects or the exact same one. This does mean that string equality is slower than equality on other types since it has to walk the whole string. We’ll revise that [later](http://www.craftinginterpreters.com/hash-tables.html), but this gives us the right semantics for now.

如果两个值都是字符串，那么当它们的字符数组中包含相同的字符时，它们就是相等的，不管它们是两个独立的对象还是完全相同的一个对象。这确实意味着字符串相等比其它类型的相等要慢，因为它必须遍历整个字符串。我们稍后会对此进行修改，但目前这为我们提供了正确的语义。

> Finally, in order to use `memcmp()` and the new stuff in the “object” module, we need a couple of includes. Here:

最后，为了使用`memcmp()`和“object”模块中的新内容，我们需要一些引入。这里：

*<u>value.c，添加代码：</u>*

```c
#include <stdio.h>
// 新增部分开始
#include <string.h>
// 新增部分结束
#include "memory.h"
```

> And here:

还有这里：

*<u>value.c，添加代码：</u>*

```c
#include <string.h>
// 新增部分开始
#include "object.h"
// 新增部分结束
#include "memory.h"
```

> ### 19 . 4 . 1 Concatenation

### 19.4.1 连接

> Full-grown languages provide lots of operations for working with strings—access to individual characters, the string’s length, changing case, splitting, joining, searching, etc. When you implement your language, you’ll likely want all that. But for this book, we keep things *very* minimal.

成熟的语言都提供了很多处理字符串的操作——访问单个字符、字符串长度、改变大小写、分割、连接、搜索等。当你实现自己的语言时，你可能会想要所有这些。但是在本书中，我们还是让事情保持简单。

> The only interesting operation we support on strings is `+`. If you use that operator on two string objects, it produces a new string that’s a concatenation of the two operands. Since Lox is dynamically typed, we can’t tell which behavior is needed at compile time because we don’t know the types of the operands until runtime. Thus, the `OP_ADD` instruction dynamically inspects the operands and chooses the right operation.

我们对字符串支持的唯一有趣的操作是`+`。如果你在两个字符串对象上使用这个操作符，它会产生一个新的字符串，是两个操作数的连接。由于Lox是动态类型的，因此我们在编译时无法判断需要哪种行为，因为我们在运行时才知道操作数的类型。因此，`OP_ADD`指令会动态地检查操作数，并选择正确的操作。

*<u>vm.c，在run()方法中替换1行：</u>*

```c
      case OP_LESS:     BINARY_OP(BOOL_VAL, <); break;
      // 替换部分开始
      case OP_ADD: {
        if (IS_STRING(peek(0)) && IS_STRING(peek(1))) {
          concatenate();
        } else if (IS_NUMBER(peek(0)) && IS_NUMBER(peek(1))) {
          double b = AS_NUMBER(pop());
          double a = AS_NUMBER(pop());
          push(NUMBER_VAL(a + b));
        } else {
          runtimeError(
              "Operands must be two numbers or two strings.");
          return INTERPRET_RUNTIME_ERROR;
        }
        break;
      }
      // 替换部分结束
      case OP_SUBTRACT: BINARY_OP(NUMBER_VAL, -); break;
```

> If both operands are strings, it concatenates. If they’re both numbers, it adds them. Any other combination of operand types is a runtime error.

如果两个操作数都是字符串，则连接。如果都是数字，则相加。任何其它操作数类型的组合都是一个运行时错误[^8]。

> To concatenate strings, we define a new function.

为了连接字符串，我们定义一个新函数。

*<u>vm.c，在isFalsey()方法后添加代码：</u>*

```c
static void concatenate() {
  ObjString* b = AS_STRING(pop());
  ObjString* a = AS_STRING(pop());

  int length = a->length + b->length;
  char* chars = ALLOCATE(char, length + 1);
  memcpy(chars, a->chars, a->length);
  memcpy(chars + a->length, b->chars, b->length);
  chars[length] = '\0';

  ObjString* result = takeString(chars, length);
  push(OBJ_VAL(result));
}
```

> It’s pretty verbose, as C code that works with strings tends to be. First, we calculate the length of the result string based on the lengths of the operands. We allocate a character array for the result and then copy the two halves in. As always, we carefully ensure the string is terminated.

这是相当繁琐的，因为处理字符串的C语言代码往往是这样。首先，我们根据操作数的长度计算结果字符串的长度。我们为结果分配一个字符数组，然后将两个部分复制进去。与往常一样，我们要小心地确保这个字符串被终止了。

> In order to call `memcpy()`, the VM needs an include.

为了调用`memcpy()`，虚拟机需要引入头文件。

*<u>vm.c，添加代码：</u>*

```c
#include <stdio.h>
// 新增部分开始
#include <string.h>
// 新增部分结束
#include "common.h"
```

> Finally, we produce an ObjString to contain those characters. This time we use a new function, `takeString()`.

最后，我们生成一个ObjString来包含这些字符。这次我们使用一个新函数`takeString()`。

*<u>object.h，在结构体ObjString后添加代码：</u>*

```c
};
// 新增部分开始
ObjString* takeString(char* chars, int length);
// 新增部分结束
ObjString* copyString(const char* chars, int length);
```

> The implementation looks like this:

其实现如下：

*<u>object.c，在allocateString()方法后添加代码：</u>*

```c
ObjString* takeString(char* chars, int length) {
  return allocateString(chars, length);
}
```

> The previous `copyString()` function assumes it *cannot* take ownership of the characters you pass in. Instead, it conservatively creates a copy of the characters on the heap that the ObjString can own. That’s the right thing for string literals where the passed-in characters are in the middle of the source string.

前面的`copyString()`函数假定它*不能*拥有传入的字符的所有权。相对地，它保守地在堆上创建了一个ObjString可以拥有的字符的副本。对于传入的字符位于源字符串中间的字面量来说，这样做是正确的。

> But, for concatenation, we’ve already dynamically allocated a character array on the heap. Making another copy of that would be redundant (and would mean `concatenate()` has to remember to free its copy). Instead, this function claims ownership of the string you give it.

但是，对于连接，我们已经在堆上动态地分配了一个字符数组。再做一个副本是多余的（而且意味着`concatenate()`必须记得释放它的副本）。相反，这个函数要求拥有传入字符串的所有权。

> As usual, stitching this functionality together requires a couple of includes.

通常，将这个功能拼接在一起需要引入一些头文件。

*<u>vm.c，添加代码：</u>*

```c
#include "debug.h"
// 新增部分开始
#include "object.h"
#include "memory.h"
// 新增部分结束
#include "vm.h"
```

> ## 19 . 5 Freeing Objects

## 19.5 释放对象

> Behold this innocuous-seeming expression:

看看这个看似无害的表达式：

```c
"st" + "ri" + "ng"
```

> When the compiler chews through this, it allocates an ObjString for each of those three string literals and stores them in the chunk’s constant table and generates this bytecode:

当编译器在处理这个表达式时，会为这三个字符串字面量分别分配一个ObjString，将它们存储到字节码块的常量表中[^9]，并生成这个字节码：

```c
0000    OP_CONSTANT         0 "st"
0002    OP_CONSTANT         1 "ri"
0004    OP_ADD
0005    OP_CONSTANT         2 "ng"
0007    OP_ADD
0008    OP_RETURN
```

> The first two instructions push `"st"` and `"ri"` onto the stack. Then the `OP_ADD` pops those and concatenates them. That dynamically allocates a new `"stri"` string on the heap. The VM pushes that and then pushes the `"ng"` constant. The last `OP_ADD` pops `"stri"` and `"ng"`, concatenates them, and pushes the result: `"string"`. Great, that’s what we expect.

前两条指令将`"st"`和`"ri"`压入栈中。然后`OP_ADD`将它们弹出并连接。这会在堆上动态分配一个新的`"stri"`字符串。虚拟机将它压入栈中，然后压入`"ng"`常量。最后一个`OP_ADD`会弹出`"stri"`和`"ng"`，将它们连接起来，并将结果`"string"`压入栈。很好，这就是我们所期望的。

> But, wait. What happened to that `"stri"` string? We dynamically allocated it, then the VM discarded it after concatenating it with `"ng"`. We popped it from the stack and no longer have a reference to it, but we never freed its memory. We’ve got ourselves a classic memory leak.

但是，请等一下。那个`"stri"`字符串怎么样了？我们动态分配了它，然后虚拟机在将其与`"ng"`连接后丢弃了它。我们把它从栈中弹出，不再持有对它的引用，但是我们从未释放它的内存。我们遇到了典型的内存泄露。

> Of course, it’s perfectly fine for the *Lox program* to forget about intermediate strings and not worry about freeing them. Lox automatically manages memory on the user’s behalf. The responsibility to manage memory doesn’t *disappear*. Instead, it falls on our shoulders as VM implementers.

当然，Lox程序完全可以忘记中间的字符串，也不必担心释放它们。Lox代表用户自动管理内存。管理内存的责任并没有*消失*，相反，它落到了我们这些虚拟机实现者的肩上。

> The full solution is a [garbage collector](http://www.craftinginterpreters.com/garbage-collection.html) that reclaims unused memory while the program is running. We’ve got some other stuff to get in place before we’re ready to tackle that project. Until then, we are living on borrowed time. The longer we wait to add the collector, the harder it is to do.

完整的解决方案是一个[垃圾回收器](http://www.craftinginterpreters.com/garbage-collection.html)，在程序运行时回收不使用的内存。在我们准备着手那个项目之前，还有一些其它的事情要做[^10]。在那之前，我们只是侥幸运行。我们等待添加收集器的时间越长，它就越难做。

> Today, we should at least do the bare minimum: avoid *leaking* memory by making sure the VM can still find every allocated object even if the Lox program itself no longer references them. There are many sophisticated techniques that advanced memory managers use to allocate and track memory for objects. We’re going to take the simplest practical approach.

今天我们至少应该做到最基本的一点：确保虚拟机可以找到每一个分配的对象，即使Lox程序本身不再引用它们，从而避免*泄露*内存。高级内存管理程序会使用很多复杂的技术来分配和跟踪对象的内存。我们将采取最简单的实用方法。

> We’ll create a linked list that stores every Obj. The VM can traverse that list to find every single object that has been allocated on the heap, whether or not the user’s program or the VM’s stack still has a reference to it.

我们会创建一个链表存储每个Obj。虚拟机可以遍历这个列表，找到在堆上分配的每一个对象，无论用户的程序或虚拟机的堆栈是否仍然有对它的引用。

> We could define a separate linked list node struct but then we’d have to allocate those too. Instead, we’ll use an **intrusive list**—the Obj struct itself will be the linked list node. Each Obj gets a pointer to the next Obj in the chain.

我们可以定义一个单独的链表节点结构体，但那样我们也必须分配这些节点。相反，我们会使用**侵入式列表**——Obj结构体本身将作为链表节点。每个Obj都有一个指向链中下一个Obj的指针。

*<u>object.h，在结构体Obj中添加代码：</u>*

```c
struct Obj {
  ObjType type;
  // 新增部分开始
  struct Obj* next;
  // 新增部分结束
};
```

> The VM stores a pointer to the head of the list.

VM存储一个指向表头的指针。

*<u>vm.h，在结构体VM中添加代码：</u>*

```c
  Value* stackTop;
  // 新增部分开始
  Obj* objects;
  // 新增部分结束
} VM;
```

> When we first initialize the VM, there are no allocated objects.

当我们第一次初始化VM时，没有分配的对象。

*<u>vm.c，在initVM()方法中添加代码：</u>*

```c
  resetStack();
  // 新增部分开始
  vm.objects = NULL;
  // 新增部分结束
}
```

> Every time we allocate an Obj, we insert it in the list.

每当我们分配一个Obj时，就将其插入到列表中。

*<u>object.c，在allocateObject()方法中添加代码：</u>*

```c
  object->type = type;
  // 新增部分开始
  object->next = vm.objects;
  vm.objects = object;
  // 新增部分结束
  return object;
```

> Since this is a singly linked list, the easiest place to insert it is as the head. That way, we don’t need to also store a pointer to the tail and keep it updated.

由于这是一个单链表，所以最容易插入的地方是头部。这样，我们就不需要同时存储一个指向尾部的指针并保持对其更新。

> The “object” module is directly using the global `vm` variable from the “vm” module, so we need to expose that externally.

“object”模块直接使用了“vm”模块的`vm`变量，所以我们需要将该变量公开到外部。

*<u>vm.h，在枚举InterpretResult后添加代码：</u>*

```c
} InterpretResult;
// 新增部分开始
extern VM vm;
// 新增部分结束
void initVM();
```

> Eventually, the garbage collector will free memory while the VM is still running. But, even then, there will usually be unused objects still lingering in memory when the user’s program completes. The VM should free those too.

最终，垃圾收集器会在虚拟机仍在运行时释放内存。但是，即便如此，当用户的程序完成时，通常仍会有未使用的对象驻留在内存中。VM也应该释放这些对象。

> There’s no sophisticated logic for that. Once the program is done, we can free *every* object. We can and should implement that now.

这方面没有什么复杂的逻辑。一旦程序完成，我们就可以释放*每个*对象。我们现在可以也应该实现它。

*<u>vm.c，在freeVM()方法中添加代码：</u>*

```c
void freeVM() {
  // 新增部分开始
  freeObjects();
  // 新增部分结束
}
```

> That empty function we defined [way back when](http://www.craftinginterpreters.com/a-virtual-machine.html#an-instruction-execution-machine) finally does something! It calls this:

我们早先定义的空函数终于有了用武之地！它调用了这个方法：

*<u>memory.h，在reallocate()方法后添加代码：</u>*

```c
void* reallocate(void* pointer, size_t oldSize, size_t newSize);
// 新增部分开始
void freeObjects();
// 新增部分结束
#endif
```

> Here’s how we free the objects:

下面是释放对象的方法：

*<u>memory.c，在reallocate()后添加代码：</u>*

```c
void freeObjects() {
  Obj* object = vm.objects;
  while (object != NULL) {
    Obj* next = object->next;
    freeObject(object);
    object = next;
  }
}
```

> This is a CS 101 textbook implementation of walking a linked list and freeing its nodes. For each node, we call:

这是CS 101教科书中关于遍历链表并释放其节点的实现。对于每个节点，我们调用：

*<u>memory.c，在reallocate()方法后添加代码：</u>*

```c
static void freeObject(Obj* object) {
  switch (object->type) {
    case OBJ_STRING: {
      ObjString* string = (ObjString*)object;
      FREE_ARRAY(char, string->chars, string->length + 1);
      FREE(ObjString, object);
      break;
    }
  }
}
```

> We aren’t only freeing the Obj itself. Since some object types also allocate other memory that they own, we also need a little type-specific code to handle each object type’s special needs. Here, that means we free the character array and then free the ObjString. Those both use one last memory management macro.

我们不仅释放了Obj本身。因为有些对象类型还分配了它们所拥有的其它内存，我们还需要一些特定于类型的代码来处理每种对象类型的特殊需求。在这里，这意味着我们释放字符数组，然后释放ObjString。它们都使用了最后一个内存管理宏。

*<u>memory.h，添加代码：</u>*

```c
    (type*)reallocate(NULL, 0, sizeof(type) * (count))
// 新增部分开始    
#define FREE(type, pointer) reallocate(pointer, sizeof(type), 0)
// 新增部分结束
#define GROW_CAPACITY(capacity) \
```

> It’s a tiny wrapper around `reallocate()` that “resizes” an allocation down to zero bytes.

这是围绕`reallocate()`的一个小包装[^11]，可以将分配的内存“调整”为零字节。

Using `reallocate()` to free memory might seem pointless. Why not just call `free()`? Later, this will help the VM track how much memory is still being used. If all allocation and freeing goes through `reallocate()`, it’s easy to keep a running count of the number of bytes of allocated memory.



> As usual, we need an include to wire everything together.

像往常一样，我们需要一个include将所有东西连接起来

*<u>memory.h，添加代码：</u>*

```c
#include "common.h"
// 新增部分开始
#include "object.h"
// 新增部分结束
#define ALLOCATE(type, count) \
```

> Then in the implementation file:

然后是实现文件：

*<u>memory.c，添加代码：</u>*

```c
#include "memory.h"
// 新增部分开始
#include "vm.h"
// 新增部分结束
void* reallocate(void* pointer, size_t oldSize, size_t newSize) {
```

> With this, our VM no longer leaks memory. Like a good C program, it cleans up its mess before exiting. But it doesn’t free any objects while the VM is running. Later, when it’s possible to write longer-running Lox programs, the VM will eat more and more memory as it goes, not relinquishing a single byte until the entire program is done.

这样一来，我们的虚拟机就不会再泄露内存了。像一个好的C程序一样，它会在退出之前进行清理。但在虚拟机运行时，它不会释放任何对象。稍后，当可以编写长时间运行的Lox程序时，虚拟机在运行过程中会消耗越来越多的内存，在整个程序完成之前不会释放任何一个字节。

We won’t address that until we’ve added [a real garbage collector](http://www.craftinginterpreters.com/garbage-collection.html), but this is a big step. We now have the infrastructure to support a variety of different kinds of dynamically allocated objects. And we’ve used that to add strings to clox, one of the most used types in most programming languages. Strings in turn enable us to build another fundamental data type, especially in dynamic languages: the venerable [hash table](http://www.craftinginterpreters.com/hash-tables.html). But that’s for the next chapter . . . 

在添加真正的垃圾收集器之前，我们不会解决这个问题，但这是一个很大的进步。我们现在拥有了支持各种不同类型的动态分配对象的基础设施。我们利用这一点在clox中加入了字符串，这是大多数编程语言中最常用的类型之一。字符串反过来又使我们能够构建另一种基本的数据类型，尤其是在动态语言中：古老的哈希表。但这是下一章的内容了……



[^1]: UCSD Pascal，Pascal最早的实现之一，就有这个确切的限制。Pascal字符串开头是长度值，而不是像C语言那样用一个终止的空字符表示字符串的结束。因为UCSD只使用一个字节来存储长度，所以字符串不能超过255个字符。![The Pascal string 'hello' with a length byte of 5 preceding it.](19.字符串/pstring.png)
[^2]: 当然，“Obj”是“对象（object）”的简称。
[^3]: 语言规范中的关键部分是：<BR>$ 6.7.2.1 13<BR>在一个结构体对象中，非位域成员和位域所在的单元的地址按照它们被声明的顺序递增。一个指向结构对象的指针，经过适当转换后，指向其第一个成员（如果该成员是一个位域，则指向其所在的单元），反之亦然。在结构对象中可以有未命名的填充，但不允许在其开头。
[^4]: 如果Lox支持像`\n`这样的字符串转义序列，我们会在这里对其进行转换。既然不支持，我们就可以原封不动地接受这些字符。
[^5]: 我们需要自己终止字符串，因为词素指向整个源字符串中的一个字符范围，并且没有终止符。<BR>由于ObjString明确存储了长度，我们*可以*让字符数组不终止，但是在结尾处添加一个终止符只花费一个字节，并且可以让我们将字符数组传递给期望带终止符的C标准库函数。
[^6]: 我承认这一章涉及了大量的辅助函数和宏。我试图让代码保持良好的分解，但这导致了一些分散的小函数。等我们以后重用它们时，将会得到回报。
[^7]: 我说过，终止字符串会有用的。
[^8]: 这比大多数语言都要保守。在其它语言中，如果一个操作数是字符串，另一个操作数可以是任何类型，在连接这两个操作数之前会隐式地转换为字符串。<BR>我认为这是一个很好的特性，但是需要为每种类型编写冗长的“转换为字符串”的代码，所以我在Lox中没有支持它。
[^9]: 下面是每条指令执行后的堆栈：![The state of the stack at each instruction.](19.字符串/stack.png)
[^10]: 我见过很多人在实现看语言的大部分内容之后，才试图开始实现GC。对于在开发语言时通常会运行的那种玩具程序，实际上不会在程序结束之前耗尽内存，所以在需要GC之前，你可以开发出很多的特性。<BR>但是，这低估了以后添加垃圾收集器的难度。收集器必须确保它能够找到每一点仍在使用的内存，这样它就不会收集活跃数据。一个语言的实现可以在数百个地方存储对某个对象的引用。如果你不能找到所有这些地方，你就会遇到噩梦般的漏洞。<BR>我曾见过一些语言实现因为后来的GC太困难而夭折。如果你的语言需要GC，请尽快实现它。它是涉及整个代码库的横切关注点。
[^11]: 使用`reallocate()`来释放内存似乎毫无意义。为什么不直接调用`free()`呢？稍后，这将帮助虚拟机跟踪仍在使用的内存数量。如果所有的分配和释放都通过`reallocate()`进行，那么就很容易对已分配的内存字节数进行记录。

---

## 习题

1. > Each string requires two separate dynamic allocations—one for the ObjString and a second for the character array. Accessing the characters from a value requires two pointer indirections, which can be bad for performance. A more efficient solution relies on a technique called **[flexible array members](https://en.wikipedia.org/wiki/Flexible_array_member)**. Use that to store the ObjString and its character array in a single contiguous allocation.

   每个字符串都需要两次单独的动态分配——一个是ObjString，另一个是字符数组。从一个值中访问字符需要两个指针间接访问，这对性能是不利的。一个更有效的解决方案是依靠一种名为[**灵活数组成员**](https://en.wikipedia.org/wiki/Flexible_array_member)的技术。用该方法将ObjString和它的字符数据存储在一个连续分配的内存中。

2. > When we create the ObjString for each string literal, we copy the characters onto the heap. That way, when the string is later freed, we know it is safe to free the characters too.
   >
   > This is a simpler approach but wastes some memory, which might be a problem on very constrained devices. Instead, we could keep track of which ObjStrings own their character array and which are “constant strings” that just point back to the original source string or some other non-freeable location. Add support for this.

   当我们为每个字符串字面量创建ObjString时，会将字符复制到堆中。这样，当字符串后来被释放时，我们知道释放这些字符也是安全的。

   这是一个简单但是会浪费一下内存的方法，这在非常受限的设备上可能是一个问题。相反，我们可以追踪哪些ObjString拥有自己的字符数组，哪些是“常量字符串”，只是指向原始的源字符串或其它不可释放的位置。添加对此的支持。

3. > If Lox was your language, what would you have it do when a user tries to use `+` with one string operand and the other some other type? Justify your choice. What do other languages do?

   如果Lox是你的语言，当用户试图用一个字符串操作数使用`+`，而另一个操作数是其它类型时，你会让它做什么？证明你的选择是正确的，其它的语言是怎么做的？

---

> ## DESIGN NOTE: STRING ENCODING

## 设计笔记：字符串编码

> In this book, I try not to shy away from the gnarly problems you’ll run into in a real language implementation. We might not always use the most *sophisticated* solution—it’s an intro book after all—but I don’t think it’s honest to pretend the problem doesn’t exist at all. However, I did skirt around one really nasty conundrum: deciding how to represent strings.
>
> There are two facets to a string encoding:
>
> - **What is a single “character” in a string?** How many different values are there and what do they represent? The first widely adopted standard answer to this was [ASCII](https://en.wikipedia.org/wiki/ASCII). It gave you 127 different character values and specified what they were. It was great . . . if you only ever cared about English. While it has weird, mostly forgotten characters like “record separator” and “synchronous idle”, it doesn’t have a single umlaut, acute, or grave. It can’t represent “jalapeño”, “naïve”, “Gruyère”, or “Mötley Crüe”.
>
>   Next came [Unicode](https://en.wikipedia.org/wiki/Unicode). Initially, it supported 16,384 different characters (**code points**), which fit nicely in 16 bits with a couple of bits to spare. Later that grew and grew, and now there are well over 100,000 different code points including such vital instruments of human communication as 💩 (Unicode Character ‘PILE OF POO’, `U+1F4A9`).
>
>   Even that long list of code points is not enough to represent each possible visible glyph a language might support. To handle that, Unicode also has **combining characters** that modify a preceding code point. For example, “a” followed by the combining character “¨” gives you “ä”. (To make things more confusing Unicode *also* has a single code point that looks like “ä”.)
>
>   If a user accesses the fourth “character” in “naïve”, do they expect to get back “v” or “¨”? The former means they are thinking of each code point and its combining character as a single unit—what Unicode calls an **extended grapheme cluster**—the latter means they are thinking in individual code points. Which do your users expect?
>
> - **How is a single unit represented in memory?** Most systems using ASCII gave a single byte to each character and left the high bit unused. Unicode has a handful of common encodings. UTF-16 packs most code points into 16 bits. That was great when every code point fit in that size. When that overflowed, they added *surrogate pairs* that use multiple 16-bit code units to represent a single code point. UTF-32 is the next evolution of UTF-16—it gives a full 32 bits to each and every code point.
>
>   UTF-8 is more complex than either of those. It uses a variable number of bytes to encode a code point. Lower-valued code points fit in fewer bytes. Since each character may occupy a different number of bytes, you can’t directly index into the string to find a specific code point. If you want, say, the 10th code point, you don’t know how many bytes into the string that is without walking and decoding all of the preceding ones.
>
> Choosing a character representation and encoding involves fundamental trade-offs. Like many things in engineering, there’s no perfect solution:
>
> - ASCII is memory efficient and fast, but it kicks non-Latin languages to the side.
> - UTF-32 is fast and supports the whole Unicode range, but wastes a lot of memory given that most code points do tend to be in the lower range of values, where a full 32 bits aren’t needed.
> - UTF-8 is memory efficient and supports the whole Unicode range, but its variable-length encoding makes it slow to access arbitrary code points.
> - UTF-16 is worse than all of them—an ugly consequence of Unicode outgrowing its earlier 16-bit range. It’s less memory efficient than UTF-8 but is still a variable-length encoding thanks to surrogate pairs. Avoid it if you can. Alas, if your language needs to run on or interoperate with the browser, the JVM, or the CLR, you might be stuck with it, since those all use UTF-16 for their strings and you don’t want to have to convert every time you pass a string to the underlying system.
>
> One option is to take the maximal approach and do the “rightest” thing. Support all the Unicode code points. Internally, select an encoding for each string based on its contents—use ASCII if every code point fits in a byte, UTF-16 if there are no surrogate pairs, etc. Provide APIs to let users iterate over both code points and extended grapheme clusters.
>
> This covers all your bases but is really complex. It’s a lot to implement, debug, and optimize. When serializing strings or interoperating with other systems, you have to deal with all of the encodings. Users need to understand the two indexing APIs and know which to use when. This is the approach that newer, big languages tend to take—like Raku and Swift.
>
> A simpler compromise is to always encode using UTF-8 and only expose an API that works with code points. For users that want to work with grapheme clusters, let them use a third-party library for that. This is less Latin-centric than ASCII but not much more complex. You lose fast direct indexing by code point, but you can usually live without that or afford to make it *O(n)* instead of *O(1)*.
>
> If I were designing a big workhorse language for people writing large applications, I’d probably go with the maximal approach. For my little embedded scripting language [Wren](http://wren.io/), I went with UTF-8 and code points.

在本书中，我尽量不回避你在真正的语言实现中会遇到的棘手问题。我们也许并不总是使用最复杂的解决方案——毕竟这只是一本入门书——但我认为假装问题根本不存在是不诚实的。但是，我们确实绕过了一个非常棘手的难题：决定如何表示字符串。

字符串编码有两个方面：

* 什么是字符串中的一个“字符”？有多少个不同的值，它们代表什么？第一个被广泛采用的标准答案是ASCII。它给出了127个不同的字符值，并指明了它们是什么。这太棒了……如果你只关心英语的话。虽然它包含有像“记录分隔符”和“同步空闲”这样奇怪的、几乎被遗忘的字符，但它没有元音变音、锐音或钝音。它无法表示 “jalapeño”，“naïve”，“Gruyère”或 “Mötley Crüe”。

  接下来是Unicode。最初，它支持16384个不同的字符（码点），这非常适合在16比特位中使用，还有几位是多余的。后来，这个数字不断增加，现在已经有了超过100,000个不同的码点，包括诸如💩（Unicode字符 "PILE OF POO"，U+1F4A9）等人类交流的重要工具。

  即使是这么长的码点列表，也不足以表示一种语言可能支持的每个可见字形。为了处理这个问题，Unicode还有一些组合字符，可以修改前面的码点。例如，“a”后面跟组合字符“¨”，就可以得到“ä”。（为了使事情更混乱，Unicode也有一个看起来像“ä”的单一码点）

  如果用户访问“naïve”中的第四个“字符”，他们希望得到的是“v”还是“¨”？前者意味着他们把每个码点及其组合符看着一个单元——Unicode称之为扩展的字母簇，后者意味着它们以单独的码点来思考。你的用户期望的是哪一种？

* 单一单元在内存中是如何表示的？大多数使用ASCII的系统给每个字符分配一个字节，高位不使用。Unicode有几种常见的编码方式。UTF-16将大多数码点打包成16比特。当每个码点都在这个范围内时，是很好的。当码点溢出时，它们增加了*代理对*，使用多个16比特码来表示一个码点。UTF-32是UTF-16的进一步演变，它为每个码点都提供了完整的32比特。

  UTF-8比这两个都要复杂。它使用可变数量的字节来对码点编码。低值的码点适合于较少的字节。因为每个字符可能占用不同数量的字节，你不能直接在字符串中索引到特定的码点。如果你想要访问，比如说，第10个码点，在不遍历和解码前面所有码点的情况下，你不知道它在字符串中占用多少个字节。

选择字符表示形式和编码涉及到基本的权衡。就像工程领域的许多事情一样，没有完美的解决方案：

【关于这个问题有多难的一个例子就是Python 。从Python 2到3的漫长转变之所以令人痛苦，主要是因为它围绕字符串编码的变化】

* ASCII内存效率高，速度快，但它把非拉丁语系的语言踢到了一边。
* UTF-32速度快，并且支持整个Unicode范围，但考虑到大多数码点往往都位于较低的值范围内，不需要完整的32比特，所以浪费了大量的内存。
* UTF-8的内存效率高，支持整个Unicode范围，但是它的可变长度编码使得在访问任意码点时速度很慢。
* UTF-16比所有这些都糟糕——这是Unicode超出其早期16比特范围的丑陋后果。它的内存效率低于UTF-8，但由于代理对的存在，它仍然是一种可变长度的编码。尽量避免使用它。唉，如果你的语言需要在浏览器、JVM或CLR上运行或与之交互，你也许就只能用它了，因为这些系统的字符串都使用UTF-16，而你并不想每次向底层系统传递字符串时都进行转换。

一种选择是采取最大限度的方法，做“最正确”的事情。支持所有的Unicode码点。在内部，根据每个字符串的内容选择编码——如果每个码点都在一个字节内，就使用ASCII；如果没有代理对，就使用UTF-16，等等。提供API，让用户对码点和扩展字母簇进行遍历。

这涵盖了所有的基础，但真的很复杂。需要实现、调试和优化的东西很多。当序列化字符串或与其它系统进行交互时，你必须处理所有的编码。用户需要理解这两种索引API，并知道何时使用哪一种。这是较新的大型语言倾向于采取的方法，比如Raku和Swift。

一种更简单的折衷办法是始终使用UTF-8编码，并且只暴露与码点相关的API。对于想要处理字母簇的用户，让他们使用第三方库来处理。这不像ASCII那样以拉丁语为中心，但也没有多复杂，虽然会失去通过码点快速直接索引的能力，但通常没有索引也可以，或者可以将索引改为O(n)而不是O(1)。

如果我要为编写大型应用程序的人设计一种大型工作语言，我可能会采用最大的方法。至于我的小型嵌入式脚本语言[Wren](http://wren.io/)，我采用了UTF-8和码点。
