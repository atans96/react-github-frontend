import loadableComponent from '@loadable/component';
import React from 'react';
interface Loadable {
  cacheId: string;
  importFn: () => Promise<any>;
  empty: () => React.ReactNode | any;
  redirect?: () => React.ReactNode | any;
  condition?: boolean;
  loading?: () => React.ReactNode | any;
}
//TODO: able to destroy cache if time expired
const _cache: { [k: string]: undefined | { fallback: React.ComponentType | Function } | boolean } = {}; //TODO: doing this not scalable. Move it to Stateful database
const loadableCache = new Map<string, React.ComponentType>(); //TODO: doing this not scalable. Move it to Stateful database
export const loadable = ({
  cacheId,
  importFn,
  redirect,
  condition,
  loading,
  empty,
}: Loadable): React.ComponentType | undefined => {
  if (condition) {
    if (loadableCache.has(cacheId)) {
      return loadableCache.get(cacheId)!;
    } else {
      return loadableComponent(
        async () => {
          _cache[cacheId] = true;
          const component = await importFn();

          loadableCache.set(cacheId, component);
          return component;
        },
        _cache[cacheId]
          ? undefined
          : {
              fallback: loading ? loading() : empty(),
            }
      );
    }
  } else {
    if (redirect) return redirect();
    return empty();
  }
};
