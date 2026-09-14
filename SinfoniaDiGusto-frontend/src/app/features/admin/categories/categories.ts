// import { Component, inject, signal } from '@angular/core';
// import { CategoryService } from '../services/category.service';
// import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Category } from '../model/category.model';
// import { CommonModule } from '@angular/common';
// import { AdminHeader } from '../../../shared/component/admin-header/admin-header';

// @Component({
//   imports: [CommonModule, ReactiveFormsModule, AdminHeader],
//   selector: 'app-categories',
//   styleUrl: './categories.css',
//   templateUrl: './categories.html',
// })
// export class Categories {
//  private categoryService = inject(CategoryService);
//   private fb = inject(NonNullableFormBuilder);

//   categories = signal<Category[]>([]);
//   isLoading = signal<boolean>(true);
//   isSaving = signal<boolean>(false);
  
//   showModal = false;
//   editingCategory: Category | null = null;

//   categoryForm = this.fb.group({
//     name: ['', [Validators.required]],
//     imageUrl: ['']
//   });

//   ngOnInit(): void {
//     this.loadCategories();
//   }

//   loadCategories(): void {
//     this.isLoading.set(true);
//     this.categoryService.getCategories().subscribe({
//       next: (data) => {
//         this.categories.set(data);
//         this.isLoading.set(false);
//       },
//       error: (err) => {
//         console.error('Errore durante il recupero delle categorie:', err);
//         this.isLoading.set(false);
//       }
//     });
//   }

//   openCreateModal(): void {
//     this.editingCategory = null;
//     this.categoryForm.reset();
//     this.showModal = true;
//   }

//   openEditModal(category: Category): void {
//     this.editingCategory = category;
//     this.categoryForm.patchValue({
//       name: category.name,
//       imageUrl: category.imageUrl || ''
//     });
//     this.showModal = true;
//   }

//   closeModal(): void {
//     this.showModal = false;
//     this.editingCategory = null;
//   }

//   onSubmit(): void {
//     if (this.categoryForm.invalid) {
//       this.categoryForm.markAllAsTouched();
//       return;
//     }

//     this.isSaving.set(true);
//     const formValue = this.categoryForm.getRawValue();

//     if (this.editingCategory && this.editingCategory.id) {
//       this.categoryService.updateCategory(this.editingCategory.id, formValue).subscribe({
//         next: (updated) => {
//           this.categories.update(list => list.map(c => c.id === updated.id ? updated : c));
//           this.isSaving.set(false);
//           this.closeModal();
//         },
//         error: (err) => {
//           console.error('Errore aggiornamento categoria:', err);
//           this.isSaving.set(false);
//         }
//       });
//     } else {
//       this.categoryService.createCategory(formValue).subscribe({
//         next: (created) => {
//           this.categories.update(list => [...list, created]);
//           this.isSaving.set(false);
//           this.closeModal();
//         },
//         error: (err) => {
//           console.error('Errore creazione categoria:', err);
//           this.isSaving.set(false);
//         }
//       });
//     }
//   }

//   deleteCategory(id: number): void {
//     if (confirm('Sei sicuro di voler eliminare questa categoria?')) {
//       this.categoryService.deleteCategory(id).subscribe({
//         next: () => {
//           this.categories.update(list => list.filter(c => c.id !== id));
//         },
//         error: (err) => console.error('Errore durante l\'eliminazione:', err)
//       });
//     }
//   }

// }


import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  CategoryService
} from '../services/category.service';

import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Category
} from '../model/category.model';

import {
  CommonModule
} from '@angular/common';

import {
  AdminHeader
} from '../../../shared/component/admin-header/admin-header';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminHeader
  ],

  selector: 'app-categories',

  styleUrl: './categories.css',

  templateUrl: './categories.html',
})
export class Categories {

  private categoryService =
    inject(CategoryService);

  private fb =
    inject(NonNullableFormBuilder);

  // =========================================================
  // STATO
  // =========================================================

  categories =
    signal<Category[]>([]);

  isLoading =
    signal<boolean>(true);

  isSaving =
    signal<boolean>(false);

  showModal = false;

  editingCategory:
    Category | null = null;

