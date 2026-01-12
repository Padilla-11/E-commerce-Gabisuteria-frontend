// Configuración de la API
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://e-commerce-gabisuteria-backend.onrender.com';

// Obtener token del localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Utilidad para hacer peticiones con JWT
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), // Agregar token si existe
        ...options.headers
      }
    });

    if (!response.ok) {
      // Si es 401, el token expiró o es inválido
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        if (window.location.pathname.includes('/admin/')) {
          window.location.href = '/admin/login.html';
        }
      }
      const error = await response.json();
      throw new Error(error.error || 'Error en la petición');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
};

// ==================== PRODUCTOS ====================

const productosAPI = {
  // Obtener todos los productos
  getAll: async (categoriaId = null) => {
    const query = categoriaId ? `?categoria_id=${categoriaId}` : '';
    return await apiRequest(`/api/productos${query}`);
  },

  // Obtener un producto por ID
  getById: async (id) => {
    return await apiRequest(`/api/productos/${id}`);
  },

  // Crear producto (solo admin)
  create: async (formData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/productos`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData // FormData para subir imagen
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear producto');
    }

    return await response.json();
  },

  // Actualizar producto (solo admin)
  update: async (id, formData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/productos/${id}`, {
      method: 'PUT',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar producto');
    }

    return await response.json();
  },

  // Eliminar producto (solo admin)
  delete: async (id) => {
    return await apiRequest(`/api/productos/${id}`, {
      method: 'DELETE'
    });
  },

  // Cambiar estado de producto (activar/desactivar)
  toggleEstado: async (id, nuevoEstado) => {
    return await apiRequest(`/api/productos/${id}/toggle-estado`, {
      method: 'PATCH',
      body: JSON.stringify({ activo: nuevoEstado })
    });
  }
};

// ==================== CATEGORÍAS ====================

const categoriasAPI = {
  // Obtener todas las categorías
  getAll: async () => {
    return await apiRequest('/api/categorias');
  },

  // Obtener una categoría por ID
  getById: async (id) => {
    return await apiRequest(`/api/categorias/${id}`);
  },

  // Crear categoría (solo admin)
  create: async (data) => {
    return await apiRequest('/api/categorias', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Actualizar categoría (solo admin)
  update: async (id, data) => {
    return await apiRequest(`/api/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Eliminar categoría (solo admin)
  delete: async (id) => {
    return await apiRequest(`/api/categorias/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==================== COLORES ====================

const coloresAPI = {
  // Obtener todos los colores
  getAll: async () => {
    return await apiRequest('/api/colores');
  },

  // Obtener un color por ID
  getById: async (id) => {
    return await apiRequest(`/api/colores/${id}`);
  },

  // Crear color (solo admin)
  create: async (data) => {
    return await apiRequest('/api/colores', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Actualizar color (solo admin)
  update: async (id, data) => {
    return await apiRequest(`/api/colores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Eliminar color (solo admin)
  delete: async (id) => {
    return await apiRequest(`/api/colores/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==================== ADMINISTRADORES ====================

const administradoresAPI = {
  // Obtener todos los administradores
  getAll: async () => {
    return await apiRequest('/api/administradores');
  },

  // Obtener un administrador por ID
  getById: async (id) => {
    return await apiRequest(`/api/administradores/${id}`);
  },

  // Buscar usuario por email
  buscarPorEmail: async (email) => {
    return await apiRequest(`/api/administradores/buscar?email=${encodeURIComponent(email)}`);
  },

  // Crear administrador (solo admin)
  create: async (data) => {
    return await apiRequest('/api/administradores', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Actualizar administrador (solo admin)
  update: async (id, data) => {
    return await apiRequest(`/api/administradores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Eliminar administrador (solo admin)
  delete: async (id) => {
    return await apiRequest(`/api/administradores/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==================== AUTENTICACIÓN ====================

const authAPI = {
  // Verificar si está autenticado
  checkAuth: async () => {
    const token = getToken();
    if (!token) {
      return { authenticated: false };
    }
    
    try {
      return await apiRequest('/auth/check');
    } catch (error) {
      return { authenticated: false };
    }
  },

  // Cerrar sesión
  logout: async () => {
    localStorage.removeItem('authToken');
    return { message: 'Sesión cerrada' };
  },

  // Iniciar sesión con Google (redirige)
  loginWithGoogle: () => {
    window.location.href = `${API_URL}/auth/google`;
  }
};