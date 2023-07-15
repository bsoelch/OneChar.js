# OneChar.js

Online interpreter for [ForWhile](https://github.com/bsoelch/ForWhile) and [OneChar](https://github.com/bsoelch/OneChar2)

## Usage

Run the [HTML-file](https://bsoelch.github.io/OneChar.js/).

Enter Code in the large box on the left, click the `>` button to run it.

### IO

The contents of standard input can be entered in the `Input:` box,
interactive input is not supported.

The output of the programs will be printed to the `Output:` box.

## Supported Languages

The interpreted uses `ForWhile` by default, the language can be changed using `lang=?` in the query of the URL.

### [ForWhile](https://esolangs.org/wiki/ForWhile)

Stack-based programming language without infinite Loops

[Helllo, World](https://bsoelch.github.io/OneChar.js/?lang=ForWhile&src=IkhlbGxvLCBXb3JsZCEiKCwjKQ==):

```
"Hello World!"(,#)
```

### [OneChar](https://github.com/bsoelch/OneChar2)

Stack-based programming language

[Hello, World](https://bsoelch.github.io/OneChar.js/?lang=OneChar&src=IkhlbGxvLCBXb3JsZCEiKCwjKQ==):

```
"Hello World!"(,#)
```

### [Brainfuck](https://esolangs.org/wiki/Brainfuck)

Minimalistic programming language

[Hello, World](https://bsoelch.github.io/OneChar.js/?lang=Brainfuck&src=K1stLT4tWz4-Kz4tLS0tLTw8XTwtLTwtLS1dPi0uPj4-Ky4-Pi4uKysrWy4-XTw8PDwuKysrLi0tLS0tLS48PC0uPj4-Pisu):

```
+[-->-[>>+>-----<<]<--<---]>-.>>>+.>>..+++[.>]<<<<.+++.------.<<-.>>>>+.
```

### BrainForWhile

Brainfuck with for-loops instead of while-loops

[Hello, World](https://bsoelch.github.io/OneChar.js/?lang=BrainForWhile&src=KysrKygrPis8KSg-KD4rKz4rKys-KysrPis8PDw8KT4rPis-LT4-Kzw8PDw8PCk-Pi4-LS0tLisrKysrKysuLisrKy4-Pi48LS48LisrKy4tLS0tLS0uLS0tLS0tLS0uPj4rLj4rKy4=):

```
++++(+>+<)(>(>++>+++>+++>+<<<<)>+>+>->>+<<<<<<)>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.
```

Similar to regular Brainfuck with the following changes:

* `]` does not jump back to the start of its block
* `(` starts a for-loop setting the loop-counter to the current cell
  If the current cell is negative, the loop-counter will be set to its absolute value and the roles of `+` and `-` will be swapped within the loop.
* `)` decrements the loop counter, jumps back to the matching `)` if the loop-counter is non-zero and the current cell is positive


