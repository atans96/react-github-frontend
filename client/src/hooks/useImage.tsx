import { useState } from 'react';
import imagePromiseFactory from '../util/imagePromiseFactory';
import { Nullable } from '../typing/type';
import { fastFilter } from '../util';

export type useImageProps = {
  srcList: string | string[];
  imgPromise?: (...args: any[]) => Promise<void>;
  useSuspense?: boolean;
};
const removeBlankArrayElements = (a: string[]) => fastFilter((x: any) => x, a);
const stringToArray = (x: useImageProps['srcList']) => (Array.isArray(x) ? x : [x]);
const cache: any = {};
const promiseFind = (arr: string[], promiseFactory: (...args: any[]) => Promise<void>) => {
  let done = false;
  return new Promise((resolve, reject) => {
    const queueNext = (src: Nullable<string>) => {
      return promiseFactory(src).then((data: any) => {
        done = true;
        resolve({
          src: {
            original: data.src.original.length > 0 ? `data:image/webp;base64, ${data.src.original}` : '',
          },
          width: data.width,
          height: data.height,
        });
      });
    };
    arr
      .reduce((p, src) => {
        // ensure we aren't done before enquing the next source
        return p.catch(() => {
          if (!done) return queueNext(src);
        });
      }, queueNext(arr.shift()))
      .catch(reject);
  });
};

export default function useImage({
  srcList,
  imgPromise = imagePromiseFactory({ decode: true }),
  useSuspense = true,
}: useImageProps): {
  src: { original: string } | undefined;
  isLoading: boolean;
  error: any;
  width: number | undefined;
  height: number | undefined;
} {
  const [, setIsLoading] = useState(true);
  const sourceList = removeBlankArrayElements(stringToArray(srcList));
  const sourceKey = sourceList.join('');
  // persist cache for each render
  if (!cache[sourceKey]) {
    // create promise to loop through sources and try to load one
    cache[sourceKey] = {
      promise: promiseFind(sourceList, imgPromise),
      cache: 'pending',
      error: null,
    };
  }

  // when promise resolves/reject, update cache & state
  cache[sourceKey].promise
    // if a source was found, update cache
    // when not using suspense, update state to force a rerender
    .then((data: any) => {
      cache[sourceKey] = { ...cache[sourceKey], cache: 'resolved', data };
      if (!useSuspense) setIsLoading(false);
    })

    // if no source was found, or if another error occured, update cache
    // when not using suspense, update state to force a rerender
    .catch((error: any) => {
      cache[sourceKey] = { ...cache[sourceKey], cache: 'rejected', error };
      if (!useSuspense) setIsLoading(false);
    });

  if (cache[sourceKey].cache === 'resolved') {
    // const imageData = getImageData(cache[sourceKey].data.image);
    // console.log(encode(imageData.data, imageData.width, imageData.height, 4, 4));
    return {
      src: cache[sourceKey].data.src,
      isLoading: false,
      error: null,
      width: cache[sourceKey].data.width,
      height: cache[sourceKey].data.height,
    };
  }

  if (cache[sourceKey].cache === 'rejected') {
    if (useSuspense) throw cache[sourceKey].error;
    return {
      isLoading: false,
      error: cache[sourceKey].error,
      src: undefined,
      width: undefined,
      height: undefined,
    };
  }

  // cache[sourceKey].cache === 'pending')
  if (useSuspense) throw cache[sourceKey].promise;
  return {
    isLoading: true,
    src: undefined,
    error: null,
    width: undefined,
    height: undefined,
  };
}
