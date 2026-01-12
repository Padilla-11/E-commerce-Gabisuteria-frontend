// Variables globales
let productos = []; // Productos de la página actual
let todosLosProductos = []; // Todos los productos para búsqueda
let categorias = [];
let categoriaActual = 'all';
let productoParaAgregar = null;
let searchTimeout = null;
let paginaActual = 1;
let ordenActual = 'nombre-asc';
let paginacionInfo = null;
let modalProducto = null; // Modal de producto completo

// Elementos del DOM
const loading = document.getElementById('loading');
const productosContainer = document.getElementById('productos-container');
const noProductos = document.getElementById('no-productos');
const categoryFilters = document.getElementById('category-filters');
const cartBadge = document.getElementById('cart-badge');
const colorModal = new bootstrap.Modal(document.getElementById('colorModal'));
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', async () => {
  await cargarCategorias();
  await cargarTodosLosProductos();
  mostrarProductosPorCategoria('all');
  actualizarBadgeCarrito();
  configurarBusqueda();
  configurarOrdenamiento();
  inicializarModalProducto();
});

// Hacer funciones globales para que funcionen con onclick
window.agregarAlCarrito = agregarAlCarrito;
window.seleccionarColor = seleccionarColor;
window.cambiarPagina = cambiarPagina;
window.mostrarProductoModal = mostrarProductoModal;
window.mostrarProductosPorCategoria = mostrarProductosPorCategoria;

// ==================== MODAL DE PRODUCTO COMPLETO ====================

function inicializarModalProducto() {
  const modalElement = document.getElementById('vistaPreviaModal');
  if (modalElement) {
    modalProducto = new bootstrap.Modal(modalElement);
  }
}

function mostrarProductoModal(producto) {
  const imagenUrl = producto.imagen_url
    ? (producto.imagen_url.startsWith('http')
        ? producto.imagen_url
        : `${API_URL}${producto.imagen_url}`)
    : 'https://via.placeholder.com/800x800?text=Sin+Imagen';

  const modalImg = document.getElementById('vista-previa-imagen');
  modalImg.src = imagenUrl;
  modalImg.alt = producto.nombre;

  // Nombre del producto
  document.getElementById('vista-previa-nombre').textContent = producto.nombre;

  // Marca (igual que en tarjeta)
  const marcaElement = document.getElementById('vista-previa-marca');
  if (producto.marca) {
    marcaElement.innerHTML = `<i class="fas fa-tag"></i> ${producto.marca}`;
    marcaElement.style.display = 'block';
  } else {
    marcaElement.style.display = 'none';
  }

  // Tamaño (igual que en tarjeta)
  const tamanoElement = document.getElementById('vista-previa-tamano');
  if (producto.tamano) {
    tamanoElement.innerHTML = `<strong>Tamaño:</strong> ${producto.tamano}`;
    tamanoElement.style.display = 'block';
  } else {
    tamanoElement.style.display = 'none';
  }

  // Categorías (igual que en tarjeta)
  const categoriasElement = document.getElementById('vista-previa-categorias');
  if (producto.categorias && producto.categorias.length > 0) {
    categoriasElement.innerHTML = `<i class="fas fa-tag"></i> ${producto.categorias.map(c => c.nombre).join(', ')}`;
    categoriasElement.style.display = 'block';
  } else {
    categoriasElement.style.display = 'none';
  }

  // Precio (igual que en tarjeta)
  document.getElementById('vista-previa-precio').textContent = formatearPrecio(producto.precio);

  // Colores disponibles (igual que en tarjeta)
  const coloresElement = document.getElementById('vista-previa-colores');
  if (producto.maneja_colores && producto.colores_disponibles?.length > 0) {
    coloresElement.innerHTML = `<i class="fas fa-palette"></i> ${producto.colores_disponibles.length} colores disponibles`;
    coloresElement.style.display = 'block';
  } else {
    coloresElement.style.display = 'none';
  }

  // Configurar botón agregar
  const btnAgregar = document.getElementById('vista-previa-btn-agregar');
  btnAgregar.onclick = () => {
    agregarAlCarrito(producto.id);
    modalProducto.hide();
  };

  // Configurar efecto lupa
  configurarLupa(imagenUrl);

  // Mostrar modal
  modalProducto.show();
}

