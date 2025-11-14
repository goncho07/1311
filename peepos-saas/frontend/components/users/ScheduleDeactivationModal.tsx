import React, { useState } from 'react';
import Button from '@/ui/Button';
import Modal from '@/ui/Modal';
import { ScheduleModalState } from '@/types';
import Input from '@/ui/Input';

interface ScheduleDeactivationModalProps extends ScheduleModalState {
    onClose: () => void;
}

const ScheduleDeactivationModal: React.FC<ScheduleDeactivationModalProps> = ({ isOpen, onClose, onConfirm, users }) => {
    const [date, setDate] = useState('');

    const handleConfirm = () => {
        if(date) {
            onConfirm(date);
            setDate('');
        }
    };
    
    const footerContent = (
      <div className="flex justify-end gap-2">
        <Button variant="tonal" onClick={onClose} aria-label="Cancelar programación">Cancelar</Button>
        <Button variant="warning" onClick={handleConfirm} disabled={!date} aria-label="Programar Baja">Programar Baja</Button>
      </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Programar Baja de Usuario(s)"
            size="md"
            footer={footerContent}
        >
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Seleccione una fecha para desactivar automáticamente la(s) cuenta(s) de: <strong>{users.length > 1 ? `${users.length} usuarios` : (users[0] as any)?.name}</strong>.
            </p>
            <Input
                id="deactivation-date"
                aria-label="Fecha de baja"
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                min={new Date().toISOString().split("T")[0]} 
                className="mt-4"
            />
        </Modal>
    );
};

export default ScheduleDeactivationModal;
