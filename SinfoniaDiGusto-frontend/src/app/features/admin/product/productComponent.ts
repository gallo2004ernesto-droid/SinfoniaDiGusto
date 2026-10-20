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
import { BadgeService } from '../../../core/services/badge.service';

import { Product } from '../model/product.model';
import { Category } from '../model/category.model';
import { Badge } from '../../../core/model/badge.model';


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

  private readonly OFFER_CODE = 'OFFER';

  
  // SERVICES
  

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private badgeService = inject(BadgeService);
  private fb = inject(NonNullableFormBuilder);


  
  // STATO
  

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  badges = signal<Badge[]>([]);

  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  formError = signal<string | null>(null);


  
  // FILE E BADGE SELEZIONATI
  

  selectedImageFile: File | null = null;
  selectedPdfFile: File | null = null;

  selectedBadgeIds = signal<number[]>([]);

  // Vero se tra i badge selezionati c'è "In Offerta"
  isOfferSelected = computed(() => {
    const offerBadge = this.badges().find(b => b.code === this.OFFER_CODE);

    return (
      !!offerBadge &&
      offerBadge.id != null &&
      this.selectedBadgeIds().includes(offerBadge.id)
    );
  });


  
  // FILTRI
  

  searchTerm = signal<string>('');
  selectedCategory = signal<string>('');
  selectedStatus = signal<'ALL' | 'SALE' | 'FEATURED'>('ALL');


  
  // PRODOTTI FILTRATI
  

  filteredProducts = computed(() => {

    const term = this.searchTerm().toLowerCase().trim();
    const category = this.selectedCategory();
    const status = this.selectedStatus();

    return this.products().filter(product => {

      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.description ?? '').toLowerCase().includes(term);

      const matchesCategory =
        !category ||
        String(product.categoryId) === category;

      const matchesStatus =
        status === 'ALL' ||
        (status === 'SALE' && product.isOffer === true) ||
        (status === 'FEATURED' && product.featured === true);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  });


  
  // MODALE
  

  showModal = false;
  editingProduct: Product | null = null;


  
  // FORM
  

  productForm = this.fb.group({

    name: ['', [Validators.required]],

    description: ['', [Validators.required]],

    price: [0, [Validators.required, Validators.min(0.01)]],

    // Usato solo con il badge "In Offerta"
    originalPrice: [undefined as number | undefined],

    stockQuantity: [0, [Validators.required, Validators.min(0)]],

    categoryId: ['', [Validators.required]],

    imageUrl: [''],

    bgColor: ['#ffffff'],

    pdfUrl: ['']
  });


  
  // ANTEPRIMA SCONTO (stessa formula del backend)
  

  get discountPreview(): number | null {

    const price = Number(this.productForm.controls.price.value);
    const original = Number(this.productForm.controls.originalPrice.value);

    if (!price || !original || original <= price) {
      return null;
    }

    return Math.round(((original - price) / original) * 100);
  }


  
  // INIT
  

  ngOnInit(): void {
    this.loadInitialData();
  }


  
  // SELEZIONE FILE
  

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
    }
  }

  onPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedPdfFile = input.files[0];
    }
  }


  
  // SELEZIONE BADGE
  

  toggleBadge(id: number): void {
    this.selectedBadgeIds.update(ids =>
      ids.includes(id)
        ? ids.filter(badgeId => badgeId !== id)
        : [...ids, id]
    );
  }

  isBadgeSelected(id: number): boolean {
    return this.selectedBadgeIds().includes(id);
  }


  
  // CARICAMENTO DATI
  

  loadInitialData(): void {

    this.isLoading.set(true);

    // Categorie
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => console.error('Errore caricamento categorie:', err)
    });

    // Badge (admin: tutti, anche quelli disattivati)
    this.badgeService.getAdminBadges().subscribe({
      next: (badges) => this.badges.set(badges),
      error: (err) => console.error('Errore caricamento badge:', err)
    });

    // Prodotti
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento prodotti:', err);
        this.isLoading.set(false);
      }
    });
  }


  
  // URL IMMAGINE
  

  getImageUrl(imageUrl: string | null | undefined): string {
    return this.productService.getImageUrl(imageUrl);
  }


  
  // RESET FILTRI
  

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('');
    this.selectedStatus.set('ALL');
  }


  
  // NUOVO PRODOTTO
  

  openCreateModal(): void {

    this.editingProduct = null;
    this.selectedImageFile = null;
    this.selectedPdfFile = null;
    this.selectedBadgeIds.set([]);
    this.formError.set(null);

    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      stockQuantity: 1,
      categoryId: '',
      imageUrl: '',
      bgColor: '#ffffff',
      pdfUrl: ''
    });

    this.showModal = true;
  }


  
  // MODIFICA PRODOTTO
  

  openEditModal(product: Product): void {

    this.editingProduct = product;
    this.formError.set(null);

    // Nessun nuovo file selezionato quando apro la modifica
    this.selectedImageFile = null;
    this.selectedPdfFile = null;

    // Badge già assegnati al prodotto
    this.selectedBadgeIds.set(
      (product.badges ?? [])
        .map(badge => badge.id)
        .filter((id): id is number => id != null)
    );

    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.originalPrice ?? undefined,
      stockQuantity: product.stockQuantity ?? 1,
      categoryId: product.categoryId != null ? String(product.categoryId) : '',
      imageUrl: product.imageUrl || '',
      bgColor: product.bgColor || '#ffffff',
      pdfUrl: product.pdfUrl || ''
    });

    this.showModal = true;
  }


  
  // CHIUDI MODALE
  

  closeModal(): void {
    this.showModal = false;
    this.editingProduct = null;
    this.selectedImageFile = null;
    this.selectedPdfFile = null;
    this.selectedBadgeIds.set([]);
    this.formError.set(null);
  }


  
  // SALVA PRODOTTO
  

  onSubmit(): void {

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    // Con il badge "In Offerta" serve un prezzo originale maggiore del prezzo
    if (this.isOfferSelected() && this.discountPreview === null) {
      this.formError.set(
        'Con il badge "In Offerta" il Prezzo originale deve essere maggiore del Prezzo.'
      );
      return;
    }

    const formValue = this.productForm.getRawValue();

    const categoryId = Number(formValue.categoryId);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      this.formError.set('Seleziona una categoria valida.');
      return;
    }

    this.formError.set(null);

    // -------------------------------------------------------
    // PAYLOAD (lo sconto lo calcola il backend)
    // -------------------------------------------------------

    const payload = {
      name: formValue.name.trim(),
      description: formValue.description.trim() || null,
      price: Number(formValue.price),
      originalPrice:
        this.isOfferSelected() && formValue.originalPrice != null
          ? Number(formValue.originalPrice)
          : null,
      stockQuantity: Number(formValue.stockQuantity),
      imageUrl: formValue.imageUrl.trim() || null,
      bgColor: formValue.bgColor.trim() || null,
      pdfUrl: formValue.pdfUrl.trim() || null,
      categoryId,
      badgeIds: this.selectedBadgeIds()
    };

    // -------------------------------------------------------
    // FORMDATA
    // -------------------------------------------------------

    const formData = new FormData();

    formData.append(
      'product',
      new Blob([JSON.stringify(payload)], { type: 'application/json' })
    );

    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile, this.selectedImageFile.name);
    }

    if (this.selectedPdfFile) {
      formData.append('pdf', this.selectedPdfFile, this.selectedPdfFile.name);
    }

    this.isSaving.set(true);

    // -------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------

    if (this.editingProduct && this.editingProduct.id != null) {

      this.productService
        .updateProduct(this.editingProduct.id, formData)
        .subscribe({
          next: (updatedProduct) => {
            this.products.update(products =>
              products.map(product =>
                product.id === updatedProduct.id ? updatedProduct : product
              )
            );
            this.isSaving.set(false);
            this.closeModal();
          },
          error: (err) => {
            console.error('Errore aggiornamento prodotto:', err);
            this.formError.set(
              err?.error?.message || 'Impossibile salvare il prodotto.'
            );
            this.isSaving.set(false);
          }
        });

      return;
    }

    // -------------------------------------------------------
    // CREATE
    // -------------------------------------------------------

    this.productService
      .createProduct(formData)
      .subscribe({
        next: (createdProduct) => {
          this.products.update(products => [...products, createdProduct]);
          this.isSaving.set(false);
          this.closeModal();
        },
        error: (err) => {
          console.error('Errore creazione prodotto:', err);
          this.formError.set(
            err?.error?.message || 'Impossibile salvare il prodotto.'
          );
          this.isSaving.set(false);
        }
      });
  }


  
  // ELIMINA PRODOTTO
  

  deleteProduct(id: number): void {

    const confirmed = confirm('Sei sicuro di voler eliminare questo prodotto?');

    if (!confirmed) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products.update(products =>
          products.filter(product => product.id !== id)
        );
      },
      error: (err) => {
        console.error('Errore durante eliminazione prodotto:', err);
      }
    });
  }
}