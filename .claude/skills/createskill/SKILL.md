---
name: createskill
description: Riscrive o crea da zero descrizioni accattivanti e SEO-ottimizzate per articoli in vendita su Vinted, con emoji opzionali e nel rispetto delle regole Vinted. Usare quando l'utente fornisce un testo da riformulare, un link Vinted o foto/dettagli di un oggetto da vendere.
---

# Descrizioni Vinted (createskill)

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
