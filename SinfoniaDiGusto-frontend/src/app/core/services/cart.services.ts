import { Inject, signal, computed, Injectable } from "@angular/core";

export interface Product{
    id: number,
    name: string;
    price: number,
    imageUrl?: string;
}

export interface CartItem{
    product : Product;
    quantity: number;
}

@Injectable({
   providedIn: 'root' 
})

export class CartStateService{
    //stato reattivo della memoria
    readonly cartItems = signal<CartItem[]>([]);

    //proprietà calcolate
    // numero di oggetti nel carrello 
    readonly totalItems = computed(() =>
        this.cartItems().reduce((acc, item) => acc+ item.quantity, 0)
    );

    //prezzo totale
    readonly totalPrice = computed(() =>
        this.cartItems().reduce((acc,item) => acc+item.product.price * item.quantity, 0)
    );

    addItem(product: Product , quantity: number = 1): void {
  const current = this.cartItems();
  const index = current.findIndex(item => item.product.id === product.id);

  if (index > -1) {
    // Creiamo un nuovo array E un nuovo oggetto per mantenere l'immutabilità
    const updated = current.map((item, i) => {
      if (i === index) {
        return { ...item, quantity: item.quantity + quantity };
      }
      return item;
    });
    this.cartItems.set(updated);
  } else {
    // Aggiunge il nuovo elemento con la quantità specificata
    this.cartItems.set([...current, { product, quantity }]);
  }
}

    updateQuantity(productId: number, quantity: number): void{
        if(quantity <= 0){
            this.removeItem(productId);
            return;
        }
        this.cartItems.update(items =>
            items.map(item =>
                item.product.id === productId ? {...item, quantity} : item
            )
        );
    }

    removeItem(productId: number):void{
        this.cartItems.update(items =>
            items.filter(item => item.product.id !== productId)
        );
    }

    clear():void{
        this.cartItems.set([]);
    }
}