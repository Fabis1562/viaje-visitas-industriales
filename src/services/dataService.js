import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  increment
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase';

export const INITIAL_TRIP_DATA = {
  title: 'Viaje de Prácticas Académicas 2026',
  subtitle: 'Ruta Tecnológica, Innovación Industrial y Desarrollo Profesional',
  institution: 'Instituto Tecnológico / Universidad',
  career: 'Ingeniería y Áreas Afines (1° a 9° Semestre)',
  capacity: 80,
  registeredCount: 20,
  registrationDeadline: '2026-11-15',
  destination: {
    city: '¡Destino Sorpresa! (Por anunciar)',
    country: 'México',
    highlight: 'Ruta Tecnológica y Parques Industriales',
    description: 'Inmersión técnica en centros de desarrollo tecnológico, plantas industriales de manufactura inteligente y laboratorios universitarios. El destino sede oficial se mantendrá en reserva y será anunciado por el comité organizador.',
    imageUrl: '/hero-destiny.jpg',
    visitingSpots: [
      { name: 'Centro de Desarrollo Tecnológico & TI', type: 'Visita Técnica' },
      { name: 'Planta de Automatización y Robótica', type: 'Práctica de Campo' },
      { name: 'Parque de Investigación e Innovación', type: 'Ponencia y Networking' },
      { name: 'Recorrido Cultural y Centro Histórico', type: 'Actividad Cultural' }
    ]
  },
  hotel: {
    name: 'Hotel Sede Ejecutivo (Por confirmar)',
    category: '4 Estrellas Superior',
    address: 'Zona Hotelera Ejecutiva de Primer Nivel',
    description: 'Hotel moderno de negocios con instalaciones de primer nivel, diseñado para grupos de viaje con seguridad privada, habitaciones cuádruples y dobles equipadas, y desayuno tipo buffet incluido todos los días.',
    imageUrl: '/hotel-resort.jpg',
    amenities: [
      'Desayuno Buffet Diario Incluido',
      'WiFi de Alta Velocidad en Habitaciones y Áreas Comunes',
      'Alberca climatizada y Terraza de descanso',
      'Habitaciones con Clima, TV Smart y Baño Privado',
      'Seguridad privada las 24 horas y Acceso con tarjeta electrónica',
      'Centro de negocios y Sala de conferencias'
    ]
  },
  logistics: {
    departure: {
      date: '2027-04-05',
      time: '06:00 AM',
      meetingPoint: 'Punto de Reunión Oficial (Por confirmar)',
      boardingTime: '05:30 AM',
      notes: 'Llegar puntuales con credencial escolar vigente e INE.'
    },
    returnTrip: {
      date: '2027-04-09',
      time: '07:30 PM',
      estimatedArrival: 'Mismo punto de partida',
      notes: 'Se notificará por grupo de WhatsApp el avance en carretera.'
    },
    transport: {
      type: 'Autobús Irizar i8 Gran Turismo 2024',
      features: [
        'Aire acondicionado integral y calefacción',
        'Asientos reclinables ejecutivos con puertos USB',
        'Pantallas individuales / colectivas HD',
        'Sanitario para damas y caballeros',
        'Seguro de viajero con cobertura médica amplia en autopistas de cuota',
        'Dos choferes certificados para relevo nocturno'
      ]
    }
  },
  itinerary: [
    {
      day: 1,
      dateTitle: 'Día 1 - Salida y Llegada a Destino',
      theme: 'Trayecto, Check-in y Encuentro Grupal',
      activities: [
        { time: '05:30 AM', title: 'Cita y Pase de Lista', location: 'Punto de Reunión Oficial', desc: 'Recepción de equipaje, revisión de documentos y asignación de asientos.' },
        { time: '06:00 AM', title: 'Salida en Autobús Gran Turismo', location: 'Carretera / Autopista', desc: 'Inicio del viaje de prácticas con paradas técnicas para refrigerio.' },
        { time: '01:30 PM', title: 'Llegada y Check-in en Hotel Sede', location: 'Hotel Ejecutivo', desc: 'Entrega de llaves, asignación de habitaciones y desempaque.' },
        { time: '03:30 PM', title: 'Almuerzo Buffet de Bienvenida', location: 'Restaurante del Hotel', desc: 'Comida incluida para todo el contingente estudiantil.' },
        { time: '05:30 PM', title: 'Recorrido de Integración y Centro Histórico', location: 'Zona Turística y Cultural', desc: 'Paseo guiado de bienvenida y recorrido cultural.' },
        { time: '08:30 PM', title: 'Cena Libre y Descanso', location: 'Zona Gastronómica', desc: 'Retorno al hotel para descanso reglamentario.' }
      ]
    },
    {
      day: 2,
      dateTitle: 'Día 2 - Inmersión Industrial Técnica',
      theme: 'Visitas Técnicas y Ponencias con Líderes del Sector',
      activities: [
        { time: '07:30 AM', title: 'Desayuno Buffet en Hotel', location: 'Comedor del Hotel', desc: 'Desayuno completo para recargar energía antes de la jornada.' },
        { time: '08:45 AM', title: 'Traslado al Parque de Investigación Tecnológica', location: 'Unidad de Transporte', desc: 'Salida puntual con código de vestimenta formal/bata de laboratorio.' },
        { time: '09:30 AM', title: 'Visita Técnica 1: Centro de Innovación & Software', location: 'Hub de Desarrollo Tecnológico', desc: 'Demostración de arquitectura de servidores en la nube, ciberseguridad y pipelines de IA.' },
        { time: '01:00 PM', title: 'Comida de Networking', location: 'Cafetería del Parque Científico', desc: 'Intercambio con ponentes y alumnos residentes.' },
        { time: '02:30 PM', title: 'Visita Técnica 2: Planta de Manufactura Automatizada', location: 'Línea de Robótica y PLC', desc: 'Supervisión en vivo de brazos robóticos, control numérico y control de calidad.' },
        { time: '06:30 PM', title: 'Retorno a Hotel y Tiempo de Aseo', location: 'Hotel Sede', desc: 'Descanso previo a la cena.' },
        { time: '08:00 PM', title: 'Cena Grupal y Taller de Preguntas y Respuestas', location: 'Salón de Eventos del Hotel', desc: 'Evaluación del aprendizaje del día y asesoría para residencias profesionales.' }
      ]
    },
    {
      day: 3,
      dateTitle: 'Día 3 - Prácticas de Campo y Talleres',
      theme: 'Laboratorios Especializados y Sistemas Mecatrónicos',
      activities: [
        { time: '08:00 AM', title: 'Desayuno Buffet', location: 'Hotel Sede', desc: 'Desayuno caliente incluido.' },
        { time: '09:30 AM', title: 'Taller Práctico / Workshop Universitario', location: 'Campus Universitario Tecnológico', desc: 'Taller interactivo en laboratorios de simulación y sistemas mecatrónicos.' },
        { time: '01:30 PM', title: 'Comida Típica Regional', location: 'Mercado Gastronómico Tradicional', desc: 'Experiencia gastronómica y convivencia estudiantil.' },
        { time: '04:00 PM', title: 'Visita Cultural y Mirador', location: 'Mirador Panorámico / Museo', desc: 'Fotografía grupal oficial de la generación y tiempo libre supervisado.' },
        { time: '08:30 PM', title: 'Cena Grupal y Actividad de Integración', location: 'Restaurante Local', desc: 'Convivencia e intercambio de experiencias entre semestres.' }
      ]
    },
    {
      day: 4,
      dateTitle: 'Día 4 - Ecosistema de Innovación & Cultura',
      theme: 'Museos de Ciencia, Tecnología y Networking Estudiantil',
      activities: [
        { time: '08:30 AM', title: 'Desayuno Buffet en Hotel', location: 'Comedor del Hotel', desc: 'Desayuno buffet completo para todo el contingente.' },
        { time: '10:00 AM', title: 'Visita Técnica: Museo de Ciencia e Historia Industrial', location: 'Complejo Cultural y Tecnológico', desc: 'Recorrido por la galería de historia de la industria y laboratorio de física aplicada.' },
        { time: '01:30 PM', title: 'Almuerzo Grupal', location: 'Zona Turística', desc: 'Comida y tiempo de recreación supervisada.' },
        { time: '04:00 PM', title: 'Sesión de Retos Tecnológicos y Networking', location: 'Centro de Emprendimiento', desc: 'Mesa redonda sobre proyectos de titulación e impacto en el mercado laboral.' },
        { time: '08:30 PM', title: 'Noche de Gala y Clausura Académica', location: 'Terraza del Hotel', desc: 'Entrega de reconocimientos de participación y charla de clausura.' }
      ]
    },
    {
      day: 5,
      dateTitle: 'Día 5 - Check-out, Última Visita y Regreso',
      theme: 'Cierre de Prácticas, Check-out y Trayecto de Retorno',
      activities: [
        { time: '08:00 AM', title: 'Desayuno y Check-out del Hotel', location: 'Lobby del Hotel Sede', desc: 'Revisión de habitaciones, entrega de llaves y carga de equipaje en autobús.' },
        { time: '09:30 AM', title: 'Visita Técnica de Cierre: Centro de Distribución y Logística', location: 'Parque Logístico', desc: 'Conocimiento de sistemas de almacenamiento automatizado y cadenas de suministro.' },
        { time: '01:00 PM', title: 'Última Parada Comercial y Comida', location: 'Centro Comercial', desc: 'Tiempo para alimentos del camino y compra de recuerdos.' },
        { time: '02:30 PM', title: 'Salida Oficial en Carretera', location: 'Autopista de Retorno', desc: 'Inicio del viaje de regreso con paradas en casetas para refrigerio.' },
        { time: '07:30 PM', title: 'Arribo al Punto de Partida', location: 'Campus de Origen', desc: 'Recepción por familiares, entrega de equipaje y fin del viaje de prácticas.' }
      ]
    }
  ]
};

