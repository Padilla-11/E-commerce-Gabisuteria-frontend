/* ==================== SISTEMA DE FILTROS ADMIN ====================
   Filtros avanzados para tablas del panel administrativo
   ============================================================== */

class AdminFilters {
  constructor(allData, renderCallback, paginationInstance = null) {
    this.allData = allData;
    this.filteredData = [...allData];
    this.renderCallback = renderCallback;
    this.paginationInstance = paginationInstance;
    
    // Estado de filtros
    this.filters = {
      search: '',
      sort: 'newest', // newest, oldest, name-asc, name-desc, price-asc, price-desc
      category: 'all',
      status: 'all', // all, active, inactive
      priceRange: { min: 0, max: Infinity }
    };
  }

  /**
   * Aplica todos los filtros
   */
  applyFilters() {
    let data = [...this.allData];

    // 1. Filtro de búsqueda
    if (this.filters.search) {
      data = this.filterBySearch(data, this.filters.search);
    }

    // 2. Filtro por categoría
    if (this.filters.category && this.filters.category !== 'all') {
      data = this.filterByCategory(data, this.filters.category);
    }

    // 3. Filtro por estado
    if (this.filters.status && this.filters.status !== 'all') {
      data = this.filterByStatus(data, this.filters.status);
    }

    // 4. Filtro por rango de precio
    if (this.filters.priceRange) {
      data = this.filterByPriceRange(data, this.filters.priceRange);
    }

    // 5. Ordenamiento
    data = this.sortData(data, this.filters.sort);

    this.filteredData = data;
    this.updateView();
    
    return data;
  }

  /**
   * Filtro por búsqueda (nombre, marca, categorías)
   */
  filterBySearch(data, query) {
    const searchLower = query.toLowerCase().trim();
    
    return data.filter(item => {
      const nombreMatch = item.nombre?.toLowerCase().includes(searchLower);
      const marcaMatch = item.marca?.toLowerCase().includes(searchLower);
      const categoriasMatch = item.categorias?.some(c => 
        c.nombre?.toLowerCase().includes(searchLower)
      );
      
      // Para colores, administradores, etc
      const emailMatch = item.email?.toLowerCase().includes(searchLower);
      const codigoMatch = item.codigo_hex?.toLowerCase().includes(searchLower);
      
      return nombreMatch || marcaMatch || categoriasMatch || emailMatch || codigoMatch;
    });
  }

  /**
   * Filtro por categoría
   */
  filterByCategory(data, categoryId) {
    return data.filter(item => {
      if (!item.categorias) return true;
      return item.categorias.some(c => c.id === parseInt(categoryId));
    });
  }

  /**
   * Filtro por estado (activo/inactivo)
   */
  filterByStatus(data, status) {
    if (status === 'active') {
      return data.filter(item => item.activo === 1 || item.activo === true);
    } else if (status === 'inactive') {
      return data.filter(item => item.activo === 0 || item.activo === false);
    }
    return data;
  }

  /**
   * Filtro por rango de precio
   */
  filterByPriceRange(data, range) {
    return data.filter(item => {
      const precio = parseFloat(item.precio) || 0;
      return precio >= range.min && precio <= range.max;
    });
  }

  /**
   * Ordenamiento de datos
   */
  sortData(data, sortType) {
    const sorted = [...data];

    switch (sortType) {
      case 'newest':
        // Más recientes primero (por ID descendente)
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));

      case 'oldest':
        // Más antiguos primero (por ID ascendente)
        return sorted.sort((a, b) => (a.id || 0) - (b.id || 0));

      case 'name-asc':
        // A-Z
        return sorted.sort((a, b) => {
          const nameA = (a.nombre || '').toLowerCase();
          const nameB = (b.nombre || '').toLowerCase();
          return nameA.localeCompare(nameB, 'es');
        });

      case 'name-desc':
        // Z-A
        return sorted.sort((a, b) => {
          const nameA = (a.nombre || '').toLowerCase();
          const nameB = (b.nombre || '').toLowerCase();
          return nameB.localeCompare(nameA, 'es');
        });

