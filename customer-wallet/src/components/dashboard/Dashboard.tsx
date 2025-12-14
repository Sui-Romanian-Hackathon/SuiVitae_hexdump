import { motion, AnimatePresence } from 'framer-motion';
import { useMyCertificates } from '@/hooks/useMyCertificates';
import { CredentialCard } from './CredentialCard';
import { CertificateModal } from './CertificateModal';
import { useState, useMemo } from 'react';
import type { Certificate } from '@/hooks/useMyCertificates';
import { Award, TrendingUp, Sparkles, EyeOff } from 'lucide-react';
import { useHiddenCertificates } from '@/hooks/useHiddenCertificates';
import { useCertificatesWithPDF } from '@/hooks/useCertificatesWithPDF';

interface DashboardProps {
  activeTab: string;
  walletAddress: string | null;
}

export const Dashboard = ({ activeTab, walletAddress }: DashboardProps) => {
  const { certificates, isLoading } = useMyCertificates(walletAddress);
  const { hiddenIds, hiddenIdsArray, isHidden } = useHiddenCertificates();
  const certificatesWithPDF = useCertificatesWithPDF(certificates);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const filteredCertificates = useMemo(() => {
    // Filter to only show certificates with files on Walrus (any type)
    let certificatesWithFiles = certificates.filter(c => 
      c.blobId && certificatesWithPDF.has(c.id)
    );

    // For hidden tab, show only hidden certificates
    if (activeTab === 'hidden') {
      return certificatesWithFiles.filter(c => hiddenIds.has(c.id));
    }

    // For all other tabs, exclude hidden certificates
    const visibleCertificates = certificatesWithFiles.filter(c => !hiddenIds.has(c.id));

    switch (activeTab) {
      case 'recent':
        return [...visibleCertificates].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 3);
      case 'verified':
        return visibleCertificates.filter(c => c.status === 'verified');
      case 'favorites':
        return [];
      default:
        return visibleCertificates;
    }
  }, [certificates, activeTab, hiddenIdsArray, certificatesWithPDF]);

  // Only count certificates with PDFs
  const visibleCertificates = useMemo(() => 
    certificates.filter(c => 
      !hiddenIds.has(c.id) && 
      c.blobId && 
      certificatesWithPDF.has(c.id)
    ),
    [certificates, hiddenIdsArray, certificatesWithPDF]
  );
  
  const verifiedCount = useMemo(() => 
    visibleCertificates.filter(c => c.status === 'verified').length,
    [visibleCertificates]
  );
  
  const hiddenCount = useMemo(() => 
    certificates.filter(c => 
      hiddenIds.has(c.id) && 
      c.blobId && 
      certificatesWithPDF.has(c.id)
    ).length,
    [certificates, hiddenIdsArray, certificatesWithPDF]
  );

  const getTabTitle = () => {
    switch (activeTab) {
      case 'recent': return 'Recent Credentials';
      case 'verified': return 'Verified Credentials';
      case 'favorites': return 'Favorite Credentials';
      case 'hidden': return 'Hidden Credentials';
      default: return 'All Credentials';
    }
  };

  const getTabDescription = () => {
    if (isLoading) {
      return 'Loading certificates from blockchain...';
    }
    
    switch (activeTab) {
      case 'recent':
        return filteredCertificates.length > 0 
          ? 'Your most recently issued credentials'
          : 'No recent credentials found';
      case 'verified':
        return filteredCertificates.length > 0
          ? 'Credentials verified and stored on the Sui blockchain'
          : 'No verified credentials found';
      case 'favorites':
        return filteredCertificates.length === 0
          ? 'Star certificates to add them to favorites'
          : 'Your favorite credentials for quick access';
      case 'hidden':
        return filteredCertificates.length > 0
          ? `You have ${hiddenCount} hidden ${hiddenCount === 1 ? 'credential' : 'credentials'}. Click to unhide.`
          : 'No hidden credentials. Hide certificates from their detail view.';
      default:
        return filteredCertificates.length > 0
          ? 'All your certificates and diplomas stored on the Sui blockchain'
          : 'No credentials found. Connect your wallet to view your certificates.';
    }
  };

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {/* Stats - Enhanced glass cards - Same line, responsive */}
        <div className="flex flex-wrap gap-3 md:gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-elevated rounded-2xl p-3 md:p-5 flex items-center gap-2 md:gap-4 flex-1 min-w-[140px] md:min-w-0"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xl md:text-2xl font-bold text-foreground">{visibleCertificates.length}</p>
              <p className="text-xs md:text-sm text-muted-foreground truncate">Visible</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-elevated rounded-2xl p-3 md:p-5 flex items-center gap-2 md:gap-4 flex-1 min-w-[140px] md:min-w-0"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 backdrop-blur-sm border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl md:text-2xl font-bold text-foreground">{verifiedCount}</p>
              <p className="text-xs md:text-sm text-muted-foreground truncate">Verified</p>
            </div>
          </motion.div>
        </div>

        {/* Section Title - Use AnimatePresence to prevent stacking */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h2 className="text-xl font-semibold text-foreground">{getTabTitle()}</h2>
              <p className="text-sm text-muted-foreground">
                {getTabDescription()}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Loading state */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-elevated rounded-3xl p-12 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full"
            />
            <h3 className="text-lg font-semibold text-foreground mb-2">Loading Certificates</h3>
            <p className="text-sm text-muted-foreground">
              Fetching your credentials from the Sui blockchain...
            </p>
          </motion.div>
        ) : activeTab === 'favorites' && filteredCertificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-elevated rounded-3xl p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass-subtle flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No favorites yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Click the star icon on any credential to add it to your favorites for quick access.
            </p>
          </motion.div>
        ) : activeTab === 'hidden' && filteredCertificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-elevated rounded-3xl p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass-subtle flex items-center justify-center">
              <EyeOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No hidden credentials</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Hide certificates from their detail view to organize your credentials. Hidden certificates won't appear in other tabs.
            </p>
          </motion.div>
        ) : filteredCertificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-elevated rounded-3xl p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass-subtle flex items-center justify-center">
              <Award className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No certificates with files found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Only certificates with files uploaded to Walrus are displayed here. Verify your certificates in the main app to upload files.
            </p>
          </motion.div>
        ) : (
          /* Grid */
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredCertificates.map((certificate, index) => (
              <CredentialCard
                key={certificate.id}
                certificate={certificate}
                index={index}
                onClick={() => setSelectedCertificate(certificate)}
              />
            ))}
          </motion.div>
        )}
      </motion.main>

      <CertificateModal
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />
    </>
  );
};
