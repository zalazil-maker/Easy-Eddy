// Cross-browser storage utilities for compatibility across all browsers
export function safeLocalStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (error) {
    console.warn('localStorage not available:', error);
  }
  
  // Fallback to sessionStorage
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem(key);
    }
  } catch (error) {
    console.warn('sessionStorage not available:', error);
  }
  
  // Fallback to cookie storage
  try {
    const name = key + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
  } catch (error) {
    console.warn('Cookie access not available:', error);
  }
  
  return null;
}

export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
      return true;
    }
  } catch (error) {
    console.warn('localStorage set failed:', error);
  }
  
  // Fallback to sessionStorage
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(key, value);
      return true;
    }
  } catch (error) {
    console.warn('sessionStorage set failed:', error);
  }
  
  // Fallback to cookie storage (expires in 7 days)
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000));
    const expiresStr = "expires=" + expires.toUTCString();
    document.cookie = key + "=" + value + ";" + expiresStr + ";path=/;SameSite=Lax";
    return true;
  } catch (error) {
    console.warn('Cookie set failed:', error);
  }
  
  return false;
}

export function safeSessionStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem(key);
    }
  } catch (error) {
    console.warn('sessionStorage get failed:', error);
  }
  
  // Fallback to localStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (error) {
    console.warn('localStorage fallback failed:', error);
  }
  
  return null;
}

export function safeSessionStorageSet(key: string, value: string): boolean {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(key, value);
      return true;
    }
  } catch (error) {
    console.warn('sessionStorage set failed:', error);
  }
  
  // Fallback to localStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
      return true;
    }
  } catch (error) {
    console.warn('localStorage fallback failed:', error);
  }
  
  return false;
}

// Browser detection for specific compatibility issues
export function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isSamsung = /SamsungBrowser/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isEdge = /Edge/.test(userAgent);
  
  return {
    isChrome,
    isSamsung,
    isSafari,
    isFirefox,
    isEdge,
    userAgent
  };
}

// Enhanced fetch with retry logic for mobile browsers
export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });
      
      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Fetch attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError || new Error('All fetch attempts failed');
}