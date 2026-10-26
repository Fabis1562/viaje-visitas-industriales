import React, { useState, useEffect } from 'react';
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
  Plus, 
  Save, 
  AlertCircle,
  RefreshCw,
  ExternalLink,
  LogOut,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Check,
  Printer,
  DollarSign,
  CreditCard,
  MessageCircle,
  Send
} from 'lucide-react';
import { exportStudentsToCSV } from '../services/exportService';
import { 
  isFirebaseConfigured, 
  getFirebaseConfig, 
  loginAdmin, 
  logoutAdmin, 
  onAdminAuthStateChanged 
} from '../services/firebase';
import { 
  getRegistrations, 
  deleteStudentRegistration, 
  syncPublicCount,
  updateStudentPaymentStatus
} from '../services/dataService';
import { PrintAttendanceModal } from './PrintAttendanceModal';

export const AdminModal = ({ 
  isOpen, 
  onClose, 
  tripData, 
  onUpdateTrip,
  onSyncCount
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('registros'); // 'registros', 'viaje', 'itinerario', 'firebase', 'seguridad'

  // Registros protegidos (solo cargados tras verificación real en servidor)
  const [adminRegistrations, setAdminRegistrations] = useState([]);
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);
  const [regsError, setRegsError] = useState('');

  // Filtros de registros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('todos');
  const [filterGroup, setFilterGroup] = useState('todos');
  const [filterPayment, setFilterPayment] = useState('todos'); // 'todos' | 'pending' | 'deposit' | 'full'
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [paymentUpdateMsg, setPaymentUpdateMsg] = useState('');
  const [waModalStudent, setWaModalStudent] = useState(null);
  const [customWaMsg, setCustomWaMsg] = useState('');

  // Estado local para editar el viaje
  const [editableTrip, setEditableTrip] = useState(tripData);
  const [saveStatus, setSaveStatus] = useState('');

  // Estado para configuración de Firebase
  const [fbConfig, setFbConfig] = useState(getFirebaseConfig());
  const [fbSaveNotice, setFbSaveNotice] = useState('');

  // Escuchar sesión activa de Firebase
  useEffect(() => {
    const unsub = onAdminAuthStateChanged((user) => {
      if (user) {
        setAdminUser(user);
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        setAdminUser(null);
        setIsAuthenticated(false);
        setAdminRegistrations([]);
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Consultar registros de alumnos desde Firebase únicamente cuando el admin esté autenticado
  const fetchRegistrations = async () => {
    setIsLoadingRegs(true);
    setRegsError('');
    try {
      const data = await getRegistrations();
      const list = data || [];
      setAdminRegistrations(list);
      // Sincronizar contador real hacia la vista principal y la base de datos
      if (onSyncCount) onSyncCount(list.length);
      syncPublicCount(list.length);
    } catch (err) {
      console.error('Error cargando alumnos:', err);
      if (err?.code === 'permission-denied') {
        setRegsError('Firestore denegó el acceso (permission-denied). En tu Consola de Firebase > Firestore Database > Reglas (Rules), debes publicar las reglas que permiten a administradores autenticados leer la colección "interesados_viaje".');
      } else {
        setRegsError(`Error del servidor Firestore: ${err?.message || 'Acceso no disponible'}. Revisa la consola o las reglas de seguridad.`);
      }
      setAdminRegistrations([]);
    } finally {
      setIsLoadingRegs(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchRegistrations();
      setEditableTrip(tripData);
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmittingAuth(true);

    try {
      await loginAdmin(email.trim(), password);
    } catch (err) {
      console.error('Error de autenticación:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setLoginError('Correo o contraseña incorrectos. Verifica tus credenciales de organizador.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setLoginError('El proveedor de Correo/Contraseña no está habilitado en Firebase Authentication.');
      } else if (err.code === 'auth/too-many-requests') {
        setLoginError('Demasiados intentos fallidos. Por seguridad, la cuenta se ha bloqueado temporalmente.');
      } else {
        setLoginError(err.message || 'Error al autenticar con el servidor.');
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      setIsAuthenticated(false);
      setAdminUser(null);
      setAdminRegistrations([]);
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar el registro de "${name || id}"?`)) {
      try {
        await deleteStudentRegistration(id);
        const updated = adminRegistrations.filter(r => r.id !== id);
        setAdminRegistrations(updated);
        if (onSyncCount) onSyncCount(updated.length);
        syncPublicCount(updated.length);
      } catch (err) {
        alert('Error al eliminar registro: ' + (err.message || 'Error en Firebase'));
      }
    }
  };

  // Obtener fecha límite formateada para mensajes de WhatsApp
  const getDeadlineText = () => {
    if (editableTrip.registrationDeadline) {
      try {
        return new Date(editableTrip.registrationDeadline + 'T00:00:00').toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      } catch {
        return editableTrip.registrationDeadline;
      }
    }
    return '15 de noviembre de 2026';
  };

  // Abrir modal de WhatsApp con plantillas
  const openWhatsAppModal = (student, templateType = 'deadline') => {
    const deadline = getDeadlineText();
    let text = '';
    if (templateType === 'deadline') {
      text = `Hola ${student.fullName}, te recordamos que tu fecha límite para liquidar tu lugar del viaje es el ${deadline}. Si tienes alguna duda sobre tus abonos o métodos de pago, con gusto te apoyamos.`;
    } else if (templateType === 'deposit') {
      text = `Hola ${student.fullName}, te recordamos que para asegurar tu lugar en el autobús del Viaje de Prácticas 2026 es necesario apartar con tu anticipo de $${editableTrip.paymentInfo?.depositAmount || 500} antes del ${deadline}.`;
    } else if (templateType === 'clabe') {
      text = `Hola ${student.fullName}, te compartimos la cuenta oficial para transferencias del Viaje de Prácticas 2026: Banco: ${editableTrip.paymentInfo?.bankName || 'BBVA México'}, CLABE: ${editableTrip.paymentInfo?.clabe || '012180015623489012'}. Por favor incluye tu matrícula (${student.controlNumber}) en el concepto y envíanos tu comprobante.`;
    }
    setCustomWaMsg(text);
    setWaModalStudent(student);
  };

  // Actualizar estado de pago de un alumno
  const handleUpdateStudentPayment = async (studentId, studentName, newStatus) => {
    const tCost = editableTrip?.paymentInfo?.totalCost || 3500;
    const dAmount = editableTrip?.paymentInfo?.depositAmount || 500;
    let amount = 0;
    if (newStatus === 'deposit') amount = dAmount;
    if (newStatus === 'full') amount = tCost;

    try {
      await updateStudentPaymentStatus(studentId, {
        paymentStatus: newStatus,
        amountPaid: amount,
        paymentUpdatedAt: new Date().toISOString()
      });

      setAdminRegistrations(prev => prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            paymentStatus: newStatus,
            amountPaid: amount,
            paymentUpdatedAt: new Date().toISOString()
          };
        }
        return s;
      }));

      const label = newStatus === 'full' ? `Liquidado ($${amount})` : newStatus === 'deposit' ? `Anticipo ($${amount})` : 'Pendiente';
      setPaymentUpdateMsg(`Pago de "${studentName}" actualizado a: ${label}`);
      setTimeout(() => setPaymentUpdateMsg(''), 3500);
    } catch (err) {
      alert('Error al actualizar el pago en Firebase: ' + (err.message || 'Error en servidor'));
    }
  };

  // Filtrado de alumnos
  const filteredStudents = adminRegistrations.filter(s => {
    const matchesSearch = 
      (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.controlNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = filterSemester === 'todos' || String(s.semester) === String(filterSemester);
    const matchesGroup = filterGroup === 'todos' || s.group === filterGroup;
    const matchesPayment = 
      filterPayment === 'todos' || 
      (filterPayment === 'pending' && (!s.paymentStatus || s.paymentStatus === 'pending')) ||
      (filterPayment === 'deposit' && s.paymentStatus === 'deposit') ||
      (filterPayment === 'full' && s.paymentStatus === 'full');

    return matchesSearch && matchesSemester && matchesGroup && matchesPayment;
  });

  // Métricas financieras en tiempo real
  const totalCost = editableTrip?.paymentInfo?.totalCost || 3500;
  const depositAmount = editableTrip?.paymentInfo?.depositAmount || 500;

  const totalRevenue = adminRegistrations.reduce((acc, curr) => {
    const amt = Number(curr.amountPaid);
    if (!isNaN(amt) && amt > 0) return acc + amt;
    if (curr.paymentStatus === 'full') return acc + totalCost;
    if (curr.paymentStatus === 'deposit') return acc + depositAmount;
    return acc;
  }, 0);

  const studentsDepositCount = adminRegistrations.filter(r => r.paymentStatus === 'deposit').length;
  const studentsFullCount = adminRegistrations.filter(r => r.paymentStatus === 'full').length;
  const studentsPendingCount = adminRegistrations.filter(r => !r.paymentStatus || r.paymentStatus === 'pending').length;
  const pendingRevenue = Math.max(0, (adminRegistrations.length * totalCost) - totalRevenue);

  // Estadísticas por semestre
  const semesterCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(sem => {
    return {
      semester: sem,
      count: adminRegistrations.filter(r => Number(r.semester) === sem).length
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

  const formatDateTimePreview = (isoDateStr) => {
    if (!isoDateStr) return 'Fecha no definida';
    try {
      const d = new Date(isoDateStr);
      if (isNaN(d.getTime())) return isoDateStr;
      return d.toLocaleString('es-MX', {
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

  const handleAddDay = () => {
    const updatedItinerary = [...(editableTrip.itinerary || [])];
    const newDayNum = updatedItinerary.length + 1;
    updatedItinerary.push({
      day: newDayNum,
      dateTitle: `Día ${newDayNum} - Nuevas Actividades`,
      theme: 'Jornada Académica e Industrial',
      activities: [
        {
          time: '08:00 AM',
          title: 'Desayuno Buffet',
          location: 'Hotel Azure',
          desc: 'Desayuno completo incluido.'
        },
        {
          time: '10:00 AM',
          title: 'Visita Técnica / Ponencia',
          location: 'Empresa Sede',
          desc: 'Recorrido técnico y sesión de preguntas.'
        }
      ]
    });
    setEditableTrip({ ...editableTrip, itinerary: updatedItinerary });
  };

  const handleRemoveDay = (dayIndex) => {
    if (window.confirm(`¿Estás seguro de eliminar el Día ${dayIndex + 1} de este itinerario?`)) {
      const updatedItinerary = [...editableTrip.itinerary];
      updatedItinerary.splice(dayIndex, 1);
      const renumbered = updatedItinerary.map((d, idx) => ({
        ...d,
        day: idx + 1
      }));
      setEditableTrip({ ...editableTrip, itinerary: renumbered });
    }
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
                {isAuthenticated && adminUser ? (
                  <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={13} /> Sesión verificada: {adminUser.email}
                  </span>
                ) : (
                  'Comité Organizador y Gestión de Datos'
                )}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                className="btn btn-secondary" 
                title="Cerrar sesión de organizador"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <LogOut size={14} />
                <span>Salir</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.6rem', borderRadius: '50%' }}
              title="Cerrar panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Si no está autenticado: Pantalla de Login Seguro */}
        {!isAuthenticated ? (
          <div className="modal-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '380px' }}>
            <form onSubmit={handleLogin} style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <ShieldCheck size={32} />
              </div>
              
              <h4 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Acceso de Organizadores
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Ingresa con tu cuenta de organizador verificada en Firebase Authentication.
              </p>

              {loginError && (
                <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fda4af', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '1.25rem', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <div>{loginError}</div>
                </div>
              )}

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label" htmlFor="adminEmail">Correo de Organizador:</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="adminEmail"
                    type="email"
                    required
                    placeholder="organizador@instituto.edu.mx"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label" htmlFor="adminPass">Contraseña:</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="adminPass"
                    type="password"
                    required
                    placeholder="Ingresa tu contraseña"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmittingAuth}
                style={{ width: '100%', marginTop: '0.8rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isSubmittingAuth ? (
                  <>
                    <RefreshCw size={16} className="spin-animation" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Iniciar Sesión de Administrador</span>
                  </>
                )}
              </button>

              <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', fontSize: '0.76rem', color: 'var(--text-subtle)', lineHeight: '1.4' }}>
                🔒 <strong>Autenticación en Servidor:</strong> Protegido contra manipulación de código local y DevTools mediante reglas de seguridad en Firebase Firestore.
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
                <span>Interesados ({adminRegistrations.length})</span>
              </button>

              <button 
                className={`admin-tab ${activeTab === 'acceso' ? 'active' : ''}`}
                onClick={() => setActiveTab('acceso')}
              >
                <Clock size={17} />
                <span>Apertura y Acceso</span>
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
                className={`admin-tab ${activeTab === 'pagos' ? 'active' : ''}`}
                onClick={() => setActiveTab('pagos')}
              >
                <DollarSign size={17} />
                <span>Control Pagos & CLABE</span>
              </button>

              <button 
                className={`admin-tab ${activeTab === 'seguridad' ? 'active' : ''}`}
                onClick={() => setActiveTab('seguridad')}
              >
                <ShieldCheck size={17} />
                <span>Seguridad y Accesos</span>
              </button>
            </div>

            <div className="modal-body">
              
              {/* TAB 1: LISTA DE ALUMNOS REGISTRADOS */}
              {activeTab === 'registros' && (
                <div>
                  {regsError && (
                    <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fda4af', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <ShieldAlert size={22} style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>Acceso no autorizado en el servidor</div>
                        <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{regsError}</div>
                      </div>
                    </div>
                  )}

                  {paymentUpdateMsg && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Check size={18} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{paymentUpdateMsg}</span>
                    </div>
                  )}

                  {/* Resumen de Métricas Financieras y Operativas */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>TOTAL REGISTRADOS</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {adminRegistrations.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>alumnos</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Cupo restante: {Math.max(0, (editableTrip.capacity || 80) - adminRegistrations.length)} lugares
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>TOTAL RECAUDADO</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                        ${totalRevenue.toLocaleString('es-MX')} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>MXN</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                        🟢 {studentsFullCount} liquidados • 🔵 {studentsDepositCount} con anticipo
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>POR RECAUDAR / COBRAR</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                        ${pendingRevenue.toLocaleString('es-MX')} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>MXN</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        🟡 {studentsPendingCount} pendientes de pago
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>BASE DE DATOS</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: isFirebaseConfigured() ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: '0.3rem' }}>
                        {isFirebaseConfigured() ? '🟢 Firestore Activo' : '🟡 Modo Local'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Sincronización en tiempo real
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

                  {/* Barra de Filtros, Búsqueda y Botones de Acción */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.65rem', flex: 1, minWidth: '300px', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
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
                        style={{ width: '150px' }}
                        value={filterSemester}
                        onChange={(e) => setFilterSemester(e.target.value)}
                      >
                        <option value="todos">Semestres (Todos)</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => (
                          <option key={s} value={s}>{s}° Semestre</option>
                        ))}
                      </select>

                      <select 
                        className="form-select" 
                        style={{ width: '125px' }}
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                      >
                        <option value="todos">Grupos (Todos)</option>
                        {['A', 'B', 'C', 'D', 'E', 'F'].map(g => (
                          <option key={g} value={g}>Grupo {g}</option>
                        ))}
                      </select>

                      <select 
                        className="form-select" 
                        style={{ width: '160px' }}
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                      >
                        <option value="todos">Todos los Pagos</option>
                        <option value="pending">🟡 Pendientes ({studentsPendingCount})</option>
                        <option value="deposit">🔵 Con Anticipo ({studentsDepositCount})</option>
                        <option value="full">🟢 Liquidados ({studentsFullCount})</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={fetchRegistrations}
                        className="btn btn-secondary"
                        disabled={isLoadingRegs}
                        title="Recargar registros desde Firestore"
                        style={{ padding: '0.65rem 0.9rem' }}
                      >
                        <RefreshCw size={15} className={isLoadingRegs ? 'spin-animation' : ''} />
                      </button>

                      <button 
                        onClick={() => setIsPrintModalOpen(true)}
                        className="btn btn-secondary"
                        style={{ padding: '0.65rem 1.15rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: 'var(--accent-cyan)' }}
                        title="Generar e imprimir lista de asistencia del autobús o gafetes en PDF"
                      >
                        <Printer size={16} />
                        <span>Imprimir Lista / Gafetes</span>
                      </button>

                      <button 
                        onClick={() => exportStudentsToCSV(filteredStudents, editableTrip.title)}
                        className="btn btn-primary"
                        style={{ padding: '0.65rem 1.15rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                      >
                        <Download size={16} />
                        <span>Exportar a Excel</span>
                      </button>
                    </div>
                  </div>

                  {/* Tabla de Alumnos con Control de Pagos */}
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>No.</th>
                          <th>Nombre del Alumno</th>
                          <th>No. Control</th>
                          <th>Semestre</th>
                          <th>Grupo</th>
                          <th>WhatsApp</th>
                          <th style={{ minWidth: '175px' }}>Estatus de Pago</th>
                          <th>Notas</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingRegs ? (
                          <tr>
                            <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                              <RefreshCw size={22} className="spin-animation" style={{ margin: '0 auto 0.5rem' }} />
                              <div>Consultando registros de alumnos en Firebase Firestore...</div>
                            </td>
                          </tr>
                        ) : filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                              No se encontraron registros con los criterios seleccionados.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((st, idx) => {
                            const isFull = st.paymentStatus === 'full';
                            const isDeposit = st.paymentStatus === 'deposit';

                            return (
                              <tr key={st.id || idx}>
                                <td>{idx + 1}</td>
                                <td style={{ fontWeight: 600, color: '#fff' }}>{st.fullName}</td>
                                <td><span className="badge badge-cyan">{st.controlNumber}</span></td>
                                <td><span className="badge badge-purple">{st.semester}° Sem</span></td>
                                <td><strong>{st.group}</strong></td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'nowrap' }}>
                                    <a 
                                      href={`https://wa.me/${(st.phone || '').replace(/[^0-9]/g, '').startsWith('52') ? (st.phone || '').replace(/[^0-9]/g, '') : '52' + (st.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${st.fullName}, te recordamos que tu fecha límite para liquidar tu lugar del viaje es el ${getDeadlineText()}.`)}`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      style={{ color: '#6ee7b7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.84rem' }}
                                      title="Abrir chat en WhatsApp"
                                    >
                                      <MessageCircle size={15} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                                      <span>{st.phone}</span>
                                    </a>

                                    {/* Botón directo de Recordatorio de Fecha Límite */}
                                    <a 
                                      href={`https://wa.me/${(st.phone || '').replace(/[^0-9]/g, '').startsWith('52') ? (st.phone || '').replace(/[^0-9]/g, '') : '52' + (st.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${st.fullName}, te recordamos que tu fecha límite para liquidar tu lugar del viaje es el ${getDeadlineText()}.`)}`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="btn"
                                      style={{
                                        padding: '0.22rem 0.55rem',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        background: 'rgba(16, 185, 129, 0.16)',
                                        border: '1px solid rgba(16, 185, 129, 0.45)',
                                        color: '#6ee7b7',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        textDecoration: 'none',
                                        whiteSpace: 'nowrap'
                                      }}
                                      title={`Enviar recordatorio directo: "Hola ${st.fullName}, te recordamos que tu fecha límite para liquidar tu lugar del viaje es el ${getDeadlineText()}."`}
                                    >
                                      <span>Recordar</span>
                                    </a>

                                    {/* Botón para elegir otras plantillas o editar mensaje */}
                                    <button 
                                      onClick={() => openWhatsAppModal(st, 'deadline')}
                                      className="btn btn-secondary"
                                      style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                                      title="Elegir o editar mensaje personalizado de WhatsApp"
                                    >
                                      ✏️
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  {/* Control Interactivo de Pago por Alumno */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <select
                                      value={st.paymentStatus || 'pending'}
                                      onChange={(e) => handleUpdateStudentPayment(st.id, st.fullName, e.target.value)}
                                      className="form-select"
                                      style={{
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        background: isFull 
                                          ? 'rgba(16, 185, 129, 0.18)' 
                                          : isDeposit 
                                            ? 'rgba(56, 189, 248, 0.18)' 
                                            : 'rgba(245, 158, 11, 0.18)',
                                        color: isFull 
                                          ? '#6ee7b7' 
                                          : isDeposit 
                                            ? '#7dd3fc' 
                                            : '#fde68a',
                                        border: isFull 
                                          ? '1px solid rgba(16, 185, 129, 0.4)' 
                                          : isDeposit 
                                            ? '1px solid rgba(56, 189, 248, 0.4)' 
                                            : '1px solid rgba(245, 158, 11, 0.4)',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <option value="pending" style={{ background: '#0f172a', color: '#fde68a' }}>🟡 Pendiente ($0)</option>
                                      <option value="deposit" style={{ background: '#0f172a', color: '#7dd3fc' }}>🔵 Anticipo (${depositAmount})</option>
                                      <option value="full" style={{ background: '#0f172a', color: '#6ee7b7' }}>🟢 Liquidado (${totalCost})</option>
                                    </select>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                      Abonado: <strong style={{ color: '#fff' }}>${(st.amountPaid || (isFull ? totalCost : isDeposit ? depositAmount : 0)).toLocaleString('es-MX')}</strong>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '180px' }}>
                                  {st.paymentNotes ? (
                                    <span style={{ color: '#cbd5e1' }}>{st.paymentNotes}</span>
                                  ) : st.notes ? (
                                    <span>{st.notes}</span>
                                  ) : '-'}
                                </td>
                                <td>
                                  <button 
                                    onClick={() => handleDeleteStudent(st.id, st.fullName)}
                                    className="btn btn-danger"
                                    style={{ padding: '0.35rem 0.6rem' }}
                                    title="Eliminar registro"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB NUEVO: CONTROL DE APERTURA Y ACCESO A LA PÁGINA */}
              {activeTab === 'acceso' && (
                <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Feedback de Guardado */}
                  {saveStatus === 'exito' && (
                    <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '0.9rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Check size={18} />
                      <strong>¡Configuración de apertura y acceso guardada exitosamente en la base de datos!</strong>
                    </div>
                  )}

                  {saveStatus === 'error' && (
                    <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fda4af', padding: '0.9rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <AlertCircle size={18} />
                      <strong>Ocurrió un error al guardar la configuración. Intenta nuevamente.</strong>
                    </div>
                  )}

                  {/* Encabezado y Estado en Tiempo Real */}
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div className="icon-bubble icon-bubble-cyan">
                        <Clock size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                          Fecha de Apertura y Control de Acceso a la Página
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Define la fecha y hora programada en que los alumnos podrán ingresar a la web o al formulario de registro.
                        </p>
                      </div>
                    </div>

                    {/* Banner de Estado Visual */}
                    <div style={{ 
                      marginTop: '1.25rem', 
                      padding: '1.1rem 1.25rem', 
                      borderRadius: 'var(--radius-md)', 
                      background: editableTrip.accessControl?.enabled ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)', 
                      border: editableTrip.accessControl?.enabled ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ fontSize: '1.35rem', marginTop: '0.05rem' }}>
                          {editableTrip.accessControl?.enabled 
                            ? (editableTrip.accessControl?.openingDate && new Date() < new Date(editableTrip.accessControl.openingDate) ? '⏳' : '✅') 
                            : '🟢'}
                        </div>
                        <div style={{ fontSize: '0.88rem', lineHeight: '1.5', flex: 1 }}>
                          <strong style={{ color: editableTrip.accessControl?.enabled ? '#fbbf24' : '#34d399', display: 'block', fontSize: '0.98rem', marginBottom: '0.25rem' }}>
                            {editableTrip.accessControl?.enabled 
                              ? (editableTrip.accessControl?.openingDate && new Date() < new Date(editableTrip.accessControl.openingDate)
                                  ? 'Acceso Programado / Restringido para Visitantes'
                                  : 'Apertura Cumplida (Plataforma ya desbloqueada)')
                              : 'Acceso Totalmente Libre (Sin restricciones de fecha)'}
                          </strong>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {editableTrip.accessControl?.enabled 
                              ? (editableTrip.accessControl?.openingDate && new Date() < new Date(editableTrip.accessControl.openingDate)
                                  ? `La página o el registro abrirán automáticamente el ${formatDateTimePreview(editableTrip.accessControl?.openingDate)}. Los organizadores pueden ingresar en cualquier momento con su contraseña.`
                                  : `La fecha fijada (${formatDateTimePreview(editableTrip.accessControl?.openingDate)}) ya transcurrió. La plataforma está disponible para todos.`)
                              : 'Cualquier estudiante puede ingresar a la página web y registrarse libremente sin ninguna cuenta regresiva previa.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1. Activar y Programar Fecha */}
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
                      1. Programación de Fecha y Hora de Apertura
                    </h5>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' }}>
                      <input 
                        type="checkbox"
                        checked={Boolean(editableTrip.accessControl?.enabled)}
                        onChange={(e) => setEditableTrip({
                          ...editableTrip,
                          accessControl: {
                            ...(editableTrip.accessControl || {}),
                            enabled: e.target.checked
                          }
                        })}
                        style={{ width: '18px', height: '18px', marginTop: '0.2rem', accentColor: 'var(--accent-cyan)' }}
                      />
                      <div>
                        <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block' }}>
                          Habilitar fecha programada de apertura / acceso a la página
                        </strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem', display: 'block' }}>
                          Al marcar esta casilla, los estudiantes verán una cuenta regresiva hasta la fecha y hora seleccionada abajo.
                        </span>
                      </div>
                    </label>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        Fecha y Hora Exacta de Apertura (Hora local):
                      </label>
                      <input 
                        type="datetime-local"
                        className="form-input"
                        value={editableTrip.accessControl?.openingDate || '2026-10-15T08:00'}
                        disabled={!editableTrip.accessControl?.enabled}
                        onChange={(e) => setEditableTrip({
                          ...editableTrip,
                          accessControl: {
                            ...(editableTrip.accessControl || {}),
                            openingDate: e.target.value
                          }
                        })}
                        style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>
                        📅 Formato amigable: <strong>{formatDateTimePreview(editableTrip.accessControl?.openingDate)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* 2. Tipo de Restricción */}
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
                      2. Modo de Restricción
                    </h5>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      {/* Modo A: Bloquear toda la página */}
                      <div 
                        onClick={() => editableTrip.accessControl?.enabled && setEditableTrip({
                          ...editableTrip,
                          accessControl: {
                            ...(editableTrip.accessControl || {}),
                            lockMode: 'full_page'
                          }
                        })}
                        style={{ 
                          padding: '1.25rem', 
                          borderRadius: 'var(--radius-md)', 
                          cursor: editableTrip.accessControl?.enabled ? 'pointer' : 'not-allowed',
                          opacity: editableTrip.accessControl?.enabled ? 1 : 0.6,
                          background: editableTrip.accessControl?.lockMode === 'full_page' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.02)',
                          border: editableTrip.accessControl?.lockMode === 'full_page' ? '2px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.08)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.3rem' }}>🌐</span>
                          <span className={`badge ${editableTrip.accessControl?.lockMode === 'full_page' ? 'badge-cyan' : 'badge-amber'}`}>
                            {editableTrip.accessControl?.lockMode === 'full_page' ? 'Seleccionado' : 'Opción 1'}
                          </span>
                        </div>
                        <h6 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
                          Bloquear toda la página (Launch Gate)
                        </h6>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                          Los visitantes solo verán la pantalla de Próxima Apertura con el reloj en cuenta regresiva. Los organizadores acceden con contraseña.
                        </p>
                      </div>

                      {/* Modo B: Bloquear solo el registro */}
                      <div 
                        onClick={() => editableTrip.accessControl?.enabled && setEditableTrip({
                          ...editableTrip,
                          accessControl: {
                            ...(editableTrip.accessControl || {}),
                            lockMode: 'registration_only'
                          }
                        })}
                        style={{ 
                          padding: '1.25rem', 
                          borderRadius: 'var(--radius-md)', 
                          cursor: editableTrip.accessControl?.enabled ? 'pointer' : 'not-allowed',
                          opacity: editableTrip.accessControl?.enabled ? 1 : 0.6,
                          background: editableTrip.accessControl?.lockMode === 'registration_only' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.02)',
                          border: editableTrip.accessControl?.lockMode === 'registration_only' ? '2px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.08)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.3rem' }}>📝</span>
                          <span className={`badge ${editableTrip.accessControl?.lockMode === 'registration_only' ? 'badge-cyan' : 'badge-amber'}`}>
                            {editableTrip.accessControl?.lockMode === 'registration_only' ? 'Seleccionado' : 'Opción 2'}
                          </span>
                        </div>
                        <h6 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
                          Bloquear únicamente el registro
                        </h6>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                          Los alumnos pueden navegar la página (itinerario, hotel, autobús), pero el formulario se desbloquea en la fecha programada.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Mensaje y Cierre por Fecha Límite */}
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
                      3. Mensaje a Alumnos y Cierre de Convocatoria
                    </h5>

                    <div className="form-group">
                      <label className="form-label">Mensaje personalizado visible antes de la apertura:</label>
                      <textarea 
                        rows="3"
                        className="form-textarea"
                        placeholder="Ej: La plataforma oficial y el registro abrirán este lunes a las 08:00 AM. ¡Ten listos tus datos!"
                        value={editableTrip.accessControl?.customMessage || ''}
                        onChange={(e) => setEditableTrip({
                          ...editableTrip,
                          accessControl: {
                            ...(editableTrip.accessControl || {}),
                            customMessage: e.target.value
                          }
                        })}
                      />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)', marginTop: '1rem' }}>
                      <input 
                        type="checkbox"
                        checked={Boolean(editableTrip.accessControl?.closeAfterDeadline)}
                        onChange={(e) => setEditableTrip({
                          ...editableTrip,
                          accessControl: {
                            ...(editableTrip.accessControl || {}),
                            closeAfterDeadline: e.target.checked
                          }
                        })}
                        style={{ width: '18px', height: '18px', marginTop: '0.2rem', accentColor: 'var(--accent-amber)' }}
                      />
                      <div>
                        <strong style={{ color: '#fff', fontSize: '0.92rem', display: 'block' }}>
                          Bloquear automáticamente el formulario tras vencer la Fecha Límite de Registro
                        </strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem', display: 'block' }}>
                          Fecha límite fijada actualmente: <strong>{editableTrip.registrationDeadline || '2026-11-15'}</strong> (puedes ajustarla en la pestaña "Lugar, Hotel y Horarios").
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Botón Guardar */}
                  <button 
                    onClick={handleSaveTripGeneral}
                    disabled={saveStatus === 'guardando'}
                    className="btn btn-primary"
                    style={{ padding: '0.95rem', width: '100%', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
                  >
                    {saveStatus === 'guardando' ? (
                      <>
                        <RefreshCw size={18} className="spin-animation" />
                        <span>Guardando cambios en Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Guardar Configuración de Apertura y Acceso</span>
                      </>
                    )}
                  </button>

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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Cupo Máximo de Alumnos:</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          value={editableTrip.capacity || 70} 
                          onChange={(e) => setEditableTrip({ ...editableTrip, capacity: Number(e.target.value) })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Fecha Límite de Registro:</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          value={editableTrip.registrationDeadline || '2026-11-15'} 
                          onChange={(e) => setEditableTrip({ ...editableTrip, registrationDeadline: e.target.value })}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                          Fecha máxima para apartar hotel y transporte.
                        </span>
                      </div>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleAddItineraryActivity(dayIdx)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          >
                            <Plus size={14} /> Agregar Actividad / Horario
                          </button>
                          {editableTrip.itinerary?.length > 1 && (
                            <button 
                              onClick={() => handleRemoveDay(dayIdx)}
                              className="btn btn-danger"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                              title="Eliminar este día del itinerario"
                            >
                              <Trash2 size={14} /> Eliminar Día
                            </button>
                          )}
                        </div>
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

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button 
                      type="button"
                      onClick={handleAddDay}
                      className="btn btn-secondary"
                      style={{ padding: '0.9rem 1.25rem', flex: 1, minWidth: '220px' }}
                    >
                      <Plus size={18} />
                      <span>Agregar Nuevo Día al Itinerario</span>
                    </button>
                    <button 
                      onClick={handleSaveTripGeneral}
                      className="btn btn-primary"
                      style={{ padding: '0.9rem 1.25rem', flex: 2, minWidth: '220px' }}
                    >
                      <Save size={18} />
                      <span>Guardar Itinerario Completo ({editableTrip.itinerary?.length || 0} Días)</span>
                    </button>
                  </div>
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

              {/* TAB 5: SEGURIDAD Y CONTROL DE ACCESO (FIREBASE AUTH) */}
              {activeTab === 'seguridad' && (
                <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Tarjeta de Sesión Activa */}
                  <div className="glass-panel" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '0.65rem', borderRadius: 'var(--radius-md)', color: 'var(--accent-emerald)' }}>
                          <ShieldCheck size={26} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                            Sesión de Organizador Activa
                          </h4>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Autenticación criptográfica mediante Google Firebase Auth.
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={handleLogout}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
                      >
                        <LogOut size={15} />
                        <span>Cerrar Sesión Segura</span>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Correo Autorizado</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                          {adminUser?.email || 'admin@viaje-escolar.com'}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Protección de Servidor</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                          🟢 firestore.rules Activo
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta de Gestión de Cuentas en Firebase Console */}
                  <div className="glass-panel" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ background: 'rgba(56, 189, 248, 0.12)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: 'var(--accent-cyan)' }}>
                        <Key size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                          Cómo Cambiar Contraseñas y Agregar Organizadores
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          La seguridad se gestiona directamente en la consola oficial de Google.
                        </p>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <p>
                        Para evitar que las contraseñas queden expuestas en el código fuente de la aplicación web o en GitHub, las cuentas se administran en <strong>Firebase Authentication</strong>:
                      </p>
                      <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <li>Ingresa a <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>console.firebase.google.com</a> y abre el proyecto <strong>viaje-escolar</strong>.</li>
                        <li>En el menú lateral izquierdo, haz clic en <strong>Build</strong> y luego en <strong>Authentication</strong>.</li>
                        <li>En la pestaña <strong>Users</strong> (Usuarios), puedes hacer clic en <strong>"Agregar usuario"</strong> para registrar a otro docente u organizador con su correo y contraseña.</li>
                        <li>Para cambiar la contraseña de un usuario existente, haz clic en los 3 puntos al final de la fila del usuario y selecciona <strong>"Restablecer contraseña"</strong> o <strong>"Cambiar contraseña"</strong>.</li>
                      </ol>
                    </div>

                    <div style={{ marginTop: '1.25rem' }}>
                      <a 
                        href="https://console.firebase.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                      >
                        <ExternalLink size={15} />
                        <span>Abrir Consola de Firebase</span>
                      </a>
                    </div>
                  </div>

                  {/* Tarjeta Informativa de Blindaje */}
                  <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <ShieldCheck size={22} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: '0.15rem' }} />
                      <div style={{ fontSize: '0.84rem', lineHeight: '1.55' }}>
                        <div style={{ fontWeight: 700, color: '#6ee7b7', marginBottom: '0.25rem' }}>
                          Blindaje contra React DevTools y Consola del Navegador
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          Las consultas a la colección <code>interesados_viaje</code> son validadas en los servidores de Google con <code>request.auth != null</code>. Cualquier intento de modificar el código local o saltarse el login en el navegador es bloqueado automáticamente con <strong>Permission Denied</strong>.
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 6: CONFIGURACIÓN DE CUOTAS, ABONOS Y CLABE */}
              {activeTab === 'pagos' && (
                <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Tarjeta de Resumen Financiero Actual */}
                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="icon-bubble icon-bubble-emerald">
                          <DollarSign size={24} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                            Resumen de Recaudación en Tiempo Real
                          </h4>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Calculado automáticamente con los registros activos de la base de datos
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => setIsPrintModalOpen(true)}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                      >
                        <Printer size={15} />
                        <span>Imprimir Lista de Autobús</span>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.9rem', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Cobrado</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                          ${totalRevenue.toLocaleString('es-MX')} MXN
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.9rem', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Por Cobrar</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                          ${pendingRevenue.toLocaleString('es-MX')} MXN
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.9rem', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Alumnos Liquidados</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                          {studentsFullCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>de {adminRegistrations.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1. Costos y Anticipo */}
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <DollarSign size={18} />
                      1. Costo Total del Viaje y Anticipo Inicial
                    </h5>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Costo Total por Alumno ($MXN):</label>
                        <input 
                          type="number"
                          className="form-input"
                          value={editableTrip.paymentInfo?.totalCost || 3500}
                          onChange={(e) => setEditableTrip({
                            ...editableTrip,
                            paymentInfo: {
                              ...(editableTrip.paymentInfo || {}),
                              totalCost: Number(e.target.value) || 0
                            }
                          })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Monto de Anticipo para Apartar ($MXN):</label>
                        <input 
                          type="number"
                          className="form-input"
                          value={editableTrip.paymentInfo?.depositAmount || 500}
                          onChange={(e) => setEditableTrip({
                            ...editableTrip,
                            paymentInfo: {
                              ...(editableTrip.paymentInfo || {}),
                              depositAmount: Number(e.target.value) || 0
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Datos Bancarios Oficiales y Regla del 15 de Noviembre */}
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CreditCard size={18} />
                      2. Cuenta Bancaria Oficial (SPEI) y Regla del 15 de Noviembre
                    </h5>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div className="form-group">
                        <label className="form-label">Banco Receptor:</label>
                        <input 
                          type="text"
                          className="form-input"
                          placeholder="Ej: BBVA México, Banorte, Santander"
                          value={editableTrip.paymentInfo?.bankName || ''}
                          onChange={(e) => setEditableTrip({
                            ...editableTrip,
                            paymentInfo: {
                              ...(editableTrip.paymentInfo || {}),
                              bankName: e.target.value
                            }
                          })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Beneficiario / Titular de la Cuenta:</label>
                        <input 
                          type="text"
                          className="form-input"
                          placeholder="Ej: Comité Organizador del Viaje de Prácticas"
                          value={editableTrip.paymentInfo?.accountHolder || ''}
                          onChange={(e) => setEditableTrip({
                            ...editableTrip,
                            paymentInfo: {
                              ...(editableTrip.paymentInfo || {}),
                              accountHolder: e.target.value
                            }
                          })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Cuenta CLABE Interbancaria (18 dígitos):</label>
                        <input 
                          type="text"
                          className="form-input"
                          maxLength={18}
                          placeholder="012180015623489012"
                          value={editableTrip.paymentInfo?.clabe || ''}
                          onChange={(e) => setEditableTrip({
                            ...editableTrip,
                            paymentInfo: {
                              ...(editableTrip.paymentInfo || {}),
                              clabe: e.target.value
                            }
                          })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Fecha Oficial de Liberación de CLABE:</label>
                        <input 
                          type="date"
                          className="form-input"
                          value={(editableTrip.paymentInfo?.clabeReleaseDate || '2026-11-15').split('T')[0]}
                          onChange={(e) => setEditableTrip({
                            ...editableTrip,
                            paymentInfo: {
                              ...(editableTrip.paymentInfo || {}),
                              clabeReleaseDate: e.target.value + 'T00:00:00'
                            }
                          })}
                        />
                      </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <input 
                        type="checkbox"
                        checked={Boolean(editableTrip.paymentInfo?.forceClabeVisible)}
                        onChange={(e) => setEditableTrip({
                          ...editableTrip,
                          paymentInfo: {
                            ...(editableTrip.paymentInfo || {}),
                            forceClabeVisible: e.target.checked
                          }
                        })}
                        style={{ width: '18px', height: '18px', marginTop: '0.2rem', accentColor: 'var(--accent-emerald)' }}
                      />
                      <div>
                        <strong style={{ color: '#fff', fontSize: '0.92rem', display: 'block' }}>
                          Mostrar y habilitar la Cuenta CLABE de inmediato en la página pública
                        </strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem', display: 'block' }}>
                          Por defecto, la CLABE está protegida con cuenta regresiva hasta el <strong>15 de noviembre</strong>. Marca esta casilla únicamente si deseas liberarla antes o si ya abrieron recepción de depósitos.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Botón Guardar */}
                  <button 
                    onClick={handleSaveTripGeneral}
                    disabled={saveStatus === 'guardando'}
                    className="btn btn-primary"
                    style={{ padding: '0.95rem', width: '100%', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
                  >
                    {saveStatus === 'guardando' ? (
                      <>
                        <RefreshCw size={18} className="spin-animation" />
                        <span>Guardando configuración de pagos en Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Guardar Configuración de Pagos y CLABE</span>
                      </>
                    )}
                  </button>

                </div>
              )}

            </div>
          </>
        )}

        {/* Modal de Impresión Oficial y Gafetes */}
        <PrintAttendanceModal 
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          students={adminRegistrations}
          trip={editableTrip}
        />

        {/* Modal de Mensajería Rápida de WhatsApp */}
        {waModalStudent && (
          <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setWaModalStudent(null)}>
            <div className="modal-content" style={{ maxWidth: '520px', width: '92vw' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="icon-bubble icon-bubble-emerald" style={{ width: '38px', height: '38px' }}>
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                      Mensaje Rápido de WhatsApp
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Para: <strong style={{ color: '#fff' }}>{waModalStudent.fullName}</strong> ({waModalStudent.phone})
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setWaModalStudent(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem', borderRadius: '50%' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                    Plantillas rápidas con datos automáticos:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
                    <button 
                      onClick={() => openWhatsAppModal(waModalStudent, 'deadline')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.74rem', padding: '0.5rem 0.3rem', textAlign: 'center' }}
                    >
                      📅 Fecha Límite
                    </button>
                    <button 
                      onClick={() => openWhatsAppModal(waModalStudent, 'deposit')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.74rem', padding: '0.5rem 0.3rem', textAlign: 'center' }}
                    >
                      💰 Anticipo ($500)
                    </button>
                    <button 
                      onClick={() => openWhatsAppModal(waModalStudent, 'clabe')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.74rem', padding: '0.5rem 0.3rem', textAlign: 'center' }}
                    >
                      🏦 Cuenta CLABE
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Texto del mensaje a enviar:</label>
                  <textarea 
                    rows="4"
                    className="form-textarea"
                    value={customWaMsg}
                    onChange={(e) => setCustomWaMsg(e.target.value)}
                    style={{ fontSize: '0.86rem', lineHeight: '1.5' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={() => setWaModalStudent(null)}
                    className="btn btn-secondary"
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  >
                    Cancelar
                  </button>
                  <a 
                    href={`https://wa.me/${(waModalStudent.phone || '').replace(/[^0-9]/g, '').startsWith('52') ? (waModalStudent.phone || '').replace(/[^0-9]/g, '') : '52' + (waModalStudent.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customWaMsg)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setWaModalStudent(null)}
                    className="btn btn-primary"
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#10b981', borderColor: '#10b981', color: '#fff', textDecoration: 'none' }}
                  >
                    <Send size={15} />
                    <span>Abrir en WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