function configurarLupa(imagenUrl) {
  const container = document.getElementById('vista-previa-imagen-container');
  const imagen = document.getElementById('vista-previa-imagen');
  const lupa = document.getElementById('vista-previa-lupa');

  // Limpiar eventos anteriores
  const newContainer = container.cloneNode(true);
  container.parentNode.replaceChild(newContainer, container);

  const containerActualizado = document.getElementById('vista-previa-imagen-container');
  const lupaActualizada = document.getElementById('vista-previa-lupa');

  if (window.innerWidth > 768) {
    containerActualizado.addEventListener('mouseenter', () => {
      lupaActualizada.style.display = 'block';
    });

    containerActualizado.addEventListener('mousemove', (e) => {
      const rect = containerActualizado.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      lupaActualizada.style.left = `${x}px`;
      lupaActualizada.style.top = `${y}px`;

      const img = document.getElementById('vista-previa-imagen');
      const imgRect = img.getBoundingClientRect();
      const imgX = e.clientX - imgRect.left;
      const imgY = e.clientY - imgRect.top;

      const percentX = (imgX / imgRect.width) * 100;
      const percentY = (imgY / imgRect.height) * 100;

      lupaActualizada.style.backgroundImage = `url('${imagenUrl}')`;
      lupaActualizada.style.backgroundPosition = `${percentX}% ${percentY}%`;
    });

    containerActualizado.addEventListener('mouseleave', () => {
      lupaActualizada.style.display = 'none';
    });
  }
}

// ==================== CARGAR DATOS ====================

