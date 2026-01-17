import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import ForcePasswordChange from '../components/auth/ForcePasswordChange';
import { Sun, Moon, Mail, Lock, ArrowRight, AlertCircle, Loader } from 'lucide-react';

const Login = () => {
    // 1. Estados y Hooks
    const { user, login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Estado p/ cambio de password forzado
    const [authData, setAuthData] = useState(null);
    const [showForceChange, setShowForceChange] = useState(false);

    // 2. Redirección si ya está autenticado
    if (user) {
        return <Navigate to="/" replace />;
    }

    // 3. Manejo del Login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await authAPI.login(email, password);

            if (data.success) {
                const { token, usuario } = data;

                // Bloquear acceso si el usuario está inactivo
                if (usuario.activo === false) {
                    setError('Tu cuenta ha sido desactivada. Por favor, contacta con el administrador.');
                    setIsLoading(false);
                    return;
                }

                if (usuario.debe_cambiar_password) {
                    setAuthData({ token, usuario });
                    setShowForceChange(true);
                    setIsLoading(false);
                } else {
                    login(token, usuario);
                    navigate('/', { replace: true });
                }
            } else {
                setError(data.error || 'Credenciales incorrectas');
                setIsLoading(false);
            }
        } catch (err) {

            // Manejo específico para error 403 (Usuario desactivado)
            if (err.response && err.response.status === 403) {
                // No logueamos error en consola para este caso controlado
                setError(err.response.data.error || 'Tu cuenta ha sido desactivada. Comunícate con administración.');
            } else if (err.response && err.response.status === 429) {
                // Manejo error 429 (Rate Limiting)
                setError('Demasiados intentos incorrectos. Por favor, espera unos minutos antes de intentar de nuevo.');
            } else {
                console.error(err);
                setError('Error al conectar con el servidor. Inténtalo más tarde.');
            }

            setIsLoading(false);
        }
    };

    // 4. Renderizado condicional: Cambio de contraseña
    if (showForceChange && authData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4 transition-colors duration-300">
                <div className="w-full max-w-md">
                    <ForcePasswordChange
                        token={authData.token}
                        user={authData.usuario}
                        initialPassword={password}
                        onSuccess={() => {
                            const updatedUser = { ...authData.usuario, debe_cambiar_password: false };
                            login(authData.token, updatedUser);
                            navigate('/', { replace: true });
                        }}
                        onCancel={() => {
                            setShowForceChange(false);
                            setAuthData(null);
                            setPassword('');
                        }}
                    />
                </div>
            </div>
        );
    }

    // 5. Renderizado Principal (Nuevo Diseño Split)
    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-slate-950 transition-colors duration-300">

            {/* --- LADO IZQUIERDO (FORMULARIO) --- */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative bg-white dark:bg-slate-950 transition-colors duration-300">

                {/* Botón Tema */}
                <button
                    onClick={toggleTheme}
                    className="absolute top-6 left-6 p-3 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm z-20"
                    aria-label="Cambiar tema"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="w-full max-w-[420px] space-y-8 z-10">

                    <div className="text-center md:text-left space-y-2">
                        <div className="md:hidden inline-flex mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <span className="text-2xl">🎓</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Bienvenido
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Ingresa tus credenciales para acceder al sistema.
                        </p>
                    </div>

                    {error && (
                        <div className="animate-in slide-in-from-top-2 fade-in bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100 dark:border-red-800/30">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Input Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                Correo Electrónico
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                    placeholder="correo@universidad.edu.ec"
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Contraseña
                                </label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Botón */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin mr-2" />
                                    Verificando...
                                </>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Iniciar Sesión <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </button>

                    </form>

                    <p className="text-center text-slate-400 dark:text-slate-600 text-xs mt-8">
                        © {new Date().getFullYear()} Control de Prácticas - v2.1.0
                    </p>
                </div>
            </div>

            {/* --- LADO DERECHO (BRANDING) --- */}
            <div className="hidden md:flex md:w-1/2 bg-slate-900 relative flex-col justify-between p-12 lg:p-16 overflow-hidden">

                {/* Imagen de Fondo */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-blue-900/30" />
                </div>

                {/* Fondo animado sutil (mantenemos sutilmente) */}
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700 pointer-events-none" />

                {/* Contenido */}
                <div className="relative z-10 mt-10 text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/20 backdrop-blur-md mb-6 ml-auto shadow-lg">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-blue-100 text-xs font-bold tracking-widest uppercase text-shadow">Sistema V 2.1.0</span>
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-lg">
                        Gestión de <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-200 to-indigo-200">
                            Prácticas
                        </span>
                    </h1>

                    <p className="mt-6 text-slate-200 text-lg max-w-md ml-auto leading-relaxed drop-shadow-md">
                        Plataforma integral para el seguimiento de periodos, registros de horas y gestión universitaria.
                    </p>
                </div>

                {/* Footer del lado derecho */}
                <div className="relative z-10 text-slate-300 text-sm text-right font-medium">
                    <p>Tecnología segura y eficiente.</p>
                </div>
            </div>

        </div>
    );
};

export default Login;