/* ==================== MENÚ MÓVIL ADMIN ====================
   Script para controlar el menú lateral en dispositivos móviles
   Autor: Sistema de Gestión Tali's
   ========================================================== */

/**
 * Toggle del menú lateral admin
 * Controla apertura/cierre y previene scroll del body
 */
function toggleAdminSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('admin-sidebar-overlay');
  const body = document.body;
  
  if (!sidebar || !overlay) {
    console.warn('⚠️ Elementos del sidebar no encontrados');
    return;
  }
  
  const isActive = sidebar.classList.contains('active');
  
  if (isActive) {
    // Cerrar menú
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    body.classList.remove('menu-open');
  } else {
    // Abrir menú
    sidebar.classList.add('active');
    overlay.classList.add('active');
    body.classList.add('menu-open');
  }
}

/**
 * Cerrar el menú lateral
 */
function closeAdminSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('admin-sidebar-overlay');
  const body = document.body;
  
  if (sidebar && overlay) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    body.classList.remove('menu-open');
  }
}

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 Inicializando controles móviles admin...');
  
  // ==================== MENÚ MÓVIL ====================
  const hamburger = document.getElementById('admin-hamburger-btn');
  const closeBtn = document.getElementById('admin-sidebar-close');
  const overlay = document.getElementById('admin-sidebar-overlay');
  const navLinks = document.querySelectorAll('.admin-sidebar .nav-link');

  // Abrir menú con botón hamburguesa
  if (hamburger) {
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleAdminSidebar();
      console.log('📱 Toggle menú móvil');
    });
  } else {
    console.warn('⚠️ Botón hamburguesa no encontrado');
  }

  // Cerrar menú con botón X
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeAdminSidebar();
      console.log('❌ Menú cerrado con botón X');
    });
  }

  // Cerrar menú al hacer clic en el overlay
  if (overlay) {
    overlay.addEventListener('click', function() {
      closeAdminSidebar();
      console.log('❌ Menú cerrado con overlay');
    });
  }

  // Cerrar menú al hacer clic en enlaces de navegación (solo en móvil)
  if (navLinks.length > 0) {
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth < 768) {
          closeAdminSidebar();
          console.log('🔗 Navegando y cerrando menú móvil');
        }
      });
    });
  }

  // Cerrar menú con tecla ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const sidebar = document.getElementById('admin-sidebar');
      if (sidebar && sidebar.classList.contains('active')) {
        closeAdminSidebar();
        console.log('⌨️ Menú cerrado con ESC');
      }
    }
  });

  // Cerrar menú automáticamente al cambiar a pantalla desktop
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth >= 768) {
        const sidebar = document.getElementById('admin-sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
          closeAdminSidebar();
          console.log('💻 Menú cerrado automáticamente (cambio a desktop)');
        }
      }
    }, 250);
  });

  // ==================== SCROLL EN TABLAS ====================
  const tableResponsive = document.querySelector('.table-responsive');
  
  if (tableResponsive) {
    let hasScrolled = false;
    
    tableResponsive.addEventListener('scroll', function() {
      // Marcar como "scrolled" después del primer desplazamiento
      if (!hasScrolled && this.scrollLeft > 10) {
        hasScrolled = true;
        this.classList.add('scrolled');
        console.log('➡️ Tabla desplazada - ocultando indicador');
      }
      
      // Opcional: remover clase si vuelve a posición inicial
      if (this.scrollLeft === 0 && hasScrolled) {
        this.classList.remove('scrolled');
        hasScrolled = false;
        console.log('⬅️ Tabla en posición inicial');
      }
    }, { passive: true });
    
    console.log('✅ Detector de scroll en tabla activado');
  } else {
    console.log('ℹ️ No hay tabla responsive en esta página');
  }
  
  console.log('✅ Controles móviles admin inicializados correctamente');
});

/**
 * Prevenir problemas de scroll al cargar la página
 */
window.addEventListener('load', function() {
  const body = document.body;
  // Asegurar que no quede el body bloqueado
  if (!document.getElementById('admin-sidebar')?.classList.contains('active')) {
    body.classList.remove('menu-open');
  }
});