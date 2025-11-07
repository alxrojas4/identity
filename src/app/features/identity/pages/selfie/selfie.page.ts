import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { FaceSDK } from '@identy/identy-face';

import { BaseComponent } from '../../../../shared/base/base.component';
import { TextService } from '../../../../core/services/text.service';
import { IdentityStoreService } from '../../../../core/services/identity-store.service';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { TitleSectionComponent } from '../../components/title-section/title-section.component';
import { getFaceSdkOptions } from './face-sdk-options.config';
import { IdentyApiService } from '../../../../core/services/identy-api.service';

@Component({
  selector: 'app-selfie-page',
  standalone: true,
  imports: [NavigationComponent, TitleSectionComponent],
  templateUrl: './selfie.page.html',
  styleUrl: './selfie.page.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SelfiePageComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  private sdk: FaceSDK | null = null;
  isCameraActive = false;
  isCaptured = false;
  errorMessage = '';
  currentStep = signal<'FACE' | 'SUCCESS' | 'TRANSITION' | 'STOP'>('FACE');

  @ViewChild('identyRef') identyRef!: ElementRef<HTMLDivElement>;

  private readonly textService = inject(TextService);
  private readonly identityStore = inject(IdentityStoreService);
  private readonly identyApiService = inject(IdentyApiService);

  readonly titlePrefix = this.textService.getTextSignal(
    'identity.selfie.title.prefix'
  );
  readonly titleHighlight = this.textService.getTextSignal(
    'identity.selfie.title.highlight'
  );
  readonly successTitle = this.textService.getTextSignal(
    'identity.selfie.success.title'
  );
  readonly backButton = this.textService.getTextSignal(
    'identity.common.backButton'
  );
  readonly retryButton = this.textService.getTextSignal(
    'identity.common.retry'
  );

  ngOnInit(): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.runFaceCapture().catch((error) => {
        console.error('Error initializing face capture:', error);
        this.onCameraError('Error al inicializar la captura facial');
      });
    }, 0);
  }

  /**
   * Runs the face capture transaction using the Face SDK.
   *
   * This method:
   * 1. Aborts any existing SDK instance
   * 2. Creates a new FaceSDK instance with configured options
   * 3. Attaches the SDK video container to the host element
   * 4. Initializes the SDK
   * 5. Captures the face image
   * 6. Processes and validates the captured image
   * 7. Handles errors appropriately
   *
   * @returns {Promise<void>} A promise that resolves when the capture process completes
   *
   * @throws {Error} If SDK initialization or capture fails
   */
  async runFaceCapture(): Promise<void> {
    await this.abortCurrentSdk();

    const options = getFaceSdkOptions();
    const faceSDK = new FaceSDK(options);
    this.sdk = faceSDK;

    this.attachSdkVideoToHost(this.identyRef);

    try {
      await faceSDK.initialize();
      const blob = await faceSDK.capture();
      this.currentStep.set('SUCCESS');

      await this.delay(1000);
      this.currentStep.set('TRANSITION');

      const photoData = await this.identyApiService.processFaceCapture(blob);
      const validationResult = await this.validateFace(photoData, blob);

      if (validationResult.isValid) {
        const processFace = structuredClone(photoData);
        delete (processFace as any).data?.templates?.JPEG;

        const imageData = await this.blobToBase64(blob);
        this.identityStore.setSelfieImage(imageData);
        this.isCaptured = true;

        await this.delay(3000);
        this.identityStore.setCurrentStep('success');
      } else {
        this.currentStep.set('STOP');
        // this.handleValidationError(validationResult.message);
      }
    } catch (error: any) {
      this.currentStep.set('STOP');
      const errorMessage = error.responseJSON
        ? error.responseJSON.message
        : error.message || 'Error al capturar la imagen facial';

      this.handleCaptureError(errorMessage);
    }
  }

  /**
   * Aborts the current SDK instance if it exists.
   *
   * @returns {Promise<void>} A promise that resolves when the SDK is aborted
   */
  private async abortCurrentSdk(): Promise<void> {
    try {
      if (this.sdk) {
        await this.sdk.abort();
      }
    } catch (error) {
      console.log('Cannot abort current SDK', error);
    } finally {
      this.sdk = null;
    }
  }

  /**
   * Waits for the Face SDK to inject its container into the DOM,
   * removes unwanted elements, and moves it into the provided host element.
   *
   * @param {ElementRef<HTMLElement>} hostRef - The host element where the SDK video will be attached
   */
  private attachSdkVideoToHost(hostRef: ElementRef<HTMLElement>): void {
    const interval = setInterval(() => {
      const identyVideo = document.getElementsByClassName(
        'ui-dialog identy-face-dialog identy-capture-dialog ui-widget ui-widget-content ui-front'
      );

      if (identyVideo.length > 0) {
        const parent = identyVideo[0] as HTMLElement;

        const titleBars = parent.getElementsByClassName(
          'ui-dialog-titlebar ui-corner-all ui-widget-header ui-helper-clearfix'
        );
        Array.from(titleBars).forEach((child) => child.remove());

        Array.from(identyVideo).forEach((identyElement) => {
          hostRef.nativeElement.appendChild(identyElement);
        });

        clearInterval(interval);
      }
    }, 100);
  }

  /**
   * Validates the captured face image.
   *
   * This is a placeholder implementation. You should implement the actual
   * validation logic based on your requirements.
   *
   * @param {any} photoData - The processed photo data from the server
   * @param {Blob} blob - The original captured image blob
   * @returns {Promise<{isValid: boolean; message?: string}>} Validation result
   */
  private async validateFace(
    photoData: any,
    blob: Blob
  ): Promise<{ isValid: boolean; message?: string }> {
    // TODO: Implement actual face validation logic
    // For now, we'll assume the image is valid if we have photoData
    if (photoData && photoData.data) {
      return { isValid: true };
    }
    return { isValid: false, message: 'FEEDBACK_RETRY' };
  }

  /**
   * Handles validation errors.
   *
   * @param {string} message - The error message
   */
  private handleValidationError(message: string): void {
    if (message === 'FEEDBACK_RETRY' || message === 'FEEDBACK_RETRY_INSECURE') {
      // Handle retry case - navigate back or show error
      this.errorMessage =
        'Necesitamos capturar nuevamente. Por favor, intente de nuevo.';
      // TODO: Implement navigation or fraud event tracking if needed
    } else {
      // Show error and allow retry
      this.errorMessage = this.getErrorMessage(message);
      this.onCameraError(this.errorMessage);
    }
  }

  /**
   * Handles capture errors.
   *
   * @param {string} errorMessage - The error message
   */
  private handleCaptureError(errorMessage: string): void {
    this.errorMessage = this.getErrorMessage(errorMessage);
    this.onCameraError(this.errorMessage);
  }

  /**
   * Gets a user-friendly error message from an error code.
   *
   * @param {string} errorCode - The error code
   * @returns {string} A user-friendly error message
   */
  private getErrorMessage(errorCode: string): string {
    // TODO: Implement error message dictionary lookup
    // For now, return the error code as-is
    return errorCode;
  }

  /**
   * Converts a Blob to a base64 string.
   *
   * @param {Blob} blob - The blob to convert
   * @returns {Promise<string>} A promise that resolves with the base64 string
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Utility function to create a delay.
   *
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>} A promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  override ngOnDestroy(): void {
    this.isCameraActive = false;
    this.abortCurrentSdk();
    super.ngOnDestroy();
  }

  /**
   * Handles image capture
   */
  onImageCaptured(imageData: string): void {
    this.identityStore.setSelfieImage(imageData);
    this.isCaptured = true;
    this.isCameraActive = false;

    // Navigate to next step after a short delay
    setTimeout(() => {
      this.identityStore.setCurrentStep('success');
    }, 2000);
  }

  /**
   * Handles camera errors
   */
  onCameraError(error: string): void {
    this.errorMessage = error;
    this.isCameraActive = false;
  }

  /**
   * Navigates back to previous page
   */
  goBack(): void {
    this.isCameraActive = false;
    this.identityStore.setCurrentStep('dni-back');
  }

  /**
   * Retries image capture.
   *
   * Resets the error state and re-runs the face capture process.
   */
  retryCapture(): void {
    this.errorMessage = '';
    this.isCaptured = false;
    this.isCameraActive = false;
    this.currentStep.set('FACE');

    // Re-run face capture after a short delay
    setTimeout(() => {
      this.runFaceCapture().catch((error) => {
        console.error('Error retrying face capture:', error);
        this.onCameraError('Error al reintentar la captura');
      });
    }, 3000);
  }

  /**
   * Requests camera permissions manually
   */
  async requestPermissions(): Promise<void> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.errorMessage = 'getUserMedia no está soportado en este navegador';
        return;
      }

      // Request permission first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });

      // Stop the stream immediately, we just wanted to request permission
      stream.getTracks().forEach((track) => track.stop());

      // Now try to initialize the camera
      this.errorMessage = '';
      this.isCameraActive = false;

      setTimeout(() => {
        this.isCameraActive = true;
      }, 100);
    } catch (error) {
      console.error('Permission request failed:', error);
      this.errorMessage = 'No se pudieron obtener los permisos de cámara';
    }
  }
}
