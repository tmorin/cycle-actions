import {Stream} from 'xstream';

export interface ActionHandler {
  (action: Action): ActionOutput | void | Promise<ActionOutput | void>
}

export type Actions = {
  [k: string]: ActionHandler
}

export interface Message {
  type: string
  payload?: any
}

export interface Action extends Message {
  category?: string
  namespace?: Array<string>
}

export interface Event extends Message {
}

export interface ActionOutput {
  response: any
  events: Array<Event>
}

export interface ActionResult {
  request: Action
  response: any
  events: Array<Event>
}

export type ActionStream = Stream<Message>

export interface ActionResultStream extends Stream<ActionResult> {
  request: Action
}
