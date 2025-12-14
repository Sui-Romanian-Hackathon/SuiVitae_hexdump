import { useMemo } from 'react';
import { WALRUS_AGGREGATOR } from '@/constants';
import type { Certificate } from './useMyCertificates';

/**
 * Hook to check if a certificate has a file on Walrus and fetch it
 * If blobId exists, the file exists on Walrus (it was minted with it)
 */
export const useCertificatePDF = (certificate: Certificate | null) => {
  // If blobId exists, file exists on Walrus (no need to verify)
  const hasFile = useMemo(() => {
    return !!(certificate?.blobId && certificate.blobId.trim() !== '');
  }, [certificate?.blobId]);

  // We'll detect file type when downloading
  const fileType = useMemo(() => {
    // Default to 'file', will be detected on download
    return 'file';
  }, []);

  const downloadFile = async () => {
    if (!certificate?.blobId) {
      throw new Error('No blobId available');
    }

    try {
      // Same logic as main project - direct fetch from Walrus
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
        
        // Detect file type from content-type or blob type (same as main project)
        const contentType = response.headers.get('content-type') || '';
        const contentTypeLower = contentType.toLowerCase();
        const blobTypeLower = (blob.type || '').toLowerCase();
        
        // Same detection logic as main project
        let extension = 'pdf';
        if (contentTypeLower.includes('pdf') || blobTypeLower.includes('pdf')) {
          extension = 'pdf';
        } else if (contentTypeLower.includes('jpeg') || contentTypeLower.includes('jpg') || 
                   blobTypeLower.includes('jpeg') || blobTypeLower.includes('jpg')) {
          extension = 'jpg';
        } else if (contentTypeLower.includes('png') || blobTypeLower.includes('png')) {
          extension = 'png';
        } else if (contentTypeLower.includes('image')) {
          extension = 'jpg'; // Default for images
        }
        
        // Same naming as main project
        link.download = `${certificate.title.replace(/\s+/g, '_')}_certificate.${extension}`;
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
    fileType,
    isChecking: false, // No checking needed - if blobId exists, file exists
    downloadFile,
  };
};

