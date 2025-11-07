import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { BaseComponent } from '../../../../shared/base/base.component';
import { TextService } from '../../../../core/services/text.service';
import { TitleSectionComponent } from '../../components/title-section/title-section.component';

@Component({
  selector: 'app-success-page',
  standalone: true,
  imports: [TitleSectionComponent],
  templateUrl: './success.page.html',
  styleUrl: './success.page.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SuccessPageComponent extends BaseComponent {
  private readonly textService = inject(TextService);

  readonly title = this.textService.getTextSignal('identity.success.title');
}
