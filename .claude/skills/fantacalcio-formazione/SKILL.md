---
name: fantacalcio-formazione
description: Consiglia ogni giornata di Serie A la formazione 3-4-3 (e il modulo alternativo migliore) per la squadra "Hellas Madonna" della lega Fantasanse 2016, incrociando indice di titolarità da Gazzetta, Fantagazzetta (Fantacalcio.it), SOS Fanta e Gianluca Di Marzio e la difficoltà delle partite. Usare quando l'utente chiede formazione, consigli, titolari o modulo per il fantacalcio.
---

# Formazione settimanale – Hellas Madonna (Fantasanse 2016)

Da eseguire ogni settimana PRIMA del calcio d'inizio della prima partita della giornata di Serie A.

## Rosa attuale (aggiornare se l'utente comunica cambi)

| Ruolo | Giocatore | Squadra |
|---|---|---|
| P | Martinez Jo. | Inter |
| P | Di Gennaro | Inter |
| P | Provedel | Inter |
| D | Bernasconi | Atalanta |
| D | Jimenez A. | Fiorentina |
| D | Kaiki | Como |
| D | Lucumì | Juventus |
| D | Spence | Inter |
| D | Tiago Gabriel | Lecce |
| D | Valeri | Parma |
| D | Valle | Como |
| C | Alajbegovic | Juventus |
| C | Conceicao | Juventus |
| C | Ekkelenkamp | Udinese |
| C | Kessié | Atalanta |
| C | McTominay | Napoli |
| C | Moreira | Milan |
| C | Orsolini | Bologna |
| C | Vlasic | Torino |
| A | Beto | Fiorentina |
| A | Camarda | Milan |
| A | Castro S. | Roma |
| A | Esposito Se. | Sassuolo |
| A | Ramos G. | Milan |
| A | Varela G. | Monza |

## Procedura

1. **Calendario**: con WebSearch trova la giornata di Serie A corrente, data/ora della prima partita e gli accoppiamenti (casa/trasferta).
2. **Probabili formazioni** – consulta SEMPRE tutte e quattro le fonti:
   - Gazzetta dello Sport (gazzetta.it – probabili formazioni)
   - Fantagazzetta / Fantacalcio.it (fantacalcio.it/probabili-formazioni-serie-a, con % di titolarità)
   - SOS Fanta (sosfanta.com – probabili formazioni)
   - Gianluca Di Marzio (gianlucadimarzio.com – probabili formazioni)
   Per ogni giocatore della rosa registra: titolare / ballottaggio (con %) / panchina / indisponibile (infortunio, squalifica).
3. **Indice di titolarità (0-100)** = media delle fonti (titolare=100, ballottaggio=% indicata o 50, panchina=10, out=0). Se una fonte non è disponibile, indicalo.
4. **Difficoltà partita (fattore 0,8–1,2)**: valuta classifica, forma recente (ultime 5), casa/trasferta e quote 1X2 se reperibili. Squadra nettamente favorita (es. Juventus vs Lecce) → 1,15–1,2; equilibrata → 1,0; nettamente sfavorita → 0,8–0,85. Per difensori e portiere pesa anche la probabilità di clean sheet; per attaccanti/centrocampisti offensivi la probabilità di gol/assist.
5. **Forma**: considera FVMp (fantamedia) e voti/bonus delle ultime 3 giornate.
6. **Punteggio** = titolarità × fattore partita × forma. Scarta chi ha titolarità < 50.
7. **Formazione 3-4-3 (obbligatoria)**: 1 P, 3 D, 4 C, 3 A col punteggio più alto + panchina ordinata per ruolo.
8. **Modulo preferibile**: confronta 3-4-3 con 3-5-2, 4-3-3, 4-4-2, 4-5-1, 3-4-2-1/5-3-2 se ammessi; indica quello con somma punteggi più alta e se differisce dal 3-4-3.

## Output (sintetico, in italiano)

1. Giornata e orario prima partita.
2. Tabella 3-4-3: Ruolo | Giocatore | Partita (fattore) | Titolarità % per fonte | Nota.
3. Panchina in ordine.
4. Modulo consigliato (una riga di motivazione).
5. Dubbi/ballottaggi da ricontrollare prima della consegna.
6. Fonti con link.