async function cargarTodosLosProductos() {
  try {
    const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://tali-s-ecommerce-backend-production.up.railway.app';
    const response = await fetch(`${API_URL}/api/productos?limit=1000`, {
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Error en la respuesta:', response.status, response.statusText);
      todosLosProductos = [];
      return;
    }

    const data = await response.json();

    if (data.productos && Array.isArray(data.productos)) {
      todosLosProductos = data.productos;
    } else if (Array.isArray(data)) {
      todosLosProductos = data;
    } else if (data.data && Array.isArray(data.data)) {
      todosLosProductos = data.data;
    } else {
      console.error('Estructura de respuesta no reconocida:', data);
      todosLosProductos = [];
    }

    console.log('Productos cargados para búsqueda:', todosLosProductos.length);
  } catch (error) {
    console.error('Error al cargar todos los productos:', error);
    todosLosProductos = [];
  }
}

async function cargarCategorias() {
  try {
    categorias = await categoriasAPI.getAll();
    renderizarFiltrosCategorias();
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

// Reemplaza la función cargarProductos por esta versión que filtra localmente
async function cargarProductos(categoriaId = null, page = 1) {
  try {
    loading.style.display = 'block';
    productosContainer.style.display = 'none';
    noProductos.style.display = 'none';

    // 🎯 FILTRAR LOCALMENTE desde todosLosProductos
    let productosFiltrados = categoriaId 
      ? todosLosProductos.filter(p => 
          p.categorias && p.categorias.some(cat => cat.id === parseInt(categoriaId))
        )
      : todosLosProductos;

    console.log('📦 Productos filtrados:', productosFiltrados.length, 'para categoría:', categoriaId);

    // Ordenamiento
    const [sortField, sortOrder] = ordenActual.split('-');
    productosFiltrados.sort((a, b) => {
      let valorA = a[sortField];
      let valorB = b[sortField];

      if (sortField === 'precio') {
        valorA = parseFloat(valorA) || 0;
        valorB = parseFloat(valorB) || 0;
      } else if (sortField === 'nombre') {
        valorA = (valorA || '').toLowerCase();
        valorB = (valorB || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
      } else {
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
      }
    });

    // Paginación local
    const limit = 12;
    const totalProductos = productosFiltrados.length;
    const totalPages = Math.ceil(totalProductos / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    productos = productosFiltrados.slice(startIndex, endIndex);

    console.log('✅ Productos en página:', productos.length);
    console.log('🔍 Primeros 3:', productos.slice(0, 3).map(p => ({id: p.id, nombre: p.nombre, categorias: p.categorias})));

    // Actualizar info de paginación
    paginacionInfo = {
      currentPage: page,
      totalPages: totalPages,
      totalProductos: totalProductos,
      limit: limit,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages
    };

    paginaActual = page;

    loading.style.display = 'none';

    if (productos.length === 0) {
      noProductos.style.display = 'block';
    } else {
      productosContainer.style.display = 'flex';
      renderizarProductos();
      renderizarPaginacion();
    }
  } catch (error) {
    console.error('❌ Error al cargar productos:', error);
    loading.style.display = 'none';
    noProductos.style.display = 'block';
    mostrarAlerta('Error al cargar productos. Por favor, intenta de nuevo.', 'danger');
  }
}

// ==================== FILTRADO LOCAL ====================

function mostrarProductosPorCategoria(categoria, page = 1) {
  console.log('🎯 Mostrando productos por categoría:', categoria, 'página:', page);
  
  categoriaActual = categoria;
  paginaActual = page;
  
  // ✅ CORRECCIÓN: Ocultar banner de búsqueda
  const searchBanner = document.getElementById('search-banner');
  searchBanner.style.display = 'none';
  searchBanner.classList.remove('d-flex');
  
  // Mostrar paginación
  mostrarPaginacion();
  
  // Cargar productos con paginación
  const categoriaId = categoria === 'all' ? null : parseInt(categoria);
  console.log('📦 Cargando productos con categoriaId:', categoriaId);
  cargarProductos(categoriaId, page);
}

// ==================== RENDERIZADO ====================

function renderizarFiltrosCategorias() {
  const botonesExtra = categorias.map(cat => `
    <button class="category-item" data-category="${cat.id}">
      <i class="fas fa-tag me-2"></i>
      <span>${cat.nombre}</span>
    </button>
  `).join('');

  const btnTodos = categoryFilters.querySelector('[data-category="all"]');
  if (btnTodos) {
    btnTodos.insertAdjacentHTML('afterend', botonesExtra);
  }

  categoryFilters.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      categoryFilters.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      e.target.closest('button').classList.add('active');

      const categoria = e.target.closest('button').dataset.category;
      categoriaActual = categoria;

      mostrarProductosPorCategoria(categoria);

      if (window.innerWidth < 992) {
        toggleSidebar();
      }
    });
  });
}

function renderizarProductos() {
  productosContainer.innerHTML = '';

  productos.forEach((producto, index) => {
    const precioFormateado = formatearPrecio(producto.precio);
    const estaAgotado = !producto.activo;

    const imagenUrl = producto.imagen_url
      ? (producto.imagen_url.startsWith('http')
          ? producto.imagen_url
          : `${API_URL}${producto.imagen_url}`)
      : 'https://via.placeholder.com/300x300?text=Sin+Imagen';

    const categoriasHtml = producto.categorias && producto.categorias.length > 0
      ? `<p class="text-muted small mb-1">
           <i class="fas fa-tag"></i>
           ${producto.categorias.map(c => c.nombre).join(', ')}
         </p>`
      : '';

    const colDiv = document.createElement('div');
    colDiv.className = 'col-6 col-md-4 col-lg-3';
    colDiv.style.animationDelay = `${index * 0.05}s`;

    colDiv.innerHTML = `
      <div class="card producto-card h-100 ${estaAgotado ? '' : 'producto-card-clickable'} ${estaAgotado ? 'producto-agotado' : ''}" 
           ${estaAgotado ? '' : `onclick="mostrarProductoModal(${JSON.stringify(producto).replace(/"/g, '&quot;')})"`}>
        
        ${estaAgotado ? '<span class="badge-agotado">AGOTADO</span>' : ''}
        
        <img src="${imagenUrl}" class="card-img-top"
             alt="${producto.nombre}" loading="lazy">

        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${producto.nombre}</h5>

          ${producto.marca
            ? `<p class="text-muted small mb-1"><strong>Marca:</strong> ${producto.marca}</p>`
            : ''}

          ${producto.tamano
            ? `<p class="text-muted small mb-1"><strong>Tamaño:</strong> ${producto.tamano}</p>`
            : ''}

          ${categoriasHtml}

          <p class="card-text text-primary fw-bold fs-4 mb-2 mt-auto">
            ${precioFormateado}
          </p>

          ${producto.maneja_colores && producto.colores_disponibles?.length > 0
            ? `<p class="small text-muted mb-2">
                 <i class="fas fa-palette"></i>
                 ${producto.colores_disponibles.length} colores disponibles
               </p>`
            : ''}

          <button class="btn btn-primary mt-auto"
                  ${estaAgotado ? 'disabled' : ''}
                  onclick="event.stopPropagation(); ${estaAgotado ? '' : `agregarAlCarrito(${producto.id})`}">
            <i class="fas fa-${estaAgotado ? 'times-circle' : 'cart-plus'} me-1"></i> 
            ${estaAgotado ? 'No disponible' : 'Agregar'}
          </button>
        </div>
      </div>
    `;

    productosContainer.appendChild(colDiv);
  });
}

// ==================== PAGINACIÓN ====================

function renderizarPaginacion() {
  let paginationSection = document.getElementById('pagination-section');

  if (!paginationSection) {
    paginationSection = document.createElement('nav');
    paginationSection.id = 'pagination-section';
    paginationSection.className = 'mt-5';

    const mainContent = document.querySelector('.main-content');
    const productosContainer = document.getElementById('productos-container');
    if (productosContainer && mainContent) {
      productosContainer.parentNode.insertBefore(paginationSection, productosContainer.nextSibling);
    }
  }

  if (!paginacionInfo || paginacionInfo.totalPages <= 1) {
    paginationSection.style.display = 'none';
    return;
  }

  paginationSection.style.display = 'block';

  const { currentPage, totalPages, totalProductos, limit } = paginacionInfo;
  const inicio = (currentPage - 1) * limit + 1;
  const fin = Math.min(currentPage * limit, totalProductos);

  let paginacionHTML = `
    <ul class="pagination pagination-lg justify-content-center mb-3">
  `;

  paginacionHTML += `
    <li class="page-item ${!paginacionInfo.hasPrevPage ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPagina(${currentPage - 1}); return false;">
        <i class="fas fa-chevron-left"></i>
      </a>
    </li>
  `;

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    paginacionHTML += `
      <li class="page-item">
        <a class="page-link" href="#" onclick="cambiarPagina(1); return false;">1</a>
      </li>
    `;
    if (startPage > 2) {
      paginacionHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginacionHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i}</a>
      </li>
    `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginacionHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    paginacionHTML += `
      <li class="page-item">
        <a class="page-link" href="#" onclick="cambiarPagina(${totalPages}); return false;">${totalPages}</a>
      </li>
    `;
  }

  paginacionHTML += `
    <li class="page-item ${!paginacionInfo.hasNextPage ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPagina(${currentPage + 1}); return false;">
        <i class="fas fa-chevron-right"></i>
      </a>
    </li>
  `;

  paginacionHTML += `
    </ul>
    <div class="text-center text-muted">
      <small>Mostrando ${inicio}-${fin} de ${totalProductos} productos</small>
    </div>
  `;

  paginationSection.innerHTML = paginacionHTML;
}

