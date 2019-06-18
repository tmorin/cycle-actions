import xs, {Stream} from 'xstream';
import {adapt} from '@cycle/run/lib/adapt';
import {Action, ActionResultStream, ActionStream, SelectedResults} from './interfaces';

/**
 * Check both array are equal.
 * @param a1 the first array
 * @param a2 the second array
 * @returns true when equal otherwise false
 * @private
 */
export function arrayEqual(a1: Array<string>, a2: Array<string>): boolean {
  for (let i = 0; i < a2.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }
  return true;
}

/**
 * The source of provided by the driver.
 */
export class ActionsSource {

  constructor(
    public result$$: Stream<ActionResultStream>,
    public readonly name?: string,
    public readonly namespace: Array<string> = []
  ) {
  }

  /**
   * Used by `@cycle/isolate` to isolate the source.
   * @param actionSource the source
   * @param scope the scope
   */
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

  /**
   * Used by `@cycle/isolate` to isolate the sink.
   * @param action$ the stream of actions
   * @param scope the scope
   */
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

  /**
   * Filter results according to a predicate on the {@link Action}.
   * @param predicate the predicate
   * @param scope the scope
   * @return a new {@link ActionsSource}
   */
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

  /**
   * Extract from the streams of result streams flatten streams.
   * @param category an optional category ({@link Action.category})
   * @returns the selected results
   */
  public select(category?: string): SelectedResults {
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
