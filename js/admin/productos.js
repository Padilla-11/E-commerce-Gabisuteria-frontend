let productos = [];
let categorias = [];
let colores = [];
let productoEditando = null;
let imagenPreviewActual = null;
let paginationInstance = null;
let filterInstance = null; // Nueva instancia de filtros

const productoModal = new bootstrap.Modal(document.getElementById('productoModal'));

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', async () => {
    await verificarAuth();
    await cargarDatos();
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

// ==================== CARGAR DATOS ====================

async function cargarDatos() {
    try {
        LoadingUtils.showTableSkeleton('tabla-productos', 5, 8);
        
        [productos, categorias, colores] = await Promise.all([
            productosAPI.getAll(),
            categoriasAPI.getAll(),
            coloresAPI.getAll()
        ]);
        
        // Cargar opciones de categorías en el filtro
        cargarOpcionesCategorias();
        
        // Inicializar sistema de filtros
        inicializarFiltros();
        
        // Cargar checkboxes del modal
        cargarCategoriasCheckboxes();
        cargarColoresCheckboxes();
    } catch (error) {
        console.error('Error:', error);
        const tbody = document.getElementById('tabla-productos');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-circle fa-3x mb-3 d-block"></i>
                    Error al cargar datos: ${error.message}
                </td>
            </tr>
        `;
        LoadingUtils.showToast('error', 'Error', 'No se pudieron cargar los productos');
    }
}

// ==================== SISTEMA DE FILTROS ====================

function inicializarFiltros() {
    // Inicializar paginación
    paginationInstance = new TablePagination(
        'tabla-productos',
        productos,
        renderizarProductos,
        {
            itemsPerPage: 10,
            paginationId: 'productos-pagination',
            showItemsPerPage: true,
            itemsPerPageOptions: [5, 10, 25, 50, 100]
        }
    );
    
    // Inicializar filtros
    filterInstance = new AdminFilters(
        productos,
        renderizarProductos,
        paginationInstance
    );
    
    // Configurar controles de filtros en la UI
    setupFilterControls(filterInstance, {
        searchInputId: 'search-admin',
        sortSelectId: 'sort-select',
        categorySelectId: 'category-filter',
        statusSelectId: 'status-filter',
        priceMinId: 'price-min',
        priceMaxId: 'price-max',
        resetBtnId: 'reset-filters-btn',
        showStats: true
    });
    
    // Configurar botones de filtros rápidos
    configurarFiltrosRapidos();
}

function configurarFiltrosRapidos() {
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sortType = e.currentTarget.getAttribute('data-sort');
            
            // Actualizar select principal
            const sortSelect = document.getElementById('sort-select');
            if (sortSelect) {
                sortSelect.value = sortType;
            }
            
            // Aplicar filtro
            filterInstance.setSort(sortType);
            
            // Feedback visual
            document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            updateFilterStats(filterInstance, true);
        });
    });
}

function cargarOpcionesCategorias() {
    const categorySelect = document.getElementById('category-filter');
    if (categorySelect) {
        categorySelect.innerHTML = generateCategoryOptions(categorias);
    }
}

// ==================== RENDERIZADO ====================

function renderizarProductos(productosAMostrar) {
    const tbody = document.getElementById('tabla-productos');
    
    if (!productosAMostrar || productosAMostrar.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-inbox"></i>
                        </div>
                        <div class="empty-state-title">No hay productos</div>
                        <div class="empty-state-text">
                            ${productos.length === 0 ? 'Agrega tu primer producto' : 'No se encontraron resultados con los filtros aplicados'}
                        </div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = productosAMostrar.map(p => {
        const imagenUrl = p.imagen_url
            ? (p.imagen_url.startsWith('http')
                ? p.imagen_url
                : `https://tali-s-ecommerce-backend-production.up.railway.app${p.imagen_url}`)
            : 'https://via.placeholder.com/50x50?text=Sin+Imagen';

        const categoriasTexto = p.categorias?.length
            ? p.categorias.map(c =>
                `<span class="badge bg-secondary me-1">${c.nombre}</span>`
            ).join('')
            : '<span class="text-muted">Sin categoría</span>';

        const coloresInfo = p.maneja_colores && p.colores_disponibles?.length
            ? `<span class="badge bg-info">${p.colores_disponibles.length} colores</span>`
            : '<span class="text-muted">-</span>';

        const estadoBadge = p.activo
            ? '<span class="badge bg-success">Activo</span>'
            : '<span class="badge bg-secondary">Inactivo</span>';

        return `
            <tr data-id="${p.id}">
                <td>
                    <img src="${imagenUrl}" alt="${p.nombre}"
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td>${p.nombre}</td>
                <td>${p.marca || '-'}</td>
                <td>${categoriasTexto}</td>
                <td>${formatearPrecio(p.precio)}</td>
                <td>${coloresInfo}</td>
                <td>${estadoBadge}</td>
                <td class="table-actions">
                    <button class="btn btn-sm ${p.activo ? 'btn-danger' : 'btn-success'}" 
                            onclick="toggleEstadoProducto(${p.id}, ${p.activo})" 
                            title="${p.activo ? 'Desactivar' : 'Activar'}">
                        <i class="fas fa-${p.activo ? 'ban' : 'check'}"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editarProducto(${p.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function cargarCategoriasCheckboxes() {
    const container = document.getElementById('categorias-list');
    container.innerHTML = categorias.map(c => `
        <div class="form-check">
            <input class="form-check-input categoria-checkbox" type="checkbox" 
                   value="${c.id}" id="cat-${c.id}">
            <label class="form-check-label" for="cat-${c.id}">
                ${c.nombre}
            </label>
        </div>
    `).join('');
}

function cargarColoresCheckboxes() {
    const container = document.getElementById('colores-list');
    container.innerHTML = colores.map(c => `
        <div class="form-check form-check-inline">
            <input class="form-check-input color-checkbox" type="checkbox" 
                   value="${c.id}" id="color-${c.id}">
            <label class="form-check-label d-flex align-items-center gap-2" for="color-${c.id}">
                <span style="width: 20px; height: 20px; background: ${c.codigo_hex}; 
                            border: 2px solid #ddd; border-radius: 3px; display: inline-block;"></span>
                ${c.nombre}
            </label>
        </div>
    `).join('');
}

// ==================== MODAL ====================

function mostrarModalProducto(producto = null) {
    productoEditando = producto;
    imagenPreviewActual = null;
    
    document.getElementById('imagen-url').value = '';
    document.getElementById('url-validation').innerHTML = '';
    document.getElementById('preview-imagen').innerHTML = '';
    document.getElementById('imagen').value = '';
    
    if (producto) {
        document.getElementById('modalTitle').textContent = 'Editar Producto';
        document.getElementById('producto-id').value = producto.id;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('marca').value = producto.marca || '';
        document.getElementById('tamano').value = producto.tamano || '';
        document.getElementById('precio').value = producto.precio;
        document.getElementById('maneja-colores').checked = producto.maneja_colores;
        
        document.querySelectorAll('.categoria-checkbox').forEach(cb => cb.checked = false);
        
        if (producto.categorias && producto.categorias.length > 0) {
            producto.categorias.forEach(cat => {
                const checkbox = document.getElementById(`cat-${cat.id}`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        if (producto.maneja_colores) {
            document.getElementById('colores-section').style.display = 'block';
            document.querySelectorAll('.color-checkbox').forEach(cb => cb.checked = false);
            
            if (producto.colores_disponibles) {
                producto.colores_disponibles.forEach(color => {
                    const checkbox = document.getElementById(`color-${color.id}`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        } else {
            document.getElementById('colores-section').style.display = 'none';
        }

        if (producto.imagen_url) {
            mostrarPreview(producto.imagen_url, 'current');
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Nuevo Producto';
        document.getElementById('form-producto').reset();
        document.getElementById('producto-id').value = '';
        document.getElementById('colores-section').style.display = 'none';
        document.querySelectorAll('.categoria-checkbox').forEach(cb => cb.checked = false);
    }
    
    configurarImagenTabs();
    productoModal.show();
}

function configurarEventos() {
    document.getElementById('maneja-colores').addEventListener('change', (e) => {
        document.getElementById('colores-section').style.display = 
            e.target.checked ? 'block' : 'none';
    });
    
    document.getElementById('imagen').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                LoadingUtils.showToast('warning', 'Archivo muy grande', 'La imagen no debe superar 5MB');
                e.target.value = '';
                return;
            }

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                LoadingUtils.showToast('warning', 'Formato no válido', 'Solo se permiten imágenes JPG, PNG, WebP o GIF');
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                mostrarPreview(e.target.result, 'file');
                imagenPreviewActual = { type: 'file', data: e.target.result };
            };
            reader.readAsDataURL(file);
        } else {
            limpiarPreview();
        }
    });
}

// ==================== CONFIGURACIÓN DE TABS DE IMAGEN ====================

function configurarImagenTabs() {
    const btnCargarUrl = document.getElementById('btn-cargar-url');
    const btnBuscarGoogle = document.getElementById('btn-buscar-google');
    const inputImagenUrl = document.getElementById('imagen-url');

    if (!btnCargarUrl || !btnBuscarGoogle || !inputImagenUrl) return;

    const newBtnCargar = btnCargarUrl.cloneNode(true);
    const newBtnBuscar = btnBuscarGoogle.cloneNode(true);
    const newInputUrl = inputImagenUrl.cloneNode(true);
    
    btnCargarUrl.parentNode.replaceChild(newBtnCargar, btnCargarUrl);
    btnBuscarGoogle.parentNode.replaceChild(newBtnBuscar, btnBuscarGoogle);
    inputImagenUrl.parentNode.replaceChild(newInputUrl, inputImagenUrl);

    newInputUrl.addEventListener('input', debounce((e) => {
        validarUrlImagen(e.target.value);
    }, 500));

    newBtnCargar.addEventListener('click', async (e) => {
        e.preventDefault();
        const url = newInputUrl.value.trim();
        
        if (!url) {
            LoadingUtils.showToast('warning', 'Campo vacío', 'Por favor ingresa una URL');
            return;
        }

        if (!validarFormatoUrl(url)) {
            LoadingUtils.showToast('warning', 'URL inválida', 'La URL no es válida o no es una imagen');
            return;
        }

        await cargarImagenDesdeUrl(url);
    });

    newBtnBuscar.addEventListener('click', (e) => {
        e.preventDefault();
        const nombreProducto = document.getElementById('nombre').value.trim();
        const marca = document.getElementById('marca').value.trim();
        
        let busqueda = nombreProducto || 'producto papelería';
        if (marca) busqueda = `${marca} ${busqueda}`;

        window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(busqueda)}`, '_blank');
        
        const tabUrl = document.getElementById('tab-url');
        if (tabUrl) new bootstrap.Tab(tabUrl).show();
        
        LoadingUtils.showToast('info', 'Busca tu imagen', 'Haz clic derecho → "Copiar dirección de imagen"');
    });

    document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            if (e.target.id === 'tab-archivo') {
                newInputUrl.value = '';
                document.getElementById('url-validation').innerHTML = '';
            } else if (e.target.id === 'tab-url') {
                const inputImagen = document.getElementById('imagen');
                if (inputImagen) inputImagen.value = '';
            }
        });
    });
}

