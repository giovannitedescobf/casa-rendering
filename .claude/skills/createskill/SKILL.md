---
name: createskill
description: Ottimizza annunci Vinted - riscrive o crea descrizioni accattivanti e SEO-ottimizzate (con emoji) e/o migliora le foto del prodotto con Claude Design (luce, contrasto, ritaglio 3:4, sfondo), nel rispetto delle regole Vinted. Usare quando l'utente fornisce un testo, un link Vinted o foto di un oggetto da vendere.
---

# Annunci Vinted (createskill)

## Step 0 - Domanda iniziale (OBBLIGATORIA)
Prima di qualsiasi lavoro, fai SEMPRE una domanda a scelta singola (usa lo strumento di domanda a scelta multipla se disponibile):
**Cosa vuoi fare?**
1. Modificare solo la descrizione → esegui la Parte A
2. Modificare solo le foto del prodotto → esegui la Parte B
3. Modificare la descrizione e le foto del prodotto → esegui la Parte A, poi la Parte B

Se l'opzione richiede foto e non sono allegate, chiedile.

# Parte A - Descrizione

## Input possibili
1. **Testo in chat** → riformulalo.
2. **Link Vinted** → apri SEMPRE il link con il browser/web fetch (WebFetch o browser disponibile), leggi titolo, descrizione, brand, taglia, condizioni, categoria, prezzo; poi riformula.
3. **Foto + note** → analizza le foto (brand, colore, materiale, taglia da etichetta, difetti visibili) e crea da zero.

Se mancano dati essenziali (taglia, condizioni, brand) e non sono deducibili, chiedili in una sola domanda sintetica.

## Regole Vinted (fonti ufficiali: vinted.com/catalog-rules, help/307, help/62)
- Vietato "simile a", "ispirato a", "tipo", "replica" + nome brand, sia nel campo brand sia nella descrizione.
- Vietati brand o hashtag non pertinenti all'articolo.
- Vietato ingannare su condizioni, origine, brand, autenticità, taglia; segnala sempre i difetti.
- Niente annunci duplicati: per più pezzi uguali, un solo annuncio con "disponibili 2+ pezzi" in descrizione.
- Niente foto prese da altri siti o stock.
- Prudenziale (non confermato nelle fonti consultate): niente contatti esterni, link o pagamenti fuori piattaforma.
- Condizioni con i nomi Vinted: Nuovo con cartellino, Nuovo senza cartellino, Ottime, Buone, Discrete.

## SEO Vinted
- Le parole chiave più importanti (brand, tipo articolo, colore, taglia) nel **titolo** e nella **prima riga** della descrizione.
- Usa sinonimi naturali che gli utenti cercano (es. "felpa / hoodie", "jeans / denim").
- Titolo specifico, mai generico ("Bel vestito" no): marca + tipo capo + caratteristica + uomo/donna.
- Hashtag finali: 3–6, solo pertinenti allo stile/articolo (es. #vintage #anni90).
- Su richiesta: aggiungere traduzione breve in inglese/francese per acquirenti esteri.

## Output (formato fisso)
**Titolo** (max ~60 caratteri): Brand + Articolo + Dettaglio chiave + Taglia

**Descrizione:**
```
[Emoji] Hook di 1 riga con brand, articolo, colore
✨ Condizioni: ...
📏 Taglia: ... (+ misure se disponibili)
🧵 Materiale: ...
🎨 Colore: ...
💡 Perché sceglierlo / abbinamenti (1-2 righe)
⚠️ Difetti: ... (se presenti)
📦 Spedizione rapida e imballo curato
#hashtag #hashtag #hashtag
```
- Emoji: usale con moderazione (una per riga max); omettile se l'utente lo chiede.
- Lingua: italiano, salvo diversa richiesta. Tono amichevole, frasi brevi.
- Nessun commento extra oltre a titolo e descrizione, salvo richiesta.

# Parte B - Foto del prodotto

## Strumento
Usa SEMPRE **Claude Design** per le modifiche (mai Canva, salvo richiesta esplicita). Se Claude Design non è disponibile, dillo e usa elaborazione immagini locale (es. Python/Pillow) per luce, contrasto e ritaglio.

## Interventi
- **Formato:** verticale **3:4** (es. 1200×1600 px), prodotto centrato e ben riempito, margini uniformi.
- **Luce e colore:** luminosità, contrasto, bilanciamento del bianco, nitidezza; colori fedeli al reale.
- **Ritaglio:** elimina elementi di disturbo, raddrizza l'inquadratura.
- **Interventi AI ammessi:** pulizia o sostituzione dello sfondo (neutro chiaro o ambientato coerente), rimozione di oggetti estranei, ombre morbide, miglioramento della resa generale.

## Regola anti-inganno (inderogabile)
Vinted vieta di ingannare su condizioni, brand, autenticità o caratteristiche (vinted.com/catalog-rules) e vieta foto prese da altri siti o stock (vinted.com/help/62). Quindi:
- NON nascondere o ritoccare difetti, usura, macchie, pilling.
- NON cambiare colore, forma, taglia apparente, materiale o loghi del prodotto.
- NON generare il prodotto da zero né usare immagini stock: si parte sempre dalle foto dell'utente.
- Se un difetto è visibile, mantienilo e indicalo nella descrizione.

## Testo sulle foto
- Di default **nessun testo**.
- Se aggiunto: font unico e sempre lo stesso per tutte le foto e tutte le volte: **Playfair Display** (elegante), colore bianco o nero in base allo sfondo, testo breve (es. brand / taglia), posizione coerente tra le foto.
- Mai contatti, link o prezzi nelle foto.

## Output
- Restituisci le foto modificate come **file immagine direttamente in chat** (JPG, 3:4), nominate in ordine (foto-1.jpg, foto-2.jpg, ...).
- Suggerisci l'ordine: la prima foto è la copertina (prodotto intero, sfondo pulito).
- Elenca in una riga per foto le modifiche fatte.
