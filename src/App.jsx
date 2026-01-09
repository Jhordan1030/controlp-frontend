import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import EstudiantePanel from './pages/EstudiantePanel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/estudiante" element={<EstudiantePanel />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
