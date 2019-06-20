import {Stream} from 'xstream';

/**
 * An action handler executes an action.
 */
export interface ActionHandler<I, O> {
  /**
   * The handler.
   * @param action the action
   * @return an optional output which can be embedded within a Promise
   */
  (action: Action<I>): O | Promise<O>
}

/**
 * The map of action handlers.
 * To be handled, the {@link Action.type} of the {@link Action} must match the key of the {@link ActionHandlers} object.
 */
export type ActionHandlers = {
  [k: string]: ActionHandler<any, any>
}

/**
 * An action is a message which will be handled by an {@link ActionHandler}.
 */
export interface Action<I> {
  /**
   * The type of the message.
   */
  type: string
  /**
   * The optional payload.
   */
  payload?: I
  /**
   * The category is used to select action's results via {@link ActionsSource.select}.
   */
  category?: string
  /**
   * The namespace is used internally to manage the isolation.
   * c.f. https://cycle.js.org/components.html#components-isolating-multiple-instances
   */
  namespace?: Array<string>
}

/**
 * An action result is used internally to build the source part.
 */
export interface ActionResult<I, O> {
  /**
   * The request.
   */
  request: Action<I>
  /**
   * The response related to the handled action.
   */
  response?: O
  /**
   * The error raised during the handling of the action.
   */
  error?: Error
}

/**
 * A subset of results.
 */
export interface SelectedResults {
  /**
   * The stream of results.
   */
  result$: Stream<ActionResult<any, any>>
  /**
   * The stream of responses.
   */
  response$: Stream<any>
  /**
   * The stream of errors.
   */
  error$: Stream<Error>
}
