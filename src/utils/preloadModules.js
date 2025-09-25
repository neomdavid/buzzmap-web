// Preload critical modules to reduce dynamic import failures
export const preloadCriticalModules = () => {
  // Only preload in production to avoid development overhead
  if (process.env.NODE_ENV === 'production') {
    // Preload critical admin modules
    const criticalModules = [
      () => import('../pages/admin/DengueMapping.jsx'),
      () => import('../pages/admin/Analytics.jsx'),
      () => import('../pages/admin/Interventions.jsx'),
    ];

    // Preload after a short delay to not block initial page load
    setTimeout(() => {
      criticalModules.forEach((moduleLoader, index) => {
        // Stagger the preloads to avoid overwhelming the network
        setTimeout(() => {
          moduleLoader().catch(error => {
            console.warn(`Preload failed for module ${index}:`, error);
          });
        }, index * 1000); // 1 second between each preload
      });
    }, 2000); // Start preloading 2 seconds after page load
  }
};

// Preload modules when user navigates to admin area
export const preloadAdminModules = () => {
  if (process.env.NODE_ENV === 'production') {
    const adminModules = [
      () => import('../pages/admin/ReportsVerification.jsx'),
      () => import('../pages/admin/AllInterventions.jsx'),
    ];

    adminModules.forEach((moduleLoader, index) => {
      setTimeout(() => {
        moduleLoader().catch(error => {
          console.warn(`Admin module preload failed:`, error);
        });
      }, index * 500);
    });
  }
};
