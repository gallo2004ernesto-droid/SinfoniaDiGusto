import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../model/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryApiService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/v1/categories';

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${slug}`);
  }
}

// import { Injectable } from '@angular/core';
// import { Observable, of, delay } from 'rxjs';
// import { Category } from '../model/category.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class CategoryApiService {

//   // Dati Mock Categorie
//   private mockCategories: Category[] = [
//     { id: '1', name: 'Torte Artigianali', slug: 'torte', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80' },
//     { id: '2', name: 'Biscotti', slug: 'biscotti', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80' },
//     { id: '3', name: 'Crostate', slug: 'crostate', imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=300&q=80' },
//     { id: '4', name: 'Monoporzioni', slug: 'monoporzioni', imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=300&q=80' }
//   ];

//   getCategories(): Observable<Category[]> {
//     // delay(300) simula il tempo di risposta di una chiamata di rete vera
//     return of(this.mockCategories).pipe(delay(300));
//   }
// }