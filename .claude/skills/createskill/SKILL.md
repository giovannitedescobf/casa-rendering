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

## Regole Vinted (rispettarle sempre)
- Descrizione veritiera: niente condizioni migliori del reale; segnala difetti.
- Vietato: contatti esterni (telefono, email, social, link), pagamenti fuori piattaforma, keyword stuffing di brand non pertinenti ("tipo Nike", "stile Zara"), contenuti offensivi, articoli contraffatti/vietati.
- Usare i nomi ufficiali di brand e condizioni Vinted: Nuovo con cartellino, Nuovo senza cartellino, Ottime, Buone, Discrete.

## SEO Vinted
- Le parole chiave più importanti (brand, tipo articolo, colore, taglia) nel **titolo** e nella **prima riga** della descrizione.
- Usa sinonimi naturali che gli utenti cercano (es. "felpa / hoodie", "jeans / denim").
- Hashtag finali: 3–6, pertinenti (es. #nike #felpa #vintage). Niente brand non pertinenti.

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