function cambiarPagina(page) {
  if (page < 1 || page > paginacionInfo.totalPages) return;

  paginaActual = page;
  const categoriaId = categoriaActual === 'all' ? null : categoriaActual;
  cargarProductos(categoriaId, page);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== ORDENAMIENTO ====================

function configurarOrdenamiento() {
  let sortContainer = document.getElementById('sort-container');

  if (!sortContainer) {
    sortContainer = document.createElement('div');
    sortContainer.id = 'sort-container';
    sortContainer.className = 'mb-3 d-flex justify-content-end';
    sortContainer.innerHTML = `
      <select class="form-select" id="sort-select" style="max-width: 250px;">
        <option value="nombre-asc">Nombre (A-Z)</option>
        <option value="nombre-desc">Nombre (Z-A)</option>
        <option value="precio-asc">Precio (Menor a Mayor)</option>
        <option value="precio-desc">Precio (Mayor a Menor)</option>
        <option value="fecha_creacion-desc">Más Recientes</option>
        <option value="fecha_creacion-asc">Más Antiguos</option>
      </select>
    `;

    const mainContent = document.querySelector('.main-content');
    const productosContainer = document.getElementById('productos-container');
    if (productosContainer && mainContent) {
      mainContent.insertBefore(sortContainer, productosContainer);
    }
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      ordenActual = e.target.value;
      mostrarProductosPorCategoria(categoriaActual);
    });
  }
}

// ==================== CARRITO ====================

function agregarAlCarrito(productoId) {
  let producto = productos.find(p => p.id === productoId);

  if (!producto) {
    producto = todosLosProductos.find(p => p.id === productoId);
  }

  if (!producto) {
    mostrarAlerta('Producto no encontrado', 'danger');
    return;
  }

  if (!producto.activo) {
    mostrarAlerta('Este producto no está disponible', 'warning');
    return;
  }

  if (producto.maneja_colores && producto.colores_disponibles.length > 0) {
    productoParaAgregar = producto;
    mostrarModalColores(producto);
  } else {
    agregarProductoAlCarrito(producto, null);
  }
}

