# HANDOFF — Eränkävijän päiväkirja

| | |
|---|---|
| Päivitetty | 2026-09-11 |
| Sessio | Työtapojen käyttöönotto |
| Haara | `main` |
| Viimeisin SHA | ks. `git log -1` — tämä tiedosto päivitetään jokaisen session lopussa |

Tämä on tuorein totuus käynnissä olevasta työstä. Lue tämä ensin, sitten
`README.md` ja `CLAUDE.md`.

---

## Tehty

- Sovelluksen ensimmäinen versio: reissut, saaliit, havainnot, kartta,
  kalenteri ja tilastot (`0f4f300`).
- Riippuvuudet Expo SDK 54:n odottamiin versioihin (`aa477d4`).
- **Korjattu: ilmoitukset eivät näkyneet selaimessa** (`97e4447`).
  `react-native-web`-paketin `Alert.alert` on tyhjä funktio, joten kaikki
  virheilmoitukset katosivat. Tilalle `src/alert.ts` (`showAlert`,
  `showConfirm`) ja kirjautumisnäkymään lomakkeen sisäiset virheviestit.
- Supabase-projekti pystytetty ja skeema ajettu.
- Työtapojen mukainen rakenne: `CLAUDE.md`, tämä handoff, identiteettiskripti,
  preflight-portti ja molempiin suuntiin todistettu salaisuusvahti.
- `gh` 2.100.0 asennettu (`~/.local/bin/gh`), tarkistesumma todennettu
  virallista julkaisua vasten.
- **Korjattu: neljä näkymää nielaisi latausvirheen** (`ab8452d`). Kartta,
  kalenteri, tilastot ja profiili näyttivät epäonnistuneen haun tyhjänä
  näkymänä. Profiilissa seuraus oli vakavin: tyhjä lomake tallensi nullin
  oikean nimen päälle. Uusi `LoadErrorState` uudelleenyrityspainikkeella.
- `BACKLOG.md` (`6c9796c`): seitsemän löydöstä odottamassa issueiksi.

## Nykytila per kohde

| Kohde | Tila |
|---|---|
| Supabase-backend | **Verified** — taulut, RLS, tallennustila ja auth todennettu curlilla 2026-09-11 |
| Web (kehitys) | **Verified** — sovellus latautuu, kirjautumisvirhe näkyy oikein |
| iOS-paketti | **Verified kääntyy** — Metro tuottaa 15,0 MB paketin, oikea backend-osoite paketissa, ei salaisuuksia. Ei ajettu laitteella. |
| Android-paketti | **Verified kääntyy** — 15,0 MB. Ei ajettu laitteella. |
| iOS/Android ajossa | **Ei todennettu** — kartta, kamera ja GPS kokonaan testaamatta |
| App Store | Ei aloitettu |
| Google Play | Ei aloitettu |

Sanasto: *Configured* = asetus tehty, ei testattu. *Verified* = toimii oikealla
datalla päästä päähän.

## Avoimet PR:t ja issuet

Ei vielä yhtään — `gh` asennettiin vasta tässä sessiossa eikä sitä ole
autentikoitu. Ensimmäinen tehtävä seuraavassa sessiossa on avata backlog-issuet
alla olevista kohdista.

## Seuraavat askeleet

1. **Omistaja: laitetesti** `docs/testilista-01.md` mukaan (27 kohtaa, Expo Go).
   Tämä kattaa kirjautumisen, kartan, kameran ja GPS:n kerralla.
2. `gh auth login` (omistaja) → sen jälkeen avaa backlog-issuet.
3. Testilistan löydökset korjataan ja kirjataan issueiksi.
   Erityisesti kohdat 28–31 todentavat commitin `ab8452d` korjauksen.
4. Tyhjien tilojen ja virhetilanteiden fallbackit käytävä läpi jokaisesta
   näkymästä.
5. App Store- ja Play-julkaisun esivaatimukset: tilit, ikonit,
   tietosuojaseloste, kauppatekstit.

## Blokkerit

- **Push on aina omistajan ajettava.** Automaattitilan luokitin estää avustajalta
  `git push`- ja `git remote` -komennot. Ei ole kierrettävä este: kerro
  omistajalle komento ja odota. Tilanne 2026-09-11: `main` työnnetty onnistuneesti
  SHA:han `8560054`, paikallinen ja etähaara samassa.
- **`gh` ei autentikoitu.** Issueita, PR:iä eikä QA:n kommentteja voi lukea
  ennen kuin omistaja ajaa `gh auth login`. QA-verdiktien läpikäyntiä ei siis
  ole voitu ajaa kertaakaan.
- **QA-vastaavaa (Sofia) ei ole vielä tavoitettu** missään tiketissä.
- **Ei simulaattoria käytettävissä.** Xcode eikä Android Studio ole asennettu
  tälle koneelle, joten iOS-simulaattori- tai Android-emulaattoriajo ei
  onnistu. Laitetesti tehdään Expo Golla omistajan puhelimella; se on myös
  parempi evidenssi, koska GPS ja kamera ovat oikeita.

## Muistiinpanoja seuraavalle

- macOS:n mukana tulee bash 3.2, jossa **ei ole `mapfile`-komentoa**.
  Salaisuusvahdin ensimmäinen versio käytti sitä, luki nolla tiedostoa ja
  raportoi silti "puhdas". Todistusskripti paljasti tämän. Pidä skriptit bash
  3.2 -yhteensopivina äläkä luota vihreään tulokseen ilman todistusta.
- `Alert.alert` ei toimi webissä. Käytä aina `src/alert.ts`-apureita.
- Supabasen uusi avainmuoto on `sb_publishable_…`, ei enää `eyJ…`. Menee samaan
  ympäristömuuttujaan `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Repo on `erankavijan-paivakirja`, mutta paikallinen hakemisto
  `metsastajan-paivakirja`. Eri nimi, sama projekti.
- Selainajossa Browser-paneeli voi olla piilotettuna, jolloin klikkaukset
  aikakatkeavat. Käytä silloin `javascript_tool`-klikkausta ja lue tulos
  `get_page_text`-työkalulla.
- Metro-paketin osoite tässä projektissa on
  `/.expo/.virtual-metro-entry.bundle?platform=ios`, ei `/index.bundle` —
  jälkimmäinen antaa 404:n, koska entry on `expo-router/entry`.
- Paketista löytyy 24 riviä joilla lukee `service_role` tai `sb_secret_`. Ne
  ovat Supabase-kirjaston omaa dokumentaatiota ja prefiksitarkistuksia, eivät
  avaimia. Todennettu 2026-09-11: oikean muotoisia avaimia 0 kpl.

CL
