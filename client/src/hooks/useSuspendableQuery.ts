import { useQuery } from '@apollo/client';

const suspend = (promise: PromiseLike<any>) => {
  let status = 'pending';
  let response: any;

  const suspender = promise.then(
    (res) => {
      status = 'success';
      response = res;
    },
    (err) => {
      status = 'error';
      response = err;
    }
  );

  const read = () => {
    switch (status) {
      case 'pending':
        throw suspender;
      case 'error':
        throw response;
      default:
        return response;
    }
  };
  return { read };
};
export const useSuspendableQuery = (query: any, options: any) => {
  const result = useQuery(query, options);
  if (result.loading) {
    suspend(new Promise((resolve) => !result.loading && resolve())).read();
  }
  return result;
};
