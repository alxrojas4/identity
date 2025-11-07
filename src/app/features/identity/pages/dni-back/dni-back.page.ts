import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  OnDestroy,
  inject,
  computed,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { BaseComponent } from '../../../../shared/base/base.component';
import { TextService } from '../../../../core/services/text.service';
import { IdentityStoreService } from '../../../../core/services/identity-store.service';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { TitleSectionComponent } from '../../components/title-section/title-section.component';
import {
  CardDetectionMode,
  SdkOptionsType,
  DocumentType,
  TransactionMode,
  Template,
  CardOcrSDK,
} from '@identy/identy-ocr';
import { LOCALIZATIONSOCR } from '../../../../constants/localizations';

@Component({
  selector: 'app-dni-back-page',
  standalone: true,
  imports: [NavigationComponent, TitleSectionComponent],
  templateUrl: './dni-back.page.html',
  styleUrl: './dni-back.page.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DniBackPageComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  @ViewChild('identyRef') identyRef!: ElementRef<HTMLDivElement>;
  isCameraActive = false;
  isCaptured = false;
  errorMessage = '';

  private readonly textService = inject(TextService);
  private readonly identityStore = inject(IdentityStoreService);

  readonly titlePrefix = this.textService.getTextSignal(
    'identity.dni-back.title.prefix'
  );
  readonly titleHighlight = this.textService.getTextSignal(
    'identity.dni-back.title.highlight'
  );
  readonly titleSuffix = this.textService.getTextSignal(
    'identity.dni-back.title.suffix'
  );
  readonly successTitle = this.textService.getTextSignal(
    'identity.dni-back.success.title'
  );
  readonly backButton = this.textService.getTextSignal(
    'identity.common.backButton'
  );
  readonly retryButton = this.textService.getTextSignal(
    'identity.common.retry'
  );

  ngOnInit(): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    // setTimeout(() => {
    //   this.initializeCamera();
    // }, 0);
    this.triggerCapture();
  }

  triggerCapture() {
    return new Promise((resolve) => {
      this.captureOne()
        .then((final: any) => {
          resolve(final);
        })
        .catch();
    });
  }

  captureOne() {
    return new Promise((resolve, reject) => {
      this.runCaptureOCR()
        .then((response: any) => {
          // const parsed =
          //   typeof response === 'object'
          //     ? postData(response)
          //     : postData1(response);
          // return resolve(parsed);
        })
        .catch((err: any) => {
          return reject(err);
        });
    });
  }

  runCaptureOCR() {
    return new Promise((resolve, reject) => {
      // abortCurrentSdk();

      const base: SdkOptionsType = {
        a4IntegrityCheck: true,
        allowClose: false,
        barcodeCheck: false,
        cardtype: DocumentType.PERU_ID_CARD,
        debug: false,
        detectionModes: [CardDetectionMode.FRONT, CardDetectionMode.BACK],
        transaction: { type: TransactionMode.CAPTURE },
        requiredTemplates: [Template.JPEG],
        localization: LOCALIZATIONSOCR[1].localization,
        graphics: {
          silhouette: {
            enable: true,
          },
          training: {
            show: false,
          },
        },
        selectAsFile: false,
        showCaptureTraining: false,
        skipSupportCheck: false,
        useFlash: false,
        exitTimout: 45000,
        events: {
          onCardFaceCaptureSuccess: (face: string) => {
            return new Promise((resolve) => {
              if (face === 'FRONT') {
                console.log('FRONT CAPTURED');
                // setStep('SUCCESS');
                // resetAttempts('ocr');
                // setTimeout(() => {
                //   setStep('BACK');
                //   resolve(null);
                // }, 3000);
              } else {
                console.log('BACK CAPTURED');
                // setStep('SUCCESS');
                // resetAttempts('ocr');
                // setTimeout(() => {
                //   resolve(null);
                // }, 500);
              }
            });
          },
        },
      };
      const cardSdk = new CardOcrSDK(base);
      // sdkRef.current = cardSdk;

      this.initializeVideoDOM();

      cardSdk.onInit = () => {
        cardSdk
          .capture()
          .then(async (blob: any) => {
            return resolve(blob);
          })
          .catch((error) => {
            console.error('OCR Capture error:', error);
            // setStep('STOP');
            // setTimeExceed(true);
            // if (error.message === 'FEEDBACK_CAMERA_ACQUIRING_FAILED') {
            //   sethasCameraPermission(false);
            // } else {
            //   setStep('STOP');
            //   showErrorByDictionary?.(error.message, 'ocr', {
            //     dictionary: ERROR_MESSAGES_OCR,
            //     onCloseFn: () => {
            //       setStepBio(1);
            //     },
            //   });
            // }
            // return resolve(null);
          });
      };
      cardSdk.initialize().catch((error: any) => {
        console.error('SDK Initialization error:', error);
        // setTimeExceed(true);
        // reject(error);
        // setStep('STOP');
        // showErrorByDictionary?.(error.message, 'ocr', {
        //   dictionary: ERROR_MESSAGES_OCR,
        //   onCloseFn: () => {
        //     setStepBio(1);
        //   },
        // });
      });
    });
  }

  initializeVideoDOM() {
    const interval = setInterval(() => {
      try {
        const identyVideo = document.getElementsByClassName(
          'ui-dialog identy-ocr-dialog identy-capture-dialog noclose ui-widget ui-widget-content ui-front'
        );
        if (identyVideo && identyVideo.length > 0) {
          const parent = identyVideo[0] as HTMLElement;
          const tbar = parent.getElementsByClassName('button_box');
          Array.from(tbar).forEach((child) => {
            child.remove();
          });
          Array.from(identyVideo).forEach((identyElement) => {
            this.identyRef?.nativeElement.appendChild(identyElement);
          });
          const video = document.querySelector('video.desktop');
          if (video) {
            video.removeAttribute('class');
          }
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 200);
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
    this.identityStore.setDniBackImage(imageData);
    this.isCaptured = true;
    this.isCameraActive = false;

    // Navigate to next step after a short delay
    setTimeout(() => {
      this.identityStore.setCurrentStep('selfie');
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
    this.identityStore.setCurrentStep('dni-front');
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
