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

## Nykytila per kohde

| Kohde | Tila |
|---|---|
| Supabase-backend | **Verified** — taulut, RLS, tallennustila ja auth todennettu curlilla 2026-09-11 |
| Web (kehitys) | **Verified** — sovellus latautuu, kirjautumisvirhe näkyy oikein |
| iOS | **Configured** — ei ajettu simulaattorissa eikä laitteella |
| Android | **Configured** — ei ajettu |
| App Store | Ei aloitettu |
| Google Play | Ei aloitettu |

Sanasto: *Configured* = asetus tehty, ei testattu. *Verified* = toimii oikealla
datalla päästä päähän.

## Avoimet PR:t ja issuet

Ei vielä yhtään — `gh` asennettiin vasta tässä sessiossa eikä sitä ole
autentikoitu. Ensimmäinen tehtävä seuraavassa sessiossa on avata backlog-issuet
alla olevista kohdista.

## Seuraavat askeleet

1. `gh auth login` (omistaja) → sen jälkeen avaa issuet kohdista 2–6.
2. Kirjautuminen todennettava oikealla tunnuksella päästä päähän: rekisteröinti,
   sähköpostin vahvistus, sisäänkirjautuminen, istunnon säilyminen.
3. Sovellus ajettava iOS-simulaattorissa. Kartta, kamera ja GPS eivät toimi
   selaimessa lainkaan, joten ne ovat kokonaan todentamatta.
4. Näkymien läpikäynti säännön mukaisesti: jokainen näkymä avataan, poistutaan
   ja palataan takaisin.
5. Tyhjien tilojen ja virhetilanteiden fallbackit tarkistettava jokaisesta
   näkymästä.
6. App Store- ja Play-julkaisun esivaatimukset: tilit, ikonit, tietosuojaseloste,
   kauppatekstit.

## Blokkerit

- **Push estetty.** Automaattitilan luokitin estää `git push`- ja
  `git remote` -komennot. `main` on paikallisesti edellä etähaaraa; omistajan on
  ajettava push itse. Tämä ei ole kierrettävä este.
- **`gh` ei autentikoitu.** Issueita, PR:iä eikä QA:n kommentteja voi lukea
  ennen kuin omistaja ajaa `gh auth login`. QA-verdiktien läpikäyntiä ei siis
  ole voitu ajaa kertaakaan.
- **QA-vastaavaa (Sofia) ei ole vielä tavoitettu** missään tiketissä.

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

CL
