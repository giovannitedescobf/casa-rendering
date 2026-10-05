---
name: progressivo-lgh
description: Gestisce il Google Sheet "Progressivo LGH 2026" della Lùlù Guest House - registra prenotazioni nel foglio "2026" e fatture Booking nel foglio "Fatture Booking". Usare SEMPRE quando l'utente condivide una prenotazione, un pagamento, una caparra o un saldo (foto, screenshot, testo, vocale) di Airbnb, Booking, Expedia, Bonifico, Contanti, Sum Up, Sito Internet o Satispay, una fattura/PDF di Booking (commissione, cedolare secca, pagamento ricevuto), o chiede di aggiornare il Progressivo LGH.
---

# Progressivo LGH

## Step 0 – Scelta azione (sempre, prima di tutto)
Domanda a scelta singola: **"Che tipologia di dato vuoi inserire?"** → `Progressivo` / `Fatture Booking`
- Progressivo → sezione **AZIONE 1**
- Fatture Booking → sezione **AZIONE 2**

---

# AZIONE 1 – Progressivo (foglio "2026")

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
   Struttura obbligatoria a cascata (max 4 opzioni per domanda):
   - Domanda 1: `Airbnb` / `Booking` / `Expedia` / `Pagamento diretto`
   - Se "Pagamento diretto" → Domanda 2: `Bonifico` / `Sum Up` / `Contanti` / `Altro`
   - Se "Altro" → Domanda 3: `Satispay` / `Sito Internet`
   Per la piattaforma del saldo (caparra 30%) partire direttamente dalla Domanda 2.
2. **Camera** (colonna D): `Il Terrazzino`, `La Floreale`, `Il Focolare` (Il Focolare va sempre proposta anche se non ancora in uso). Se viene scelta **Il Focolare**: NON scrivere, fermarsi e avvisare l'utente che l'etichetta non è ancora valida.
3. **Data di arrivo** (colonna B): se non leggibile, chiederla. Mai lasciarla vuota.
4. **Nome e Cognome** (colonna C): se non leggibile, chiederlo.

## Regole per piattaforma

### A) Airbnb, Booking, Expedia (OTA)
- **F (Tariffa)** = `Lordo − Commissioni − 0,22 × Commissioni − 0,21 × Lordo`, arrotondato a 2 decimali.
  - **Booking**: lo screenshot mostra il totale lordo e **due commissioni** → Commissioni = somma delle due.
  - **Expedia**: lo screenshot dovrebbe mostrare totale lordo e commissioni; usare sempre la formula. Se i dati non sono chiari, chiedere.
  - Se lordo o commissioni non sono leggibili o non sono chiari, chiederli.
- **G** = vuota.
- **H** = data in cui è stata effettuata la prenotazione. Se non ricavabile, chiedere (scelta singola): "Data odierna" / "Altra data" (poi chiedere quale).
- **Mai caparra al 30%**: esclusa in modo categorico. Sempre una sola riga.

### B) Bonifico, Contanti, Sum Up, Sito Internet, Satispay (pagamenti diretti)
- **F (Tariffa)** = importo lordo (nessuna detrazione).
- Chiedere **sempre** (scelta singola): "Applicare caparra 30%?" → Sì / No.
- **Caparra Sì** → due righe consecutive:
  - Importi arrotondati ai centesimi (2 decimali); il saldo = lordo − caparra.
  - Riga 1 (caparra): F = 30% del lordo; E = piattaforma della caparra; G = data caparra; H vuota.
  - Riga 2 (saldo): F = 70% del lordo; E = piattaforma del saldo (può differire dalla caparra: chiederla sempre a scelta singola tra i 5 pagamenti diretti); G vuota; H = data saldo.
  - B, C, D identici nelle due righe.
- **Caparra No** → una riga: F = lordo; chiedere quali date inserire in G e/o H.
- Le date G/H per questi pagamenti vanno **sempre chieste** all'utente.

