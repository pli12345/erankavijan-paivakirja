# Backlog

Nämä avataan GitHub-issueiksi heti kun `gh` on autentikoitu. Tiedosto on
väliaikainen kirjanpito, ei korvaa issueita. Järjestys on prioriteetti.

---

## 1. Google Maps -avain puuttuu — kartta jää harmaaksi Androidilla

**Vakavuus:** estää Play-julkaisun.

`react-native-maps` käyttää iOS:ssä Apple Mapsia ilman avainta, mutta Androidilla
se vaatii Google Maps API -avaimen. `app.json`-tiedostossa ei ole
`android.config.googleMaps.apiKey`-asetusta, joten karttavälilehti näyttää
Androidilla harmaan ruudun.

Vaatii omistajalta Google Cloud -projektin ja Maps SDK for Android -avaimen.
Avain menee ympäristömuuttujaan, ei versionhallintaan.

## 2. Kirjautuminen todentamatta päästä päähän

Rekisteröinti, sähköpostin vahvistus, sisäänkirjautuminen ja istunnon
säilyminen sovelluksen uudelleenkäynnistyksen yli ovat kaikki testaamatta
oikealla tunnuksella. Tunnuksen luonti on omistajan tehtävä.

## 3. Latausvirheiden näkymät todentamatta ruudulla

Korjattu commitissa `ab8452d`, mutta `LoadErrorState` ei ole vielä näkynyt
ruudulla kertaakaan — se vaatii kirjautuneen istunnon. Testataan lentotilalla
(testilista 01, kohdat 28–31).

## 4. Kartta, kamera ja GPS todentamatta

Nämä eivät toimi selainversiossa lainkaan. Odottaa Xcode-asennusta ja
simulaattoriajoa.

## 5. Ei yhtään automaattitestiä

Projektissa ei ole testikehystä. Sääntöjen mukaan puhdas logiikka eriytetään
I/O:sta ja testataan deterministisesti. Ehdotus: Jest + golden-testit
moduuleille `src/format.ts`, `src/species.ts` ja `src/weather.ts`, jotka ovat
puhdasta logiikkaa ja helposti katettavissa.

## 6. Julkaisun esivaatimukset kartoittamatta

Apple Developer -jäsenyys (99 $/v), Google Play Console (25 $), sovellusikonit,
kauppatekstit, tietosuojaseloste ja tietosuojalomakkeiden vastaukset. Vastaukset
johdetaan koodista ja artefaktista, ei arvata.

## 7. `gh` autentikoimatta

QA-verdiktien läpikäyntiä ei ole voitu ajaa kertaakaan, eikä Sofiaa ole
tavoitettu. Estää sääntöjen mukaisen tikettipohjaisen työskentelyn kokonaan.

CL
