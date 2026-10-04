---
name: documenti-finanziari
description: Gestisce i Google Sheets "AAAA - Documenti Finanziari" (es. "2026 - Documenti Finanziari", "2027 - Documenti Finanziari") nel Drive dell'utente. Usare SEMPRE quando l'utente parla di acquisti o vendite di azioni/ETF/crypto, quantità in portafoglio, "Portafoglio dettagliato", operazioni chiuse, screenshot/foto del broker (Trading 212, Revolut, ecc.), depositi, prelievi, versamenti o tasse da registrare, o chiede di modificare qualsiasi foglio di questi file, anche se non nomina il file.
---

# Documenti Finanziari

Skill per aggiornare i file annuali "AAAA - Documenti Finanziari" su Google Drive tramite i connettori Google Drive e Google Sheets.

## Modalità operativa

**Fase attuale: TEST.** Prima di ogni scrittura mostra un riepilogo (file, foglio, celle, valori vecchi → nuovi) e attendi conferma. Quando l'utente dichiara conclusa la fase di test, questa sezione va cambiata in "AUTONOMIA": si scrive direttamente e si riepiloga dopo.

## Regole inviolabili

1. **Mai toccare lo script (Apps Script).** Le funzioni personalizzate `YF_PRICE`, `YF_PCT`, `YF_DELTA` ecc. vivono nello script: non modificarle, non rinominarle, non tentare di accedere al progetto Apps Script.
2. **Mai sovrascrivere celle con formula** se non per ricopiare la stessa formula su una nuova riga (vedi sotto). Prima di scrivere, leggi le celle di destinazione con `get_spreadsheet` + `includeGridData` e `fields: ["sheets.data.rowData.values.userEnteredValue"]`: se c'è `formulaValue`, non sovrascrivere.
3. **Mai eliminare fogli, file o intere colonne.** Non usare `batch_clear_values` su intervalli che contengono formule o riepiloghi.
4. **Nessun dato inventato.** Se da foto o messaggio manca un valore (quantità, prezzo, data, piattaforma, P/L), chiedilo.
5. Non scrivere il "realizzato" nel foglio "Portafoglio dettagliato".

## Passo 0 — Individuare file e struttura (sempre, la struttura può cambiare)

1. Cerca i file: `search_files` con `title contains 'Documenti Finanziari'` (cartella "Documenti finanziari"). Il titolo segue il formato `AAAA - Documenti Finanziari`.
2. Scegli il file in base alla **data dell'operazione** (anno = AAAA). Ogni file annuale ha (o avrà) il proprio "Portafoglio dettagliato", incluso il 2027. Usa quello del file dell'anno dell'operazione. Solo se in quel file il foglio non esiste ancora, usa quello del file dell'anno precedente e avvisa l'utente.
3. Leggi i nomi dei fogli e **rileggi sempre le intestazioni** e le prime righe del foglio da modificare prima di scrivere. Le mappe sotto sono un riferimento rilevato a ottobre 2026: se le intestazioni non corrispondono, segui le intestazioni reali e segnala la differenza all'utente.
4. Scrivi con `update_values` e `valueInputOption: USER_ENTERED`. Il file usa la localizzazione italiana: separatore decimale `,`, argomenti delle formule separati da `;`, date `gg/mm/aaaa`.

## Fogli principali (riferimento ottobre 2026)

Fogli presenti: Depositi AAAA, Valore Portafoglio, Tasse e Stipendi AAAA, Operazioni chiuse AAAA, Dividendi AAAA, Tassazione, Check Valore, Composizione Portafoglio, Portafoglio dettagliato, Calcolo rendimento obbligazione, Operazioni a leva, Fondo Pensione, Salute.

### Portafoglio dettagliato

