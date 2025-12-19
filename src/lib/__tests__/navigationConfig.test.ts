import {
  NAVIGATION_CONFIG,
  getAllNavigationItems,
  getNavigationItemsBySection,
  filterNavigationItemsByRoles,
  filterNavigationSectionsByRoles,
  isNavItemVisible,
  isPathActive,
  findNavItemByPath,
  findNavItemById,
} from '../navigationConfig';

describe('Navigation Configuration', () => {
  describe('Basic Configuration', () => {
    it('should have main navigation items', () => {
      expect(NAVIGATION_CONFIG.main).toBeDefined();
      expect(NAVIGATION_CONFIG.main.length).toBeGreaterThan(0);
    });

    it('should have settings navigation items', () => {
      expect(NAVIGATION_CONFIG.settings).toBeDefined();
      expect(NAVIGATION_CONFIG.settings.length).toBeGreaterThan(0);
    });

    it('should have actions navigation items', () => {
      expect(NAVIGATION_CONFIG.actions).toBeDefined();
      expect(NAVIGATION_CONFIG.actions.length).toBeGreaterThan(0);
    });

    it('should have proper navigation item structure', () => {
      const mainItems = NAVIGATION_CONFIG.main;
      const firstItem = mainItems[0];

      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('path');
      expect(firstItem).toHaveProperty('icon');
      expect(firstItem).toHaveProperty('label');
      expect(firstItem).toHaveProperty('requiredRoles');
      expect(firstItem).toHaveProperty('order');
    });
  });

  describe('Navigation Item Retrieval', () => {
    it('should get all navigation items', () => {
      const allItems = getAllNavigationItems();
      expect(allItems.length).toBeGreaterThan(0);
      expect(Array.isArray(allItems)).toBe(true);
    });

    it('should get navigation items by section', () => {
      const mainItems = getNavigationItemsBySection('main');
      const settingsItems = getNavigationItemsBySection('settings');

      expect(mainItems.length).toBeGreaterThan(0);
      expect(settingsItems.length).toBeGreaterThan(0);
    });

    it('should sort items by order', () => {
      const mainItems = getNavigationItemsBySection('main');
      const sorted = [...mainItems].sort(
        (a, b) => (a.order || 999) - (b.order || 999)
      );

      mainItems.forEach((item, index) => {
        expect(item.order).toBeLessThanOrEqual(sorted[index].order || 999);
      });
    });
  });

  describe('Permission-Based Filtering', () => {
    it('should filter items for user role', () => {
      const userRoles = ['user'];
      const filteredItems = filterNavigationItemsByRoles(
        NAVIGATION_CONFIG.main,
        userRoles
      );

      expect(filteredItems.length).toBeGreaterThan(0);
      filteredItems.forEach((item) => {
        expect(item.requiredRoles).toBeDefined();
        expect(
          item.requiredRoles?.some((role) => userRoles.includes(role))
        ).toBe(true);
      });
    });

    it('should filter items for admin role', () => {
      const adminRoles = ['admin'];
      const filteredItems = filterNavigationItemsByRoles(
        NAVIGATION_CONFIG.main,
        adminRoles
      );

      expect(filteredItems.length).toBeGreaterThan(0);
    });

    it('should filter sections by roles', () => {
      const userRoles = ['user'];
      const filteredSections = filterNavigationSectionsByRoles(userRoles);

      expect(filteredSections.length).toBeGreaterThan(0);
      filteredSections.forEach((section) => {
        section.items.forEach((item) => {
          expect(isNavItemVisible(item, userRoles)).toBe(true);
        });
      });
    });

    it('should show no items when no roles specified (authenticated nav)', () => {
      const filteredItems = filterNavigationItemsByRoles(
        NAVIGATION_CONFIG.main,
        []
      );

      // Main navigation requires authentication, so no items should be visible
      expect(filteredItems.length).toBe(0);
    });
  });

  describe('Navigation Utilities', () => {
    it('should check if navigation item is visible', () => {
      const item = NAVIGATION_CONFIG.main[0];

      // Should be visible for user role
      expect(isNavItemVisible(item, ['user'])).toBe(true);

      // Should be visible for admin role
      expect(isNavItemVisible(item, ['admin'])).toBe(true);
    });

    it('should check path active state', () => {
      // Exact match
      expect(isPathActive('/dashboard', '/dashboard')).toBe(true);

      // Nested route
      expect(isPathActive('/dashboard/analytics', '/dashboard')).toBe(true);

      // Different path
      expect(isPathActive('/trade', '/dashboard')).toBe(false);

      // Root path
      expect(isPathActive('/', '/')).toBe(true);
      expect(isPathActive('/dashboard', '/')).toBe(false);
    });

    it('should find navigation item by path', () => {
      const item = findNavItemByPath('/dashboard');
      expect(item).toBeDefined();
      expect(item?.path).toBe('/dashboard');
    });

    it('should find navigation item by ID', () => {
      const item = findNavItemById('dashboard');
      expect(item).toBeDefined();
      expect(item?.id).toBe('dashboard');
    });

    it('should return undefined for non-existent items', () => {
      expect(findNavItemByPath('/non-existent')).toBeUndefined();
      expect(findNavItemById('non-existent')).toBeUndefined();
    });
  });

  describe('Backward Compatibility', () => {
    it('should provide backward compatible nav items', () => {
      const legacyItems = getAllNavigationItems().filter(
        (item) => item.id !== 'logout' && item.id !== 'profile'
      );

      expect(legacyItems).toBeDefined();
      expect(Array.isArray(legacyItems)).toBe(true);
      expect(legacyItems.length).toBeGreaterThan(0);

      // Check that legacy items have the expected structure
      legacyItems.forEach((item) => {
        expect(item).toHaveProperty('path');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('label');
      });
    });
  });
});
