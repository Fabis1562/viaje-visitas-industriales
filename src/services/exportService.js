// Servicio para exportar la lista de alumnos registrados a formato CSV compatible con Microsoft Excel y Google Sheets

export const exportStudentsToCSV = (students, tripTitle = 'Viaje_de_Practicas_2026') => {
  if (!students || students.length === 0) {
    alert('No hay alumnos registrados para exportar.');
    return;
  }

  // Encabezados de las columnas
  const headers = [
    'No.',
    'Nombre Completo',
    'No. de Control',
    'Edad',
    'Semestre',
    'Grupo',
    'Teléfono / WhatsApp',
    'Correo Electrónico',
    'Observaciones / Requisitos',
    'Fecha de Registro'
  ];

  // Formatear filas
  const rows = students.map((s, index) => {
    const formattedDate = s.createdAt 
      ? new Date(s.createdAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
      : 'N/A';

    return [
      index + 1,
      `"${(s.fullName || '').replace(/"/g, '""')}"`,
      `"${(s.controlNumber || '').replace(/"/g, '""')}"`,
      s.age || '',
      `"${s.semester}° Semestre"`,
      `"${s.group || ''}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
      `"${formattedDate}"`
    ].join(',');
  });

  // Agregar el BOM UTF-8 (\uFEFF) para que Excel reconozca tildes y caracteres especiales en español
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const sanitizedTitle = tripTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Lista_Interesados_${sanitizedTitle}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
