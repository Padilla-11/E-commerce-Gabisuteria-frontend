let administradores = [];
let usuarioActualId = null;

const administradorModal = new bootstrap.Modal(document.getElementById('administradorModal'));

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', async () => {
    await verificarAuth();
    await cargarAdministradores();
});

async function verificarAuth() {
    try {
        // Verificar que existe el token
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('❌ No hay token, redirigiendo a login...');
            window.location.href = 'login.html';
            return;
        }

        console.log('🔍 Verificando autenticación...');
        const data = await authAPI.checkAuth();
        
        if (!data.authenticated) {
            console.log('❌ No autenticado, redirigiendo a login...');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('✅ Autenticado como:', data.user.email);
        usuarioActualId = data.user.id;
        document.getElementById('admin-name').innerHTML = 
            `<i class="fas fa-user-circle"></i> ${data.user.nombre || data.user.email}`;
    } catch (error) {
        console.error('❌ Error al verificar auth:', error);
        window.location.href = 'login.html';
    }
}

async function cerrarSesion() {
    if (confirm('¿Cerrar sesión?')) {
        await authAPI.logout();
        window.location.href = 'login.html';
    }
}

// ==================== CARGAR DATOS ====================

async function cargarAdministradores() {
    try {
        console.log('📋 Cargando administradores...');
        administradores = await administradoresAPI.getAll();
        console.log('✅ Administradores cargados:', administradores.length);
        renderizarAdministradores();
    } catch (error) {
        console.error('❌ Error al cargar administradores:', error);
        mostrarAlerta('Error al cargar administradores: ' + error.message, 'danger');
    }
}

// ==================== RENDERIZADO ====================

function renderizarAdministradores() {
    const tbody = document.getElementById('tabla-administradores');
    
    if (administradores.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-users fa-3x mb-3 d-block"></i>
                    No hay administradores registrados
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = administradores.map(admin => {
        const fotoPerfil = admin.foto_perfil 
            ? admin.foto_perfil 
            : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(admin.nombre || admin.email) + '&background=random';

        const esUsuarioActual = parseInt(admin.id) === parseInt(usuarioActualId);
        
        const badge = esUsuarioActual 
            ? '<span class="badge bg-primary ms-2">Tú</span>' 
            : '';

        return `
            <tr>
                <td>
                    <img src="${fotoPerfil}" alt="${admin.nombre || admin.email}"
                         style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">
                </td>
                <td>
                    ${admin.nombre || '<span class="text-muted">Sin nombre</span>'}
                    ${badge}
                </td>
                <td>${admin.email}</td>
                <td>${admin.fecha_creacion || '-'}</td>
                <td class="table-actions">
                    ${!esUsuarioActual ? `
                        <button class="btn btn-sm btn-danger" 
                                onclick="eliminarAdministrador(${admin.id}, '${admin.email}')"
                                title="Eliminar administrador">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : `
                        <span class="text-muted small">
                            <i class="fas fa-lock"></i> No puedes eliminarte
                        </span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

// ==================== MODAL ====================

function mostrarModalAdministrador() {
    document.getElementById('form-administrador').reset();
    administradorModal.show();
}

// ==================== CRUD ====================

async function guardarAdministrador() {
    const email = document.getElementById('email').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    
    if (!email) {
        mostrarAlerta('Por favor ingresa un email', 'warning');
        return;
    }

    if (!email.includes('@')) {
        mostrarAlerta('Por favor ingresa un email válido', 'warning');
        return;
    }

    try {
        await administradoresAPI.create({
            email: email,
            nombre: nombre || null
        });

        mostrarAlerta('Administrador agregado exitosamente', 'success');
        administradorModal.hide();
        await cargarAdministradores();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta(error.message || 'Error al agregar administrador', 'danger');
    }
}

async function eliminarAdministrador(id, email) {
    if (!confirm(`¿Estás seguro de eliminar el acceso de administrador a:\n\n${email}\n\nEsta acción no se puede deshacer.`)) {
        return;
    }
    
    try {
        await administradoresAPI.delete(id);
        mostrarAlerta('Administrador eliminado exitosamente', 'success');
        await cargarAdministradores();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta(error.message || 'Error al eliminar administrador', 'danger');
    }
}

// ==================== UTILIDADES ====================

function mostrarAlerta(mensaje, tipo = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}