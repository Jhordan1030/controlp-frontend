import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Función para obtener el tema según la hora local (Ecuador/Sistema)
    // 6 PM (18:00) a 6 AM (06:00) -> Modo Oscuro
    // 6 AM (06:00) a 6 PM (18:00) -> Modo Claro
    const getScheduledTheme = () => {
        const hour = new Date().getHours();
        // Si es mayor o igual a 18 (6 PM) O menor que 6 (6 AM), es noche
        if (hour >= 18 || hour < 6) {
            return 'dark';
        }
        return 'light';
    };

    const [theme, setTheme] = useState(getScheduledTheme);

    useEffect(() => {
        // Función para verificar y actualizar el tema
        const checkTimeAndSetTheme = () => {
            const scheduledTheme = getScheduledTheme();
            setTheme((prevTheme) => {
                // Solo actualizar si el tema programado es diferente al actual
                // Nota: Esto forzará el cambio según la hora, anulando cambios manuales eventualmente
                if (prevTheme !== scheduledTheme) {
                    return scheduledTheme;
                }
                return prevTheme;
            });
        };

        // Verificar inmediatamente al montar
        checkTimeAndSetTheme();

        // Verificar cada minuto (60000 ms)
        const interval = setInterval(checkTimeAndSetTheme, 60000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        // Remover la clase anterior al cambiar
        root.classList.remove('light', 'dark');
        // Agregar la nueva clase
        root.classList.add(theme);
        // Opcional: Guardar en localStorage aunque la hora tiene prioridad al recargar
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
    }
    return context;
}
