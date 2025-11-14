import React, { useState, useMemo } from 'react';
import Modal from '@/ui/Modal';
import Select from '@/ui/Select';
import Button from '@/ui/Button';
import { useDataStore } from '@/store/dataStore';
import { Download } from 'lucide-react';

interface GenerateCarnetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (filters: { rol: string; level: string; grade: string; section: string }) => void;
}

type Level = 'Inicial' | 'Primaria' | 'Secundaria';

const CustomSelect: React.FC<React.ComponentProps<typeof Select> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-base font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</label>
        <Select {...props} />
    </div>
);


const GenerateCarnetsModal: React.FC<GenerateCarnetsModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const { gradesAndSections } = useDataStore();
  
  const [rol, setRol] = useState('Estudiante');
  const [level, setLevel] = useState<Level>('Primaria');
  const [grade, setGrade] = useState('Todos los Grados');
  const [section, setSection] = useState('Todas las Secciones');

  const isStudentRole = rol === 'Estudiante';

  const gradeOptions = useMemo(() => {
    if (!isStudentRole) return ['Todos los Grados'];
    const levelKey = level.toLowerCase() as keyof typeof gradesAndSections;
    if (gradesAndSections[levelKey]) {
      return ['Todos los Grados', ...Object.keys(gradesAndSections[levelKey])];
    }
    return ['Todos los Grados'];
  }, [level, isStudentRole, gradesAndSections]);

  const sectionOptions = useMemo(() => {
    if (!isStudentRole) return ['Todas las Secciones'];
    const levelKey = level.toLowerCase() as keyof typeof gradesAndSections;
    if (grade !== 'Todos los Grados' && gradesAndSections[levelKey] && (gradesAndSections[levelKey] as any)[grade]) {
        return ['Todas las Secciones', ...(gradesAndSections[levelKey] as any)[grade]];
    }
    return ['Todas las Secciones'];
  }, [level, grade, isStudentRole, gradesAndSections]);

  const handleRolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRol(e.target.value);
      setLevel('Primaria');
      setGrade('Todos los Grados');
      setSection('Todas las Secciones');
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(e.target.value as Level);
    setGrade('Todos los Grados');
    setSection('Todas las Secciones');
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGrade(e.target.value);
    setSection('Todas las Secciones');
  };

  const handleGenerateClick = () => {
    onGenerate({ rol, level, grade, section });
  };
  
  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="tonal" onClick={onClose} aria-label="Cancelar">Cancelar</Button>
      <Button variant="filled" icon={Download} onClick={handleGenerateClick} aria-label="Exportar PDF">Exportar PDF</Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generar Carnets en PDF" footer={footer} size="md">
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Seleccione los filtros para generar los carnets. Se exportará un PDF optimizado para impresión A4 a doble cara.
        </p>
        
        <CustomSelect id="rol-filter" label="Rol" value={rol} onChange={handleRolChange} aria-label="Seleccionar Rol">
            <option value="Estudiante">Estudiante</option>
            <option value="Docente">Docente</option>
        </CustomSelect>

        <CustomSelect id="level-filter" label="Nivel" value={level} onChange={handleLevelChange} disabled={!isStudentRole} aria-label="Seleccionar Nivel">
          <option value="Inicial">Inicial</option>
          <option value="Primaria">Primaria</option>
          <option value="Secundaria">Secundaria</option>
        </CustomSelect>

        <CustomSelect id="grade-filter" label="Grado" value={grade} onChange={handleGradeChange} disabled={!isStudentRole} aria-label="Seleccionar Grado">
          {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
        </CustomSelect>

        <CustomSelect id="section-filter" label="Sección" value={section} onChange={e => setSection(e.target.value)} disabled={!isStudentRole || grade === 'Todos los Grados'} aria-label="Seleccionar Sección">
          {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </CustomSelect>

      </div>
    </Modal>
  );
};

export default GenerateCarnetsModal;