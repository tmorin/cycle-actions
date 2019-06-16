import xs, {Stream} from 'xstream';
import {adapt} from '@cycle/run/lib/adapt';
import {arrayEqual} from './utils';
import {Action, ActionResultStream, ActionStream} from './actions';

export class ActionsSource {

  constructor(
    public result$$: Stream<ActionResultStream>,
    public readonly name?: string,
    public readonly namespace: Array<string> = []
  ) {
  }

  public static isolateSource(
    actionSource: ActionsSource,
    scope: string | null
  ) {
    if (scope === null) {
      return actionSource;
    }
    return actionSource.filter(
      (action) =>
        Array.isArray(action.namespace) &&
        arrayEqual(
          action.namespace,
          (actionSource).namespace.concat(scope)
        ),
      scope
    );
  }

  public static isolateSink(
    action$: ActionStream,
    scope: string | null
  ): ActionStream {
    if (scope === null) {
      return action$;
    }
    return adapt(
      xs.fromObservable<Action>(action$).map(action => {
        action.namespace = action.namespace || [];
        action.namespace.unshift(scope);
        return action;
      })
    );
  }

  public filter(
    predicate: (action: Action) => boolean,
    scope?: string
  ): ActionsSource {

    const filteredResponse$$ = this.result$$.filter(result$ => predicate(result$.request));
    return new ActionsSource(
      filteredResponse$$,
      this.name,
      scope === undefined ? this.namespace : this.namespace.concat(scope)
    );
  }

  public select(category?: string) {
    let result$$ = category
      ? this.result$$.filter(result$ => result$ && result$.request.category === category)
      : this.result$$;
    result$$ = adapt(result$$);

    const response$ = result$$.map(result$ => {
      return result$.filter(result => result.response).map(result => result.response)
    }).flatten();

    const event$ = result$$.map(result$ => {
      return result$.filter(result => result.response).map(result => xs.fromArray(result.events)).flatten()
    }).flatten();

    return {result$$, response$, event$};
  }

}
