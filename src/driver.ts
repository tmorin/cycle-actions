import {ActionsSource} from './source';
import {Action, ActionHandlers, ActionResult, ActionStream} from './interfaces';
import xs from 'xstream';

export * from './source';
export * from './interfaces';

/**
 * Make an ActionsDriver
 * @param handlers the action handlers
 * @return the action driver
 */
export function makeActionsDriver(handlers: ActionHandlers = {}) {

  async function executeAction(request: Action<any>): Promise<ActionResult<any, any>> {
    try {
      // when the handler is not found the
      if (!handlers[request.type]) {
        return {
          request,
          error: new Error(`Unable to find the action type ${request.type}.`)
        };
      }

      const response = await Promise.resolve(
        handlers[request.type](request)
      );

      return {
        request,
        response
      };

    } catch (error) {
      return {
        request,
        error
      };
    }
  }

  return function (actions$: ActionStream, name?: string) {
    // creates a stream of result stream
    const result$ = actions$.map(
      action => xs.fromPromise(
        executeAction(action)
      )
    ).flatten();

    // adds listener to enforce the execution of action
    result$.addListener({
      next() {
      },
      complete() {
      }
    });

    // builds and returns the source
    return new ActionsSource(result$, name);
  }

}
