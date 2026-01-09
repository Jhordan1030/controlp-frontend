
# 🎓 Sistema de Control de Prácticas - Frontend

Frontend moderno en React + Tailwind CSS para el sistema de gestión de prácticas universitarias.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```

El proyecto se abrirá en `http://localhost:5173`

## 📦 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Vista previa de producción
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   ├── common/          # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Alert.jsx
│   │   ├── StatCard.jsx
│   │   └── ProgressBar.jsx
│   ├── admin/           # Componentes de administrador
│   │   ├── AdminDashboard.jsx
│   │   ├── UniversidadesManager.jsx
│   │   ├── PeriodosManager.jsx
│   │   └── EstudiantesManager.jsx
│   └── estudiante/      # Componentes de estudiante
│       ├── EstudianteDashboard.jsx
│       ├── RegistroHoras.jsx
│       └── MisRegistros.jsx
├── pages/               # Páginas principales
│   ├── Login.jsx
│   ├── AdminPanel.jsx
│   └── EstudiantePanel.jsx
├── services/            # Servicios de API
│   └── api.js
├── context/             # Context API
│   └── AuthContext.jsx
├── utils/               # Utilidades
│   ├── constants.js
│   └── helpers.js
├── App.jsx              # Componente principal
├── index.js             # Punto de entrada
└── index.css            # Estilos globales
```

## 🎨 Características

### Administrador
- ✅ Dashboard con estadísticas del sistema
- ✅ Gestión de universidades
- ✅ Gestión de periodos académicos
- ✅ Gestión de estudiantes
- ✅ Vista de progreso de estudiantes

### Estudiante
- ✅ Dashboard personal con progreso
- ✅ Registro de horas de prácticas
- ✅ Historial de registros
- ✅ Visualización de progreso con barra
- ✅ Estadísticas personales

### Características Generales
- ✅ Autenticación con JWT
- ✅ Rutas protegidas por rol
- ✅ Diseño responsive (mobile, tablet, desktop)
- ✅ Interfaz moderna con Tailwind CSS
- ✅ Notificaciones y alertas
- ✅ Modales interactivos
- ✅ Spinners de carga
- ✅ Manejo de errores

## 🔑 Credenciales de Prueba

Después de ejecutar `npm run seed` en el backend:

**Administrador:**
- Email: `admin@controlpracticas.com`
- Password: `Admin123!`

**Estudiante:**
- Email: `juan.perez@ejemplo.com`
- Password: `Estudiante123!`

## 🛠️ Tecnologías

- **React 18** - Framework JavaScript
- **React Router DOM** - Enrutamiento
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos
- **Vite** - Build tool

## 📡 API Endpoints

El frontend consume los siguientes endpoints del backend:

### Auth
- `POST /auth/login` - Iniciar sesión
- `POST /auth/registro` - Registro de estudiante

### Admin
- `GET /admin/dashboard` - Dashboard admin
- `GET /admin/universidades` - Listar universidades
- `POST /admin/universidades` - Crear universidad
- `GET /admin/periodos` - Listar periodos
- `POST /admin/periodos` - Crear periodo
- `GET /admin/estudiantes` - Listar estudiantes
- `POST /admin/estudiantes` - Crear estudiante

### Estudiante
- `GET /estudiante/dashboard` - Dashboard estudiante
- `GET /estudiante/registros` - Listar registros
- `POST /estudiante/registrar-horas` - Registrar horas
- `DELETE /estudiante/registros/:id` - Eliminar registro

## 🎯 Funcionalidades por Pantalla

### Login
- Formulario de login con validación
- Botones para cargar credenciales de prueba
- Diseño atractivo con gradientes

### Dashboard Admin
- 4 tarjetas de estadísticas
- Resumen del sistema
- Acceso rápido a funciones

### Dashboard Estudiante
- 4 tarjetas con métricas personales
- Barra de progreso visual
- Últimos registros

### Gestión de Universidades
- Lista en grid responsive
- Modal para crear nuevas universidades
- Indicador de estado (activa/inactiva)

### Gestión de Periodos
- Lista con información detallada
- Modal con formulario completo
- Fechas y horas requeridas

### Gestión de Estudiantes
- Lista completa de estudiantes
- Modal de creación con todos los campos
- Asignación de universidad y periodo

### Registro de Horas
- Formulario con validaciones
- Selector de fecha (no futuras)
- Área de texto para descripción
- Tips útiles

### Mis Registros
- Lista cronológica de registros
- Resumen con estadísticas
- Eliminar con confirmación

## 🚀 Despliegue

### Build para producción
```bash
npm run build
```

Los archivos se generan en la carpeta `dist/`

### Desplegar en Netlify/Vercel
1. Conecta tu repositorio
2. Comando de build: `npm run build`
3. Directorio de publicación: `dist`
4. Configura variables de entorno (VITE_API_URL)

## 🔧 Configuración Adicional

### Cambiar URL del Backend
Edita el archivo `.env`:
```env
VITE_API_URL=https://tu-api.com/api/v1
```

### Personalizar Colores
Edita `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Tus colores personalizados
      }
    }
  }
}
```

## 📱 Responsive Design

La aplicación es completamente responsive:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🐛 Solución de Problemas

### Error de conexión con el backend
- Verifica que el backend esté corriendo
- Verifica la URL en `.env`
- Revisa la consola del navegador

### Estilos no se aplican
```bash
npm install
npm run dev
```

### Token expirado
- El token JWT expira en 7 días
- Vuelve a hacer login

## 📝 Notas de Desarrollo

- Los datos se almacenan en localStorage (token y usuario)
- La sesión persiste al recargar la página
- El logout elimina todos los datos locales
- Las rutas están protegidas por rol
- Validaciones en frontend y backend

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT.

## 👨‍💻 Autor

Sistema de Control de Prácticas Universitarias - 2025

---

**¡Listo para usar!** 🚀
*/

// ==================== INSTRUCCIONES FINALES ====================
/*

PASOS PARA EJECUTAR EL PROYECTO COMPLETO:

1. BACKEND (Terminal 1):
   cd control-practicas-backend
   npm install
   npm run seed
   npm run dev

2. FRONTEND (Terminal 2):
   cd control-practicas-frontend
   npm install
   npm run dev

3. Abrir navegador en: http://localhost:5173

4. Usar credenciales de prueba:
   Admin: admin@controlpracticas.com / Admin123!
   Estudiante: juan.perez@ejemplo.com / Estudiante123!

¡TODO LISTO! 🎉

*/