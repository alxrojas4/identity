import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'stencil-library/loader';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import {
  preInitializeFaceSDK,
  preInitializeOcrSDK,
} from './utils/preInitialize';

defineCustomElements();

(async () => {
  try {
    const licenseOrc = environment.OCR_LICENSE;
    const apiModels = `${environment.IDENTY_API_BASE_URL}/v1/models`;
    const apiPubKey = `${environment.IDENTY_API_BASE_URL}/v1/pub_key`;
    const options = [
      { name: 'LogAPITrigger', value: 'true' },
      { name: 'requestID', value: '8f1b8a25-6b22-4de8-bc74-10e0ac34109a' },
    ];

    const result = await Promise.all([
      // preInitializeFaceSDK(apiModels, apiPubKey, options),
      preInitializeOcrSDK(licenseOrc, apiPubKey, options),
    ]);
    console.log('result::', result);
  } catch (error) {
    console.log(error);
  }
})();

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
