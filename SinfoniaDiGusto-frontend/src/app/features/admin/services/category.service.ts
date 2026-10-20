import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, AdminCategory } from '../model/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:8080/api/v1/categories';


  
  // HEADER AUTENTICAZIONE
  

  private getAuthHeaders(): HttpHeaders {

    const token = localStorage.getItem('jwt_token');

    if (!token) {
      console.error(
        'JWT non trovato nel localStorage'
      );
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });
  }


  
  // GET CATEGORIE
  

  getCategories(): Observable<Category[]> {

    return this.http.get<Category[]>(
      this.apiUrl
    );
  }

  getAdminCategories(): Observable<AdminCategory[]> {
    return this.http.get<AdminCategory[]>(`${this.apiUrl}/admin`);
  }


  
  // CREATE
  

  createCategory(
    name: string,
    imageFile: File | null
  ): Observable<Category> {

    const formData = new FormData();

    const categoryData = {
      name: name
    };

    formData.append(
      'category',
      new Blob(
        [
          JSON.stringify(categoryData)
        ],
        {
          type: 'application/json'
        }
      )
    );

    if (imageFile) {

      formData.append(
        'image',
        imageFile
      );
    }

    return this.http.post<Category>(
      this.apiUrl,
      formData,
      {
        headers: this.getAuthHeaders()
      }
    );
  }


  
  // UPDATE
  

  updateCategory(
    id: number,
    name: string,
    imageFile: File | null
  ): Observable<Category> {

    const formData = new FormData();

    const categoryData = {
      name: name
    };

    formData.append(
      'category',
      new Blob(
        [
          JSON.stringify(categoryData)
        ],
        {
          type: 'application/json'
        }
      )
    );

    if (imageFile) {

      formData.append(
        'image',
        imageFile
      );
    }

    return this.http.put<Category>(
      `${this.apiUrl}/${id}`,
      formData,
      {
        headers: this.getAuthHeaders()
      }
    );
  }


  
  // DELETE
  

  deleteCategory(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }
}
