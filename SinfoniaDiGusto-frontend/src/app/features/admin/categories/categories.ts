import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CategoryService } from '../services/category.service';
import { AdminCategory } from '../model/category.model';
import { AdminHeader } from '../../../shared/component/admin-header/admin-header';

@Component({
  imports: [CommonModule, ReactiveFormsModule, AdminHeader],
  selector: 'app-categories',
  styleUrl: './categories.css',
  templateUrl: './categories.html',
})
export class Categories {

  private categoryService = inject(CategoryService);
  private fb = inject(NonNullableFormBuilder);

  
  // STATO
  

  categories = signal<AdminCategory[]>([]);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  showModal = false;
  editingCategory: AdminCategory | null = null;

  
  // FILE IMMAGINE
  

  selectedImageFile: File | null = null;

  
  // FORM
  

  categoryForm = this.fb.group({
    name: ['', [Validators.required]]
  });

  
  // INIT
  

  ngOnInit(): void {
    this.loadCategories();
  }

  
  // CARICAMENTO CATEGORIE (con conteggio, solo admin)
  

  loadCategories(): void {
    this.isLoading.set(true);

    this.categoryService.getAdminCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore durante il recupero delle categorie:', err);
        this.isLoading.set(false);
      }
    });
  }

  
  // SELEZIONE IMMAGINE
  

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
    }
  }

  
  // MODALE
  

  openCreateModal(): void {
    this.editingCategory = null;
    this.selectedImageFile = null;
    this.categoryForm.reset({ name: '' });
    this.showModal = true;
  }

  openEditModal(category: AdminCategory): void {
    this.editingCategory = category;
    this.selectedImageFile = null;
    this.categoryForm.patchValue({ name: category.name });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategory = null;
    this.selectedImageFile = null;
  }

  
  // SALVA
  

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.categoryForm.getRawValue();

    // ---------- MODIFICA ----------
    if (this.editingCategory && this.editingCategory.id) {

      this.categoryService
        .updateCategory(this.editingCategory.id, formValue.name, this.selectedImageFile)
        .subscribe({
          next: (updated) => {
            // La risposta non ha il conteggio: si conserva quello esistente
            this.categories.update(list =>
              list.map(category =>
                category.id === updated.id
                  ? { ...updated, productCount: category.productCount }
                  : category
              )
            );
            this.isSaving.set(false);
            this.closeModal();
          },
          error: (err) => {
            console.error('Errore aggiornamento categoria:', err);
            this.isSaving.set(false);
          }
        });

      return;
    }

    // ---------- CREAZIONE ----------
    this.categoryService
      .createCategory(formValue.name, this.selectedImageFile)
      .subscribe({
        next: (created) => {
          // Una categoria nuova ha 0 prodotti
          this.categories.update(list => [...list, { ...created, productCount: 0 }]);
          this.isSaving.set(false);
          this.closeModal();
        },
        error: (err) => {
          console.error('Errore creazione categoria:', err);
          this.isSaving.set(false);
        }
      });
  }

  
  // ELIMINA
  

  deleteCategory(id: number): void {
    if (!confirm('Sei sicuro di voler eliminare questa categoria?')) {
      return;
    }

    this.errorMessage.set(null);

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.categories.update(list => list.filter(c => c.id !== id));
      },
      error: (err) => {
        console.error('Errore durante l\'eliminazione:', err);
        this.errorMessage.set(
          err.error?.message || 'Impossibile eliminare la categoria.'
        );
      }
    });
  }

  
  // URL IMMAGINE
  

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `http://localhost:8080${imageUrl}`;
  }
}