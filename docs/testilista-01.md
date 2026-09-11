# Testilista 01 — ensimmäinen laitetesti

| | |
|---|---|
| Laadittu | 2026-09-11 |
| Build | Kehityspalvelin (Expo Go), SHA `8560054` |
| Backend | Supabase `elfjchdlerhpjbikpnyz` (tuotantoprojekti) |
| Testaaja | Omistaja, fyysinen puhelin |

Raportoi **kohdittain numeron kanssa**: OK / EI OK + mitä näytölle tuli.
Osittain toimiva kohta on EI OK. Kerro myös puhelimen malli ja
käyttöjärjestelmäversio.

## Valmistelu

1. Asenna **Expo Go** (App Store tai Google Play).
2. Varmista, että puhelin on **samassa WiFi-verkossa** kuin Mac.
3. Avaa Expo Go → *Enter URL manually* → syötä:
   `exp://192.168.1.113:8081`

Jos yhteys ei aukea, kerro se heti — vaihdan palvelimen tunneliin.

---

## A. Kirjautuminen

| # | Vaihe | Odotettu tulos |
|---|---|---|
| 1 | Sovellus aukeaa | Kirjautumisnäkymä, otsikko "Eränkävijän päiväkirja" |
| 2 | Paina **Kirjaudu sisään** tyhjillä kentillä | Virhe lomakkeessa: "Täytä sähköposti ja salasana." |
| 3 | Syötä keksitty sähköposti ja salasana, paina Kirjaudu | Virhe: "Väärä sähköposti tai salasana." |
| 4 | Valitse **Rekisteröidy**, täytä nimi, oikea sähköposti ja salasana (väh. 6 merkkiä) | Joko kirjautuu sisään suoraan tai ilmoittaa vahvistuslinkistä |
| 5 | Jos tuli vahvistuspyyntö: klikkaa linkki sähköpostista ja kirjaudu | Pääset sisään sovellukseen |
| 6 | Sulje sovellus kokonaan ja avaa uudelleen | **Pysyt kirjautuneena** — ei paluuta kirjautumisnäkymään |

## B. Reissu

| # | Vaihe | Odotettu tulos |
|---|---|---|
| 7 | Luo uusi reissu, täytä otsikko ja alue | Kentät toimivat, näppäimistö ei peitä syöttökenttää |
| 8 | Paina **Hae sijainti** | Kysyy sijaintiluvan; hyväksy |
| 9 | Luvan jälkeen | Koordinaatit ilmestyvät **ja sää haetaan automaattisesti** (lämpötila, tuuli) |
| 10 | Tallenna reissu | Siirtyy reissun tietoihin, tiedot näkyvät oikein |
| 11 | Palaa listaan ja avaa reissu uudelleen | Samat tiedot, ei tyhjiä kenttiä |

## C. Saalis ja kamera

| # | Vaihe | Odotettu tulos |
|---|---|---|
| 12 | Lisää saalis reissuun, valitse laji | Lajivalitsin toimii |
| 13 | Paina **Kamera**, ota kuva | Kysyy kameraluvan; kuva näkyy esikatselussa |
| 14 | Paina **Galleria**, valitse kuva | Kuva vaihtuu valittuun |
| 15 | Hae sijainti, täytä paino, tallenna | Siirtyy saaliin tietoihin |
| 16 | Tarkista kuva saaliin tiedoissa | **Kuva latautuu** (se haetaan Supabasen tallennustilasta, ei puhelimesta) |
| 17 | Sulje sovellus, avaa uudelleen, avaa sama saalis | Kuva latautuu yhä |

## D. Kartta

| # | Vaihe | Odotettu tulos |
|---|---|---|
| 18 | Avaa karttavälilehti | **Kartta piirtyy** (ei harmaa tai tyhjä ruutu) |
| 19 | Tarkista merkinnät | Tallentamasi saalis ja reissu näkyvät oikeilla paikoilla |
| 20 | Paina merkintää | Avaa oikean tietueen |

## E. Havainnot, kalenteri ja tilastot

| # | Vaihe | Odotettu tulos |
|---|---|---|
| 21 | Lisää havainto (laji + sijainti) | Tallentuu, näkyy listassa |
| 22 | Avaa kalenterinäkymä | Päivät joilla on merkintöjä erottuvat |
| 23 | Avaa tilastot | Luvut vastaavat sitä mitä tallensit |

## F. Poistuminen ja paluu (tämä paljastaa kaatumiset)

| # | Vaihe | Odotettu tulos |
|---|---|---|
| 24 | Käy **jokaisessa** välilehdessä, poistu ja palaa takaisin | Ei kaatumisia, ei tyhjiä näkymiä |
| 25 | Poista yksi saalis | Kysyy vahvistuksen, poistaa, palaa listaan |
| 26 | Profiili: muuta nimi, tallenna, poistu ja palaa | **Muuttunut nimi on yhä siellä** |
| 27 | Kirjaudu ulos | Kysyy vahvistuksen, palaa kirjautumisnäkymään |

## G. Virhetilanteet (lentotila päälle)

Nämä testaavat commitissa `ab8452d` korjatun vian: aiemmin epäonnistunut haku
näytti tyhjältä näkymältä, eli sovellus valehteli ettei dataa ole.

| # | Vaihe | Odotettu tulos |
|---|---|---|
| 28 | Kytke **lentotila päälle**, avaa karttavälilehti uudelleen | "Tietojen haku epäonnistui" + **Yritä uudelleen** -painike. **Ei** tekstiä "Ei sijaintimerkintöjä" |
| 29 | Sama kalenterissa ja tilastoissa | Sama virhenäkymä, ei tyhjää kalenteria eikä nollatilastoja |
| 30 | Sama profiilissa | Virhenäkymä. **Lomaketta ei näy lainkaan** — tämä estää tyhjien arvojen tallentumisen oikeiden päälle |
| 31 | Kytke lentotila pois, paina **Yritä uudelleen** | Data latautuu normaalisti |

---

## Tiedossa olevat rajoitteet

- Tämä on kehityspalvelin, ei kauppaversio. Sovellus toimii vain kun Mac on
  päällä ja samassa verkossa.
- Data menee **oikeaan Supabase-projektiin**, joten testitietueet jäävät
  kantaan. Siivoan ne pyynnöstä.
- Push-ilmoituksia, offline-tilaa eikä kauppajulkaisua ole vielä toteutettu.

CL
