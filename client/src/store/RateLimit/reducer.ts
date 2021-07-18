import { IAction, IStateRateLimit } from '../../typing/interface';

export type ActionRateLimit = 'RATE_LIMIT' | 'RATE_LIMIT_ADDED' | 'RATE_LIMIT_GQL';

export const initialStateRateLimit: IStateRateLimit = {
  rateLimit: {},
  rateLimitGQL: {},
  rateLimitAnimationAdded: false,
};
export const reducerRateLimit = (state = initialStateRateLimit, action: IAction<ActionRateLimit>): IStateRateLimit => {
  switch (action.type) {
    case 'RATE_LIMIT': {
      return {
        ...state,
        rateLimit: {
          limit: action.payload.limit,
          used: action.payload.used,
          reset: action.payload.reset,
        },
      };
    }
    case 'RATE_LIMIT_ADDED': {
      return {
        ...state,
        rateLimitAnimationAdded: action.payload.rateLimitAnimationAdded,
      };
    }
    case 'RATE_LIMIT_GQL': {
      return {
        ...state,
        rateLimitGQL: {
          limit: action.payload.limit,
          used: action.payload.used,
          reset: action.payload.reset,
        },
      };
    }
    default:
      return state;
  }
};
