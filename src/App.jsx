import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TripDetails } from './components/TripDetails';
import { ItinerarySection } from './components/ItinerarySection';
import { RegistrationSection } from './components/RegistrationSection';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { 
  getTripInfo, 
  saveTripInfo, 
  getRegistrations, 
  deleteStudentRegistration, 
  INITIAL_TRIP_DATA 
} from './services/dataService';

export function App() {
  const [tripData, setTripData] = useState(INITIAL_TRIP_DATA);
  const [registrations, setRegistrations] = useState([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const [trip, regs] = await Promise.all([
          getTripInfo(),
          getRegistrations()
        ]);
        if (trip) setTripData(trip);
        if (regs) setRegistrations(regs);
      } catch (err) {
        console.error('Error cargando datos de la app:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAppData();
  }, []);

  const handleRegistrationSuccess = (newStudent) => {
    setRegistrations(prev => [newStudent, ...prev]);
  };

  const handleUpdateTrip = async (newTrip) => {
    setTripData(newTrip);
    await saveTripInfo(newTrip);
  };

  const handleDeleteRegistration = async (id) => {
    await deleteStudentRegistration(id);
    setRegistrations(prev => prev.filter(r => r.id !== id));
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
          registeredCount={registrations.length} 
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
        registrations={registrations}
        tripData={tripData}
        onUpdateTrip={handleUpdateTrip}
        onDeleteRegistration={handleDeleteRegistration}
      />
    </div>
  );
}

export default App;
