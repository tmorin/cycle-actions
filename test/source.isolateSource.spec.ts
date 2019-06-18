import {Action, ActionResult, ActionResultStream, ActionsSource} from '../src/driver';
import xs from 'xstream';

interface Transaction {
  request: Action,
  result: ActionResult
}

describe('ActionsSource.isolateSource', () => {
  let actions: Array<Action>;
  let transactions: Array<Transaction>;
  let streamOfActionResults: ActionResultStream;

  beforeEach(() => {
    actions = [
      {type: 'action0', payload: 'payload0.0'},
      {type: 'action0', payload: 'payload0.1', namespace: ['ns1']}
    ];
    transactions = actions.map((action, index) => ({
      request: action,
      result: {
        request: action,
        response: `response-${actions[0].type}-${index}`,
        events: [{type: `event-${actions[0].type}`, payload: actions[0].payload}]
      }
    }));
    streamOfActionResults = xs.fromArray(transactions.map(
      ({result}) => result
    ));
  });

  it('should isolate source', (done) => {
    const main = new ActionsSource(streamOfActionResults);

    const readActionResults: Array<ActionResult> = [];

    ActionsSource.isolateSource(main, 'ns1').select().result$.subscribe({
      next(result: ActionResult) {
        readActionResults.push(result);
      }
    });

    streamOfActionResults.subscribe({
      complete() {
        expect(readActionResults).toHaveLength(1);
        done();
      }
    })
  });

  it('should not isolate source when no scope', (done) => {
    const main = new ActionsSource(streamOfActionResults);

    const readActionResults: Array<ActionResult> = [];

    ActionsSource.isolateSource(main, null).select().result$.subscribe({
      next(result: ActionResult) {
        readActionResults.push(result);
      }
    });

    streamOfActionResults.subscribe({
      complete() {
        expect(readActionResults).toHaveLength(2);
        done();
      }
    })
  });

});
