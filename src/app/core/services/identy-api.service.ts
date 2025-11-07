import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';
import { environment } from '../../../environments/environment';

/**
 * API endpoints for the Identy service.
 */
export enum IdentyApiEndpoint {
  PUB_KEY = '/v1/pub_key',
  MODELS = '/v1/models',
  VERIFY_WITH_PIC_ID = '/v1/verifyWithPicID',
  PROCESS = '/v1/process',
}

/**
 * Interface for face capture metadata.
 */
export interface FaceCaptureMetadata {
  metadata_by_user_key: string;
  metadata_by_mobile_device_key: string;
  timestamp: number;
}

/**
 * Service for interacting with Identy API endpoints.
 *
 * This service provides a centralized interface for all Identy-related
 * API calls (Face and OCR processing). It uses the BaseHttpService
 * to abstract HTTP implementation details.
 *
 * @example
 * ```typescript
 * const identyService = inject(IdentyApiService);
 * const result = await identyService.processFaceCapture(blob);
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class IdentyApiService {
  private readonly httpService = inject(BaseHttpService);
  private readonly baseUrl = environment.IDENTY_API_BASE_URL;

  /**
   * Builds the full URL for an API endpoint.
   *
   * @param {IdentyApiEndpoint} endpoint - The API endpoint
   * @param {Record<string, string>} queryParams - Optional query parameters
   * @returns {string} The complete URL
   */
  private buildUrl(
    endpoint: IdentyApiEndpoint,
    queryParams?: Record<string, string>
  ): string {
    let url = `${this.baseUrl}${endpoint}`;

    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Gets default headers for API requests.
   *
   * @param {Record<string, string>} additionalHeaders - Additional headers to include
   * @returns {HttpHeaders} The configured headers
   */
  private getDefaultHeaders(
    additionalHeaders?: Record<string, string>
  ): HttpHeaders {
    let headers = new HttpHeaders();

    if (additionalHeaders) {
      Object.entries(additionalHeaders).forEach(([key, value]) => {
        headers = headers.set(key, value);
      });
    }

    return headers;
  }

  /**
   * Processes a face capture image.
   *
   * Sends the captured face image blob to the backend for processing
   * and validation.
   *
   * @param {Blob} blob - The captured face image blob
   * @param {Partial<FaceCaptureMetadata>} metadata - Optional metadata to override defaults
   * @returns {Promise<any>} A promise that resolves with the server response
   *
   * @throws {Error} If the server request fails
   *
   * @example
   * ```typescript
   * const blob = await faceSDK.capture();
   * const result = await identyService.processFaceCapture(blob, {
   *   metadata_by_user_key: 'custom_user_key'
   * });
   * ```
   */
  async processFaceCapture(
    blob: Blob,
    metadata?: Partial<FaceCaptureMetadata>
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', blob, 'face-capture.jpg');

    const captureMeta: FaceCaptureMetadata = {
      metadata_by_user_key: metadata?.metadata_by_user_key ?? 'test_123',
      metadata_by_mobile_device_key:
        metadata?.metadata_by_mobile_device_key ?? '120293',
      timestamp: metadata?.timestamp ?? new Date().getTime(),
    };

    formData.append('capture_meta', JSON.stringify(captureMeta));

    const url = this.buildUrl(IdentyApiEndpoint.PROCESS, {
      ts: new Date().getTime().toString(),
    });

    const headers = this.getDefaultHeaders({ 'X-DEBUG': '1' });

    try {
      const response = await this.httpService.toPromise(
        this.httpService.post<any>(url, formData, headers)
      );
      return response;
    } catch (error: any) {
      const errorMessage =
        error.error?.message ||
        error.message ||
        'Error al procesar la imagen facial';
      throw new Error(errorMessage);
    }
  }

  // TODO: Implement OCR processing endpoint
  // async processOcrCapture(blob: Blob, metadata?: Partial<OcrCaptureMetadata>): Promise<any> {
  //   // Implementation for OCR processing
  // }

  // TODO: Implement public key retrieval endpoint
  // async getPublicKey(): Promise<string> {
  //   const url = this.buildUrl(IdentyApiEndpoint.PUB_KEY);
  //   const response = await this.httpService.toPromise(
  //     this.httpService.get<{ publicKey: string }>(url)
  //   );
  //   return response.publicKey;
  // }

  // TODO: Implement models retrieval endpoint
  // async getModels(): Promise<any> {
  //   const url = this.buildUrl(IdentyApiEndpoint.MODELS);
  //   return await this.httpService.toPromise(
  //     this.httpService.get<any>(url)
  //   );
  // }

  // TODO: Implement face verification endpoint
  // async verifyWithPicId(blob: Blob, picId: string): Promise<any> {
  //   const formData = new FormData();
  //   formData.append('file', blob);
  //   formData.append('picId', picId);
  //
  //   const url = this.buildUrl(IdentyApiEndpoint.VERIFY_WITH_PIC_ID);
  //   return await this.httpService.toPromise(
  //     this.httpService.post<any>(url, formData)
  //   );
  // }
}
