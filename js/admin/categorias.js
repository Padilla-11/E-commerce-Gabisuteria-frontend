let categorias = [];
const categoriaModal = new bootstrap.Modal(document.getElementById('categoriaModal'));

document.addEventListener('DOMContentLoaded', async () => {
    await verificarAuth();
    await cargarCategorias();
});

async function verificarAuth() {
    try {
        const data = await authAPI.checkAuth();
        if (!data.authenticated) {
            window.location.href = 'login.html';
            return;
        }
        document.getElementById('admin-name').innerHTML = 
            `<i class="fas fa-user-circle"></i> ${data.user.nombre}`;
    } catch (error) {
        window.location.href = 'login.html';
    }
}

async function cerrarSesion() {
    if (confirm('¿Cerrar sesión?')) {
        await authAPI.logout();
        window.location.href = 'login.html';
    }
}

async function cargarCategorias() {
    try {
        categorias = await categoriasAPI.getAll();
        renderizarCategorias();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar categorías', 'danger');
    }
}

function renderizarCategorias() {
    const tbody = document.getElementById('tabla-categorias');
    
    if (categorias.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    No hay categorías registradas
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = categorias.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.nombre}</td>
            <td>
                ${c.activo 
                    ? '<span class="badge bg-success">Activo</span>'
                    : '<span class="badge bg-secondary">Inactivo</span>'}
            </td>
            <td class="table-actions">
                <button class="btn btn-sm btn-warning" onclick="editarCategoria(${c.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarCategoria(${c.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function mostrarModalCategoria(categoria = null) {
    if (categoria) {
        document.getElementById('modalTitle').textContent = 'Editar Categoría';
        document.getElementById('categoria-id').value = categoria.id;
        document.getElementById('nombre').value = categoria.nombre;
    } else {
        document.getElementById('modalTitle').textContent = 'Nueva Categoría';
        document.getElementById('form-categoria').reset();
        document.getElementById('categoria-id').value = '';
    }
    categoriaModal.show();
}

async function guardarCategoria() {
    const nombre = document.getElementById('nombre').value.trim();
    
    if (!nombre) {
        mostrarAlerta('Por favor ingresa un nombre', 'warning');
        return;
    }
    
    try {
        const categoriaId = document.getElementById('categoria-id').value;
        
        if (categoriaId) {
            await categoriasAPI.update(categoriaId, { nombre });
            mostrarAlerta('Categoría actualizada exitosamente', 'success');
        } else {
            await categoriasAPI.create({ nombre });
            mostrarAlerta('Categoría creada exitosamente', 'success');
        }
        
        categoriaModal.hide();
        await cargarCategorias();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta(error.message || 'Error al guardar categoría', 'danger');
    }
}

async function editarCategoria(id) {
    try {
        const categoria = await categoriasAPI.getById(id);
        mostrarModalCategoria(categoria);
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar categoría', 'danger');
    }
}

async function eliminarCategoria(id) {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    
    try {
        await categoriasAPI.delete(id);
        mostrarAlerta('Categoría eliminada exitosamente', 'success');
        await cargarCategorias();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta(error.message || 'Error al eliminar categoría', 'danger');
    }
}

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