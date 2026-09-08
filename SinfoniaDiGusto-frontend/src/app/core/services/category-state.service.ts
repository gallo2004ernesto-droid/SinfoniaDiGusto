import { Injectable, inject, signal } from '@angular/core';
import { Category } from '../model/category.model';
import { CategoryApiService } from './category-api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryStateService {
  private categoryApi = inject(CategoryApiService);

  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    // Innesca il caricamento dal DB appena il servizio viene iniettato
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryApi.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento categorie dal DB:', err);
        this.error.set('Impossibile caricare le categorie.');
        this.isLoading.set(false);
      }
    });
  }

  
}