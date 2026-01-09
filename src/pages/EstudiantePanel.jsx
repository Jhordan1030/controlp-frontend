// ==================== src/pages/EstudiantePanel.jsx ====================
import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import EstudianteDashboard from '../components/estudiante/EstudianteDashboard';
import RegistroHoras from '../components/estudiante/RegistroHoras';
import MisRegistros from '../components/estudiante/MisRegistros';

export default function EstudiantePanel() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRegistroSuccess = () => {
        setRefreshKey(prev => prev + 1);
        setActiveTab('dashboard');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <EstudianteDashboard key={refreshKey} />;
            case 'registrar':
                return <RegistroHoras onSuccess={handleRegistroSuccess} />;
            case 'registros':
                return <MisRegistros />;
            default:
                return <EstudianteDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onMenuClick={() => setSidebarOpen(true)} />

            <div className="flex">
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}