function mostrarModalColores(producto) {
  const colorOptions = document.getElementById('color-options');

  colorOptions.innerHTML = producto.colores_disponibles.map(color => `
    <button class="btn btn-outline-secondary d-flex align-items-center gap-2" 
            onclick="seleccionarColor(${color.id}, '${color.nombre}', '${color.codigo_hex}')">
      <span class="color-circle" style="width: 30px; height: 30px; border-radius: 50%; 
            background-color: ${color.codigo_hex}; border: 2px solid #ddd;"></span>
      <span>${color.nombre}</span>
    </button>
  `).join('');

  colorModal.show();
}

function seleccionarColor(colorId, colorNombre, colorHex) {
  agregarProductoAlCarrito(productoParaAgregar, {
    id: colorId,
    nombre: colorNombre,
    hex: colorHex
  });
  colorModal.hide();
  productoParaAgregar = null;
}

function agregarProductoAlCarrito(producto, color) {
  let carrito = obtenerCarrito();

  const item = {
    producto_id: producto.id,
    nombre: producto.nombre,
    marca: producto.marca,
    tamano: producto.tamano,
    precio: producto.precio,
    imagen_url: producto.imagen_url,
    color: color,
    cantidad: 1
  };

  const indiceExistente = carrito.findIndex(i => 
    i.producto_id === item.producto_id && 
    ((!i.color && !item.color) || (i.color && item.color && i.color.id === item.color.id))
  );

  if (indiceExistente !== -1) {
    carrito[indiceExistente].cantidad++;
  } else {
    carrito.push(item);
  }

  guardarCarrito(carrito);
  actualizarBadgeCarrito();

  const mensaje = color 
    ? `${producto.nombre} (${color.nombre}) agregado al carrito` 
    : `${producto.nombre} agregado al carrito`;
  mostrarAlerta(mensaje, 'success');
}

function obtenerCarrito() {
  const carritoStr = localStorage.getItem('carrito');
  return carritoStr ? JSON.parse(carritoStr) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarBadgeCarrito() {
  const carrito = obtenerCarrito();
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  if (totalItems > 0) {
    cartBadge.textContent = totalItems;
    cartBadge.style.display = 'inline-block';
  } else {
    cartBadge.style.display = 'none';
  }
}

// ==================== BÚSQUEDA ====================

function configurarBusqueda() {
  searchInput.addEventListener('input', async (e) => {
    const termino = e.target.value.trim();
    clearTimeout(searchTimeout);

    if (termino === '') {
      clearSearchBtn.style.display = 'none';
      limpiarBusqueda();
      return;
    }

    clearSearchBtn.style.display = 'block';
    if (termino.length < 2) return;

    searchTimeout = setTimeout(async () => {
      const resultados = await buscarProductos(termino);
      mostrarResultadosBusqueda(resultados, termino);
    }, 300);
  });

  clearSearchBtn.addEventListener('click', () => {
    clearTimeout(searchTimeout);
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    limpiarBusqueda();
  });

  const searchInputMobile = document.getElementById('search-input-mobile');
  const clearSearchMobile = document.getElementById('clear-search-mobile');

  if (searchInputMobile) {
    searchInputMobile.addEventListener('input', async (e) => {
      const termino = e.target.value.trim();
      clearTimeout(searchTimeout);

      if (termino === '') {
        clearSearchMobile.style.display = 'none';
        limpiarBusqueda();
        return;
      }

      clearSearchMobile.style.display = 'block';
      if (termino.length < 2) return;

      searchTimeout = setTimeout(async () => {
        const resultados = await buscarProductos(termino);
        mostrarResultadosBusqueda(resultados, termino);
      }, 300);
    });

    clearSearchMobile.addEventListener('click', () => {
      clearTimeout(searchTimeout);
      searchInputMobile.value = '';
      clearSearchMobile.style.display = 'none';
      limpiarBusqueda();
    });
  }
}

// BUSQUEDA AVANZADA CON COINCIDENCIAS MANEJANDO ERRORES ORTOGRAFICOS, ORDEN DE PALABRAS, ESPACIOS EN BLANCO, ETC.

// Función para calcular distancia de Levenshtein (similitud entre strings)
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

// Normaliza texto: elimina acentos, convierte a minúsculas
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Calcula similitud entre dos strings (0-1, donde 1 es idéntico)
function calculateSimilarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
}

