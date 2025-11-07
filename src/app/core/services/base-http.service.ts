import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

/**
 * Base HTTP service that encapsulates HttpClient.
 *
 * This service acts as an abstraction layer over Angular's HttpClient,
 * allowing for easier testing, mocking, and potential future changes
 * to the HTTP implementation (e.g., switching to fetch API or axios).
 *
 * @example
 * ```typescript
 * const httpService = inject(BaseHttpService);
 * const data = await httpService.post('/api/endpoint', body);
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  private readonly http = inject(HttpClient);

  /**
   * Performs a GET request.
   *
   * @param {string} url - The endpoint URL
   * @param {HttpParams} params - Optional query parameters
   * @param {HttpHeaders} headers - Optional headers
   * @returns {Observable<T>} An observable of the response
   */
  get<T>(
    url: string,
    params?: HttpParams,
    headers?: HttpHeaders
  ): Observable<T> {
    return this.http.get<T>(url, { params, headers });
  }

  /**
   * Performs a POST request.
   *
   * @param {string} url - The endpoint URL
   * @param {any} body - The request body
   * @param {HttpHeaders} headers - Optional headers
   * @returns {Observable<T>} An observable of the response
   */
  post<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(url, body, { headers });
  }

  /**
   * Performs a PUT request.
   *
   * @param {string} url - The endpoint URL
   * @param {any} body - The request body
   * @param {HttpHeaders} headers - Optional headers
   * @returns {Observable<T>} An observable of the response
   */
  put<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(url, body, { headers });
  }

  /**
   * Performs a DELETE request.
   *
   * @param {string} url - The endpoint URL
   * @param {HttpParams} params - Optional query parameters
   * @param {HttpHeaders} headers - Optional headers
   * @returns {Observable<T>} An observable of the response
   */
  delete<T>(
    url: string,
    params?: HttpParams,
    headers?: HttpHeaders
  ): Observable<T> {
    return this.http.delete<T>(url, { params, headers });
  }

  /**
   * Converts an Observable to a Promise.
   *
   * @param {Observable<T>} observable - The observable to convert
   * @returns {Promise<T>} A promise that resolves with the observable value
   */
  toPromise<T>(observable: Observable<T>): Promise<T> {
    return firstValueFrom(observable);
  }
}
