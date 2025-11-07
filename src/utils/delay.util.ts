/**
 * Utility function to create a delay.
 *
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>} A promise that resolves after the delay
 *
 * @example
 * ```typescript
 * await delay(1000); // Wait 1 second
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
