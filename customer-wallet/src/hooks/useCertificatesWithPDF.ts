import { useMemo } from 'react';
import type { Certificate } from './useMyCertificates';

/**
 * Hook to check which certificates have files on Walrus
 * In the main project, if a certificate has a blobId from on-chain data, 
 * it means it was minted with a file on Walrus, so we can trust it exists.
 * Returns a Set of certificate IDs that have blobId (and thus files on Walrus)
 */
export const useCertificatesWithPDF = (certificates: Certificate[]) => {
  // If certificate has blobId, it means it was minted with a file on Walrus
  // No need to verify with HEAD request - if it's on-chain, it exists
  const certificatesWithFile = useMemo(() => {
    const fileSet = new Set<string>();
    certificates.forEach((cert) => {
      // If blobId exists and is not empty, the file exists on Walrus
      if (cert.blobId && cert.blobId.trim() !== '') {
        fileSet.add(cert.id);
      }
    });
    return fileSet;
  }, [certificates]);

  return certificatesWithFile;
};

