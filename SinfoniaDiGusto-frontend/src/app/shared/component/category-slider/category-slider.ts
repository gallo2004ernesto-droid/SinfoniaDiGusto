// import { Component, ElementRef, output, ViewChild } from '@angular/core';
// import { Category } from '../../../core/model/category.model';

// @Component({
//   imports: [],
//   selector: 'app-category-slider',
//   styleUrl: './category-slider.css',
//   templateUrl: './category-slider.html',
// })
// export class CategorySlider {
//   @ViewChild('sliderContainer') sliderContainer!: ElementRef<HTMLDivElement>;

//   categorySelected = output<string>();

//   categories: Category[] = [
//     { id: '1', name: 'Torte', slug: 'torte', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80' },
//     { id: '2', name: 'Biscotti', slug: 'biscotti', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80' },
//     { id: '3', name: 'Crostate', slug: 'crostate', imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=300&q=80' },
//     { id: '4', name: 'Cornetti', slug: 'cornetti', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=300&q=80' },
//     { id: '5', name: 'Dessert', slug: 'dessert', imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=300&q=80' },
//     { id: '6', name: 'Mignon', slug: 'mignon', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' }
//   ];

//   scrollLeft() : void {
//     this.sliderContainer.nativeElement.scrollBy({left : -220, behavior: 'smooth'});
//   }

//   scrollRight() : void{
//     this.sliderContainer.nativeElement.scrollBy({left : 220, behavior: 'smooth'})
//   }

//   selectCategory(slug: string): void{
//     this.categorySelected.emit(slug);
//   }
  
// }

import { Component, ElementRef, inject, output, ViewChild } from '@angular/core';
import { CategoryStateService } from '../../../core/services/category-state.service'; // Adatta il percorso se necessario

@Component({
  selector: 'app-category-slider',
  standalone: true,
  imports: [],
  styleUrl: './category-slider.css',
  templateUrl: './category-slider.html',
})
export class CategorySlider {
  @ViewChild('sliderContainer') sliderContainer!: ElementRef<HTMLDivElement>;

  categorySelected = output<string>();

  private categoryState = inject(CategoryStateService);
  categories = this.categoryState.categories;

  scrollLeft(): void {
    this.sliderContainer.nativeElement.scrollBy({ left: -220, behavior: 'smooth' });
  }

  scrollRight(): void {
    this.sliderContainer.nativeElement.scrollBy({ left: 220, behavior: 'smooth' });
  }

  // Emette semplicemente il nome della categoria così com'è salvato nel DB
  selectCategory(categoryNameInLowerCase: string): void {
    this.categorySelected.emit(categoryNameInLowerCase);
  }

  getImageUrl(
    imageUrl: string | null | undefined
  ): string {

    if (!imageUrl) {

      return '';
    }

    return `http://localhost:8080${imageUrl}`;
  }
}