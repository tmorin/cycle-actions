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
  (action: Action): ActionOutput | void | Promise<ActionOutput | void>
}

/**
 * The map of action handlers.
 * To be handled, the {@link Message.type} of the {@link Action} must match the key of the {@link ActionHandlers} object.
 */
export type ActionHandlers = {
  [k: string]: ActionHandler
}

/**
 * A message is defined by a type and an optional payload.
 */
export interface Message {
  /**
   * The type of the message.
   */
  type: string
  /**
   * The optional payload.
   */
  payload?: any
}

/**
 * An action is a message which will be handled by an {@link ActionHandler}.
 */
export interface Action extends Message {
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
 * An event is a message which can be published by a {@link ActionOutput.events}.
 */
export interface Event extends Message {
}

/**
 * An action output is the result of an {@link ActionHandler}.
 */
export interface ActionOutput {
  /**
   * The response should be used to provide direct feedback to the caller.
   */
  response: any
  /**
   * The events should be used to notified underlying side effects.
   */
  events: Array<Event>
}

/**
 * An action result is used internally to build the source part.
 */
export interface ActionResult {
  /**
   * Reflect {@link ActionOutput.response}, but with a default value if undefined
   */
  response?: any
  /**
   * Reflect {@link ActionOutput.events}, but with a default value if undefined
   */
  events: Array<Event>
}

/**
 * A stream of actions.
 */
export type ActionStream = Stream<Action>

/**
 * A stream of action result.
 */
export interface ActionResultStream extends Stream<ActionResult> {
  request: Action
}

/**
 * A subset of results.
 */
export interface SelectedResults {
  /**
   * The filtered stream of result streams.
   */
  result$$: Stream<ActionResultStream>
  /**
   * The filtered flatten stream of responses.
   */
  response$: Stream<any>
  /**
   * The filtered flatten stream of events.
   */
  event$: Stream<Event>
}
