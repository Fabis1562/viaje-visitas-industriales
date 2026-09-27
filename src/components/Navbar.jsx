import React from 'react';
import { Compass, ShieldCheck, MapPin, Calendar, Users, Hotel } from 'lucide-react';

export const Navbar = ({ onOpenAdmin, tripTitle }) => {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <a href="#inicio" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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
          <a href="#registro" className="btn btn-primary" style={{ padding: '0.55rem 1.2rem', fontSize: '0.88rem' }}>
            <Users size={16} />
            <span>Apartar Lugar</span>
          </a>
          <button 
            onClick={onOpenAdmin}
            className="btn btn-secondary" 
            title="Panel de Administración para Organizadores"
            style={{ 
              padding: '0.55rem 1rem', 
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              background: 'rgba(56, 189, 248, 0.08)'
            }}
          >
            <ShieldCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontWeight: 600 }}>Admin</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
