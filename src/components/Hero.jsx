import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Sparkles, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const Hero = ({ trip, registeredCount }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateCountdown = () => {
      const departureDateStr = trip?.logistics?.departure?.date || '2026-10-15';
      const departureTimeStr = trip?.logistics?.departure?.time || '06:00 AM';
      
      // Parse tentative date
      const targetDate = new Date(`${departureDateStr}T06:00:00`);
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [trip]);

  const capacity = trip?.capacity || 45;
  const availableSpots = Math.max(0, capacity - registeredCount);
  const occupancyPercentage = Math.min(100, Math.round((registeredCount / capacity) * 100));

  return (
    <header id="inicio" className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Columna Izquierda: Información Principal */}
          <div className="hero-content">
            <div className="hero-pill">
              <span className="badge badge-cyan">
                <Sparkles size={14} />
                Convocatoria Abierta • 1° a 9° Semestre
              </span>
            </div>

            <h1 className="hero-title">
              {trip?.title || 'Viaje de Prácticas Académicas 2026'}
            </h1>

            <p className="hero-desc">
              {trip?.subtitle || 'Explora centros de tecnología, plantas industriales avanzadas y fortalece tu perfil profesional. Un viaje diseñado para estudiantes de ingeniería.'}
            </p>

            {/* Fila de Estadísticas Rápidas */}
            <div className="hero-stats-row">
              <div className="hero-stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)' }}>
                  <MapPin size={16} />
                  <span className="stat-label">Destino</span>
                </div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                  {trip?.destination?.city || 'Monterrey, N.L.'}
                </div>
              </div>

              <div className="hero-stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)' }}>
                  <Calendar size={16} />
                  <span className="stat-label">Fechas</span>
                </div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                  {trip?.itinerary?.length || 4} Días / 3 Noches
                </div>
              </div>

              <div className="hero-stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)' }}>
                  <Users size={16} />
                  <span className="stat-label">Cupo Disponible</span>
                </div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                  {availableSpots} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {capacity}</span>
                </div>
              </div>
            </div>

            {/* Barra de progreso de cupos */}
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '8px', overflow: 'hidden', margin: '0.2rem 0 1rem' }}>
              <div 
                style={{ 
                  width: `${occupancyPercentage}%`, 
                  height: '100%', 
                  background: 'var(--grad-primary)',
                  transition: 'width 0.6s ease'
                }} 
              />
            </div>

            {/* Botones de acción */}
            <div className="hero-cta-group">
              <a href="#registro" className="btn btn-primary" style={{ padding: '0.9rem 1.9rem', fontSize: '1.05rem' }}>
                <span>¡Quiero ir! Registrar Interés</span>
                <ArrowRight size={18} />
              </a>
              <a href="#itinerario" className="btn btn-secondary" style={{ padding: '0.9rem 1.6rem' }}>
                <Clock size={18} />
                <span>Ver Itinerario Completo</span>
              </a>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Visual y Cuenta Regresiva */}
          <div className="hero-visual-card">
            <img 
              src={trip?.destination?.imageUrl || '/hero-destiny.jpg'} 
              alt="Destino del Viaje de Prácticas" 
              className="hero-image"
            />
            <div className="hero-visual-overlay">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="badge badge-emerald">
                  <ShieldCheck size={14} /> Seguro de Viajero Incluido
                </span>
                <span className="badge badge-purple">
                  Transporte Irizar i8
                </span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                {trip?.destination?.highlight || 'Distrito de Innovación y Tecnología'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                Salida: {trip?.logistics?.departure?.date || '15 de Octubre 2026'} • {trip?.logistics?.departure?.time || '06:00 AM'}
              </p>

              {/* Caja de Cuenta Regresiva */}
              <div className="countdown-box">
                <div className="count-unit">
                  <span className="count-num">{timeLeft.days}</span>
                  <span className="count-label">Días</span>
                </div>
                <div className="count-unit">
                  <span className="count-num">{timeLeft.hours}</span>
                  <span className="count-label">Horas</span>
                </div>
                <div className="count-unit">
                  <span className="count-num">{timeLeft.minutes}</span>
                  <span className="count-label">Min</span>
                </div>
                <div className="count-unit">
                  <span className="count-num">{timeLeft.seconds}</span>
                  <span className="count-label">Seg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
