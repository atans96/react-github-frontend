import {
  DocumentNode,
  SelectionNode,
  SelectionSetNode,
  OperationDefinitionNode,
  FieldNode,
  DirectiveNode,
  FragmentDefinitionNode,
  ArgumentNode,
  FragmentSpreadNode,
  VariableDefinitionNode,
  VariableNode,
  visit,
} from 'graphql';
import { invariant } from 'ts-invariant';

import {
  checkDocument,
  getOperationDefinition,
  getFragmentDefinition,
  getFragmentDefinitions,
  getMainDefinition,
} from './getFromAST';
import { isField, isInlineFragment } from './storeUtils';
import { createFragmentMap, FragmentMap } from './fragments';

export type RemoveNodeConfig<N> = {
  name?: string;
  test?: (node: N) => boolean;
  remove?: boolean;
};

export type GetNodeConfig<N> = {
  name?: string;
  test?: (node: N) => boolean;
};

export type RemoveDirectiveConfig = RemoveNodeConfig<DirectiveNode>;
export type GetDirectiveConfig = GetNodeConfig<DirectiveNode>;
export type RemoveArgumentsConfig = RemoveNodeConfig<ArgumentNode>;
export type GetFragmentSpreadConfig = GetNodeConfig<FragmentSpreadNode>;
export type RemoveFragmentSpreadConfig = RemoveNodeConfig<FragmentSpreadNode>;
export type RemoveFragmentDefinitionConfig = RemoveNodeConfig<FragmentDefinitionNode>;
export type RemoveVariableDefinitionConfig = RemoveNodeConfig<VariableDefinitionNode>;

const TYPENAME_FIELD: FieldNode = {
  kind: 'Field',
  name: {
    kind: 'Name',
    value: '__typename',
  },
};

function isEmpty(op: OperationDefinitionNode | FragmentDefinitionNode, fragments: FragmentMap): boolean {
  return op.selectionSet.selections.every(
    (selection) => selection.kind === 'FragmentSpread' && isEmpty(fragments[selection.name.value], fragments)
  );
}

function nullIfDocIsEmpty(doc: DocumentNode) {
  return isEmpty(
    getOperationDefinition(doc) || getFragmentDefinition(doc),
    createFragmentMap(getFragmentDefinitions(doc))
  )
    ? null
    : doc;
}

function getDirectiveMatcher(directives: (RemoveDirectiveConfig | GetDirectiveConfig)[]) {
  return function directiveMatcher(directive: DirectiveNode) {
    return directives.some(
      (dir) => (dir.name && dir.name === directive.name.value) || (dir.test && dir.test(directive))
    );
  };
}

export function addTypenameToDocument(doc: DocumentNode): DocumentNode {
  return visit(checkDocument(doc), {
    SelectionSet: {
      enter(node, _key, parent) {
        // Don't add __typename to OperationDefinitions.
        if (parent && (parent as OperationDefinitionNode).kind === 'OperationDefinition') {
          return;
        }

        // No changes if no selections.
        const { selections } = node;
        if (!selections) {
          return;
        }

        // If selections already have a __typename, or are part of an
        // introspection query, do nothing.
        const skip = selections.some((selection) => {
          return (
            isField(selection) &&
            (selection.name.value === '__typename' || selection.name.value.lastIndexOf('__', 0) === 0)
          );
        });
        if (skip) {
          return;
        }

        // If this SelectionSet is @export-ed as an input variable, it should
        // not have a __typename field (see issue #4691).
        const field = parent as FieldNode;
        if (isField(field) && field.directives && field.directives.some((d) => d.name.value === 'export')) {
          return;
        }

        // Create and return a new SelectionSet with a __typename Field.
        return {
          ...node,
          selections: [...selections, TYPENAME_FIELD],
        };
      },
    },
  });
}

export interface addTypenameToDocument {
  added(field: FieldNode): boolean;
}
addTypenameToDocument.added = function (field: FieldNode) {
  return field === TYPENAME_FIELD;
};

const connectionRemoveConfig = {
  test: (directive: DirectiveNode) => {
    const willRemove = directive.name.value === 'connection';
    if (willRemove) {
      if (!directive.arguments || !directive.arguments.some((arg) => arg.name.value === 'key')) {
        invariant.warn(
          'Removing an @connection directive even though it does not have a key. ' +
            'You may want to use the key parameter to specify a store key.'
        );
      }
    }

    return willRemove;
  },
};

