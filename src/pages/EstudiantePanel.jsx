// ==================== src/pages/EstudiantePanel.jsx ====================
import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import EstudianteDashboard from '../components/estudiante/EstudianteDashboard';
import MisRegistros from '../components/estudiante/MisRegistros';
import MisPeriodos from '../components/estudiante/MisPeriodos';


export default function EstudiantePanel() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);


    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <EstudianteDashboard />;
            case 'mis-periodos':
                return <MisPeriodos />;
            case 'registros':
                return <MisRegistros />;
            default:
                return <EstudianteDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 transition-colors duration-200">
            <Navbar onMenuClick={() => setSidebarOpen(true)} />

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