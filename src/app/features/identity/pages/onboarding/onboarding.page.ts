import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../shared/base/base.component';
import { TextService } from '../../../../core/services/text.service';
import { IdentityStoreService } from '../../../../core/services/identity-store.service';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { TitleSectionComponent } from '../../components/title-section/title-section.component';
import { InstructionsComponent } from '../../components/instructions/instructions.component';
import { ConsentComponent } from '../../components/consent/consent.component';
import { InstructionItem } from '../../../../shared/interfaces/identity.interfaces';

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [
    NavigationComponent,
    TitleSectionComponent,
    InstructionsComponent,
    ConsentComponent,
  ],
  templateUrl: './onboarding.page.html',
  styleUrl: './onboarding.page.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OnboardingPageComponent extends BaseComponent implements OnInit {
  biometricConsent = false;

  private readonly textService = inject(TextService);
  private readonly identityStore = inject(IdentityStoreService);
  private readonly router = inject(Router);

  readonly titlePrefix = this.textService.getTextSignal(
    'identity.onboarding.title.prefix'
  );
  readonly titleHighlight = this.textService.getTextSignal(
    'identity.onboarding.title.highlight'
  );
  readonly subtitle = this.textService.getTextSignal(
    'identity.onboarding.subtitle'
  );
  readonly continueButton = this.textService.getTextSignal(
    'identity.onboarding.continueButton'
  );
  readonly backButton = this.textService.getTextSignal(
    'identity.common.backButton'
  );

  readonly consentText = this.textService.getTextSignal(
    'identity.onboarding.consent.text'
  );
  readonly consentHighlight = this.textService.getTextSignal(
    'identity.onboarding.consent.highlight'
  );
  readonly consentSuffix = this.textService.getTextSignal(
    'identity.onboarding.consent.suffix'
  );

  readonly instructions = computed<InstructionItem[]>(() => [
    {
      iconKey: 'dni',
      text: this.textService.getText('identity.onboarding.instructions.dni'),
    },
    {
      iconKey: 'camera',
      text: this.textService.getText('identity.onboarding.instructions.camera'),
    },
    {
      iconKey: 'lighting',
      text: this.textService.getText(
        'identity.onboarding.instructions.lighting'
      ),
    },
  ]);

  ngOnInit(): void {}

  /**
   * Handles biometric consent change
   */
  onConsentChange(consent: boolean): void {
    this.biometricConsent = consent;
    this.identityStore.setBiometricConsent(consent);
  }

  /**
   * Continues to the next step
   */
  continue(): void {
    // this.identityStore.setCurrentStep('dni-front');
    // this.router.navigate(['/biometria/dni-front']);
    this.identityStore.setCurrentStep('dni-back');
    this.router.navigate(['/biometria/dni-back']);
  }

  /**
   * Navigates back to previous page
   */
  goBack(): void {
    this.router.navigate(['/']);
  }
}
