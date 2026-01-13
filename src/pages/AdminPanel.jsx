// ==================== src/pages/AdminPanel.jsx ====================
import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import AdminDashboard from '../components/admin/AdminDashboard';
import UniversidadesManager from '../components/admin/UniversidadesManager';
import PeriodosManager from '../components/admin/PeriodosManager';
import EstudiantesManager from '../components/admin/EstudiantesManager';

import AdminProfile from '../components/admin/AdminProfile';
import AuditoriaManager from '../components/admin/AuditoriaManager';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':

                return <AdminDashboard setActiveTab={setActiveTab} />;
            case 'universidades':
                return <UniversidadesManager />;
            case 'periodos':
                return <PeriodosManager />;
            case 'estudiantes':
                return <EstudiantesManager />;
            case 'auditoria':
                return <AuditoriaManager />;
            case 'perfil':
                return <AdminProfile />;
            default:
                return <AdminDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <Navbar
                onMenuClick={() => setSidebarOpen(true)}
                onProfileClick={() => setActiveTab('perfil')}
            />

            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="lg:ml-64 p-4 md:p-6 lg:p-8 w-auto">
                <div className="max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}