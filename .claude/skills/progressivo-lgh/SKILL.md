---
name: progressivo-lgh
description: Registra le prenotazioni della Lùlù Guest House nel Google Sheet "Progressivo LGH 2026" (foglio "2026"). Usare SEMPRE quando l'utente condivide una prenotazione, un pagamento, una caparra o un saldo (foto, screenshot, testo, vocale) di Airbnb, Booking, Expedia, Bonifico, Contanti, Sum Up, Sito Internet o Satispay, o chiede di aggiornare il Progressivo LGH.
---

# Progressivo LGH – Registrazione prenotazioni

## File
- Google Sheet: **Progressivo LGH 2026**
- ID: `1pRvkxGNGm9npxez7DYLj1xALcDmfGAV8i4YJtoQfoGQ`
- Foglio: `2026` (tabella sinistra, colonne A–H)

| Col | Campo | Chi compila |
|---|---|---|
| A | Netto/Lordo | **NON toccare** (automatica) |
| B | Data di arrivo | Claude – mai vuota |
| C | Nome e Cognome | Claude |
| D | Camera | Claude |
| E | Piattaforma | Claude |
| F | Tariffa | Claude |
| G | Data caparra | Claude (vedi regole) |
| H | Data saldo | Claude (vedi regole) |

## Input
L'utente può fornire qualsiasi formato: foto, screenshot, testo, messaggio vocale. Estrarre tutto il possibile; chiedere solo ciò che manca.

## Domande
Ogni domanda è **a scelta singola** (tool di domande con opzioni). Fare la domanda solo se il dato non è ricavabile dall'input.

1. **Piattaforma** (valori esatti per colonna E): `Airbnb`, `Booking`, `Expedia`, `Bonifico`, `Contanti`, `Sum Up`, `Sito Internet`, `Satispay`.
   Se il tool consente max 4 opzioni: prima chiedere "OTA (Airbnb/Booking/Expedia)" vs "Pagamento diretto", poi la piattaforma specifica.
2. **Camera** (colonna D): `Il Terrazzino`, `La Floreale`, `Il Focolare` (Il Focolare va sempre proposta anche se non ancora in uso).
3. **Data di arrivo** (colonna B): se non leggibile, chiederla. Mai lasciarla vuota.
4. **Nome e Cognome** (colonna C): se non leggibile, chiederlo.

## Regole per piattaforma

### A) Airbnb, Booking, Expedia (OTA)
- **F (Tariffa)** = `Lordo − Commissioni − 0,22 × Commissioni − 0,21 × Lordo`, arrotondato a 2 decimali.
  Se lordo o commissioni non sono leggibili, chiederli.
- **G** = vuota.
- **H** = data in cui è stata effettuata la prenotazione. Se non ricavabile, chiedere (scelta singola): "Data odierna" / "Altra data" (poi chiedere quale).
- **Mai caparra al 30%**: esclusa in modo categorico. Sempre una sola riga.

### B) Bonifico, Contanti, Sum Up, Sito Internet, Satispay (pagamenti diretti)
- **F (Tariffa)** = importo lordo (nessuna detrazione).
- Chiedere **sempre** (scelta singola): "Applicare caparra 30%?" → Sì / No.
- **Caparra Sì** → due righe consecutive:
  - Riga 1 (caparra): F = 30% del lordo; E = piattaforma della caparra; G = data caparra; H vuota.
  - Riga 2 (saldo): F = 70% del lordo; E = piattaforma del saldo (può differire dalla caparra: chiederla sempre a scelta singola tra i 5 pagamenti diretti); G vuota; H = data saldo.
  - B, C, D identici nelle due righe.
- **Caparra No** → una riga: F = lordo; chiedere quali date inserire in G e/o H.
- Le date G/H per questi pagamenti vanno **sempre chieste** all'utente.

## Scrittura sul foglio
1. Leggere `2026!A:H` e individuare l'ultima riga compilata nella tabella sinistra (colonne B–H).
2. Scrivere nella **prima riga vuota** successiva (e in quella dopo, se due righe). **Non inserire nuove righe**: solo compilare celle esistenti.
3. Scrivere solo B–H (mai A). Date nel formato `GG/MM/AAAA`. Importi come numero (es. `57.26`), con `valueInputOption` USER_ENTERED.
4. Prima di scrivere, mostrare un riepilogo sintetico (riga, valori, calcolo F per OTA). Dopo la scrittura, confermare con il range aggiornato.

## Stile risposte
Sintetico e preciso. Nessuna proposta non richiesta.
