# Performance Minded Arrays

## Proxy Based Arrays

### ProxiedArray


The Magic Array is an advanced proxy that lets you swap out underlying array instances
while still maintaining a stable array.


## Example without diffing

| input     |  output            | array change |  new output       |
|-----------|--------------------|--------------|-------------------|
| [A, B, C] | [1(a), 2(b), 3(c)] | [B, A, C]    | [1(b), 2(a), 3(c)]|
| [A, B, C] | [1(a), 2(b), 3(c)] | [D, E, C]    | [1(d), 2(e), 3(c)]|

## Example with diffing


### DiffedArray

Maintains stable references to objects based on keys.

| input     |  output            | array change |  new output       |
|-----------|--------------------|--------------|-------------------|
| [A, B, C] | [1(a), 2(b), 3(c)] | [B, A, C]    | [2(b), 1(a), 3(c)]|
| [A, B, C] | [1(a), 2(b), 3(c)] | [D, E, C]    | [4(d), 5(e), 3(c)]|

## Stable Arrays

### Staged Array

### computed.sorted

### computed.filtered