// ==================== FUNCIONES DE IMAGEN ====================

function validarFormatoUrl(url) {
    try {
        const urlObj = new URL(url);
        if (!['http:', 'https:'].includes(urlObj.protocol)) return false;
        
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
        const knownImageDomains = ['imgur.com', 'unsplash.com', 'cloudinary.com', 'googleusercontent.com'];
        
        return imageExtensions.test(url) || knownImageDomains.some(d => urlObj.hostname.includes(d));
    } catch {
        return false;
    }
}

async function validarUrlImagen(url) {
    const validationDiv = document.getElementById('url-validation');
    
    if (!url) {
        validationDiv.innerHTML = '';
        return;
    }

    validationDiv.innerHTML = validarFormatoUrl(url)
        ? '<div class="alert alert-success py-2 mb-0"><i class="fas fa-check-circle"></i> URL válida</div>'
        : '<div class="alert alert-warning py-2 mb-0"><i class="fas fa-exclamation-triangle"></i> URL inválida</div>';
}

async function cargarImagenDesdeUrl(url) {
    const btnCargar = document.getElementById('btn-cargar-url');
    LoadingUtils.setButtonLoading(btnCargar);
    
    try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000);
            img.onload = () => { clearTimeout(timeout); resolve(); };
            img.onerror = () => { clearTimeout(timeout); reject(new Error('No se pudo cargar')); };
            img.src = url;
        });

        mostrarPreview(url, 'url');
        imagenPreviewActual = { type: 'url', data: url };
        LoadingUtils.showToast('success', '¡Imagen cargada!', 'Vista previa lista');
    } catch (error) {
        LoadingUtils.showToast('error', 'Error', error.message);
        limpiarPreview();
    } finally {
        LoadingUtils.removeButtonLoading(btnCargar);
    }
}

