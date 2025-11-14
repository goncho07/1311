import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  QrCode,
  TrendingUp,
  AlertTriangle,
  FileText,
  Expand,
  ChevronLeft,
  ChevronRight,
  Plus,
  Circle,
  CircleDot,
  CheckCircle2,
  Building,
  Flag,
  Home,
} from 'lucide-react';
import KpiCard from '@/ui/KpiCard';
import { useDataStore } from '@/store/dataStore';
// FIX: Correct date-fns imports to use subpaths.
import { format } from 'date-fns/format';
import { isSameMonth } from 'date-fns/isSameMonth';
import { isToday } from 'date-fns/isToday';
import { isSameDay } from 'date-fns/isSameDay';
import { addMonths } from 'date-fns/addMonths';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { endOfMonth } from 'date-fns/endOfMonth';
import { endOfWeek } from 'date-fns/endOfWeek';
import { startOfMonth } from 'date-fns/startOfMonth';
import { startOfWeek } from 'date-fns/startOfWeek';
import { parseISO } from 'date-fns/parseISO';
import { startOfToday } from 'date-fns/startOfToday';
import { subMonths } from 'date-fns/subMonths';
import es from 'date-fns/locale/es';
import FullCalendar from '@/ui/Calendar';
import { CalendarEvent, Task } from '@/types';
import Button from '@/ui/Button';
import Modal from '@/ui/Modal';
import IconButton from '@/ui/IconButton';
import Card from '@/ui/Card';
import { useTaskStore } from '@/store/taskStore';
import Input from '@/ui/Input';
import Select from '@/ui/Select';
import Textarea from '@/ui/Textarea';
import Skeleton from '@/ui/Skeleton';
import * as api from '@/services/api';

const eventCategoryColors: Record<string, string> = {
  Examen: 'bg-amber-500',
  Feriado: 'bg-rose-500',
  Reunión: 'bg-indigo-500',
  Actividad: 'bg-emerald-500',
  UGEL: 'bg-violet-500',
  Cívico: 'bg-sky-500',
  Gestión: 'bg-slate-500',
};

const fullEventCategoryColors: Record<string, string> = {
  Examen: 'border-amber-500',
  Feriado: 'border-rose-500',
  Reunión: 'border-indigo-500',
  Actividad: 'border-emerald-500',
  UGEL: 'border-violet-500',
  Cívico: 'border-sky-500',
  Gestión: 'border-slate-500',
};

const KpiSkeleton: React.FC = () => (
    <div className="p-5 rounded-[var(--radius-lg)] bg-slate-200 dark:bg-slate-700 animate-pulse flex flex-col h-40 justify-between">
        <Skeleton className="h-5 w-32 bg-slate-300 dark:bg-slate-600" />
        <Skeleton className="h-14 w-24 bg-slate-300 dark:bg-slate-600" />
    </div>
);

const AddEventModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  selectedDate: Date;
}> = ({ isOpen, onClose, onAddEvent, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CalendarEvent['category']>('Actividad');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }
    onAddEvent({
      title,
      description,
      category,
      date: format(selectedDate, 'yyyy-MM-dd'),
    });
    // Reset form and close
    setTitle('');
    setDescription('');
    setCategory('Actividad');
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="tonal" onClick={onClose} aria-label="Cancelar">
        Cancelar
      </Button>
      <Button type="submit" form="add-event-form" variant="filled" aria-label="Añadir evento">
        Añadir Evento
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Añadir Evento para ${format(selectedDate, "d 'de' MMMM", { locale: es })}`} footer={footer}>
      <form id="add-event-form" onSubmit={handleSubmit} className="space-y-4">
        <Input label="Título del Evento" id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} required aria-label="Título del Evento" />
        <Select label="Categoría" id="event-category" value={category} onChange={(e) => setCategory(e.target.value as CalendarEvent['category'])} aria-label="Categoría del evento">
          {Object.keys(eventCategoryColors).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
        <Textarea
          label="Descripción (Opcional)"
          id="event-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          aria-label="Descripción (Opcional)"
        />
      </form>
    </Modal>
  );
};

const CalendarModal: React.FC<{ isOpen: boolean; onClose: () => void; events: CalendarEvent[] }> = ({
  isOpen,
  onClose,
  events: initialEvents,
}) => {
  type CalendarViewMode = 'mes' | 'semana' | 'año';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('mes');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const eventRefs = useRef(new Map<string, HTMLDivElement | null>());

  const handleAddEvent = (newEventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...newEventData,
      id: `evt-${Date.now()}`,
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  const { institutionalEvents, civicEvents } = useMemo(() => {
    const institutional: CalendarEvent[] = [];
    const civic: CalendarEvent[] = [];
    const monthEvents = events
      .filter((e) => isSameMonth(parseISO(e.date), currentDate))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    monthEvents.forEach((event) => {
      if (['Examen', 'Reunión', 'Actividad', 'Gestión', 'UGEL'].includes(event.category)) {
        institutional.push(event);
      } else {
        civic.push(event);
      }
    });
    return { institutionalEvents: institutional, civicEvents: civic };
  }, [events, currentDate]);

  useEffect(() => {
    if (!isOpen) return;

    const allMonthEvents = [...institutionalEvents, ...civicEvents];
    const firstSelectedEvent = allMonthEvents.find((e) => isSameDay(parseISO(e.date), selectedDate));

    if (firstSelectedEvent) {
      const node = eventRefs.current.get(firstSelectedEvent.id);
      if (node) {
        node.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [selectedDate, isOpen, institutionalEvents, civicEvents]);

  const EventListSection: React.FC<{ title: string; icon: React.ElementType; events: CalendarEvent[] }> = ({
    title,
    icon: Icon,
    events,
  }) => (
    <div className="mb-8">
      <h4 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3 mb-4">
        <Icon size={24} /> {title}
      </h4>
      <div className="space-y-3">
        {events.map((event) => {
          const isSelected = isSameDay(parseISO(event.date), selectedDate);
          return (
            <div
              key={event.id}
              ref={(el) => {
                if (el) eventRefs.current.set(event.id, el);
                else eventRefs.current.delete(event.id);
              }}
              className={`p-4 border-l-8 rounded-r-lg transition-all duration-300 ${
                fullEventCategoryColors[event.category] || 'border-slate-400'
              } ${
                isSelected
                  ? 'bg-indigo-100 dark:bg-indigo-900/60 ring-2 ring-indigo-500 dark:ring-indigo-400'
                  : 'bg-slate-50 dark:bg-slate-700/50'
              }`}
            >
              <div>
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-base capitalize">
                  {format(parseISO(event.date), 'EEEE dd', { locale: es })}
                </p>
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{event.title}</p>
              </div>
              {event.description && <p className="text-base text-slate-500 dark:text-slate-400 mt-2">{event.description}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Calendario Institucional Completo" size="7xl">
      <div className="flex gap-4 overflow-hidden" style={{ height: 'calc(90vh - 150px)' }}>
        <div className="w-2/3 flex flex-col">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-t-[var(--radius-lg)] border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <IconButton
                icon={ChevronLeft}
                aria-label="Mes anterior"
                variant="text"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              />
              <IconButton
                icon={ChevronRight}
                aria-label="Mes siguiente"
                variant="text"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              />
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 ml-2 capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="tonal" aria-label="Ir al día de hoy" onClick={() => setCurrentDate(new Date())}>
                Hoy
              </Button>
              <div className="p-1 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center">
                  <Button variant={viewMode === 'semana' ? 'filled' : 'text'} onClick={() => setViewMode('semana')} className="!h-8 !px-3 !text-sm !font-semibold !rounded-md" aria-label="Vista semanal">Semana</Button>
                  <Button variant={viewMode === 'mes' ? 'filled' : 'text'} onClick={() => setViewMode('mes')} className="!h-8 !px-3 !text-sm !font-semibold !rounded-md" aria-label="Vista mensual">Mes</Button>
                  <Button variant={viewMode === 'año' ? 'filled' : 'text'} onClick={() => setViewMode('año')} className="!h-8 !px-3 !text-sm !font-semibold !rounded-md" aria-label="Vista anual">Año</Button>
              </div>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            <FullCalendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              events={events}
              viewMode={viewMode}
            />
          </div>
        </div>
        <div className="w-1/3 bg-white dark:bg-slate-800 p-4 rounded-[var(--radius-lg)] shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex flex-col">
          <h3 className="font-bold text-2xl text-slate-800 dark:text-slate-100 shrink-0 mb-4 capitalize">
            Eventos de {format(currentDate, 'MMMM', { locale: es })}
          </h3>
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
            {institutionalEvents.length === 0 && civicEvents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-base text-slate-500 dark:text-slate-400">No hay eventos programados para este mes.</p>
              </div>
            ) : (
              <>
                {institutionalEvents.length > 0 && (
                  <EventListSection title="Eventos Institucionales" icon={Building} events={institutionalEvents} />
                )}
                {civicEvents.length > 0 && (
                  <EventListSection title="Calendario Cívico y Feriados" icon={Flag} events={civicEvents} />
                )}
              </>
            )}
          </div>
          <Button
            variant="filled"
            aria-label="Añadir nuevo evento al calendario"
            icon={Plus}
            onClick={() => setIsAddEventModalOpen(true)}
            className="w-full !justify-center mt-4 shrink-0 !text-lg !py-3"
          >
            Añadir Evento
          </Button>
        </div>
      </div>
      <AddEventModal isOpen={isAddEventModalOpen} onClose={() => setIsAddEventModalOpen(false)} onAddEvent={handleAddEvent} selectedDate={selectedDate} />
    </Modal>
  );
};

const DashboardCalendar = () => {
  const allEvents = useDataStore((state) => state.events);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventPage, setEventPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const eventPillColors: Record<string, string> = {
    Examen: 'bg-amber-600 text-white',
    Feriado: 'bg-rose-600 text-white',
    Reunión: 'bg-indigo-500 text-white',
    Actividad: 'bg-emerald-600 text-white',
    UGEL: 'bg-violet-600 text-white',
    Cívico: 'bg-sky-600 text-white',
    Gestión: 'bg-slate-600 text-white',
  };

  const monthStart = startOfMonth(currentMonth);
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
  });

  const monthEvents = useMemo(() => {
    return allEvents
      .filter((e) => isSameMonth(parseISO(e.date), currentMonth))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [currentMonth, allEvents]);

  useEffect(() => {
    setEventPage(1);
  }, [currentMonth]);

  const totalEventPages = Math.ceil(monthEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = monthEvents.slice(
    (eventPage - 1) * ITEMS_PER_PAGE,
    eventPage * ITEMS_PER_PAGE
  );

  const eventsByDay = useMemo(() => {
    const eventMap = new Map<string, CalendarEvent[]>();
    allEvents.forEach((event) => {
      const dayKey = format(parseISO(event.date), 'yyyy-MM-dd');
      if (!eventMap.has(dayKey)) {
        eventMap.set(dayKey, []);
      }
      eventMap.get(dayKey)?.push(event);
    });
    return eventMap;
  }, [allEvents]);

  return (
    <Card className="flex flex-col h-full">
      <header className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-lg text-[var(--color-text-primary)] capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-1">
          <IconButton
            icon={ChevronLeft}
            aria-label="Mes anterior"
            variant="text"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="!w-8 !h-8"
          />
          <IconButton
            icon={ChevronRight}
            aria-label="Mes siguiente"
            variant="text"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="!w-8 !h-8"
          />
          <IconButton
            icon={Expand}
            aria-label="Expandir calendario"
            variant="text"
            onClick={() => setIsModalOpen(true)}
            className="!w-8 !h-8"
          />
        </div>
      </header>

      <div className="grid grid-cols-7 text-center text-xs font-semibold text-[var(--color-text-secondary)] pb-2">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const isCurrent = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isTodaysDate = isToday(day);
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay.get(dayKey) || [];

          return (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`relative flex justify-center items-center h-9 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800 focus-visible:ring-[var(--color-primary)] ${
                isCurrent ? 'text-[var(--color-text-primary)]' : 'text-slate-400 dark:text-slate-500'
              } ${!isSelected && isCurrent ? 'hover:bg-[var(--color-border-light)]' : ''}`}
            >
              <span
                className={`flex items-center justify-center h-7 w-7 rounded-full text-sm ${
                  isSelected ? 'bg-[var(--color-primary)] text-white font-bold' : ''
                } ${isTodaysDate && !isSelected ? 'text-[var(--color-primary)] font-bold' : ''}`}
              >
                {format(day, 'd')}
              </span>
              {dayEvents.length > 0 && <div className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-[var(--color-danger)]"></div>}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border-light)] flex-grow flex flex-col min-h-0">
        <div className="flex items-center justify-between px-1">
            <h3 className="font-semibold text-base text-[var(--color-text-primary)] capitalize">
            Eventos de {format(currentMonth, 'MMMM', { locale: es })}
            </h3>
            {totalEventPages > 1 && (
                <nav aria-label="Navegación de eventos del mes" className="flex items-center gap-1">
                    <IconButton icon={ChevronLeft} aria-label="Página anterior de eventos" variant="text" onClick={() => setEventPage(p => p - 1)} disabled={eventPage === 1} className="!w-7 !h-7"/>
                    <span className="text-xs font-semibold text-slate-500" aria-live="polite">
                        {eventPage} / {totalEventPages}
                    </span>
                    <IconButton icon={ChevronRight} aria-label="Página siguiente de eventos" variant="text" onClick={() => setEventPage(p => p + 1)} disabled={eventPage === totalEventPages} className="!w-7 !h-7"/>
                </nav>
            )}
        </div>
        <div className="flex-grow mt-2 -mx-1 min-h-[calc(4*5.5rem)]">
            {paginatedEvents.length > 0 ? (
                <ul role="list" className="space-y-3 px-1">
                {paginatedEvents.map((event) => {
                  const isSelected = isSameDay(parseISO(event.date), selectedDate);
                  const pillColor = eventPillColors[event.category] || eventPillColors.Gestión;

                  return (
                    <li
                      key={event.id}
                      role="listitem"
                      className={`flex items-center gap-4 p-2 rounded-xl transition-colors h-20 ${
                        isSelected ? 'bg-[var(--color-primary-light)]' : ''
                      }`}
                    >
                      <div
                        className={`flex flex-col justify-center items-center w-16 h-16 rounded-xl shrink-0 ${pillColor}`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {format(parseISO(event.date), 'MMM', { locale: es }).replace('.','').toUpperCase()}
                        </span>
                        <span className="text-3xl font-black -mt-1">
                          {format(parseISO(event.date), 'd')}
                        </span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p
                          className={`font-bold text-[var(--color-text-primary)] truncate ${
                            isSelected ? 'text-[var(--color-primary-text)]' : ''
                          }`}
                        >
                          {event.title}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] capitalize truncate">
                          {event.description || event.category}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
                <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-[var(--color-text-secondary)] text-center">No hay eventos este mes.</p>
                </div>
            )}
        </div>
      </div>
      <CalendarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} events={allEvents} />
    </Card>
  );
};

const TaskItem: React.FC<{ task: Task; onToggle: (id: string, status: Task['status']) => void }> = ({ task, onToggle }) => {
  const statusIcons = {
    Completo: <CheckCircle2 size={24} className="text-[var(--color-success)] shrink-0" />,
    'En progreso': <CircleDot size={24} className="text-[var(--color-info)] animate-pulse shrink-0" />,
    Pendiente: <Circle size={24} className="text-[var(--color-warning)] shrink-0" />,
  };

  const priorityColors = {
    high: 'bg-[var(--color-danger)]',
    medium: 'bg-[var(--color-warning)]',
    low: 'bg-slate-400',
  };

  return (
    <li className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-background)]">
      <button onClick={() => onToggle(task.id, task.status)} className="flex items-center gap-3 text-left w-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-md">
        {statusIcons[task.status]}
        <span
          className={`text-base font-semibold group-hover:text-[var(--color-primary)] transition-colors ${
            task.status === 'Completo'
              ? 'line-through text-[var(--color-text-secondary)]'
              : 'text-[var(--color-text-primary)]'
          }`}
        >
          {task.text}
        </span>
      </button>
      <div
        className={`w-2.5 h-2.5 rounded-full shrink-0 ml-3 ${priorityColors[task.priority]}`}
        title={`Prioridad: ${task.priority}`}
      ></div>
    </li>
  );
};

const TasksModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { tasks, addTask, toggleTaskStatus } = useTaskStore();
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        addTask(newTaskText, newTaskPriority);
        setNewTaskText('');
        setNewTaskPriority('medium');
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.status === 'Completo' && b.status !== 'Completo') return 1;
        if (a.status !== 'Completo' && b.status === 'Completo') return -1;
        // FIX: Handle ISO string date format.
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Lista de Tareas Completa" size="xl">
            <div className="flex flex-col" style={{ minHeight: '60vh' }}>
                <form onSubmit={handleAddTask} className="flex items-end gap-2 p-4 mb-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex-grow">
                        <Input
                            label="Nueva Tarea"
                            id="new-task-text"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            placeholder="Ej: Preparar agenda para reunión..."
                            aria-label="Texto de la nueva tarea"
                        />
                    </div>
                    <div>
                        <Select
                            label="Prioridad"
                            id="new-task-priority"
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                            aria-label="Prioridad de la nueva tarea"
                        >
                            <option value="low">Baja</option>
                            <option value="medium">Media</option>
                            <option value="high">Alta</option>
                        </Select>
                    </div>
                    <Button type="submit" icon={Plus} aria-label="Añadir nueva tarea">Añadir</Button>
                </form>
                
                <ul className="space-y-2 overflow-y-auto flex-grow pr-2">
                    {sortedTasks.map((task) => (
                       <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} />
                    ))}
                </ul>
            </div>
        </Modal>
    );
};


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, setTasks, toggleTaskStatus } = useTaskStore();
  const { setEvents } = useDataStore();
  const [kpis, setKpis] = useState({ activeStudents: 0, attendanceToday: 0, dailyIncidents: 0, pendingActs: 0 });
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api.getDashboardData().then((data: any) => {
        setKpis(data.kpis);
        setTasks(data.tasks);
        setEvents(data.events);
        setQuickActions(data.quickActions);
        setIsLoading(false);
    }).catch(error => {
        console.error("Failed to load dashboard data:", error);
        setIsLoading(false);
    });
  }, [setEvents, setTasks]);

  const kpiData = [
    { title: 'Matrícula Activa', value: kpis.activeStudents, icon: Users, gradient: 'bg-gradient-to-br from-blue-400 to-blue-700' },
    { title: 'Asistencia Hoy', value: `${kpis.attendanceToday}%`, icon: TrendingUp, gradient: 'bg-gradient-to-br from-emerald-400 to-teal-600' },
    { title: 'Incidencias Diarias', value: kpis.dailyIncidents, icon: AlertTriangle, gradient: 'bg-gradient-to-br from-red-500 to-rose-700' },
    { title: 'Actas Pendientes', value: kpis.pendingActs, icon: FileText, gradient: 'bg-gradient-to-br from-amber-500 to-orange-700' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <main className="lg:col-span-2 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-xl">
              <Home size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Panel de Control del Director</h1>
              <p className="mt-1 text-base text-slate-500 dark:text-slate-400 max-w-4xl">
                Bienvenido, aquí tiene un resumen del estado de la institución.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {isLoading ? (
            Array.from({length: 4}).map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            kpiData.map((kpi, index) => (
              <motion.div key={index} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <KpiCard
                  title={kpi.title}
                  value={kpi.value}
                  icon={kpi.icon}
                  gradient={kpi.gradient}
                  className="lg:col-span-1"
                />
              </motion.div>
            ))
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
        >
          <Card>
            <h2 className="font-bold text-xl text-[var(--color-text-primary)] mb-4">Rendimiento por grado</h2>
            <div className="text-[var(--color-text-secondary)]">Próximamente</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        >
            <Card>
                <h2 className="font-bold text-xl text-[var(--color-text-primary)] mb-4">Acciones Frecuentes</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                    <button
                        key={action.path}
                        onClick={() => navigate(action.path)}
                        className="flex flex-col items-center justify-center text-center p-3 bg-[var(--color-background)] hover:bg-[var(--color-primary-light)] rounded-[var(--radius-md)] transition-all group"
                    >
                        <div className="p-3 bg-white dark:bg-slate-700 rounded-[var(--radius-md)] shadow-sm mb-2 group-hover:text-[var(--color-primary)]">
                             <action.icon size={32} />
                        </div>
                        <span className="font-bold text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary-text)]">{action.text}</span>
                    </button>
                ))}
                </div>
            </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
        >
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-xl text-[var(--color-text-primary)]">Lista de Tareas</h2>
                    <Button variant="text" onClick={() => setIsTasksModalOpen(true)} aria-label="Ver todas las tareas" className="!text-sm !h-auto !py-1">Ver todas</Button>
                </div>
                {isLoading ? <Skeleton className="h-24 w-full" /> : (
                    <ul className="space-y-2">
                        {tasks.slice(0, 3).map((task) => (
                        <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} />
                        ))}
                         {tasks.length === 0 && <p className="text-sm text-center py-4 text-slate-500">No hay tareas pendientes.</p>}
                    </ul>
                )}
            </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.35 } }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card>
              <h2 className="font-bold text-xl text-[var(--color-text-primary)] mb-4">Docentes con más carga</h2>
              <div className="text-[var(--color-text-secondary)]">Próximamente</div>
            </Card>
            <Card>
              <h2 className="font-bold text-xl text-[var(--color-text-primary)] mb-4">Estado financiero</h2>
              <div className="text-[var(--color-text-secondary)]">Próximamente</div>
            </Card>
            <Card>
              <h2 className="font-bold text-xl text-[var(--color-text-primary)] mb-4">Alertas recientes</h2>
              <div className="text-[var(--color-text-secondary)]">Próximamente</div>
            </Card>
          </div>
        </motion.div>

      </main>
      <aside className="lg:col-span-1">
        {isLoading ? <Card className="h-full"><Skeleton className="w-full h-full"/></Card> : <DashboardCalendar />}
      </aside>
      <TasksModal isOpen={isTasksModalOpen} onClose={() => setIsTasksModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
