/* ==================== UTILIDADES DE LOADING ====================
   Sistema centralizado para gestionar estados de carga
   ========================================================== */

const LoadingUtils = {
  // ==================== OVERLAY GLOBAL ====================
  
  /**
   * Muestra overlay de carga global
   * @param {string} message - Mensaje principal
   * @param {string} submessage - Mensaje secundario (opcional)
   */
  showOverlay(message = 'Procesando...', submessage = 'Por favor espera') {
    // Verificar si ya existe
    let overlay = document.querySelector('.loading-overlay');
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="loading-spinner-circle"></div>
          </div>
          <div class="loading-text"></div>
          <div class="loading-subtext"></div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    
    // Actualizar textos
    overlay.querySelector('.loading-text').textContent = message;
    overlay.querySelector('.loading-subtext').textContent = submessage;
    
    // Mostrar
    setTimeout(() => overlay.classList.add('active'), 10);
  },

  /**
   * Oculta overlay de carga global
   */
  hideOverlay() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 300);
    }
  },

  // ==================== LOADING EN BOTONES ====================
  
  /**
   * Activa estado de loading en un botón
   * @param {HTMLElement} button - Elemento botón
   * @param {string} originalText - Texto original (opcional)
   */
  setButtonLoading(button, originalText = null) {
    if (!button) return;
    
    // Guardar texto original
    const text = originalText || button.innerHTML;
    button.setAttribute('data-original-text', text);
    
    // Deshabilitar y agregar clase
    button.disabled = true;
    button.classList.add('btn-loading');
    
    // Cambiar contenido
    button.innerHTML = `<span class="btn-text">${text}</span>`;
  },

  /**
   * Desactiva estado de loading en un botón
   * @param {HTMLElement} button - Elemento botón
   */
  removeButtonLoading(button) {
    if (!button) return;
    
    // Restaurar texto original
    const originalText = button.getAttribute('data-original-text');
    if (originalText) {
      button.innerHTML = originalText;
      button.removeAttribute('data-original-text');
    }
    
    // Habilitar y quitar clase
    button.disabled = false;
    button.classList.remove('btn-loading');
  },

  // ==================== ESTADOS DE FILA ====================
  
  /**
   * Marca una fila como "cargando"
   * @param {HTMLElement} row - Elemento tr
   */
  setRowLoading(row) {
    if (row) {
      row.classList.add('row-loading');
    }
  },

  /**
   * Quita estado de loading de una fila
   * @param {HTMLElement} row - Elemento tr
   */
  removeRowLoading(row) {
    if (row) {
      row.classList.remove('row-loading');
    }
  },

  /**
   * Muestra feedback visual de éxito en una fila
   * @param {HTMLElement} row - Elemento tr
   */
  showRowSuccess(row) {
    if (row) {
      row.classList.add('row-success');
      setTimeout(() => row.classList.remove('row-success'), 1500);
    }
  },

  /**
   * Muestra feedback visual de error en una fila
   * @param {HTMLElement} row - Elemento tr
   */
  showRowError(row) {
    if (row) {
      row.classList.add('row-error');
      setTimeout(() => row.classList.remove('row-error'), 1500);
    }
  },

  /**
   * Anima la eliminación de una fila
   * @param {HTMLElement} row - Elemento tr
   * @param {Function} callback - Función a ejecutar después de la animación
   */
  animateRowRemoval(row, callback) {
    if (row) {
      row.classList.add('row-removing');
      setTimeout(() => {
        if (callback) callback();
      }, 500);
    }
  },

  // ==================== SKELETON LOADERS ====================
  
  /**
   * Genera skeleton loader para tabla
   * @param {number} rows - Número de filas
   * @param {number} cols - Número de columnas
   * @returns {string} HTML del skeleton
   */
  generateTableSkeleton(rows = 5, cols = 6) {
    let skeletonHTML = '';
    
    for (let i = 0; i < rows; i++) {
      skeletonHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        let cellContent = '<div class="skeleton skeleton-text-medium"></div>';
        
        // Primera columna con imagen
        if (j === 0) {
          cellContent = '<div class="skeleton skeleton-img"></div>';
        }
        // Última columna con botones
        else if (j === cols - 1) {
          cellContent = `
            <div class="d-flex gap-2 justify-content-center">
              <div class="skeleton" style="width: 32px; height: 32px; border-radius: 6px;"></div>
              <div class="skeleton" style="width: 32px; height: 32px; border-radius: 6px;"></div>
            </div>
          `;
        }
        
        skeletonHTML += `<td>${cellContent}</td>`;
      }
      skeletonHTML += '</tr>';
    }
    
    return skeletonHTML;
  },

  /**
   * Muestra skeleton en una tabla
   * @param {string} tableId - ID de la tabla (tbody)
   * @param {number} rows - Número de filas
   * @param {number} cols - Número de columnas
   */
  showTableSkeleton(tableId, rows = 5, cols = 6) {
    const tbody = document.getElementById(tableId);
    if (tbody) {
      tbody.innerHTML = this.generateTableSkeleton(rows, cols);
    }
  },

  // ==================== TOAST NOTIFICATIONS ====================
  
  /**
   * Muestra una notificación toast
   * @param {string} type - Tipo: success, error, warning, info
   * @param {string} title - Título
   * @param {string} message - Mensaje
   * @param {number} duration - Duración en ms (0 = manual)
   */
  showToast(type = 'info', title, message, duration = 4000) {
    // Crear contenedor si no existe
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // Iconos según tipo
    const icons = {
      success: '<i class="fas fa-check-circle"></i>',
      error: '<i class="fas fa-times-circle"></i>',
      warning: '<i class="fas fa-exclamation-triangle"></i>',
      info: '<i class="fas fa-info-circle"></i>'
    };

    // Crear toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close">&times;</button>
    `;

    // Agregar al contenedor
    container.appendChild(toast);

    // Evento cerrar
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    });

    // Auto-cerrar
    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.animation = 'slideInRight 0.3s ease reverse';
          setTimeout(() => toast.remove(), 300);
        }
      }, duration);
    }

    return toast;
  },

  // ==================== HELPERS RÁPIDOS ====================
  
  /**
   * Ejecuta una operación async con loading overlay
   * @param {Function} asyncFn - Función async a ejecutar
   * @param {string} loadingMessage - Mensaje durante carga
   * @param {string} successMessage - Mensaje de éxito (opcional)
   */
  async withLoading(asyncFn, loadingMessage = 'Procesando...', successMessage = null) {
    this.showOverlay(loadingMessage);
    
    try {
      const result = await asyncFn();
      
      this.hideOverlay();
      
      if (successMessage) {
        this.showToast('success', '¡Éxito!', successMessage);
      }
      
      return result;
    } catch (error) {
      this.hideOverlay();
      this.showToast('error', 'Error', error.message || 'Ocurrió un error');
      throw error;
    }
  },

  /**
   * Wrapper para operaciones de guardado
   */
  async withSaveLoading(asyncFn) {
    return this.withLoading(asyncFn, 'Guardando...', 'Datos guardados correctamente');
  },

  /**
   * Wrapper para operaciones de eliminación
   */
  async withDeleteLoading(asyncFn) {
    return this.withLoading(asyncFn, 'Eliminando...', 'Elemento eliminado correctamente');
  },

  /**
   * Wrapper para operaciones de carga de datos
   */
  async withLoadLoading(asyncFn) {
    return this.withLoading(asyncFn, 'Cargando datos...', null);
  }
};

// ==================== CLASE DE PAGINACIÓN ====================

class TablePagination {
  constructor(containerId, data, renderFunction, options = {}) {
    this.containerId = containerId;
    this.allData = data;
    this.renderFunction = renderFunction;
    
    // Opciones
    this.itemsPerPage = options.itemsPerPage || 10;
    this.currentPage = options.currentPage || 1;
    this.paginationId = options.paginationId || `${containerId}-pagination`;
    this.showItemsPerPage = options.showItemsPerPage !== false;
    this.itemsPerPageOptions = options.itemsPerPageOptions || [5, 10, 25, 50, 100];
    
    this.init();
  }

  init() {
    this.render();
    this.createPaginationControls();
  }

  get totalPages() {
    return Math.ceil(this.allData.length / this.itemsPerPage);
  }

  get paginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.allData.slice(start, end);
  }

  render() {
    const tbody = document.getElementById(this.containerId);
    if (tbody) {
      if (this.allData.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="20" class="text-center">
              <div class="empty-state">
                <div class="empty-state-icon">
                  <i class="fas fa-inbox"></i>
                </div>
                <div class="empty-state-title">No hay datos disponibles</div>
                <div class="empty-state-text">Agrega un nuevo elemento para empezar</div>
              </div>
            </td>
          </tr>
        `;
      } else {
        this.renderFunction(this.paginatedData);
      }
    }
    this.updatePaginationControls();
  }

  createPaginationControls() {
    let container = document.getElementById(this.paginationId);
    
    if (!container) {
      // Crear contenedor después de la tabla
      const table = document.getElementById(this.containerId);
      if (table && table.closest('.card-body')) {
        container = document.createElement('div');
        container.id = this.paginationId;
        container.className = 'pagination-container';
        table.closest('.card-body').appendChild(container);
      }
    }

    if (container && this.allData.length > 0) {
      container.innerHTML = `
        <div class="pagination-info">
          Mostrando <strong>${this.getStartItem()}</strong> a <strong>${this.getEndItem()}</strong> 
          de <strong>${this.allData.length}</strong> resultados
        </div>
        
        <div class="d-flex gap-3 align-items-center flex-wrap">
          ${this.showItemsPerPage ? `
            <div class="items-per-page">
              <label for="items-per-page-select">Mostrar:</label>
              <select id="items-per-page-select" class="form-select form-select-sm">
                ${this.itemsPerPageOptions.map(option => `
                  <option value="${option}" ${option === this.itemsPerPage ? 'selected' : ''}>
                    ${option}
                  </option>
                `).join('')}
              </select>
            </div>
          ` : ''}
          
          <div class="pagination-controls" id="${this.paginationId}-controls"></div>
        </div>
      `;

      // Event listener para items per page
      if (this.showItemsPerPage) {
        const select = document.getElementById('items-per-page-select');
        if (select) {
          select.addEventListener('change', (e) => {
            this.itemsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.render();
          });
        }
      }

      this.updatePaginationControls();
    }
  }

  updatePaginationControls() {
    const controlsContainer = document.getElementById(`${this.paginationId}-controls`);
    if (!controlsContainer || this.totalPages <= 1) {
      if (controlsContainer) controlsContainer.innerHTML = '';
      return;
    }

    const buttons = [];

    // Botón anterior
    buttons.push(`
      <button class="page-btn" 
              ${this.currentPage === 1 ? 'disabled' : ''} 
              data-page="${this.currentPage - 1}">
        <i class="fas fa-chevron-left"></i>
      </button>
    `);

    // Botones de páginas
    const pageButtons = this.getPageButtons();
    pageButtons.forEach(page => {
      if (page === '...') {
        buttons.push('<span class="page-dots">...</span>');
      } else {
        buttons.push(`
          <button class="page-btn ${page === this.currentPage ? 'active' : ''}" 
                  data-page="${page}">
            ${page}
          </button>
        `);
      }
    });

    // Botón siguiente
    buttons.push(`
      <button class="page-btn" 
              ${this.currentPage === this.totalPages ? 'disabled' : ''} 
              data-page="${this.currentPage + 1}">
        <i class="fas fa-chevron-right"></i>
      </button>
    `);

    controlsContainer.innerHTML = buttons.join('');

    // Event listeners
    controlsContainer.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.currentTarget.getAttribute('data-page'));
        if (!isNaN(page)) {
          this.goToPage(page);
        }
      });
    });

    // Actualizar info
    const infoDiv = document.querySelector(`#${this.paginationId} .pagination-info`);
    if (infoDiv) {
      infoDiv.innerHTML = `
        Mostrando <strong>${this.getStartItem()}</strong> a <strong>${this.getEndItem()}</strong> 
        de <strong>${this.allData.length}</strong> resultados
      `;
    }
  }

  getPageButtons() {
    const pages = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      // Mostrar todas las páginas
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar con elipsis
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }

    return pages;
  }

  goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.render();
    
    // Scroll suave a la tabla
    const table = document.getElementById(this.containerId);
    if (table) {
      table.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  getStartItem() {
    return this.allData.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndItem() {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.allData.length ? this.allData.length : end;
  }

  updateData(newData) {
    this.allData = newData;
    this.currentPage = 1;
    this.render();
  }

  refresh() {
    this.render();
  }
}

// Exportar para uso global
window.LoadingUtils = LoadingUtils;
window.TablePagination = TablePagination;