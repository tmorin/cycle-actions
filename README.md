# @tmorin/cycle-actions

[![npm version](https://badge.fury.io/js/%40tmorin%2Fcycle-actions.svg)](https://badge.fury.io/js/%40tmorin%2Fcycle-actions)
[![Integration](https://github.com/tmorin/cycle-actions/workflows/Integration/badge.svg?branch=master)](https://github.com/tmorin/cycle-actions/actions?query=workflow%3AIntegration+branch%3Amaster)
[![api](https://img.shields.io/badge/-api-informational.svg)](https://tmorin.github.io/cycle-actions/)

> A Cycle.js driver to manage actions.

An action is an object defined by:

- a `type`
- an optional `payload`
- an optional `category`

The action is handled by an action handler.
It's a function taking the action as argument and providing an optional response.

```typescript
import xs, {Stream} from 'xstream';
import run from '@cycle/run';
import {makeActionsDriver, ActionsSource, Action} from '@tmorin/cycle-actions';

interface MainSources {
  ACTIONS: ActionsSource
}

interface MainSinks {
  ACTIONS: Stream<Action>
}

function main(sources: MainSources) : MainSinks {
  sources.ACTIONS.select('hello').result$.subscribe({
      next(result) {
        // display 'Hello Toto!' in the console
        console.log(result.response);
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
    async anAsyncAction(action: Action<string>) {
      // action is
      return `Hello ${action.payload}!`
    }
  })
};

run(main, drivers);
```
