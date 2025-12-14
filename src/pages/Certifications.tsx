import { useState, useEffect } from "react";
import { CertificationCard } from "@/components/certifications/CertificationCard";
import { certifications } from "@/data/mockData"; 
import { Award, TrendingUp, Wallet } from "lucide-react";
import { toast } from "sonner";

// SUI & WALRUS IMPORTS
import { useCurrentAccount, useSignAndExecuteTransaction, ConnectButton, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, ADMIN_CAP_ID, MODULE_NAME, NETWORK } from "@/constants";
import { uploadToWalrus } from "@/lib/walrus";

// Type for storing on-chain certification data
interface OnChainCertData {
  transactionId: string;
  blobId: string;
  mintedAt: number;
  recipient: string;
  objectId?: string; // Sui object ID for the diploma
}

const Certifications = () => {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  
  // Track which certificate is currently processing
  const [processingId, setProcessingId] = useState<number | null>(null);
  // Track which certificates are already minted (loaded from blockchain)
  const [mintedIds, setMintedIds] = useState<number[]>([]);
  // Store on-chain data for each minted certification
  const [onChainData, setOnChainData] = useState<Record<number, OnChainCertData>>({});
  // Loading state for blockchain queries
  const [isLoadingOnChain, setIsLoadingOnChain] = useState(false);

  // ⚡ THE MAIN FUNCTION: Uploads to Walrus -> Mints on Sui
  const handleVerify = async (cert: any) => {
    if (!account) {
        toast.error("Please connect your wallet first!");
        return;
    }

    setProcessingId(cert.id);
    toast.info("Securing credential on Walrus network...");

    try {
        // STEP 1: Try to find and upload the actual PDF file
        const encodedTitle = encodeURIComponent(cert.title);
        let fileToUpload: File | null = null;
        let fileExtension = '';
        
        // Try to find PDF file
        try {
          const filePath = `/${encodedTitle}.pdf`;
          const response = await fetch(filePath);
          
          if (response.ok) {
            const blob = await response.blob();
            fileToUpload = new File(
              [blob], 
              `${cert.title}.pdf`, 
              { type: blob.type || "application/pdf" }
            );
            fileExtension = 'pdf';
          }
        } catch (error) {
          // PDF not found
        }
        
        // If no PDF found, fall back to the placeholder image
        if (!fileToUpload) {
          toast.warning("Using placeholder image (PDF not found)");
          const response = await fetch(cert.image);
          const blob = await response.blob();
          fileToUpload = new File([blob], "certificate.jpg", { type: "image/jpeg" });
          fileExtension = 'jpg';
        }

        // STEP 2: Upload to Decentralized Storage
        const blobId = await uploadToWalrus(fileToUpload);
        toast.success(`${fileExtension.toUpperCase()} file stored on decentralized storage!`);

        // STEP 3: Mint NFT on Sui
        toast.info("Please sign the transaction to mint your diploma...");
        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::${MODULE_NAME}::issue_diploma`,
            arguments: [
                tx.object(ADMIN_CAP_ID),
                tx.pure.string(cert.issuer),
                tx.pure.string(cert.title),
                tx.pure.u64(100), 
                tx.pure.string(blobId), 
                tx.pure.u64(Date.now()),
                tx.pure.address(account.address), // Connected User
            ],
        });

        signAndExecute(
            { transaction: tx },
            {
                onSuccess: (result) => {
                    console.log("Minted:", result);
                    
                    // Extract transaction digest/ID from result
                    const transactionId = result.digest;
                    
                    // Store on-chain data for this certification
                    setOnChainData((prev) => ({
                        ...prev,
                        [cert.id]: {
                            transactionId,
                            blobId,
                            mintedAt: Date.now(),
                            recipient: account.address,
                        },
                    }));
                    
                    toast.success("Credential successfully minted on-chain!");
                    setMintedIds((prev) => [...prev, cert.id]);
                    setProcessingId(null);
                    
                    // Refresh on-chain data to ensure consistency
                    setTimeout(() => {
                      fetchOnChainCertifications(account.address);
                    }, 2000);
                },
                onError: (err) => {
                    console.error("Mint failed:", err);
                    toast.error("Transaction failed.");
                    setProcessingId(null);
                },
            }
        );

    } catch (error) {
        console.error("Verification failed", error);
        toast.error("Process failed. See console.");
        setProcessingId(null);
    }
  };

  // Query blockchain for owned diploma objects
  const fetchOnChainCertifications = async (walletAddress: string) => {
    if (!walletAddress) return;
    
    setIsLoadingOnChain(true);
    try {
      console.log("🔍 Querying blockchain for diplomas owned by:", walletAddress);
      
      // Get all objects owned by the wallet address
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: walletAddress,
        filter: {
          StructType: `${PACKAGE_ID}::${MODULE_NAME}::Diploma`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      console.log("📜 Found diploma objects:", ownedObjects);

      // Map of certification title -> on-chain data
      const verifiedCerts: Record<string, OnChainCertData & { objectId: string }> = {};

      // Process each diploma object
      for (const obj of ownedObjects.data) {
        if (obj.data && 'content' in obj.data && obj.data.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any;
          const objectId = obj.data.objectId;
          
          console.log("🔍 Processing diploma object:", objectId);
          console.log("📦 All fields:", JSON.stringify(fields, null, 2));
          
          // Extract diploma data - try different possible field name variations
          // Check what fields actually exist
          const allFieldKeys = Object.keys(fields);
          console.log("🔑 Available field keys:", allFieldKeys);
          
          const title = fields.course_name || fields.title || fields.name || fields.courseName || "";
          const issuer = fields.issuer_name || fields.issuer || fields.issuerName || "";
          const blobId = fields.blob_id || fields.blobId || fields.image_url || fields.imageUrl || "";
          const issueDate = fields.issue_date || fields.issueDate || fields.date || fields.minted_at || fields.mintedAt || "0";
          
          console.log("📋 Extracted - Title:", title, "Issuer:", issuer);
          console.log("📋 Full field structure:", {
            course_name: fields.course_name,
            courseName: fields.courseName,
            title: fields.title,
            issuer_name: fields.issuer_name,
            issuerName: fields.issuerName,
            issuer: fields.issuer,
          });
          
          // Try to match with local certifications
          // Match by title first (more specific), then by issuer if needed
          const matchingCert = certifications.find(
            (cert) => {
              // Normalize strings for comparison (trim, lowercase)
              const certTitle = cert.title.trim().toLowerCase();
              const certIssuer = cert.issuer.trim().toLowerCase();
              const onChainTitle = String(title).trim().toLowerCase();
              const onChainIssuer = String(issuer).trim().toLowerCase();
              
              // Try exact match first
              if (certTitle === onChainTitle && certIssuer === onChainIssuer) {
                console.log("✅ Exact match found:", cert.title);
                return true;
              }
              // Try title only match (in case issuer name differs slightly)
              if (certTitle === onChainTitle && onChainTitle !== "") {
                console.log("⚠️ Title match but issuer differs:", cert.issuer, "vs", issuer);
                return true;
              }
              // Try partial title match (in case of small differences)
              if (certTitle.includes(onChainTitle) || onChainTitle.includes(certTitle)) {
                if (certTitle.length > 10 && onChainTitle.length > 10) {
                  console.log("⚠️ Partial title match:", cert.title, "vs", title);
                  return true;
                }
              }
              return false;
            }
          );

          if (matchingCert) {
            console.log("✅ Found matching cert:", matchingCert.title);
            
            // Try to get the transaction that created this object
            let transactionId = "";
            try {
              // Query transaction history for this object
              const transactions = await suiClient.queryTransactionBlocks({
                filter: {
                  InputObject: objectId,
                },
                limit: 1,
              });
              
              if (transactions.data.length > 0) {
                transactionId = transactions.data[0].digest;
              }
            } catch (err) {
              console.warn("Could not fetch transaction for object:", objectId, err);
            }

            verifiedCerts[matchingCert.id.toString()] = {
              transactionId,
              blobId: typeof blobId === 'string' ? blobId : String(blobId || ""),
              mintedAt: typeof issueDate === 'string' ? parseInt(issueDate) : (typeof issueDate === 'number' ? issueDate : parseInt(String(issueDate)) || Date.now()),
              recipient: walletAddress,
              objectId,
            };
          } else {
            console.log("❌ No matching cert found for:", title, "from", issuer);
            console.log("Available certs:", certifications.map(c => ({ title: c.title, issuer: c.issuer })));
          }
        } else {
          console.warn("⚠️ Skipping object - invalid structure:", obj);
        }
      }

      console.log("✅ Verified certifications:", verifiedCerts);

      // Update state with verified certifications
      const verifiedIds = Object.keys(verifiedCerts).map(Number);
      setMintedIds(verifiedIds);
      setOnChainData(
        Object.entries(verifiedCerts).reduce((acc, [id, data]) => {
          // Keep objectId in the data
          acc[Number(id)] = {
            transactionId: data.transactionId,
            blobId: data.blobId,
            mintedAt: data.mintedAt,
            recipient: data.recipient,
            objectId: data.objectId, // Keep objectId for verification
          };
          return acc;
        }, {} as Record<number, OnChainCertData>)
      );

      if (verifiedIds.length > 0) {
        toast.success(`Found ${verifiedIds.length} verified certification(s) on-chain!`);
      }
    } catch (error) {
      console.error("Failed to fetch on-chain certifications:", error);
      toast.error("Failed to check blockchain. Using cached data.");
    } finally {
      setIsLoadingOnChain(false);
    }
  };

  // Fetch on-chain data when wallet connects or address changes
  useEffect(() => {
    if (account?.address) {
      fetchOnChainCertifications(account.address);
    } else {
      // Reset when wallet disconnects
      setMintedIds([]);
      setOnChainData({});
    }
  }, [account?.address]);

  // Get Sui Explorer URL for transaction
  const getExplorerUrl = (transactionId: string) => {
    return `https://suiexplorer.com/txblock/${transactionId}?network=${NETWORK}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">My Certifications</h1>
          <p className="text-muted-foreground">
            Verify and claim your earned credentials on the Sui blockchain.
          </p>
        </div>
        {/* Wallet Connection - UPDATED STYLE */}
        <div className="flex items-center gap-2">
             <div className="hidden md:flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md border border-border">
             <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Sui Network</span>
             </div>
             
             {/* Wrapped ConnectButton with theme styling */}
             <div className="[&_button]:!border-2 [&_button]:!border-border [&_button]:!bg-card [&_button]:!text-foreground [&_button]:!font-medium [&_button]:!shadow-sm [&_button]:transition-all [&_button]:hover:!shadow-md [&_button]:hover:!-translate-y-0.5 [&_button]:active:!translate-y-0 [&_button]:active:!shadow-sm [&_button]:rounded-md [&_button]:px-4 [&_button]:py-2 [&_button[class*='connect']]:!bg-primary [&_button[class*='connect']]:!text-primary-foreground [&_button[class*='connect']]:!border-primary">
               <ConnectButton />
             </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 border-2 border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex h-14 w-14 items-center justify-center border-2 border-border bg-primary">
            <Award className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <div className="text-3xl font-bold">{certifications.length}</div>
            <div className="text-muted-foreground">Total Earned</div>
          </div>
        </div>
        <div className="flex items-center gap-4 border-2 border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex h-14 w-14 items-center justify-center border-2 border-border bg-green-600">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold">
              {isLoadingOnChain ? "..." : mintedIds.length}
            </div>
            <div className="text-muted-foreground">
              {isLoadingOnChain ? "Checking..." : "Verified On-Chain"}
            </div>
          </div>
        </div>
      </div>

      {/* Certifications List */}
      <section>
        <h2 className="mb-6 text-xl font-bold">Action Required</h2>
        {certifications.length > 0 ? (
          <div className="space-y-4">
            {certifications.map((cert) => {
              const chainData = onChainData[cert.id];
              return (
                <CertificationCard 
                  key={cert.id} 
                  {...cert} 
                  onVerify={() => handleVerify(cert)}
                  isVerifying={processingId === cert.id}
                  isVerified={mintedIds.includes(cert.id)}
                  transactionId={chainData?.transactionId}
                  explorerUrl={chainData ? getExplorerUrl(chainData.transactionId) : undefined}
                  blobId={chainData?.blobId}
                  mintedAt={chainData?.mintedAt}
                  objectId={chainData?.objectId}
                />
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-dashed border-border bg-card p-12 text-center">
            <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-bold">No certifications yet</h3>
          </div>
        )}
      </section>
    </div>
  );
};

export default Certifications;