import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateShort } from './helpers';

export const generatePeriodReport = (periodo, registros, estudiante) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text('Control de Prácticas', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // Gray 500
    doc.text('Reporte de Horas por Periodo', 14, 28);

    // --- Info Box ---
    doc.setFillColor(249, 250, 251); // Gray 50
    doc.roundedRect(14, 35, pageWidth - 28, 40, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81); // Gray 700

    // Column 1
    doc.setFont('helvetica', 'bold');
    doc.text('Estudiante:', 20, 45);
    doc.text('Universidad:', 20, 52);

    doc.setFont('helvetica', 'normal');
    doc.text(`${estudiante.nombres || 'Estudiante'} ${estudiante.apellidos || ''}`, 50, 45);
    doc.text(estudiante.universidad || 'No registrada', 50, 52);

    // Column 2
    doc.setFont('helvetica', 'bold');
    doc.text('Periodo:', 110, 45);
    doc.text('Fechas:', 110, 52);
    doc.text('Estado:', 110, 59);

    doc.setFont('helvetica', 'normal');
    const fechas = `${formatDateShort(periodo.fecha_inicio)} - ${formatDateShort(periodo.fecha_fin)}`;
    doc.text(periodo.nombre || 'Sin nombre', 135, 45);
    doc.text(fechas, 135, 52);

    const estado = periodo.activo ? 'Activo' : 'Finalizado';
    doc.setTextColor(periodo.activo ? 22 : 75, periodo.activo ? 163 : 85, periodo.activo ? 74 : 99); // Green or Gray
    doc.text(estado, 135, 59);

    // --- Totals ---
    doc.setTextColor(55, 65, 81); // Reset
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Horas Acumuladas: ${periodo.horas_acumuladas || 0} / ${periodo.horas_totales_requeridas || '?'}`, 20, 68);

    // --- Table ---
    const tableColumn = ["Fecha", "Descripción", "Horas", "Validado"];
    const tableRows = [];

    // Sort by date descending
    const sortedRegistros = [...registros].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    sortedRegistros.forEach(registro => {
        const registroData = [
            formatDateShort(registro.fecha),
            registro.descripcion || 'Sin descripción',
            `${registro.horas}h`,
            'Sí' // Asumimos validado si aparece en el reporte, o podríamos ajustar según estado real
        ];
        tableRows.push(registroData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        theme: 'striped',
        headStyles: {
            fillColor: [99, 102, 241], // Indigo 500
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' }
        }
    });

    // --- Footer ---
    const finalY = doc.lastAutoTable.finalY || 85;

    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // Gray 400
    doc.text(`Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 14, finalY + 10);
    doc.text('Control de Prácticas - Documento informativo', pageWidth - 14, finalY + 10, { align: 'right' });

    // Save
    doc.save(`Reporte_Periodo_${periodo.nombre.replace(/\s+/g, '_')}.pdf`);
};