// Registros de demostración iniciales para mostrar la tabla con datos reales
export const INITIAL_REGISTRATIONS = [
  {
    id: 'demo-1',
    fullName: 'Carlos Eduardo Ramírez Soto',
    controlNumber: '21090412',
    age: 21,
    semester: 7,
    group: 'A',
    phone: '5512345678',
    email: 'carlos.ramirez@instituto.edu.mx',
    notes: 'Interesado en el área de desarrollo de software y nube.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'demo-2',
    fullName: 'Mariana Sofia Vega González',
    controlNumber: '22090155',
    age: 20,
    semester: 5,
    group: 'B',
    phone: '5587654321',
    email: 'mariana.vega@instituto.edu.mx',
    notes: 'Requiere menú vegetariano en comidas.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'demo-3',
    fullName: 'Alejandro Morales Mendoza',
    controlNumber: '20090883',
    age: 22,
    semester: 9,
    group: 'A',
    phone: '5533445566',
    email: 'alejandro.morales@instituto.edu.mx',
    notes: 'Buscando empresas para residencias profesionales.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  },
  {
    id: 'demo-4',
    fullName: 'Valeria Itzel Hernández Luna',
    controlNumber: '23090024',
    age: 19,
    semester: 3,
    group: 'C',
    phone: '5577889900',
    email: 'valeria.hernandez@instituto.edu.mx',
    notes: 'Primer viaje de prácticas.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'demo-5',
    fullName: 'Jorge Alberto Castro Peña',
    controlNumber: '24090008',
    age: 18,
    semester: 1,
    group: 'A',
    phone: '5599887766',
    email: 'jorge.castro@instituto.edu.mx',
    notes: 'Interesado en conocer las instalaciones.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

// OBTENER INFORMACIÓN DEL VIAJE
export const getTripInfo = async () => {
  const db = getDb();
  if (db) {
    try {
      const tripDocRef = doc(db, 'config', 'viaje_practicas');
      const snap = await getDoc(tripDocRef);
      if (snap.exists()) {
        return { ...INITIAL_TRIP_DATA, ...snap.data() };
      }
    } catch (err) {
      console.warn('Error leyendo viaje de Firebase, usando fallback local:', err);
    }
  }

  // Fallback en LocalStorage
  const localTrip = localStorage.getItem('viaje_practicas_info');
  if (localTrip) {
    try {
      const parsed = JSON.parse(localTrip);
      // Si la versión guardada en el navegador aún tenía el itinerario previo de 4 días
      // o nombres de destinos anteriores, actualizamos automáticamente al formato sorpresa oficial.
      if (parsed && (
        (Array.isArray(parsed.itinerary) && parsed.itinerary.length < 5) ||
        (parsed.destination?.city && parsed.destination.city.includes('Monterrey')) ||
        (parsed.hotel?.address && parsed.hotel.address.includes('Constitución'))
      )) {
        const migrated = {
          ...INITIAL_TRIP_DATA,
          ...parsed,
          destination: INITIAL_TRIP_DATA.destination,
          hotel: INITIAL_TRIP_DATA.hotel,
          itinerary: INITIAL_TRIP_DATA.itinerary,
          logistics: {
            ...INITIAL_TRIP_DATA.logistics,
            ...(parsed.logistics || {}),
            returnTrip: INITIAL_TRIP_DATA.logistics.returnTrip
          }
        };
        localStorage.setItem('viaje_practicas_info', JSON.stringify(migrated));
        return migrated;
      }
      return parsed;
    } catch {
      // ignore
    }
  }

  return INITIAL_TRIP_DATA;
};

// ACTUALIZAR INFORMACIÓN DEL VIAJE
export const saveTripInfo = async (newTripData) => {
  // Siempre guardar en LocalStorage
  localStorage.setItem('viaje_practicas_info', JSON.stringify(newTripData));

  const db = getDb();
  if (db) {
    try {
      const tripDocRef = doc(db, 'config', 'viaje_practicas');
      await setDoc(tripDocRef, newTripData, { merge: true });
      return { success: true, mode: 'firebase' };
    } catch (err) {
      console.error('Error guardando en Firebase:', err);
      return { success: true, mode: 'local', warning: 'Guardado localmente. Error en Firebase.' };
    }
  }

  return { success: true, mode: 'local' };
};

// OBTENER CONTADOR PÚBLICO EN TIEMPO REAL (Seguro para visitantes, no expone datos de alumnos)
export const getPublicRegisteredCount = async () => {
  const db = getDb();
  if (db) {
    try {
      const metaSnap = await getDoc(doc(db, 'metadata_viaje', 'contador'));
      if (metaSnap.exists() && typeof metaSnap.data().count === 'number') {
        return metaSnap.data().count;
      }
      const tripSnap = await getDoc(doc(db, 'config', 'viaje_practicas'));
      if (tripSnap.exists() && typeof tripSnap.data().registeredCount === 'number') {
        return tripSnap.data().registeredCount;
      }
    } catch (err) {
      console.warn('Error leyendo contador público:', err);
    }
  }
  return INITIAL_TRIP_DATA.registeredCount || 20;
};

// SINCRONIZAR CONTADOR PÚBLICO (Llamado al autenticar en AdminModal)
export const syncPublicCount = async (count) => {
  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, 'metadata_viaje', 'contador'), { count }, { merge: true });
      await setDoc(doc(db, 'config', 'viaje_practicas'), { registeredCount: count }, { merge: true });
    } catch (err) {
      console.warn('Error sincronizando contador en Firebase:', err);
    }
  }
};

