# Truck Route Planner (Mappls)

Browser seedha Mappls ke OAuth token endpoint ko call nahi kar sakta (CORS block).
Isliye ye chhota Node.js server hai jo token + route API calls peeche se (server-side)
karta hai, aur secret kabhi browser tak nahi jaata.

## Chalane ka tarika

1. Node.js install hona chahiye (version 18 ya usse upar): https://nodejs.org
2. Is folder mein terminal khol kar:
   ```
   npm install
   npm start
   ```
3. Browser mein kholo: http://localhost:3000

## Files
- `server.js` — backend (token + route proxy)
- `public/index.html` — frontend (map, form, results)
- `package.json` — dependencies

## Deploy karna ho (real website banani ho)
Isi server ko kisi hosting pe chala sakte ho (Render, Railway, a VPS, etc.) —
bas `npm install && npm start` chalana hoga wahan bhi. Client Secret hamesha
server pe hi rahega, kabhi frontend mein expose nahi hoga.
