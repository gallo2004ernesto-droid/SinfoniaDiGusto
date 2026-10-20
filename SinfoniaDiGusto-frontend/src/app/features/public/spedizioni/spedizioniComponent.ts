import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-spedizioni',
  template: `
    <div class="delivery-page">
      <!-- Pulsante Indietro con freccia -->
      <button class="back-btn" (click)="goBack()">
        <span class="arrow">←</span> Torna indietro
      </button>

      <div class="delivery-header">
        <h1>Spedizioni e Consegne</h1>
        <p>Tutti i dettagli sui nostri corrieri, tempi di consegna e tracciamento degli ordini.</p>
      </div>

      <div class="delivery-content">
        <div class="info-card">
          <h2>Tempi di Elaborazione</h2>
          <p>Gli ordini vengono elaborati entro 24-48 ore lavorative dalla ricezione del pagamento. Durante i periodi festivi o promozionali, i tempi potrebbero subire lievi variazioni.</p>
        </div>

        <div class="info-card">
          <h2>Corrieri e Tariffe</h2>
          <p>Affidiamo le nostre spedizioni ai migliori corrieri espressi nazionali. La spedizione standard è gratuita per ordini superiori a 49€.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`

    .delivery-page {
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

    .delivery-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .delivery-header h1 {
      font-size: 2.5rem;
      color: var(--primary-brown);
      margin-bottom: 10px;
    }

    .delivery-header p {
      font-size: 1.1rem;
      color: var(--text-muted);
    }

    .delivery-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .info-card {
      background: var(--announcement-bg);
      border-left: 5px solid var(--accent-pink);
      padding: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(92, 61, 46, 0.05);
    }

    .info-card h2 {
      margin-top: 0;
      color: var(--primary-brown);
      font-size: 1.3rem;
    }

    .info-card p {
      margin-bottom: 0;
      line-height: 1.6;
      color: var(--text-muted);
    }
  `]
})
export class SpedizioniComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  // Metodo per tornare alla pagina precedente dello storico del browser
  goBack(): void {
    this.location.back();
  }
}