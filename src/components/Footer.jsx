import React from 'react';
import { Compass, Phone, ShieldCheck, Heart, Lock } from 'lucide-react';

export const Footer = ({ onOpenAdmin, trip }) => {

  return (
    <footer className="footer">
      <div className="container">
        
        {/* Sección de Preguntas Frecuentes (Oculta a solicitud) */}

        {/* Columnas del Footer */}
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <img 
                src="/logo.png" 
                alt="Logo Viaje" 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '10px', 
                  objectFit: 'cover',
                  boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)'
                }} 
              />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                Viaje de Prácticas 2026
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '360px', lineHeight: '1.6' }}>
              Plataforma oficial para la difusión de itinerarios, actividades industriales y registro de contingente estudiantil del 1° al 9° semestre.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
              Navegación Rápida
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <li><a href="#inicio" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Inicio</a></li>
              <li><a href="#detalles" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Destino y Logística</a></li>
              <li><a href="#hotel" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Hotel & Hospedaje</a></li>
              <li><a href="#itinerario" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Itinerario y Horarios</a></li>
              <li><a href="#registro" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Registro de Interesados</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
              Comité Organizador
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <a 
                href="https://wa.me/524931703238?text=Hola%2C%20tengo%20dudas%20sobre%20el%20Viaje%20de%20Pr%C3%A1cticas%202027"
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: '#4ade80', 
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                <Phone size={15} style={{ color: 'var(--accent-emerald)' }} />
                <span>Enviar WhatsApp al Comité</span>
              </a>
              <button 
                onClick={onOpenAdmin}
                style={{ 
                  marginTop: '0.75rem', 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-subtle)', 
                  fontSize: '0.75rem', 
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  opacity: 0.65,
                  padding: 0,
                  textAlign: 'left'
                }}
                title="Acceso restringido para organizadores (Atajo: Ctrl + Shift + A)"
              >
                <Lock size={12} /> Acceso Organizadores (Ctrl+Shift+A)
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Derechos */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          © 2026 Viaje de Prácticas Académicas. Desarrollado con React y Firebase Firestore para la comunidad estudiantil.
        </div>

      </div>
    </footer>
  );
};
