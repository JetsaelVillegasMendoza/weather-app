/**
 * Determine whether a value is a non-empty string.
 *
 * @param {any} value - The input to validate.
 * @returns {boolean} True when the value is a string with at least one non-whitespace character.
 *
 * @example
 * isNonEmptyString('Berlin'); // true
 * isNonEmptyString('   '); // false
 * isNonEmptyString(null); // false
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
