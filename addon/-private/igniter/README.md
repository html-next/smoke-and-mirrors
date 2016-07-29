# Igniter

This is a lightweight queue polyfill that will eventually be swapped for
`Ember.run` once [igniter](https://github.com/runspired/igniter) is core to Ember.

## Usage (@private)

```js
import { run } from 'smoke-and-mirrors/-private/igniter';

run.schedule('measure', foo);

```