## Scrittura sul foglio
1. Leggere `2026!A:H` e individuare l'ultima riga compilata nella tabella sinistra (colonne B–H).
2. Scrivere nella **prima riga vuota** successiva (e in quella dopo, se due righe). **Non inserire nuove righe**: solo compilare celle esistenti.
3. **Duplicati**: se esiste già una riga con stesso Nome e Cognome e stessa Data di arrivo, avvisare e chiedere (scelta singola) se procedere.
4. Scrivere solo B–H (mai A). Date nel formato `GG/MM/AAAA`. Importi come numero (es. `57.26`), con `valueInputOption` USER_ENTERED.
5. **Scrivere direttamente**, senza chiedere conferma del riepilogo. Dopo la scrittura mostrare un riepilogo sintetico: range aggiornato, valori inseriti, calcolo di F per le OTA.

---

# AZIONE 2 – Fatture Booking (foglio "Fatture Booking")

## Struttura (tabella unica, intestazioni in riga 1)
| Col | Campo | Pagamenti a Booking | Ricavi di Booking |
|---|---|---|---|
| A | Categoria | `Pagamenti a Booking` | `Ricavi di Booking` |
| B | Tipologia | `Cedolare secca` / `Commissione` | vuota |
| C | Data emissione | data emissione fattura | vuota |
| D | Dal | inizio periodo considerato | inizio periodo considerato |
| E | Al | fine periodo considerato | fine periodo considerato |
| F | Data pagamento | data pagamento | data pagamento |
| G | Importo | **negativo** (es. `-123.45`) | **positivo** |

Nota: "Cedolare secca" = riepilogo pagamento cedolare secca.

## Fonti (scelta automatica, nessuna domanda)
1. **File allegato in chat** (PDF, CSV, Excel) → usare quello.
2. **Screenshot allegato in chat** → usare quello.
3. **Nessun allegato** → leggere le fatture dalla cartella Drive condivisa **Fatture Booking** (proprietario luluguestshouse@gmail.com, ID `1JxNIiYnxy0XvRgyWBhxxzRMWJxK9xTtC`):
   - `Pagamenti DOVUTI a Booking` (ID `1uROpyfIVr08k1-1yFZO3Ma_SsgOn2rgn`) → Categoria = `Pagamenti a Booking`
   - `Pagamenti RICEVUTI da Booking` (ID `1ffIGkYFZKIkx68q3V9MNkT26BQaLCzp0`) → Categoria = `Ricavi di Booking`
   - Elencare i file con `search_files` (`parentId = '<ID>'`) e leggerli con `read_file_content` / `download_file_content`.
   - **Cross-check**: confrontare ogni fattura con le righe già presenti nel foglio `Fatture Booking` (stessa categoria, tipologia, periodo D–E e importo) e inserire **solo quelle mancanti**. Riportare in chat quante fatture sono state trovate, inserite e saltate perché già presenti.
   - Se le cartelle sono vuote o non accessibili, avvisare l'utente.

Più documenti insieme: leggerli e analizzarli tutti; una riga per documento.
Per file da chat o screenshot la categoria si ricava dal contenuto; per i file dal Drive la categoria è data dalla cartella.

## Regole
1. Ricavare dal documento categoria, tipologia, date, periodo e importo.
2. Se categoria o tipologia non sono chiare: domanda a scelta singola (`Pagamenti a Booking` / `Ricavi di Booking`; poi `Cedolare secca` / `Commissione`).
3. Se manca un dato richiesto (es. data pagamento, periodo): **chiederlo** con domanda a scelta singola (es. "Data odierna" / "Altra data"). Mai lasciare vuoti i campi richiesti.
4. Date `GG/MM/AAAA`, importi con 2 decimali, `valueInputOption` USER_ENTERED.

## Scrittura
1. Leggere `'Fatture Booking'!A:G`.
2. Inserire in **ordine cronologico per Data emissione (C)**; per i Ricavi (senza data emissione) usare la Data pagamento (F) come chiave di ordinamento. Inserire una riga nella posizione corretta (insertDimension) e compilarla; se va in fondo, usare la prima riga vuota.
3. Duplicati: se esiste già una riga con stessa categoria, tipologia, periodo (D–E) e importo, avvisare e chiedere (scelta singola) se procedere.
4. Scrivere direttamente; poi mostrare riepilogo sintetico (righe inserite e valori).

---

## Stile risposte
Sintetico e preciso. Nessuna proposta non richiesta.
