import { useState } from "react";
import { Award, Download, ExternalLink, Calendar, Loader2, CheckCircle2, Link2, Shield, Eye, Linkedin, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WALRUS_AGGREGATOR } from "@/constants";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { uploadToWalrus } from "@/lib/walrus";

interface CertificationCardProps {
  title: string;
  issuer: string;
  issuedDate: string;
  credentialId: string;
  image: string;
  // ✨ NEW PROPS FOR LOGIC
  isVerifying?: boolean;
  isVerified?: boolean;
  onVerify?: () => void;
  // ✨ ON-CHAIN DATA PROPS
  transactionId?: string;
  explorerUrl?: string;
  blobId?: string;
  mintedAt?: number;
  objectId?: string; // Sui object ID for the diploma
}

export function CertificationCard({
  title,
  issuer,
  issuedDate,
  credentialId,
  image,
  isVerifying,
  isVerified,
  onVerify,
  transactionId,
  explorerUrl,
  blobId,
  mintedAt,
  objectId,
}: CertificationCardProps) {
  const navigate = useNavigate();
  const isDevMode = import.meta.env.DEV;
  const [isUploadingTest, setIsUploadingTest] = useState(false);

  const handleViewCertificate = () => {
    if (!isVerified || !blobId) {
      toast.error("Certificate must be verified to view");
      return;
    }

    // Store certificate data for the view page - use the already verified data
    const certData = {
      title,
      issuer,
      blobId,
      verified: true, // Already verified on Certifications page
      objectId: objectId || undefined, // Sui object ID (already found during verification)
      credentialId, // Store credentialId for reference
    };
    
    console.log("💾 Storing certificate data for view:", certData);
    localStorage.setItem(`cert_${credentialId}`, JSON.stringify(certData));
    navigate(`/certificate/${credentialId}`);
  };

  const handleAddToLinkedIn = async () => {
    if (!isVerified) {
      toast.error("Certificate must be verified to add to LinkedIn");
      return;
    }

    // Create the certificate URL
    const certUrl = `${window.location.origin}/certificate/${credentialId}`;
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(certUrl);
      toast.success("Certificate URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy URL");
    }

    // Open LinkedIn add certification page
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(title)}&organizationName=${encodeURIComponent(issuer)}&issueDate=${encodeURIComponent(issuedDate)}&certUrl=${encodeURIComponent(certUrl)}`;
    window.open(linkedInUrl, "_blank");
  };
  return (
    <div className="border-2 border-border bg-card transition-all hover:shadow-sm group">
      <div className="flex flex-col md:flex-row">
        {/* Certificate Image Area */}
        <div className="relative flex aspect-square w-full items-center justify-center border-b-2 border-border bg-secondary/50 p-8 md:w-48 md:border-b-0 md:border-r-2 overflow-hidden">
          {isVerified ? (
             <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center z-10">
                <CheckCircle2 className="h-16 w-16 text-green-600 drop-shadow-sm" />
             </div>
          ) : (
             <Award className="h-20 w-20 text-primary group-hover:scale-110 transition-transform duration-300" />
          )}
          
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <img src={image} alt="" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col justify-between p-6">
          <div>
            <div className="flex justify-between items-start">
                <h3 className="mb-2 text-xl font-bold">{title}</h3>
                {isVerified && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded border border-green-200">ON-CHAIN</span>}
            </div>
            
            <p className="mb-2 text-muted-foreground">{issuer}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Issued {issuedDate}</span>
            </div>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Credential ID: {credentialId}
            </p>
            
            {/* On-Chain Information */}
            {isVerified && transactionId && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-800 dark:text-green-300">Verified On-Chain</span>
                </div>
                <div className="space-y-1 text-xs font-mono text-green-700 dark:text-green-400">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">TX:</span>
                    <span className="truncate max-w-[200px]">{transactionId}</span>
                  </div>
                  {blobId && (
                    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-semibold text-green-800 dark:text-green-300">Public Verification Link</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Blob ID:</span>
                        <span className="truncate max-w-[200px] font-mono text-xs bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                          {blobId}
                        </span>
                      </div>
                      <a
                        href={`${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 hover:underline flex items-center gap-1.5 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1.5 rounded border border-green-200 dark:border-green-700 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View Original Certificate on Walrus</span>
                      </a>
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        🔗 <strong>100% Public & Verifiable:</strong> Anyone with the Object ID can read the Blob ID from the blockchain and verify the certificate independently on Walrus. This creates a permanent, cryptographic link between Sui and the stored file.
                      </p>
                    </div>
                  )}
                  {mintedAt && (
                    <div className="text-muted-foreground">
                      Minted: {new Date(mintedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-2"
              onClick={async () => {
                const encodedTitle = encodeURIComponent(title);
                
                // Try to download the PDF file
                try {
                  const filePath = `/${encodedTitle}.pdf`;
                  const response = await fetch(filePath, { method: 'HEAD' });
                  if (response.ok) {
                    // File exists, trigger download
                    const link = document.createElement('a');
                    link.href = filePath;
                    link.download = `${title}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    console.warn(`No PDF file found for: ${title}`);
                  }
                } catch (error) {
                  console.warn(`No PDF file found for: ${title}`);
                }
              }}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            
            {/* Dev mode buttons - only visible in development */}
            {isDevMode && isVerified && (
              <>
                {explorerUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 border-2"
                    onClick={() => window.open(explorerUrl, "_blank")}
                  >
                    <Link2 className="h-4 w-4" />
                    Check on-chain
                  </Button>
                )}
                {blobId && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 border-2"
                    onClick={async () => {
                      try {
                        // Fetch the blob from Walrus and download it
                        const response = await fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`, {
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
                          link.download = `${title.replace(/\s+/g, '_')}_walrus.${blob.type.includes('image') ? 'jpg' : 'pdf'}`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                          toast.success("File downloaded from Walrus");
                        } else {
                          toast.error(`Failed to fetch from Walrus: ${response.status}`);
                        }
                      } catch (error) {
                        console.error("Error downloading from Walrus:", error);
                        toast.error("Failed to download file from Walrus");
                      }
                    }}
                  >
                    <Shield className="h-4 w-4" />
                    Check on Walrus
                  </Button>
                )}
                {/* Dev button to test uploading PDF */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-2 border-orange-500"
                  disabled={isUploadingTest}
                  onClick={async () => {
                    setIsUploadingTest(true);
                    try {
                      // Try to find and upload the PDF file
                      const encodedTitle = encodeURIComponent(title);
                      let fileToUpload: File | null = null;
                      let fileExtension = '';
                      
                      // Try PDF
                      try {
                        const filePath = `/${encodedTitle}.pdf`;
                        const response = await fetch(filePath);
                        if (response.ok) {
                          const blob = await response.blob();
                          fileToUpload = new File([blob], `${title}.pdf`, { type: blob.type || "application/pdf" });
                          fileExtension = 'pdf';
                        }
                      } catch (error) {
                        // PDF not found
                      }
                      
                      if (!fileToUpload) {
                        toast.error(`No PDF file found for: ${title}`);
                        setIsUploadingTest(false);
                        return;
                      }
                      
                      toast.info(`Uploading ${fileExtension.toUpperCase()} file to Walrus...`);
                      const uploadedBlobId = await uploadToWalrus(fileToUpload);
                      
                      // Check if it's the same as the existing blobId
                      if (blobId && uploadedBlobId === blobId) {
                        toast.success(`File already on Walrus! Blob ID: ${uploadedBlobId}`);
                      } else {
                        toast.success(`File uploaded successfully! Blob ID: ${uploadedBlobId}`);
                      }
                    } catch (error: any) {
                      console.error("Upload test failed:", error);
                      const errorMessage = error?.message || "Unknown error";
                      
                      // Check for "already on walrus" message
                      if (errorMessage.includes("already") || errorMessage.includes("Already")) {
                        toast.warning("File already exists on Walrus");
                      } else {
                        toast.error(`Failed to upload: ${errorMessage}`);
                      }
                    } finally {
                      setIsUploadingTest(false);
                    }
                  }}
                >
                  {isUploadingTest ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Testing Upload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Test Upload PDF
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Client buttons - visible in production */}
            {isVerified && (
              <>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-2 border-2 bg-primary text-primary-foreground"
                  onClick={handleViewCertificate}
                >
                  <Eye className="h-4 w-4" />
                  View Certificate
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-2 border-2 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddToLinkedIn}
                >
                  <Linkedin className="h-4 w-4" />
                  Add to LinkedIn
                </Button>
              </>
            )}
            
            {/* ⚡ THE MAGIC BUTTON */}
            <Button 
                variant={isVerified ? "secondary" : "default"}
                size="sm" 
                className="gap-2 border-2 min-w-[120px]"
                onClick={onVerify}
                disabled={isVerifying || isVerified}
            >
              {isVerifying ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Minting...
                </>
              ) : isVerified ? (
                <>
                    <CheckCircle2 className="h-4 w-4" />
                    Verified
                </>
              ) : (
                <>
                    <Award className="h-4 w-4" />
                    Verify on Chain
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}