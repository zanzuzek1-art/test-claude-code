# FreeTable

Prototip aplikacije, v kateri:

- **gostje** vidijo zasedenost lokalov v živo, na tlorisu točno vidijo, katera miza je prosta, jo **rezervirajo** za izbrano uro in si ogledajo digitalni meni,
- **lokali** na tlorisu postavijo svoje mize (vlečenje), označujejo zasedene mize, potrjujejo rezervacije, urejajo digitalni meni in nastavljajo **upsell pravila**.

## Upsell
Lastnik lokala nastavi pravilo, npr. *„če gost vzame ≥ 3× Malvazija – kozarec (1 dl), predlagaj Malvazija – steklenica (7,5 dl)“*.
Ko gost v košarico doda 3 kozarce, se mu prikaže namig s primerjavo **cene na dl** (3,20 €/dl proti 2,40 €/dl → 25 % ceneje)
in gumb, ki kozarce zamenja za steklenico.
Gost vidi **največ en predlog na naročilo** – če se sproži več pravil, dobi tistega, pri katerem največ pridobi.

## Zagon
Odpri `index.html` v brskalniku – strežnik ni potreben. Podatki se shranjujejo v `localStorage`
(gumb „Ponastavi demo podatke“ na nadzorni plošči jih ponastavi).

## Naslednji koraki (za pravo aplikacijo)
- backend + baza (npr. Supabase / Firebase), da zasedenost vidijo vsi gostje v realnem času
- prijava za lokale, QR koda na mizi, ki odpre meni
- zemljevid lokalov, rezervacije, pošiljanje naročil natakarju
