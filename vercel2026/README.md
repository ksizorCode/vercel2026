# ParkAtlas — Setup en Vercel

## Estructura
```
vercel2026/
├── api/
│   └── atracciones.js     ← serverless function (GET/POST/PUT/DELETE)
├── public/
│   ├── index.html         ← frontend
│   └── atracciones.json   ← datos iniciales (fuente de verdad en GitHub)
└── vercel.json
```

## Cómo funciona
- El JSON vive en **tu repo de GitHub**
- La API serverless lo lee y escribe via **GitHub API**
- Cada añadir/editar/borrar hace un commit al repo → el JSON se actualiza
- Todos los usuarios ven los mismos datos en tiempo real

## Setup paso a paso

### 1. Sube el repo a GitHub
```bash
git init
git add .
git commit -m "init parkatlas"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### 2. Crea un GitHub Personal Access Token
1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Permisos: **Contents → Read and Write** sobre tu repo
3. Copia el token

### 3. Despliega en Vercel
```bash
npx vercel
```
O conecta el repo desde vercel.com → "Import Project"

### 4. Añade las variables de entorno en Vercel
En vercel.com → tu proyecto → Settings → Environment Variables:

| Variable | Valor |
|---|---|
| `GITHUB_TOKEN` | tu token de GitHub |
| `GITHUB_OWNER` | tu usuario de GitHub |
| `GITHUB_REPO` | nombre del repositorio |
| `GITHUB_FILE` | `public/atracciones.json` |

### 5. Redespliega
```bash
npx vercel --prod
```

## API endpoints
| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/atracciones` | Lista todas |
| POST | `/api/atracciones` | Añade una |
| PUT | `/api/atracciones` | Edita una |
| DELETE | `/api/atracciones?id=123` | Elimina una |
