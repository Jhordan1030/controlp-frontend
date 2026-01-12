import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Clock } from 'lucide-react';

// Tiempos en milisegundos
const INACTIVITY_TIME = 1 * 60 * 1000; // 1 minuto de inactividad
const COUNTDOWN_TIME = 2 * 60 * 1000;  // 2 minutos de cuenta regresiva

export default function AutoLogout() {
    const { logout, isAuthenticated } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState(COUNTDOWN_TIME / 1000);

    // Referencias para manejar los timers y estado sin causar re-renders del efecto
    const inactivityTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const showModalRef = useRef(false);

    // Sincronizar ref con estado
    useEffect(() => {
        showModalRef.current = showModal;
    }, [showModal]);

    // Función para cerrar sesión real
    const handleLogout = useCallback(() => {
        setShowModal(false);
        logout();
        window.location.href = '/login';
    }, [logout]);

    // Iniciar cuenta regresiva (Fase 2)
    const startCountdown = useCallback(() => {
        setShowModal(true); // Esto actualizará el ref vía el efecto de arriba
        // showModalRef.current = true; // Actualización optimista
        setTimeLeft(COUNTDOWN_TIME / 1000);

        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        countdownIntervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownIntervalRef.current);
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [handleLogout]);

    // Reseteamos el timer de inactividad (Fase 1)
    const resetInactivityTimer = useCallback(() => {
        if (!isAuthenticated) return;
        // Usamos el ref para no añadir showModal a las dependencias y evitar que el efecto 
        // principal se reinicie (y limpie el intervalo) cuando se abre el modal.
        if (showModalRef.current) return;

        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

        inactivityTimerRef.current = setTimeout(() => {
            startCountdown();
        }, INACTIVITY_TIME);
    }, [isAuthenticated, startCountdown]); // Quitamos showModal de dependencias

    // Manejar la acción de "Seguir conectado"
    const handleStayConnected = () => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setShowModal(false);
        resetInactivityTimer();
    };

    // Efecto para escuchar eventos globales
    useEffect(() => {
        if (!isAuthenticated) return;

        resetInactivityTimer();

        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        const handleActivity = () => {
            resetInactivityTimer();
        };

        events.forEach(event => window.addEventListener(event, handleActivity));

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            // NO limpiamos el intervalo de cuenta regresiva aquí si solo se desmontan los eventos 
            // (aunque en React estricto o re-renders podría pasar).
            // Pero como resetInactivityTimer ya no cambia con showModal, este efecto 
            // NO se debería limpiar al abrir el modal.
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [isAuthenticated, resetInactivityTimer]);

    // Formatear tiempo mm:ss
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!showModal) return null;

    return (
        <Modal
            isOpen={showModal}
            onClose={() => { }}
            title="Inactividad detectada"
            size="md"
        >
            <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-yellow-600 animate-pulse" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ¿Sigues ahí?
                </h3>

                <p className="text-gray-600 mb-6">
                    Tu sesión se cerrará automáticamente en:
                </p>

                <div className="text-4xl font-mono font-bold text-indigo-600 mb-8">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex gap-4 w-full justify-center">
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition"
                    >
                        Cerrar Sesión
                    </button>
                    <button
                        onClick={handleStayConnected}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold transition shadow-lg"
                    >
                        Seguir Conectado
                    </button>
                </div>
            </div>
        </Modal>
    );
}
