import {
  AppUI,
  AsThreshold,
  Base64,
  SdkOptionsType,
  Template,
  TransactionMode,
} from '@identy/identy-face';

import { LOCALIZATIONSFACE } from '../../../../constants/localizations';
import { environment } from '../../../../../environments/environment';

/**
 * Gets the Face SDK configuration options based on environment settings.
 *
 * This function creates a configuration object for the Face SDK with all necessary
 * options including security level, UI settings, and localization.
 *
 * @returns {SdkOptionsType} The Face SDK configuration options
 *
 * @example
 * ```typescript
 * const options = getFaceSdkOptions();
 * const faceSDK = new FaceSDK(options);
 * ```
 */
export function getFaceSdkOptions(): SdkOptionsType {
  const securityLevel = (
    environment.IDENTY_SECURITY_LEVEL_FACE ?? 'LOW'
  ).toString();
  const asThresholdValue: AsThreshold =
    (AsThreshold as any)[securityLevel] ?? AsThreshold.LOW;

  const base: SdkOptionsType = {
    allowCameraSelect: false,
    base64EncodingFlag: Base64.NO_WRAP,
    allowClose: true,
    enableEyesStatusDetector: true,
    skipSupportCheck: true,
    transaction: { type: TransactionMode.CAPTURE },
    captureTimeout: 50000,
    enableICAOChecks: true,
    appUI: AppUI.STANDARD,
    enableBackgroundRemoval: true,
    asThreshold: asThresholdValue,
    assisted: false,
    enableAS: true,
    requiredTemplates: [Template.JPEG],
    localization: LOCALIZATIONSFACE[1].option,
  };

  return base;
}
