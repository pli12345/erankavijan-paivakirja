---
description: Session start routine — handoff, repo state, QA verdicts, status
---

Aja tämä rutiini ennen mitään muuta työtä. Älä oikaise yhtään kohtaa, äläkä
täytä arvoja muistista — jokainen luku haetaan oikeasta lähteestä.

## 1. Lue dokumentit auktoriteettijärjestyksessä

1. `HANDOFF.md` päähaarasta — tuorein totuus käynnissä olevasta työstä
2. `CLAUDE.md` — projektikohtaiset faktat ja sitovat säännöt
3. `README.md`

Jos `HANDOFF.md` puuttuu, kerro se omistajalle ja ehdota sen luomista. Älä jatka
ilman.

## 2. Tarkista repon todellinen tila

```bash
git branch --show-current && git log --oneline -5 | cat
git status --short
git rev-parse HEAD && git rev-parse origin/main
gh issue list --state open
gh pr list --state open
```

Jos `gh` ei ole autentikoitu, kerro se blokkerina — QA-verdiktien läpikäyntiä ei
voi ajaa ilman sitä, eikä silloin saa raportoida "ei arviota".

## 3. QA-verdiktien läpikäynti

Käy läpi **kaikki** avoimet issuet ja PR:t, ei vain työn alla olevaa. Lue sekä
issue-kommentit että PR-reviewt:

```bash
gh pr list --state open --json number --jq '.[].number' | while read n; do
  gh pr view "$n" --comments
done
gh issue list --state open --json number --jq '.[].number' | while read n; do
  gh issue view "$n" --comments
done
```

Tunnista Sofian verdiktit **kommentin sisällöstä**, ei tekijätilistä — tili voi
olla jaettu. Käsittele jokainen rivi:

- **KORJAA** → korjaa nyt tai kirjaa tehtäväksi
- **HYVÄKSY** → mergeä ennen uuden rakentamista
- **korvattu** → sulje selityksellä

Roikkumaan jättäminen on ohittamista.

## 4. Aja preflight

```bash
bash scripts/preflight.sh
```

## 5. Anna omistajalle status (enintään noin 15 riviä)

- Julkaisutila per kohde (iOS, Android, web)
- Haara ja viimeisin SHA, onko synkassa etähaaran kanssa
- Avoimet PR:t ja issuet
- Blokkerit
- Seuraavat kolme askelta

Kysy lopuksi, mitä jatketaan ensimmäisenä.
