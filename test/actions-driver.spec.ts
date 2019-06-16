import run from '@cycle/run';
import xs, {Stream} from 'xstream';
import {Action, ActionOutput, ActionResult, ActionsSource, Event, makeActionsDriver} from '../src';

function syncAction(action: Action): ActionOutput {
  return {
    response: action.payload,
    events: [{type: `event-${action.type}`, payload: action.payload}]
  }
}

async function asyncAction(action: Action): Promise<ActionOutput> {
  return syncAction(action);
}

function failedAction(): ActionOutput {
  throw new Error('an error');
}

describe('actionsDriver', () => {
  let actions: Array<Action>;
  let actions$: Stream<Action>;
  let readResponses: Array<any>;
  let readEvents: Array<Event>;
  let readResults: Array<ActionResult>;
  let readErrors: Array<any>;

  function read({result$$, response$, event$}: any) {
    response$.subscribe({
      next(response: any) {
        readResponses.push(response);
      }
    });
    event$.subscribe({
      next(event: Event) {
        readEvents.push(event);
      }
    });
    result$$.subscribe({
      next(result$: Stream<ActionResult>) {
        result$.subscribe({
          next(result: ActionResult) {
            readResults.push(result)
          },
          error(error) {
            readErrors.push(error);
          }
        })
      }
    });
  }

  beforeEach(() => {
    actions = [
      {type: 'action0', payload: 'payload0.0'},
      {type: 'action0', payload: 'payload0.1', category: 'category0'},
      {type: 'action1', payload: 'payload1.0'}
    ];
    actions$ = xs.fromArray(actions);
    readResponses = [];
    readEvents = [];
    readResults = [];
    readErrors = [];
  });

  it('should trigger action and select results', (done) => {
    const dispose = run((sources: any) => {
      const {result$$, response$, event$} = (sources.ACTIONS as ActionsSource).select();
      read({result$$, response$, event$});

      result$$.subscribe({
        complete() {
          expect(readResponses).toHaveLength(actions.length);
          expect(readEvents).toHaveLength(actions.length);
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
        action0: asyncAction, action1: syncAction
      })
    });
    setTimeout(() => dispose(), 0);
  });

  it('should trigger actions and filter them', (done) => {
    const dispose = run((sources: any) => {
      const {result$$, response$, event$} = (sources.ACTIONS as ActionsSource)
        .filter(action => action.type === 'action0')
        .select();
      read({result$$, response$, event$});

      result$$.subscribe({
        complete() {
          expect(readResponses).toHaveLength(2);
          expect(readEvents).toHaveLength(2);
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
        action0: asyncAction, action1: syncAction
      })
    });
    setTimeout(() => dispose(), 0);
  });

  it('should trigger actions and select them by category', (done) => {
    const dispose = run((sources: any) => {
      const {result$$, response$, event$} = (sources.ACTIONS as ActionsSource).select('category0');
      read({result$$, response$, event$});

      result$$.subscribe({
        complete() {
          expect(readResponses).toHaveLength(1);
          expect(readEvents).toHaveLength(1);
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
        action0: asyncAction, action1: syncAction
      })
    });
    setTimeout(() => dispose(), 0);
  });

  it('should managed failed action', (done) => {
    const dispose = run((sources: any) => {
      const {result$$, response$, event$} = (sources.ACTIONS as ActionsSource)
        .filter(action => action.type === 'action1').select();
      read({result$$, response$, event$});

      result$$.subscribe({
        complete() {
          expect(readErrors).toHaveLength(1);
          expect(readResponses).toHaveLength(0);
          expect(readEvents).toHaveLength(0);
          expect(readResults).toHaveLength(0);
          done();
        }
      });

      return {
        ACTIONS: actions$
      };
    }, {
      ACTIONS: makeActionsDriver({
        action0: asyncAction, action1: failedAction
      })
    });
    setTimeout(() => dispose(), 0);
  });

  it('should managed un-managed actions', (done) => {
    const dispose = run((sources: any) => {
      const {result$$, response$, event$} = (sources.ACTIONS as ActionsSource).select();
      read({result$$, response$, event$});

      result$$.subscribe({
        complete() {
          expect(readErrors).toHaveLength(1);
          expect(readResponses).toHaveLength(0);
          expect(readEvents).toHaveLength(0);
          expect(readResults).toHaveLength(0);
          done();
        }
      });

      return {
        ACTIONS: xs.of<Action>({
          type: 'unknown'
        })
      };
    }, {
      ACTIONS: makeActionsDriver()
    });
    setTimeout(() => dispose(), 0);
  });

});
