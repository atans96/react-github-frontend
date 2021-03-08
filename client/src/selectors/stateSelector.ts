import { createSelector } from 'reselect';
import { MergedDataProps, SeenProps } from '../typing/type';
import { IState } from '../typing/interface';
import { ApolloFactory } from '../hooks/useApolloFactory';
import { initialStateContainer, initialStateStargazersContainer } from '../store/reducer';

export const filterMergedDataSelector = (alreadySeenCards: number[], languagePreference: any) =>
  createSelector<MergedDataProps[], MergedDataProps[], MergedDataProps[]>(
    [
      (dataOne: MergedDataProps[]) =>
        dataOne.filter(
          (obj) =>
            !!obj.language &&
            !alreadySeenCards.includes(obj.id) &&
            languagePreference.find((xx: any) => xx.language === obj.language && xx.checked)
        ),
    ],
    (state: MergedDataProps[]) => {
      return state.filter((e) => !!e);
    }
  );
export const alreadySeenCardSelector = createSelector<IState, MergedDataProps[], Record<number, any>>(
  [(state: IState) => state.mergedData],
  (state: MergedDataProps[]) => {
    return state.reduce((acc: any[], object: MergedDataProps) => {
      acc.push(
        Object.assign(
          {},
          {
            id: object.id,
            value: {
              full_name: object.full_name,
              branch: object.default_branch,
            },
          }
        )
      );
      return acc;
    }, [] as any[]);
  }
);
export const dataRepoImagesSelector = createSelector<IState, MergedDataProps[], Record<number, any>>(
  [(state: IState) => state.mergedData],
  (state: MergedDataProps[]) => {
    return state.reduce((acc: any[], object: MergedDataProps) => {
      acc.push(
        Object.assign(
          {},
          {
            id: object.id,
            value: {
              full_name: object.full_name,
              branch: object.default_branch,
            },
          }
        )
      );
      return acc;
    }, [] as any[]);
  }
);
export const dataRepoUnrenderImages = createSelector<IState, SeenProps[], Record<number, string>>(
  [(state: IState) => state.undisplayMergedData],
  (state: SeenProps[]) => {
    return state.reduce((acc: any[], object: SeenProps) => {
      acc.push(
        Object.assign(
          {},
          {
            id: object.id,
            value: [...object.imagesData],
          }
        )
      );
      return acc;
    }, [] as any[]);
  }
);
export const mergedDataSelector = createSelector<IState, MergedDataProps[], MergedDataProps[]>(
  [(state) => state.filteredMergedData, (state) => state.mergedData],
  (filteredMergedData, mergedData) => {
    if (filteredMergedData.length > 0) {
      return filteredMergedData;
    }
    return mergedData; // return this if filteredTopics.length === 0
  }
);
export const dispatchImagesReplaceSelector = (callback: any) =>
  createSelector<IState, any, MergedDataProps[]>(
    [(state) => state.undisplayMergedData, (state) => state.mergedData, (state) => state.imagesData],
    (undisplayMergedData: SeenProps[], mergedData: MergedDataProps[], imagesData: any) => {
      const ids = undisplayMergedData.reduce((acc, obj) => {
        acc.push(obj.id);
        return acc;
      }, [] as number[]);
      const temp = mergedData.filter((obj) => !ids.includes(obj.id));
      const images = imagesData.filter((obj: any) => !ids.includes(obj.id));

      return callback(images, temp);
    }
  );
export const mutationSeenAddedSelector = (callback: any, dispatch: any, condition: boolean) =>
  createSelector<IState, any, () => void>(
    [(state) => state.mergedData, (state) => state.imagesData, (state) => state.isLoggedIn],
    (mergedData: MergedDataProps[], imagesData: any[], isLoggedIn: boolean) => {
      if (condition) {
        dispatch();
        const result = mergedData.reduce((acc: any[], obj: MergedDataProps) => {
          const temp = Object.assign(
            {},
            {
              stargazers_count: obj.stargazers_count,
              full_name: obj.full_name,
              default_branch: obj.default_branch,
              owner: {
                login: obj.owner.login,
                avatar_url: obj.owner.avatar_url,
                html_url: obj.owner.html_url,
              },
              description: obj.description,
              language: obj.language,
              topics: obj.topics,
              html_url: obj.html_url,
              id: obj.id,
              imagesData: imagesData.filter((xx) => xx.id === obj.id).map((obj) => [...obj.value])[0] || [],
              name: obj.name,
              is_queried: false,
            }
          );
          acc.push(temp);
          return acc;
        }, [] as any[]);
        if (result.length > 0 && imagesData.length > 0 && isLoggedIn) {
          return callback(result);
        }
      }
    }
  );

export function useApolloFactorySelector(selector: any) {
  const state = ApolloFactory.useContainer();
  return selector(state);
}

export function useStateSelector(selector: any) {
  const state = initialStateContainer.useContainer();
  return selector(state);
}

export function useStateStargazersSelector(selector: any) {
  const state = initialStateStargazersContainer.useContainer();
  return selector(state);
}

export function useDispatchStateSelector(selector: any) {
  const state = initialStateContainer.useContainer();
  return selector(state);
}

export function useDispatchStateStargazersSelector(selector: any) {
  const state = initialStateContainer.useContainer();
  return selector(state);
}
