import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Key,
  Users, 
  Settings, 
  Calendar, 
  Database, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  Check, 
  Plus, 
  Save, 
  AlertCircle,
  Clock,
  MapPin,
  Hotel,
  Bus,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { exportStudentsToCSV } from '../services/exportService';
import { isFirebaseConfigured, getFirebaseConfig } from '../services/firebase';

export const AdminModal = ({ 
  isOpen, 
  onClose, 
  registrations = [], 
  tripData, 
  onUpdateTrip, 
  onDeleteRegistration 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState('registros'); // 'registros', 'viaje', 'itinerario', 'firebase', 'seguridad'

  // Filtros de registros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('todos');
  const [filterGroup, setFilterGroup] = useState('todos');

  // Estado local para editar el viaje
  const [editableTrip, setEditableTrip] = useState(tripData);
  const [saveStatus, setSaveStatus] = useState('');

  // Estado para configuración de Firebase
  const [fbConfig, setFbConfig] = useState(getFirebaseConfig());
  const [fbSaveNotice, setFbSaveNotice] = useState('');

  // Estado para cambio de contraseña de administrador
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState('');
  const [passChangeError, setPassChangeError] = useState('');

  if (!isOpen) return null;

  const getExpectedPassword = () => {
    return localStorage.getItem('viaje_admin_password') || import.meta.env.VITE_ADMIN_PASSWORD || 'ViajeAdmin2026';
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const expected = getExpectedPassword();
    if (password === expected) {
      setIsAuthenticated(true);
      setLoginError(false);
      setEditableTrip(tripData);
    } else {
      setLoginError(true);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPassChangeSuccess('');
    setPassChangeError('');

    if (!newAdminPassword || newAdminPassword.length < 5) {
      setPassChangeError('La nueva contraseña debe tener al menos 5 caracteres.');
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setPassChangeError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    localStorage.setItem('viaje_admin_password', newAdminPassword);
    setPassChangeSuccess('¡Contraseña de administrador actualizada con éxito!');
    setNewAdminPassword('');
    setConfirmAdminPassword('');
  };

  const handleResetPassword = () => {
    if (window.confirm('¿Deseas restablecer la contraseña a la predeterminada del archivo .env?')) {
      localStorage.removeItem('viaje_admin_password');
      setPassChangeSuccess('Contraseña restablecida a: ' + (import.meta.env.VITE_ADMIN_PASSWORD || 'ViajeAdmin2026'));
      setPassChangeError('');
    }
  };

  // Filtrado de alumnos
  const filteredStudents = registrations.filter(s => {
    const matchesSearch = 
      (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.controlNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = filterSemester === 'todos' || String(s.semester) === String(filterSemester);
    const matchesGroup = filterGroup === 'todos' || s.group === filterGroup;

    return matchesSearch && matchesSemester && matchesGroup;
  });

  // Estadísticas por semestre
  const semesterCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(sem => {
    return {
      semester: sem,
      count: registrations.filter(r => Number(r.semester) === sem).length
    };
  });

  const handleSaveTripGeneral = async () => {
    setSaveStatus('guardando');
    try {
      await onUpdateTrip(editableTrip);
      setSaveStatus('exito');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('error');
    }
  };

  const handleAddItineraryActivity = (dayIndex) => {
    const updatedItinerary = [...editableTrip.itinerary];
    if (!updatedItinerary[dayIndex].activities) {
      updatedItinerary[dayIndex].activities = [];
    }
    updatedItinerary[dayIndex].activities.push({
      time: '12:00 PM',
      title: 'Nueva Actividad',
      location: 'Ubicación / Sala',
      desc: 'Descripción breve de la actividad programada.'
    });
    setEditableTrip({ ...editableTrip, itinerary: updatedItinerary });
  };

  const handleRemoveItineraryActivity = (dayIndex, actIndex) => {
    const updatedItinerary = [...editableTrip.itinerary];
    updatedItinerary[dayIndex].activities.splice(actIndex, 1);
    setEditableTrip({ ...editableTrip, itinerary: updatedItinerary });
  };

  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('viaje_firebase_config', JSON.stringify(fbConfig));
    setFbSaveNotice('Configuración guardada en el navegador. Recarga para conectar a Firestore.');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Cabecera del Modal */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="icon-bubble icon-bubble-cyan" style={{ width: '38px', height: '38px' }}>
              <Lock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Panel de Administración del Viaje
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Comité Organizador y Gestión de Datos
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.6rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Si no está autenticado: Pantalla de Login */}
        {!isAuthenticated ? (
          <div className="modal-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '340px' }}>
            <form onSubmit={handleLogin} style={{ maxWidth: '380px', width: '100%', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Lock size={28} />
              </div>
              
              <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Acceso de Organizadores
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Ingresa la contraseña de organizador para gestionar el viaje y la lista de interesados.
              </p>

              {loginError && (
                <div style={{ background: 'rgba(244,63,94,0.15)', color: '#fda4af', padding: '0.6rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  Contraseña incorrecta.
                </div>
              )}

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label" htmlFor="adminPass">Contraseña:</label>
                <input
                  id="adminPass"
                  type="password"
                  required
                  placeholder="Escribe tu contraseña"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Entrar al Panel
              </button>

              <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                🔒 Acceso restringido exclusivamente para organizadores y docentes del viaje.
              </div>
            </form>
          </div>
        ) : (
          /* Pantalla Autenticada con Tabs */
          <>
            <div className="admin-nav-tabs">
              <button 
                className={`admin-tab ${activeTab === 'registros' ? 'active' : ''}`}
                onClick={() => setActiveTab('registros')}
              >
                <Users size={17} />
                <span>Interesados ({registrations.length})</span>
              </button>

              <button 
                className={`admin-tab ${activeTab === 'viaje' ? 'active' : ''}`}
                onClick={() => setActiveTab('viaje')}
              >
                <Settings size={17} />
                <span>Lugar, Hotel y Horarios</span>
              </button>

              <button 
                className={`admin-tab ${activeTab === 'itinerario' ? 'active' : ''}`}
                onClick={() => setActiveTab('itinerario')}
              >
                <Calendar size={17} />
                <span>Editar Itinerario</span>
              </button>

              <button 
                className={`admin-tab ${activeTab === 'firebase' ? 'active' : ''}`}
                onClick={() => setActiveTab('firebase')}
              >
                <Database size={17} />
                <span>Conexión Firebase</span>
              </button>

              <button 
                className={`admin-tab ${activeTab === 'seguridad' ? 'active' : ''}`}
                onClick={() => setActiveTab('seguridad')}
              >
                <Key size={17} />
                <span>Contraseña</span>
              </button>
            </div>

            <div className="modal-body">
              
              {/* TAB 1: LISTA DE ALUMNOS REGISTRADOS */}
              {activeTab === 'registros' && (
                <div>
                  {/* Resumen de Métricas */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TOTAL REGISTRADOS</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {registrations.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>alumnos</span>
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CUPO DISPONIBLE</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                        {Math.max(0, (editableTrip.capacity || 45) - registrations.length)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>lugares</span>
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>BASE DE DATOS</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: isFirebaseConfigured() ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: '0.3rem' }}>
                        {isFirebaseConfigured() ? '🟢 Firestore Activo' : '🟡 Modo Local Activo'}
                      </div>
                    </div>
                  </div>

                  {/* Distribución por los 9 semestres */}
                  <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                      Distribución por Semestre (1° a 9° Semestre)
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                      {semesterCounts.map(item => (
                        <div key={item.semester} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.2rem', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{item.semester}° Sem</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{item.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Barra de Filtros y Búsqueda */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          placeholder="Buscar por nombre, No. de control o correo..."
                          className="form-input"
                          style={{ paddingLeft: '2.4rem' }}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <select 
                        className="form-select" 
                        style={{ width: '160px' }}
                        value={filterSemester}
                        onChange={(e) => setFilterSemester(e.target.value)}
                      >
                        <option value="todos">Todos Semestres</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => (
                          <option key={s} value={s}>{s}° Semestre</option>
                        ))}
                      </select>

                      <select 
                        className="form-select" 
                        style={{ width: '130px' }}
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                      >
                        <option value="todos">Todos Grupos</option>
                        {['A', 'B', 'C', 'D', 'E', 'F'].map(g => (
                          <option key={g} value={g}>Grupo {g}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={() => exportStudentsToCSV(filteredStudents, editableTrip.title)}
                      className="btn btn-primary"
                      style={{ padding: '0.65rem 1.25rem', whiteSpace: 'nowrap' }}
                    >
                      <Download size={16} />
                      <span>Exportar a Excel / CSV</span>
                    </button>
                  </div>

                  {/* Tabla de Alumnos */}
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>No.</th>
                          <th>Nombre del Alumno</th>
                          <th>No. Control</th>
                          <th>Edad</th>
                          <th>Semestre</th>
                          <th>Grupo</th>
                          <th>Contacto WhatsApp</th>
                          <th>Notas</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                              No se encontraron registros con los criterios seleccionados.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((st, idx) => (
                            <tr key={st.id || idx}>
                              <td>{idx + 1}</td>
                              <td style={{ fontWeight: 600, color: '#fff' }}>{st.fullName}</td>
                              <td><span className="badge badge-cyan">{st.controlNumber}</span></td>
                              <td>{st.age} años</td>
                              <td><span className="badge badge-purple">{st.semester}° Sem</span></td>
                              <td><strong>{st.group}</strong></td>
                              <td>
                                <a 
                                  href={`https://wa.me/52${st.phone.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  style={{ color: 'var(--accent-emerald)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  {st.phone}
                                </a>
                              </td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                                {st.notes || '-'}
                              </td>
                              <td>
                                <button 
                                  onClick={() => {
                                    if (confirm(`¿Eliminar a ${st.fullName}?`)) {
                                      onDeleteRegistration(st.id);
                                    }
                                  }}
                                  className="btn btn-danger"
                                  style={{ padding: '0.35rem 0.6rem' }}
                                  title="Eliminar registro"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: EDITAR INFORMACIÓN DEL VIAJE (LUGAR, HOTEL, HORARIOS) */}
              {activeTab === 'viaje' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {saveStatus === 'exito' && (
                    <div style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                      ✓ Cambios guardados correctamente en la base de datos.
                    </div>
                  )}

                  {/* 1. Datos Generales */}
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
                      1. Datos Generales del Viaje
                    </h4>
                    <div className="form-group">
                      <label className="form-label">Título del Viaje:</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editableTrip.title || ''} 
                        onChange={(e) => setEditableTrip({ ...editableTrip, title: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Descripción / Subtítulo:</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editableTrip.subtitle || ''} 
                        onChange={(e) => setEditableTrip({ ...editableTrip, subtitle: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cupo Máximo de Alumnos:</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={editableTrip.capacity || 45} 
                        onChange={(e) => setEditableTrip({ ...editableTrip, capacity: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* 2. Destino y Visitas */}
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
                      2. Destino y Lugares a Visitar
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Ciudad / Estado:</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editableTrip.destination?.city || ''} 
                          onChange={(e) => setEditableTrip({
                            ...editableTrip,
                            destination: { ...editableTrip.destination, city: e.target.value }
                          })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Zona o Foco Principal:</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editableTrip.destination?.highlight || ''} 
                          onChange={(e) => setEditableTrip({
                            ...editableTrip,
                            destination: { ...editableTrip.destination, highlight: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Descripción de las Prácticas:</label>
                      <textarea 
                        rows="3"
                        className="form-textarea" 
                        value={editableTrip.destination?.description || ''} 
                        onChange={(e) => setEditableTrip({
                          ...editableTrip,
                          destination: { ...editableTrip.destination, description: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  {/* 3. Hotel y Hospedaje */}
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
                      3. Hotel y Alojamiento
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Nombre del Hotel:</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editableTrip.hotel?.name || ''} 
                          onChange={(e) => setEditableTrip({
                            ...editableTrip,
                            hotel: { ...editableTrip.hotel, name: e.target.value }
                          })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Categoría:</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editableTrip.hotel?.category || ''} 
                          onChange={(e) => setEditableTrip({
                            ...editableTrip,
                            hotel: { ...editableTrip.hotel, category: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dirección del Hotel:</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editableTrip.hotel?.address || ''} 
                        onChange={(e) => setEditableTrip({
                          ...editableTrip,
                          hotel: { ...editableTrip.hotel, address: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  {/* 4. Salida, Regreso y Horarios */}
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
                      4. Salida, Regreso y Horarios de Transporte
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {/* Salida */}
                      <div>
                        <h5 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Datos de Salida</h5>
                        <div className="form-group">
                          <label className="form-label">Fecha de Salida:</label>
                          <input 
                            type="date" 
                            className="form-input" 
                            value={editableTrip.logistics?.departure?.date || ''} 
                            onChange={(e) => setEditableTrip({
                              ...editableTrip,
                              logistics: {
                                ...editableTrip.logistics,
                                departure: { ...editableTrip.logistics?.departure, date: e.target.value }
                              }
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Hora de Salida:</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editableTrip.logistics?.departure?.time || ''} 
                            onChange={(e) => setEditableTrip({
                              ...editableTrip,
                              logistics: {
                                ...editableTrip.logistics,
                                departure: { ...editableTrip.logistics?.departure, time: e.target.value }
                              }
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Punto de Reunión:</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editableTrip.logistics?.departure?.meetingPoint || ''} 
                            onChange={(e) => setEditableTrip({
                              ...editableTrip,
                              logistics: {
                                ...editableTrip.logistics,
                                departure: { ...editableTrip.logistics?.departure, meetingPoint: e.target.value }
                              }
                            })}
                          />
                        </div>
                      </div>

                      {/* Regreso */}
                      <div>
                        <h5 style={{ color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>Datos de Regreso</h5>
                        <div className="form-group">
                          <label className="form-label">Fecha de Regreso:</label>
                          <input 
                            type="date" 
                            className="form-input" 
                            value={editableTrip.logistics?.returnTrip?.date || ''} 
                            onChange={(e) => setEditableTrip({
                              ...editableTrip,
                              logistics: {
                                ...editableTrip.logistics,
                                returnTrip: { ...editableTrip.logistics?.returnTrip, date: e.target.value }
                              }
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Hora Estimada de Llegada:</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editableTrip.logistics?.returnTrip?.time || ''} 
                            onChange={(e) => setEditableTrip({
                              ...editableTrip,
                              logistics: {
                                ...editableTrip.logistics,
                                returnTrip: { ...editableTrip.logistics?.returnTrip, time: e.target.value }
                              }
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Punto de Llegada:</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editableTrip.logistics?.returnTrip?.estimatedArrival || ''} 
                            onChange={(e) => setEditableTrip({
                              ...editableTrip,
                              logistics: {
                                ...editableTrip.logistics,
                                returnTrip: { ...editableTrip.logistics?.returnTrip, estimatedArrival: e.target.value }
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveTripGeneral}
                    className="btn btn-primary"
                    style={{ padding: '0.9rem', width: '100%', fontSize: '1rem' }}
                  >
                    <Save size={18} />
                    <span>Guardar y Actualizar Información del Viaje</span>
                  </button>
                </div>
              )}

              {/* TAB 3: EDITAR ITINERARIO Y HORARIOS */}
              {activeTab === 'itinerario' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {editableTrip.itinerary?.map((dayObj, dayIdx) => (
                    <div key={dayIdx} className="glass-panel" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                        <span className="badge badge-emerald">Día {dayObj.day || dayIdx + 1}</span>
                        <button 
                          onClick={() => handleAddItineraryActivity(dayIdx)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          <Plus size={14} /> Agregar Actividad / Horario
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Título del Día:</label>
                          <input 
                            type="text" 
                            className="form-input"
                            value={dayObj.dateTitle || ''} 
                            onChange={(e) => {
                              const updated = [...editableTrip.itinerary];
                              updated[dayIdx].dateTitle = e.target.value;
                              setEditableTrip({ ...editableTrip, itinerary: updated });
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Tema o Enfoque:</label>
                          <input 
                            type="text" 
                            className="form-input"
                            value={dayObj.theme || ''} 
                            onChange={(e) => {
                              const updated = [...editableTrip.itinerary];
                              updated[dayIdx].theme = e.target.value;
                              setEditableTrip({ ...editableTrip, itinerary: updated });
                            }}
                          />
                        </div>
                      </div>

                      {/* Lista de Actividades de este día */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {dayObj.activities?.map((act, actIdx) => (
                          <div key={actIdx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                              <input 
                                type="text" 
                                placeholder="Horario" 
                                className="form-input" 
                                value={act.time} 
                                onChange={(e) => {
                                  const updated = [...editableTrip.itinerary];
                                  updated[dayIdx].activities[actIdx].time = e.target.value;
                                  setEditableTrip({ ...editableTrip, itinerary: updated });
                                }}
                              />
                              <input 
                                type="text" 
                                placeholder="Título de la Actividad" 
                                className="form-input" 
                                value={act.title} 
                                onChange={(e) => {
                                  const updated = [...editableTrip.itinerary];
                                  updated[dayIdx].activities[actIdx].title = e.target.value;
                                  setEditableTrip({ ...editableTrip, itinerary: updated });
                                }}
                              />
                              <input 
                                type="text" 
                                placeholder="Lugar / Ubicación" 
                                className="form-input" 
                                value={act.location || ''} 
                                onChange={(e) => {
                                  const updated = [...editableTrip.itinerary];
                                  updated[dayIdx].activities[actIdx].location = e.target.value;
                                  setEditableTrip({ ...editableTrip, itinerary: updated });
                                }}
                              />
                              <button 
                                onClick={() => handleRemoveItineraryActivity(dayIdx, actIdx)}
                                className="btn btn-danger"
                                style={{ padding: '0.45rem' }}
                                title="Eliminar horario"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                              <input 
                                type="text" 
                                placeholder="Descripción o detalles..." 
                                className="form-input" 
                                value={act.desc || ''} 
                                onChange={(e) => {
                                  const updated = [...editableTrip.itinerary];
                                  updated[dayIdx].activities[actIdx].desc = e.target.value;
                                  setEditableTrip({ ...editableTrip, itinerary: updated });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={handleSaveTripGeneral}
                    className="btn btn-primary"
                    style={{ padding: '0.9rem', width: '100%' }}
                  >
                    <Save size={18} />
                    <span>Guardar Itinerario Completo</span>
                  </button>
                </div>
              )}

              {/* TAB 4: CONFIGURACIÓN FIREBASE FIRESTORE */}
              {activeTab === 'firebase' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                        Estado de la Base de Datos en la Nube
                      </h4>
                      <span className={`badge ${isFirebaseConfigured() ? 'badge-emerald' : 'badge-amber'}`}>
                        {isFirebaseConfigured() ? '🟢 Conectado a Firestore' : '🟡 Modo Local Activo'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      La aplicación actualmente guarda y carga los datos de manera inmediata. Si deseas que los alumnos se registren desde cualquier teléfono o computadora y los datos se concentren en tu cuenta de Firebase Firestore en la nube, ingresa tus claves a continuación o agrégalas a tu archivo <code>.env</code>.
                    </p>

                    {fbSaveNotice && (
                      <div style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '0.75rem', borderRadius: 'var(--radius-md)', margin: '1rem 0' }}>
                        {fbSaveNotice}
                      </div>
                    )}

                    <form onSubmit={handleSaveFirebaseConfig} style={{ marginTop: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">API Key (apiKey):</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="AIzaSy..."
                            value={fbConfig.apiKey || ''} 
                            onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Project ID (projectId):</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="viaje-practicas-12345"
                            value={fbConfig.projectId || ''} 
                            onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Auth Domain:</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="viaje-practicas.firebaseapp.com"
                            value={fbConfig.authDomain || ''} 
                            onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Storage Bucket:</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="viaje-practicas.appspot.com"
                            value={fbConfig.storageBucket || ''} 
                            onChange={(e) => setFbConfig({ ...fbConfig, storageBucket: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Messaging Sender ID:</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="1234567890"
                            value={fbConfig.messagingSenderId || ''} 
                            onChange={(e) => setFbConfig({ ...fbConfig, messagingSenderId: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">App ID:</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="1:123456789:web:abcdef..."
                            value={fbConfig.appId || ''} 
                            onChange={(e) => setFbConfig({ ...fbConfig, appId: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary">
                          <Save size={16} /> Guardar Credenciales y Reconectar
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => {
                            localStorage.removeItem('viaje_firebase_config');
                            window.location.reload();
                          }}
                        >
                          Restablecer a Modo Local
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Guía Rápida para Firebase */}
                  <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <h5 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
                      ¿Cómo obtener tu proyecto gratis en Firebase en 2 minutos?
                    </h5>
                    <ol style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                      <li>Entra a <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>console.firebase.google.com</a> con tu cuenta de Google.</li>
                      <li>Haz clic en <strong>"Crear un proyecto"</strong> (puedes llamarlo <em>Viaje Practicas</em>).</li>
                      <li>En el menú lateral, ve a <strong>Build &gt; Firestore Database</strong> y pulsa <strong>"Crear base de datos"</strong> (inicia en modo de prueba / test mode).</li>
                      <li>Ve a <strong>Configuración del proyecto (engrane) &gt; General &gt; Tus apps</strong> y crea una app Web (icono <code>&lt;/&gt;</code>).</li>
                      <li>Copia las credenciales que aparecen en <code>firebaseConfig</code> y pégalas aquí arriba. ¡Y listo!</li>
                    </ol>
                  </div>

                </div>
              )}

              {/* TAB 5: SEGURIDAD Y CAMBIO DE CONTRASEÑA */}
              {activeTab === 'seguridad' && (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div style={{ background: 'rgba(56, 189, 248, 0.12)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: 'var(--accent-cyan)' }}>
                        <Key size={24} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                          Cambiar Contraseña de Administrador
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Modifica la contraseña de acceso a este panel de organizadores.
                        </p>
                      </div>
                    </div>

                    {passChangeSuccess && (
                      <div style={{ 
                        background: 'rgba(16, 185, 129, 0.15)', 
                        border: '1px solid rgba(16, 185, 129, 0.3)', 
                        color: '#6ee7b7', 
                        padding: '0.75rem 1rem', 
                        borderRadius: 'var(--radius-md)', 
                        marginBottom: '1.25rem',
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Check size={18} />
                        <span>{passChangeSuccess}</span>
                      </div>
                    )}

                    {passChangeError && (
                      <div style={{ 
                        background: 'rgba(244, 63, 94, 0.15)', 
                        border: '1px solid rgba(244, 63, 94, 0.3)', 
                        color: '#fda4af', 
                        padding: '0.75rem 1rem', 
                        borderRadius: 'var(--radius-md)', 
                        marginBottom: '1.25rem',
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <AlertCircle size={18} />
                        <span>{passChangeError}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePassword}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="newPass">Nueva Contraseña:</label>
                        <input
                          id="newPass"
                          type="password"
                          required
                          placeholder="Mínimo 5 caracteres"
                          className="form-input"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="confirmPass">Confirmar Nueva Contraseña:</label>
                        <input
                          id="confirmPass"
                          type="password"
                          required
                          placeholder="Repite la nueva contraseña"
                          className="form-input"
                          value={confirmAdminPassword}
                          onChange={(e) => setConfirmAdminPassword(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                        <button type="submit" className="btn btn-primary">
                          <Save size={16} /> Guardar Nueva Contraseña
                        </button>
                        <button 
                          type="button" 
                          onClick={handleResetPassword}
                          className="btn btn-secondary"
                        >
                          Restablecer Contraseña Predeterminada
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.4rem' }}>
                      ℹ️ Información de Seguridad
                    </div>
                    <p style={{ lineHeight: '1.6' }}>
                      La contraseña también puede ser configurada de forma permanente en el archivo <code>.env</code> con la variable <code>VITE_ADMIN_PASSWORD</code>.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};
