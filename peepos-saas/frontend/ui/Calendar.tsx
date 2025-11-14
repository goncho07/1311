import React from 'react';
// FIX: Correct date-fns imports to use subpaths.
import { format } from 'date-fns/format';
import { isSameMonth } from 'date-fns/isSameMonth';
import { isToday } from 'date-fns/isToday';
import { isSameDay } from 'date-fns/isSameDay';
import { endOfMonth } from 'date-fns/endOfMonth';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { endOfWeek } from 'date-fns/endOfWeek';
import { addDays } from 'date-fns/addDays';
import { getYear } from 'date-fns/getYear';
import { startOfMonth } from 'date-fns/startOfMonth';
import { startOfWeek } from 'date-fns/startOfWeek';
import { parseISO } from 'date-fns/parseISO';
import es from 'date-fns/locale/es';
import { CalendarEvent } from '@/types';

const eventCategoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  Examen: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-800 dark:text-amber-300', dot: 'bg-amber-500' },
  Feriado: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-800 dark:text-rose-300', dot: 'bg-rose-500' },
  Reunión: { bg: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-800 dark:text-indigo-300', dot: 'bg-indigo-500' },
  Actividad: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500' },
  UGEL: { bg: 'bg-violet-100 dark:bg-violet-500/20', text: 'text-violet-800 dark:text-violet-300', dot: 'bg-violet-500' },
  Cívico: { bg: 'bg-sky-100 dark:bg-sky-500/20', text: 'text-sky-800 dark:text-sky-300', dot: 'bg-sky-500' },
  Gestión: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-800 dark:text-slate-300', dot: 'bg-slate-500' },
};

interface CalendarProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events: CalendarEvent[];
  viewMode?: 'mes' | 'semana' | 'año';
}

const Calendar: React.FC<CalendarProps> = ({ currentDate, selectedDate, onSelectDate, events, viewMode = 'mes' }) => {
  const eventsByDay = React.useMemo(() => {
    const eventMap = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const dayKey = format(parseISO(event.date), 'yyyy-MM-dd');
      if (!eventMap.has(dayKey)) {
        eventMap.set(dayKey, []);
      }
      eventMap.get(dayKey)?.push(event);
    });
    return eventMap;
  }, [events]);

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const days = eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
    });
    return (
      <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-sm border-x border-b border-slate-200/80 dark:border-slate-700/80 flex-grow flex flex-col min-h-[700px]">
        <div className="grid grid-cols-7 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
            <div key={day} className="py-3 px-1">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6 flex-grow">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = isSameDay(day, selectedDate);
            const isTodaysDate = isToday(day);
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay.get(dayKey) || [];

            return (
              <button
                key={day.toString()}
                onClick={() => onSelectDate(day)}
                className={`relative flex flex-col border-b border-r border-slate-100 dark:border-slate-700/50 p-2 text-left transition-colors focus:outline-none focus:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500
                                ${
                                  isSelected
                                    ? 'bg-indigo-100 dark:bg-indigo-900/50'
                                    : isCurrentMonth
                                    ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    : 'bg-slate-50/80 dark:bg-slate-800/50'
                                }`}
              >
                <span
                  className={`text-lg font-semibold ${
                    isTodaysDate ? 'text-indigo-600 dark:text-indigo-400' : ''
                  } ${!isCurrentMonth ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}
                >
                  {format(day, 'd')}
                </span>
                <div className="mt-1 w-full space-y-1 text-left overflow-y-auto">
                  {dayEvents.slice(0, 3).map((event) => {
                    const colors = eventCategoryColors[event.category] || eventCategoryColors.Gestión;
                    return (
                      <div
                        key={event.id}
                        title={event.title}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></div>
                        <span className="truncate">{event.title}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1.5">
                      + {dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    return (
        <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-sm border-x border-b border-slate-200/80 dark:border-slate-700/80 flex-grow flex flex-col min-h-[700px]">
            <div className="grid grid-cols-7 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                {days.map(day => 
                    <div key={day.toString()} className="py-3 px-1 capitalize">{format(day, 'EEEE', { locale: es })}</div>
                )}
            </div>
            <div className="grid grid-cols-7 flex-grow">
                {days.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodaysDate = isToday(day);
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayEvents = eventsByDay.get(dayKey) || [];

                    return (
                         <button
                            key={day.toString()}
                            onClick={() => onSelectDate(day)}
                            className={`relative flex flex-col border-b border-r border-slate-100 dark:border-slate-700/50 p-2 text-left transition-colors focus:outline-none focus:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500
                            ${ isSelected ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50' }`}
                          >
                            <span className={`text-lg font-semibold ${ isTodaysDate ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200' }`}>
                                {format(day, 'd')}
                            </span>
                            <div className="mt-1 w-full space-y-1 text-left overflow-y-auto">
                                {dayEvents.slice(0, 10).map((event) => {
                                    const colors = eventCategoryColors[event.category] || eventCategoryColors.Gestión;
                                    return (
                                      <div key={event.id} title={event.title} className={`flex items-center gap-1.5 text-xs font-semibold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></div>
                                        <span className="truncate">{event.title}</span>
                                      </div>
                                    );
                                })}
                                {dayEvents.length > 10 && (
                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1.5">+ {dayEvents.length - 10} más</div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
  }

  const renderYearView = () => {
    const year = getYear(currentDate);
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

    return (
        <div className="bg-white dark:bg-slate-800 rounded-b-2xl p-4 shadow-sm border-x border-b border-slate-200/80 dark:border-slate-700/80 flex-grow min-h-[700px] overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {months.map(month => (
                    <div key={month.toString()} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <h4 className="font-bold text-center text-indigo-600 dark:text-indigo-400 capitalize mb-2">{format(month, 'MMMM', {locale: es})}</h4>
                        <div className="grid grid-cols-7 text-center text-xs text-slate-400">
                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7">
                            {eachDayOfInterval({ start: startOfWeek(month, { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) }).map(day => {
                                const isCurrentMonth = isSameMonth(day, month);
                                const isSelected = isSameDay(day, selectedDate);
                                const hasEvent = eventsByDay.has(format(day, 'yyyy-MM-dd'));

                                return (
                                    <button key={day.toString()} onClick={() => onSelectDate(day)} className={`relative flex justify-center items-center h-7 w-7 rounded-full text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500
                                        ${isSelected ? 'bg-indigo-600 text-white' : ''}
                                        ${!isCurrentMonth ? 'text-slate-300 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
                                    `}>
                                        {format(day, 'd')}
                                        {hasEvent && <div className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`}></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };
  
  switch (viewMode) {
    case 'semana':
      return renderWeekView();
    case 'año':
      return renderYearView();
    case 'mes':
    default:
      return renderMonthView();
  }
};

export default Calendar;