- Riga 1: intestazioni. Dati da riga 3. Una riga per lotto di acquisto.
- Colonne inserite a mano: **A** Ticker (formato Yahoo Finance, es. `VUAA.MI`, `BTC-USD`), **B** Data (`=DATE(aaaa;m;g)`), **C** Quantità, **D** Prezzo di acquisto.
- Colonne con formula, **solo sulla prima riga di ogni ticker**: E `=SUMIF($A$3:$A$996;An;$C$3:$C$996)`, F `=SUMPRODUCT(($A$3:$A$996=An)*$C$3:$C$996*$D$3:$D$996)/En`, H `=YF_PCT(An)`, I `=YF_DELTA(An)*En`, K `=(YF_PRICE(An)-Fn)/Fn`, L `=(YF_PRICE(An)-Fn)*En`, N `=En*Fn+Ln`. G, J, M vuote.
- Ordinamento: ticker in ordine alfabetico; dentro un ticker, il lotto più recente in alto.

**Acquisto, ticker già presente:** inserisci una riga (`insert_dimension`) sotto la prima riga del gruppo e scrivi solo A–D. Se il nuovo lotto è il più recente, mettilo sotto la prima riga del gruppo e non al suo posto, così le formule restano dove sono.
**Acquisto, nuovo ticker:** inserisci una riga nella posizione alfabetica, scrivi A–D e ricopia le formule E, F, H, I, K, L, N adattate al numero di riga.
**Vendita:** riduci la quantità in C partendo dal lotto più vecchio (FIFO), salvo indicazione diversa dell'utente. Un lotto che arriva a 0 va eliminato, ma se è la prima riga del gruppo sposta prima le sue formule sulla riga successiva dello stesso ticker. Se l'intera posizione è venduta, elimina tutte le righe del ticker (`update_spreadsheet` con `deleteDimension` sulle sole righe del gruppo): lo strumento non deve restare con quantità 0. Nessun "realizzato" qui. Se la vendita chiude un'operazione, registrala anche in "Operazioni chiuse".

### Operazioni chiuse AAAA

- Riga 2: intestazioni. Dati da riga 3. Colonne: **A** `T.H.` se l'operazione è in perdita (tax harvesting), altrimenti vuota · **B** Data · **C** Ticker · **D** `GAIN`/`LOSS` · **E** Piattaforma (es. `TRADING 212`) · **F** Profitto in € (negativo se perdita) · **G** formula già presente `=IF(Fn<0;"<";Fn*$N$2)`: non toccarla.
- Le colonne da I in poi sono riepiloghi con formule: non toccarle.
- Possono esserci righe già preparate con data e ticker ma F vuota: se corrispondono all'operazione, completale. Altrimenti usa la prima riga con B:F vuote.

**Da foto del broker:** estrai ticker, data di chiusura, quantità e P/L in €. Se il P/L è in valuta estera o non è visibile, chiedi. Mostra all'utente i dati letti prima di scrivere (anche in modalità autonomia, se la foto è poco leggibile).

### Depositi AAAA (primo foglio)

- Riga 2: intestazioni. Dati da riga 3. Colonne: **B** Data · **C** Mese (primo giorno del mese della data, formattato mmm-aaaa) · **D** Categoria · **E** Importo in € · **F** Piattaforma.
- Categorie in uso: `DEPOSITO`, `PRELIEVI`, `DEPOSITO TASSE AAAA`, `TASSE AAAA`. I prelievi e le tasse pagate hanno importo **negativo**.
- Piattaforme in uso: `TRADING212`, `REVOLUT`, `COLLECTO`, `FONDO PENSIONE`.
- Accoda dopo l'ultima riga piena in B:F, in ordine di data. Le colonne da H in poi sono riepiloghi: non toccarle.

**Da messaggio vocale:** l'audio arriva come testo trascritto (dettatura). Ricava data (se manca, oggi), tipo, importo e piattaforma. Se un dato è ambiguo, chiedi.

## Altri fogli

Per qualsiasi altro foglio applica lo stesso metodo: rileggi intestazioni e formule, scrivi solo nelle celle di input e accoda righe rispettando il formato delle righe esistenti.

## Dopo ogni modifica

Rileggi le celle scritte con `get_values` e conferma all'utente in modo sintetico: file, foglio, righe modificate, valori.
