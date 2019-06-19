# @tmorin/cycle-actions

> A Cycle.js driver to manage actions.

An action is an object defined by:

- a `type`
- an optional `payload`
- an optional `category`

The action is handled by an action handler.
It's a function taking the action as argument and providing an optional response.

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
      // action is
      return `Hello ${action.payload}!`
    }
  })
};

run(main, drivers);
```
