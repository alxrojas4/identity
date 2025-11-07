import { Component, inject, signal, computed, effect } from '@angular/core';

import { IdentityStoreService } from '../core/services/identity-store.service';
import { OnboardingPageComponent } from './identity/pages/onboarding/onboarding.page';
import { DniFrontPageComponent } from './identity/pages/dni-front/dni-front.page';
import { DniBackPageComponent } from './identity/pages/dni-back/dni-back.page';
import { SelfiePageComponent } from './identity/pages/selfie/selfie.page';
import { SuccessPageComponent } from './identity/pages/success/success.page';

@Component({
  selector: 'app-identity-entry',
  standalone: true,
  imports: [
    OnboardingPageComponent,
    DniFrontPageComponent,
    DniBackPageComponent,
    SelfiePageComponent,
    SuccessPageComponent,
  ],
  template: `
    <app-onboarding-page
      [style.display]="currentStep() === 'onboarding' ? 'block' : 'none'"
    ></app-onboarding-page>

    @if (shouldShowDniFront()) {
    <app-dni-front-page
      [style.display]="currentStep() === 'dni-front' ? 'block' : 'none'"
    ></app-dni-front-page>
    } @if (shouldShowDniBack()) {
    <app-dni-back-page
      [style.display]="currentStep() === 'dni-back' ? 'block' : 'none'"
    ></app-dni-back-page>
    } @if (shouldShowSelfie()) {
    <app-selfie-page
      [style.display]="currentStep() === 'selfie' ? 'block' : 'none'"
    ></app-selfie-page>
    }

    <app-success-page
      [style.display]="currentStep() === 'success' ? 'block' : 'none'"
    ></app-success-page>
  `,
})
export class IdentityEntryComponent {
  private readonly identityStore = inject(IdentityStoreService);
  readonly currentStep = this.identityStore.currentStep;

  private readonly mountedComponents = signal<Set<string>>(new Set());

  constructor() {
    effect(
      () => {
        const step = this.currentStep();

        if (step === 'dni-front' || step === 'dni-back' || step === 'selfie') {
          this.mountedComponents.update((set) => {
            if (!set.has(step)) {
              return new Set(set).add(step);
            }
            return set;
          });
        }

        if (step === 'onboarding' || step === 'success') {
          this.mountedComponents.set(new Set());
        }
      },
      { allowSignalWrites: true }
    );
  }

  readonly shouldShowDniFront = computed(() => {
    const step = this.currentStep();
    const mounted = this.mountedComponents().has('dni-front');
    return mounted && step !== 'onboarding' && step !== 'success';
  });

  readonly shouldShowDniBack = computed(() => {
    const step = this.currentStep();
    const mounted = this.mountedComponents().has('dni-back');
    return mounted && step !== 'onboarding' && step !== 'success';
  });

  readonly shouldShowSelfie = computed(() => {
    const step = this.currentStep();
    const mounted = this.mountedComponents().has('selfie');
    return mounted && step !== 'onboarding' && step !== 'success';
  });
}
