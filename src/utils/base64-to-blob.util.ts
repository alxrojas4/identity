/**
 * Converts a base64 string to a Blob.
 *
 * @param {string} base64String - The base64 string (with or without data URL prefix)
 * @param {string} mimeType - The MIME type of the image (default: 'image/jpeg')
 * @returns {Blob} The converted Blob
 *
 * @example
 * ```typescript
 * const blob = base64ToBlob('data:image/jpeg;base64,/9j/4AAQ...', 'image/jpeg');
 * ```
 */
export function base64ToBlob(
  base64String: string,
  mimeType: string = 'image/jpeg'
): Blob {
  // Remove data URL prefix if present
  const base64Data = base64String.includes(',')
    ? base64String.split(',')[1]
    : base64String.replace(/^data:image\/\w+;base64,/, '');

  // Decode base64 to binary
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
