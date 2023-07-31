# Itr

_Itr_ is an Array-based programming Language designed for code golfing.

_Itr_ has built-in support for unbounded Integers, Matrix operations as well as Rational <i>and Complex number</i> (not yet implemented).

## Character Encoding

_Itr_ uses a mixed character encoding:
* The source code uses only the first 256 Unicode code-points with each code-point being stored in a single byte.
* The character after `'` (a char literal) as well as all characters within a UTF8-string `"..."` are encoded using UTF-8, allowing the use of higher code-points (at the cost of a few bytes for encoding intermediate code-points

## General syntax

_Itr_ is a stack-based language.

All operators are post-fix operators unless explicitly stated otherwise.

Example:
```
1 1+  ; computes 1+1
```

## Comments

`;` comments out the rest of the line

## Literals

All Literal simply push the value of their element onto the stack.

* `[0-9]+` (decimal) integer literals
* `"..."`  Utf-8 strings, support the usual string escaping rules
* `'.`     char literal (will push an one-element string)
* `»...«`  code-string literal only allow the first 256 Unicode characters (`»` and `«` can be used for nested code-strings)
* `(...)`  vector literal, the code between `(` and `)` is executed on a separate stack which is the pushed on the main stack as an array
* `(...,...,...)` matrix literal similar to vector-literals with `,`being used to separate the rows of the matrix (!matrices and nested arrays behave differently under arithmetic operations)

Examples:
```
1234            ; pushes 1234 
'A              ; pushes an array with 65 (char code of A) as its only element
'°              ; pushes an array with the elements 194 and 176 (UTF-8 bytes for °)
"Hello, World!" ; pushes the array (72 101 108 108 111 44 32 87 111 114 108 100 33) (char code of the string elements)
»ä*«            ; pushes (228 42) (unicode codepoints of the elements in the string)
(1 2,3 4)       ; pushes [[1,2],[3,4]] as matrix 
((1 2)(3 4))    ; pushes [[1,2],[3,4]] as nested array
```

## IO

* `_` reads a single byte from standard input
* `§` reads a paragraph (everything until the next empty lime) from standard input
* `#` parses a value from standard input
<!-- TODO describe parsing rules-->

* `¥` writes the top stack element as byte (or string if it is a vector) rounding numbers to the nearest integer and taking all values modulo `256` 
* `£` prints the string representation of the top stack element
* `$` pushes the string representation of the top-stack element onto the stack

If no operation writes to standard output, the the top stack element will be implicitly printed.

## Basic Control-flow

* `\x00` return from subroutine/exit the program
* `©`    call the top-stack element as a subroutine (implicitly converts non-array elements to array and decodes UTF-8 strings)
* `?...[` if-block (unimplemented)
* `?...]` while-block (unimplemented)
* `!...[` if-block (unimplemented)
* `!...]` while-block (unimplemented)

## Stack operations

* `ä` "dup" duplicate top stack element `a b -> a b b`
* `á` "over" copy second value on stack above top stack element `a b -> a b a`
* `à` "swap" swap the top two stack elements `a b c -> a c b`
* `â` "under" copy top value on stack below second stack element `a b c -> a c b c`
* `å` "drop"  discard the top stack element `a b c -> a b`

## Arithmetic operations

### point-wise operations
These operations are applied to all elements of a vector/matrix separately
<!-- TODO describe rules for different parameter sizes-->

unary:

* `¬` logical not: replace `0`with `1`and all other numbers with `0`
* `¿` is-nonzero: replace all nonzero numbers with `1` keep `0` unchanged
* `~` negation: replace `x` with `-x`

binary:

* `+` addition
* `-` subtraction
* `·` multiplication
* `÷` fractional division
* `:` integer-division
* `%` remainder
* `&`/`|`/`^` bit-wise and/or/xor
* `<`/`=`/`>` compare all elements returns `1` if condition satisfied and `0` otherwise

### Matrix operations
This operations can act on numbers and matrices. They will be executed point-wise for all elements of an array.

unary:

* `e` (matrix) exponential function 

binary:

* `*` (matrix) multiplication
* `/` left division `A B/` evaluates to `AB⁻¹` (unimplemented)
* `\` right division `A B\` evaluates to `A⁻¹B` (unimplemented)

## Array operations

* `°` concatenation, numbers and matrices are implicitly warped in a single element array
* `S` sum up all elements of the top stack element, matrices are implicitly converted to nested arrays and numbers are converted to their one-based range (see `¹` conversion operator)
* `Ì` replace array with an array containing the indices of its non-zero elements, numbers and matrices are implicitly warped in a single element array
* `Í` replace array with an array that has ones that the positions specified by the argument (rounded to the nearest integer), numbers and matrices are implicitly warped in a single element array

* `µ` map: apply next operation to all elements of the current element converted to a vector
<!-- TODO describe map operation -->

## Type-conversion

* `º` zero-based range: replace number `n` with range `(0 1 ... k)` where `k` is the largest integer less than `n`
* `¹` one-based range: replace number `n` with range `(1 ... k)` where `k` is the largest integer less or equal to `n`
* `®` convert matrix to nested list / nested list to matrix

