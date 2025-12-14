import { useQuery } from '@tanstack/react-query';
import { useSuiClient } from '@mysten/dapp-kit';
import type { SuiObjectData } from '@mysten/sui.js/client';
import { PACKAGE_ID, MODULE_NAME, WALRUS_AGGREGATOR } from '@/constants';

// Certificate interface matching Sui Object structure
export interface Certificate {
  id: string; // Sui Object ID
  title: string;
  issuer: string;
  issuerLogo: string;
  date: string;
  imageUrl: string; // Walrus Blob URL
  status: 'verified' | 'pending';
  gradient: 'purple' | 'teal' | 'pink' | 'orange';
  skills?: string[];
  blobId?: string; // Walrus blob ID
}

// Helper to extract initials from issuer name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper to get gradient based on hash
const getGradient = (id: string): 'purple' | 'teal' | 'pink' | 'orange' => {
  const gradients: Array<'purple' | 'teal' | 'pink' | 'orange'> = ['purple', 'teal', 'pink', 'orange'];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

// Parse certificate from Sui Diploma object
const parseCertificate = (object: SuiObjectData): Certificate | null => {
  try {
    const content = object.content;
    if (content && 'fields' in content) {
      const fields = content.fields as Record<string, any>;
      
      // Extract from actual Diploma struct fields (as issued by main project)
      // Fields: course_name, issuer_name, blob_id, issue_date, score, recipient
      const title = fields.course_name || fields.title || fields.name || 'Certificate';
      const issuer = fields.issuer_name || fields.issuer || 'Unknown Issuer';
      const blobId = fields.blob_id || fields.blobId || '';
      
      // Parse issue_date - can be u64 timestamp or string
      let dateStr = '';
      if (fields.issue_date) {
        const issueDate = fields.issue_date;
        if (typeof issueDate === 'string') {
          dateStr = issueDate;
        } else if (typeof issueDate === 'number' || (typeof issueDate === 'string' && !isNaN(Number(issueDate)))) {
          const timestamp = Number(issueDate);
          dateStr = new Date(timestamp).toISOString().split('T')[0];
        }
      }
      if (!dateStr) {
        dateStr = new Date().toISOString().split('T')[0];
      }
      
      // Construct Walrus URL from blob_id (same format as main project)
      let imageUrl = '';
      if (blobId) {
        imageUrl = `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`;
      }
      
      // All diplomas from the contract are verified (they're on-chain)
      const status: 'verified' | 'pending' = 'verified';

      return {
        id: object.objectId,
        title: String(title),
        issuer: String(issuer),
        issuerLogo: getInitials(String(issuer)),
        date: dateStr,
        imageUrl,
        status,
        gradient: getGradient(object.objectId),
        blobId: blobId ? String(blobId) : undefined,
      };
    }
  } catch (error) {
    console.error('Error parsing certificate:', error);
  }
  return null;
};

export const useMyCertificates = (address: string | null): { certificates: Certificate[]; isLoading: boolean } => {
  const client = useSuiClient();

  const { data: objects, isLoading } = useQuery({
    queryKey: ['certificates', address],
    queryFn: async () => {
      if (!address) return [];

      try {
        // Query for Diploma objects using the exact struct type from main project
        const ownedObjects = await client.getOwnedObjects({
          owner: address,
          filter: {
            StructType: `${PACKAGE_ID}::${MODULE_NAME}::Diploma`,
          },
          options: {
            showContent: true,
            showType: true,
          },
        });

        console.log(`🔍 Found ${ownedObjects.data.length} Diploma object(s) for address: ${address}`);

        // Map to SuiObjectData
        const certificateObjects = ownedObjects.data
          .map(obj => obj.data)
          .filter((obj): obj is SuiObjectData => obj !== null && obj !== undefined);

        return certificateObjects;
      } catch (error) {
        console.error('Error fetching certificates:', error);
        return [];
      }
    },
    enabled: !!address,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const certificates: Certificate[] = (objects || [])
    .map(parseCertificate)
    .filter((cert): cert is Certificate => cert !== null);

  return { certificates, isLoading };
};
