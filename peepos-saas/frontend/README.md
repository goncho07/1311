Peepos es un sistema de gestión escolar moderno diseñado para colegios públicos en Lima, Perú. El frontend está construido con React, Vite y TypeScript, y se integra con Tailwind CSS a través del CDN oficial. La arquitectura está desacoplada para consumir un backend REST (por ejemplo, desplegado en Cloud Run) y está preparada para desplegarse fácilmente en Firebase Hosting.

## Requisitos previos

Antes de comenzar asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) 18 o superior (incluye `npm`).
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`) para desplegar en Firebase Hosting.

## Configuración del proyecto

1. **Clona el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_PROYECTO>
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   - Durante el desarrollo, crea un archivo `.env` en la raíz del proyecto con la URL de tu API:
     ```env
     VITE_API_BASE_URL=http://localhost:8080/api
     ```
   - Para producción, puedes sobrescribir los valores sin recompilar editando `public/env.js` antes de desplegar. Allí se define el objeto `window.__ENV__` que consume la aplicación en tiempo de ejecución.

## Scripts disponibles

- `npm run dev`: inicia el servidor de desarrollo de Vite (por defecto en `http://localhost:5173`).
- `npm run build`: genera la versión optimizada de producción en la carpeta `dist/`.
- `npm run preview`: sirve localmente el build de producción para pruebas finales.

## Preparación para Firebase Hosting

1. **Inicia sesión en Firebase**
   ```bash
   firebase login
   ```

2. **Selecciona tu proyecto** (si no lo hiciste antes)
   ```bash
   firebase use <ID_DEL_PROYECTO>
   ```

3. **Compila la aplicación**
   ```bash
   npm run build
   ```

4. **Despliega a Firebase Hosting**
   ```bash
   firebase deploy --only hosting
   ```

La configuración por defecto (`firebase.json`) ya redirige todas las rutas a `index.html`, lo que permite utilizar `BrowserRouter` sin problemas.

## Notas sobre Tailwind CSS

- Debido a restricciones del entorno, Tailwind CSS se carga mediante el CDN oficial (`https://cdn.tailwindcss.com`) en `index.html`.
- Si prefieres compilar Tailwind de forma local, instala `tailwindcss`, `postcss` y `autoprefixer`, restaura las directivas `@tailwind` en `src/index.css` y ajusta `postcss.config.js`.

## Soporte de Service Worker

El archivo `public/service-worker.js` implementa un caché básico para permitir funcionamiento offline limitado. La inscripción del service worker sólo ocurre en modo producción (`npm run build`) para evitar interferencias durante el desarrollo.

## Estructura relevante del proyecto

```
├── App.tsx
├── index.html
├── public/
│   ├── assets/
│   ├── env.js
│   └── service-worker.js
├── src/
│   ├── main.tsx
│   └── index.css
├── components/
├── pages/
├── services/
└── store/
```

Esta estructura permite extender módulos sin acoplarlos al punto de entrada y facilita la publicación en Firebase Hosting.
