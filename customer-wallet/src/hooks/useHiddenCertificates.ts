import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'suivitae-hidden-certificates';

/**
 * Hook to manage hidden certificates
 * Stores hidden certificate IDs in localStorage
 */
export const useHiddenCertificates = () => {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  // Load hidden IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setHiddenIds(new Set(ids));
      }
    } catch (error) {
      console.error('Error loading hidden certificates:', error);
    }
  }, []);

  // Save to localStorage whenever hiddenIds changes
  useEffect(() => {
    try {
      const idsArray = Array.from(hiddenIds);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(idsArray));
    } catch (error) {
      console.error('Error saving hidden certificates:', error);
    }
  }, [hiddenIds]);

  const hideCertificate = useCallback((certificateId: string) => {
    setHiddenIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(certificateId);
      return newSet;
    });
  }, []);

  const unhideCertificate = useCallback((certificateId: string) => {
    setHiddenIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(certificateId);
      return newSet;
    });
  }, []);

  const isHidden = useCallback((certificateId: string) => {
    return hiddenIds.has(certificateId);
  }, [hiddenIds]);

  const clearAllHidden = useCallback(() => {
    setHiddenIds(new Set());
  }, []);

  // Convert Set to sorted array for stable dependency tracking
  const hiddenIdsArray = Array.from(hiddenIds).sort();

  return {
    hiddenIds,
    hiddenIdsArray, // Expose array version for React dependency tracking
    hideCertificate,
    unhideCertificate,
    isHidden,
    clearAllHidden,
  };
};

