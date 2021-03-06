import xs, {Stream} from 'xstream';
import {adapt} from '@cycle/run/lib/adapt';
import {Action, ActionResult, SelectedResults} from './interfaces';

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
export class ActionsSource<I, O> {

  constructor(
    public result$: Stream<ActionResult<I, O>>,
    public readonly name?: string,
    public readonly namespace: Array<string> = []
  ) {
  }

  /**
   * Used by `@cycle/isolate` to isolate the source.
   * @param actionSource the source
   * @param scope the scope
   */
  public isolateSource(
    actionSource: ActionsSource<I, O>,
    scope: string | null
  ) {
    if (scope === null) {
      return actionSource;
    }
    return actionSource.filter((action) =>
      Array.isArray(action.namespace) &&
      arrayEqual(
        action.namespace,
        (actionSource).namespace.concat(scope)
      ), scope
    );
  }

  /**
   * Used by `@cycle/isolate` to isolate the sink.
   * @param action$ the stream of actions
   * @param scope the scope
   */
  public isolateSink(
    action$: Stream<Action<I>>,
    scope: string | null
  ): Stream<Action<any>> {
    if (scope === null) {
      return action$;
    }
    return adapt(
      xs.fromObservable<Action<any>>(action$).map(action => {
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
    predicate: (action: Action<I>) => boolean,
    scope?: string
  ): ActionsSource<I, O> {

    const filteredResponse$$ = this.result$.filter(result => predicate(result.request));
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
  public select(category?: string): SelectedResults<I, O> {
    let result$ = category
      ? this.result$.filter(result => result && result.request.category === category)
      : this.result$;

    result$ = adapt(result$);

    const response$ = result$.filter(result => !!result.response)
      .map(result => result.response);

    const error$ = result$.filter(result => !!result.error)
      .map(result => result.error);

    return {result$, response$, error$};
  }

}
