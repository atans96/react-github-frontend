import { ApolloLink, RequestHandler } from '../core';
import { HttpOptions } from './selectHttpOptionsAndBody';
import { createHttpLink } from './createHttpLink';

export class HttpLink extends ApolloLink {
  public requester: RequestHandler | undefined;
  constructor(public options: HttpOptions = {}) {
    super(createHttpLink(options).request);
  }
}
