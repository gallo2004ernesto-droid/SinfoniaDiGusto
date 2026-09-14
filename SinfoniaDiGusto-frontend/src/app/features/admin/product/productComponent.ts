// // import { Component, computed, inject, OnInit, signal } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import {
// //   FormsModule,
// //   NonNullableFormBuilder,
// //   ReactiveFormsModule,
// //   Validators
// // } from '@angular/forms';

// // import { AdminHeader } from '../../../shared/component/admin-header/admin-header';
// // import { ProductService } from '../services/product.service';
// // import { CategoryService } from '../services/category.service';
// // import { Product } from '../model/product.model';
// // import { Category } from '../model/category.model';

// // @Component({
// //   selector: 'app-product',
// //   standalone: true,
// //   imports: [
// //     CommonModule,
// //     ReactiveFormsModule,
// //     FormsModule,
// //     AdminHeader
// //   ],
// //   templateUrl: './productComponent.html',
// //   styleUrl: './productComponent.css'
// // })
// // export class ProductAdminComponent implements OnInit {

// //   private productService = inject(ProductService);
// //   private categoryService = inject(CategoryService);
// //   private fb = inject(NonNullableFormBuilder);

// //   // =========================
// //   // STATO
// //   // =========================

// //   products = signal<Product[]>([]);
// //   categories = signal<Category[]>([]);

// //   isLoading = signal<boolean>(true);
// //   isSaving = signal<boolean>(false);

// //   // =========================
// //   // FILTRI
// //   // =========================

// //   searchTerm = signal<string>('');
// //   selectedCategory = signal<string>('');
// //   selectedStatus = signal<'ALL' | 'SALE' | 'FEATURED'>('ALL');

// //   // =========================
// //   // PRODOTTI FILTRATI
// //   // =========================

// //   filteredProducts = computed(() => {

// //     const term = this.searchTerm()
// //       .toLowerCase()
// //       .trim();

// //     const category = this.selectedCategory();
// //     const status = this.selectedStatus();

// //     return this.products().filter(product => {

// //       const matchesSearch =
// //         !term ||
// //         product.name.toLowerCase().includes(term) ||
// //         product.description?.toLowerCase().includes(term);

// //       const matchesCategory =
// //         !category ||
// //         product.category === category;

// //       const matchesStatus =
// //         status === 'ALL' ||
// //         (status === 'SALE' && product.onSale) ||
// //         (status === 'FEATURED' && product.featured);

// //       return (
// //         matchesSearch &&
// //         matchesCategory &&
// //         matchesStatus
// //       );
// //     });
// //   });

// //   // =========================
// //   // MODAL
// //   // =========================

// //   showModal = false;

// //   editingProduct: Product | null = null;

// //   // =========================
// //   // FORM
// //   // =========================

// //   productForm = this.fb.group({

// //     name: [
// //       '',
// //       [Validators.required]
// //     ],

// //     description: [
// //       '',
// //       [Validators.required]
// //     ],

// //     price: [
// //       0,
// //       [
// //         Validators.required,
// //         Validators.min(0.01)
// //       ]
// //     ],

// //     originalPrice: [
// //       undefined as number | undefined
// //     ],

// //     onSale: [
// //       false
// //     ],

// //     discountPercent: [
// //       undefined as number | undefined
// //     ],

// //     category: [
// //       '',
// //       [Validators.required]
// //     ],

// //     imageUrl: [
// //       '',
// //       [Validators.required]
// //     ],

// //     bgColor: [
// //       '#ffffff'
// //     ],

// //     featured: [
// //       false
// //     ],

// //     pdfUrl: [
// //       ''
// //     ]
// //   });

// //   // =========================
// //   // INIT
// //   // =========================

// //   ngOnInit(): void {
// //     this.loadInitialData();
// //   }

// //   // =========================
// //   // CARICAMENTO DATI
// //   // =========================

// //   loadInitialData(): void {

// //     this.isLoading.set(true);

// //     // Carica categorie
// //     this.categoryService.getCategories().subscribe({

// //       next: (categories) => {
// //         this.categories.set(categories);
// //       },

// //       error: (err) => {
// //         console.error(
// //           'Errore caricamento categorie:',
// //           err
// //         );
// //       }
// //     });

// //     // Carica prodotti
// //     this.productService.getProducts().subscribe({

// //       next: (products) => {

// //         this.products.set(products);

