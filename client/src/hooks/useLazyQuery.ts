import { DocumentNode } from 'graphql';
import React from 'react';
import { OperationVariables, QueryHookOptions, QueryResult, useQuery } from '@apollo/client';
function useLazyQuery<TData = any, TVariables = OperationVariables, TOptions = QueryHookOptions<TData, TVariables>>(
  query: DocumentNode,
  Options?: TOptions
) {
  const ref = React.useRef<QueryResult<TData, TVariables>>();
  const [variables, setVariables] = React.useState<TVariables>();
  const [options, setOptions] = React.useState<TOptions>();
  // console.log(variables);
  ref.current = useQuery(query, {
    ...options,
    ...Options,
    variables,
  });
  const runner = ({ variables, options }: any) => {
    setVariables(variables);
    setOptions(options);
  };

  return [runner, ref.current] as const;
}
export default useLazyQuery;
