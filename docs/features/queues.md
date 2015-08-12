# Queues

### Generate a new queue

`ember g queue <name>`

This will scaffold a new queue at `app/services/queues/<name>.js`.
Which you can use in your app via `inject.service('queues/<name>')`

### Queue Operations

- `queue#push(item)` pushes a new item to the end of the queue, returns a guid
- `queue#unshift(item)` pushes a new item to the front of the queue, returns a guid
- `queue#dismiss(guid)` removes the item matching the guid from the queue. If
the item has already begun being processed, it removes it from the processing
queue and gives it to `queue#removeItemFromProcessing(item)` to give you a chance
to perform cleanup on the task.

### Queue Hooks

 - `concurrentProcesses` (default, 3), Specifies how many queue items can be
 actively processed at a time.

 - `itemForQueue(item)` Called by `queue.push` to give you a chance to modify
 the queue item before placing it in the queue. The item you return will be 
 assigned a `guid` if it did not already have one. `queue.push` returns that guid.

 - `handleFailure(item, error)` Called during queue processing if the promise returned
 by Queue.process rejects.  This gives you the chance to handle queue failures yourself.
 Return the item or a modified item to push it back onto the queue.

 - `process(item)` Called during queue processing.  This is the one hook you absolutely
 must implement in your queue service.  This method should perform whatever task your
 queue is meant to handle, and return a promise that resolves when the task completes
 successfully.
  
 - `removeItemFromProcessing(activeQueueItem)` Called when `queue.dismiss(guid)` is invoked.
 This hook let's you customize how to dismiss and teardown an item from the queue that's
 already been sent to `process`.  The item will have already been removed from the active
 queue, but may need additional teardown.
