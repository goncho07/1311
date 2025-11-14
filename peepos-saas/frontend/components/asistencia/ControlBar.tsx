import React, { useMemo } from 'react';
import type { Level, TimeRange, PopulationFocus } from '@/types';
import { ChevronDown } from 'lucide-react';
import Button from '@/ui/Button';
// FIX: Correct date-fns imports to use subpaths.
import { format } from 'date-fns/format';
import { endOfWeek } from 'date-fns/endOfWeek';
import { getMonth } from 'date-fns/getMonth';
import { startOfWeek } from 'date-fns/startOfWeek';
import es from 'date-fns/locale/es';

interface ControlBarProps {
    level: Level;
    setLevel: (l: Level) => void;
    grade: string;
    setGrade: (g: string) => void;
    section: string;
    setSection: (s: string) => void;
    timeRange: TimeRange;
    setTimeRange: (t: TimeRange) => void;
    populationFocus: PopulationFocus;
    setPopulationFocus: (p: PopulationFocus) => void;
    gradesAndSections: any;
}

const SegmentedButton: React.FC<{
    options: { id: string; label: string }[];
    selected: string;
    onSelect: (value: string) => void;
    label: string;
}> = ({ options, selected, onSelect, label }) => (
    <div role="group" aria-label={label} className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-700/60 rounded-[var(--radius-md)]">
        {options.map(opt => (
            <Button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                aria-pressed={selected === opt.id}
                aria-label={opt.label}
                variant="text"
                className={`!px-4 !py-2.5 !rounded-lg !text-base !font-bold !transition-all !duration-200 !h-auto whitespace-nowrap ${
                    selected === opt.id 
                        ? '!bg-white dark:!bg-slate-800 !text-indigo-600 dark:!text-white shadow-sm' 
                        : '!text-slate-600 dark:!text-slate-300 hover:!bg-white/50 dark:hover:!bg-slate-800/50'
                }`}
            >
                {opt.label}
            </Button>
        ))}
    </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <div className="relative">
        <select {...props} className={`appearance-none !h-12 px-4 pr-10 text-base font-bold bg-slate-200/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 rounded-[var(--radius-md)] border-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ''}`} />
        <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
    </div>
);

export const ControlBar: React.FC<ControlBarProps> = ({ level, setLevel, grade, setGrade, section, setSection, timeRange, setTimeRange, populationFocus, setPopulationFocus, gradesAndSections }) => {
    
    const timeRangeOptions = useMemo(() => {
        const now = new Date();
        const startWeek = startOfWeek(now, { weekStartsOn: 1 });
        const endWeek = endOfWeek(now, { weekStartsOn: 1 });

        const getBimestreLabel = () => {
            const currentMonthIndex = getMonth(now);
            // Group months in pairs: [0,1], [2,3], [4,5], [6,7], [8,9], [10,11]
            const bimestreStartMonthIndex = Math.floor(currentMonthIndex / 2) * 2;
            const bimestreEndMonthIndex = bimestreStartMonthIndex + 1;
            const startMonth = format(new Date(now.getFullYear(), bimestreStartMonthIndex), 'MMM', { locale: es });
            const endMonth = format(new Date(now.getFullYear(), bimestreEndMonthIndex), 'MMM', { locale: es });
            return `Bimestre (${startMonth}-${endMonth})`;
        };
        
        return [
            { id: 'Hoy' as TimeRange, label: `Hoy (${format(now, 'd MMM', { locale: es })})` },
            { id: 'Semana' as TimeRange, label: `Semana (${format(startWeek, 'd')} - ${format(endWeek, 'd MMM', { locale: es })})` },
            { id: 'Mes' as TimeRange, label: `Mes (${format(now, 'MMMM', { locale: es })})` },
            { id: 'Bimestre' as TimeRange, label: getBimestreLabel() }
        ];
    }, []);

    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLevel(e.target.value as Level);
        setGrade('all');
        setSection('all');
    };
    
    const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGrade(e.target.value);
        setSection('all');
    };

    const lowerCaseLevel = level.toLowerCase() as keyof typeof gradesAndSections;
    const currentGrades = (level !== 'Todos' && gradesAndSections[lowerCaseLevel]) ? gradesAndSections[lowerCaseLevel] : {};
    const currentSections = (grade !== 'all' && currentGrades) ? (currentGrades as any)[grade] || [] : [];
    
    return (
        <div className="w-full bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-[var(--radius-lg)] p-2 ring-1 ring-black/5 dark:ring-white/10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 animate-pop-in" style={{ animationDelay: '100ms' }}>
            
            <div className="flex items-center gap-2 flex-wrap">
                <SegmentedButton 
                    label="Seleccionar población"
                    options={[{ id: 'Estudiantes', label: 'Estudiantes' }, { id: 'Docentes', label: 'Docentes' }]} 
                    selected={populationFocus} 
                    onSelect={(val) => setPopulationFocus(val as PopulationFocus)}
                />
                 <SegmentedButton 
                    label="Seleccionar período de tiempo"
                    options={timeRangeOptions} 
                    selected={timeRange} 
                    onSelect={(val) => setTimeRange(val as TimeRange)}
                />
            </div>

            <div className="flex items-center gap-2">
                <Select
                    value={level}
                    onChange={handleLevelChange}
                    aria-label="Seleccionar nivel educativo"
                >
                     {(['Todos', 'Inicial', 'Primaria', 'Secundaria'] as Level[]).map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                     ))}
                </Select>
                <Select
                    value={grade}
                    onChange={handleGradeChange}
                    aria-label="Seleccionar grado"
                    disabled={level === 'Todos'}
                >
                    <option value="all">Todos los Grados</option>
                    {Object.keys(currentGrades).map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
                <Select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    aria-label="Seleccionar sección"
                    disabled={grade === 'all' || level === 'Todos'}
                >
                    <option value="all">Todas las Secciones</option>
                    {currentSections.map((s: string) => <option key={s} value={s}>{s}</option>)}
                </Select>
            </div>
        </div>
    );
};