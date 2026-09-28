import React, { useState } from 'react';

export const WhatsAppButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Enlace directo al chat sin mostrar el número telefónico en pantalla
  const whatsappUrl = "https://wa.me/524931703238?text=Hola%2C%20tengo%20dudas%20sobre%20el%20Viaje%20de%20Pr%C3%A1cticas%202027";

  return (
    <aside 
      className="whatsapp-aside"
      aria-label="Atención por WhatsApp"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* Tooltip flotante en hover o descanso */}
      <div 
        className="whatsapp-tooltip"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#f8fafc',
          padding: '0.55rem 0.9rem',
          borderRadius: '999px',
          fontSize: '0.82rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(37, 211, 102, 0.35)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          opacity: isHovered ? 1 : 0.9,
          transform: isHovered ? 'translateX(-4px)' : 'translateX(0)',
          transition: 'all 0.25s ease'
        }}
      >
        <span style={{ color: '#25D366', marginRight: '0.35rem' }}>●</span>
        ¿Dudas del viaje? Escríbenos
      </div>

      {/* Botón Circular con Icono Oficial de WhatsApp */}
      <a
        href={whatsappUrl}
        className="whatsapp-btn"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Enviar mensaje por WhatsApp al comité organizador"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: isHovered 
            ? '0 0 25px rgba(37, 211, 102, 0.8), 0 8px 20px rgba(0,0,0,0.4)' 
            : '0 0 15px rgba(37, 211, 102, 0.5), 0 6px 16px rgba(0,0,0,0.3)',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          cursor: 'pointer',
          textDecoration: 'none'
        }}
      >
        <svg 
          width="30" 
          height="30" 
          viewBox="0 0 24 24" 
          fill="#ffffff"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </aside>
  );
};
