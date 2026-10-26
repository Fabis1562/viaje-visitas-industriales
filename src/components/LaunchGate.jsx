import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Lock, 
  Sparkles, 
  MapPin, 
  Users, 
  Bus, 
  Hotel,
  ShieldCheck
} from 'lucide-react';

export const LaunchGate = ({ 
  trip, 
  onOpenAdmin, 
  onAccessGranted 
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  const openingDateStr = trip?.accessControl?.openingDate || '2026-10-15T08:00';

  useEffect(() => {
    const calculateCountdown = () => {
      try {
        const target = new Date(openingDateStr);
        const now = new Date();
        const diff = target.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
          if (onAccessGranted) {
            onAccessGranted();
          }
        } else {
          setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60),
            isPast: false
          });
        }
      } catch (err) {
        console.error('Error calculando countdown de apertura:', err);
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [openingDateStr, onAccessGranted]);

  // Formato amigable de fecha y hora en español
  const formatOpeningDateTime = (isoDateStr) => {
    if (!isoDateStr) return 'Próximamente';
    try {
      const date = new Date(isoDateStr);
      if (isNaN(date.getTime())) return isoDateStr;
      
      return date.toLocaleString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoDateStr;
    }
  };

  return (
    <div className="launch-gate-wrapper">
      {/* Luces y efectos de fondo */}
      <div className="launch-gate-glow launch-gate-glow-top" />
      <div className="launch-gate-glow launch-gate-glow-bottom" />

      {/* Barra superior discreta */}
      <header className="launch-gate-header">
        <div className="launch-gate-brand">
          <div className="launch-gate-logo">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="launch-gate-brand-title">
              {trip?.institution || 'Instituto Tecnológico / Universidad'}
            </span>
            <span className="launch-gate-brand-sub">Convocatoria de Viaje de Prácticas</span>
          </div>
        </div>

        <button 
          onClick={onOpenAdmin}
          className="btn btn-secondary launch-gate-admin-btn"
          title="Iniciar sesión de organizador"
        >
          <Lock size={15} />
          <span>Acceso Organizadores</span>
        </button>
      </header>

      {/* Contenido Central */}
      <main className="launch-gate-main">
        <div className="launch-gate-card glass-panel">
          {/* Badge de estado */}
          <div className="launch-gate-badge-wrapper">
            <span className="badge badge-amber" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem', gap: '0.5rem' }}>
              <Clock size={16} />
              Apertura Programada del Sitio
            </span>
          </div>

          <h1 className="launch-gate-title">
            {trip?.title || 'Viaje de Prácticas Académicas 2026'}
          </h1>

          <p className="launch-gate-subtitle">
            {trip?.subtitle || 'Ruta Tecnológica, Innovación Industrial y Desarrollo Profesional'}
          </p>

          {/* Contador Regresivo Principal */}
          <div className="launch-countdown-grid">
            <div className="launch-count-card">
              <span className="launch-count-val">{String(timeLeft.days).padStart(2, '0')}</span>
              <span className="launch-count-label">Días</span>
            </div>
            <div className="launch-count-sep">:</div>
            <div className="launch-count-card">
              <span className="launch-count-val">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="launch-count-label">Horas</span>
            </div>
            <div className="launch-count-sep">:</div>
            <div className="launch-count-card">
              <span className="launch-count-val">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="launch-count-label">Minutos</span>
            </div>
            <div className="launch-count-sep">:</div>
            <div className="launch-count-card launch-count-card-highlight">
              <span className="launch-count-val">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="launch-count-label">Segundos</span>
            </div>
          </div>

          {/* Fecha y hora programada */}
          <div className="launch-schedule-banner">
            <Calendar size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Apertura y Registro Oficial:
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>
                {formatOpeningDateTime(openingDateStr)}
              </div>
            </div>
          </div>

          {/* Mensaje personalizado de la coordinación */}
          {trip?.accessControl?.customMessage && (
            <div className="launch-custom-message">
              <p>"{trip.accessControl.customMessage}"</p>
            </div>
          )}

          {/* Resumen del viaje previo al lanzamiento */}
          <div className="launch-highlights-grid">
            <div className="launch-highlight-item">
              <MapPin size={17} style={{ color: 'var(--accent-cyan)' }} />
              <div>
                <span className="launch-hl-label">Destino</span>
                <span className="launch-hl-val">{trip?.destination?.city || '¡Destino Sorpresa!'}</span>
              </div>
            </div>

            <div className="launch-highlight-item">
              <Users size={17} style={{ color: 'var(--accent-emerald)' }} />
              <div>
                <span className="launch-hl-label">Cupo</span>
                <span className="launch-hl-val">{trip?.capacity || 80} Alumnos</span>
              </div>
            </div>

            <div className="launch-highlight-item">
              <Bus size={17} style={{ color: 'var(--accent-amber)' }} />
              <div>
                <span className="launch-hl-label">Transporte</span>
                <span className="launch-hl-val">Gran Turismo</span>
              </div>
            </div>

            <div className="launch-highlight-item">
              <Hotel size={17} style={{ color: 'var(--accent-purple)' }} />
              <div>
                <span className="launch-hl-label">Hospedaje</span>
                <span className="launch-hl-val">{trip?.hotel?.category || '4 Estrellas'}</span>
              </div>
            </div>
          </div>

          {/* Pie de la tarjeta */}
          <div className="launch-gate-footer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <ShieldCheck size={15} style={{ color: 'var(--accent-emerald)' }} />
              <span>Plataforma oficial protegida. Vuelve al finalizar la cuenta regresiva.</span>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <button 
                onClick={onOpenAdmin}
                className="btn btn-secondary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Lock size={14} />
                <span>¿Eres organizador? Iniciar sesión para editar o previsualizar</span>
              </button>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.5rem' }}>
              Atajo rápido de teclado: <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Ctrl + Shift + A</kbd>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