function mostrarPreview(src, tipo) {
    const badges = {
        file: '<span class="badge bg-primary mb-2"><i class="fas fa-upload"></i> Archivo local</span>',
        url: '<span class="badge bg-info mb-2"><i class="fas fa-link"></i> Desde URL</span>',
        current: '<span class="badge bg-secondary mb-2"><i class="fas fa-image"></i> Imagen actual</span>'
    };

    document.getElementById('preview-imagen').innerHTML = `
        <div class="mt-3 text-center">
            ${badges[tipo]}
            <div class="position-relative d-inline-block">
                <img src="${src}" class="img-fluid rounded shadow-sm" 
                     style="max-height: 250px; max-width: 100%; object-fit: contain;">
                ${tipo !== 'current' ? `
                    <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" 
                            onclick="limpiarPreview()"><i class="fas fa-times"></i></button>
                ` : ''}
            </div>
        </div>
    `;
}

function limpiarPreview() {
    document.getElementById('preview-imagen').innerHTML = '';
    document.getElementById('imagen').value = '';
    document.getElementById('imagen-url').value = '';
    document.getElementById('url-validation').innerHTML = '';
    imagenPreviewActual = null;
}

// ==================== CRUD ====================

async function guardarProducto() {
    const btnGuardar = document.querySelector('#productoModal .btn-primary');
    const nombre = document.getElementById('nombre').value.trim();
    const precio = document.getElementById('precio').value;
    
    if (!nombre || !precio) {
        LoadingUtils.showToast('warning', 'Campos incompletos', 'Completa los campos requeridos');
        return;
    }
    
    if (parseFloat(precio) < 0) {
        LoadingUtils.showToast('warning', 'Precio inválido', 'El precio no puede ser negativo');
        return;
    }
    
    const categoriasSeleccionadas = Array.from(document.querySelectorAll('.categoria-checkbox:checked'))
        .map(cb => cb.value);
    
    if (categoriasSeleccionadas.length === 0) {
        LoadingUtils.showToast('warning', 'Sin categoría', 'Selecciona al menos una categoría');
        return;
    }
    
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('marca', document.getElementById('marca').value.trim());
    formData.append('tamano', document.getElementById('tamano').value.trim());
    formData.append('precio', precio);
    formData.append('categorias', JSON.stringify(categoriasSeleccionadas));
    formData.append('maneja_colores', document.getElementById('maneja-colores').checked);
    
    const imagenUrl = document.getElementById('imagen-url').value.trim();
    const imagenFile = document.getElementById('imagen').files[0];
    
    if (imagenUrl && imagenPreviewActual?.type === 'url') {
        formData.append('imagen_url_externa', imagenUrl);
    } else if (imagenFile) {
        formData.append('imagen', imagenFile);
    }
    
    if (document.getElementById('maneja-colores').checked) {
        const coloresSeleccionados = Array.from(document.querySelectorAll('.color-checkbox:checked'))
            .map(cb => cb.value);
        formData.append('colores', JSON.stringify(coloresSeleccionados));
    }
    
    LoadingUtils.setButtonLoading(btnGuardar);
    LoadingUtils.showOverlay(
        productoEditando ? 'Actualizando producto...' : 'Creando producto...',
        'Por favor espera'
    );
    
    try {
        const productoId = document.getElementById('producto-id').value;
        
        if (productoId) {
            await productosAPI.update(productoId, formData);
            LoadingUtils.showToast('success', '¡Actualizado!', 'Producto actualizado');
        } else {
            await productosAPI.create(formData);
            LoadingUtils.showToast('success', '¡Creado!', 'Producto creado');
        }
        
        productoModal.hide();
        await cargarDatos();
    } catch (error) {
        LoadingUtils.showToast('error', 'Error', error.message || 'No se pudo guardar');
    } finally {
        LoadingUtils.removeButtonLoading(btnGuardar);
        LoadingUtils.hideOverlay();
    }
}

