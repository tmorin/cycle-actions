import {ActionsSource} from '../src/source';
import xs, {Stream} from 'xstream';
import {Action} from '../src/interfaces';
import isolate from '@cycle/isolate';
import run from '@cycle/run';
import {makeActionsDriver} from '../src/driver';

function action1(action: Action<string>): string {
  return action.payload;
}

function action2(action: Action<string>): string {
  return action.payload;
}

interface MainSources {
  ACTIONS: ActionsSource
}

interface MainSkins {
  ACTIONS: Stream<Action<any>>
}

describe('isolation', () => {
  it('should isolate', (done) => {
    const readResultChild1: any = {action1: [], action2: []};
    const readResultChild2: any = {action1: [], action2: []};
    const readResultMain: any = {action1: [], action2: []};

    const dispose = run((sources: MainSources): MainSkins => {

      function Child1(sources: MainSources): MainSkins {
        sources.ACTIONS.select('category1').result$.subscribe({
          next(result) {
            readResultChild1[result.request.type].push(result);
          }
        });
        return {
          ACTIONS: xs.of(
            {type: 'action1', payload: 'action1', category: 'category1'},
            {type: 'action1', payload: 'action1 bis'}
          )
        };
      }

      function Child2(sources: MainSources): MainSkins {
        sources.ACTIONS.result$.subscribe({
          next(result) {
            readResultChild2[result.request.type].push(result);
          }
        });
        return {
          ACTIONS: xs.of({type: 'action2', payload: 'action2'})
        };
      }

      sources.ACTIONS.result$.subscribe({
        next(result) {
          readResultMain[result.request.type].push(result);
        },
        complete() {
          expect(readResultChild1.action1).toHaveLength(1);
          expect(readResultChild1.action2).toHaveLength(0);

          expect(readResultChild2.action1).toHaveLength(0);
          expect(readResultChild2.action2).toHaveLength(1);

          expect(readResultMain.action1).toHaveLength(2);
          expect(readResultMain.action2).toHaveLength(1);
          done();
        }
      });

      const child1 = isolate(Child1, 'child1')(sources);
      const child2 = isolate(Child2)(sources);

      return {
        ACTIONS: xs.merge(child1.ACTIONS, child2.ACTIONS)
      };
    }, {
      ACTIONS: makeActionsDriver({action1, action2})
    });
    setTimeout(() => dispose(), 10);
  });
});
