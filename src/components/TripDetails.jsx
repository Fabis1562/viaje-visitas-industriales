import React from 'react';
import { 
  MapPin, 
  Hotel as HotelIcon, 
  Bus, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  ShieldCheck, 
  Coffee, 
  Wifi, 
  Waves, 
  Tv, 
  Lock,
  Building2,
  CalendarCheck
} from 'lucide-react';

export const TripDetails = ({ trip }) => {
  const dest = trip?.destination || {};
  const hotel = trip?.hotel || {};
  const log = trip?.logistics || {};

  return (
    <section id="detalles" className="section">
      <div className="container">
        
        {/* Cabecera de la Sección */}
        <div className="section-header">
          <div className="section-tag">
            <span className="badge badge-purple">
              <Navigation size={14} /> Información Clave del Viaje
            </span>
          </div>
          <h2 className="section-title">
            Conoce el Destino, Hotel y Logística
          </h2>
          <p className="section-desc">
            Todos los detalles que necesitas saber antes de subirte al autobús: lugares de visita, hotel sede, puntos de encuentro y horarios oficiales.
          </p>
        </div>

        {/* 1. Tarjeta de Destino y Puntos de Visita */}
        <div className="glass-panel info-card" style={{ marginBottom: '2.5rem' }}>
          <div className="info-card-header">
            <div className="icon-bubble icon-bubble-cyan">
              <MapPin size={26} />
            </div>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '0.4rem' }}>
                Lugar de Destino
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                {dest.city?.trim() || '¡Destino Sorpresa! (Por anunciar)'} • {dest.highlight?.trim() || 'Ruta Tecnológica y de Innovación'}
              </h3>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7' }}>
            {dest.description?.trim() || 'El destino oficial de nuestro viaje de prácticas 2027 se mantendrá en reserva como sorpresa y será anunciado por el comité organizador. Conoceremos plantas industriales de manufactura avanzada, centros de robótica y tecnología de primer nivel.'}
          </p>

          <div>
            <h4 style={{ fontSize: '1rem', color: '#e2e8f0', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} style={{ color: 'var(--accent-cyan)' }} />
              Puntos y Empresas Destacadas a Visitar:
            </h4>
            <div className="spot-chips-grid">
              {(dest.visitingSpots || []).map((spot, idx) => (
                <div key={idx} className="spot-chip">
                  <span className="spot-name">{spot.name}</span>
                  <span className="spot-type">{spot.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Hotel y Alojamiento */}
        <div id="hotel" className="glass-panel hotel-card" style={{ marginBottom: '2.5rem' }}>
          <div className="hotel-image-col">
            <img 
              src={hotel.imageUrl || '/hotel-resort.jpg'} 
              alt={hotel.name || 'Hotel del Viaje'} 
              className="hotel-img" 
            />
            <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
              <span className="badge badge-amber">
                ⭐ {hotel.category?.trim() || '4 Estrellas Superior'}
              </span>
            </div>
          </div>

          <div className="hotel-content-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-emerald">
                <HotelIcon size={14} /> Hospedaje Oficial
              </span>
            </div>

            <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              {hotel.name?.trim() ? hotel.name : 'Hotel Sede Ejecutivo (Por confirmar)'}
            </h3>

            <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
              <MapPin size={16} />
              {hotel.address?.trim() ? hotel.address : 'Zona Hotelera Ejecutiva de Primer Nivel'}
            </p>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {hotel.description?.trim() || 'Instalaciones de categoría diseñadas para el confort y la seguridad de los alumnos. Habitaciones climatizadas, salas de estudio y desayuno tipo buffet incluido todos los días del viaje.'}
            </p>

            <div>
              <h4 style={{ fontSize: '0.92rem', color: '#f1f5f9', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Servicios & Amenidades Incluidas:
              </h4>
              <ul className="amenity-list">
                {(hotel.amenities || [
                  'Desayuno Buffet Diario Incluido',
                  'WiFi de Alta Velocidad',
                  'Alberca climatizada y Terraza',
                  'Habitaciones con Clima y TV',
                  'Seguridad Privada 24/7',
                  'Acceso magnético a pisos'
                ]).map((amenity, index) => (
                  <li key={index} className="amenity-item">
                    <CheckCircle2 size={16} />
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Salida, Regreso y Horarios de Transporte */}
        <div className="grid-2">
          
          {/* Tarjeta de Salida */}
          <div className="glass-panel logistics-card logistics-departure">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="icon-bubble icon-bubble-blue">
                  <Bus size={24} />
                </div>
                <div>
                  <span className="badge badge-cyan">Punto de Salida</span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.2rem' }}>
                    Partida del Viaje
                  </h3>
                </div>
              </div>
              <CalendarCheck size={26} style={{ color: 'var(--accent-cyan)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="timeline-info-row">
                <Clock size={18} style={{ color: 'var(--accent-cyan)', marginTop: '0.2rem' }} />
                <div>
                  <div className="info-label">Fecha y Hora de Salida</div>
                  <div className="info-val">
                    {log?.departure?.date || '15 de Octubre 2026'} • {log?.departure?.time || '06:00 AM'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', marginTop: '0.2rem' }}>
                    * Hora de cita / pase de lista: {log?.departure?.boardingTime || '05:30 AM'}
                  </div>
                </div>
              </div>

              <div className="timeline-info-row">
                <MapPin size={18} style={{ color: 'var(--accent-cyan)', marginTop: '0.2rem' }} />
                <div>
                  <div className="info-label">Lugar de Reunión y Abordaje</div>
                  <div className="info-val">
                    {log?.departure?.meetingPoint || 'Explanada Principal del Instituto (Frente a Biblioteca)'}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  ⚠️ <strong>Recomendación:</strong> {log?.departure?.notes || 'Presentarse puntuales con credencial de estudiante y equipaje etiquetado.'}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Regreso */}
          <div className="glass-panel logistics-card logistics-return">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="icon-bubble icon-bubble-emerald">
                  <Navigation size={24} />
                </div>
                <div>
                  <span className="badge badge-emerald">Retorno y Arribo</span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.2rem' }}>
                    Regreso a Casa
                  </h3>
                </div>
              </div>
              <ShieldCheck size={26} style={{ color: 'var(--accent-emerald)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="timeline-info-row">
                <Clock size={18} style={{ color: 'var(--accent-emerald)', marginTop: '0.2rem' }} />
                <div>
                  <div className="info-label">Fecha y Hora Estimada de Llegada</div>
                  <div className="info-val">
                    {log?.returnTrip?.date || '19 de Octubre 2026'} • {log?.returnTrip?.time || '10:30 PM'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Sujeto a condiciones de tránsito y paradas reglamentarias de chofer.
                  </div>
                </div>
              </div>

              <div className="timeline-info-row">
                <MapPin size={18} style={{ color: 'var(--accent-emerald)', marginTop: '0.2rem' }} />
                <div>
                  <div className="info-label">Punto de Llegada y Desembarque</div>
                  <div className="info-val">
                    {log?.returnTrip?.estimatedArrival || 'Mismo punto de partida (Explanada del Instituto)'}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  📲 <strong>Monitoreo:</strong> {log?.returnTrip?.notes || 'Se compartirá ubicación en tiempo real en el grupo oficial del viaje durante el trayecto de regreso.'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
