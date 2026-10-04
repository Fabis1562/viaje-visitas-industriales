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

## 🛡️ Paso 5: Autenticación Segura de Organizadores (Firebase Authentication)

Para evitar que los alumnos puedan acceder al panel de organizadores inspeccionando el código fuente:

1. En la consola de Firebase, ve a **Compilación (Build)** > **Authentication**.
2. Haz clic en **Comenzar** y activa el proveedor **Correo electrónico / Contraseña**.
3. En la pestaña **Users** (Usuarios), haz clic en **"Agregar usuario"**.
4. Ingresa el correo oficial del organizador (ejemplo: `organizador@instituto.edu.mx`) y una contraseña segura.
5. ¡Listo! Solo las personas registradas en esta lista podrán iniciar sesión en el panel y consultar los datos sensibles de los alumnos.

---

## 🔒 Paso 6: Activar las Reglas de Seguridad en Firestore (`firestore.rules`)

Para blindar la base de datos contra accesos no autorizados:

1. En la consola de Firebase, ve a **Compilación (Build)** > **Firestore Database** > pestaña **Reglas** (Rules).
2. Pega el contenido del archivo `firestore.rules` del proyecto:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Configuración general del viaje: lectura pública, modificación solo administradores
    match /config/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /config_viaje/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Datos privados de alumnos: registro público, lectura y borrado SOLO organizadores
    match /interesados_viaje/{docId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    match /metadata_viaje/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
3. Haz clic en **Publicar** (Publish).
4. Con esto, cualquier intento de un alumno de hackear la consola o usar React DevTools será rechazado automáticamente por Google con un error `403 Permission Denied`.

---

## 📱 Acceso al Panel de Organizadores
- **Atajo rápido en el teclado:** Presiona `Ctrl + Shift + A` (o `Cmd + Shift + A` en Mac).
- **Enlace secreto:** Agrega `#admin` al final de la URL del sitio.
- **Acceso visual discreto:** Haz clic 3 veces en el logo oficial del viaje en la barra de navegación, o haz clic en "Acceso Organizadores" al final del pie de página.
