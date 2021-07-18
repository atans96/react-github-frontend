import { IStateRateLimit } from '../../typing/interface';
import { createStore } from '../../util/hooksy';
import { RateLimit } from '../../typing/type';

export type ActionRateLimit = 'RATE_LIMIT' | 'RATE_LIMIT_ADDED' | 'RATE_LIMIT_GQL';

export const initialStateRateLimit: IStateRateLimit = {
  rateLimit: {},
  rateLimitGQL: {},
  rateLimitAnimationAdded: false,
};
const [getRateLimit, setRateLimit] = createStore<RateLimit | Partial<RateLimit>>(initialStateRateLimit.rateLimit);
const [getRateLimitAnimationAdded, setRateLimitAnimationAdded] = createStore<Partial<boolean>>(
  initialStateRateLimit.rateLimitAnimationAdded
);
const [getRateLimitGQL, setRateLimitGQL] = createStore<RateLimit | Partial<RateLimit>>(
  initialStateRateLimit.rateLimitGQL
);
export const RateLimitStore = {
  store() {
    return {
      RateLimit: () => {
        const [rateLimit] = getRateLimit({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { rateLimit } as { rateLimit: Partial<RateLimit> };
      },
      RateLimitAnimationAdded: () => {
        const [rateLimitAnimationAdded] = getRateLimitAnimationAdded({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { rateLimitAnimationAdded } as { rateLimitAnimationAdded: boolean };
      },
      RateLimitGQL: () => {
        const [rateLimitGQL] = getRateLimitGQL({
          shouldUpdate(oldData, newData) {
            return oldData !== newData;
          },
        });
        return { rateLimitGQL } as { rateLimitGQL: Partial<RateLimit> };
      },
    };
  },
  dispatch({ type, payload }: { type: ActionRateLimit; payload?: any }) {
    switch (type) {
      case 'RATE_LIMIT': {
        const data = {
          rateLimit: {
            limit: payload.limit,
            used: payload.used,
            reset: payload.reset,
          },
        } as unknown as RateLimit;
        setRateLimit(data);
        break;
      }
      case 'RATE_LIMIT_ADDED': {
        setRateLimitAnimationAdded(payload.rateLimitAnimationAdded);
        break;
      }
      case 'RATE_LIMIT_GQL': {
        const data = {
          rateLimit: {
            limit: payload.limit,
            used: payload.used,
            reset: payload.reset,
          },
        } as unknown as RateLimit;
        setRateLimitGQL(data);
        break;
      }
    }
  },
};
