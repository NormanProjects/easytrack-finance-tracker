
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Service for safely accessing browser-specific APIs
 * Handles SSR compatibility
 */
@Injectable({
  providedIn: 'root'
})
export class BrowserService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Check if code is running in browser
   */
  isBrowserEnvironment(): boolean {
    return this.isBrowser;
  }

  /**
   * Safely get window object
   */
  getWindow(): Window | undefined {
    return this.isBrowser ? window : undefined;
  }

  /**
   * Safely get document object
   */
  getDocument(): Document | undefined {
    return this.isBrowser ? document : undefined;
  }

  /**
   * Safely get window inner width
   */
  getWindowWidth(): number {
    return this.isBrowser ? window.innerWidth : 0;
  }

  /**
   * Safely get window inner height
   */
  getWindowHeight(): number {
    return this.isBrowser ? window.innerHeight : 0;
  }

  /**
   * Safely check if mobile (width < 768px)
   */
  isMobile(): boolean {
    return this.isBrowser ? window.innerWidth < 768 : false;
  }

  /**
   * Safely check if tablet (width >= 768px && < 1024px)
   */
  isTablet(): boolean {
    if (!this.isBrowser) return false;
    const width = window.innerWidth;
    return width >= 768 && width < 1024;
  }

  /**
   * Safely check if desktop (width >= 1024px)
   */
  isDesktop(): boolean {
    return this.isBrowser ? window.innerWidth >= 1024 : true; // Default to desktop for SSR
  }

  /**
   * Safely add event listener to window
   */
  addWindowEventListener(
    event: string, 
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (this.isBrowser) {
      window.addEventListener(event, handler, options);
    }
  }

  /**
   * Safely remove event listener from window
   */
  removeWindowEventListener(
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    if (this.isBrowser) {
      window.removeEventListener(event, handler, options);
    }
  }

  /**
   * Safely scroll to top
   */
  scrollToTop(smooth: boolean = true): void {
    if (this.isBrowser) {
      window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }

  /**
   * Safely scroll to element
   */
  scrollToElement(elementId: string, smooth: boolean = true): void {
    if (!this.isBrowser) return;
    
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }

  /**
   * Safely get current URL
   */
  getCurrentUrl(): string {
    return this.isBrowser ? window.location.href : '';
  }

  /**
   * Safely get user agent
   */
  getUserAgent(): string {
    return this.isBrowser ? navigator.userAgent : '';
  }

  /**
   * Safely check if online
   */
  isOnline(): boolean {
    return this.isBrowser ? navigator.onLine : true;
  }

  /**
   * Safely open external URL
   */
  openExternalUrl(url: string, target: string = '_blank'): void {
    if (this.isBrowser) {
      window.open(url, target);
    }
  }

  /**
   * Safely execute callback only in browser
   */
  executeInBrowser(callback: () => void): void {
    if (this.isBrowser) {
      callback();
    }
  }

  /**
   * Safely copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    if (!this.isBrowser) return false;

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Safely get screen dimensions
   */
  getScreenDimensions(): { width: number; height: number } {
    if (!this.isBrowser) {
      return { width: 0, height: 0 };
    }
    return {
      width: window.screen.width,
      height: window.screen.height
    };
  }

  /**
   * Safely check if dark mode is preferred
   */
  prefersDarkMode(): boolean {
    if (!this.isBrowser) return false;
    
    return window.matchMedia && 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Safely get current scroll position
   */
  getScrollPosition(): { x: number; y: number } {
    if (!this.isBrowser) {
      return { x: 0, y: 0 };
    }
    return {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset
    };
  }
}