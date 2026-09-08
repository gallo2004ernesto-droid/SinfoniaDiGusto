import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CartItem } from "./cart.services";

@Injectable({
    providedIn: 'root'
})

export class CartApiSercice{
    private http = inject(HttpClient);
    private apiURL = 'http://localhost:8080/api/cart';

    //Sincronizza il carrello utente con il server Spring boot
    syncCartWithServer(items: CartItem[]): Observable<void>{
        return this.http.post<void>('${this.apiURL/sync}', items)
    }

    //Recupera il carrello salvato per un utente autenticato
    getUserCart(): Observable<CartItem[]>{
        return this.http.get<CartItem[]>(
            this.apiURL
        );
    }


}