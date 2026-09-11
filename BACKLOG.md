# Backlog

Nämä avataan GitHub-issueiksi heti kun `gh` on autentikoitu. Tiedosto on
väliaikainen kirjanpito, ei korvaa issueita. Järjestys on prioriteetti.

---

## ~~1. Maanmittauslaitoksen API-avain puuttuu~~ — HOIDETTU 2026-09-11

Avain saatu ja asetettu `.env`-tiedostoon. Spike ajettu: kaikki kolme tasoa
palauttavat HTTP 200 ja oikeaa kuvadataa. Laatta z=9 y=140 x=291 näyttää
Karstulan ja Saarijärven seudun, eli polun z/y/x-järjestys on oikein.
Fixturet tallennettu hakemistoon `fixtures/mml/`.

## 1b. Google Maps -avain Androidilla — EI poistu MML-laatoilla

**Vakavuus:** estää Play-julkaisun. **Todentamatta.**

Helppo ymmärtää väärin: vaikka näkyvät laatat tulevat Maanmittauslaitokselta,
`react-native-maps` käyttää Androidilla moottorinaan Google Maps SDK:ta, joka
vaatii oman API-avaimensa alustuakseen — myös `mapType="none"` -tilassa.
`app.json`-tiedostossa ei ole `android.config.googleMaps.apiKey`-asetusta.

Tämä on pääteltyä, ei mitattua: varmistettava Android-ajossa ennen kuin
korjataan. Vaihtoehto on vaihtaa karttakirjasto sellaiseen, joka ei tarvitse
Googlea (esim. MapLibre), jolloin riippuvuus poistuu kokonaan.

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

## ~~5. Ei yhtään automaattitestiä~~ — ALOITETTU 2026-09-11

Jest (`jest-expo`) käytössä, 39 testiä moduuleille `src/format.ts`,
`src/species.ts` ja `src/mapTiles.ts`. Testit ajetaan preflightin kohdassa 7.
Todistettu istutetulla vialla: z/y/x-järjestyksen kääntäminen kaataa testin.

Kattamatta yhä: `src/weather.ts` (vaatii fixturen Open-Meteo-vastauksesta),
`src/api.ts` ja näkymäkomponentit.

## 8. Riippuvuuksissa haavoittuvuuksia

`npm audit`: 1 kriittinen, 18 korkeaa, 21 keskitasoista. Kaikki korkeat ovat
Expon ja Metron build-työkaluissa (`@expo/cli`, `metro`, `js-yaml`,
`image-size`) ja palvelunestotyyppisiä — ne eivät päädy käyttäjälle
toimitettavaan pakettiin. Olivat puussa jo ennen testikehyksen asennusta.

Ei kiireellinen, mutta tarkistettava ennen julkaisua ja Expo-päivitysten
yhteydessä.

## 6. Julkaisun esivaatimukset kartoittamatta

Apple Developer -jäsenyys (99 $/v), Google Play Console (25 $), sovellusikonit,
kauppatekstit, tietosuojaseloste ja tietosuojalomakkeiden vastaukset. Vastaukset
johdetaan koodista ja artefaktista, ei arvata.

## 7. `gh` autentikoimatta

QA-verdiktien läpikäyntiä ei ole voitu ajaa kertaakaan, eikä Sofiaa ole
tavoitettu. Estää sääntöjen mukaisen tikettipohjaisen työskentelyn kokonaan.

CL
