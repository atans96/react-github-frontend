/**
 * Resolves a condition that is {@link BooleanLike} or returns {@link BooleanLike} from a function
 * @param condition The condition to resolve
 */
import { BooleanLike } from '../typing/type'

export const getConditionResult = (condition: BooleanLike | ((...args: unknown[]) => BooleanLike)): boolean => {
  const conditionResult = Boolean(typeof condition === 'function' ? condition() : condition)

  return conditionResult
}
