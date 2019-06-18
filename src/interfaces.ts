import {Stream} from 'xstream';

/**
 * An action handler executes an action.
 */
export interface ActionHandler {
  /**
   * The handler.
   * @param action the action
   * @return an optional output which can be embedded within a Promise
   */
  (action: Action): any | void | Promise<any | void>
}

/**
 * The map of action handlers.
 * To be handled, the {@link Action.type} of the {@link Action} must match the key of the {@link ActionHandlers} object.
 */
export type ActionHandlers = {
  [k: string]: ActionHandler
}

/**
 * An action is a message which will be handled by an {@link ActionHandler}.
 */
export interface Action {
  /**
   * The type of the message.
   */
  type: string
  /**
   * The optional payload.
   */
  payload?: any
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
export interface ActionResult {
  /**
   * The request.
   */
  request: Action
  /**
   * The response related to the handled action.
   */
  response?: any
  /**
   * The error raised during the handling of the action.
   */
  error?: any
}

/**
 * A stream of actions.
 */
export type ActionStream = Stream<Action>

/**
 * A stream of action result.
 */
export interface ActionResultStream extends Stream<ActionResult> {
}

/**
 * A subset of results.
 */
export interface SelectedResults {
  /**
   * The stream of results.
   */
  result$: ActionResultStream
  /**
   * The stream of responses.
   */
  response$: Stream<any>
  /**
   * The stream of errors.
   */
  error$: Stream<any>
}
