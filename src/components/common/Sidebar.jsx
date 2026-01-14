// ==================== src/components/common/Sidebar.jsx ====================
import React from 'react';
import { Home, Users, Building2, Calendar, FileText, X, Shield, BookOpen, Award, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
    const { isAdmin } = useAuth();

    const adminMenuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'universidades', label: 'Universidades', icon: Building2 },
        { id: 'periodos', label: 'Periodos', icon: Calendar },
        { id: 'estudiantes', label: 'Estudiantes', icon: Users },
        { id: 'auditoria', label: 'Auditoría', icon: Shield }
    ];

    const estudianteMenuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'mis-periodos', label: 'Mis Periodos', icon: BookOpen },
        { id: 'registros', label: 'Mis Registros', icon: FileText },
        { id: 'certificados', label: 'Certificados', icon: Award },



    ];

    const menuItems = isAdmin ? adminMenuItems : estudianteMenuItems;

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[60] lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full z-[70] lg:z-30
          w-64 bg-white dark:bg-gray-800 shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:pt-16
        `}
            >
                <div className="h-full flex flex-col overflow-y-auto">
                    {/* Close button (mobile) */}
                    <div className="lg:hidden flex justify-end p-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* Menu items */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        onClose();
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }
                  `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            <p>Sistema de Control de Prácticas</p>
                            <p className="mt-1">v1.0.0</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}