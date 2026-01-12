# 🛍️ Talis Papelería - Frontend

Interfaz web responsive para e-commerce de papelería con panel administrativo.

## 🚀 Tecnologías

- HTML5
- CSS3
- JavaScript Vanilla (ES6+)
- Fetch API para consumir backend REST API

## 📋 Prerequisitos

- Navegador web moderno
- Servidor local para desarrollo (Live Server, Python HTTP Server, etc.)
- Backend corriendo (ver [talis-papeleria-backend](https://github.com/tu-usuario/talis-papeleria-backend))

## 🔧 Instalación y Desarrollo Local

### Opción 1: VS Code Live Server (Recomendado)

1. Instala la extensión **Live Server** en VS Code
2. Abre la carpeta del proyecto
3. Click derecho en `index.html` → **Open with Live Server**
4. Se abrirá en `http://localhost:5500`

### Opción 2: Python HTTP Server

```bash
# Python 3
python -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
```

Abre tu navegador en `http://localhost:5500`

### Opción 3: Node.js serve

```bash
npx serve -p 5500
```

### Opción 4: http-server (Node.js)

```bash
npx http-server -p 5500
```

## ⚙️ Configuración

### Configurar URL del Backend

Edita `js/api.js` y ajusta la URL según tu entorno:

```javascript
// Para desarrollo local
const API_URL = 'http://localhost:3000';

// Para producción (después del deploy)
const API_URL = 'https://tu-backend.railway.app';
```

O mejor aún, usa detección automática:

```javascript
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://tu-backend.railway.app';
```

## 📁 Estructura del Proyecto

```
frontend/
├── admin/                    # Panel administrativo
│   ├── administradores.html  # Gestión de administradores
│   ├── categorias.html       # Gestión de categorías
│   ├── colores.html          # Gestión de colores
│   ├── dashboard.html        # Dashboard principal
│   ├── login.html            # Login con Google
│   └── productos.html        # Gestión de productos
├── assets/                   # Recursos estáticos
│   └── Logo-sin-fondo.png
├── css/
│   └── styles.css            # Estilos globales
├── js/
│   ├── admin/                # Scripts del panel admin
│   │   ├── administradores.js
│   │   ├── categorias.js
│   │   ├── colores.js
│   │   └── productos.js
│   ├── api.js                # Conexión con backend API
│   ├── carrito-lateral.js    # Lógica del carrito
│   └── main.js               # JavaScript principal
├── carrito.html              # Página del carrito
├── index.html                # Página principal (tienda)
├── .gitignore
├── vercel.json               # Configuración de Vercel
└── README.md
```

## 🎯 Funcionalidades

### Tienda (Usuario)
- ✅ Catálogo de productos con filtros por categoría
- ✅ Vista detallada de productos
- ✅ Carrito de compras
- ✅ Búsqueda de productos

### Panel Administrativo
- 🔐 Autenticación con Google OAuth
- 📦 CRUD completo de productos (crear, leer, actualizar, eliminar)
- 🏷️ Gestión de categorías
- 🎨 Gestión de colores
- 👥 Gestión de administradores
- 🖼️ Subida de imágenes a Cloudinary

## 🌐 Despliegue en Vercel

### Método 1: Desde GitHub (Recomendado)

1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Configura:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (raíz)
   - **Build Command**: (dejar vacío)
   - **Output Directory**: `./` (raíz)
5. Click en **Deploy**

### Método 2: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel

# Producción
vercel --prod
```

### Configuración Post-Deploy

Después del deploy, actualiza `js/api.js` con la URL de Railway:

```javascript
const API_URL = 'https://tu-backend.railway.app';
```

Y vuelve a deployar:
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

Vercel redesplegará automáticamente.

## 🔗 URLs Importantes

- **Desarrollo Local**: http://localhost:5500
- **Producción**: https://tu-proyecto.vercel.app
- **Backend API**: https://tu-backend.railway.app

## 🎨 Personalización

### Cambiar colores del tema

Edita `css/styles.css`:

```css
:root {
  --color-primario: #tu-color;
  --color-secundario: #tu-color;
  --color-acento: #tu-color;
}
```

### Cambiar logo

Reemplaza `assets/Logo-sin-fondo.png` con tu logo.

## 📱 Responsive Design

El sitio es completamente responsive y funciona en:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🐛 Solución de Problemas

### No se conecta al backend
1. Verifica que el backend esté corriendo
2. Verifica la URL en `js/api.js`
3. Revisa la consola del navegador (F12)
4. Verifica que CORS esté configurado en el backend

### Imágenes no cargan
1. Verifica que las URLs de Cloudinary sean correctas
2. Verifica conexión a internet
3. Revisa la consola del navegador

### Login con Google no funciona
1. Verifica que las URLs estén configuradas en Google Cloud Console
2. Verifica que el backend esté configurado correctamente
3. Verifica que las cookies estén habilitadas

### Carrito no guarda productos
1. Verifica que localStorage esté habilitado
2. Limpia el localStorage: `localStorage.clear()`
3. Recarga la página

## 🔄 Workflow de Desarrollo

1. Haz cambios en el código
2. Prueba localmente con Live Server
3. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push origin main
   ```
4. Vercel despliega automáticamente
5. Verifica en producción

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador (F12)
2. Revisa la pestaña Network para errores de API
3. Verifica que el backend esté funcionando

## 📄 Licencia

MIT