function hasDirectivesInSelectionSet(
  directives: GetDirectiveConfig[],
  selectionSet: SelectionSetNode | undefined,
  nestedCheck = true
): boolean {
  return (
    !!selectionSet &&
    selectionSet.selections &&
    selectionSet.selections.some((selection) => hasDirectivesInSelection(directives, selection, nestedCheck))
  );
}

function hasDirectivesInSelection(
  directives: GetDirectiveConfig[],
  selection: SelectionNode,
  nestedCheck = true
): boolean {
  if (!isField(selection)) {
    return true;
  }

  if (!selection.directives) {
    return false;
  }

  return (
    selection.directives.some(getDirectiveMatcher(directives)) ||
    (nestedCheck && hasDirectivesInSelectionSet(directives, selection.selectionSet, nestedCheck))
  );
}

function getArgumentMatcher(config: RemoveArgumentsConfig[]) {
  return function argumentMatcher(argument: ArgumentNode) {
    return config.some(
      (aConfig: RemoveArgumentsConfig) =>
        argument.value &&
        argument.value.kind === 'Variable' &&
        argument.value.name &&
        (aConfig.name === argument.value.name.value || (aConfig.test && aConfig.test(argument)))
    );
  };
}

export function removeArgumentsFromDocument(config: RemoveArgumentsConfig[], doc: DocumentNode): DocumentNode | null {
  const argMatcher = getArgumentMatcher(config);

  return nullIfDocIsEmpty(
    visit(doc, {
      OperationDefinition: {
        enter(node) {
          return {
            ...node,
            // Remove matching top level variables definitions.
            variableDefinitions: node.variableDefinitions
              ? node.variableDefinitions.filter(
                  (varDef) => !config.some((arg) => arg.name === varDef.variable.name.value)
                )
              : [],
          };
        },
      },

      Field: {
        enter(node) {
          // If `remove` is set to true for an argument, and an argument match
          // is found for a field, remove the field as well.
          const shouldRemoveField = config.some((argConfig) => argConfig.remove);

          if (shouldRemoveField) {
            let argMatchCount = 0;
            if (node.arguments) {
              node.arguments.forEach((arg) => {
                if (argMatcher(arg)) {
                  argMatchCount += 1;
                }
              });
            }

            if (argMatchCount === 1) {
              return null;
            }
          }
        },
      },

      Argument: {
        enter(node) {
          // Remove all matching arguments.
          if (argMatcher(node)) {
            return null;
          }
        },
      },
    })
  );
}

export function removeFragmentSpreadFromDocument(
  config: RemoveFragmentSpreadConfig[],
  doc: DocumentNode
): DocumentNode | null {
  function enter(node: FragmentSpreadNode | FragmentDefinitionNode): null | void {
    if (config.some((def) => def.name === node.name.value)) {
      return null;
    }
  }

  return nullIfDocIsEmpty(
    visit(doc, {
      FragmentSpread: { enter },
      FragmentDefinition: { enter },
    })
  );
}

function getAllFragmentSpreadsFromSelectionSet(selectionSet: SelectionSetNode): FragmentSpreadNode[] {
  const allFragments: FragmentSpreadNode[] = [];

  selectionSet.selections.forEach((selection) => {
    if ((isField(selection) || isInlineFragment(selection)) && selection.selectionSet) {
      getAllFragmentSpreadsFromSelectionSet(selection.selectionSet).forEach((frag) => allFragments.push(frag));
    } else if (selection.kind === 'FragmentSpread') {
      allFragments.push(selection);
    }
  });

  return allFragments;
}

// If the incoming document is a query, return it as is. Otherwise, build a
// new document containing a query operation based on the selection set
// of the previous main operation.
export function buildQueryFromSelectionSet(document: DocumentNode): DocumentNode {
  const definition = getMainDefinition(document);
  const definitionOperation = (<OperationDefinitionNode>definition).operation;

  if (definitionOperation === 'query') {
    // Already a query, so return the existing document.
    return document;
  }

  // Build a new query using the selection set of the main operation.
  const modifiedDoc = visit(document, {
    OperationDefinition: {
      enter(node) {
        return {
          ...node,
          operation: 'query',
        };
      },
    },
  });
  return modifiedDoc;
}
