import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coupon, CouponValidation } from '../model/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/coupons';

  // Solo admin
  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.apiUrl);
  }

  createCoupon(coupon: Coupon): Observable<Coupon> {
    return this.http.post<Coupon>(this.apiUrl, coupon);
  }

  updateCoupon(id: number, coupon: Coupon): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.apiUrl}/${id}`, coupon);
  }

  deleteCoupon(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Checkout: anteprima dello sconto per il carrello corrente
  validateCoupon(
    code: string,
    items: { productId: number; quantity: number }[]
  ): Observable<CouponValidation> {
    return this.http.post<CouponValidation>(`${this.apiUrl}/validate`, { code, items });
  }
}