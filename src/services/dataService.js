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
  orderBy
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase';

export const INITIAL_TRIP_DATA = {
  title: 'Viaje de Prácticas Académicas 2026',
  subtitle: 'Ruta Tecnológica, Innovación Industrial y Desarrollo Profesional',
  institution: 'Instituto Tecnológico / Universidad',
  career: 'Ingeniería y Áreas Afines (1° a 9° Semestre)',
  capacity: 45,
  registrationDeadline: '2026-11-15',
  destination: {
    city: 'Monterrey, Nuevo León',
    country: 'México',
    highlight: 'Distrito de Innovación y Parque de Investigación Tecnológica (PIIT)',
    description: 'Recorrido técnico e inmersión industrial en empresas líderes de desarrollo de software, robótica industrial y centros de manufactura avanzada. Los alumnos tendrán ponencias directas con ingenieros en planta y sesiones de reclutamiento para residencias profesionales.',
    imageUrl: '/hero-destiny.jpg',
    visitingSpots: [
      { name: 'Centro de Desarrollo Tecnológico & TI', type: 'Visita Técnica' },
      { name: 'Planta de Automatización y Robótica', type: 'Práctica de Campo' },
      { name: 'Parque de Investigación e Innovación', type: 'Ponencia y Networking' },
      { name: 'Paseo Santa Lucía & Parque Fundidora', type: 'Actividad Cultural' }
    ]
  },
  hotel: {
    name: 'Azure Hotel & Suites Centro',
    category: '4 Estrellas Superior',
    address: 'Av. Constitución #1250, Zona Centro Metropolitano',
    description: 'Hotel moderno de negocios con instalaciones de primer nivel, diseñado para grupos de viaje con seguridad privada, habitaciones cuádruples y dobles equipadas, y desayuno tipo buffet incluido todos los días.',
    imageUrl: '/hotel-resort.jpg',
    amenities: [
      'Desayuno Buffet Americano Incluido',
      'WiFi de Alta Velocidad en Habitaciones y Áreas Comunes',
      'Alberca climatizada y Terraza de descanso',
      'Habitaciones con Clima, TV Smart y Baño Privado',
      'Seguridad privada las 24 horas y Acceso con tarjeta electrónica',
      'Centro de negocios y Sala de conferencias'
    ]
  },
  logistics: {
    departure: {
      date: '2026-10-15',
      time: '06:00 AM',
      meetingPoint: 'Explanada Principal del Instituto (Frente a Biblioteca)',
      boardingTime: '05:30 AM',
      notes: 'Llegar puntuales con credencial escolar vigente e INE.'
    },
    returnTrip: {
      date: '2026-10-19',
      time: '10:30 PM',
      estimatedArrival: 'Mismo punto de partida (Explanada del Instituto)',
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
      dateTitle: 'Jueves 15 de Octubre - Salida y Llegada a Destino',
      theme: 'Trayecto, Check-in y Encuentro Grupal',
      activities: [
        { time: '05:30 AM', title: 'Cita y Pase de Lista', location: 'Explanada del Instituto', desc: 'Recepción de equipaje, revisión de documentos y asignación de asientos.' },
        { time: '06:00 AM', title: 'Salida en Autobús Gran Turismo', location: 'Carretera Nacional', desc: 'Inicio del viaje de prácticas con paradas técnicas para almuerzo ligero.' },
        { time: '01:30 PM', title: 'Llegada y Check-in en Hotel Azure', location: 'Hotel Azure & Suites', desc: 'Entrega de llaves, asignación de habitaciones y desempaque.' },
        { time: '03:30 PM', title: 'Almuerzo Buffet de Bienvenida', location: 'Restaurante del Hotel', desc: 'Comida incluida para todo el contingente estudiantil.' },
        { time: '05:30 PM', title: 'Recorrido de Integración y Paseo Histórico', location: 'Parque Fundidora / Santa Lucía', desc: 'Paseo guiado por el parque industrial histórico y museos de tecnología.' },
        { time: '08:30 PM', title: 'Cena Libre y Descanso', location: 'Zona Restaurantera Centro', desc: 'Retorno al hotel a las 10:30 PM para descanso reglamentario.' }
      ]
    },
    {
      day: 2,
      dateTitle: 'Viernes 16 de Octubre - Inmersión Industrial Técnica',
      theme: 'Visitas Técnicas y Ponencias con Líderes del Sector',
      activities: [
        { time: '07:30 AM', title: 'Desayuno Buffet en Hotel', location: 'Comedor Hotel Azure', desc: 'Desayuno completo para recargar energía antes de la jornada.' },
        { time: '08:45 AM', title: 'Traslado al Parque de Investigación Tecnológica', location: 'Unidad de Transporte', desc: 'Salida puntual con código de vestimenta formal/bata de laboratorio.' },
        { time: '09:30 AM', title: 'Visita Técnica 1: Centro de Innovación & Software', location: 'Hub de Desarrollo Tecnológico', desc: 'Demostración de arquitectura de servidores en la nube, ciberseguridad y pipelines de IA.' },
        { time: '01:00 PM', title: 'Comida de Networking', location: 'Cafetería del Parque Científico', desc: 'Intercambio con ponentes y alumnos residentes.' },
        { time: '02:30 PM', title: 'Visita Técnica 2: Planta de Manufactura Automatizada', location: 'Línea de Robótica y PLC', desc: 'Supervisión en vivo de brazos robóticos, control numérico y control de calidad.' },
        { time: '06:30 PM', title: 'Retorno a Hotel y Tiempo de Aseo', location: 'Hotel Azure', desc: 'Descanso previo a la cena.' },
        { time: '08:00 PM', title: 'Cena Grupal y Taller de Preguntas y Respuestas', location: 'Salón de Eventos del Hotel', desc: 'Evaluación del aprendizaje del día y asesoría para residencias profesionales.' }
      ]
    },
    {
      day: 3,
      dateTitle: 'Sábado 17 de Octubre - Prácticas de Campo y Talleres',
      theme: 'Laboratorios Especializados y Sistemas Mecatrónicos',
      activities: [
        { time: '08:00 AM', title: 'Desayuno Buffet', location: 'Hotel Azure', desc: 'Desayuno caliente incluido.' },
        { time: '09:30 AM', title: 'Taller Práctico / Workshop Universitario', location: 'Campus Universitario Tecnológico', desc: 'Taller interactivo en laboratorios de simulación y sistemas mecatrónicos.' },
        { time: '01:30 PM', title: 'Comida Típica Regional', location: 'Mercado Gastronómico Tradicional', desc: 'Experiencia gastronómica y convivencia estudiantil.' },
        { time: '04:00 PM', title: 'Visita Cultural y Mirador', location: 'Mirador del Obispado / Museo', desc: 'Fotografía grupal oficial de la generación y tiempo libre supervisado.' },
        { time: '08:30 PM', title: 'Cena Grupal y Actividad de Integración', location: 'Restaurante Local', desc: 'Convivencia e intercambio de experiencias entre semestres.' }
      ]
    },
    {
      day: 4,
      dateTitle: 'Domingo 18 de Octubre - Ecosistema de Innovación & Cultura',
      theme: 'Museos de Ciencia, Tecnología y Networking Estudiantil',
      activities: [
        { time: '08:30 AM', title: 'Desayuno Buffet en Hotel', location: 'Comedor Hotel Azure', desc: 'Desayuno buffet completo para todo el contingente.' },
        { time: '10:00 AM', title: 'Visita Técnica: Museo de Acero Horno 3', location: 'Parque Fundidora', desc: 'Recorrido por la galería de historia de la industria del acero y laboratorio de física aplicada.' },
        { time: '01:30 PM', title: 'Almuerzo Grupal', location: 'Zona Fundidora / Paseo Santa Lucía', desc: 'Comida y tiempo de recreación supervisada.' },
        { time: '04:00 PM', title: 'Sesión de Retos Tecnológicos y Networking', location: 'Centro de Emprendimiento', desc: 'Mesa redonda sobre proyectos de titulación e impacto en el mercado laboral.' },
        { time: '08:30 PM', title: 'Noche de Gala y Clausura Académica', location: 'Terraza del Hotel', desc: 'Entrega de reconocimientos de participación y charla de clausura.' }
      ]
    },
    {
      day: 5,
      dateTitle: 'Lunes 19 de Octubre - Check-out, Última Visita y Regreso',
      theme: 'Cierre de Prácticas, Check-out y Trayecto de Retorno',
      activities: [
        { time: '08:00 AM', title: 'Desayuno y Check-out del Hotel', location: 'Lobby Hotel Azure', desc: 'Revisión de habitaciones, entrega de llaves y carga de equipaje en autobús.' },
        { time: '09:30 AM', title: 'Visita Técnica de Cierre: Centro de Distribución y Logística', location: 'Parque Logístico Norte', desc: 'Conocimiento de sistemas de almacenamiento automatizado y cadenas de suministro.' },
        { time: '01:00 PM', title: 'Última Parada Comercial y Comida', location: 'Centro Comercial Galerías', desc: 'Tiempo para alimentos del camino y compra de souvenirs.' },
        { time: '02:30 PM', title: 'Salida Oficial en Carretera', location: 'Autopista de Retorno', desc: 'Inicio del viaje de regreso con paradas en casetas para refrigerio.' },
        { time: '10:30 PM', title: 'Arribo a la Explanada del Instituto', location: 'Campus de Origen', desc: 'Recepción por familiares, entrega de equipaje y fin del viaje de prácticas.' }
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
      // Si la versión guardada en el navegador aún tenía el itinerario previo de 4 días,
      // actualizamos automáticamente a los 5 días oficiales para evitar datos obsoletos.
      if (parsed && Array.isArray(parsed.itinerary) && parsed.itinerary.length < 5) {
        const migrated = {
          ...INITIAL_TRIP_DATA,
          ...parsed,
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

// OBTENER LISTA DE ALUMNOS REGISTRADOS
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
      if (items.length > 0) return items;
    } catch (err) {
      console.warn('Error leyendo registros de Firebase, usando fallback local:', err);
    }
  }

  // Fallback LocalStorage
  const localRegs = localStorage.getItem('viaje_registros_alumnos');
  if (localRegs) {
    try {
      const parsed = JSON.parse(localRegs);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
  }

  // Si no hay datos, inicializamos con los registros demo
  localStorage.setItem('viaje_registros_alumnos', JSON.stringify(INITIAL_REGISTRATIONS));
  return INITIAL_REGISTRATIONS;
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

// AGREGAR NUEVO REGISTRO DE ALUMNO CON PROTECCIÓN CONTRA SPAM
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

  // 2. Validar que el número de control no esté ya registrado (evita duplicados en Firestore)
  const normalizedControl = (studentData.controlNumber || '').trim().toUpperCase();
  const existingRegs = await getRegistrations();
  const isDuplicate = existingRegs.some(
    r => (r.controlNumber || '').trim().toUpperCase() === normalizedControl
  );

  if (isDuplicate) {
    return {
      success: false,
      error: 'duplicate_control_number',
      message: `El número de control "${normalizedControl}" ya se encuentra registrado en la lista oficial. Si requieres modificar algún dato, contacta a los organizadores.`
    };
  }

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
    } catch (err) {
      console.warn('Error registrando en Firebase, guardando en local:', err);
    }
  }

  // Guardar en local storage para sincronización inmediata
  const newEntry = {
    ...record,
    id: firebaseId || 'reg-' + Date.now()
  };

  const updated = [newEntry, ...existingRegs];
  localStorage.setItem('viaje_registros_alumnos', JSON.stringify(updated));

  // Registrar marca de tiempo del envío exitoso
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
