import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  OnDestroy,
  inject,
  computed,
} from '@angular/core';
import { BaseComponent } from '../../../../shared/base/base.component';
import { TextService } from '../../../../core/services/text.service';
import { IdentityStoreService } from '../../../../core/services/identity-store.service';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { TitleSectionComponent } from '../../components/title-section/title-section.component';
import { CameraComponent } from '../../components/camera/camera.component';

@Component({
  selector: 'app-dni-front-page',
  standalone: true,
  imports: [NavigationComponent, TitleSectionComponent, CameraComponent],
  templateUrl: './dni-front.page.html',
  styleUrl: './dni-front.page.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DniFrontPageComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  isCameraActive = false;
  isCaptured = false;
  errorMessage = '';

  private readonly textService = inject(TextService);
  private readonly identityStore = inject(IdentityStoreService);

  readonly titlePrefix = this.textService.getTextSignal(
    'identity.dni-front.title.prefix'
  );
  readonly titleHighlight = this.textService.getTextSignal(
    'identity.dni-front.title.highlight'
  );
  readonly titleSuffix = this.textService.getTextSignal(
    'identity.dni-front.title.suffix'
  );
  readonly successTitle = this.textService.getTextSignal(
    'identity.dni-front.success.title'
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
      this.initializeCamera();
    }, 0);
  }

  override ngOnDestroy(): void {
    this.isCameraActive = false;
    super.ngOnDestroy();
  }

  /**
   * Initializes the camera
   */
  private initializeCamera(): void {
    // Set camera as active immediately to trigger camera initialization
    this.isCameraActive = true;
  }

  /**
   * Handles image capture
   */
  onImageCaptured(imageData: string): void {
    this.identityStore.setDniFrontImage(imageData);
    this.isCaptured = true;
    this.isCameraActive = false;

    // Navigate to next step after a short delay
    setTimeout(() => {
      this.identityStore.setCurrentStep('dni-back');
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
    this.identityStore.setCurrentStep('onboarding');
  }

  /**
   * Retries image capture
   */
  retryCapture(): void {
    this.errorMessage = '';
    this.isCaptured = false;
    this.isCameraActive = false;

    // Force re-initialization after a short delay
    setTimeout(() => {
      this.isCameraActive = true;
    }, 100);
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
        video: { facingMode: 'environment' },
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
