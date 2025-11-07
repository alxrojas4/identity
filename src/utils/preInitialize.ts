import { FaceSDK } from '@identy/identy-face';
import { CardOcrSDK } from '@identy/identy-ocr';

type Header = { name: string; value: string };

export async function preInitializeFaceSDK(
  modelsUrl: string,
  apiUrl: string,
  headers: Header[]
) {
  return await FaceSDK.preInitialize(
    { URL: modelsUrl },
    {
      URL: { url: apiUrl, headers },
    }
  );
}

export async function preInitializeOcrSDK(
  licenseKey: string,
  apiUrl: string,
  headers: Header[]
) {
  return await CardOcrSDK.preInitialize(licenseKey);
  // return await CardOcrSDK.preInitialize(licenseKey, {
  //   URL: {
  //     url: apiUrl,
  //     headers,
  //   },
  // });
}
