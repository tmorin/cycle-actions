import {Action, ActionsSource, ActionStream} from '../src/driver';
import xs from 'xstream';

describe('ActionsSource.isolateSink', () => {
  let actions: Array<Action<any>>;
  let streamOfActions: ActionStream;

  beforeEach(() => {
    actions = [
      {type: 'action0', payload: 'payload0.0'},
      {type: 'action0', payload: 'payload0.1'}
    ];
    streamOfActions = xs.fromArray(actions);
  });

  it('should isolate source', (done) => {
    const isolatedStream = ActionsSource.isolateSink(streamOfActions, 'ns1');
    const readActions: Array<Action<any>> = [];
    isolatedStream.subscribe({
      next(action) {
        readActions.push(action);
      }
    });
    streamOfActions.subscribe({
      complete() {
        expect(readActions).toHaveLength(2);
        expect(readActions[0]).toHaveProperty('namespace', ['ns1']);
        expect(readActions[1]).toHaveProperty('namespace', ['ns1']);
        done();
      }
    })
  });

  it('should not isolate source when no scope', (done) => {
    const isolatedStream = ActionsSource.isolateSink(streamOfActions, null);
    const readActions: Array<Action<any>> = [];
    isolatedStream.subscribe({
      next(action) {
        readActions.push(action);
      }
    });
    streamOfActions.subscribe({
      complete() {
        expect(readActions).toHaveLength(2);
        expect(readActions[0]).not.toHaveProperty('namespace', 'ns1');
        expect(readActions[1]).not.toHaveProperty('namespace', 'ns1');
        done();
      }
    })
  });

});
