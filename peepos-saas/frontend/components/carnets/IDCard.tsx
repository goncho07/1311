import React from 'react';
import QRCode from 'react-qr-code';
import { Student } from '@/types';
import { getLevel } from '@/utils/helpers';

interface IDCardRenderProps {
    student: Student;
    serialNumber: number;
    totalStudents: number;
    settings: any; // from useSettingsStore
}

const pad = (num: number, total: number) => {
    const totalDigits = Math.max(3, String(total).length);
    let s = String(num);
    while (s.length < totalDigits) {
        s = "0" + s;
    }
    return s;
};

const getGradientString = (level: string, settings: any) => {
    const levelLower = level.toLowerCase();
    let colors;
    if (levelLower.includes('inicial')) colors = settings.carnetHeaderGradientInicial;
    else if (levelLower.includes('primaria')) colors = settings.carnetHeaderGradientPrimaria;
    else if (levelLower.includes('secundaria')) colors = settings.carnetHeaderGradientSecundaria;
    else colors = settings.carnetHeaderGradientPrimaria; // Default
    
    return `linear-gradient(90deg, ${colors.from} 0%, ${colors.to} 100%)`;
};


const CardHeader: React.FC<{ student: Student, series: string, settings: any }> = ({ student, series, settings }) => {
    const level = getLevel(student);
    const gradient = getGradientString(level, settings);
    return (
        <div style={{ background: gradient, height: '168px', padding: '14px 24px', color: 'white', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
            <div style={{ display: 'grid', gridAutoFlow: 'column', alignItems: 'center', justifyContent: 'start', columnGap: '18px' }}>
                <img style={{ width: '112px', aspectRatio: '1/1', objectFit: 'contain' }} src={settings.sidebarLogoUrl} alt="Escudo" />
                <div style={{ display: 'grid', rowGap: '4px', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                    <div style={{ fontSize: '22px' }}>Institución Educativa N° 6049</div>
                    <div style={{ fontSize: '42px', fontWeight: 'bold' }}>“RICARDO PALMA”</div>
                    <div style={{ fontSize: '18px' }}>INICIAL - PRIMARIA - SECUNDARIA</div>
                    <div style={{ fontSize: '18px' }}>UGEL 07 - Surquillo</div>
                </div>
            </div>
            <div style={{ display: 'grid', justifyItems: 'end', alignItems: 'center', textAlign: 'right' }}>
                <div style={{ fontSize: '104px', lineHeight: 0.85, fontWeight: 'bold' }}>2025</div>
                <div style={{ fontSize: '44px', marginTop: '4px', fontWeight: 'bold' }}>{level.toUpperCase()}</div>
                <div style={{ fontSize: '22px', marginTop: '2px' }}>{series}</div>
            </div>
        </div>
    );
};

const StudentFields: React.FC<{ student: Student }> = ({ student }) => {
    let gradeSectionDisplay = '';
    if (student.grade.includes('Grado')) {
        gradeSectionDisplay = `${student.grade.charAt(0)}° ${student.section}`;
    } else if (student.grade.includes('Año')) {
        gradeSectionDisplay = `${student.grade.charAt(0)}° ${student.section}`;
    } else {
        gradeSectionDisplay = student.grade; // e.g., "3 AÑOS"
    }

    const fieldStyle = {
        color: '#0f172a',
        textTransform: 'uppercase' as 'uppercase',
        letterSpacing: '0.5px',
        lineHeight: 1.15,
        display: 'grid',
        rowGap: '8px'
    };
    const labelStyle = { opacity: 0.92, fontSize: '34px' };
    const valueStyle = { fontSize: '46px', fontWeight: 'bold' };

    return (
        <div style={fieldStyle}>
            <div>
                <span style={labelStyle}>Nombres: </span>
                <span style={valueStyle}>{student.names}</span>
            </div>
            <div>
                <span style={labelStyle}>Apellidos: </span>
                <span style={valueStyle}>{`${student.paternalLastName} ${student.maternalLastName}`}</span>
            </div>
            <div>
                <span style={labelStyle}>Grado y Sección: </span>
                <span style={valueStyle}>{gradeSectionDisplay}</span>
            </div>
        </div>
    );
};

export const IDCardFront: React.FC<IDCardRenderProps> = ({ student, serialNumber, totalStudents, settings }) => {
    const series = pad(serialNumber, totalStudents);
    const customStyles = { '--pattern-url': `url(${settings.carnetPatternUrl})` } as React.CSSProperties;

    return (
        <section className="card-render-container font-chau" style={customStyles}>
            <div className="relative z-10 flex flex-col h-full">
                <CardHeader student={student} series={series} settings={settings} />
                <div style={{ height: '10px', background: '#fff', borderRadius: '999px', margin: '6px 20px 16px' }}></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '24px', padding: '0 20px', alignItems: 'center' }}>
                    <img
                        style={{ width: '260px', height: '260px', borderRadius: '50%', background: '#dbeafe', border: '8px solid #fff', boxShadow: '0 1px 0 rgba(0,0,0,.08)', objectFit: 'cover' }}
                        // FIX: Use `photoUrl` which exists on the Student type, instead of `photo`.
                        src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.names}+${student.paternalLastName}&background=dbeafe&color=888&size=260`}
                        alt="Foto del estudiante"
                    />
                    <StudentFields student={student} />
                </div>
            </div>
        </section>
    );
};

export const IDCardBack: React.FC<IDCardRenderProps> = ({ student, serialNumber, totalStudents, settings }) => {
    const series = pad(serialNumber, totalStudents);
    const customStyles = { '--pattern-url': `url(${settings.carnetPatternUrl})` } as React.CSSProperties;

    return (
        <section className="card-render-container font-chau" style={customStyles}>
            <div className="relative z-10 flex flex-col h-full">
                <CardHeader student={student} series={series} settings={settings} />
                <div style={{ height: '10px', background: '#fff', borderRadius: '999px', margin: '6px 20px 16px' }}></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '24px', padding: '0 20px', alignItems: 'center' }}>
                    <div style={{ width: '260px', height: '260px', padding: '14px', background: '#fff', borderRadius: '12px', boxShadow: '0 0 0 4px rgba(0,0,0,.18) inset' }}>
                        <QRCode value={student.documentNumber} size={256} style={{ width: "100%", height: "100%" }} viewBox="0 0 256 256" />
                    </div>
                    <StudentFields student={student} />
                </div>
            </div>
        </section>
    );
};