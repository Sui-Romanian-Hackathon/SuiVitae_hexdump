import { useMemo } from 'react';
import { WALRUS_AGGREGATOR } from '@/constants';
import type { Certificate } from './useMyCertificates';

/**
 * Hook to check if a certificate has a file on Walrus and fetch it
 * If blobId exists, file exists on Walrus (it was minted with it)
 */
export const useCertificatePDF = (certificate: Certificate | null) => {
  // If blobId exists, file exists on Walrus
  const hasFile = useMemo(() => {
    return !!(certificate?.blobId && certificate.blobId.trim() !== '');
  }, [certificate?.blobId]);

  const downloadFile = async () => {
    if (!certificate?.blobId) {
      throw new Error('No blobId available');
    }

    try {
      // Exact same logic as main project "Check on Walrus" button
      const response = await fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${certificate.blobId}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Same detection logic as main project
        // Main project uses: blob.type.includes('image') ? 'jpg' : 'pdf'
        const extension = blob.type.includes('image') ? 'jpg' : 'pdf';
        
        // Same naming as main project (with _walrus suffix)
        link.download = `${certificate.title.replace(/\s+/g, '_')}_walrus.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return true;
      } else {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  };

  return {
    hasFile,
    fileType: 'file', // Will be detected on download
    isChecking: false, // No checking needed
    downloadFile,
  };
};