// Verifica si hay coincidencia fuzzy entre query y texto
function fuzzyMatch(query, text, threshold = 0.7) {
  const queryNorm = normalizeText(query);
  const textNorm = normalizeText(text);

  // Coincidencia exacta
  if (textNorm.includes(queryNorm)) return 1;

  // Buscar coincidencias parciales con similitud
  const words = textNorm.split(/\s+/);
  let bestMatch = 0;

  for (const word of words) {
    const similarity = calculateSimilarity(queryNorm, word);
    if (similarity > bestMatch) {
      bestMatch = similarity;
    }
  }

  return bestMatch >= threshold ? bestMatch : 0;
}

// Función principal de búsqueda mejorada
async function buscarProductos(query, opciones = {}) {
  const {
    umbralSimilitud = 0.6,  // Qué tan estricta es la búsqueda (0-1)
    limiteResultados = 50,   // Máximo de resultados
    ordenarPorRelevancia = true
  } = opciones;

  if (!query || query.trim().length === 0) {
    return todosLosProductos;
  }

  // Dividir query en palabras individuales
  const queryTokens = normalizeText(query).split(/\s+/).filter(t => t.length > 0);

  // Calcular puntuación para cada producto
  const resultadosConPuntuacion = todosLosProductos.map(producto => {
    let puntuacion = 0;
    let coincidencias = [];

    // Buscar en nombre (peso mayor)
    for (const token of queryTokens) {
      const matchNombre = fuzzyMatch(token, producto.nombre, umbralSimilitud);
      if (matchNombre > 0) {
        puntuacion += matchNombre * 3; // Peso 3x para nombre
        coincidencias.push(`nombre: ${token}`);
      }
    }

    // Buscar en marca (peso medio)
    if (producto.marca) {
      for (const token of queryTokens) {
        const matchMarca = fuzzyMatch(token, producto.marca, umbralSimilitud);
        if (matchMarca > 0) {
          puntuacion += matchMarca * 2; // Peso 2x para marca
          coincidencias.push(`marca: ${token}`);
        }
      }
    }

    // Buscar en tamaño
    if (producto.tamano) {
      for (const token of queryTokens) {
        const matchTamano = fuzzyMatch(token, producto.tamano, umbralSimilitud);
        if (matchTamano > 0) {
          puntuacion += matchTamano * 1.5;
          coincidencias.push(`tamaño: ${token}`);
        }
      }
    }



    // Buscar en categorías
    if (producto.categorias && Array.isArray(producto.categorias)) {
      for (const categoria of producto.categorias) {
        const nombreCategoria = categoria.nombre || categoria;
        for (const token of queryTokens) {
          const matchCategoria = fuzzyMatch(token, nombreCategoria, umbralSimilitud);
          if (matchCategoria > 0) {
            puntuacion += matchCategoria * 1.5;
            coincidencias.push(`categoría: ${token}`);
          }
        }
      }
    }



    return {
      producto,
      puntuacion,
      coincidencias: [...new Set(coincidencias)] // Eliminar duplicados
    };
  });

  // Filtrar productos con puntuación > 0
  let resultados = resultadosConPuntuacion
    .filter(item => item.puntuacion > 0);

  // Ordenar por relevancia si está activado
  if (ordenarPorRelevancia) {
    resultados.sort((a, b) => b.puntuacion - a.puntuacion);
  }

  // Limitar resultados
  resultados = resultados.slice(0, limiteResultados);

  // Retornar solo los productos (sin metadata de puntuación)
  return resultados.map(item => item.producto);
}

// =============================================================================
// IMPLEMENTACIÓN EN TU APP
// =============================================================================

// OPCIÓN 1: Reemplazar tu función actual (Recomendado)
// Simplemente reemplaza tu función buscarProductos() actual con esta versión mejorada
// Será compatible con tu código existente ya que tiene la misma firma

// OPCIÓN 2: Usar configuración óptima para máxima precisión
async function buscarProductosOptimizado(query) {
  return buscarProductos(query, {
    umbralSimilitud: 0.75,     // Alta precisión, mínimos falsos positivos
    limiteResultados: 100,      // Ajusta según necesites
    ordenarPorRelevancia: true  // Los mejores resultados primero
  });
}

