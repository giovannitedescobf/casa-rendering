---
name: documenti-finanziari
description: Gestisce i Google Sheets "AAAA - Documenti Finanziari" (es. "2026 - Documenti Finanziari", "2027 - Documenti Finanziari") nel Drive dell'utente. Usare SEMPRE quando l'utente parla di acquisti o vendite di azioni/ETF/crypto, quantità in portafoglio, "Portafoglio dettagliato", operazioni chiuse, screenshot/foto del broker (Trading 212, Revolut, ecc.), depositi, prelievi, versamenti o tasse da registrare, o chiede di modificare qualsiasi foglio di questi file, anche se non nomina il file.
---

# Documenti Finanziari

Skill per aggiornare i file annuali "AAAA - Documenti Finanziari" su Google Drive tramite i connettori Google Drive e Google Sheets.

## Stile delle risposte

Rispondi solo per punti, brevi, con le sole informazioni fondamentali. Niente spiegazioni non richieste.

## Modalità operativa

**Fase attuale: TEST.** Prima di ogni scrittura mostra un riepilogo (file, foglio, celle, valori vecchi → nuovi) e attendi conferma. Quando l'utente dichiara conclusa la fase di test, questa sezione va cambiata in "AUTONOMIA": si scrive direttamente e si riepiloga dopo.

## Regole inviolabili

1. **Mai toccare lo script (Apps Script).** Le funzioni personalizzate `YF_PRICE`, `YF_PCT`, `YF_DELTA` ecc. vivono nello script: non modificarle, non rinominarle, non tentare di accedere al progetto Apps Script.
2. **Mai sovrascrivere celle con formula** se non per ricopiare la stessa formula su una nuova riga (vedi sotto). Prima di scrivere, leggi le celle di destinazione con `get_spreadsheet` + `includeGridData` e `fields: ["sheets.data.rowData.values.userEnteredValue"]`: se c'è `formulaValue`, non sovrascrivere.
3. **Mai eliminare fogli, file o intere colonne.** Non usare `batch_clear_values` su intervalli che contengono formule o riepiloghi.
4. **Nessun dato inventato.** Se da foto o messaggio manca un valore (quantità, prezzo, data, piattaforma, P/L), chiedilo.
5. Non scrivere il "realizzato" nel foglio "Portafoglio dettagliato".

## Regole concordate con l'utente

- **Dividendi da foto:** se l'utente manda una foto di un dividendo, ricava strumento, data, importo e piattaforma e registralo nel foglio "Dividendi AAAA" seguendone la struttura attuale.
- **Valuta:** per le crypto (ticker `-USD`) prezzi e P/L restano sempre in **dollari**, senza conversione. Per gli altri strumenti usa la valuta già usata nel foglio per quello strumento (di solito €).
- **Commissioni:** includile sempre nel profitto/perdita dell'operazione chiusa (es. guadagno 100 € con 3 € di commissioni → scrivi 97 €). Se non si vedono, chiedile.
- **Piattaforma non indicata:** se messaggio o foto non indicano chiaramente il broker, chiedilo. Non ipotizzarlo.
- **Nuovo anno senza file:** se per l'anno dell'operazione il file "AAAA - Documenti Finanziari" non esiste, segnalalo e fermati. Non creare file in autonomia: se ne crea uno nuovo solo dopo aver chiesto all'utente e averne ricevuto il consenso.

## Privacy — nessuna conservazione dei dati

I dati finanziari dell'utente sono privati. Usali solo per l'operazione richiesta, poi non riutilizzarli.

- Non salvare dati letti dai file, dalle foto o dai messaggi (importi, quantità, prezzi, saldi, ticker posseduti) in memoria, file locali, repository git, artifact, documenti, note o in questa skill.
- Non usare la funzione memoria di Claude per questi dati e non proporre di ricordarli.
- Non condividere i file, non cambiarne i permessi e non inviare dati a servizi esterni diversi da Google Drive/Sheets.
- Leggi solo gli intervalli necessari all'operazione, non interi file.
- In ogni nuova conversazione riparti da zero: rileggi i dati dal file, non da ricordi o riepiloghi di conversazioni precedenti.
- Nelle risposte riporta solo i dati strettamente necessari alla conferma dell'operazione.

## Principio base: tutto può cambiare

Le informazioni sotto sono **esempi rilevati a ottobre 2026**, non regole fisse. Da un anno all'altro, e anche durante l'anno, possono cambiare:
- nomi dei fogli, intestazioni e posizione delle colonne;
- etichette e categorie (es. `DEPOSITO`, `PRELIEVI`, `GAIN`/`LOSS`, `T.H.`), broker e piattaforme (es. `TRADING212`, `REVOLUT`) e i ticker;
- fogli presenti nel file (se ne possono aggiungere o togliere).