async function editarProducto(id) {
    try {
        LoadingUtils.showOverlay('Cargando producto...', 'Un momento');
        const producto = await productosAPI.getById(id);
        LoadingUtils.hideOverlay();
        mostrarModalProducto(producto);
    } catch (error) {
        LoadingUtils.hideOverlay();
        LoadingUtils.showToast('error', 'Error', 'No se pudo cargar el producto');
    }
}

async function eliminarProducto(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) LoadingUtils.setRowLoading(row);
    
    try {
        await productosAPI.delete(id);
        
        if (row) {
            LoadingUtils.animateRowRemoval(row, async () => {
                await cargarDatos();
                LoadingUtils.showToast('success', '¡Eliminado!', 'Producto eliminado');
            });
        } else {
            await cargarDatos();
            LoadingUtils.showToast('success', '¡Eliminado!', 'Producto eliminado');
        }
    } catch (error) {
        if (row) {
            LoadingUtils.removeRowLoading(row);
            LoadingUtils.showRowError(row);
        }
        LoadingUtils.showToast('error', 'Error', error.message || 'No se pudo eliminar');
    }
}

// ⬇️ AGREGAR ESTA FUNCIÓN NUEVA ⬇️
async function toggleEstadoProducto(id, estadoActual) {
    const nuevoEstado = estadoActual ? 0 : 1;
    const accion = nuevoEstado === 1 ? 'activar' : 'desactivar';
    
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} este producto?`)) return;
    
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) LoadingUtils.setRowLoading(row);
    
    try {
        await productosAPI.toggleEstado(id, nuevoEstado);
        await cargarDatos();
        
        LoadingUtils.showToast(
            'success', 
            '¡Actualizado!', 
            `Producto ${nuevoEstado === 1 ? 'activado' : 'desactivado'} exitosamente`
        );
    } catch (error) {
        if (row) {
            LoadingUtils.removeRowLoading(row);
            LoadingUtils.showRowError(row);
        }
        LoadingUtils.showToast('error', 'Error', error.message || 'No se pudo cambiar el estado');
    }
}


// ==================== UTILIDADES ====================

function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(precio);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Scroll indicator
const tableResponsive = document.querySelector('.table-responsive');
if (tableResponsive) {
    tableResponsive.addEventListener('scroll', function() {
        this.classList.toggle('scrolled', this.scrollLeft > 10);
    }, { passive: true });
}