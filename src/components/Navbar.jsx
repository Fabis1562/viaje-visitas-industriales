import React, { useState } from 'react';
import { Compass, Lock, MapPin, Calendar, Users, Hotel } from 'lucide-react';

export const Navbar = ({ onOpenAdmin, tripTitle }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleLogoClick = (e) => {
    setClickCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        onOpenAdmin();
        return 0;
      }
      return next;
    });
    setTimeout(() => setClickCount(0), 1200);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <a 
          href="#inicio" 
          className="nav-brand" 
          onClick={handleLogoClick}
          title="Viaje de Prácticas Académicas"
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        >
          <img 
            src="/logo.png" 
            alt="Logo Viaje de Prácticas" 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '11px', 
              objectFit: 'cover',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.45)',
              border: '1.5px solid rgba(56, 189, 248, 0.4)'
            }} 
          />
          <div>
            <div className="nav-title">Viaje de Prácticas</div>
            <div className="nav-subtitle">Portal Estudiantil & Académico</div>
          </div>
        </a>

        <ul className="nav-links">
          <li>
            <a href="#detalles" className="nav-link">Destino & Logística</a>
          </li>
          <li>
            <a href="#hotel" className="nav-link">Hotel & Hospedaje</a>
          </li>
          <li>
            <a href="#itinerario" className="nav-link">Itinerario y Horarios</a>
          </li>
          <li>
            <a href="#registro" className="nav-link">Registro de Interés</a>
          </li>
        </ul>

        <div className="nav-actions">
          <a href="#registro" className="btn btn-primary nav-btn-register" style={{ padding: '0.55rem 1.2rem', fontSize: '0.88rem' }}>
            <Users size={16} />
            <span>Apartar Lugar</span>
          </a>
          <button 
            onClick={onOpenAdmin}
            className="btn btn-secondary nav-btn-admin" 
            title="Acceso exclusivo organizadores (Atajo: Ctrl + Shift + A)"
            style={{ 
              padding: '0.55rem 0.75rem', 
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-muted)'
            }}
          >
            <Lock size={14} />
            <span className="nav-admin-text" style={{ fontWeight: 500, fontSize: '0.8rem' }}>Organizador</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
