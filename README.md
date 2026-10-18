# SaveBite

> *Mai puțină risipă. Mai mult bine.*

**SaveBite** este o platformă care leagă magazinele, brutăriile și restaurantele locale de oamenii din apropiere. Comercianții pun la reducere produsele aproape de expirare sau rămase nevândute la final de zi, iar clienții le găsesc pe hartă și le rezervă înainte să ajungă la gunoi.

Un asistent AI lucrează pentru ambele părți:

- **pentru comercianți:** transformă ce scrie angajatul la final de tură (*„Am 5 baghete și 3 croissante care expiră la 19:00, le lăsăm la 10 lei de la 25”*) într-o ofertă gata publicată;
- **pentru clienți:** recomandă oferte și trimite notificări în funcție de locație și preferințe, de exemplu: *„La brutăria de lângă tine, croissantul cu vanilie e acum redus.”*

Proiect realizat în cadrul hackathonului **EvoHR**.

---

## Problema și soluția

În fiecare seară, în orice oraș, se aruncă mâncare bună: pâine, patiserie, meniuri gătite, legume. Pentru comerciant înseamnă pierdere de bani, pentru oraș înseamnă risipă, iar pentru mulți oameni ar fi fost o masă la jumătate de preț.

SaveBite rezolvă trei lucruri:

1. **Publicare rapidă.** Angajatul descrie surplusul în cuvintele lui, iar oferta apare în aplicație în câteva secunde.
2. **Descoperire locală.** Clientul vede pe hartă ce oferte sunt în jurul lui, cu preț, reducere și timpul rămas.
3. **Notificări la momentul potrivit.** Când o ofertă potrivită apare aproape de client, acesta primește o notificare scrisă de AI, înainte să expire oferta.

---

## Funcționalități

### Aplicația pentru clienți
- **Explorare oferte:** filtrare pe categorii (brutărie, patiserie, restaurant, cafenea, băcănie), cu reducerea, timpul rămas și distanța afișate pe fiecare card.
- **Hartă de proximitate:** hartă OpenStreetMap centrată pe locația utilizatorului, cu câte un marker pentru fiecare ofertă activă din apropiere.
- **Rezervare:** rezervarea unui pachet dintr-un click, cu cod de ridicare la casă.
- **Favorite și preferințe:** localurile salvate stabilesc ce tip de oferte primește clientul.
- **Recomandări și notificări AI:** mesaje personalizate, primite în timp real, despre ofertele din apropiere.

### Portalul pentru comercianți
- **Gestionare stocuri:** actualizarea rapidă a numărului de pachete disponibile.
- **Asistent AI pentru angajați:** descrierea surplusului în limbaj natural, transformată într-o ofertă structurată (produs, preț, cantitate, expirare).
- **Statistici de impact:** bani recuperați, pachete vândute, mâncare salvată de la risipă.

---

Cum ajunge o notificare la client:

1. Aplicația trimite periodic locația clientului și categoriile preferate (`POST /notifications/location`).
2. Când un comerciant publică sau reduce un produs, backend-ul caută clienții conectați aflați în rază și cu preferința potrivită.
3. Modulul AI primește ofertele din apropiere și scrie, în română, un mesaj scurt și personal.
4. Mesajul ajunge instant în aplicație prin Server-Sent Events și apare ca notificare.

Dacă AI-ul nu e disponibil (lipsește cheia, limită de cereri, eroare), modulul trimite mesaje generate din șabloane, deci notificările merg în continuare. Fiecare ofertă e trimisă unui client o singură dată, iar între două notificări există o pauză, ca să nu fie spam.

---

## Structura proiectului

```
EvoHR-Hackathon-/
├── frontend/              # Aplicația web (clienți + portal comercianți)
│   └── src/
│       ├── components/    # UI, hartă (map/OffersMap), carduri, modale AI
│       ├── hooks/         # useNotifications (SSE), useLocationSync (GPS → backend)
│       ├── lib/api.ts     # apelurile către backend
│       └── pages/         # Explorează, Favorite, Comenzi, Profil, Dashboard partener
├── backend/               # API NestJS + Prisma + MySQL
│   ├── prisma/            # schema bazei de date + seed
│   ├── src/modules/       # auth, stores, offers, reservations, admin, ai-map-notification
│   └── test/              # teste e2e (inclusiv ai-map-notification, fără bază de date)
```

