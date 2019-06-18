import xs, {Stream} from 'xstream';
import {adapt} from '@cycle/run/lib/adapt';
import {ActionsSource} from './source';
import {Action, ActionHandlers, ActionResult, ActionResultStream, ActionStream} from './interfaces';

export * from './source';
export * from './interfaces';

/**
 * Make an ActionsDriver
 * @param handlers the action handlers
 * @return the action driver
 */
export function makeActionsDriver(handlers: ActionHandlers = {}) {

  async function executeAction(action: Action): Promise<ActionResult> {
    if (!handlers[action.type]) {
      throw new Error(`Unable to find the action type ${action.type}.`)
    }
    try {
      const result = await Promise.resolve(
        handlers[action.type](action)
      );
      return {
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
    // builds and returns the source
    return new ActionsSource(result$$, name);
  }

}
