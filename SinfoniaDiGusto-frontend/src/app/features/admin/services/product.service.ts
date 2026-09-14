import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../model/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/v1/products';

  private backendUrl = 'http://localhost:8080';


  // =========================================================
  // HEADER JSON
  // =========================================================

  private getAuthHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }


  // =========================================================
  // HEADER MULTIPART
  // NON impostare Content-Type manualmente
  // =========================================================

  private getMultipartAuthHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }


  // =========================================================
  // GET ALL PRODUCTS
  // =========================================================

  getProducts(): Observable<Product[]> {

    return this.http.get<Product[]>(this.apiUrl);
  }


  // =========================================================
  // GET PRODUCT BY ID
  // =========================================================

  getProductById(id: number): Observable<Product> {

    return this.http.get<Product>(
      `${this.apiUrl}/${id}`
    );
  }


  // =========================================================
  // CREATE PRODUCT
  // =========================================================

  createProduct(formData: FormData): Observable<Product> {

    return this.http.post<Product>(
      this.apiUrl,
      formData,
      {
        headers: this.getMultipartAuthHeaders()
      }
    );
  }


  // =========================================================
  // UPDATE PRODUCT
  // =========================================================

  updateProduct(
    id: number,
    formData: FormData
  ): Observable<Product> {

    return this.http.put<Product>(
      `${this.apiUrl}/${id}`,
      formData,
      {
        headers: this.getMultipartAuthHeaders()
      }
    );
  }


  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  deleteProduct(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }


  // =========================================================
  // URL IMMAGINE
  // =========================================================

  getImageUrl(imageUrl: string | null | undefined): string {

    if (!imageUrl) {
      return 'assets/images/default-product.png';
    }

    // Se restituisce /uploads/nome.jpg
    return `${this.backendUrl}${imageUrl}`;
  }
}
