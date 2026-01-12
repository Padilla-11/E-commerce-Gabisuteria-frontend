let colores = [];
const colorModal = new bootstrap.Modal(document.getElementById('colorModal'));

document.addEventListener('DOMContentLoaded', async () => {
    await verificarAuth();
    await cargarColores();
    configurarEventos();
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

async function cargarColores() {
    try {
        colores = await coloresAPI.getAll();
        renderizarColores();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar colores', 'danger');
    }
}

function renderizarColores() {
    const tbody = document.getElementById('tabla-colores');
    
    if (colores.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    No hay colores registrados
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = colores.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>
                <div style="width: 40px; height: 40px; background-color: ${c.codigo_hex}; 
                     border: 2px solid #ddd; border-radius: 8px;"></div>
            </td>
            <td>${c.nombre}</td>
            <td><code>${c.codigo_hex}</code></td>
            <td>
                ${c.activo 
                    ? '<span class="badge bg-success">Activo</span>'
                    : '<span class="badge bg-secondary">Inactivo</span>'}
            </td>
            <td class="table-actions">
                <button class="btn btn-sm btn-warning" onclick="editarColor(${c.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarColor(${c.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function configurarEventos() {
    const codigoHexInput = document.getElementById('codigo-hex');
    const colorPicker = document.getElementById('color-picker');
    const preview = document.getElementById('preview');
    
    // Sincronizar input de texto con color picker
    codigoHexInput.addEventListener('input', (e) => {
        let valor = e.target.value.trim().toUpperCase();
        
        // Asegurar que comience con #
        if (valor && !valor.startsWith('#')) {
            valor = '#' + valor;
        }
        
        // Validar formato hex
        if (/^#[0-9A-F]{6}$/i.test(valor)) {
            colorPicker.value = valor;
            preview.style.backgroundColor = valor;
        }
    });
    
    // Sincronizar color picker con input de texto
    colorPicker.addEventListener('input', (e) => {
        const valor = e.target.value.toUpperCase();
        codigoHexInput.value = valor;
        preview.style.backgroundColor = valor;
    });
}

function mostrarModalColor(color = null) {
    if (color) {
        document.getElementById('modalTitle').textContent = 'Editar Color';
        document.getElementById('color-id').value = color.id;
        document.getElementById('nombre').value = color.nombre;
        document.getElementById('codigo-hex').value = color.codigo_hex;
        document.getElementById('color-picker').value = color.codigo_hex;
        document.getElementById('preview').style.backgroundColor = color.codigo_hex;
    } else {
        document.getElementById('modalTitle').textContent = 'Nuevo Color';
        document.getElementById('form-color').reset();
        document.getElementById('color-id').value = '';
        document.getElementById('codigo-hex').value = '#FF0000';
        document.getElementById('color-picker').value = '#FF0000';
        document.getElementById('preview').style.backgroundColor = '#FF0000';
    }
    colorModal.show();
}

async function guardarColor() {
    const nombre = document.getElementById('nombre').value.trim();
    let codigoHex = document.getElementById('codigo-hex').value.trim().toUpperCase();
    
    if (!nombre || !codigoHex) {
        mostrarAlerta('Por favor completa todos los campos', 'warning');
        return;
    }
    
    // Asegurar formato correcto
    if (!codigoHex.startsWith('#')) {
        codigoHex = '#' + codigoHex;
    }
    
    // Validar formato hexadecimal
    if (!/^#[0-9A-F]{6}$/i.test(codigoHex)) {
        mostrarAlerta('Código hexadecimal inválido. Formato: #RRGGBB', 'warning');
        return;
    }
    
    try {
        const colorId = document.getElementById('color-id').value;
        
        if (colorId) {
            await coloresAPI.update(colorId, { 
                nombre, 
                codigo_hex: codigoHex 
            });
            mostrarAlerta('Color actualizado exitosamente', 'success');
        } else {
            await coloresAPI.create({ 
                nombre, 
                codigo_hex: codigoHex 
            });
            mostrarAlerta('Color creado exitosamente', 'success');
        }
        
        colorModal.hide();
        await cargarColores();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta(error.message || 'Error al guardar color', 'danger');
    }
}

async function editarColor(id) {
    try {
        const color = await coloresAPI.getById(id);
        mostrarModalColor(color);
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar color', 'danger');
    }
}

async function eliminarColor(id) {
    if (!confirm('¿Estás seguro de eliminar este color?')) return;
    
    try {
        await coloresAPI.delete(id);
        mostrarAlerta('Color eliminado exitosamente', 'success');
        await cargarColores();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta(error.message || 'Error al eliminar color', 'danger');
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