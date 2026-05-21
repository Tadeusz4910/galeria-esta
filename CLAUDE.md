@AGENTS.md

# Galeria ESTA — publiczna strona galerii

Publiczna witryna prezentacyjna Galerii Sztuki Współczesnej ESTA (Gliwice, od 1998).
Next.js 16.2.6 (App Router) + React 19.2.4 + TypeScript. Hosting: **Vercel**.
Dane w **Supabase**. Strona **tylko czyta** z bazy (anon key, `revalidate = 0`).

## ⚠️ Dwa projekty, jedna baza

System składa się z DWÓCH osobnych repozytoriów dzielących tę samą bazę Supabase:

- **galeria-esta** (ten projekt) — publiczna strona. **Tylko ODCZYT** z Supabase. Hosting Vercel.
- **esta-crm** — wewnętrzny panel administracyjny. **ZAPIS** do Supabase. Hosting TheCamels.
  Tam mieszczą się moduły **klienci, dopasowania AI, finanse** oraz zarządzanie treścią.
  Tych modułów NIE ma i nie będzie w galeria-esta.

**Workflow treści:** nową treść/pola (np. zdjęcie artysty) wprowadza się przez panel
esta-crm, nie przez SQL. Kolejność zawsze: najpierw pole/funkcja w panelu → potem render na stronie.

## Architektura stron (App Router, wszystko Server Components)

| Trasa | Plik | Opis |
|---|---|---|
| `/` | `app/page.tsx` | Hero, aktualna wystawa, upcoming, listy wystaw/targów, artyści, blok Viewing Room (placeholder) |
| `/artysci` | `app/artysci/page.tsx` | Lista artystów: aktywni + archiwum |
| `/artysta/[slug]` | `app/artysta/[slug]/page.tsx` | Profil: bio, znaczenie, idee, wystawy, prace + zdjęcia |
| `/wystawy`, `/wystawa/[url]` | `app/wystawy/`, `app/wystawa/[url]/` | Lista + detal (zdjęcia, materiały, artyści) |
| `/targi`, `/targ/[url]` | `app/targi/`, `app/targ/[url]/` | Lista (wg roku) + detal (dokumentacja) |
| `/idee`, `/idee/[slug]` | `app/idee/`, `app/idee/[slug]/` | Mapa idei: pojęcia + powiązania z artystami i kompendium |
| `/kompendium`, `/kompendium/[slug]` | `app/kompendium/`, `app/kompendium/[slug]/` | Baza wiedzy; treść jako `dangerouslySetInnerHTML` |

Stylistyka: White Cube — Cormorant Garamond + Instrument Sans, dużo bieli, czarny footer.
Style głównie **inline** + lokalne `<style>` w stronach. Tailwind v4 zainstalowany, ale nieużywany.
Wspólny komponent: tylko `components/Nav.tsx`.

## Model danych Supabase (15 tabel)

Encje główne (7): `artysci`, `wystawy`, `targi`, `idee`, `kompendium`, `prace`, `media`.

Tabele łączące / podrzędne (8):
- `wystawy_artysci`, `wystawy_zdjecia`, `wystawy_materialy`
- `targi_zdjecia`
- `idee_artysci`, `idee_idee` (powiązane idee)
- `kompendium_artysci`, `kompendium_idee`

`prace` (galeria prac artysty) i `media` (zdjęcia prac, `typ='praca'`) czytane na stronie artysty.
Częste pola: `url_artysty`/`url_wystawy`/`url_targu`/`slug` (klucze w URL), `widocznosc_strona`
(`aktywny`/`archiwum`), `publiczne` (bool), `kategoria`, `kolejnosc`, `cover`.

## Znane słabe punkty (dług techniczny)

1. **Niespójny Nav.** `components/Nav.tsx` używają tylko `/`, `/artysci`, `/wystawy`, `/targi`.
   Strony `artysta`, `wystawa`, `targ`, `idee`, `kompendium` mają zduplikowany ręczny `<nav>`
   z różnymi pozycjami menu. (Temat 5 ostatnich commitów „fix: nav…".)
2. **Martwe linki.** Menu wskazuje `/kolekcja`, `/viewing-room`, `/o-nas` — te strony nie istnieją.
   Większość linków w footerze to `href="#"`.
3. **Klient Supabase tworzony 8×** — osobno w każdej stronie. Gotowy `supabase.ts` w roocie
   istnieje, ale nikt go nie importuje.
4. **Brak typów bazy.** Liczne `any` przy joinach Supabase.
5. Drobiazgi: `paddingTop` nadpisywane przez `padding` (artysci/targi/idee), `.DS_Store` w repo.

## Uruchomienie

`npm run dev` (http://localhost:3000). Wymaga env: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` (poza repo — `.gitignore` wyklucza `.env*`).
