import { GraphQLRequest, Operation } from '../core';
import { DocumentNode } from 'graphql';

export function transformOperation(operation: GraphQLRequest): GraphQLRequest {
  const transformedOperation: GraphQLRequest = {
    variables: operation.variables || {},
    extensions: operation.extensions || {},
    operationName: operation.operationName,
    query: operation.query,
  };

  // Best guess at an operation name
  if (!transformedOperation.operationName) {
    transformedOperation.operationName = getOperationName(transformedOperation.query) || undefined;
  }

  return transformedOperation as Operation;
}
function getOperationName(doc: DocumentNode): string | null {
  return (
    doc.definitions
      .filter((definition) => definition.kind === 'OperationDefinition' && definition.name)
      .map((x: any) => x!.name!.value)[0] || null
  );
}