Modulul `ai-map-notification` din backend conține proximitatea, notificările și recomandările AI. Locația și preferințele clienților sunt salvate în tabelul `UserLocation`.

---

## Tehnologii

| Zonă | Tehnologii |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Leaflet / react-leaflet, Lucide |
| Backend | NestJS 10, Prisma, MySQL 8, JWT + refresh token (cookie HttpOnly), Helmet, rate limiting |
| AI | Claude (Anthropic API), răspuns JSON validat cu Zod |
| Hartă și proximitate | OpenStreetMap, calcul de distanță (haversine), Server-Sent Events |

---

## Rulare locală

**Cerințe:** Node.js 20+ și MySQL 8.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # completează DATABASE_URL și secretele JWT
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

API-ul pornește pe `http://localhost:3000/api`.

### 2. Frontend

```bash
cd frontend
npm install
```

Creează fișierul `frontend/.env.local`:

```
VITE_API_URL=http://localhost:3000/api
```

Apoi:

```bash
npm run dev
```

Aplicația se deschide la `http://localhost:5173`.

### 3. Testarea modulului AI fără bază de date

Testul e2e al modulului `ai-map-notification` rulează cu date în memorie, fără MySQL și fără cheie AI:

```bash
cd backend
npx jest --config ./test/jest-e2e.json ai-map-notification
```

Verifică harta (`/offers/nearby`), recomandările, validarea locației și notificările în timp real, inclusiv pentru o ofertă nouă și pentru o reducere de preț.

---

## Variabile de mediu

| Variabilă | Unde | Rol |
|---|---|---|
| `DATABASE_URL` | backend | Conexiunea MySQL (`mysql://user:parola@host:3306/baza`) |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | backend | Semnarea token-urilor de autentificare |
| `CORS_ORIGIN` | backend | Originile frontend-ului care au voie să apeleze API-ul |
| `ANTHROPIC_API_KEY` | backend | Cheia pentru Claude. Fără ea se folosesc mesajele-șablon |
| `NOTIFY_RADIUS_M` | backend | Raza pentru notificări, în metri (implicit 1000) |
| `NOTIFY_COOLDOWN_MS` | backend | Pauza minimă între două notificări pentru același client |
| `VITE_API_URL` | frontend | Adresa backend-ului |

Fișierele `.env` nu se urcă pe GitHub. Fiecare folder are un `.env.example` de pornire.

---

## API pe scurt

Toate rutele backend-ului au prefixul `/api`.

| Zonă | Endpoint-uri |
|---|---|
| Autentificare | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Magazine | `GET /stores`, `GET /stores/:id`, `PATCH /stores/:id` |
| Oferte | `GET /offers`, `GET /offers/:id`, `POST /offers`, `PATCH /offers/:id`, `DELETE /offers/:id` |
| Rezervări | `POST /reservations`, `GET /reservations/my`, `POST /reservations/:code/collect` |
| Hartă și proximitate | `GET /offers/nearby?lat=&lng=&radius=` |
| Notificări | `GET /notifications/stream?userId=` (SSE), `POST /notifications/location` |
| Recomandări AI | `GET /recommendations?userId=&lat=&lng=&preferences=` |
| Administrare | `GET /admin/overview`, `/admin/users`, `/admin/stores`, `/admin/reservations`, `/admin/audit-logs` |

---

## Echipa

Proiectul a fost împărțit în trei părți:

| Parte | Responsabil |
|---|---|
| Interfața pentru clienți și panoul pentru comercianți (frontend) | LiviuGav |
| Baza de date și backend-ul | EHRp1 |
| AI, hartă, proximitate și notificări | RedZone02 |
