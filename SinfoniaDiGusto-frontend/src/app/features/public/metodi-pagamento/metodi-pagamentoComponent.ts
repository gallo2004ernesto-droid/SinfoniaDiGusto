import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-metodi-pagamento',
  template: `
    <div class="payment-page">
      <!-- Pulsante Indietro con freccia -->
      <button class="back-btn" (click)="goBack()">
        <span class="arrow">←</span> Torna indietro
      </button>

      <div class="payment-header">
        <h1>Metodi di Pagamento Accettati</h1>
        <p>Scegli la modalità di pagamento che preferisci in tutta sicurezza durante il checkout.</p>
      </div>

      <div class="payment-content">
        <!-- Carta di Credito / Debito -->
        <div class="payment-card-info">
          <div class="card-icon">
            <i class="fa-regular fa-credit-card"></i>
          </div>
          <div class="card-details">
            <h2>Carta di Credito / Debito</h2>
            <p>Accettiamo tutte le principali carte di credito e debito (Visa, MasterCard, American Express, Maestro). Le transazioni sono protette dai più avanzati sistemi di crittografia e sicurezza bancaria per garantirti un acquisto senza pensieri.</p>
          </div>
        </div>

        <!-- PayPal -->
        <div class="payment-card-info">
          <div class="card-icon">
            <i class="fa-brands fa-paypal"></i>
          </div>
          <div class="card-details">
            <h2>PayPal</h2>
            <p>Paga in modo rapido e sicuro con il tuo conto PayPal o utilizzando una carta collegata, senza dover condividere i tuoi dati finanziari con il negozio. Hai inoltre accesso alla protezione acquisti PayPal.</p>
          </div>
        </div>

        <!-- Contanti alla Consegna -->
        <div class="payment-card-info">
          <div class="card-icon">
            <i class="fa-solid fa-hand-holding-dollar"></i>
          </div>
          <div class="card-details">
            <h2>Contanti alla Consegna</h2>
            <p>Se preferisci, puoi pagare comodamente in contanti direttamente al corriere al momento della ricezione dell'ordine. Si consiglia di preparare l'importo esatto per facilitare le operazioni di consegna.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Definizione della palette colori del progetto */
    :host {
      --primary-brown: #5c3d2e;     /* Marrone cioccolato fondente tenue */
      --secondary-brown: #966f57;   /* Tonalità biscotto dorato per hover */
      --cream-bg: #fffbf7;         /* Sfondo panna/crema calda */
      --announcement-bg: #f7ede2;   /* Tonalità crema pasticcera delicata */
      --accent-pink: #f08080;       /* Rosa lampone / fragola per accenti */
      --text-muted: #8d7b71;        /* Nocciola chiaro per testi secondari */
    }

    .payment-page {
      max-width: 900px;
      margin: 40px auto;
      padding: 0 20px;
      font-family: Arial, sans-serif;
      background-color: var(--cream-bg);
      color: var(--primary-brown);
    }

    /* Stile del pulsante Indietro */
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: var(--announcement-bg);
      color: var(--primary-brown);
      border: 1px solid var(--secondary-brown);
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 25px;
      transition: background-color 0.2s, color 0.2s;
    }

    .back-btn:hover {
      background-color: var(--secondary-brown);
      color: #ffffff;
    }

    .arrow {
      font-size: 1.2rem;
      line-height: 1;
    }

    .payment-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .payment-header h1 {
      font-size: 2.5rem;
      color: var(--primary-brown);
      margin-bottom: 10px;
    }

    .payment-header p {
      font-size: 1.1rem;
      color: var(--text-muted);
    }

    .payment-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .payment-card-info {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      background: var(--announcement-bg);
      border-left: 5px solid var(--accent-pink);
      padding: 24px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(92, 61, 46, 0.05);
    }

    .card-icon {
      font-size: 2rem;
      color: var(--primary-brown);
      min-width: 50px;
      text-align: center;
      padding-top: 4px;
    }

    .card-details h2 {
      margin-top: 0;
      margin-bottom: 8px;
      color: var(--primary-brown);
      font-size: 1.3rem;
    }

    .card-details p {
      margin: 0;
      line-height: 1.6;
      color: var(--text-muted);
    }
  `]
})
export class MetodiPagamentoComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  // Metodo per tornare alla pagina precedente
  goBack(): void {
    this.location.back();
  }
}