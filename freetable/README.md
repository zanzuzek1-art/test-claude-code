# FreeTable

Prototip aplikacije, v kateri:

- **gostje** vidijo zasedenost barov in restavracij v živo (koliko mest je prostih) ter si ogledajo digitalni meni,
- **lokali** sami posodabljajo zasedenost, urejajo digitalni meni in nastavljajo **upsell pravila**.

## Upsell
Lastnik lokala nastavi pravilo, npr. *„če gost vzame ≥ 3× Malvazija – kozarec (1 dl), predlagaj Malvazija – steklenica (7,5 dl)“*.
Ko gost v košarico doda 3 kozarce, se mu prikaže namig s primerjavo **cene na dl** (3,20 €/dl proti 2,40 €/dl → 25 % ceneje)
in gumb, ki kozarce zamenja za steklenico.

## Zagon
Odpri `index.html` v brskalniku – strežnik ni potreben. Podatki se shranjujejo v `localStorage`
(gumb „Ponastavi demo podatke“ na nadzorni plošči jih ponastavi).

## Naslednji koraki (za pravo aplikacijo)
- backend + baza (npr. Supabase / Firebase), da zasedenost vidijo vsi gostje v realnem času
- prijava za lokale, QR koda na mizi, ki odpre meni
- zemljevid lokalov, rezervacije, pošiljanje naročil natakarju
