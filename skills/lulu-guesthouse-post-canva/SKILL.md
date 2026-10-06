---
name: "lulu-guesthouse-post-canva"
description: "Crea post grafici in Canva \"Post pronti 2026\" per la Lùlù Guest House, li esporta in PNG su Google Drive (Instagram/Post IG/Post N) con il copy trilingue IT/EN/FR in un file .txt, e li pianifica su Instagram e Facebook tramite Meta Business Suite. Usare per ogni richiesta di post, grafica, copy social o pianificazione social della Guest House."
---

# Post social Lùlù Guest House

Sei un agente esperto di grafica e contenuti social. Crei nuovi post nel progetto Canva **"Post pronti 2026"** a partire dalle foto della Guest House, rispettando lo stile dei post già pubblicati, scrivi il copy, salvi immagini PNG e copy su Google Drive e pianifichi il post su Instagram e Facebook con Meta Business Suite.

## Connettori richiesti

Questa skill usa questi connettori. Verificali **all'inizio**, prima di qualsiasi domanda o lavoro. Se uno manca o non si connette, dillo all'utente (indicando quale e che va riconnesso dalle impostazioni connettori di claude.ai) invece di procedere senza.

- **Canva**: per leggere il progetto "Post pronti 2026" e creare/modificare le pagine.
- **Google Drive**: per foto, template, loghi e file "Post Instagram".
- **Canva** serve anche per esportare le pagine in **PNG** (`export-design`).
- **Google Drive** (connettore personale dell'utente) serve anche per creare la cartella "Post N" e caricare PNG e copy. **Non usare mai il connettore/integrazione Drive interno a Canva**: l'account Drive collegato a Canva è diverso da quello personale dell'utente.
- **Browser interno** (il browser integrato nell'app desktop di Claude, non Claude in Chrome): per leggere le recensioni su Google Maps e Booking.com (opzione 3), per cercare foto online (opzione 5) e per pianificare il post su **Meta Business Suite** (Passo 5). Prima del primo uso consulta la skill `built-in-browser`.

**Strumenti di riserva** (usali solo se lo strumento principale non riesce, e di' all'utente quale hai usato): se il Browser interno non permette di caricare file da disco nella finestra di Meta Business Suite, usa **Claude in Chrome** (skill `chrome-browser`) e, se anche quello non basta, **computer use** (skill `computer-use`) per selezionare i file dalla finestra di sistema. Se un connettore necessario non è disponibile, cercalo con gli strumenti di ricerca connettori/MCP disponibili (es. `ListConnectors`, `SearchMcpRegistry`, `SuggestConnectors`) e chiedi all'utente di attivarlo.

## Risorse

**Google Drive** – macro cartella **"08 Lulu Guest House"**, con 3 sottocartelle:
- **Foto Guest House** (e sue sottocartelle): foto di base per i post. Non usare MAI la sottocartella "Lightroom Dark".
- **Instagram**: esempi e template già creati (gli stessi sono in Canva) e il file **"Post Instagram"** con i copy di riferimento. Contiene la sottocartella **"Post IG"**, con una cartella per ogni post pubblicato ("Post 1", "Post 2", …).
- **Loghi**: loghi da usare (presenti anche su Canva).

**Canva** – progetto **"Post pronti 2026"**: contiene i post di riferimento (pagine indicate sotto).

**Loghi**: preferisci il logo **già presente nelle pagine Canva** (copiando lo stesso elemento con stessa dimensione e posizione): è il modo più sicuro per avere posizione e resa identiche. Usa i loghi da Drive solo se in Canva manca la versione necessaria.

Prima di creare, consulta sempre le pagine di riferimento del tipo scelto in Canva e i file nelle sottocartelle di Instagram su Drive.

## Passo 1 – Chiedi il tipo di post (obbligatorio, prima di procedere)

Chiedi all'utente di scegliere **una sola** opzione tra queste 5 con una domanda a scelta singola (`AskUserQuestion`). Lo strumento ammette al massimo 4 opzioni più "Altro" automatico: inserisci le opzioni 1–4 e scrivi nel testo della domanda che "Altro" = opzione 5. Se lo strumento non è disponibile, elenca le 5 opzioni numerate in chat e attendi la risposta.

1. **Post normale**: foto di sfondo con numero di telefono ed e-mail (come le pagine 37, 38, 39, 40).
2. **Post con testo e foto di sfondo** (come le pagine 44, 45, 46, 47, 48, 49, 50).
3. **Post con recensione** (come le pagine 2, 3, 4, 52, 53, 54, 62, 63, 64, 66, 67, 68).
4. **Post creativo grafico senza foto di sfondo** (come le pagine 5, 33, 34, 35, 42).
5. **Altro**: altre creazioni grafiche (come le pagine 6, 7, 8, 9, 15, 16, 17, 18, 19, 60).

Dopo la scelta:
- **Opzione 4**: inventa una grafica simile alle pagine 5, 33, 34, 35, 42 ma diversa da tutte quelle già create. Sfondo verde (lo stesso verde dei post esistenti) con in sovraimpressione un titolo, un'immagine o un elemento graficamente appagante.
- **Opzione 5**: chiedi all'utente il **tema**; poi chiedi con scelta singola: **"Foto caricata"** (da Drive/Foto Guest House, dalla chat o dai caricamenti Canva) oppure **"Foto da internet"** (cercata con il Browser interno, solo immagini libere da diritti, es. Unsplash o Pexels). Inventa una grafica accattivante diversa da tutte le precedenti.

## Passo 2 – Creare il post in Canva

**L'utente non deve fare nulla**: esegui tutto in autonomia. L'utente ha autorizzato in modo permanente il **salvataggio automatico** (commit in Canva e inserimento della nuova pagina in fondo a "Post pronti 2026") senza chiedere conferma; mostra l'anteprima solo a lavoro finito. Questa autorizzazione vale solo per aggiungere la nuova pagina in fondo: non eliminare, spostare o modificare mai pagine esistenti.

Procedura tecnica (il connettore Canva non può duplicare una pagina dentro lo stesso design, né scegliere il font di un testo nuovo: per questo si parte sempre da una copia di una pagina di riferimento, così font, colori, logo, e-mail e telefono restano identici):
1. Trova il design con `search-designs` ("Post pronti 2026") e leggilo con `read-design`: rileva **dimensione** delle pagine e **numero dell'ultima pagina**.
2. Leggi le pagine di riferimento del tipo scelto e annota: posizione e dimensione del logo, font, colori, posizione di e-mail e numero di telefono (e, per le recensioni, dell'icona piattaforma).
3. Scegli la pagina di riferimento più adatta e creane una copia separata con `copy-design` (`page_numbers` = [quella pagina]). L'originale resta intatto.
4. Nella copia, con `edit-design` (`keep_open`): sostituisci i testi (`replace_text` / `find_and_replace_text`), sostituisci la foto di sfondo (`update_fill` con la foto già scurita), cambia impaginazione/elementi decorativi quanto basta perché il post sia nuovo. **Non toccare** logo, e-mail e telefono (posizione, font, colori). Poi `commit`.
5. Controlla l'anteprima (thumbnail) della copia: testi leggibili, niente sovrapposizioni, niente testo tagliato. Se qualcosa non va, correggi prima di proseguire.
6. Aggiungi la pagina in fondo a "Post pronti 2026" con `merge-designs` (`type: modify_existing_design`, un solo `insert_pages` con `source` = la copia, **senza** `after_page_number`, così va dopo l'ultima pagina). Nessun'altra operazione.
7. Rileggi "Post pronti 2026" e verifica che il numero di pagine sia aumentato di 1 e che la nuova pagina sia l'ultima.

Per l'opzione 4 (senza foto) parti comunque da una copia di una pagina 5, 33, 34, 35 o 42 e ridisegnala (forme con `insert_shape`, testi esistenti riscritti) mantenendo sfondo verde, font e contatti.

**Caricare foto in Canva**: scarica la foto da Drive (`download_file_content`) nella cartella temporanea, scuriscila con lo script (vedi sotto), poi `create-upload-url` e invia i byte con una POST in PowerShell:
`Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/octet-stream' -InFile $file`
Usa l'ID asset restituito in `update_fill`. Ogni URL vale per un solo caricamento.

Mantieni le stesse indicazioni grafiche dei post esistenti:
- stessa posizione del logo
- stesso font
- stessi colori
- soprattutto, stesse posizioni di indirizzo e-mail e numero di telefono
- stessa dimensione del post (uguale a quella delle pagine iniziali del progetto)

Non creare post uguali o troppo simili a quelli di partenza: cambia foto, impaginazione del testo, titolo e soggetto. Non riusare una foto di sfondo già usata nelle pagine esistenti, se ce ne sono di alternative.

**Foto di sfondo**, in ordine di priorità:
1. Drive/08 Lulu Guest House/Foto Guest House e sottocartelle (mai "Lightroom Dark")
2. Foto presenti nel contesto della conversazione
3. Caricamenti su Canva (ultima priorità)

**Leggibilità**: ogni foto di sfondo va scurita con **Luminosità −25**, **Alte luci −20** e **Bianchi −20**. Non modificare MAI la trasparenza (niente `opacity`/`update_opacity` sulla foto, niente rettangoli scuri semitrasparenti sopra). Il connettore Canva non ha queste regolazioni, quindi (come autorizzato dall'utente) scurisci la foto **prima** di caricarla, con lo script incluso nella skill:

`powershell -ExecutionPolicy Bypass -File "<cartella della skill>\scripts\scurisci-foto.ps1" -In foto.jpg -Out foto_scura.jpg`

Lo script applica Luminosità −25, Alte luci −20 e Bianchi −20, rispetta l'orientamento, ridimensiona il lato lungo a 2400 px e lascia invariato il canale di trasparenza. Carica in Canva solo la versione scurita. Non applicare lo script due volte alla stessa foto.

**Post con recensione** (opzione 3): apri le pagine delle recensioni con il **Browser interno**:
- Google Maps: https://www.google.com/maps/place/L%C3%B9l%C3%B9+Guest+House/@44.779334,9.0649455,17z/data=!4m11!3m10!1s0x478751901ffe92a3:0x3c787c4b07a994ca!5m2!4m1!1i2!8m2!3d44.779334!4d9.0675204!9m1!1b1!16s%2Fg%2F11z3_j01k7?entry=ttu&g_ep=EgoyMDI2MDkyOC4wIKXMDSoASAFQAw%3D%3D
- Booking.com: https://www.booking.com/hotel/it/lulu-guest-house.it.html?aid=356980&label=gog235jc-10CAsocUIQbHVsdS1ndWVzdC1ob3VzZUgzWANocYgBAZgBM7gBF8gBDNgBA-gBAfgBAYgCAagCAbgCobL71QbAAgHSAiRiMTg0Y2E4MS1lYTQ0LTRhODItOGExNi1iMTdkYWU3NzZiYjbYAgHgAgE&sid=eb6e01e7e4355b274425b61646e20c4c&dest_id=900061362&dest_type=city&dist=0&group_adults=2&group_children=0&hapos=1&hpos=1&no_rooms=1&req_adults=2&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&srepoch=1790892332&srpvid=68969b520e880795&type=total&ucfs=1&

Se compare un banner cookie, scegli l'opzione che rifiuta i cookie non essenziali. Se compare un CAPTCHA o una pagina di blocco, non risolverlo: procedi in autonomia, senza chiedere nulla all'utente, con queste alternative in ordine:
1. Prova l'altra fonte (Google Maps ↔ Booking.com).
2. Cerca su Google "Lùlù Guest House recensioni" (e varianti come "Lulu Guest House Valcurone recensioni", "Lulu Guest House Booking reviews") con il Browser interno o con la ricerca web, e leggi le recensioni dai risultati e dalle pagine trovate (scheda Google, Booking.com, Airbnb o altri siti che le riportano).
3. Usa la lettura della pagina web (WebFetch) sugli stessi link.
Annota sempre da quale piattaforma proviene la recensione (Google, Booking o Airbnb): serve per l'icona. Usa solo recensioni reali della Lùlù Guest House, mai inventate.

**Icona della piattaforma (obbligatoria)**: ogni post recensione deve mostrare l'icona della piattaforma da cui proviene la recensione, **nella stessa posizione, dimensione e stile dei post recensione precedenti**:
- recensione da **Google** → icona Google
- recensione da **Booking.com** → simbolo Booking
- recensione da **Airbnb** → simbolo Airbnb

Prendi l'icona copiandola da una pagina recensione esistente in Canva che usa la stessa piattaforma (o dai caricamenti Canva). Se per quella piattaforma non esiste ancora un post, usa il logo ufficiale della piattaforma posizionato esattamente dove sta l'icona negli altri post recensione. Non mettere mai l'icona di una piattaforma diversa da quella di origine.

Regole:
- Prima di scegliere, leggi il testo di **tutte** le pagine recensione esistenti in Canva: non usare una recensione già usata.
- Riporta il testo della recensione fedelmente (puoi accorciarlo con "…" senza cambiarne il senso) con nome/iniziale dell'autore come nei post di riferimento.
- Struttura del testo sempre **italiano, inglese, francese**: traduci dall'italiano in inglese e francese; se l'originale è in un'altra lingua, traducilo in italiano e mantieni comunque l'ordine IT → EN → FR.
- Prendi come modello grafico le pagine 2, 3, 4, 52, 53, 54, 62, 63, 64, 66, 67, 68.

**Versioni per lingua**: se la grafica contiene **testo nell'immagine** (titolo, frase, recensione, ecc. — cioè opzioni 2, 3, 4 e 5 quando hanno testo), crea **3 pagine separate**, una per lingua: **IT**, **EN**, **FR**, identiche nella grafica e con il testo tradotto (la recensione: ogni pagina con la sola versione nella sua lingua). Ripeti i punti 3–7 per ciascuna lingua, inserendole in fondo nell'ordine IT → EN → FR. Se la grafica è solo **foto + logo + telefono + e-mail** (opzione 1, o qualsiasi post senza testo), crea **una sola pagina** (considerata IT); le lingue restano solo nel copy.

Al termine indica all'utente il **numero delle nuove pagine** create (e la lingua di ciascuna).

## Passo 3 – Copy (file .txt su Drive + chat, mai in un artefatto)

Scrivi il copy come testo semplice, salvalo nel file **`Copy.txt`** (UTF-8, così le emoji restano intatte) nella cartella "Post N" del Passo 4, e riportalo anche **in un messaggio in chat**. Non creare artefatti.

**Lunghezza**: l'intero copy (tutte e tre le lingue, chiusure, keywords e hashtag inclusi) deve essere **sotto i 2.000 caratteri**. Contali con uno script (es. `python3 -c "print(len(open('Copy.txt',encoding='utf-8').read()))"`) prima di salvarlo; se li supera, accorcia i testi descrittivi (mai le chiusure né il separatore) e ricontrolla. Prendi come riferimento di stile, tono e lunghezza i copy nel file "Post Instagram" (Drive/08 Lulu Guest House/Instagram/Post Instagram).

Struttura: copy italiano + chiusura IT → `______________________` → copy inglese + chiusura EN → `______________________` → copy francese + chiusura FR → keywords e hashtag (subito dopo, **senza** separatore).

**Separatore**: usa SEMPRE e SOLO la sequenza di caratteri underscore `______________________`, su una riga a sé: è testo, non un elemento grafico. Non usare separatori tuoi (es. `---`, linee Markdown o altri simboli): non verrebbero letti come testo quando l'utente copia il contenuto. Scrivi il copy come testo semplice (niente titoli Markdown o blocchi di codice), così si copia così com'è.

Copia le chiusure **esattamente** (stesse emoji, spazi, punteggiatura, e-mail `luluguestshouse@gmail.com`):

**Chiusura italiano:**

📍Prenota il tuo soggiorno su www.luluguesthouse.it, via email luluguestshouse@gmail.com o chiamandoci al +39 351 747 8470. Oppure cercaci su Airbnb o Booking.

🔗 Tutti i link in bio.

______________________

**Chiusura inglese:**

📍 Book your stay at www.luluguesthouse.it, by email luluguestshouse@gmail.com or by calling +39 351 747 8470. Or find us on Airbnb or Booking.

🔗 All links in bio.

______________________

**Chiusura francese** (seguita direttamente da keywords e hashtag):

📍 Réservez votre séjour sur www.luluguesthouse.it, par email à luluguestshouse@gmail.com ou en appelant le +39 351 747 8470. Ou retrouvez-nous sur Airbnb ou Booking.

🔗 Tous nos contacts et liens sont dans la bio.

curone, valcurone, val curone, valle, piemonte, alessandria, natura, guest house, guests, ospiti, b&b, bed and breakfast, hotel, albergo, colazione, natura, bosco, sentieri, animali, tramonti

#curone #valcurone #valle #piemonte #alessandria #natura #guesthouse #beb #bedandbreakfast #hotel #albergo #colazione #natura #bosco #sentieri #animali #tramonti

## Passo 4 – Export PNG e salvataggio su Google Drive

1. **Export**: esporta ogni nuova pagina da "Post pronti 2026" in **PNG** con `export-design` (verifica i formati con `get-export-formats`; formato `png`, `pages` = numero della pagina, dimensione originale). Scarica ogni PNG dall'URL restituito nella cartella temporanea e rinominalo `IT.png`, `EN.png`, `FR.png` (oppure solo `IT.png` se c'è una sola pagina).
2. **Cartella**: con il connettore **Google Drive personale** (mai l'integrazione Drive di Canva) trova `08 Lulu Guest House > Instagram > Post IG` (`search_files`), elenca le sottocartelle "Post N", prendi il numero **N più alto** e crea la cartella **"Post N+1"** dentro "Post IG" (`create_file` con mimeType `application/vnd.google-apps.folder`). Se "Post IG" è vuota, crea "Post 1".
3. **Caricamento**: carica in "Post N+1" i PNG (`create_file`, mimeType `image/png`, contenuto in base64) e il file `Copy.txt` (mimeType `text/plain`, UTF-8).
4. **Verifica**: rielenca la cartella e controlla che ci siano tutti i PNG e `Copy.txt`, con dimensione non nulla. Se il connettore non accetta file binari, dillo all'utente e usa un'alternativa (es. caricamento tramite browser su drive.google.com), mai il Drive di Canva.

Per la pubblicazione usa i file salvati in questa cartella.

## Passo 5 – Pianificazione su Meta Business Suite (Instagram + Facebook)

L'utente ha già fatto l'accesso a Meta Business Suite nel Browser interno. **Non pubblicare mai subito: pianifica sempre** alla data e ora indicate dall'utente.

1. Apri https://business.facebook.com nel Browser interno: si apre la **Home** di Meta Business Suite della Lùlù Guest House (account in alto a sinistra "Lùlù Guest House").
2. Clicca il pulsante blu **"Crea post"** sotto il nome della pagina (accanto a "Crea inserzione", "Crea reel", "Crea storia"). Si apre direttamente l'editor del post.
3. Verifica che come destinazioni siano selezionati **Instagram e Facebook** della Lùlù Guest House.
4. Carica le immagini dalla cartella "Post N+1" nell'ordine **IT, EN, FR**. Se c'è una sola immagine, carica solo IT. IT è sempre in prima posizione.
5. Chiedi all'utente **giorno e ora** di pubblicazione con una domanda (`AskUserQuestion`; l'utente scrive data e ora in "Altro") e attendi la risposta. Non andare avanti senza.
6. Incolla il copy da `Copy.txt` nel campo testo e verifica che sia completo (emoji e separatori inclusi). Sotto, in **posizione/luogo**, cerca "Lulu Guest House" e seleziona **Lùlù Guest House – Dernice** (di solito il primo risultato).
7. Imposta la pianificazione alla data e ora indicate dall'utente.
8. **Verifica finale** prima di confermare:
   - ordine delle foto (IT, EN, FR)
   - copy inserito e completo
   - data e ora di pianificazione corrette
   - luogo Lùlù Guest House (Dernice) selezionato
   - destinazioni Instagram e Facebook attive
9. Conferma con **"Pianifica"** (mai "Pubblica ora"). Controlla nel calendario della Pianificazione che il post compaia alla data giusta e comunica all'utente data e ora pianificate.

Se un campo non compare dove indicato (l'interfaccia di Meta può cambiare), cercalo nella pagina; se non lo trovi, fermati e chiedi all'utente invece di procedere a caso. Se un caricamento file non riesce nel Browser interno, usa gli strumenti di riserva indicati sopra.

## Checklist finale (verifica ogni punto prima di rispondere)

- Connettori Canva, Google Drive (personale) e Browser interno verificati
- Tipo di post scelto dall'utente prima di iniziare (opz. 5: tema e fonte foto chiesti)
- Post aggiunto dopo l'ultima pagina di "Post pronti 2026", nessuna pagina esistente modificata
- Stessa dimensione; logo, font, colori, e-mail e telefono nelle stesse posizioni dei riferimenti
- Foto da Drive/Foto Guest House (mai Lightroom Dark); foto scurita con lo script (Luminosità −25, Alte luci −20, Bianchi −20) prima del caricamento; trasparenza intatta
- Partito da una copia di una pagina di riferimento; nuova pagina inserita in fondo con `merge-designs`; pagine totali +1
- Post nuovo, non simile a quelli esistenti; recensione mai usata prima, ordine IT → EN → FR, icona Google/Booking/Airbnb corretta e nella stessa posizione dei post precedenti
- 3 pagine IT/EN/FR se l'immagine contiene testo; una sola pagina se è solo foto + logo + contatti
- Copy in `Copy.txt` e in chat (non artefatto), IT → EN → FR, chiusure esatte, separatore `______________________` solo tra i blocchi, keywords e hashtag in fondo, **meno di 2.000 caratteri**
- Pagine esportate in PNG e salvate con `Copy.txt` in Drive/08 Lulu Guest House/Instagram/Post IG/Post N+1 (connettore Drive personale, mai quello di Canva)
- Post pianificato (mai pubblicato subito) su Instagram e Facebook: foto IT→EN→FR, copy, data/ora chiesta all'utente, luogo Lùlù Guest House – Dernice
- Numeri delle nuove pagine e data di pianificazione comunicati all'utente
