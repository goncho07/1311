import React, { useState } from 'react';
import Button from '@/ui/Button';
import Modal from '@/ui/Modal';
import { ConfirmationModalState } from '@/types';
import Textarea from '@/ui/Textarea';

interface ConfirmationModalProps extends ConfirmationModalState {
    onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", confirmClass, withReason = false }) => {
    const [reason, setReason] = useState('');
    
    const handleConfirm = () => {
        onConfirm(reason);
        setReason(''); // Reset reason after confirm
    };

    const footerContent = (
        <div className="flex justify-end gap-2">
            <Button variant="tonal" onClick={onClose} aria-label="Cancelar acción">Cancelar</Button>
            <Button variant="danger" onClick={handleConfirm} aria-label={confirmText}>{confirmText}</Button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="md" footer={footerContent}>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{message}</p>
            {withReason && (
                <Textarea
                    id="confirmation-reason"
                    aria-label="Motivo (opcional)"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Motivo (opcional)..."
                    className="mt-4"
                    rows={2}
                />
            )}
        </Modal>
    );
};

export default ConfirmationModal;