// //         this.isLoading.set(false);
// //       },

// //       error: (err) => {

// //         console.error(
// //           'Errore caricamento prodotti:',
// //           err
// //         );

// //         this.isLoading.set(false);
// //       }
// //     });
// //   }

// //   // =========================
// //   // RESET FILTRI
// //   // =========================

// //   resetFilters(): void {

// //     this.searchTerm.set('');
// //     this.selectedCategory.set('');
// //     this.selectedStatus.set('ALL');
// //   }

// //   // =========================
// //   // NUOVO PRODOTTO
// //   // =========================

// //   openCreateModal(): void {

// //     this.editingProduct = null;

// //     this.productForm.reset({
// //       name: '',
// //       description: '',
// //       price: 0,
// //       originalPrice: undefined,
// //       onSale: false,
// //       discountPercent: undefined,
// //       category: '',
// //       imageUrl: '',
// //       bgColor: '#ffffff',
// //       featured: false,
// //       pdfUrl: ''
// //     });

// //     this.showModal = true;
// //   }

// //   // =========================
// //   // MODIFICA PRODOTTO
// //   // =========================

// //   openEditModal(product: Product): void {

// //     this.editingProduct = product;

// //     this.productForm.patchValue({

// //       name: product.name,

// //       description: product.description,

// //       price: product.price,

// //       originalPrice: product.originalPrice,

// //       onSale: product.onSale ?? false,

// //       discountPercent: product.discountPercent,

// //       category: product.category,

// //       imageUrl: product.imageUrl,

// //       bgColor: product.bgColor || '#ffffff',

// //       featured: product.featured ?? false,

// //       pdfUrl: product.pdfUrl || ''
// //     });

// //     this.showModal = true;
// //   }

// //   // =========================
// //   // CHIUDI MODALE
// //   // =========================

// //   closeModal(): void {

// //     this.showModal = false;

// //     this.editingProduct = null;
// //   }

// //   // =========================
// //   // SALVA PRODOTTO
// //   // =========================

// //   // onSubmit(): void {

// //   //   if (this.productForm.invalid) {

// //   //     this.productForm.markAllAsTouched();

// //   //     return;
// //   //   }

// //   //   this.isSaving.set(true);

// //   //   const formValue =
// //   //     this.productForm.getRawValue();

// //   //   // MODIFICA
// //   //   if (
// //   //     this.editingProduct &&
// //   //     this.editingProduct.id
// //   //   ) {

// //   //     this.productService
// //   //       .updateProduct(
// //   //         this.editingProduct.id,
// //   //         formValue
// //   //       )
// //   //       .subscribe({

// //   //         next: (updatedProduct) => {

// //   //           this.products.update(
// //   //             products =>
// //   //               products.map(product =>
// //   //                 product.id === updatedProduct.id
// //   //                   ? updatedProduct
// //   //                   : product
// //   //               )
// //   //           );

// //   //           this.isSaving.set(false);

// //   //           this.closeModal();
// //   //         },

// //   //         error: (err) => {

// //   //           console.error(
// //   //             'Errore aggiornamento prodotto:',
// //   //             err
// //   //           );

// //   //           this.isSaving.set(false);
// //   //         }
// //   //       });
        
// //   //     return;
// //   //   }

// //   //   // CREAZIONE
// //   //   this.productService
// //   //     .createProduct(formValue)
// //   //     .subscribe({

// //   //       next: (createdProduct) => {

// //   //         this.products.update(
// //   //           products => [
// //   //             ...products,
// //   //             createdProduct
// //   //           ]
// //   //         );

// //   //         this.isSaving.set(false);

// //   //         this.closeModal();
// //   //       },

// //   //       error: (err) => {

// //   //         console.error(
// //   //           'Errore creazione prodotto:',
// //   //           err
// //   //         );

// //   //         this.isSaving.set(false);
// //   //       }
// //   //     });
// //   // }

// //   // Assicurati che l'oggetto inviato tramite HTTP sia formattato correttamente
// // onSubmit(): void {
// //   if (this.productForm.invalid) {
// //     this.productForm.markAllAsTouched();
// //     return;
// //   }

// //   const formValue = this.productForm.value;

