import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { NavbarContext } from '../state/NavbarContext';

export function Layout() {
  const location = useLocation();
  const isPlayPage = /\/play$/.test(location.pathname);
  const [actions, setActions] = useState<React.ReactNode>(null);
  const [navVisible, setNavVisible] = useState(!isPlayPage);
  const hideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlayPage) {
      setNavVisible(false);
    } else {
      setNavVisible(true);
    }
    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [isPlayPage]);

  useEffect(() => {
    if (!isPlayPage) {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      return;
    }

    if (!navVisible) {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      return;
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      setNavVisible(false);
      hideTimeoutRef.current = null;
    }, 2000);

    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [isPlayPage, navVisible]);

  useEffect(() => {
    setActions(null);
  }, [location.pathname]);

  const contextValue = useMemo(() => ({ setActions }), [setActions]);

  const handleShowNav = () => {
    if (!isPlayPage) return;
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setNavVisible(true);
  };

  const shouldShowNav = !isPlayPage || navVisible;

  return (
    <NavbarContext.Provider value={contextValue}>
      <div className="relative min-h-screen">
        <nav
          className={`fixed top-0 left-0 right-0 z-40 transform transition-transform duration-300 bg-white/95 backdrop-blur shadow ${
            shouldShowNav ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-800 hover:text-gray-900">
              <img src="/icons/icon-48.png" alt="NameBeasts icon" className="h-8 w-8" />
              <span className="text-xl font-bold">NameBeasts</span>
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-600">{actions}</div>
          </div>
        </nav>

        {isPlayPage && !navVisible && (
          <button
            type="button"
            onClick={handleShowNav}
            className="fixed top-0 left-1/2 -translate-x-1/2 bg-white text-gray-700 shadow rounded-b-full px-5 py-1.5 text-sm z-30"
            aria-label="Show navigation"
          >
            Menu
          </button>
        )}

        <div className={!isPlayPage ? 'pt-20' : ''}>
          <Outlet />
        </div>
      </div>
    </NavbarContext.Provider>
  );
}
