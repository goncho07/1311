import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PDFDocument, PageSizes } from 'pdf-lib';
import * as hti from 'html-to-image';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Student } from '../types';
import { IDCardFront, IDCardBack } from '@/components/carnets/IDCard';

export const generateFichaMatricula = (student: Student) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Ficha Única de Matrícula - SIAGIE", 14, 22);
    doc.setFontSize(11);
    doc.text("IEE 6049 Ricardo Palma", 14, 28);
    
    (doc as any).autoTable({
        startY: 40,
        head: [['Campo', 'Información del Estudiante']],
        body: [
            ['Apellidos y Nombres', student.fullName],
            ['DNI', student.documentNumber],
            ['Código de Estudiante', student.studentCode],
            ['Fecha de Nacimiento', student.birthDate],
            ['Género', student.gender],
            ['Grado y Sección', `${student.grade} "${student.section}"`],
            ['Condición', student.condition],
            ['Estado de Matrícula', student.enrollmentStatus],
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });
    
    doc.text("Firma del Apoderado:", 14, (doc as any).autoTable.previous.finalY + 20);
    doc.line(14, (doc as any).autoTable.previous.finalY + 30, 80, (doc as any).autoTable.previous.finalY + 30);
    
    doc.text("Firma del Director:", 130, (doc as any).autoTable.previous.finalY + 20);
    doc.line(130, (doc as any).autoTable.previous.finalY + 30, 196, (doc as any).autoTable.previous.finalY + 30);
    
    doc.save(`Ficha_Matricula_${student.documentNumber}.pdf`);
};

export const generateConstanciaMatricula = (student: Student) => {
    const doc = new jsPDF();
    const centerX = doc.internal.pageSize.getWidth() / 2;

    doc.setFontSize(18);
    doc.text("CONSTANCIA DE MATRÍCULA - 2025", centerX, 22, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text("La Dirección de la IEE 6049 Ricardo Palma hace constar que:", 14, 40);
    
    doc.setFont("helvetica", "bold");
    doc.text(student.fullName.toUpperCase(), centerX, 60, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.text(`Identificado(a) con DNI N° ${student.documentNumber}, se encuentra debidamente matriculado(a) en esta institución educativa para el año lectivo 2025, en el:`, 14, 75, { maxWidth: 180 });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${student.grade.toUpperCase()} DE EDUCACIÓN ${student.grade.includes('Año') ? 'SECUNDARIA' : 'PRIMARIA'} - SECCIÓN "${student.section.toUpperCase()}"`, centerX, 95, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Se expide la presente constancia a solicitud del interesado para los fines que estime conveniente.", 14, 115, { maxWidth: 180 });

    doc.text(`Lima, ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}`, 130, 140);

    doc.text("________________________", 130, 170);
    doc.text("Dirección", 145, 175);
    
    doc.save(`Constancia_Matricula_${student.documentNumber}.pdf`);
};

// --- NEW ADVANCED PDF GENERATOR ---

const mmToPt = (mm: number) => mm * 2.83465;
const cmToPt = (cm: number) => cm * 28.3465;

const renderCardToImage = async (
    container: HTMLDivElement,
    component: React.ReactElement
): Promise<string> => {
    const cardContainer = document.createElement('div');
    container.appendChild(cardContainer);
    
    return new Promise((resolve) => {
        const root = ReactDOM.createRoot(cardContainer);
        root.render(component);
        
        setTimeout(async () => {
            const dataUrl = await hti.toPng(cardContainer.firstChild as HTMLElement, {
                width: 1004,
                height: 626,
                quality: 0.95,
                pixelRatio: 1,
                cacheBust: true,
            });
            root.unmount();
            container.removeChild(cardContainer);
            resolve(dataUrl);
        }, 200);
    });
};

export const generateStudentCarnetsPDF = async (students: Student[], settings: any): Promise<void> => {
    if (students.length === 0) return;

    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 50));

    const renderContainer = document.createElement('div');
    renderContainer.style.position = 'fixed';
    renderContainer.style.top = '-9999px';
    renderContainer.style.left = '-9999px';
    document.body.appendChild(renderContainer);

    const pdfDoc = await PDFDocument.create();
    const PAGE_CARDS = 5; // Updated from 10 to 5
    const [pageWidth, pageHeight] = PageSizes.A4;

    const totalPages = Math.ceil(students.length / PAGE_CARDS);
    
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const page = pdfDoc.addPage(PageSizes.A4);
        const pageStudents = students.slice(pageIndex * PAGE_CARDS, (pageIndex + 1) * PAGE_CARDS);

        const margin = mmToPt(10);
        const gutterVertical = cmToPt(0.3);
        const gutterHorizontal = cmToPt(0.3);
        const R = 1004 / 626;

        const W = pageWidth - 2 * margin;
        const H = pageHeight - 2 * margin - ((PAGE_CARDS - 1) * gutterVertical);
        
        let h_fila = H / PAGE_CARDS;
        let w_card = h_fila * R;
        let w_pair = (2 * w_card) + gutterHorizontal;
        
        if (w_pair > W) {
            h_fila = (W - gutterHorizontal) / (2 * R);
            w_card = h_fila * R;
            w_pair = (2 * w_card) + gutterHorizontal;
        }

        for (let i = 0; i < pageStudents.length; i++) {
            const student = pageStudents[i];
            const serialNumber = (pageIndex * PAGE_CARDS) + i + 1;

            const frontComponent = React.createElement(IDCardFront, { student, serialNumber, totalStudents: students.length, settings });
            const backComponent = React.createElement(IDCardBack, { student, serialNumber, totalStudents: students.length, settings });

            const [frontImageBase64, backImageBase64] = await Promise.all([
                renderCardToImage(renderContainer, frontComponent),
                renderCardToImage(renderContainer, backComponent),
            ]);

            const frontImageBytes = Uint8Array.from(atob(frontImageBase64.split(',')[1]), c => c.charCodeAt(0));
            const backImageBytes = Uint8Array.from(atob(backImageBase64.split(',')[1]), c => c.charCodeAt(0));
            
            const frontImage = await pdfDoc.embedPng(frontImageBytes);
            const backImage = await pdfDoc.embedPng(backImageBytes);
            
            const y0 = pageHeight - margin - (i * (h_fila + gutterVertical)) - h_fila;
            const xFront = (pageWidth - w_pair) / 2;
            const xBack = xFront + w_card + gutterHorizontal;
            
            page.drawImage(frontImage, { x: xFront, y: y0, width: w_card, height: h_fila });
            page.drawImage(backImage, { x: xBack, y: y0, width: w_card, height: h_fila });
        }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Carnets_Estudiantes_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    document.body.removeChild(renderContainer);
};