      case 'price-asc':
        // Precio: menor a mayor
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.precio) || 0;
          const priceB = parseFloat(b.precio) || 0;
          return priceA - priceB;
        });

      case 'price-desc':
        // Precio: mayor a menor
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.precio) || 0;
          const priceB = parseFloat(b.precio) || 0;
          return priceB - priceA;
        });

      default:
        return sorted;
    }
  }

  /**
   * Actualiza la vista con los datos filtrados
   */
  updateView() {
    if (this.paginationInstance) {
      // Si hay paginación, actualizar datos
      this.paginationInstance.updateData(this.filteredData);
    } else {
      // Si no hay paginación, renderizar directamente
      this.renderCallback(this.filteredData);
    }
  }

  /**
   * Establece el filtro de búsqueda
   */
  setSearch(query) {
    this.filters.search = query;
    this.applyFilters();
  }

  /**
   * Establece el ordenamiento
   */
  setSort(sortType) {
    this.filters.sort = sortType;
    this.applyFilters();
  }

  /**
   * Establece el filtro de categoría
   */
  setCategory(categoryId) {
    this.filters.category = categoryId;
    this.applyFilters();
  }

  /**
   * Establece el filtro de estado
   */
  setStatus(status) {
    this.filters.status = status;
    this.applyFilters();
  }

  /**
   * Establece el rango de precio
   */
  setPriceRange(min, max) {
    this.filters.priceRange = { min, max };
    this.applyFilters();
  }

  /**
   * Reinicia todos los filtros
   */
  resetFilters() {
    this.filters = {
      search: '',
      sort: 'newest',
      category: 'all',
      status: 'all',
      priceRange: { min: 0, max: Infinity }
    };
    this.applyFilters();
  }

  /**
   * Actualiza los datos base
   */
  updateData(newData) {
    this.allData = newData;
    this.applyFilters();
  }

  /**
   * Obtiene estadísticas de filtrado
   */
  getStats() {
    return {
      total: this.allData.length,
      filtered: this.filteredData.length,
      hidden: this.allData.length - this.filteredData.length
    };
  }
}

// ==================== INICIALIZACIÓN DE CONTROLES UI ====================

/**
 * Configura los controles de filtro en la UI
 */
function setupFilterControls(filterInstance, options = {}) {
  const {
    searchInputId = 'search-admin',
    sortSelectId = 'sort-select',
    categorySelectId = 'category-filter',
    statusSelectId = 'status-filter',
    priceMinId = 'price-min',
    priceMaxId = 'price-max',
    resetBtnId = 'reset-filters-btn',
    showStats = true
  } = options;

  // 1. Búsqueda
  const searchInput = document.getElementById(searchInputId);
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      filterInstance.setSearch(e.target.value);
      updateFilterStats(filterInstance, showStats);
    }, 300));
  }

  // 2. Ordenamiento
  const sortSelect = document.getElementById(sortSelectId);
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      filterInstance.setSort(e.target.value);
      updateFilterStats(filterInstance, showStats);
    });
  }

  // 3. Categoría
  const categorySelect = document.getElementById(categorySelectId);
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      filterInstance.setCategory(e.target.value);
      updateFilterStats(filterInstance, showStats);
    });
  }

  // 4. Estado
  const statusSelect = document.getElementById(statusSelectId);
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      filterInstance.setStatus(e.target.value);
      updateFilterStats(filterInstance, showStats);
    });
  }

  // 5. Rango de precio
  const priceMin = document.getElementById(priceMinId);
  const priceMax = document.getElementById(priceMaxId);
  
  if (priceMin && priceMax) {
    const applyPriceFilter = debounce(() => {
      const min = parseFloat(priceMin.value) || 0;
      const max = parseFloat(priceMax.value) || Infinity;
      filterInstance.setPriceRange(min, max);
      updateFilterStats(filterInstance, showStats);
    }, 500);

    priceMin.addEventListener('input', applyPriceFilter);
    priceMax.addEventListener('input', applyPriceFilter);
  }

  // 6. Botón resetear
  const resetBtn = document.getElementById(resetBtnId);
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      filterInstance.resetFilters();
      
      // Resetear valores de UI
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'newest';
      if (categorySelect) categorySelect.value = 'all';
      if (statusSelect) statusSelect.value = 'all';
      if (priceMin) priceMin.value = '';
      if (priceMax) priceMax.value = '';
      
      updateFilterStats(filterInstance, showStats);
      
      LoadingUtils.showToast('info', 'Filtros reseteados', 'Mostrando todos los resultados');
    });
  }
}

/**
 * Actualiza las estadísticas de filtrado en la UI
 */
function updateFilterStats(filterInstance, show = true) {
  if (!show) return;

  const stats = filterInstance.getStats();
  const statsContainer = document.getElementById('filter-stats');
  
  if (statsContainer) {
    if (stats.hidden > 0) {
      statsContainer.innerHTML = `
        <div class="alert alert-info alert-dismissible fade show mb-3" role="alert">
          <i class="fas fa-filter"></i>
          <strong>Filtros activos:</strong> Mostrando ${stats.filtered} de ${stats.total} resultados
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
    } else {
      statsContainer.innerHTML = '';
    }
  }
}

/**
 * Genera opciones de categorías para un select
 */
function generateCategoryOptions(categorias) {
  return `
    <option value="all">Todas las categorías</option>
    ${categorias.map(cat => `
      <option value="${cat.id}">${cat.nombre}</option>
    `).join('')}
  `;
}

/**
 * Función debounce reutilizable
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Exportar para uso global
window.AdminFilters = AdminFilters;
window.setupFilterControls = setupFilterControls;
window.generateCategoryOptions = generateCategoryOptions;