import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error crítico:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetCache = () => {
    try {
      localStorage.removeItem('viaje_practicas_info');
      localStorage.removeItem('viaje_registros_alumnos');
    } catch (e) {
      console.warn(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at 50% -20%, #172554, #070d18 70%)',
          color: '#f8fafc',
          padding: '1.5rem',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
              Ocurrió un problema al cargar el portal
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              El navegador detectó un error al iniciar la aplicación. Puedes recargar la página o restaurar la información guardada en caché.
            </p>

            {this.state.error && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '0.85rem',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: '#fca5a5',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '1.5rem',
                maxHeight: '120px'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.7rem 1.4rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} />
                <span>Recargar Página</span>
              </button>

              <button
                onClick={this.handleResetCache}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '0.7rem 1.2rem',
                  fontWeight: 500,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={16} />
                <span>Limpiar Caché Local</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
