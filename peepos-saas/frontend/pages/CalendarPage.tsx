import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns/format';
import { addMonths } from 'date-fns/addMonths';
import { isSameDay } from 'date-fns/isSameDay';
import { subMonths } from 'date-fns/subMonths';
import { parseISO } from 'date-fns/parseISO';
import { startOfToday } from 'date-fns/startOfToday';
import es from 'date-fns/locale/es';
import PageHeader from '@/ui/PageHeader';
import Calendar from '@/ui/Calendar';
import Button from '@/ui/Button';
import { CalendarEvent } from '@/types';
import Modal from '@/ui/Modal';
import Input from '@/ui/Input';
import Select from '@/ui/Select';
import { eventCategoryColors } from '@/data/constants';
import { useDataStore } from '@/store/dataStore';


const AddEventModal: React.FC<{ isOpen: boolean, onClose: () => void, onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void, selectedDate: Date }> = ({ isOpen, onClose, onAddEvent, selectedDate }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<CalendarEvent['category']>('Actividad');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;
        onAddEvent({ title, category, date: format(selectedDate, 'yyyy-MM-dd') });
        setTitle('');
        setCategory('Actividad');
        onClose();
    };

    const footerContent = (
        <div className="flex justify-end gap-2">
            <Button type="button" variant="tonal" onClick={onClose} aria-label="Cancelar creación de evento">Cancelar</Button>
            <Button type="submit" form="add-event-form" variant="filled" aria-label="Guardar nuevo evento">Guardar Evento</Button>
        </div>
    );

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            title={`Añadir Evento para ${format(selectedDate, 'PPP', { locale: es })}`}
            size="md"
            footer={footerContent}
        >
            <form onSubmit={handleSubmit} id="add-event-form" className="space-y-4">
                <Input
                    label="Título"
                    id="title"
                    type="text"
                    aria-label="Título del evento"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <Select
                    label="Categoría"
                    id="category"
                    aria-label="Categoría del evento"
                    value={category}
                    onChange={e => setCategory(e.target.value as CalendarEvent['category'])}
                >
                    <option>Actividad</option><option>Examen</option><option>Reunión</option><option>Feriado</option><option>UGEL</option><option>Cívico</option><option>Gestión</option>
                </Select>
            </form>
        </Modal>
    );
};


const CalendarPage: React.FC = () => {
    const { events, setEvents } = useDataStore();
    const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1));
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    
    const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
        const newEvent = { ...event, id: Date.now().toString() };
        setEvents([...events, newEvent].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    };

    const selectedDayEvents = useMemo(() => {
        return events
            .filter(e => isSameDay(parseISO(e.date), selectedDate))
            .sort((a, b) => a.title.localeCompare(b.title));
    }, [events, selectedDate]);
    
    return (
        <div className="space-y-6">
            <PageHeader
                title="Calendario Académico"
                description="Organice y visualice todos los eventos importantes de la institución."
                icon={CalendarIcon}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-t-2xl border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeft size={20} /></button>
                           <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRight size={20} /></button>
                           <Button variant="tonal" aria-label="Ir al día de hoy" onClick={() => setCurrentDate(new Date())}>Hoy</Button>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">{format(currentDate, 'MMMM yyyy', { locale: es })}</h2>
                        <Button variant="filled" icon={Plus} onClick={() => setIsModalOpen(true)} aria-label="Añadir nuevo evento">Añadir Evento</Button>
                    </div>
                    <Calendar currentDate={currentDate} selectedDate={selectedDate} onSelectDate={setSelectedDate} events={events} />
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg capitalize">Eventos para {format(selectedDate, 'cccc, d \'de\' MMMM', { locale: es })}</h3>
                    <div className="mt-4 space-y-3">
                        {selectedDayEvents.length > 0 ? (
                            selectedDayEvents.map(event => (
                                <div key={event.id} className={`pl-4 border-l-4 ${eventCategoryColors[event.category] || 'border-slate-400'}`}>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{event.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{event.category}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">No hay eventos para esta fecha.</p>
                        )}
                    </div>
                </div>
            </div>

            <AddEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddEvent={handleAddEvent} selectedDate={selectedDate} />
        </div>
    );
};

export default CalendarPage;