import { VALIDATION_RULES_FACE } from './validation-rules-face.const';
import { IdentyApiService } from '../../../../core/services/identy-api.service';

/**
 * Interface for face validation result.
 */
export interface FaceValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates a face capture image against quality and ICAO standards.
 *
 * This function:
 * 1. Validates quality metrics from the face data
 * 2. Validates ICAO compliance data
 * 3. Performs face matching validation against DNI front image
 *
 * @param {any} faceData - The face data returned from the API
 * @param {Blob} blob - The original captured image blob
 * @param {IdentyApiService} identyApiService - The Identy API service instance
 * @param {string | null} dniFrontImage - The DNI front image (base64) for matching
 * @returns {Promise<FaceValidationResult>} Validation result with isValid flag and optional message
 *
 * @throws {Error} If validation process fails
 *
 * @example
 * ```typescript
 * const identyApiService = inject(IdentyApiService);
 * const dniFrontImage = identityStore.dniFrontImage();
 * const result = await validateFace(photoData, blob, identyApiService, dniFrontImage);
 * if (result.isValid) {
 *   // Proceed with success flow
 * } else {
 *   // Handle validation error
 * }
 * ```
 */
export async function validateFace(
  faceData: any,
  blob: Blob,
  identyApiService: IdentyApiService,
  dniFrontImage: string | null
): Promise<FaceValidationResult> {
  const quality = faceData?.data?.quality || {};
  const icaoData = faceData?.icao_data || {};

  // Validate quality metrics
  for (const [key, expectedValue] of Object.entries(
    VALIDATION_RULES_FACE.quality
  )) {
    const actualValue = quality[key];
    if (actualValue !== expectedValue) {
      return {
        isValid: false,
        message: 'FEEDBACK_RETRY_QUALITY',
      };
    }
  }

  // Validate ICAO data
  for (const [key, expectedValue] of Object.entries(
    VALIDATION_RULES_FACE.icao_data
  )) {
    const actualValue = icaoData[key];

    if (typeof expectedValue === 'boolean') {
      if (actualValue !== expectedValue) {
        return {
          isValid: false,
          message: 'FEEDBACK_RETRY_ICAO',
        };
      }
    } else if (typeof expectedValue === 'number') {
      if (typeof actualValue === 'number' && actualValue < expectedValue) {
        return {
          isValid: false,
          message: 'FEEDBACK_RETRY_ICAO',
        };
      }
    }
  }

  if (!dniFrontImage) {
    return {
      isValid: false,
      message: 'FEEDBACK_MATCHING_ERROR',
    };
  }

  const { match, messageValidator } = await identyApiService.verifyWithPicId(
    blob,
    dniFrontImage
  );

  if (match) {
    return { isValid: true, message: 'OK' };
  } else {
    return { isValid: false, message: messageValidator };
  }
}