  // =========================================================
  // FILE IMMAGINE
  // =========================================================

  selectedImageFile:
    File | null = null;

  // =========================================================
  // FORM
  // =========================================================

  categoryForm =
    this.fb.group({

      name: [
        '',
        [
          Validators.required
        ]
      ]

    });

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadCategories();
  }

  // =========================================================
  // CARICAMENTO CATEGORIE
  // =========================================================

  loadCategories(): void {

    this.isLoading.set(true);

    this.categoryService
      .getCategories()
      .subscribe({

        next: (data) => {

          this.categories.set(data);

          this.isLoading.set(false);
        },

        error: (err) => {

          console.error(
            'Errore durante il recupero delle categorie:',
            err
          );

          this.isLoading.set(false);
        }

      });
  }

  // =========================================================
  // SELEZIONE IMMAGINE
  // =========================================================

  onImageSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      input.files &&
      input.files.length > 0
    ) {

      this.selectedImageFile =
        input.files[0];

      console.log(
        'Immagine selezionata:',
        this.selectedImageFile.name
      );
    }
  }

  // =========================================================
  // NUOVA CATEGORIA
  // =========================================================

  openCreateModal(): void {

    this.editingCategory = null;

    this.selectedImageFile = null;

    this.categoryForm.reset({
      name: ''
    });

    this.showModal = true;
  }

  // =========================================================
  // MODIFICA CATEGORIA
  // =========================================================

  openEditModal(
    category: Category
  ): void {

    this.editingCategory =
      category;

    this.selectedImageFile =
      null;

    this.categoryForm.patchValue({

      name:
        category.name

    });

    this.showModal = true;
  }

  // =========================================================
  // CHIUDI MODALE
  // =========================================================

  closeModal(): void {

    this.showModal = false;

    this.editingCategory = null;

    this.selectedImageFile = null;
  }

  // =========================================================
  // SALVA
  // =========================================================

  onSubmit(): void {

    if (
      this.categoryForm.invalid
    ) {

      this.categoryForm.markAllAsTouched();

      return;
    }

    this.isSaving.set(true);

    const formValue =
      this.categoryForm.getRawValue();

    // =======================================================
    // MODIFICA
    // =======================================================

    if (
      this.editingCategory &&
      this.editingCategory.id
    ) {

      this.categoryService
        .updateCategory(
          this.editingCategory.id,
          formValue.name,
          this.selectedImageFile
        )
        .subscribe({

          next: (updated) => {

            this.categories.update(
              list =>
                list.map(category =>
                  category.id === updated.id
                    ? updated
                    : category
                )
            );

            this.isSaving.set(false);

            this.closeModal();
          },

          error: (err) => {

            console.error(
              'Errore aggiornamento categoria:',
              err
            );

            this.isSaving.set(false);
          }

        });

      return;
    }

    // =======================================================
    // CREAZIONE
    // =======================================================

    this.categoryService
      .createCategory(
        formValue.name,
        this.selectedImageFile
      )
      .subscribe({

        next: (created) => {

          this.categories.update(
            list => [
              ...list,
              created
            ]
          );

          this.isSaving.set(false);

          this.closeModal();
        },

        error: (err) => {

          console.error(
            'Errore creazione categoria:',
            err
          );

          this.isSaving.set(false);
        }

      });
  }

  // =========================================================
  // ELIMINA
  // =========================================================

  deleteCategory(
    id: number
  ): void {

    if (
      !confirm(
        'Sei sicuro di voler eliminare questa categoria?'
      )
    ) {

      return;
    }

    this.categoryService
      .deleteCategory(id)
      .subscribe({

        next: () => {

          this.categories.update(
            list =>
              list.filter(
                category =>
                  category.id !== id
              )
          );
        },

        error: (err) => {

          console.error(
            'Errore durante l\'eliminazione:',
            err
          );
        }

      });
  }

  // =========================================================
  // URL IMMAGINE
  // =========================================================

  getImageUrl(
    imageUrl: string | null | undefined
  ): string {

    if (!imageUrl) {

      return '';
    }

    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://')
    ) {

      return imageUrl;
    }

    return `http://localhost:8080${imageUrl}`;
  }
}