Questo vale per **tutti** i fogli: Depositi, Composizione Portafoglio, Portafoglio dettagliato, Operazioni chiuse, Dividendi e qualsiasi altro. Prima di scrivere, ricava sempre etichette, broker e formati attuali **dai dati reali del foglio** (intestazioni e valori già presenti nelle righe recenti), non da questa skill. Se l'utente usa un'etichetta o un broker nuovo, usalo così come lo indica. Se c'è ambiguità, chiedi.

**Fogli con l'anno nel nome:** alcuni fogli contengono l'anno del file (es. `Depositi 2026`/`Depositi 2027`, `Dividendi 2026`/`Dividendi 2027`, `Operazioni chiuse 2026`/`Operazioni chiuse 2027`, `Tasse e Stipendi 2026`/`2027`). Nel file AAAA cerca il foglio con l'anno AAAA. In generale individua il foglio giusto per significato, non per nome esatto.

La skill deve saper lavorare su **qualsiasi foglio** del file, non solo su quelli descritti sotto: per i fogli non descritti applica il metodo della sezione "Altri fogli".

## Passo 0 — Individuare file e struttura (sempre, la struttura può cambiare)

1. Cerca i file: `search_files` con `title contains 'Documenti Finanziari'` (cartella "Documenti finanziari"). Il titolo segue il formato `AAAA - Documenti Finanziari`.
2. Scegli il file in base alla **data dell'operazione** (anno = AAAA). Dal 1° gennaio 2027 si lavora solo sul file 2027. **Non modificare il file 2026 (né quelli precedenti) salvo richiesta esplicita dell'utente.** Ogni file annuale ha (o avrà) il proprio "Portafoglio dettagliato", incluso il 2027. Usa quello del file dell'anno dell'operazione. Solo se in quel file il foglio non esiste ancora, usa quello del file dell'anno precedente e avvisa l'utente.
3. Leggi i nomi dei fogli e **rileggi sempre le intestazioni** e le prime righe del foglio da modificare prima di scrivere. Le mappe sotto sono un riferimento rilevato a ottobre 2026: se le intestazioni non corrispondono, segui le intestazioni reali e segnala la differenza all'utente.
4. Scrivi con `update_values` e `valueInputOption: USER_ENTERED`. Il file usa la localizzazione italiana: separatore decimale `,`, argomenti delle formule separati da `;`, date `gg/mm/aaaa`.

## Fogli principali (esempi rilevati a ottobre 2026: verificare sempre)

Fogli presenti: Depositi AAAA, Valore Portafoglio, Tasse e Stipendi AAAA, Operazioni chiuse AAAA, Dividendi AAAA, Tassazione, Check Valore, Composizione Portafoglio, Portafoglio dettagliato, Calcolo rendimento obbligazione, Operazioni a leva, Fondo Pensione, Salute.

### Portafoglio dettagliato

- Riga 1: intestazioni. Dati da riga 3. Una riga per lotto di acquisto.
- Colonne inserite a mano: **A** Ticker (formato Yahoo Finance, es. `VUAA.MI`, `BTC-USD`), **B** Data (`=DATE(aaaa;m;g)`), **C** Quantità, **D** Prezzo di acquisto.
- Colonne con formula, **solo sulla prima riga di ogni ticker**: E `=SUMIF($A$3:$A$996;An;$C$3:$C$996)`, F `=SUMPRODUCT(($A$3:$A$996=An)*$C$3:$C$996*$D$3:$D$996)/En`, H `=YF_PCT(An)`, I `=YF_DELTA(An)*En`, K `=(YF_PRICE(An)-Fn)/Fn`, L `=(YF_PRICE(An)-Fn)*En`, N `=En*Fn+Ln`. G, J, M vuote.
- Ordinamento: ticker in ordine alfabetico; dentro un ticker, il lotto più recente in alto.

**Acquisto, ticker già presente:** inserisci una riga (`insert_dimension`) sotto la prima riga del gruppo e scrivi solo A–D. Se il nuovo lotto è il più recente, mettilo sotto la prima riga del gruppo e non al suo posto, così le formule restano dove sono.
**Acquisto, nuovo ticker:** inserisci una riga nella posizione alfabetica, scrivi A–D e ricopia le formule E, F, H, I, K, L, N adattate al numero di riga.
**Vendita:** riduci la quantità in C partendo dal lotto **più recente** (LIFO), salvo indicazione diversa dell'utente. Un lotto che arriva a 0 va eliminato, ma se è la prima riga del gruppo sposta prima le sue formule sulla riga successiva dello stesso ticker. Se l'intera posizione è venduta, elimina tutte le righe del ticker (`update_spreadsheet` con `deleteDimension` sulle sole righe del gruppo): lo strumento non deve restare con quantità 0. Nessun "realizzato" qui. Registra sempre la vendita anche in "Operazioni chiuse AAAA". Se non riesci a calcolare il profitto o la perdita, chiedilo all'utente e poi completa la riga.

