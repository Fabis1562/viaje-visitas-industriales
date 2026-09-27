import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Compass, Briefcase, Utensils, Bed, Bus } from 'lucide-react';

export const ItinerarySection = ({ itinerary = [] }) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  if (!itinerary || itinerary.length === 0) {
    return null;
  }

  const currentDay = itinerary[activeDayIndex] || itinerary[0];

  // Helper para asignar icono según el tipo de actividad
  const getActivityIcon = (title = '', desc = '') => {
    const text = (title + ' ' + desc).toLowerCase();
    if (text.includes('desayuno') || text.includes('almuerzo') || text.includes('comida') || text.includes('cena')) {
      return <Utensils size={15} style={{ color: 'var(--accent-amber)' }} />;
    }
    if (text.includes('hotel') || text.includes('check-in') || text.includes('check-out') || text.includes('descanso')) {
      return <Bed size={15} style={{ color: 'var(--accent-purple)' }} />;
    }
    if (text.includes('salida') || text.includes('traslado') || text.includes('autobús') || text.includes('regreso')) {
      return <Bus size={15} style={{ color: 'var(--accent-cyan)' }} />;
    }
    return <Briefcase size={15} style={{ color: 'var(--accent-emerald)' }} />;
  };

  return (
    <section id="itinerario" className="section" style={{ background: 'rgba(10, 15, 29, 0.5)' }}>
      <div className="container">
        
        {/* Cabecera */}
        <div className="section-header">
          <div className="section-tag">
            <span className="badge badge-cyan">
              <Clock size={14} /> Cronograma Oficial
            </span>
          </div>
          <h2 className="section-title">
            Itinerario Día por Día y Horarios
          </h2>
          <p className="section-desc">
            Consulta las actividades técnicas programadas, tiempos de traslado, comidas y visitas a empresas para cada jornada.
          </p>
        </div>

        {/* Pestañas de Selección de Día */}
        <div className="itinerary-tabs">
          {itinerary.map((dayItem, index) => (
            <button
              key={index}
              className={`itinerary-tab-btn ${activeDayIndex === index ? 'active' : ''}`}
              onClick={() => setActiveDayIndex(index)}
            >
              <span>Día {dayItem.day || index + 1}</span>
              <span style={{ fontSize: '0.78rem', opacity: 0.8, marginLeft: '0.35rem' }}>
                {dayItem.dateTitle ? `(${dayItem.dateTitle.split('-')[0].trim()})` : ''}
              </span>
            </button>
          ))}
        </div>

        {/* Tarjeta del Día Activo */}
        <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '900px', margin: '0 auto' }}>
          
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-emerald">
                Día {currentDay.day || activeDayIndex + 1}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                {currentDay.theme || 'Jornada Académica e Industrial'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {currentDay.dateTitle || `Día ${currentDay.day}`}
            </h3>
          </div>

          {/* Línea de Tiempo de Horarios */}
          <div className="timeline-list">
            {(currentDay.activities || []).map((act, actIdx) => (
              <div key={actIdx} className="timeline-item">
                <div className="timeline-dot" />

                <div className="timeline-header">
                  <div className="timeline-time">
                    {getActivityIcon(act.title, act.desc)}
                    <span>{act.time}</span>
                  </div>

                  {act.location && (
                    <div className="timeline-location">
                      <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
                      <span>{act.location}</span>
                    </div>
                  )}
                </div>

                <h4 className="timeline-title">
                  {act.title}
                </h4>

                <p className="timeline-desc">
                  {act.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
