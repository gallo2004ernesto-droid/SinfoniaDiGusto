import { Routes } from '@angular/router';
import { ProductsComponent } from './features/public/prodotti/prodotti';
import { ProductDetail } from './features/public/dettaglio-prodotto/dettaglio-prodotto';
import { CheckoutComponent } from './features/public/checkout/checkout';
import { OrderConfermationComponent } from './features/public/checkout/order-confermation';
import { HomeComponent } from './features/public/homepage/homepage';
import { MyOrdersComponent } from './features/public/mieiOrdini/my-orders';
import { AdminHeader } from './shared/component/admin-header/admin-header';
import { Categories } from './features/admin/categories/categories';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { OrderAdmin } from './features/admin/order/order';
import { AdminProfileComponent } from './features/admin/admin-profile/admin-profile';
import { ProductAdminComponent } from './features/admin/product/productComponent';
import { Login } from './features/public/auth/login/login';
import { Registrazione } from './features/public/auth/registrazione/registrazione';
import { ClientManagementComponent } from './features/admin/client/client';

import { adminGuard as AuthAdminGuard} from './core/guard/admin.guard';
import { authGuard as AuthGuard} from './core/guard/auth.guard';
import { BadgeAdminComponent } from './features/admin/badge/badgeComponent';
import { CouponAdminComponent } from './features/admin/coupons/couponsComponent';
import { SearchResultsComponent } from './features/public/ricerca/ricerca';
import { SpedizioniComponent } from './features/public/spedizioni/spedizioniComponent';
import { MetodiPagamentoComponent } from './features/public/metodi-pagamento/metodi-pagamentoComponent';
import { ChiSiamoComponent } from './features/public/chi-siamo/chi-siamo';

export const routes: Routes = [
    // homepage
    {path: '',component: HomeComponent},
    //prodotti
    { path: 'prodotti', component: ProductsComponent },
    { path: 'prodotti/offerte', component: ProductsComponent },
    { path: 'prodotti/:category', component: ProductsComponent },
    { path: 'prodotti/offerte/:category', component: ProductsComponent },

    { path: 'prodotti/offerta/:category/:id', component: ProductDetail },
    { path: 'prodotti/:category/:id', component: ProductDetail },

    {path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard]},
    {path: 'conferma-ordine/:id', component: OrderConfermationComponent, canActivate: [AuthGuard]},

    {path: 'auth/login', component: Login},
    {path: 'auth/registrazione', component: Registrazione},

    // informazioni
    {path: 'spedizioni-consegne', component: SpedizioniComponent},
    {path: 'pagamenti', component: MetodiPagamentoComponent},
    {path: 'chi-siamo', component: ChiSiamoComponent},


    {path: 'i-miei-ordini', component: MyOrdersComponent, canActivate: [AuthGuard]},

    { path: 'cerca', component: SearchResultsComponent },

        //Admin
    {path: 'admin', component:Dashboard, canActivate: [AuthAdminGuard], data: { role: 'ADMIN' }},
    {path: 'admin/categorie', component: Categories, canActivate: [AuthAdminGuard], data: { role: 'ADMIN' }},
    {path: 'admin/prodotti', component: ProductAdminComponent, canActivate: [AuthAdminGuard], data: { role: 'ADMIN' }},
    {path: 'admin/ordini', component: OrderAdmin, canActivate: [AuthAdminGuard], data: { role: 'ADMIN' }},
    {path: 'admin/clienti', component: ClientManagementComponent, canActivate: [AuthAdminGuard], data: { role: 'ADMIN' }},
    {path: 'admin/badge', component: BadgeAdminComponent, canActivate: [AuthAdminGuard], data: {role: 'ADMIN'}},
    {path: 'admin/coupon', component: CouponAdminComponent, canActivate: [AuthAdminGuard], data: {role: 'ADMIN'}},
    {path: 'admin/il-mio-profilo', component: AdminProfileComponent, canActivate: [AuthAdminGuard], data: { role: 'ADMIN' }},

    // fallback
    {path: '**', component: HomeComponent}


    ];
