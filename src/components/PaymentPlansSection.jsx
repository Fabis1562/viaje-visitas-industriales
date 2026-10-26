import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Copy, 
  Check, 
  Lock, 
  ShieldCheck, 
  Calendar, 
  Send, 
  DollarSign, 
  Clock, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const PaymentPlansSection = ({ trip }) => {
  const payment = trip?.paymentInfo || {
    totalCost: 3500,
    depositAmount: 500,
    clabeReleaseDate: '2026-11-15T00:00:00',
    forceClabeVisible: false,
    bankName: 'BBVA México',
    accountHolder: 'Comité Organizador del Viaje de Prácticas',
    clabe: '012180015623489012',
    accountNumber: '1562348901',
    conceptFormat: 'No. Control + Primer Nombre',
    whatsappReceipt: '7771234567',
    notes: 'Una vez realizada tu transferencia o pago, envía tu comprobante con tu nombre completo y número de control.',
    installments: [
      {
        id: 1,
        title: 'Anticipo Inicial (Apartado de Lugar)',
        amount: 500,
        deadline: '2026-11-20',
        desc: 'Garantiza tu asiento exclusivo en el autobús y registro en lista oficial.'
      },
      {
        id: 2,
        title: 'Primer Abono (Hospedaje & Reservaciones)',
        amount: 1500,
        deadline: '2026-12-15',
        desc: 'Bloqueo de habitaciones en el Hotel Sede Ejecutivo 4 Estrellas.'
      },
      {
        id: 3,
        title: 'Liquidación Final (Accesos Industriales)',
        amount: 1500,
        deadline: '2027-02-28',
        desc: 'Finiquito de accesos a plantas, seguro de viajero y gafete oficial.'
      }
    ]
  };

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClabeAvailable, setIsClabeAvailable] = useState(false);

  // Calcular si ya llegó la fecha de liberación de la CLABE (15 de Noviembre)
  useEffect(() => {
    const targetDate = new Date(payment.clabeReleaseDate || '2026-11-15T00:00:00');

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (payment.forceClabeVisible || diff <= 0) {
        setIsClabeAvailable(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsClabeAvailable(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [payment.clabeReleaseDate, payment.forceClabeVisible]);

  const handleCopyClabe = () => {
    if (!isClabeAvailable) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(payment.clabe || '012180015623489012');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const installments = payment.installments || [];

  return (
    <section id="pagos" className="section" style={{ position: 'relative' }}>
      <div className="container">
        
        {/* Cabecera de la Sección */}
        <div className="section-header">
          <div className="section-tag">
            <span className="badge badge-emerald">
              <DollarSign size={14} /> Transparencia y Facilidades
            </span>
          </div>
          <h2 className="section-title">
            Planes de Pago, Abonos y Cuenta Oficial
          </h2>
          <p className="section-desc">
            Organizamos un plan de abonos cómodos y accesibles para que ningún alumno interesado se quede fuera del viaje de prácticas industriales.
          </p>
        </div>

        {/* Tarjetas de Resumen Financiero */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            <div className="icon-bubble icon-bubble-cyan">
              <DollarSign size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Costo Total del Viaje
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                ${(payment.totalCost || 3500).toLocaleString('es-MX')} <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>MXN</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Incluye autobús, hotel 4★, accesos y seguro
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            <div className="icon-bubble icon-bubble-amber">
              <Clock size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Anticipo para Apartar
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                ${(payment.depositAmount || 500).toLocaleString('es-MX')} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>MXN</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Asegura tu lugar antes de que se agote el cupo
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            <div className="icon-bubble icon-bubble-purple">
              <CreditCard size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Modalidad de Pago
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                {installments.length} Abonos Cómodos
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Transferencia SPEI o Efectivo con comité
              </div>
            </div>
          </div>

        </div>

        {/* CONTENEDOR PRINCIPAL: CRONOGRAMA DE ABONOS + TARJETA CLABE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          
          {/* COLUMNA 1: CRONOGRAMA DE PAGOS */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div className="icon-bubble icon-bubble-cyan" style={{ width: '42px', height: '42px' }}>
                <Calendar size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
                  Cronograma de Abonos
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Fechas límite programadas para el ciclo escolar
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              {installments.map((inst, index) => (
                <div 
                  key={inst.id || index}
                  style={{
                    background: index === 0 ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: index === 0 ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className={`badge ${index === 0 ? 'badge-cyan' : 'badge-purple'}`} style={{ fontSize: '0.75rem' }}>
                        Paso {index + 1}
                      </span>
                      <strong style={{ fontSize: '1rem', color: '#fff' }}>
                        {inst.title}
                      </strong>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: index === 0 ? 'var(--accent-cyan)' : 'var(--accent-emerald)', whiteSpace: 'nowrap' }}>
                      ${Number(inst.amount).toLocaleString('es-MX')} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MXN</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.65rem' }}>
                    {inst.desc}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <Clock size={14} style={{ color: index === 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }} />
                    <span>Fecha límite recomendada: <strong>{inst.deadline}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <HelpCircle size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
              <span>¿Necesitas un plan de pagos personalizado con otros plazos? Acércate con los organizadores del viaje.</span>
            </div>
          </div>

          {/* COLUMNA 2: CUENTA CLABE CON BLOQUEO HASTA EL 15 DE NOVIEMBRE */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className={`icon-bubble ${isClabeAvailable ? 'icon-bubble-emerald' : 'icon-bubble-amber'}`} style={{ width: '42px', height: '42px' }}>
                  {isClabeAvailable ? <CreditCard size={20} /> : <Lock size={20} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
                    Datos Bancarios Oficiales
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Para transferencias electrónicas SPEI
                  </span>
                </div>
              </div>

              <span className={`badge ${isClabeAvailable ? 'badge-emerald' : 'badge-amber'}`}>
                {isClabeAvailable ? '🟢 Cuenta Activa' : '🔒 Apertura: 15 de Noviembre'}
              </span>
            </div>

            {/* CASO A: ANTES DEL 15 DE NOVIEMBRE (BLOQUEO DE SEGURIDAD CON CUENTA REGRESIVA) */}
            {!isClabeAvailable ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, justifyContent: 'center' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--accent-amber)' }}>
                    <ShieldCheck size={30} />
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                    Cuenta CLABE protegida hasta el 15 de Noviembre
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                    Por seguridad y transparencia del contingente estudiantil, la cuenta bancaria oficial para recibir transferencias SPEI se habilitará el <strong>15 de noviembre de 2026</strong>.
                  </p>

                  {/* Reloj de Cuenta Regresiva para la CLABE */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', maxWidth: '340px', margin: '0 auto' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.6rem 0.3rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{timeLeft.days}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Días</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.6rem 0.3rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{String(timeLeft.hours).padStart(2, '0')}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Horas</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.6rem 0.3rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mins</div>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.6rem 0.3rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{String(timeLeft.seconds).padStart(2, '0')}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Segs</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: '1.25rem', opacity: 0.65 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Banco Receptor:</div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginTop: '0.1rem' }}>{payment.bankName || 'BBVA México'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem', textTransform: 'uppercase' }}>Cuenta CLABE:</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px', color: '#94a3b8', marginTop: '0.2rem' }}>
                    •••• •••• •••• 9012
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <AlertCircle size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
                  <span>Ningún organizador te pedirá dinero a cuentas particulares antes del 15 de noviembre.</span>
                </div>
              </div>
            ) : (
              /* CASO B: A PARTIR DEL 15 DE NOVIEMBRE (CLABE VISIBLE Y COPIABLE CON UN CLIC) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Banco Destino:
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                    {payment.bankName || 'BBVA México'}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.85rem' }}>
                    Beneficiario / Titular:
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginTop: '0.2rem' }}>
                    {payment.accountHolder || 'Comité Organizador del Viaje de Prácticas'}
                  </div>
                </div>

                {/* Caja de la CLABE con botón Copiar */}
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1.5px solid var(--accent-cyan)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Cuenta CLABE Interbancaria (SPEI):
                    </span>
                    {copied && (
                      <span className="badge badge-emerald" style={{ fontSize: '0.72rem', animation: 'fadeIn 0.2s' }}>
                        ¡Copiada con éxito!
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '2px', wordBreak: 'break-all' }}>
                      {payment.clabe || '012180015623489012'}
                    </div>

                    <button 
                      onClick={handleCopyClabe}
                      className="btn btn-primary"
                      style={{ padding: '0.65rem 1.15rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      <span>{copied ? '¡Copiado!' : 'Copiar CLABE'}</span>
                    </button>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.65rem' }}>
                    Concepto de pago recomendado: <strong style={{ color: '#fff' }}>{payment.conceptFormat || 'No. Control + Nombre'}</strong>
                  </div>
                </div>

                {/* Pasos para validar el pago */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                  <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Send size={15} style={{ color: 'var(--accent-emerald)' }} />
                    ¿Cómo validar tu apartado tras pagar?
                  </h5>
                  <ol style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', margin: 0 }}>
                    <li>Realiza tu transferencia por el monto del anticipo (${payment.depositAmount || 500} MXN).</li>
                    <li>Toma captura clara o descarga el comprobante en PDF de tu app bancaria.</li>
                    <li>Envía el comprobante al WhatsApp del comité con tu <strong>Nombre Completo y No. de Control</strong>.</li>
                    <li>El comité actualizará tu estatus a <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Anticipo Pagado</span>.</li>
                  </ol>
                </div>

              </div>
            )}

            {/* Botón hacia el formulario de registro */}
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a 
                href="#registro" 
                className="btn btn-secondary" 
                style={{ width: '100%', textAlign: 'center', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>Primero llena tu registro de alumno</span>
                <ArrowRight size={15} />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
