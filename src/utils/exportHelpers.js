export const downloadCSV = (data, filename = 'data.csv') => {
    if (!data || !data.length) {
        console.warn('No data available to export');
        return;
    }

    // Obtener headers del primer objeto
    const headers = Object.keys(data[0]);

    // Convertir data a formato CSV
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Manejar valores que pueden contener comas o comillas
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                // Manejar objetos/arrays convirtiendolos a string
                if (typeof value === 'object' && value !== null) {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    // Crear blob y link de descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    // Crear URL del objeto
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const downloadPDF = (data, filename = 'reporte.pdf', title = 'Reporte') => {
    if (!data || !data.length) {
        console.warn('No data available to export');
        return;
    }

    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    // Fecha de generación
    const date = new Date().toLocaleDateString();
    doc.text(`Generado el: ${date}`, 14, 30);

    // Headers y Data
    const headers = Object.keys(data[0]);
    const rows = data.map(row => Object.values(row));

    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [63, 81, 181] }, // Indigo 500
        styles: { fontSize: 8 },
    });

    doc.save(filename);
};