// //   const payload = {
// //     name: formValue.name,
// //     description: formValue.description || null,
// //     price: Number(formValue.price),
// //     originalPrice: formValue.originalPrice ? Number(formValue.originalPrice) : null,
// //     stockQuantity: Number(formValue.stockQuantity),
// //     isOffer: Boolean(formValue.isOffer),
// //     discountPercent: formValue.discountPercent ? Number(formValue.discountPercent) : null,
// //     featured: Boolean(formValue.featured),
// //     imageUrl: formValue.imageUrl || null,
// //     bgColor: formValue.bgColor || null,
// //     pdfUrl: formValue.pdfUrl || null,
    
// //     // Converte esplicitamente la stringa della select in Number
// //     categoryId: formValue.categoryId ? Number(formValue.categoryId) : null
// //   };

// //   if (!payload.categoryId) {
// //     console.error("Errore: Seleziona una categoria valida!");
// //     return;
// //   }

// //   this.productService.createProduct(payload).subscribe({
// //     next: (res) => console.log('Prodotto creato:', res),
// //     error: (err) => console.error('Errore creazione prodotto:', err)
// //   });
// // }

// //   // =========================
// //   // ELIMINA PRODOTTO
// //   // =========================

// //   deleteProduct(id: number): void {

// //     const confirmed = confirm(
// //       'Sei sicuro di voler eliminare questo prodotto?'
// //     );

// //     if (!confirmed) {
// //       return;
// //     }

// //     this.productService
// //       .deleteProduct(id)
// //       .subscribe({

// //         next: () => {

// //           this.products.update(
// //             products =>
// //               products.filter(
// //                 product => product.id !== id
// //               )
// //           );
// //         },

// //         error: (err) => {

// //           console.error(
// //             'Errore durante eliminazione prodotto:',
// //             err
// //           );
// //         }
// //       });
// //   }



// // }


// import { Component, computed, inject, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   FormsModule,
//   NonNullableFormBuilder,
//   ReactiveFormsModule,
//   Validators
// } from '@angular/forms';

// import { AdminHeader } from '../../../shared/component/admin-header/admin-header';
// import { ProductService } from '../services/product.service';
// import { CategoryService } from '../services/category.service';
// import { Product } from '../model/product.model';
// import { Category } from '../model/category.model';

// @Component({
//   selector: 'app-product',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     FormsModule,
//     AdminHeader
//   ],
//   templateUrl: './productComponent.html',
//   styleUrl: './productComponent.css'
// })
// export class ProductAdminComponent implements OnInit {

//   private productService = inject(ProductService);
//   private categoryService = inject(CategoryService);
//   private fb = inject(NonNullableFormBuilder);

//   // =========================
//   // STATO
//   // =========================

//   products = signal<Product[]>([]);
//   categories = signal<Category[]>([]);

//   isLoading = signal<boolean>(true);
//   isSaving = signal<boolean>(false);

//   // File selezionati per l'upload multipart
//   selectedImageFile: File | null = null;
//   selectedPdfFile: File | null = null;

//   // =========================
//   // FILTRI
//   // =========================

//   searchTerm = signal<string>('');
//   selectedCategory = signal<string>('');
//   selectedStatus = signal<'ALL' | 'SALE' | 'FEATURED'>('ALL');

//   // =========================
//   // PRODOTTI FILTRATI
//   // =========================

//   filteredProducts = computed(() => {
//     const term = this.searchTerm().toLowerCase().trim();
//     const category = this.selectedCategory();
//     const status = this.selectedStatus();

//     return this.products().filter(product => {
//       const matchesSearch =
//         !term ||
//         product.name.toLowerCase().includes(term) ||
//         product.description?.toLowerCase().includes(term);

//       const matchesCategory =
//         !category ||
//         product.category === category ||
//         (product as any).categoryId?.toString() === category;

//       const matchesStatus =
//         status === 'ALL' ||
//         (status === 'SALE' && (product.isOffer || (product as any).isOffer)) ||
//         (status === 'FEATURED' && product.featured);

//       return matchesSearch && matchesCategory && matchesStatus;
//     });
//   });

//   // =========================
//   // MODAL
//   // =========================

//   showModal = false;
//   editingProduct: Product | null = null;

//   // =========================
//   // FORM (Proprietà sincronizzate)
//   // =========================

//   productForm = this.fb.group({
//     name: ['', [Validators.required]],
//     description: ['', [Validators.required]],
//     price: [0, [Validators.required, Validators.min(0.01)]],
//     originalPrice: [undefined as number | undefined],
//     stockQuantity: [0, [Validators.required, Validators.min(0)]],
//     isOffer: [false],
//     discountPercent: [undefined as number | undefined],
//     categoryId: ['', [Validators.required]],
//     imageUrl: [''],
//     bgColor: ['#ffffff'],
//     featured: [false],
//     pdfUrl: ['']
//   });

