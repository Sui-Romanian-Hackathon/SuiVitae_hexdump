import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WALRUS_AGGREGATOR } from '@/constants';
import type { Certificate } from './useMyCertificates';

/**
 * Hook to check which certificates have files on Walrus
 * Uses the same logic as main project "Check on Walrus" button:
 * - Fetches from Walrus to verify file exists
 * - If response.ok, file exists on Walrus
 */
export const useCertificatesWithPDF = (certificates: Certificate[]) => {
  const [certificatesWithFile, setCertificatesWithFile] = useState<Set<string>>(new Set());

  // Check which certificates have files on Walrus (same logic as main project)
  const { data: fileCheckResults } = useQuery({
    queryKey: ['certificates-walrus-check', certificates.map(c => `${c.id}-${c.blobId}`).join(',')],
    queryFn: async () => {
      const results = new Map<string, boolean>();
      
      // Only check certificates that have blobId
      const certificatesToCheck = certificates.filter(c => c.blobId && c.blobId.trim() !== '');
      
      // Check in parallel (same approach as main project)
      await Promise.all(
        certificatesToCheck.map(async (cert) => {
          try {
            // Same fetch logic as main project "Check on Walrus" button
            const response = await fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${cert.blobId}`, {
              method: 'GET',
              headers: {
                'Accept': '*/*',
              },
            });
            
            // If response.ok, file exists on Walrus (same as main project)
            if (response.ok) {
              results.set(cert.id, true);
            } else {
              results.set(cert.id, false);
            }
          } catch (error) {
            console.error(`Error checking file on Walrus for ${cert.id}:`, error);
            results.set(cert.id, false);
          }
        })
      );

      return results;
    },
    enabled: certificates.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    if (fileCheckResults) {
      const fileSet = new Set<string>();
      fileCheckResults.forEach((hasFile, certId) => {
        if (hasFile) {
          fileSet.add(certId);
        }
      });
      setCertificatesWithFile(fileSet);
    }
  }, [fileCheckResults]);

  return certificatesWithFile;
};