// OBTENER LISTA DE ALUMNOS REGISTRADOS (Acceso restringido para administradores)
export const getRegistrations = async () => {
  const db = getDb();
  if (db) {
    try {
      const q = query(collection(db, 'interesados_viaje'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString()
        });
      });
      return items;
    } catch (err) {
      console.warn('Error leyendo registros de Firebase (requiere sesión activa de administrador):', err);
      throw err;
    }
  }

  // Fallback LocalStorage (únicamente en modo sin conexión a Firebase)
  const localRegs = localStorage.getItem('viaje_registros_alumnos');
  if (localRegs) {
    try {
      const parsed = JSON.parse(localRegs);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
  }

  return [];
};

// CONTROL DE LÍMITE DIARIO Y PREVENCIÓN DE SATURACIÓN DE FIREBASE
const SUBMISSION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 Horas de protección

export const checkDailySubmissionLimit = () => {
  const lastTime = localStorage.getItem('viaje_last_submission_time');
  const lastStudent = localStorage.getItem('viaje_last_submitted_student');
  
  if (!lastTime) {
    return { limited: false };
  }

  const elapsed = Date.now() - parseInt(lastTime, 10);
  if (elapsed < SUBMISSION_COOLDOWN_MS) {
    const remainingMs = SUBMISSION_COOLDOWN_MS - elapsed;
    const hoursRemaining = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    let parsedStudent = null;
    try {
      if (lastStudent) parsedStudent = JSON.parse(lastStudent);
    } catch {
      // ignore
    }

    return {
      limited: true,
      hoursRemaining,
      minutesRemaining: Math.max(1, minutesRemaining),
      student: parsedStudent,
      submittedAt: new Date(parseInt(lastTime, 10)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  return { limited: false };
};

export const clearDailySubmissionLimit = () => {
  localStorage.removeItem('viaje_last_submission_time');
  localStorage.removeItem('viaje_last_submitted_student');
};

// AGREGAR NUEVO REGISTRO DE ALUMNO CON PROTECCIÓN CONTRA SPAM Y PRIVACIDAD TOTAL
export const registerStudent = async (studentData) => {
  // 1. Validar límite de 1 registro por día en el dispositivo
  const limitCheck = checkDailySubmissionLimit();
  if (limitCheck.limited) {
    return {
      success: false,
      error: 'rate_limit',
      message: `Ya se envió un registro hoy desde este equipo. Para evitar saturación, solo se permite un registro cada 24 horas (Próximo envío disponible en: ${limitCheck.hoursRemaining}h ${limitCheck.minutesRemaining}m).`
    };
  }

  const normalizedControl = (studentData.controlNumber || '').trim().toUpperCase();

  const record = {
    ...studentData,
    controlNumber: normalizedControl,
    createdAt: new Date().toISOString()
  };

  const db = getDb();
  let firebaseId = null;

  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'interesados_viaje'), {
        ...record,
        createdAt: serverTimestamp()
      });
      firebaseId = docRef.id;

      // Incrementar contador público en tiempo real sin exponer datos personales
      await setDoc(doc(db, 'metadata_viaje', 'contador'), {
        count: increment(1)
      }, { merge: true });
    } catch (err) {
      console.warn('Error registrando en Firebase:', err);
    }
  }

  const newEntry = {
    ...record,
    id: firebaseId || 'reg-' + Date.now()
  };

  // Registrar marca de tiempo del envío exitoso SOLO para este alumno en su dispositivo
  localStorage.setItem('viaje_last_submission_time', Date.now().toString());
  localStorage.setItem('viaje_last_submitted_student', JSON.stringify({
    fullName: newEntry.fullName,
    controlNumber: newEntry.controlNumber,
    semester: newEntry.semester,
    group: newEntry.group,
    createdAt: newEntry.createdAt
  }));

  return {
    success: true,
    data: newEntry,
    syncedFirebase: Boolean(firebaseId)
  };
};

// ELIMINAR REGISTRO DE ALUMNO
export const deleteStudentRegistration = async (id) => {
  const db = getDb();
  if (db && !id.startsWith('reg-') && !id.startsWith('demo-')) {
    try {
      await deleteDoc(doc(db, 'interesados_viaje', id));
    } catch (err) {
      console.warn('Error eliminando en Firebase:', err);
    }
  }

  // Eliminar de local storage
  const localRegs = await getRegistrations();
  const filtered = localRegs.filter(r => r.id !== id);
  localStorage.setItem('viaje_registros_alumnos', JSON.stringify(filtered));

  return { success: true };
};
