import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Clock, Copy, ExternalLink, CheckCircle2, Eye, EyeOff, Download } from 'lucide-react';
import type { Certificate } from '@/hooks/useMyCertificates';
import { useState } from 'react';
import { useHiddenCertificates } from '@/hooks/useHiddenCertificates';
import { toast } from 'sonner';
import { useCertificatePDF } from '@/hooks/useCertificatePDF';
import { WALRUS_AGGREGATOR } from '@/constants';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

const gradientMap = {
  purple: 'from-violet-600 via-purple-600 to-indigo-600',
  teal: 'from-teal-500 via-cyan-600 to-blue-600',
  pink: 'from-pink-500 via-rose-500 to-purple-600',
  orange: 'from-orange-500 via-amber-500 to-rose-500',
};

export const CertificateModal = ({ certificate, onClose }: CertificateModalProps) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { isHidden, hideCertificate, unhideCertificate } = useHiddenCertificates();
  const { hasFile, fileType, downloadFile } = useCertificatePDF(certificate);

  if (!certificate) return null;

  const certificateIsHidden = isHidden(certificate.id);
  const handleToggleHide = () => {
    if (certificateIsHidden) {
      unhideCertificate(certificate.id);
      toast.success('Certificate unhidden', {
        description: `${certificate.title} is now visible in all tabs.`,
      });
    } else {
      hideCertificate(certificate.id);
      toast.success('Certificate hidden', {
        description: `${certificate.title} has been hidden. View it in the Hidden tab.`,
      });
    }
  };

  const handleDownload = async () => {
    if (!certificate?.blobId) {
      toast.error('No certificate file available');
      return;
    }

    setIsDownloading(true);
    try {
      // Download and detect file type
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
        
        // Detect file type (same logic as main project)
        const contentType = response.headers.get('content-type') || '';
        const contentTypeLower = contentType.toLowerCase();
        const blobTypeLower = (blob.type || '').toLowerCase();
        
        let extension = 'pdf';
        let fileTypeLabel = 'File';
        
        if (contentTypeLower.includes('pdf') || blobTypeLower.includes('pdf')) {
          extension = 'pdf';
          fileTypeLabel = 'PDF';
        } else if (contentTypeLower.includes('jpeg') || contentTypeLower.includes('jpg') || 
                   blobTypeLower.includes('jpeg') || blobTypeLower.includes('jpg')) {
          extension = 'jpg';
          fileTypeLabel = 'Image';
        } else if (contentTypeLower.includes('png') || blobTypeLower.includes('png')) {
          extension = 'png';
          fileTypeLabel = 'Image';
        } else if (contentTypeLower.includes('image')) {
          extension = 'jpg';
          fileTypeLabel = 'Image';
        }
        
        link.download = `${certificate.title.replace(/\s+/g, '_')}_certificate.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Certificate downloaded', {
          description: `${fileTypeLabel} downloaded successfully.`,
        });
      } else {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate', {
        description: 'Please try again later.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const gradient = gradientMap[certificate.gradient];

  const copyId = () => {
    navigator.clipboard.writeText(certificate.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {certificate && (
        <>
          {/* Backdrop - More translucent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/10 backdrop-blur-xl z-50"
          />

          {/* Modal - Enhanced glass */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg glass-elevated rounded-3xl z-50 overflow-hidden"
          >
            {/* Header gradient */}
            <div className={`h-32 bg-gradient-to-br ${gradient} relative`}>
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/30 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform -translate-x-5 translate-y-5" />
              </div>
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-6 flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-white font-bold text-xl border border-white/20">
                  {certificate.issuerLogo}
                </div>
                <div>
                  <p className="text-white/90 text-sm font-medium">{certificate.issuer}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {certificate.status === 'verified' ? (
                      <>
                        <Shield className="w-4 h-4 text-white" />
                        <span className="text-xs font-semibold text-white">Verified on Sui</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-white" />
                        <span className="text-xs font-semibold text-white">Pending Verification</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground leading-tight">
                  {certificate.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Issued on {new Date(certificate.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* Object ID - Glass styled */}
              <div className="p-4 rounded-2xl glass-subtle">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Sui Object ID
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-foreground font-mono truncate">
                    {certificate.id}
                  </code>
                  <button
                    onClick={copyId}
                    className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Skills */}
              {certificate.skills && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Skills & Competencies
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {certificate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-full glass-subtle text-foreground text-sm font-medium border border-primary/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex gap-3">
                  {hasFile && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download {fileType === 'pdf' ? 'PDF' : fileType === 'image' ? 'Image' : 'File'}
                        </>
                      )}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass-subtle text-foreground font-medium text-sm hover:bg-white/50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Explorer
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleToggleHide}
                  className={`w-full px-4 py-3 rounded-xl glass-subtle text-foreground font-medium text-sm hover:bg-white/50 transition-colors flex items-center justify-center gap-2 ${
                    certificateIsHidden ? 'bg-primary/10 border border-primary/20' : ''
                  }`}
                >
                  {certificateIsHidden ? (
                    <>
                      <Eye className="w-4 h-4" />
                      Unhide
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
