import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TripDetails } from './components/TripDetails';
import { ItinerarySection } from './components/ItinerarySection';
import { RegistrationSection } from './components/RegistrationSection';
import { PaymentPlansSection } from './components/PaymentPlansSection';
import { AdminModal } from './components/AdminModal';
import { LaunchGate } from './components/LaunchGate';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Lock, Settings } from 'lucide-react';
import { 
  getTripInfo, 
  saveTripInfo, 
  getPublicRegisteredCount,
  INITIAL_TRIP_DATA 
} from './services/dataService';
import { onAdminAuthStateChanged } from './services/firebase';

export function App() {
  const [tripData, setTripData] = useState(INITIAL_TRIP_DATA);
  const [registeredCount, setRegisteredCount] = useState(INITIAL_TRIP_DATA.registeredCount || 20);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [forceUnlocked, setForceUnlocked] = useState(false);

  // Escuchar estado de autenticación del administrador
  useEffect(() => {
    const unsub = onAdminAuthStateChanged((user) => {
      setAdminUser(user);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Cargar únicamente información pública del viaje al iniciar (CERO fuga de datos de alumnos)
  useEffect(() => {
    const loadPublicData = async () => {
      try {
        const [trip, count] = await Promise.all([
          getTripInfo(),
          getPublicRegisteredCount()
        ]);
        if (trip) {
          setTripData(trip);
        }
        if (typeof count === 'number') {
          setRegisteredCount(count);
        } else if (typeof trip?.registeredCount === 'number') {
          setRegisteredCount(trip.registeredCount);
        }
      } catch (err) {
        console.error('Error cargando información pública del viaje:', err);
      }
    };

    loadPublicData();
  }, []);

  // Atajo de teclado discreto (Ctrl + Shift + A) y hash de URL (#admin) para organizadores
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };

    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHash);
    handleHash();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  const handleRegistrationSuccess = () => {
    setRegisteredCount(prev => prev + 1);
  };

  const handleUpdateTrip = async (newTrip) => {
    setTripData(newTrip);
    await saveTripInfo(newTrip);
  };

  const accessControl = tripData?.accessControl || {};
  const isOpeningScheduled = Boolean(
    accessControl.enabled && 
    accessControl.openingDate && 
    !forceUnlocked && 
    new Date() < new Date(accessControl.openingDate)
  );

  const isFullPageRestricted = isOpeningScheduled && accessControl.lockMode === 'full_page';

  // Si la página completa está bloqueada y no hay sesión activa de administrador
  if (isFullPageRestricted && !adminUser) {
    return (
      <div className="app-layout">
        <LaunchGate 
          trip={tripData} 
          onOpenAdmin={() => setIsAdminOpen(true)}
          onAccessGranted={() => setForceUnlocked(true)}
        />

        {/* Modal Administrativo accesible para ingresar credenciales */}
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          tripData={tripData}
          onUpdateTrip={handleUpdateTrip}
          onSyncCount={setRegisteredCount}
        />
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Banner discreto para organizadores cuando la apertura aún está programada */}
      {isFullPageRestricted && adminUser && (
        <div className="admin-mode-banner">
          <div className="admin-mode-banner-content">
            <Lock size={15} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <span>
              <strong>Modo Organizador:</strong> La página está en cuenta regresiva para los alumnos hasta el{' '}
              <strong style={{ color: '#fff' }}>
                {new Date(accessControl.openingDate).toLocaleString('es-MX', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </strong>
              . Estás navegando con acceso privilegiado de administrador.
            </span>
          </div>
          <button 
            onClick={() => setIsAdminOpen(true)} 
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
          >
            <Settings size={14} />
            <span>Ajustar Fechas</span>
          </button>
        </div>
      )}

      {/* Barra de Navegación */}
      <Navbar 
        onOpenAdmin={() => setIsAdminOpen(true)} 
        tripTitle={tripData?.title} 
      />

      <main>
        {/* Banner Principal con Convocatoria y Cuenta Regresiva */}
        <Hero 
          trip={tripData} 
          registeredCount={registeredCount} 
        />

        {/* Detalles: Destino, Hotel Sede, Salida, Regreso y Transporte */}
        <TripDetails 
          trip={tripData} 
        />

        {/* Cronograma / Itinerario Interactivo Día por Día con Horarios */}
        <ItinerarySection 
          itinerary={tripData?.itinerary} 
        />

        {/* Módulo de Planes de Pago, Abonos y Datos Bancarios (CLABE) */}
        <PaymentPlansSection 
          trip={tripData} 
        />

        {/* Formulario de Registro de Alumnos Interesados (1° a 9° Semestre) */}
        <RegistrationSection 
          onRegistrationSuccess={handleRegistrationSuccess}
          tripTitle={tripData?.title}
          registrationDeadline={tripData?.registrationDeadline}
          accessControl={tripData?.accessControl}
        />
      </main>

      {/* Pie de Página con Preguntas Frecuentes y Enlaces */}
      <Footer 
        onOpenAdmin={() => setIsAdminOpen(true)}
        trip={tripData}
      />

      {/* Modal / Panel Administrativo de Organizadores */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        tripData={tripData}
        onUpdateTrip={handleUpdateTrip}
        onSyncCount={setRegisteredCount}
      />

      {/* Botón Flotante de Contacto por WhatsApp */}
      <WhatsAppButton />
    </div>
  );
}

export default App;
