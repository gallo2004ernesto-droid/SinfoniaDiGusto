import { Component, OnInit } from '@angular/core';
import { Header } from '../../../shared/component/header/header';
import { Footer } from '../../../shared/component/footer/footer';

@Component({
  selector: 'app-chi-siamo',
  imports : [Header, Footer],
  template: `
  <app-header></app-header>
    <div class="about-wrapper">
      
      <!-- Section Hero con Immagine di Sfondo -->
      <section class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <span class="hero-badge">Sinfonia di Gusto</span>
          <h1>L'Arte dell'Autenticità</h1>
          <p>La passione per l'eccellenza enogastronomica e i sapori artigianali portati direttamente a casa tua.</p>
        </div>
      </section>

      <!-- Section Storia & Immagine Integrata -->
      <section class="story-section">
        <div class="story-grid">
          <div class="story-text">
            <h2>La Nostra Storia</h2>
            <div class="divider-line"></div>
            <p>
              <strong>Sinfonia di Gusto</strong> nasce dal desiderio profondo di riscoprire e valorizzare le tradizioni più autentiche del nostro territorio. 
              Ogni prodotto selezionato nel nostro catalogo racconta un viaggio fatto di dedizione, rispetto per la terra e lavorazioni tramandate di generazione in generazione.
            </p>
            <p>
              Crediamo fermamente che il buon cibo non sia semplicemente nutrimento, ma una vera ed propria esperienza sensoriale capace di unire le persone attorno alla stessa tavola.
            </p>
          </div>
          <div class="story-image-box">
            <img 
              src="hero.png" 
              alt="Prodotti artigianali di qualità" 
              class="story-img"
            />
          </div>
        </div>
      </section>

      <!-- Section Statistiche / Numeri CHIAVE -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">100%</span>
            <span class="stat-label">Artigianale</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">50+</span>
            <span class="stat-label">Produttori Locali</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">24/48h</span>
            <span class="stat-label">Consegna Fresca</span>
          </div>
        </div>
      </section>

      <!-- Section Valori / Card a Griglia -->
      <section class="values-section">
        <div class="section-title">
          <h2>I Nostri Valori Guida</h2>
          <p>Ciò che rende unica la nostra proposta ogni singolo giorno.</p>
        </div>

        <div class="values-grid">
          <div class="value-card">
            <div class="card-icon">
              <i class="fa-solid fa-seedling"></i>
            </div>
            <h3>Materie Prime Pure</h3>
            <p>Selezioniamo rigorosamente ingredienti naturali, senza conservanti artificiali o compromessi sulla qualità finale.</p>
          </div>

          <div class="value-card">
            <div class="card-icon">
              <i class="fa-solid fa-heart"></i>
            </div>
            <h3>Amore per la Tradizione</h3>
            <p>Custodiamo le ricette storiche e le metodologie tradizionali per garantirti sempre un sapore genuino e inimitabile.</p>
          </div>

          <div class="value-card">
            <div class="card-icon">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h3>Filiera Certificata</h3>
            <p>Massima trasparenza dal produttore alla tua tavola: conosciamo ogni singola realtà con cui collaboriamo.</p>
          </div>
        </div>
      </section>

    </div>
    <app-footer></app-footer>
  `,
  styles: [`

    .about-wrapper {
      background-color: var(--cream-bg);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: var(--primary-brown);
      overflow-x: hidden;
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      height: 380px;
      background-image: url('/chi-siamo.jpg');
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0 20px;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(44, 26, 18, 0.65);
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 800px;
      color: #ffffff;
    }

    .hero-badge {
      display: inline-block;
      background-color: var(--accent-pink);
      color: #ffffff;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 15px;
    }

    .hero-content h1 {
      font-size: 3rem;
      font-weight: 800;
      margin: 0 0 15px 0;
    }

    .hero-content p {
      font-size: 1.2rem;
      opacity: 0.95;
      margin: 0;
      line-height: 1.6;
    }

    /* Story Section */
    .story-section {
      max-width: 1140px;
      margin: 70px auto;
      padding: 0 20px;
    }

    .story-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 50px;
      align-items: center;
    }

    .story-text h2 {
      font-size: 2.2rem;
      color: var(--primary-brown);
      margin: 0 0 10px 0;
    }

    .divider-line {
      width: 60px;
      height: 4px;
      background-color: var(--accent-pink);
      border-radius: 2px;
      margin-bottom: 20px;
    }

    .story-text p {
      font-size: 1.05rem;
      line-height: 1.8;
      color: var(--text-muted);
      margin-bottom: 15px;
    }

    .story-img {
      width: 100%;
      height: 380px;
      object-fit: cover;
      border-radius: 16px;
      box-shadow: 0 12px 30px rgba(92, 61, 46, 0.15);
    }

    /* Stats Section */
    .stats-section {
      background-color: var(--announcement-bg);
      padding: 45px 20px;
      margin-bottom: 70px;
    }

    .stats-grid {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-wrap: wrap;
      gap: 30px;
    }

    .stat-card {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2.8rem;
      font-weight: 800;
      color: var(--primary-brown);
    }

    .stat-label {
      font-size: 1rem;
      font-weight: 600;
      color: var(--secondary-brown);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Values Section */
    .values-section {
      max-width: 1140px;
      margin: 0 auto 80px auto;
      padding: 0 20px;
    }

    .section-title {
      text-align: center;
      margin-bottom: 50px;
    }

    .section-title h2 {
      font-size: 2.2rem;
      color: var(--primary-brown);
      margin: 0 0 10px 0;
    }

    .section-title p {
      color: var(--text-muted);
      font-size: 1.1rem;
      margin: 0;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
    }

    .value-card {
      background: #ffffff;
      padding: 35px 25px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid var(--announcement-bg);
      box-shadow: 0 6px 18px rgba(92, 61, 46, 0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .value-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 25px rgba(92, 61, 46, 0.12);
    }

    .card-icon {
      width: 60px;
      height: 60px;
      background-color: var(--announcement-bg);
      color: var(--accent-pink);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin: 0 auto 20px auto;
    }

    .value-card h3 {
      font-size: 1.3rem;
      color: var(--primary-brown);
      margin-bottom: 12px;
    }

    .value-card p {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text-muted);
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 900px) {
      .story-grid, .values-grid {
        grid-template-columns: 1fr;
      }
      .hero-content h1 {
        font-size: 2.2rem;
      }
    }
  `]
})
export class ChiSiamoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

}