//   // INIT

//   ngOnInit(): void {
//     this.loadInitialData();
//   }

//   // =========================
//   // CARICAMENTO FILE
//   // =========================

//   onImageSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.selectedImageFile = input.files[0];
//     }
//   }

//   onPdfSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.selectedPdfFile = input.files[0];
//     }
//   }

//   // =========================
//   // CARICAMENTO DATI
//   // =========================

//   loadInitialData(): void {
//     this.isLoading.set(true);

//     this.categoryService.getCategories().subscribe({
//       next: (categories) => this.categories.set(categories),
//       error: (err) => console.error('Errore caricamento categorie:', err)
//     });

//     this.productService.getProducts().subscribe({
//       next: (products) => {
//         this.products.set(products);
//         this.isLoading.set(false);
//       },
//       error: (err) => {
//         console.error('Errore caricamento prodotti:', err);
//         this.isLoading.set(false);
//       }
//     });
//   }

//   getImageUrl(imageUrl: string | null | undefined): string {
//   if (!imageUrl) {
//     return 'assets/images/default-product.png';
//   }

//   if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
//     return imageUrl;
//   }

//   return `http://localhost:8080${imageUrl}`;
// }


//   // =========================
//   // RESET FILTRI
//   // =========================

//   resetFilters(): void {
//     this.searchTerm.set('');
//     this.selectedCategory.set('');
//     this.selectedStatus.set('ALL');
//   }

//   // =========================
//   // NUOVO PRODOTTO
//   // =========================

//   openCreateModal(): void {
//     this.editingProduct = null;
//     this.selectedImageFile = null;
//     this.selectedPdfFile = null;

//     this.productForm.reset({
//       name: '',
//       description: '',
//       price: 0,
//       originalPrice: undefined,
//       stockQuantity: 0,
//       isOffer: false,
//       discountPercent: undefined,
//       categoryId: '',
//       imageUrl: '',
//       bgColor: '#ffffff',
//       featured: false,
//       pdfUrl: ''
//     });

//     this.showModal = true;
//   }

//   // =========================
//   // MODIFICA PRODOTTO
//   // =========================

//  openEditModal(product: Product): void {

//   this.editingProduct = product;

//   // Quando apro la modifica non c'è ancora
//   // nessun nuovo file selezionato
//   this.selectedImageFile = null;
//   this.selectedPdfFile = null;

//   this.productForm.patchValue({

//     name: product.name,

//     description: product.description || '',

//     price: product.price,

//     originalPrice: product.originalPrice,

//     stockQuantity: product.stockQuantity ?? 0,

//     isOffer: product.isOffer ?? false,

//     discountPercent: product.discountPercent,

//     categoryId: String(product.categoryId),

//     imageUrl: product.imageUrl || '',

//     bgColor: product.bgColor || '#ffffff',

//     featured: product.featured ?? false,

//     pdfUrl: product.pdfUrl || ''
//   });

//   this.showModal = true;
// }


//   // =========================
//   // CHIUDI MODALE
//   // =========================

//   closeModal(): void {
//     this.showModal = false;
//     this.editingProduct = null;
//     this.selectedImageFile = null;
//     this.selectedPdfFile = null;
//   }

//   // =========================
//   // SALVA PRODOTTO
//   // =========================

//   onSubmit(): void {
//     if (this.productForm.invalid) {
//       this.productForm.markAllAsTouched();
//       return;
//     }

//     const formValue = this.productForm.getRawValue();

//     const payload: any = {
//       name: formValue.name,
//       description: formValue.description || undefined,
//       price: Number(formValue.price),
//       originalPrice: formValue.originalPrice ? Number(formValue.originalPrice) : undefined,
//       stockQuantity: Number(formValue.stockQuantity),
//       isOffer: Boolean(formValue.isOffer),
//       onSale: Boolean(formValue.isOffer),
//       discountPercent: formValue.discountPercent ? Number(formValue.discountPercent) : undefined,
//       featured: Boolean(formValue.featured),
//       imageUrl: formValue.imageUrl || undefined,
//       bgColor: formValue.bgColor || undefined,
//       pdfUrl: formValue.pdfUrl || undefined,
//       categoryId: formValue.categoryId ? Number(formValue.categoryId) : undefined,
//       category: formValue.categoryId
//     };

