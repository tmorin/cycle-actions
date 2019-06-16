import xs, {Stream} from 'xstream';
import {adapt} from '@cycle/run/lib/adapt';
import {ActionsSource} from './ActionsSource';
import {Action, ActionResult, ActionResultStream, Actions, ActionStream} from './actions';

export * from './ActionsSource';
export * from './actions';

export function makeActionsDriver(actions: Actions = {}) {

  async function executeAction(action: Action): Promise<ActionResult> {
    if (!actions[action.type]) {
      throw new Error(`Unable to find the action type ${action.type}.`)
    }
    try {
      const result = await Promise.resolve(
        actions[action.type](action)
      );
      return {
        request: action,
        response: undefined,
        events: [],
        ...result
      };
    } catch (e) {
      throw e;
    }
  }

  function createResult$(action: Action): ActionResultStream {
    // creates a stream of result
    let result$: Stream<ActionResult> = xs.create<ActionResult>({
      start(listener) {
        executeAction(action).then(
          (result) => {
            listener.next(result);
            listener.complete();
          },
          (error) => {
            listener.error(error);
          }
        );
      },
      stop() {
      }
    }).remember();
    // adapts the result stream to ba an xstream one
    result$ = adapt(result$);
    // adds a listener to force the execution of the action
    result$.addListener({
      next: () => {
      },
      error: () => {
      },
      complete: () => {
      },
    });
    // happened the request
    return Object.assign(result$, {request: action});
  }

  return function (actions$: ActionStream, name?: string) {
    // creates a stream of result stream
    const result$$ = actions$.map(createResult$);
    // builds the source
    const actionsSource = new ActionsSource(result$$, name);
    // builds and returns the source
    return actionsSource;
  }

}
