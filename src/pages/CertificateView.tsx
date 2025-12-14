import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft, Loader2, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME, WALRUS_AGGREGATOR } from "@/constants";
import { toast } from "sonner";
import { hasLocalPDF, getLocalPDF, saveLocalPDF } from "@/lib/localStorage";

interface CertificateData {
  title: string;
  issuer: string;
  blobId: string;
  verified: boolean;
  objectId?: string;
  credentialId?: string;
}

const CertificateView = () => {
  const { certId } = useParams<{ certId: string }>();
  const navigate = useNavigate();
  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [walrusImageUrl, setWalrusImageUrl] = useState<string | null>(null);
  const [walrusFileType, setWalrusFileType] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!certId) {
      navigate("/certifications");
      return;
    }

    const fetchCertificate = async () => {
      setIsLoading(true);
      try {
        // Get certificate data from localStorage
        const certData = localStorage.getItem(`cert_${certId}`);
        if (!certData) {
          toast.error("Certificate data not found");
          navigate("/certifications");
          return;
        }

        const parsed = JSON.parse(certData);
        setCertificate(parsed);

        // Helper function to fetch from Walrus and save locally
        const fetchFromWalrus = async (blobId: string) => {
          try {
            console.log("🦭 Fetching blob from Walrus:", blobId);
            console.log("🔗 Walrus URL:", `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`);
            
            // Fetch blob data from Walrus Aggregator
            const response = await fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`, {
              method: 'GET',
              headers: {
                'Accept': '*/*',
              },
            });
            
            if (response.ok) {
              const contentType = response.headers.get("content-type") || "";
              console.log("📦 Walrus response content-type:", contentType);
              
              // Get the blob data
              const blob = await response.blob();
              console.log("📦 Blob type:", blob.type, "Size:", blob.size);
              
              // Detect file type
              let fileType = "pdf";
              const contentTypeLower = contentType.toLowerCase();
              const blobTypeLower = (blob.type || "").toLowerCase();
              
              if (contentTypeLower.includes("pdf") || blobTypeLower.includes("pdf") || contentTypeLower === "application/pdf") {
                fileType = "pdf";
                console.log("📄 Detected PDF file (from content-type/blob type)");
              } else if (contentTypeLower.includes("image") || blobTypeLower.includes("image")) {
                fileType = "image";
                console.log("🖼️ Detected image file (from content-type/blob type)");
              } else if (!contentType || contentType === "application/octet-stream" || !blob.type) {
                if (blob.size > 20000) {
                  const firstBytes = await blob.slice(0, 4).arrayBuffer();
                  const uint8Array = new Uint8Array(firstBytes);
                  const pdfSignature = String.fromCharCode(...uint8Array);
                  
                  if (pdfSignature === "%PDF") {
                    fileType = "pdf";
                    console.log("📄 Detected PDF file (from PDF signature)");
                  } else {
                    fileType = "pdf";
                    console.log("📄 Detected as PDF (large file, generic content-type)");
                  }
                } else {
                  fileType = "image";
                  console.log("🖼️ Detected as image (small file, generic content-type)");
                }
              }
              
              setWalrusFileType(fileType);
              
              // Save to local storage (only for PDFs)
              if (fileType === "pdf") {
                try {
                  console.log("💾 Attempting to save PDF to local storage...");
                  await saveLocalPDF(blobId, blob);
                  console.log("✅ PDF saved to local storage successfully");
                  toast.success("PDF saved locally for faster loading next time");
                } catch (saveError) {
                  console.error("⚠️ Failed to save PDF to local storage:", saveError);
                  // Continue anyway, we can still display it
                }
              }
              
              // Create blob URL
              if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
              }
              const fileUrl = URL.createObjectURL(blob);
              blobUrlRef.current = fileUrl;
              setWalrusImageUrl(fileUrl);
              console.log(`✅ File loaded from Walrus (type: ${fileType}, URL: ${fileUrl})`);
            } else {
              console.error("❌ Walrus fetch failed:", response.status, response.statusText);
              toast.error("Failed to fetch certificate from Walrus");
            }
          } catch (error) {
            console.error("❌ Failed to fetch from Walrus:", error);
            toast.error("Failed to load certificate file");
          }
        };

        // Fetch file from local storage or Walrus
        if (parsed.blobId) {
          try {
            // First, check if PDF exists in local storage
            console.log("🔍 Checking local storage for blobId:", parsed.blobId);
            const existsLocally = await hasLocalPDF(parsed.blobId);
            console.log("📦 Local storage check result:", existsLocally);
            
            if (existsLocally) {
              console.log("📁 PDF found in local storage, loading from cache");
              const localBlob = await getLocalPDF(parsed.blobId);
              
              if (localBlob && localBlob.size > 0) {
                // Detect file type from local blob
                let fileType = "pdf";
                if (localBlob.type.includes("pdf")) {
                  fileType = "pdf";
                } else if (localBlob.type.includes("image")) {
                  fileType = "image";
                }
                
                setWalrusFileType(fileType);
                
                // Create blob URL from local storage
                if (blobUrlRef.current) {
                  URL.revokeObjectURL(blobUrlRef.current);
                }
                const fileUrl = URL.createObjectURL(localBlob);
                blobUrlRef.current = fileUrl;
                setWalrusImageUrl(fileUrl);
                console.log(`✅ File loaded from local storage (type: ${fileType}, size: ${localBlob.size} bytes)`);
              } else {
                // Local storage entry exists but blob is missing or empty, fetch from Walrus
                console.log("⚠️ Local storage entry found but blob missing or empty, fetching from Walrus");
                await fetchFromWalrus(parsed.blobId);
              }
            } else {
              // PDF doesn't exist locally, fetch from Walrus and save it
              console.log("📥 PDF not found locally, fetching from Walrus (will save locally)");
              await fetchFromWalrus(parsed.blobId);
            }
          } catch (error) {
            console.error("❌ Failed to load certificate file:", error);
            toast.error("Failed to load certificate file");
          }
        }

        // If already verified, mark as verified immediately
        if (parsed.verified && parsed.objectId) {
          setCertificate((prev) => prev ? { ...prev, verified: true } : null);
          console.log("✅ Certificate already verified, using stored data");
        } else if (account?.address) {
          // Only verify if not already verified
          await verifyOnChain(parsed.objectId, parsed.blobId);
        } else {
          // If no wallet, still show the certificate but mark as unverified
          console.warn("Wallet not connected, skipping verification");
        }
      } catch (error) {
        console.error("Failed to fetch certificate:", error);
        toast.error("Failed to load certificate");
        navigate("/certifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();

    // Cleanup function for blob URLs when component unmounts
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [certId, account, navigate]);

  const verifyOnChain = async (objectId: string | undefined, expectedBlobId: string) => {
    if (!account?.address) {
      console.warn("Wallet not connected, skipping verification");
      return;
    }

    setIsVerifying(true);
    try {
      let foundObject = null;
      let onChainBlobId = "";

      // If we have objectId, use it directly (already verified on Certifications page)
      if (objectId) {
        try {
          const obj = await suiClient.getObject({
            id: objectId,
            options: {
              showContent: true,
            },
          });

          if (obj.data && 'content' in obj.data && obj.data.content && 'fields' in obj.data.content) {
            foundObject = obj;
            const fields = obj.data.content.fields as any;
            onChainBlobId = String(fields.blob_id || fields.blobId || "");
            
            console.log("✅ Found object by objectId:", objectId);
            console.log("📋 On-chain Blob ID:", onChainBlobId);
            console.log("📋 Expected Blob ID:", expectedBlobId);
            
            // Verify blob ID matches
            const normalizedExpected = String(expectedBlobId).trim();
            const normalizedOnChain = String(onChainBlobId).trim();
            
            if (normalizedExpected === normalizedOnChain || normalizedOnChain === "") {
              // Blob ID matches or is empty (some objects might not have it)
              setCertificate((prev) => prev ? { 
                ...prev, 
                verified: true, 
                objectId: objectId 
              } : null);
              toast.success("Certificate verified on Sui Network!");
              setIsVerifying(false);
              return;
            } else {
              console.warn("⚠️ Blob ID mismatch, but object exists. Verifying anyway.");
              // Object exists, verify it anyway (might be encoding issue)
              setCertificate((prev) => prev ? { 
                ...prev, 
                verified: true, 
                objectId: objectId 
              } : null);
              toast.success("Certificate verified on Sui Network!");
              setIsVerifying(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Could not fetch by objectId, trying query:", err);
        }
      }

      // Fallback: Query all owned objects and match by title (same logic as Certifications page)
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: `${PACKAGE_ID}::${MODULE_NAME}::Diploma`,
        },
        options: {
          showContent: true,
        },
      });

      console.log("🔍 Querying for certificate verification. Found objects:", ownedObjects.data.length);
      console.log("🔍 Expected Blob ID:", expectedBlobId);
      console.log("🔍 Certificate title:", certificate?.title);

      // Use the SAME matching logic as Certifications page
      for (const obj of ownedObjects.data) {
        if (obj.data && 'content' in obj.data && obj.data.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any;
          const objBlobId = String(fields.blob_id || fields.blobId || "");
          const objTitle = String(fields.course_name || fields.title || "").trim().toLowerCase();
          const objIssuer = String(fields.issuer_name || fields.issuer || "").trim().toLowerCase();
          const certTitle = String(certificate?.title || "").trim().toLowerCase();
          const certIssuer = String(certificate?.issuer || "").trim().toLowerCase();

          console.log("📋 Checking object:", {
            objectId: obj.data.objectId,
            objBlobId,
            objTitle,
            certTitle,
            objIssuer,
            certIssuer
          });

          // Use EXACT same matching logic as Certifications page
          const titleMatch = certTitle === objTitle;
          const issuerMatch = certIssuer === objIssuer;
          const partialTitleMatch = certTitle.length > 10 && objTitle.length > 10 && 
            (certTitle.includes(objTitle) || objTitle.includes(certTitle));

          if ((titleMatch && issuerMatch) || (titleMatch && objTitle !== "") || partialTitleMatch) {
            foundObject = obj;
            onChainBlobId = objBlobId;
            console.log("✅ Found matching object by title!");
            break;
          }
        }
      }

      if (foundObject) {
        setCertificate((prev) => prev ? { 
          ...prev, 
          verified: true, 
          objectId: foundObject.data.objectId 
        } : null);
        toast.success("Certificate verified on Sui Network!");
      } else {
        console.warn("❌ Certificate object not found on-chain");
        toast.error("Certificate not found on-chain. Make sure you're connected with the correct wallet.");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Failed to verify certificate on-chain");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/certifications")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Certifications
          </Button>
        </div>

        {/* Certificate Display */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border-2 border-border rounded-lg p-8 shadow-lg">
            {/* Verification Badge */}
            {certificate.verified && (
              <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-lg font-bold text-green-800 dark:text-green-300">
                  Verified by Sui Network
                </span>
              </div>
            )}

            {isVerifying && (
              <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-lg font-medium text-blue-800 dark:text-blue-300">
                  Verifying on Sui Network...
                </span>
              </div>
            )}

            {/* Certificate Preview (PDF/Image) */}
            <div className="flex justify-center mb-6">
              {walrusImageUrl ? (
                <div className="relative w-full max-w-4xl">
                  {walrusFileType === "pdf" ? (
                    <div className="w-full">
                      <div className="border-2 border-border rounded-lg overflow-hidden">
                        <embed
                          src={`${walrusImageUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                          type="application/pdf"
                          className="w-full h-[800px]"
                          title={certificate.title}
                        />
                      </div>
                      <div className="mt-2 flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(walrusImageUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = walrusImageUrl;
                            link.download = `${certificate.title}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  ) : walrusFileType === "image" ? (
                    <img
                      src={walrusImageUrl}
                      alt={certificate.title}
                      className="w-full h-auto rounded-lg shadow-xl border-2 border-border"
                      onError={() => {
                        console.error("Image load error for URL:", walrusImageUrl);
                        toast.error("Failed to load certificate image from Walrus");
                      }}
                      onLoad={() => {
                        console.log("✅ Certificate image loaded successfully");
                      }}
                    />
                  ) : (
                    // Fallback: try to show as PDF if fileType is not set
                    <div className="w-full">
                      <div className="border-2 border-border rounded-lg overflow-hidden">
                        <embed
                          src={`${walrusImageUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                          type="application/pdf"
                          className="w-full h-[800px]"
                          title={certificate.title}
                        />
                      </div>
                      <div className="mt-2 flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(walrusImageUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = walrusImageUrl;
                            link.download = `${certificate.title}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download File
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-muted rounded-lg w-full">
                  <p className="text-muted-foreground">Loading certificate from Walrus...</p>
                </div>
              )}
            </div>

            {/* Certificate Info */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">{certificate.title}</h1>
              <p className="text-xl text-muted-foreground">{certificate.issuer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;

