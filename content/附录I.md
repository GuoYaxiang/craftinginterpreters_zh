# 附录I Appendix I

> Here is a complete grammar for Lox. The chapters that introduce each part of the language include the grammar rules there, but this collects them all into one place.

这里有一份Lox的完整语法。介绍语言每个部分的章节中都包含对应的语法规则，但这里将它们全部收录在一起了。

> ## A1 . 1 Syntax Grammar

## A1.1 语法

> The syntactic grammar is used to parse the linear sequence of tokens into the nested syntax tree structure. It starts with the first rule that matches an entire Lox program (or a single REPL entry).

语法用于将词法标识（token）的线性序列解析为嵌套的语法树结构。它从匹配整个Lox程序（或单条REPL输入）的第一个规则开始。

```
program        → declaration* EOF ;
```

> ### A1 . 1 . 1 Declarations

### A1.1.1 声明

> A program is a series of declarations, which are the statements that bind new identifiers or any of the other statement types.

一个程序就是一系列的声明，也就是绑定新标识符或其它statement类型的语句。

```
declaration    → classDecl
               | funDecl
               | varDecl
               | statement ;

classDecl      → "class" IDENTIFIER ( "<" IDENTIFIER )?
                 "{" function* "}" ;
funDecl        → "fun" function ;
varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;
```

> ### A1 . 1 . 2 Statements

### A1.1.2 语句

> The remaining statement rules produce side effects, but do not introduce bindings.

其余的语句规则会产生副作用，但不会引入绑定。

```
statement      → exprStmt
               | forStmt
               | ifStmt
               | printStmt
               | returnStmt
               | whileStmt
               | block ;

exprStmt       → expression ";" ;
forStmt        → "for" "(" ( varDecl | exprStmt | ";" )
                           expression? ";"
                           expression? ")" statement ;
ifStmt         → "if" "(" expression ")" statement
                 ( "else" statement )? ;
printStmt      → "print" expression ";" ;
returnStmt     → "return" expression? ";" ;
whileStmt      → "while" "(" expression ")" statement ;
block          → "{" declaration* "}" ;
```

> Note that `block` is a statement rule, but is also used as a nonterminal in a couple of other rules for things like function bodies.

请注意，`block`是一个语句规则，但在其它规则中也作为非终止符使用，用于表示函数体等内容。

> ### A1 . 1 . 3 Expressions

### A1.1.3 表达式

> Expressions produce values. Lox has a number of unary and binary operators with different levels of precedence. Some grammars for languages do not directly encode the precedence relationships and specify that elsewhere. Here, we use a separate rule for each precedence level to make it explicit.

表达式会产生值。Lox有许多具有不同优先级的一元或二元运算符。一些语言的语法中没有直接编码优先级关系，而是在其它地方指定。在这里，我们为每个优先级使用单独的规则，使其明确。

```
expression     → assignment ;

assignment     → ( call "." )? IDENTIFIER "=" assignment
               | logic_or ;

logic_or       → logic_and ( "or" logic_and )* ;
logic_and      → equality ( "and" equality )* ;
equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → unary ( ( "/" | "*" ) unary )* ;

unary          → ( "!" | "-" ) unary | call ;
call           → primary ( "(" arguments? ")" | "." IDENTIFIER )* ;
primary        → "true" | "false" | "nil" | "this"
               | NUMBER | STRING | IDENTIFIER | "(" expression ")"
               | "super" "." IDENTIFIER ;
```

> ### A1 . 1 . 4 Utility rules

### A1.1.4 实用规则

> In order to keep the above rules a little cleaner, some of the grammar is split out into a few reused helper rules.

为了使上面的规则更简洁一点，一些语法被拆分为几个重复使用的辅助规则。

```
function       → IDENTIFIER "(" parameters? ")" block ;
parameters     → IDENTIFIER ( "," IDENTIFIER )* ;
arguments      → expression ( "," expression )* ;
```

> ## A1 . 2 Lexical Grammar

## A1.2 词法

> The lexical grammar is used by the scanner to group characters into tokens. Where the syntax is [context free](https://en.wikipedia.org/wiki/Context-free_grammar), the lexical grammar is [regular](https://en.wikipedia.org/wiki/Regular_grammar)—note that there are no recursive rules.

词法被扫描器用来将字符分组为词法标识（token）。语法是[上下文无关](https://en.wikipedia.org/wiki/Context-free_grammar)的，词法是[正则](https://en.wikipedia.org/wiki/Regular_grammar)的——注意这里没有递归规则。

```
NUMBER         → DIGIT+ ( "." DIGIT+ )? ;
STRING         → "\"" <any char except "\"">* "\"" ;
IDENTIFIER     → ALPHA ( ALPHA | DIGIT )* ;
ALPHA          → "a" ... "z" | "A" ... "Z" | "_" ;
DIGIT          → "0" ... "9" ;
```