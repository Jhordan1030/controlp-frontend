// ==================== src/components/common/Navbar.jsx ====================
import React from 'react';
import { LogOut, User, Menu } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onMenuClick, onProfileClick }) {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 w-full z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onMenuClick}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
                        >
                            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-xl">CP</span>
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                    <span className="hidden xs:inline">Control de Prácticas</span>
                                    <span className="xs:hidden">Control de Prácticas    </span>
                                </h1>
                                <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                                    {user?.tipo === 'administrador' ? 'Panel de Administración' : 'Portal del Estudiante'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <ThemeToggle />

                        {/* User info */}
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition"
                            onClick={onProfileClick}
                            title="Ver Perfil"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.nombres}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user?.tipo}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>

                        {/* Logout button */}
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}