// =============================================================================
// EJEMPLOS PRÁCTICOS DE USO
// =============================================================================

// Ejemplo 1: En un componente de búsqueda
async function handleSearch(queryUsuario) {
  try {
    const resultados = await buscarProductos(queryUsuario);
    console.log(`Encontrados ${resultados.length} productos`);
    return resultados;
  } catch (error) {
    console.error('Error en búsqueda:', error);
    return [];
  }
}

// Ejemplo 2: Con debounce para búsqueda en tiempo real
let timeoutBusqueda;
function buscarConDebounce(query, callback) {
  clearTimeout(timeoutBusqueda);
  timeoutBusqueda = setTimeout(async () => {
    const resultados = await buscarProductos(query, {
      umbralSimilitud: 0.7,
      limiteResultados: 50
    });
    callback(resultados);
  }, 300); // Espera 300ms después de que el usuario deje de escribir
}

// Ejemplo 3: Búsqueda con feedback al usuario
async function buscarConFeedback(query) {
  if (!query || query.trim().length < 2) {
    return { 
      resultados: [], 
      mensaje: 'Escribe al menos 2 caracteres' 
    };
  }

  const resultados = await buscarProductos(query, {
    umbralSimilitud: 0.7
  });

  if (resultados.length === 0) {
    // Si no hay resultados, intenta búsqueda más permisiva
    const resultadosPermisivos = await buscarProductos(query, {
      umbralSimilitud: 0.5
    });

    if (resultadosPermisivos.length > 0) {
      return {
        resultados: resultadosPermisivos,
        mensaje: `Mostrando resultados similares a "${query}"`
      };
    }

    return {
      resultados: [],
      mensaje: `No se encontraron productos para "${query}"`
    };
  }

  return {
    resultados,
    mensaje: `${resultados.length} producto(s) encontrado(s)`
  };
}

// =============================================================================
// CASOS QUE AHORA FUNCIONARÁN
// =============================================================================
/*
Estos ejemplos ahora encontrarán productos correctamente:

❌ Antes (tu código antiguo) → ✅ Ahora (código mejorado)

"coca kola"         → Encuentra "Coca Cola"
"cola coca"         → Encuentra "Coca Cola"
"cooca"             → Encuentra "Coca Cola"
"acee limon"        → Encuentra "Aceite Limón"
"leche entera"      → Encuentra "Leche Entera" (cualquier orden)
"pan integral"      → Encuentra "Pan Integral"
"arroz largo grano" → Encuentra productos aunque esté en diferente orden
*/

