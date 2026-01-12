// ==================== CARRITO LATERAL ====================

const datosModal = new bootstrap.Modal(document.getElementById('datosModal'));

// Toggle carrito offcanvas
function toggleCarrito() {
  const carrito = document.getElementById('carrito-offcanvas');
  const overlay = document.getElementById('carrito-overlay');
  
  carrito.classList.toggle('active');
  overlay.classList.toggle('active');
  
  // Cargar items del carrito cuando se abre
  if (carrito.classList.contains('active')) {
    renderizarCarrito();
  }
}

// Toggle sidebar filtros (móvil)
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar-filters');
  const overlay = document.querySelector('.sidebar-overlay');
  
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

// Renderizar carrito
function renderizarCarrito() {
  const carrito = obtenerCarrito();
  const carritoVacio = document.getElementById('carrito-vacio');
  const carritoItems = document.getElementById('carrito-items');
  const carritoFooter = document.getElementById('carrito-footer');
  
  if (carrito.length === 0) {
    carritoVacio.style.display = 'block';
    carritoItems.style.display = 'none';
    carritoFooter.style.display = 'none';
    return;
  }
  
  carritoVacio.style.display = 'none';
  carritoItems.style.display = 'block';
  carritoFooter.style.display = 'block';
  
  // Renderizar items
  carritoItems.innerHTML = carrito.map((item, index) => {
    // ✅ Detectar si es Cloudinary o local
    const imgCarrito = item.imagen_url 
      ? (item.imagen_url.startsWith('http') 
          ? item.imagen_url 
          : `http://localhost:3000${item.imagen_url}`)
      : 'https://via.placeholder.com/70x70?text=Sin+Imagen';
    
    const colorInfo = item.color 
      ? `<div class="d-flex align-items-center gap-2 mb-1">
           <span style="width: 15px; height: 15px; background: ${item.color.hex}; 
                 border-radius: 50%; border: 2px solid #ddd; display: inline-block;"></span>
           <small class="text-muted">${item.color.nombre}</small>
         </div>`
      : '';
    
    const detalles = [];
    if (item.marca) detalles.push(item.marca);
    if (item.tamano) detalles.push(item.tamano);
    const detallesText = detalles.length > 0 ? detalles.join(' • ') : '';
    
    return `
      <div class="carrito-item">
        <img src="${imgCarrito}" alt="${item.nombre}">
        <div class="carrito-item-info">
          <div class="carrito-item-name">${item.nombre}</div>
          ${detallesText ? `<div class="carrito-item-details">${detallesText}</div>` : ''}
          ${colorInfo}
          <div class="carrito-item-price">${formatearPrecio(item.precio)}</div>
          <div class="carrito-item-actions">
            <button class="qty-btn" onclick="cambiarCantidad(${index}, -1)">
              <i class="fas fa-minus"></i>
            </button>
            <span class="qty-display">${item.cantidad}</span>
            <button class="qty-btn" onclick="cambiarCantidad(${index}, 1)">
              <i class="fas fa-plus"></i>
            </button>
            <button class="btn-remove" onclick="eliminarDelCarrito(${index})" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Calcular y mostrar total
  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  document.getElementById('total-carrito').textContent = formatearPrecio(total);
}

// Cambiar cantidad de un producto
function cambiarCantidad(index, cambio) {
  let carrito = obtenerCarrito();
  
  if (carrito[index]) {
    carrito[index].cantidad += cambio;
    
    // Si la cantidad es 0 o menos, eliminar el item
    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    }
    
    guardarCarrito(carrito);
    renderizarCarrito();
    actualizarBadgeCarrito();
  }
}

// Eliminar producto del carrito
function eliminarDelCarrito(index) {
  let carrito = obtenerCarrito();
  carrito.splice(index, 1);
  guardarCarrito(carrito);
  renderizarCarrito();
  actualizarBadgeCarrito();
  mostrarAlerta('Producto eliminado del carrito', 'info');
}

// Vaciar carrito completamente
function vaciarCarrito() {
  if (confirm('¿Estás seguro de vaciar el carrito?')) {
    localStorage.removeItem('carrito');
    renderizarCarrito();
    actualizarBadgeCarrito();
    mostrarAlerta('Carrito vaciado', 'info');
  }
}

// Limpiar filtros
function limpiarFiltros() {
  const botones = document.querySelectorAll('.category-item');
  botones.forEach(btn => btn.classList.remove('active'));
  document.querySelector('[data-category="all"]').classList.add('active');
  categoriaActual = 'all';
  cargarProductos();
}

// Mostrar modal de datos para WhatsApp
// Mostrar modal de datos para WhatsApp (cerrar carrito primero)
function mostrarModalDatos() {
  const carrito = obtenerCarrito();
  
  if (carrito.length === 0) {
    mostrarAlerta('Tu carrito está vacío', 'warning');
    return;
  }
  
  // ✅ CERRAR EL CARRITO ANTES DE ABRIR EL MODAL
  const carritoOffcanvas = document.getElementById('carrito-offcanvas');
  const carritoOverlay = document.getElementById('carrito-overlay');
  
  if (carritoOffcanvas.classList.contains('active')) {
    carritoOffcanvas.classList.remove('active');
    carritoOverlay.classList.remove('active');
  }
  
  // Pequeño delay para que la animación de cierre sea suave
  setTimeout(() => {
    datosModal.show();
  }, 300);
}

// Script para detectar scroll en tabla admin (agregar donde se use)
document.addEventListener('DOMContentLoaded', function() {
  const tableResponsive = document.querySelector('.table-responsive');
  if (tableResponsive) {
    tableResponsive.addEventListener('scroll', function() {
      if (this.scrollLeft > 10) {
        this.classList.add('scrolled');
      } else {
        this.classList.remove('scrolled');
      }
    }, { passive: true });
  }
});

// Enviar pedido por WhatsApp
function enviarPorWhatsApp() {
  const nombre = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const direccion = document.getElementById('direccion').value.trim();
  const barrio = document.getElementById('barrio').value.trim();
  const referencia = document.getElementById('referencia')?.value.trim() || '';
  const pago = document.querySelector('input[name="pago"]:checked')?.value || 'Efectivo';
  const comentarios = document.getElementById('comentarios')?.value.trim() || '';
  
  // Validaciones
  if (!nombre || !telefono || !direccion || !barrio) {
    mostrarAlerta('Por favor completa todos los campos obligatorios', 'warning');
    return;
  }
  
  // Validar formato de teléfono (10 dígitos)
  if (!/^[0-9]{10}$/.test(telefono)) {
    mostrarAlerta('El teléfono debe tener 10 dígitos', 'warning');
    return;
  }
  
  const carrito = obtenerCarrito();
  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  
  // Construir mensaje de WhatsApp
  let mensaje = `╔═══════════════════════════════╗\n`;
  mensaje += `║     🛍️ *NUEVO PEDIDO*     ║\n`;
  mensaje += `║         *Gabisuteria*    ║\n`;
  mensaje += `╚═══════════════════════════════╝\n\n`;
  
  mensaje += `📋 *DATOS DEL CLIENTE*\n`;
  mensaje += `━━━━━━━━━━━━━━━━━━━━━\n`;
  mensaje += `👤 *Nombre:* ${nombre}\n`;
  mensaje += `📱 *Teléfono:* ${telefono}\n`;
  mensaje += `\n`;
  
  mensaje += `📍 *DIRECCIÓN DE ENTREGA*\n`;
  mensaje += `━━━━━━━━━━━━━━━━━━━━━\n`;
  mensaje += `📮 ${direccion}\n`;
  mensaje += `🏘️ *Barrio:* ${barrio}\n`;
  mensaje += `📌 *Ciudad:* Valledupar, Cesar\n`;
  if (referencia) {
    mensaje += `🗺️ *Referencia:* ${referencia}\n`;
  }
  mensaje += `\n`;
  
  mensaje += `📦 *PRODUCTOS SOLICITADOS*\n`;
  mensaje += `━━━━━━━━━━━━━━━━━━━━━\n`;
  
  carrito.forEach((item, i) => {
    const colorInfo = item.color ? ` (Color: ${item.color.nombre})` : '';
    const detalles = [];
    if (item.marca) detalles.push(item.marca);
    if (item.tamano) detalles.push(item.tamano);
    const detallesText = detalles.length > 0 ? `\n   📝 ${detalles.join(' • ')}` : '';
    
    mensaje += `\n${i + 1}. *${item.nombre}*${colorInfo}${detallesText}\n`;
    mensaje += `   💰 ${formatearPrecio(item.precio)} x ${item.cantidad} = *${formatearPrecio(item.precio * item.cantidad)}*\n`;
  });
  
  mensaje += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  mensaje += `💳 *Método de pago:* ${pago}\n`;
  mensaje += `━━━━━━━━━━━━━━━━━━━━━\n`;
  mensaje += `💵 *TOTAL A PAGAR: ${formatearPrecio(total)}*\n`;
  mensaje += `━━━━━━━━━━━━━━━━━━━━━\n`;
  
  if (comentarios) {
    mensaje += `\n💬 *Comentarios:*\n${comentarios}\n`;
  }
  
  mensaje += `\n⏰ Fecha: ${new Date().toLocaleString('es-CO', { 
    dateStyle: 'short', 
    timeStyle: 'short' 
  })}\n`;
  
  // Número de WhatsApp
  const numeroWhatsApp = '573042972951';
  
  // Codificar mensaje para URL
  const mensajeCodificado = encodeURIComponent(mensaje);
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
  
  // Abrir WhatsApp
  window.open(urlWhatsApp, '_blank');
  
  // Cerrar modal
  datosModal.hide();
  
  // Mostrar confirmación
  mostrarAlerta('¡Pedido enviado a WhatsApp! Te contactaremos pronto. 🎉', 'success');
  
  // Limpiar formulario
  document.getElementById('form-datos').reset();
}

// Configurar búsqueda móvil
document.addEventListener('DOMContentLoaded', () => {
  const mobileSearchBtn = document.getElementById('mobile-search-btn');
  const mobileSearchBar = document.getElementById('mobile-search-bar');
  const searchInputMobile = document.getElementById('search-input-mobile');
  const clearSearchMobile = document.getElementById('clear-search-mobile');
  const searchResultsMobile = document.getElementById('search-results-mobile');
  
  if (mobileSearchBtn && mobileSearchBar) {
    mobileSearchBtn.addEventListener('click', () => {
      const isVisible = mobileSearchBar.style.display === 'block';
      mobileSearchBar.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        searchInputMobile.focus();
      }
    });
    
    // Búsqueda móvil
    searchInputMobile.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearSearchMobile.style.display = query ? 'block' : 'none';
      
      if (query.length < 2) {
        searchResultsMobile.style.display = 'none';
        return;
      }
      
      buscarProductosLocal(query, searchResultsMobile);
    });
    
    clearSearchMobile.addEventListener('click', () => {
      searchInputMobile.value = '';
      clearSearchMobile.style.display = 'none';
      searchResultsMobile.style.display = 'none';
    });
  }
});

// Búsqueda local para móvil
function buscarProductosLocal(query, resultsContainer) {
  const queryLower = query.toLowerCase();
  
  const resultados = productos.filter(producto => {
    const nombreMatch = producto.nombre.toLowerCase().includes(queryLower);
    const marcaMatch = producto.marca && producto.marca.toLowerCase().includes(queryLower);
    const categoriasMatch = producto.categorias && producto.categorias.some(c => 
      c.nombre.toLowerCase().includes(queryLower)
    );
    const tamanoMatch = producto.tamano && producto.tamano.toLowerCase().includes(queryLower);
    
    return nombreMatch || marcaMatch || categoriasMatch || tamanoMatch;
  });
  
  if (resultados.length === 0) {
    resultsContainer.innerHTML = `
      <div class="list-group-item text-muted text-center">
        <i class="fas fa-search"></i> No se encontraron resultados
      </div>
    `;
    resultsContainer.style.display = 'block';
    return;
  }
  
  resultsContainer.innerHTML = resultados.map(producto => {
    // ✅ Detectar si es Cloudinary o local en búsqueda móvil
    const imgBusqueda = producto.imagen_url 
      ? (producto.imagen_url.startsWith('http') 
          ? producto.imagen_url 
          : `http://localhost:3000${producto.imagen_url}`)
      : 'https://via.placeholder.com/50x50?text=Sin+Imagen';
    
    const categorias = producto.categorias && producto.categorias.length > 0
      ? producto.categorias.map(c => c.nombre).join(', ')
      : 'Sin categoría';
    
    return `
      <a href="#" class="list-group-item list-group-item-action" onclick="seleccionarProductoBuscado(${producto.id}); return false;">
        <div class="d-flex align-items-center">
          <img src="${imgBusqueda}" alt="${producto.nombre}" 
               style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" class="me-3">
          <div class="flex-grow-1">
            <h6 class="mb-0">${producto.nombre}</h6>
            <small class="text-muted">
              ${producto.marca ? producto.marca + ' | ' : ''}
              ${categorias}
            </small>
          </div>
          <strong class="text-primary">${formatearPrecio(producto.precio)}</strong>
        </div>
      </a>
    `;
  }).join('');
  
  resultsContainer.style.display = 'block';
}

// Cerrar overlays al presionar ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const carrito = document.getElementById('carrito-offcanvas');
    const carritoOverlay = document.getElementById('carrito-overlay');
    const sidebar = document.querySelector('.sidebar-filters');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    if (carrito.classList.contains('active')) {
      toggleCarrito();
    }
    
    if (sidebar.classList.contains('active')) {
      toggleSidebar();
    }
  }
});