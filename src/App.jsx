import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TripDetails } from './components/TripDetails';
import { ItinerarySection } from './components/ItinerarySection';
import { RegistrationSection } from './components/RegistrationSection';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { 
  getTripInfo, 
  saveTripInfo, 
  INITIAL_TRIP_DATA 
} from './services/dataService';

export function App() {
  const [tripData, setTripData] = useState(INITIAL_TRIP_DATA);
  const [registeredCount, setRegisteredCount] = useState(INITIAL_TRIP_DATA.registeredCount || 18);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Cargar únicamente información pública del viaje al iniciar (CERO fuga de datos de alumnos)
  useEffect(() => {
    const loadPublicData = async () => {
      try {
        const trip = await getTripInfo();
        if (trip) {
          setTripData(trip);
          if (typeof trip.registeredCount === 'number') {
            setRegisteredCount(trip.registeredCount);
          }
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

  return (
    <div className="app-layout">
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

        {/* Formulario de Registro de Alumnos Interesados (1° a 9° Semestre) */}
        <RegistrationSection 
          onRegistrationSuccess={handleRegistrationSuccess}
          tripTitle={tripData?.title}
          registrationDeadline={tripData?.registrationDeadline}
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
      />

      {/* Botón Flotante de Contacto por WhatsApp */}
      <WhatsAppButton />
    </div>
  );
}

export default App;
