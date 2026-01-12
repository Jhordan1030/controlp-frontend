import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Clock } from 'lucide-react';

// Tiempos en milisegundos
const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutos de inactividad
const COUNTDOWN_TIME = 2 * 60 * 1000;  // 2 minutos de cuenta regresiva

export default function AutoLogout() {
    const { logout, isAuthenticated } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState(COUNTDOWN_TIME / 1000);

    // Referencias para manejar los timers sin causar re-renders excesivos
    const inactivityTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    // Función para cerrar sesión real
    const handleLogout = useCallback(() => {
        setShowModal(false);
        logout();
        window.location.href = '/login'; // Opcional: forzar redirección si logout no lo hace
    }, [logout]);

    // Iniciar cuenta regresiva (Fase 2)
    const startCountdown = useCallback(() => {
        setShowModal(true);
        setTimeLeft(COUNTDOWN_TIME / 1000);

        // Limpiamos cualquier intervalo previo por seguridad
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        countdownIntervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownIntervalRef.current);
                    handleLogout(); // Se acabó el tiempo
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [handleLogout]);

    // Reseteamos el timer de inactividad (Fase 1)
    const resetInactivityTimer = useCallback(() => {
        if (!isAuthenticated) return; // No hacer nada si no está logueado
        if (showModal) return; // No resetear si ya salió el modal (requiere acción explícita)

        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

        inactivityTimerRef.current = setTimeout(() => {
            startCountdown();
        }, INACTIVITY_TIME);
    }, [isAuthenticated, showModal, startCountdown]);

    // Manejar la acción de "Seguir conectado"
    const handleStayConnected = () => {
        // Limpiar cuenta regresiva
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        setShowModal(false);
        resetInactivityTimer(); // Reiniciar ciclo normal
    };

    // Efecto para escuchar eventos globales
    useEffect(() => {
        if (!isAuthenticated) return;

        // Iniciar timer nada más montar o loguearse
        resetInactivityTimer();

        // Eventos a escuchar
        const events = ['mousemove', 'keydown', 'click', 'scroll'];

        const handleActivity = () => {
            // Pequeño throttle o simplemente llamar reset
            resetInactivityTimer();
        };

        events.forEach(event => window.addEventListener(event, handleActivity));

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
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
            // Evitamos que se pueda cerrar haciendo clic fuera
            // onClose={() => {}} 
            // Opcional: si quieres permitir cerrar con X, usa handleStayConnected
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
