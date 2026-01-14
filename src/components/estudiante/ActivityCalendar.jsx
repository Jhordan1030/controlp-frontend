import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Card from '../common/Card';

export default function ActivityCalendar({ registros = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Helper to get days in month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    // Helper to get first day of month (0-6, Sun-Sat)
    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate); // 0 (Sun) to 6 (Sat)

    // Create array for grid
    const daysArray = [];
    for (let i = 0; i < firstDay; i++) {
        daysArray.push(null); // Empty slots for previous month
    }
    for (let i = 1; i <= daysInMonth; i++) {
        daysArray.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    // Process registros to specific dates map (YYYY-MM-DD -> total hours)
    const activeDatesMap = {};
    registros.forEach(r => {
        const key = r.fecha.split('T')[0];
        if (!activeDatesMap[key]) activeDatesMap[key] = 0;
        activeDatesMap[key] += parseFloat(r.horas);
    });

    const getHoursForDate = (date) => {
        if (!date) return 0;
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset).toISOString().split('T')[0];
        return activeDatesMap[localDate] || 0;
    };

    const getColorClass = (hours) => {
        if (hours === 0) return '';
        if (hours >= 4) return 'bg-emerald-300 text-emerald-900 dark:bg-emerald-700 dark:text-emerald-100 font-bold'; // Pastel Green
        if (hours >= 2) return 'bg-amber-200 text-amber-900 dark:bg-amber-700 dark:text-amber-100 font-bold'; // Pastel Yellow/Amber
        return 'bg-rose-200 text-rose-900 dark:bg-rose-700 dark:text-rose-100 font-bold'; // Pastel Red/Rose
    };

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-indigo-400" />
                    Calendario de Actividad
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-1 hover:bg-gray-100 rounded-full transition text-gray-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-semibold min-w-[100px] text-center">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-1 hover:bg-gray-100 rounded-full transition text-gray-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-2 text-center">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                    <div key={i} className="text-xs font-semibold text-gray-400 dark:text-gray-500 py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {daysArray.map((date, index) => {
                    if (!date) return <div key={`empty-${index}`} className="aspect-square"></div>;

                    const hours = getHoursForDate(date);
                    const colorClass = getColorClass(hours);
                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                        <div key={index} className="aspect-square flex items-center justify-center p-1">
                            <div
                                className={`w-full h-full flex flex-col items-center justify-center rounded-lg text-sm transition-all
                                    ${hours > 0
                                        ? colorClass
                                        : isToday
                                            ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                                            : 'hover:bg-gray-50 text-gray-700'
                                    }
                                `}
                                title={hours > 0 ? `${hours} horas registradas` : ''}
                            >
                                <span>{date.getDate()}</span>
                                {hours > 0 && (
                                    <div className="w-1 h-1 bg-white rounded-full mt-0.5"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-300 border border-emerald-400 dark:border-emerald-600"></div>
                    <span>4+ hrs</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-200 border border-amber-300 dark:border-amber-600"></div>
                    <span>2-4 hrs</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-rose-200 border border-rose-300 dark:border-rose-600"></div>
                    <span>-2 hrs</span>
                </div>
            </div>
        </Card>
    );
}
