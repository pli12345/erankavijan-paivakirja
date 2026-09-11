# Eränkävijän päiväkirja — projektiohje

## Työskentelysäännöt

Tässä projektissa noudatetaan omistajan globaaleja työskentelysääntöjä
(`~/.claude/CLAUDE.md`) sellaisenaan. Alla vain projektikohtaiset faktat ja
poikkeukset.

- Avustajan työpersoona: **CL**. Kaikki GitHubiin postattava (kommentit, PR- ja
  issue-bodyt, review-vastaukset, handoff-tekstit) allekirjoitetaan viimeisenä
  rivinä nimellä CL. Poikkeus: merge-committien otsikot.
- QA-vastaava: **Sofia**. Hänen GitHub-kommenttinsa ja reviewnsä ovat sitovia
  vaatimuksia, eivät suosituksia. Verdikti tunnistetaan kommentin sisällöstä,
  ei tekijätilistä, koska tili voi olla jaettu. Sofia ei näe chattia; häneen
  ollaan yhteydessä vain issue- ja PR-kommenteilla.
- Viestintä omistajan kanssa suomeksi. Koodi, commit-viestit ja tunnisteet
  englanniksi. Käyttöliittymätekstit suomeksi.
- Commit-viestit: Conventional Commits.

## Projektikohtaiset faktat

| Asia | Arvo |
|---|---|
| GitHub-repo | `pli12345/erankavijan-paivakirja` (yksityinen) |
| Omistajan GitHub-tunnus | `pli12345` |
| Paikallinen polku | `~/metsastajan-paivakirja` (huom: eri nimi kuin repo) |
| Supabase-projektitunnus | `elfjchdlerhpjbikpnyz` |
| Supabase-URL | `https://elfjchdlerhpjbikpnyz.supabase.co` |
| Master-datalähde | Supabase Postgres; skeema `supabase/schema.sql` |
| Alusta | Expo SDK 54, React Native, TypeScript |
| Julkaisukohteet | Apple App Store ja Google Play |
| `gh`-työkalu | `~/.local/bin/gh` (2.100.0, asennettu 2026-09-11) |
| Karttalaatat | Maanmittauslaitoksen avoin WMTS, lisenssi CC BY 4.0 |
| MML-rekisteröinti | https://omatili.maanmittauslaitos.fi/user/new/avoimet-rajapintapalvelut |

Supabase-avaimet ovat vain `.env`-tiedostossa, joka on gitignoressa.
`.env.example` on versionhallinnassa paikanvaraaja-arvoilla.

## Arkkitehtuuri lyhyesti

- `app/` — expo-router-näkymät. `(auth)` kirjautuminen, `(tabs)` päänäkymät,
  `trip/`, `catch/`, `observation/` yksittäiset tietueet.
- `src/api.ts` — kaikki Supabase-kutsut. Näkymät eivät puhu Supabaselle suoraan.
- `src/auth.tsx` — istunnon hallinta ja AuthProvider.
- `src/alert.ts` — `showAlert` / `showConfirm`. **Älä käytä react-nativen
  `Alert.alert`-funktiota**: se on react-native-webissä tyhjä funktio, jolloin
  ilmoitukset katoavat selaimessa.
- `supabase/schema.sql` — taulut, RLS-säännöt ja tallennustila. Ajetaan
  Supabasen SQL Editorissa.
- `src/mapTiles.ts` — Maanmittauslaitoksen WMTS-laatat. **Attribuutio on
  CC BY 4.0 -lisenssin ehto**: `attributionText`-teksti näkyy kartalla eikä
  sitä saa poistaa tai piilottaa. WMTS-polun järjestys on z/y/x, ei z/x/y.

## Vanhentuneet oletukset, älä palauta

- `Alert.alert` ilmoituksiin -> `showAlert` / `showConfirm` tiedostosta
  `src/alert.ts`. Syy: react-native-webin `Alert.alert` on tyhjä funktio, joten
  virheilmoitukset eivät näkyneet selaimessa lainkaan (2026-09-11).
- Supabasen `anon`-avain -> projektissa on käytössä uudempi
  `sb_publishable_`-muotoinen avain. Molemmat menevät samaan
  `EXPO_PUBLIC_SUPABASE_ANON_KEY`-ympäristömuuttujaan.

## Todennettu, älä tutki uudelleen

- Supabase-yhteys toimii päästä päähän: taulut `profiles`, `trips`, `catches`,
  `observations` vastaavat, tallennustila `catch-photos` on olemassa ja
  autentikaatiopääte palauttaa oikean virheen. Todennettu 2026-09-11 curlilla
  ja selainajolla.
