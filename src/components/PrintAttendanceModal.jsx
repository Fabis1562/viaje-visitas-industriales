import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  FileText, 
  Award, 
  CheckCircle2, 
  Clock, 
  Bus, 
  UserCheck, 
  Filter,
  Download
} from 'lucide-react';

export const PrintAttendanceModal = ({ isOpen, onClose, students = [], trip = {} }) => {
  const [activeTab, setActiveTab] = useState('asistencia'); // 'asistencia' | 'gafetes'
  const [filterPayment, setFilterPayment] = useState('todos'); // 'todos' | 'anticipo_o_liquidado' | 'solo_liquidados'

  if (!isOpen) return null;

  const filteredStudents = students.filter(st => {
    if (filterPayment === 'anticipo_o_liquidado') {
      return st.paymentStatus === 'deposit' || st.paymentStatus === 'full';
    }
    if (filterPayment === 'solo_liquidados') {
      return st.paymentStatus === 'full';
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const departure = trip.logistics?.departure || {};

  return (
    <div className="modal-overlay print-modal-overlay">
      <div 
        className="modal-content print-modal-content"
        style={{ maxWidth: '1050px', width: '95vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        
        {/* Cabecera del Modal (No se imprime) */}
        <div className="modal-header no-print" style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="icon-bubble icon-bubble-cyan" style={{ width: '40px', height: '40px' }}>
              <Printer size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Centro de Impresión y Documentos Oficiales
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Genera en 1 clic la lista de asistencia del autobús o los gafetes oficiales de acreditación en PDF.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Printer size={16} />
              <span>Imprimir / Guardar en PDF</span>
            </button>

            <button 
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', borderRadius: '50%' }}
              title="Cerrar ventana"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Pestañas y Filtros (No se imprimen) */}
        <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.75rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setActiveTab('asistencia')}
              className={`btn ${activeTab === 'asistencia' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.55rem 1rem', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <FileText size={16} />
              <span>1. Lista de Asistencia Oficial (Autobús)</span>
            </button>

            <button 
              onClick={() => setActiveTab('gafetes')}
              className={`btn ${activeTab === 'gafetes' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.55rem 1rem', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Award size={16} />
              <span>2. Gafetes de Visita Industrial</span>
            </button>
          </div>

          {/* Filtro por estatus de pago */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Filtrar para impresión:</span>
            <select 
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="form-select"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', width: '220px' }}
            >
              <option value="todos">Todos los registrados ({students.length})</option>
              <option value="anticipo_o_liquidado">Con Anticipo o Liquidado</option>
              <option value="solo_liquidados">Solo Liquidados (100%)</option>
            </select>
          </div>
        </div>

        {/* ÁREA DE CONTENIDO IMPRIMIBLE */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', background: '#0a0f1d' }} className="printable-scroll-area">
          
          {/* ========================================================
              VISTA 1: LISTA DE ASISTENCIA OFICIAL DEL AUTOBÚS
             ======================================================== */}
          {activeTab === 'asistencia' && (
            <div className="printable-document sheet-paper" style={{ background: '#fff', color: '#0f172a', padding: '2.5rem', borderRadius: '4px', maxWidth: '900px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
              
              {/* Membrete Oficial */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} 
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.5px' }}>
                      {trip.institution || 'INSTITUTO TECNOLÓGICO / UNIVERSIDAD'}
                    </h3>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3b82f6', marginTop: '0.15rem' }}>
                      {trip.title || 'VIAJE DE PRÁCTICAS ACADÉMICAS 2026 - 2027'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      COMITÉ ORGANIZADOR DE VISITAS TÉCNICAS E INDUSTRIALES
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#334155' }}>
                  <div><strong>DOCUMENTO OFICIAL</strong></div>
                  <div>FOLIO: VP-{new Date().getFullYear()}-{students.length}</div>
                  <div>Emisión: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>

              {/* Título del pase de lista */}
              <div style={{ textAlign: 'center', margin: '1rem 0 1.25rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a' }}>
                  Lista Oficial de Pasajeros y Pase de Asistencia
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
                  UNIDAD DE TRANSPORTE: {trip.logistics?.transport?.type || 'Autobús Gran Turismo'} • CAPACIDAD: {trip.capacity || 80} PASAJEROS
                </div>
              </div>

              {/* Datos de Logística del viaje */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Cita de Abordaje:</span>
                  <strong>{departure.boardingTime || '05:30 AM'}</strong> ({departure.date || '05 de Abril 2027'})
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Hora de Salida:</span>
                  <strong>{departure.time || '06:00 AM'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Punto de Partida:</span>
                  <strong>{departure.meetingPoint || 'Explanada Principal'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Alumnos en Lista:</span>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{filteredStudents.length} alumnos</strong>
                </div>
              </div>

              {/* TABLA DE ASISTENCIA */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1.75rem' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '7px 8px', border: '1px solid #0f172a', width: '35px', textAlign: 'center' }}>No.</th>
                    <th style={{ padding: '7px 8px', border: '1px solid #0f172a', width: '90px' }}>No. Control</th>
                    <th style={{ padding: '7px 8px', border: '1px solid #0f172a' }}>Nombre Completo del Alumno</th>
                    <th style={{ padding: '7px 8px', border: '1px solid #0f172a', width: '70px', textAlign: 'center' }}>Sem/Gpo</th>
                    <th style={{ padding: '7px 8px', border: '1px solid #0f172a', width: '105px' }}>Teléfono</th>
                    <th style={{ padding: '7px 8px', border: '1px solid #0f172a', width: '100px', textAlign: 'center' }}>Estatus Pago</th>
                    <th style={{ padding: '7px 8px', border: '1px solid #0f172a', width: '110px', textAlign: 'center' }}>Firma Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                        No hay alumnos con el filtro seleccionado.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => {
                      const isFull = st.paymentStatus === 'full';
                      const isDeposit = st.paymentStatus === 'deposit';

                      return (
                        <tr 
                          key={st.id || idx} 
                          style={{ 
                            background: idx % 2 === 0 ? '#fff' : '#f8fafc',
                            borderBottom: '1px solid #cbd5e1'
                          }}
                        >
                          <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 600 }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 600 }}>
                            {st.controlNumber}
                          </td>
                          <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                            {st.fullName}
                          </td>
                          <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                            {st.semester}° {st.group}
                          </td>
                          <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>
                            {st.phone}
                          </td>
                          <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
                            {isFull ? (
                              <span style={{ color: '#059669', background: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>LIQUIDADO</span>
                            ) : isDeposit ? (
                              <span style={{ color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>ANTICIPO</span>
                            ) : (
                              <span style={{ color: '#d97706', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>PENDIENTE</span>
                            )}
                          </td>
                          <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                            <div style={{ borderBottom: '1px dotted #94a3b8', height: '18px', width: '85%', margin: '0 auto' }}></div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Firmas de Autorización Oficial */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '3rem', paddingTop: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1.5px solid #0f172a', width: '80%', margin: '0 auto 0.5rem' }}></div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Coordinador(a) Docente del Viaje</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Nombre, Firma y Sello Oficial</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1.5px solid #0f172a', width: '80%', margin: '0 auto 0.5rem' }}></div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Operador Responsable de Autobús</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Línea de Transporte / Chofer Certificado</div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              VISTA 2: GAFETES DE VISITA INDUSTRIAL
             ======================================================== */}
          {activeTab === 'gafetes' && (
            <div className="printable-badges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem', maxWidth: '980px', margin: '0 auto' }}>
              {filteredStudents.map((st, idx) => (
                <div 
                  key={st.id || idx}
                  className="badge-card sheet-paper"
                  style={{
                    background: '#fff',
                    color: '#0f172a',
                    border: '1.5px dashed #94a3b8',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '260px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    position: 'relative',
                    fontFamily: "'Plus Jakarta Sans', Arial, sans-serif"
                  }}
                >
                  {/* Encabezado del Gafete */}
                  <div>
                    <div style={{ background: '#0f172a', color: '#38bdf8', margin: '-1.25rem -1.25rem 0.85rem', padding: '0.6rem 1rem', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        ACREDITACIÓN INDUSTRIAL 2026-2027
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        No. {idx + 1}
                      </span>
                    </div>

                    <div style={{ textAlign: 'center', padding: '0.2rem 0 0.8rem' }}>
                      <span style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.2rem' }}>
                        VISITANTE ESTUDIANTIL
                      </span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', lineHeight: '1.3' }}>
                        {st.fullName}
                      </h4>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginTop: '0.25rem' }}>
                        Matrícula: <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>{st.controlNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo Central del Gafete con QR y Datos */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', margin: '0.3rem 0' }}>
                    <div style={{ fontSize: '0.78rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div><strong>Semestre:</strong> {st.semester}° Semestre</div>
                      <div><strong>Grupo:</strong> Grupo "{st.group}"</div>
                      <div><strong>Carrera:</strong> Ingeniería</div>
                      <div><strong>Teléfono:</strong> {st.phone}</div>
                    </div>

                    {/* QR Code de Verificación Rápida */}
                    <div style={{ textAlign: 'center' }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=VIAJE-2026-${st.controlNumber}-${encodeURIComponent(st.fullName)}`}
                        alt="QR Acreditación"
                        style={{ width: '64px', height: '64px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                      <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '0.15rem' }}>VERIFICADO</div>
                    </div>
                  </div>

                  {/* Pie del Gafete */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', textAlign: 'center', fontSize: '0.68rem', color: '#64748b' }}>
                    Portar visible en todas las visitas técnicas y accesos a plantas industriales.
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
