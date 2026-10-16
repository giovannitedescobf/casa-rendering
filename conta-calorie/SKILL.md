---
name: conta-calorie
description: Stima le calorie (kcal) di un piatto da una foto, con o senza testo dell'utente su ingredienti e preparazione, oppure stima le kcal di ogni piatto da una foto di un menù (es. al ristorante). Usare SEMPRE quando l'utente invia la foto di un cibo, di un pasto o di un menù e chiede calorie, kcal o "quante calorie ha", anche senza nominare la skill.
---

# Conta calorie

Due modalità:
- **A – Piatto**: foto di cibo (± testo dell'utente).
- **B – Menù**: foto di un menù.

## Regole generali (valgono sempre)

1. **Non fare domande.** Le informazioni fornite dall'utente sono tutte quelle disponibili. Ciò che manca (olio, burro, condimenti, metodo di cottura, porzioni) va stimato in autonomia.
2. **Il testo dell'utente ha priorità** sulla foto: se indica ingredienti, pesi o preparazioni, usali così come sono.
3. **Includi gli ingredienti nascosti** che la preparazione implica, anche se non visibili: olio di cottura/condimento, burro, panna, zucchero, impanatura, pastella, sughi, formaggio grattugiato, olio di frittura assorbito, ecc.
4. **Valori singoli**, mai intervalli. Peso in grammi (g) o millilitri (ml), kcal arrotondate all'intero.
5. **Precisione**: stima i pesi usando riferimenti visivi (dimensione del piatto, posate, mani, confezioni) e porzioni standard italiane da ristorante/casa. Calcola le kcal da valori nutrizionali affidabili (tabelle CREA/BDA italiane; USDA FoodData Central se l'alimento manca) riferiti allo stato in cui è pesato l'alimento (crudo/cotto: dichiaralo nel nome, es. "Pasta (peso cotto)").
6. **Il totale** è la somma esatta delle righe: verificalo prima di rispondere.
7. **Nessun extra**: niente macronutrienti, consigli, commenti sulla dieta, alternative, avvertenze o testo introduttivo. Solo l'output indicato sotto.

## Modalità A – Piatto

Output: una sola tabella.

| Ingrediente | Peso stimato | kcal |
|---|---|---|
| Spaghetti (peso cotto) | 220 g | 348 |
| Olio extravergine d'oliva | 15 ml | 124 |
| ... | ... | ... |
| **Totale** | | **XXX** |

Se nella foto ci sono più piatti, fai una tabella per piatto (titolo = nome del piatto) e poi una riga finale **Totale pasto: XXX kcal**.

## Modalità B – Menù

1. Leggi tutti i piatti del menù (anche in lingua straniera; mantieni il nome come scritto).
2. Per ogni piatto ricostruisci la ricetta tipica e una porzione standard da ristorante, usando la descrizione del menù se presente.
3. Per ogni piatto: titolo con il nome del piatto, poi una tabella come nella Modalità A (una riga per ingrediente, ingredienti nascosti inclusi, riga **Totale**).
4. Mantieni l'ordine e le sezioni del menù. Escludi bevande solo se il menù non ne riporta il contenuto (es. "bevande varie"); altrimenti stimale.

Nessun altro testo oltre ai titoli dei piatti e alle tabelle.
