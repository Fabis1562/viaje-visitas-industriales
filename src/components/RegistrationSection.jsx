import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, 
  Hash, 
  GraduationCap, 
  Layers, 
  Phone, 
  Mail, 
  CheckCircle, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  Send,
  Clock,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { 
  registerStudent, 
  checkDailySubmissionLimit, 
  clearDailySubmissionLimit 
} from '../services/dataService';

export const RegistrationSection = ({ onRegistrationSuccess, tripTitle }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    controlNumber: '',
    age: '',
    semester: 7,
    group: 'A',
    phone: '',
    email: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [dailyLimit, setDailyLimit] = useState(() => checkDailySubmissionLimit());

  // Los 9 semestres solicitados
  const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSemesterSelect = (sem) => {
    setFormData(prev => ({ ...prev, semester: sem }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validaciones
    if (!formData.fullName.trim()) {
      setErrorMsg('Por favor escribe tu nombre completo.');
      return;
    }

    if (!formData.controlNumber.trim()) {
      setErrorMsg('Por favor ingresa tu número de control de estudiante.');
      return;
    }

    const parsedAge = parseInt(formData.age, 10);
    if (!parsedAge || parsedAge < 16 || parsedAge > 80) {
      setErrorMsg('Por favor indica una edad válida (mínimo 16 años).');
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMsg('Por favor incluye un número de teléfono o WhatsApp para el grupo de viaje.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerStudent({
        fullName: formData.fullName.trim(),
        controlNumber: formData.controlNumber.trim().toUpperCase(),
        age: parsedAge,
        semester: Number(formData.semester),
        group: formData.group,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        notes: formData.notes.trim()
      });

      if (result.success) {
        setSuccessData(result.data);
        setDailyLimit(checkDailySubmissionLimit());
        if (onRegistrationSuccess) {
          onRegistrationSuccess(result.data);
        }

        // Animación de confeti festivo
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      } else {
        setErrorMsg(result.message || 'Ocurrió un error al guardar el registro. Intenta de nuevo.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo procesar tu registro. Verifica tu conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setFormData({
      fullName: '',
      controlNumber: '',
      age: '',
      semester: 7,
      group: 'A',
      phone: '',
      email: '',
      notes: ''
    });
  };

  const handleUnlockSharedDevice = () => {
    if (window.confirm('¿Deseas habilitar el formulario para registrar a otro estudiante desde este equipo?')) {
      clearDailySubmissionLimit();
      setDailyLimit({ limited: false });
      setSuccessData(null);
      setErrorMsg('');
    }
  };

  return (
    <section id="registro" className="section">
      <div className="container">
        
        <div className="registration-container">
          
          {/* Columna Izquierda: Información de Convocatoria */}
          <div>
            <div className="section-tag">
              <span className="badge badge-emerald">
                <Sparkles size={14} /> Registro de Interesados
              </span>
            </div>

            <h2 className="section-title">
              ¡Aparta tu lugar y forma parte del viaje!
            </h2>

            <p className="section-desc" style={{ marginBottom: '1.5rem' }}>
              Este formulario nos permite coordinar las listas de asistencia, autobuses y reservaciones del hotel. No te quedes fuera de esta experiencia académica.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                <CheckCircle size={22} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>Alumnos de 1° a 9° Semestre</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    La convocatoria está abierta para todos los semestres de la carrera.
                  </p>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                <CheckCircle size={22} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>Base de Datos Segura y en Tiempo Real</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Tus datos se registran al instante para la gestión del comité organizador.
                  </p>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                <CheckCircle size={22} style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>Seguro Escolar y Constancia de Asistencia</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Se emitirá constancia con valor curricular para residencias y créditos complementarios.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario o Ticket de Éxito o Tarjeta de Límite Diario */}
          <div className="glass-panel registration-card">
            
            {successData ? (
              /* Tarjeta de Confirmación / Ticket de Registro */
              <div className="ticket-card">
                <div className="ticket-icon">
                  <CheckCircle size={36} />
                </div>
                
                <span className="badge badge-emerald" style={{ marginBottom: '0.8rem' }}>
                  ¡Registro Confirmado con Éxito!
                </span>

                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {successData.fullName}
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  Tus datos han sido registrados en la base de datos oficial del viaje.
                </p>

                <div style={{ background: 'rgba(15,23,42,0.8)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.88rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-subtle)', display: 'block', fontSize: '0.75rem' }}>NO. CONTROL:</span>
                      <strong style={{ color: 'var(--accent-cyan)' }}>{successData.controlNumber}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-subtle)', display: 'block', fontSize: '0.75rem' }}>EDAD:</span>
                      <strong>{successData.age} años</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-subtle)', display: 'block', fontSize: '0.75rem' }}>SEMESTRE Y GRUPO:</span>
                      <strong style={{ color: '#fff' }}>{successData.semester}° Semestre - Grupo {successData.group}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-subtle)', display: 'block', fontSize: '0.75rem' }}>WHATSAPP:</span>
                      <strong>{successData.phone}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <a href="#itinerario" className="btn btn-primary">
                    Ver Itinerario
                  </a>
                </div>
              </div>
            ) : dailyLimit?.limited ? (
              /* Tarjeta de Límite Diario Activo (Anti-Saturación de Firebase) */
              <div className="ticket-card" style={{ padding: '2rem 1.5rem' }}>
                <div className="ticket-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.35)', color: 'var(--accent-amber)' }}>
                  <Clock size={36} />
                </div>
                
                <span className="badge badge-amber" style={{ marginBottom: '0.8rem' }}>
                  🔒 Registro Diario Registrado
                </span>

                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Ya registraste tu interés hoy
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Para cuidar los recursos de la plataforma y evitar registros duplicados, solo se permite <strong>1 envío por día</strong> desde este dispositivo.
                </p>

                {dailyLimit.student && (
                  <div style={{ background: 'rgba(15,23,42,0.8)', padding: '1.1rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      DATOS ENVIADOS:
                    </div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginBottom: '0.3rem' }}>
                      {dailyLimit.student.fullName}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                      No. Control: {dailyLimit.student.controlNumber} • {dailyLimit.student.semester}° Semestre ({dailyLimit.student.group})
                    </div>
                  </div>
                )}

                <div style={{ 
                  background: 'rgba(56, 189, 248, 0.08)', 
                  border: '1px solid rgba(56, 189, 248, 0.2)', 
                  padding: '0.85rem 1rem', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem'
                }}>
                  <Clock size={16} color="var(--accent-cyan)" />
                  <span>Próximo envío disponible en: <strong>{dailyLimit.hoursRemaining}h {dailyLimit.minutesRemaining}m</strong></span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
                  <a href="#itinerario" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Consultar Itinerario del Viaje
                  </a>
                  
                  <button 
                    onClick={handleUnlockSharedDevice} 
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', border: 'none', background: 'transparent', color: 'var(--text-subtle)', cursor: 'pointer' }}
                    title="Habilitar formulario si estás en un laboratorio o biblioteca escolar"
                  >
                    <RotateCcw size={13} style={{ marginRight: '0.3rem', display: 'inline', verticalAlign: 'middle' }} />
                    ¿Equipo escolar compartido? Registrar a otro alumno
                  </button>
                </div>
              </div>
            ) : (
              /* Formulario de Registro */
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Formulario de Interés
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Completa tus datos escolares para contemplarte en las listas.
                    </p>
                  </div>
                  <span className="badge badge-amber" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                    <ShieldAlert size={12} /> 1 registro / día
                  </span>
                </div>

                {errorMsg && (
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
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* 1. Nombre Completo */}
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">
                    <User size={15} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Nombre Completo *</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    placeholder="Ej. Juan Carlos Pérez Morales"
                    className="form-input"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                {/* 2. No. de Control y Edad en dos columnas */}
                <div className="form-row-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="controlNumber">
                      <Hash size={15} style={{ color: 'var(--accent-cyan)' }} />
                      <span>No. de Control *</span>
                    </label>
                    <input
                      id="controlNumber"
                      name="controlNumber"
                      type="text"
                      required
                      placeholder="Ej. 21090456"
                      className="form-input"
                      value={formData.controlNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="age">
                      <span>Edad *</span>
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="16"
                      max="80"
                      required
                      placeholder="Ej. 21"
                      className="form-input"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 3. Semestre (1° a 9° Semestre) */}
                <div className="form-group">
                  <label className="form-label">
                    <GraduationCap size={15} style={{ color: 'var(--accent-emerald)' }} />
                    <span>Semestre (Selecciona del 1° al 9°) *</span>
                  </label>
                  <div className="semester-selector-grid">
                    {SEMESTERS.map(sem => (
                      <button
                        type="button"
                        key={sem}
                        className={`semester-pill ${formData.semester === sem ? 'selected' : ''}`}
                        onClick={() => handleSemesterSelect(sem)}
                      >
                        {sem}° <span className="semester-word">Semestre</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Grupo */}
                <div className="form-row-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="group">
                      <Layers size={15} style={{ color: 'var(--accent-purple)' }} />
                      <span>Grupo *</span>
                    </label>
                    <select
                      id="group"
                      name="group"
                      className="form-select"
                      value={formData.group}
                      onChange={handleChange}
                    >
                      {GROUPS.map(grp => (
                        <option key={grp} value={grp}>Grupo {grp}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">
                      <Phone size={15} style={{ color: 'var(--accent-cyan)' }} />
                      <span>Teléfono / WhatsApp *</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="Ej. 55 1234 5678"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 5. Correo Institucional / Personal */}
                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    <Mail size={15} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Correo Electrónico</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="alumno@instituto.edu.mx"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* 6. Observaciones / Comentarios adicionales */}
                <div className="form-group">
                  <label className="form-label" htmlFor="notes">
                    <FileText size={15} style={{ color: 'var(--text-muted)' }} />
                    <span>Comentarios o Necesidad Médica (Opcional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="2"
                    placeholder="Ej. Alergias, vegetarianismo, temas de interés en la visita..."
                    className="form-textarea"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                {/* Botón de Enviar */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.75rem', padding: '0.9rem' }}
                >
                  <Send size={18} />
                  <span>{isSubmitting ? 'Guardando registro...' : 'Confirmar Mi Registro de Interés'}</span>
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '0.8rem' }}>
                  🔒 Tus datos están protegidos y solo se utilizarán para la logística y seguro del viaje escolar.
                </p>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
