# @tmorin/cycle-actions

> A Cycle.js driver to manage actions.

An action is an object defined by:

- a `type`
- an optional `payload`
- an optional `category`

The action is handled by an action handler.
It's a function taking the action as argument and providing an optional output.
The output is an object defined by:

- an optional `response`
- an optional list of `event`

The response should be used to provide direct feedback to the caller.
The events should be used to notified underlying side effects.

```typescript
import xs from 'xstream';
import run from '@cycle/run';
import {makeActionsDriver} from '@tmorin/cycle-actions';

function main(sources) {
  sources.ACTIONS.select('hello').response$.subscribe({
      next(response) {
        // display 'Hello Toto!' in the console
        console.log(response);
      }
    });
  return  {
    ACTIONS: xs.of({
      type: 'anAsyncAction',
      payload: 'Toto',
      category: 'hello'
    })
  }
}

const drivers = {
  ACTIONS: makeActionsDriver({
    async anAsyncAction(action) {
      return {
        response: `Hello ${action.payload}!`
      }
    }
  })
};

run(main, drivers);
```