//     if (!payload.categoryId) {
//       console.error("Errore: Seleziona una categoria valida!");
//       return;
//     }

//     // Costruzione multipart/form-data per il caricamento diretto dei file
//     const formData = new FormData();
//     formData.append('product', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

//     if (this.selectedImageFile) {
//       formData.append('image', this.selectedImageFile);
//     }

//     if (this.selectedPdfFile) {
//       formData.append('pdf', this.selectedPdfFile);
//     }

//     this.isSaving.set(true);

//     if (this.editingProduct && this.editingProduct.id) {
//       // MODIFICA
//       this.productService.updateProduct(this.editingProduct.id, formData as any).subscribe({
//         next: (updatedProduct) => {
//           this.products.update(products =>
//             products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
//           );
//           this.isSaving.set(false);
//           this.closeModal();
//         },
//         error: (err) => {
//           console.error('Errore aggiornamento prodotto:', err);
//           this.isSaving.set(false);
//         }
//       });
//     } else {
//       // CREAZIONE
//       this.productService.createProduct(formData as any).subscribe({
//         next: (createdProduct) => {
//           this.products.update(products => [...products, createdProduct]);
//           this.isSaving.set(false);
//           this.closeModal();
//         },
//         error: (err) => {
//           console.error('Errore creazione prodotto:', err);
//           this.isSaving.set(false);
//         }
//       });
//     }
//   }

//   // =========================
//   // ELIMINA PRODOTTO
//   // =========================

//   deleteProduct(id: number): void {
//     const confirmed = confirm('Sei sicuro di voler eliminare questo prodotto?');
//     if (!confirmed) return;

//     this.productService.deleteProduct(id).subscribe({
//       next: () => {
//         this.products.update(products => products.filter(product => product.id !== id));
//       },
//       error: (err) => console.error('Errore durante eliminazione prodotto:', err)
//     });
//   }
// }


import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { AdminHeader } from '../../../shared/component/admin-header/admin-header';

import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';

import { Product } from '../model/product.model';
import { Category } from '../model/category.model';


