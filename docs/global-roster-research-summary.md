# Global CEO/investor roster — research summary

Compiled 2026-09-14 by parallel regional research agents (web-search verified where possible). Covers all 193 UN member states + 2 UN observer states (Holy See, Palestine) = **195 total**.

## Breakdown

| Confidence | Count | Meaning |
| --- | --- | --- |
| `verified` | 147 | Found a real source (Wikipedia, Forbes, Bloomberg, Reuters, or similar) supporting the name, company, and claim. |
| `uncertain` | 14 | A plausible figure was found but sourcing was thin, indirect (e.g. heritage rather than nationality/HQ), or from a single non-major outlet. Needs a second source before publishing as fact. |
| `no_notable_figure` | 34 | No globally-documented, independently verifiable business leader could be found. Left blank rather than inventing a name — mostly small island nations (Pacific/Caribbean) and a few state-controlled or conflict-affected economies. |

**147 + 14 = 161 countries have a real, named person available for the app today.**

## Countries with NO figure found (34) — do not create a card for these without further research

Africa: Cabo Verde, Chad, Comoros, Equatorial Guinea, Eritrea, Niger, Sao Tome and Principe, South Sudan
Asia: Afghanistan, Bhutan, Brunei, Kyrgyzstan, Laos, North Korea, Tajikistan, Timor-Leste, Turkmenistan
Europe: San Marino, Holy See
Americas: Cuba, Grenada, Saint Kitts and Nevis, Saint Vincent and the Grenadines
Oceania: Fiji, Kiribati, Marshall Islands, Micronesia, Nauru, Palau, Papua New Guinea, Samoa, Solomon Islands, Tonga, Tuvalu, Vanuatu

## Countries with `uncertain` confidence (14) — verify with a second source before treating as fact

Azerbaijan (Vagit Alekperov — Russian company, Azerbaijani-born), Iran (no strong candidate — flagged uncertain, not verified), Uzbekistan (Alisher Usmanov — Russian citizen/resident, only just added to Uzbekistan's Forbes listing), Zambia (Hakainde Hichilema — now a sitting president, pre-politics career), Central African Republic (Joseph Ichame Kamach — limited independent sourcing), Gabon (Christian Kerangall), Guinea (Fadi Wazni), Guinea-Bissau (Carlos Gomes Junior — better known as a politician), Costa Rica (Francis Durman Esquivel — regional list only, no confirmed billionaire), Saint Lucia (Joseph Quentin Charles — trade-press sourcing only), Andorra (Maria Reig Moles), Malta (Joe Gasan — no source URL found), Montenegro (Aco Djukanovic), North Macedonia (Zhivko Mukaetov).

## Editorial status

This entire dataset is **draft, not editorially reviewed** per the app's own content standard (`supabase/seed.sql` header, `docs/release-checklist.md`). Before any of this ships to real users:
1. A human should spot-check the 147 "verified" entries' source links actually say what's claimed here.
2. The 14 "uncertain" entries need a second source or should be dropped.
3. Net-worth figures and titles drift constantly (people step down, get overtaken on rich lists) — treat every entry's "last reviewed" date as today, and re-check before any public launch.

## Where this data lives

- Raw research: `docs/global-roster-research.json` (this file's companion)
- Integrated into the app: `lib/mockEntities.ts` (client demo) and `supabase/seed.sql` (server seed) — only `verified` and `uncertain` entries were carried over; `no_notable_figure` countries have no card and are not represented in Rip It yet.
