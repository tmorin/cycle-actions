import run from '@cycle/run';
import xs, {Stream} from 'xstream';
import {Action, ActionResult, ActionsSource, makeActionsDriver, SelectedResults} from '../src/driver';

function syncAction(action: Action<string>): string {
  return action.payload || '';
}

async function asyncAction(action: Action<string>): Promise<string> {
  return syncAction(action);
}

function failedAction(): any {
  throw new Error('an error');
}

describe('driver', () => {
  let actions: Array<Action<string>>;
  let actions$: Stream<Action<string>>;
  let readResponses: Array<string>;
  let readErrors: Array<any>;
  let readResults: Array<ActionResult<string, string>>;

  function read({result$, response$, error$}: SelectedResults) {
    response$.subscribe({
      next(response: string) {
        readResponses.push(response);
      }
    });
    error$.subscribe({
      next(error: any) {
        readErrors.push(error);
      }
    });
    result$.subscribe({
      next(result: ActionResult<string, string>) {
        readResults.push(result);
      }
    })
  }

  beforeEach(() => {
    actions = [
      {type: 'action0', payload: 'payload0.0'},
      {type: 'action0', payload: 'payload0.1', category: 'category0'},
      {type: 'action1', payload: 'payload1.0'}
    ];
    actions$ = xs.fromArray(actions);
    readResponses = [];
    readResults = [];
    readErrors = [];
  });

  it('should trigger action and select results', (done) => {
    const dispose = run((sources: any) => {
      const {result$, response$, error$} = (sources.ACTIONS as ActionsSource).select();
      read({result$, response$, error$});

      result$.subscribe({
        complete() {
          expect(readResponses).toHaveLength(actions.length);
          expect(readResults).toHaveLength(actions.length);
          expect(readErrors).toHaveLength(0);
          done();
        }
      });

      return {
        ACTIONS: actions$
      };
    }, {
      ACTIONS: makeActionsDriver({
        action0: asyncAction,
        action1: syncAction
      })
    });
    setTimeout(() => dispose(), 10);
  });

  it('should trigger actions and filter them', (done) => {
    const dispose = run((sources: any) => {
      const {result$, response$, error$} = (sources.ACTIONS as ActionsSource)
        .filter(action => action.type === 'action0')
        .select();
      read({result$, response$, error$});

      result$.subscribe({
        complete() {
          expect(readResponses).toHaveLength(2);
          expect(readResults).toHaveLength(2);
          expect(readErrors).toHaveLength(0);
          done();
        }
      });

      return {
        ACTIONS: actions$
      };
    }, {
      ACTIONS: makeActionsDriver({
        action0: asyncAction,
        action1: syncAction
      })
    });
    setTimeout(() => dispose(), 10);
  });

  it('should trigger actions and select them by category', (done) => {
    const dispose = run((sources: any) => {
      const {result$, response$, error$} = (sources.ACTIONS as ActionsSource).select('category0');
      read({result$, response$, error$});

      result$.subscribe({
        complete() {
          expect(readResponses).toHaveLength(1);
          expect(readResults).toHaveLength(1);
          expect(readErrors).toHaveLength(0);
          done();
        }
      });

      return {
        ACTIONS: actions$
      };
    }, {
      ACTIONS: makeActionsDriver({
        action0: asyncAction,
        action1: syncAction
      })
    });
    setTimeout(() => dispose(), 10);
  });

  it('should managed failed action', (done) => {
    const dispose = run((sources: any) => {
      const {result$, response$, error$} = (sources.ACTIONS as ActionsSource)
        .filter(action => action.type === 'action1').select();
      read({result$, response$, error$});

      result$.subscribe({
        complete() {
          expect(readErrors).toHaveLength(1);
          expect(readResponses).toHaveLength(0);
          expect(readResults).toHaveLength(1);
          done();
        }
      });

      return {
        ACTIONS: actions$
      };
    }, {
      ACTIONS: makeActionsDriver({
        action0: asyncAction,
        action1: failedAction
      })
    });
    setTimeout(() => dispose(), 10);
  });

  it('should managed un-managed actions', (done) => {
    const dispose = run((sources: any) => {
      const {result$, response$, error$} = (sources.ACTIONS as ActionsSource).select();
      read({result$, response$, error$});

      result$.subscribe({
        complete() {
          expect(readErrors).toHaveLength(1);
          expect(readResponses).toHaveLength(0);
          expect(readResults).toHaveLength(1);
          done();
        }
      });

      return {
        ACTIONS: xs.of<Action<any>>({
          type: 'unknown'
        })
      };
    }, {
      ACTIONS: makeActionsDriver()
    });
    setTimeout(() => dispose(), 10);
  });

});