@Component({
  selector: 'app-product',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AdminHeader
  ],

  templateUrl: './productComponent.html',

  styleUrl: './productComponent.css'
})
export class ProductAdminComponent implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  private productService = inject(ProductService);

  private categoryService = inject(CategoryService);

  private fb = inject(NonNullableFormBuilder);


  // =========================================================
  // STATO
  // =========================================================

  products = signal<Product[]>([]);

  categories = signal<Category[]>([]);

  isLoading = signal<boolean>(true);

  isSaving = signal<boolean>(false);


  // =========================================================
  // FILE
  // =========================================================

  selectedImageFile: File | null = null;

  selectedPdfFile: File | null = null;


  // =========================================================
  // FILTRI
  // =========================================================

  searchTerm = signal<string>('');

  selectedCategory = signal<string>('');

  selectedStatus =
    signal<'ALL' | 'SALE' | 'FEATURED'>('ALL');


  // =========================================================
  // PRODOTTI FILTRATI
  // =========================================================

  filteredProducts = computed(() => {

    const term =
      this.searchTerm()
        .toLowerCase()
        .trim();

    const category =
      this.selectedCategory();

    const status =
      this.selectedStatus();


    return this.products().filter(product => {

      // -----------------------------------------------------
      // RICERCA
      // -----------------------------------------------------

      const matchesSearch =
        !term ||
        product.name
          .toLowerCase()
          .includes(term) ||

        product.description
          .toLowerCase()
          .includes(term);


      // -----------------------------------------------------
      // CATEGORIA
      // -----------------------------------------------------

      const matchesCategory =
        !category ||

        product.category === category ||

        String(product.categoryId) === category;


      // -----------------------------------------------------
      // STATO
      // -----------------------------------------------------

      const matchesStatus =
        status === 'ALL' ||

        (
          status === 'SALE' &&
          product.isOffer === true
        ) ||

        (
          status === 'FEATURED' &&
          product.featured === true
        );


      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  });


  // =========================================================
  // MODALE
  // =========================================================

  showModal = false;

  editingProduct: Product | null = null;


  // =========================================================
  // FORM
  // =========================================================

  productForm = this.fb.group({

    name: [
      '',
      [
        Validators.required
      ]
    ],

    description: [
      '',
      [
        Validators.required
      ]
    ],

    price: [
      0,
      [
        Validators.required,
        Validators.min(0.01)
      ]
    ],

    originalPrice: [
      undefined as number | undefined
    ],

    stockQuantity: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    isOffer: [
      false
    ],

    discountPercent: [
      undefined as number | undefined
    ],

    categoryId: [
      '',
      [
        Validators.required
      ]
    ],

    imageUrl: [
      ''
    ],

    bgColor: [
      '#ffffff'
    ],

    featured: [
      false
    ],

    pdfUrl: [
      ''
    ]
  });


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadInitialData();
  }


  // =========================================================
  // SELEZIONE IMMAGINE
  // =========================================================

  onImageSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    if (
      input.files &&
      input.files.length > 0
    ) {

      this.selectedImageFile =
        input.files[0];
    }
  }


  // =========================================================
  // SELEZIONE PDF
  // =========================================================

  onPdfSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    if (
      input.files &&
      input.files.length > 0
    ) {

      this.selectedPdfFile =
        input.files[0];
    }
  }


  // =========================================================
  // CARICAMENTO DATI
  // =========================================================

  loadInitialData(): void {

    this.isLoading.set(true);


    // -------------------------------------------------------
    // CATEGORIE
    // -------------------------------------------------------

    this.categoryService
      .getCategories()
      .subscribe({

        next: (categories) => {

          this.categories.set(categories);
        },

        error: (err) => {

          console.error(
            'Errore caricamento categorie:',
            err
          );
        }
      });


    // -------------------------------------------------------
    // PRODOTTI
    // -------------------------------------------------------

    this.productService
      .getProducts()
      .subscribe({

        next: (products) => {

          this.products.set(products);

          this.isLoading.set(false);
        },

        error: (err) => {

          console.error(
            'Errore caricamento prodotti:',
            err
          );

          this.isLoading.set(false);
        }
      });
  }


  // =========================================================
  // URL IMMAGINE
  // =========================================================

  getImageUrl(
    imageUrl: string | null | undefined
  ): string {

    return this.productService
      .getImageUrl(imageUrl);
  }


  // =========================================================
  // RESET FILTRI
  // =========================================================

  resetFilters(): void {

    this.searchTerm.set('');

    this.selectedCategory.set('');

    this.selectedStatus.set('ALL');
  }


  // =========================================================
  // NUOVO PRODOTTO
  // =========================================================

  openCreateModal(): void {

    this.editingProduct = null;

    this.selectedImageFile = null;

    this.selectedPdfFile = null;


    this.productForm.reset({

      name: '',

      description: '',

      price: 0,

      originalPrice: undefined,

      stockQuantity: 1,

      isOffer: false,

      discountPercent: undefined,

      categoryId: '',

      imageUrl: '',

      bgColor: '#ffffff',

      featured: false,

      pdfUrl: ''
    });


    this.showModal = true;
  }


  // =========================================================
  // MODIFICA PRODOTTO
  // =========================================================

  openEditModal(product: Product): void {

    this.editingProduct = product;


    // Nessun nuovo file selezionato
    // quando apro la modifica

    this.selectedImageFile = null;

    this.selectedPdfFile = null;


    this.productForm.patchValue({

      name:
        product.name,

      description:
        product.description || '',

      price:
        product.price,

      originalPrice:
        product.originalPrice ?? undefined,

      stockQuantity:
        product.stockQuantity ?? 1,

      isOffer:
        product.isOffer,

      discountPercent:
        product.discountPercent ?? undefined,

      categoryId:
        product.categoryId != null
          ? String(product.categoryId)
          : '',

      imageUrl:
        product.imageUrl || '',

      bgColor:
        product.bgColor || '#ffffff',

      featured:
        product.featured,

      pdfUrl:
        product.pdfUrl || ''
    });


    this.showModal = true;
  }


  // =========================================================
  // CHIUDI MODALE
  // =========================================================

  closeModal(): void {

    this.showModal = false;

    this.editingProduct = null;

    this.selectedImageFile = null;

    this.selectedPdfFile = null;
  }


  // =========================================================
  // SALVA PRODOTTO
  // =========================================================

  onSubmit(): void {

    // -------------------------------------------------------
    // VALIDAZIONE
    // -------------------------------------------------------

    if (this.productForm.invalid) {

      this.productForm.markAllAsTouched();

      return;
    }


    const formValue =
      this.productForm.getRawValue();


    // -------------------------------------------------------
    // CATEGORY ID
    // -------------------------------------------------------

    const categoryId =
      Number(formValue.categoryId);


    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {

      console.error(
        'Errore: categoria non valida'
      );

      return;
    }


    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {

      name:
        formValue.name.trim(),

      description:
        formValue.description.trim() || null,

      price:
        Number(formValue.price),

      originalPrice:
        formValue.originalPrice != null
          ? Number(formValue.originalPrice)
          : null,

      stockQuantity:
        Number(formValue.stockQuantity),

      isOffer:
        Boolean(formValue.isOffer),

      discountPercent:
        formValue.discountPercent != null
          ? Number(formValue.discountPercent)
          : null,

      featured:
        Boolean(formValue.featured),

      imageUrl:
        formValue.imageUrl.trim() || null,

      bgColor:
        formValue.bgColor.trim() || null,

      pdfUrl:
        formValue.pdfUrl.trim() || null,

      categoryId:
        categoryId
    };


    // -------------------------------------------------------
    // DEBUG
    // -------------------------------------------------------

    console.log(
      'PAYLOAD PRODOTTO:',
      payload
    );


    // =======================================================
    // FORMDATA
    // =======================================================

    const formData =
      new FormData();


    // -------------------------------------------------------
    // JSON PRODUCT
    // -------------------------------------------------------

    formData.append(
      'product',

      new Blob(
        [
          JSON.stringify(payload)
        ],
        {
          type: 'application/json'
        }
      )
    );


    // -------------------------------------------------------
    // NUOVA IMMAGINE
    // -------------------------------------------------------

    if (this.selectedImageFile) {

      formData.append(
        'image',
        this.selectedImageFile,
        this.selectedImageFile.name
      );
    }


    // -------------------------------------------------------
    // NUOVO PDF
    // -------------------------------------------------------

    if (this.selectedPdfFile) {

      formData.append(
        'pdf',
        this.selectedPdfFile,
        this.selectedPdfFile.name
      );
    }


    // =======================================================
    // SALVATAGGIO
    // =======================================================

    this.isSaving.set(true);


    // =======================================================
    // UPDATE
    // =======================================================

    if (
      this.editingProduct &&
      this.editingProduct.id != null
    ) {

      const productId =
        this.editingProduct.id;


      console.log(
        'UPDATE PRODUCT ID:',
        productId
      );


      this.productService
        .updateProduct(
          productId,
          formData
        )
        .subscribe({

          next: (updatedProduct) => {

            console.log(
              'Prodotto aggiornato:',
              updatedProduct
            );


            this.products.update(
              products =>
                products.map(product =>
                  product.id === updatedProduct.id
                    ? updatedProduct
                    : product
                )
            );


            this.isSaving.set(false);

            this.closeModal();
          },


          error: (err) => {

            console.error(
              'Errore aggiornamento prodotto:',
              err
            );

            console.error(
              'Status:',
              err?.status
            );

            console.error(
              'Response:',
              err?.error
            );

            this.isSaving.set(false);
          }
        });


      return;
    }


    // =======================================================
    // CREATE
    // =======================================================

    this.productService
      .createProduct(formData)
      .subscribe({

        next: (createdProduct) => {

          console.log(
            'Prodotto creato:',
            createdProduct
          );


          this.products.update(
            products => [
              ...products,
              createdProduct
            ]
          );


          this.isSaving.set(false);

          this.closeModal();
        },


        error: (err) => {

          console.error(
            'Errore creazione prodotto:',
            err
          );

          console.error(
            'Status:',
            err?.status
          );

          console.error(
            'Response:',
            err?.error
          );

          this.isSaving.set(false);
        }
      });
  }


  // =========================================================
  // ELIMINA PRODOTTO
  // =========================================================

  deleteProduct(id: number): void {

    const confirmed =
      confirm(
        'Sei sicuro di voler eliminare questo prodotto?'
      );


    if (!confirmed) {
      return;
    }


    this.productService
      .deleteProduct(id)
      .subscribe({

        next: () => {

          this.products.update(
            products =>
              products.filter(
                product =>
                  product.id !== id
              )
          );
        },


        error: (err) => {

          console.error(
            'Errore durante eliminazione prodotto:',
            err
          );
        }
      });
  }
}
