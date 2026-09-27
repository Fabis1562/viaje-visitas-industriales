# 🚀 Guía de Configuración: Base de Datos Firebase & Despliegue en la Web

Esta plataforma para el **Viaje de Prácticas 2026** está construida con **React + Vite** y diseñada para funcionar de inmediato tanto en modo local como conectada a **Google Firebase Firestore** en la nube en tiempo real.

---

## 📌 Paso 1: Crear tu Base de Datos en Firebase (100% Gratis)

1. Ingresa a la consola de Firebase: [https://console.firebase.google.com/](https://console.firebase.google.com/) con tu cuenta de Google.
2. Haz clic en **"Crear un proyecto"** (o "Agregar proyecto").
3. Escribe un nombre para el proyecto (por ejemplo: `viaje-practicas-2026`) y presiona **Continuar**.
4. Desactiva Google Analytics (opcional, para acelerar la creación) y haz clic en **Crear proyecto**.

---

## 🗄️ Paso 2: Activar Firestore Database

1. En el panel izquierdo de Firebase, ve a **Compilación (Build)** > **Firestore Database**.
2. Haz clic en **"Crear base de datos"**.
3. Selecciona la ubicación de tu base de datos (por ejemplo, `nam5 (us-central)`).
4. En las reglas de seguridad, selecciona **"Comenzar en modo de prueba"** (Test mode). Esto permitirá que la app lea y escriba los registros sin restricciones iniciales mientras organizan el viaje.
5. Haz clic en **Habilitar**.

---

## 🔑 Paso 3: Obtener tus Credenciales de Conexión

1. En la parte superior izquierda, haz clic en el icono de **Engrane (⚙️)** > **Configuración del proyecto**.
2. Baja a la sección **"Tus apps"** y haz clic en el icono web **`</>`**.
3. Escribe un apodo (por ejemplo: `web-viaje`) y pulsa **Registrar app**.
4. Verás un bloque de código como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "viaje-practicas-2026.firebaseapp.com",
  projectId: "viaje-practicas-2026",
  storageBucket: "viaje-practicas-2026.appspot.com",
  messagingSenderId: "123456789...",
  appId: "1:123456789:web:abcdef..."
};
```

---

## ⚡ Paso 4: Conectar las Credenciales a la App

Tienes dos formas súper sencillas:

### Opción A (La más fácil, sin tocar código):
1. En la página web de tu viaje, pulsa el botón **"Admin"** (icono de escudo en el menú superior o en el pie de página).
2. Ingresa la contraseña de organizadores: `admin123`.
3. Ve a la pestaña **"Conexión Firebase"**.
4. Pega tus 6 valores (`apiKey`, `projectId`, etc.) y haz clic en **"Guardar Credenciales y Reconectar"**.
5. ¡Listo! El indicador cambiará a **🟢 Conectado a Firestore**.

### Opción B (Con archivo `.env`):
Crea un archivo llamado `.env` en la raíz del proyecto con tus valores:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=viaje-practicas-2026.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=viaje-practicas-2026
VITE_FIREBASE_STORAGE_BUCKET=viaje-practicas-2026.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
```

---

## 🌐 Paso 5: ¿Cómo subir la página a la Web para que los alumnos la abran?

### Subir a Vercel (Recomendado, Gratis y en 1 minuto):
1. Sube tu proyecto a GitHub (o arrastra la carpeta en la web de Vercel).
2. Entra a [https://vercel.com/](https://vercel.com/) e inicia sesión con GitHub.
3. Haz clic en **"Add New..."** > **Project** y selecciona el repositorio de `viaje`.
4. En **Environment Variables**, agrega las mismas variables de Firebase de tu `.env` (si usaste Opción B).
5. Pulsa **Deploy**.
6. ¡Listo! Vercel te dará un enlace oficial (ejemplo: `https://viaje-practicas.vercel.app`) para compartirlo por WhatsApp a todos los semestres.

---

## 🛡️ Credenciales de Administrador para los Organizadores
- **Contraseña del Panel Admin:** `admin123`
- **Funcionalidades del Administrador:**
  - Ver lista en tiempo real de alumnos interesados con búsqueda y filtros por semestre (1° al 9°) y grupo.
  - Botón **"Exportar a Excel / CSV"** para descargar la lista oficial con un clic.
  - Editar Lugar, Hotel, Salida, Regreso, Horarios e Itinerario sin tener que programar.
