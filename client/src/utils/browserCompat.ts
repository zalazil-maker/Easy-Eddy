// Cross-browser compatibility utilities
export const browserCompat = {
  // Storage access with fallback
  getLocalStorage: function(key: string): string | null {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn('localStorage access failed:', error);
    }
    return null;
  },

  setLocalStorage: function(key: string, value: string): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (error) {
      console.warn('localStorage write failed:', error);
    }
    return false;
  },

  removeLocalStorage: function(key: string): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      console.warn('localStorage remove failed:', error);
    }
    return false;
  },

  getSessionStorage: function(key: string): string | null {
    try {
      if (typeof sessionStorage !== 'undefined') {
        return sessionStorage.getItem(key);
      }
    } catch (error) {
      console.warn('sessionStorage access failed:', error);
    }
    return null;
  },

  setSessionStorage: function(key: string, value: string): boolean {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, value);
        return true;
      }
    } catch (error) {
      console.warn('sessionStorage write failed:', error);
    }
    return false;
  },

  removeSessionStorage: function(key: string): boolean {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      console.warn('sessionStorage remove failed:', error);
    }
    return false;
  },

  // File validation
  isValidImageFile: function(file: File): boolean {
    if (!file) return false;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const fileType = (file.type || '').toLowerCase();
    
    return validTypes.includes(fileType);
  },

  // Date formatting with cross-browser support
  formatDate: function(date: Date | string): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Invalid date';
      
      // Use basic date formatting for cross-browser compatibility
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      
      return month + '/' + day + '/' + year;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  },

  // Event handling with cross-browser support
  addClickHandler: function(element: HTMLElement, handler: () => void): void {
    try {
      if (element && typeof handler === 'function') {
        element.addEventListener('click', handler);
      }
    } catch (error) {
      console.error('Event handler attachment failed:', error);
    }
  },

  // Form data handling
  createFormData: function(data: Record<string, any>): FormData {
    try {
      const formData = new FormData();
      
      Object.keys(data).forEach(function(key) {
        const value = data[key];
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value, value.name);
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      return formData;
    } catch (error) {
      console.error('FormData creation failed:', error);
      return new FormData();
    }
  }
};