**Collegamento con "Composizione Portafoglio" e dashboard (fondamentale).** In "Composizione Portafoglio" la colonna D punta direttamente alla cella N della **prima riga** di ogni ticker in "Portafoglio dettagliato" (es. `='Portafoglio dettagliato'!N34`; le crypto USD sono moltiplicate per `GOOGLEFINANCE("CURRENCY:USDEUR")`). Per non rompere questi collegamenti:
- Aggiungi o togli righe **solo** con `insert_dimension` / `deleteDimension` (righe intere), mai spostando valori con copia/incolla di celle: così Google Sheets aggiorna da solo i riferimenti.
- Inserisci i nuovi lotti **sotto** la prima riga del gruppo, mai sopra.
- **Non eliminare mai la prima riga di un gruppo** finché lo strumento resta in portafoglio: farebbe comparire `#REF!` in Composizione. Se il lotto da azzerare è nella prima riga, copia A–D del lotto successivo nella prima riga (le formule restano) ed elimina la riga del lotto successivo.
- **Vendita totale:** prima di eliminare le righe dello strumento, scrivi `0` (formato € → 0,00 €) nella cella D della riga collegata in "Composizione Portafoglio" al posto del riferimento, così non compare `#REF!`. Poi elimina le righe in "Portafoglio dettagliato".
- **Nuovo ticker:** Composizione non lo conterrà. Dopo l'inserimento chiedi all'utente se aggiungerlo in Composizione e con quale Tipologia/Target. Non modificare Target o formule esistenti senza richiesta.
- Dopo ogni modifica rileggi la colonna D di Composizione con `get_values` e verifica che non ci siano `#REF!` o valori a 0 inattesi. Se ci sono, segnalalo subito.

### Operazioni chiuse AAAA

- Riga 2: intestazioni. Dati da riga 3. Colonne: **A** `T.H.` se l'operazione è in perdita (tax harvesting), altrimenti vuota · **B** Data · **C** Ticker · **D** `GAIN`/`LOSS` · **E** Piattaforma (es. `TRADING 212`) · **F** Profitto in € (negativo se perdita) · **G** formula già presente `=IF(Fn<0;"<";Fn*$N$2)`: non toccarla.
- Le colonne da I in poi sono riepiloghi con formule: non toccarle.
- Possono esserci righe già preparate dall'utente con data e ticker ma D/F vuote: è normale. Completale solo quando l'utente manda la foto o lo chiede per quell'operazione. Altrimenti usa la prima riga con B:F vuote.

**Da foto del broker:** estrai ticker, data di chiusura, quantità e P/L in €. Se il P/L è in dollari (es. crypto `-USD`), scrivilo in dollari così com'è, **senza convertirlo in €**. Se il P/L non è visibile, chiedilo. Mostra all'utente i dati letti prima di scrivere (anche in modalità autonomia, se la foto è poco leggibile).

### Depositi AAAA (primo foglio)

- Riga 2: intestazioni. Dati da riga 3. Colonne: **B** Data · **C** Mese (primo giorno del mese della data, formattato mmm-aaaa) · **D** Categoria · **E** Importo in € · **F** Piattaforma.
- Categorie in uso: `DEPOSITO`, `PRELIEVI`, `DEPOSITO TASSE AAAA`, `TASSE AAAA`. I prelievi e le tasse pagate hanno importo **negativo**.
- Piattaforme in uso: `TRADING212`, `REVOLUT`, `COLLECTO`, `FONDO PENSIONE`.
- Accoda dopo l'ultima riga piena in B:F, in ordine di data. Le colonne da H in poi sono riepiloghi: non toccarle.

**Da messaggio vocale:** l'audio arriva come testo trascritto (dettatura). Ricava data (se manca, oggi), tipo, importo e piattaforma. Se un dato è ambiguo, chiedi.

## Altri fogli

Per qualsiasi altro foglio (Dividendi AAAA, Composizione Portafoglio, Valore Portafoglio, Tasse e Stipendi AAAA, Tassazione, Check Valore, Operazioni a leva, Fondo Pensione, Salute, Calcolo rendimento obbligazione o fogli nuovi):
1. leggi intestazioni, alcune righe recenti e le formule (`userEnteredValue`) per capire quali celle sono di input e quali sono calcolate;
2. ricava etichette e formati dalle righe esistenti;
3. scrivi solo nelle celle di input, accodando righe con lo stesso formato delle precedenti e ricopiando le eventuali formule di riga dalla riga sopra;
4. se il foglio è nuovo o non è chiaro come registrare il dato, descrivi all'utente cosa intendi fare e chiedi conferma (anche in modalità autonomia).

## Dopo ogni modifica

Rileggi le celle scritte con `get_values` e conferma all'utente in modo sintetico: file, foglio, righe modificate, valori.
