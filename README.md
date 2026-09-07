# Eränkävijän päiväkirja

Metsästyspäiväkirja iOS:lle ja Androidille. Reissut, saaliit, havainnot, kartta ja
kausitilastot — pilvitallennuksella, joten samat tiedot näkyvät kaikilla laitteilla.

Rakennettu Expo + React Native + TypeScript -pinolla, backendinä Supabase.

## Ominaisuudet

- **Kirjautuminen** sähköpostilla ja salasanalla (Supabase Auth)
- **Reissut** — otsikko, alue, aloitus- ja lopetusaika, seuruekaverit, muistiinpanot
- **Sää automaattisesti** reissun sijainnin perusteella (Open-Meteo, ei API-avainta)
- **Saaliit** — laji, sukupuoli, ikäluokka, paino, sarvipiikit, kuva, GPS-sijainti
- **Havainnot** — nähdyt eläimet, joita ei kaadettu
- **Kalenteri** — kuukausinäkymä, jossa reissut ja saaliit merkittynä
- **Kartta** — saaliit, havainnot ja reissut pisteinä, tasot suodatettavissa
- **Tilastot** — kausikohtaiset summat, saaliit lajeittain ja kuukausittain

## Käyttöönotto

### 1. Supabase-projekti

1. Luo ilmainen projekti osoitteessa [supabase.com](https://supabase.com).
2. Avaa **SQL Editor → New query**, liitä [`supabase/schema.sql`](supabase/schema.sql)
   sisältö ja aja se. Tämä luo taulut, käyttöoikeussäännöt (RLS) ja kuvien tallennustilan.
3. Kopioi **Project Settings → API** -sivulta *Project URL* ja *anon public* -avain.

### 2. Ympäristömuuttujat

```bash
cp .env.example .env
```

Täytä `.env`-tiedostoon kohdasta 1 kopioidut arvot:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Kehityskäynnistys

```bash
npm install
npx expo start
```

Avaa sovellus Expo Go -sovelluksella puhelimessa tai simulaattorissa
(`i` = iOS-simulaattori, `a` = Android-emulaattori).

## Julkaisu kauppoihin

Julkaisu tehdään EAS Buildilla. Vaatii Expo-tilin sekä Apple Developer Program
-jäsenyyden (99 $/v) ja Google Play Console -tilin (25 $ kertamaksu).

```bash
npm install -g eas-cli
eas login
eas build:configure

# Testiversiot
eas build --profile preview --platform android

# Kauppaversiot
eas build --profile production --platform all
eas submit --platform ios
eas submit --platform android
```

Ennen julkaisua tarvitaan vielä sovelluskuvake ja splash-kuva
(`assets/images/`), kauppakuvakaappaukset sekä tietosuojaseloste.

## Projektin rakenne

```
app/                 Näkymät (expo-router, tiedostopohjainen reititys)
  (auth)/login.tsx   Kirjautuminen ja rekisteröityminen
  (tabs)/            Päiväkirja, kalenteri, kartta, tilastot, profiili
  trip/              Reissun luonti ja tiedot
  catch/             Saaliin luonti ja tiedot
  observation/       Havainnon luonti
src/                 Logiikka: Supabase-kytkentä, API, teema, komponentit
supabase/schema.sql  Tietokantaskeema
```
