import {ActionsSource} from './source';
import {Action, ActionHandlers, ActionResult} from './interfaces';
import xs, {Stream} from 'xstream';

export * from './source';
export * from './interfaces';

/**
 * Make an ActionsDriver
 * @param handlers the action handlers
 * @return the action driver
 */
export function makeActionsDriver<I, O>(handlers: ActionHandlers<I, O> = {}) {

  function executeAction(request: Action<I>): Promise<ActionResult<I, O>> {
    try {
      // when the handler is not found the
      if (!handlers[request.type]) {
        return Promise.resolve({
          request,
          error: new Error(`Unable to find the action type ${request.type}.`)
        });
      }

      const response = handlers[request.type](request);
      return Promise.resolve(response).then(response => ({
        request,
        response
      }));

    } catch (error) {
      return Promise.resolve({
        request,
        error
      });
    }
  }

  return function (actions$: Stream<Action<I>>, name?: string) {
    // creates a stream of result stream
    const result$ = xs.create<ActionResult<I, O>>({
      start(listener) {
        actions$.subscribe({
          next(action) {
            executeAction(action).then(result => listener.next(result));
          },
          complete() {
            listener.complete();
          }
        });
      },
      stop() {
      }
    });

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
