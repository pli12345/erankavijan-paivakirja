# Backlog

Nämä avataan GitHub-issueiksi heti kun `gh` on autentikoitu. Tiedosto on
väliaikainen kirjanpito, ei korvaa issueita. Järjestys on prioriteetti.

---

## 1. Maanmittauslaitoksen API-avain puuttuu

**Vakavuus:** kartta ei näytä maastokarttaa ennen kuin avain on olemassa.

Karttalaatat toteutettu commitissa, mutta `EXPO_PUBLIC_MML_API_KEY` on tyhjä,
joten laatat palauttaisivat 401. Sovellus tunnistaa tämän ja näyttää alustan
oman peruskartan, eli kartta ei hajoa — mutta maastokarttaa ei saada.

Vaatii omistajalta rekisteröitymisen:
https://omatili.maanmittauslaitos.fi/user/new/avoimet-rajapintapalvelut

Kun avain on `.env`-tiedostossa, aja `bash scripts/spike-mml-tiles.sh`.

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
