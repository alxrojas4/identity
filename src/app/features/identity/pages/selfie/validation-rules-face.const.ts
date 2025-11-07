/**
 * Validation rules for face capture quality and ICAO compliance.
 *
 * These rules define the expected values for quality metrics and ICAO data
 * that must be met for a face capture to be considered valid.
 */
export const VALIDATION_RULES_FACE = {
  quality: {
    eyes_status: 'OPEN',
    qc_passed: true,
  },
  icao_data: {
    eyes_full_visibility: true,
    nose_visibility: 45,
    mouth_visibility: 45,
    sideL_visibility: 20,
    sideR_visibility: 20,
    top_visibility: 20,
    bottom_visibility: 20,
    multiple_faces: false,
  },
} as const;