function mostrarResultadosBusqueda(resultados, termino = '') {
  const searchBanner = document.getElementById('search-banner');
  const searchCount = document.getElementById('search-count');
  const searchTerm = document.getElementById('search-term');

  loading.style.display = 'none';
  productosContainer.innerHTML = '';
  productosContainer.style.display = 'flex';
  noProductos.style.display = 'none';

  ocultarPaginacion();

  searchCount.textContent = resultados.length;
  searchTerm.textContent = termino;
  searchBanner.style.setProperty('display', 'flex', 'important');

  if (resultados.length === 0) {
    noProductos.style.display = 'block';
    document.getElementById('no-productos-texto').textContent =
      `No se encontraron resultados para "${termino}"`;
    return;
  }

  // ⭐ IMPORTANTE: NO ordenar alfabéticamente aquí
  // Los resultados ya vienen ordenados por relevancia desde buscarProductos()
  
  // Renderizar directamente sin reordenar
  productosContainer.innerHTML = resultados.map((producto, index) => {
    const estaAgotado = !producto.activo;
    const imagenUrl = producto.imagen_url
      ? (producto.imagen_url.startsWith('http')
          ? producto.imagen_url
          : `${API_URL}${producto.imagen_url}`)
      : 'https://via.placeholder.com/300x300?text=Sin+Imagen';

    const categoriasHtml = producto.categorias && producto.categorias.length > 0
      ? `<p class="text-muted small mb-1">
           <i class="fas fa-tag"></i>
           ${producto.categorias.map(c => c.nombre).join(', ')}
         </p>`
      : '';

    return `
      <div class="col-6 col-md-4 col-lg-3" style="animation-delay: ${index * 0.05}s">
        <div class="card producto-card h-100 ${estaAgotado ? '' : 'producto-card-clickable'} ${estaAgotado ? 'producto-agotado' : ''}"
             ${estaAgotado ? '' : `onclick="mostrarProductoModal(${JSON.stringify(producto).replace(/"/g, '&quot;')})"`}>
          
          ${estaAgotado ? '<span class="badge-agotado">AGOTADO</span>' : ''}
          
          <img src="${imagenUrl}" class="card-img-top"
               alt="${producto.nombre}" loading="lazy">

          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${producto.nombre}</h5>

            ${producto.marca
              ? `<p class="text-muted small mb-1"><strong>Marca:</strong> ${producto.marca}</p>`
              : ''}

            ${producto.tamano
              ? `<p class="text-muted small mb-1"><strong>Tamaño:</strong> ${producto.tamano}</p>`
              : ''}

            ${categoriasHtml}

            <p class="card-text text-primary fw-bold fs-4 mb-2 mt-auto">
              ${formatearPrecio(producto.precio)}
            </p>

            ${producto.maneja_colores && producto.colores_disponibles?.length > 0
              ? `<p class="small text-muted mb-2">
                   <i class="fas fa-palette"></i>
                   ${producto.colores_disponibles.length} colores disponibles
                 </p>`
              : ''}

            <button class="btn btn-primary mt-auto"
                    ${estaAgotado ? 'disabled' : ''}
                    onclick="event.stopPropagation(); ${estaAgotado ? '' : `agregarAlCarrito(${producto.id})`}">
              <i class="fas fa-${estaAgotado ? 'times-circle' : 'cart-plus'} me-1"></i> 
              ${estaAgotado ? 'No disponible' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function limpiarBusqueda() {
  const searchBanner = document.getElementById('search-banner');
  const searchInputMobile = document.getElementById('search-input-mobile');
  const clearSearchMobile = document.getElementById('clear-search-mobile');

  searchBanner.style.display = 'none';
  searchBanner.style.setProperty('display', 'none', 'important');

  noProductos.style.display = 'none';
  productosContainer.innerHTML = '';
  productosContainer.style.display = 'none';

  searchInput.value = '';
  clearSearchBtn.style.display = 'none';

  if (searchInputMobile) {
    searchInputMobile.value = '';
  }
  if (clearSearchMobile) {
    clearSearchMobile.style.display = 'none';
  }

  mostrarPaginacion();

  mostrarProductosPorCategoria(categoriaActual);
}

// ==================== UTILIDADES ====================

function ocultarPaginacion() {
  const paginationSection = document.getElementById('pagination-section');
  const sortContainer = document.getElementById('sort-container');

  if (paginationSection) {
    paginationSection.style.display = 'none';
  }
  if (sortContainer) {
    sortContainer.style.display = 'none';
  }
}

function mostrarPaginacion() {
  const sortContainer = document.getElementById('sort-container');

  if (sortContainer) {
    sortContainer.style.display = 'flex';
  }
}

function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(precio);
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

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

// Función para toggle del sidebar
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar-filters');
  const overlay = document.querySelector('.sidebar-overlay');

  if (sidebar && overlay) {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  }
}

// Función para limpiar filtros
function limpiarFiltros() {
  categoriaActual = 'all';

  categoryFilters.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('active');
  });
  const btnTodos = categoryFilters.querySelector('[data-category="all"]');
  if (btnTodos) {
    btnTodos.classList.add('active');
  }

  mostrarProductosPorCategoria('all');

  if (window.innerWidth < 992) {
    toggleSidebar();
  }
}

// Función para limpiar búsqueda y filtros
function limpiarBusquedaYFiltros() {
  searchInput.value = '';
  const searchInputMobile = document.getElementById('search-input-mobile');
  if (searchInputMobile) {
    searchInputMobile.value = '';
  }

  clearSearchBtn.style.display = 'none';
  const clearSearchMobile = document.getElementById('clear-search-mobile');
  if (clearSearchMobile) {
    clearSearchMobile.style.display = 'none';
  }

  const searchBanner = document.getElementById('search-banner');
  searchBanner.style.display = 'none';

  limpiarFiltros();
}

// Hacer las funciones globales
window.toggleSidebar = toggleSidebar;
window.limpiarFiltros = limpiarFiltros;
window.limpiarBusquedaYFiltros = limpiarBusquedaYFiltros;