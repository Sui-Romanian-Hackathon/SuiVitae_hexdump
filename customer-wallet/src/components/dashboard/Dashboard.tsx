import { motion } from 'framer-motion';
import { useMyCertificates } from '@/hooks/useMyCertificates';
import { CredentialCard } from './CredentialCard';
import { CertificateModal } from './CertificateModal';
import { useState, useMemo } from 'react';
import type { Certificate } from '@/hooks/useMyCertificates';
import { Award, TrendingUp, Sparkles } from 'lucide-react';

interface DashboardProps {
  activeTab: string;
  walletAddress: string | null;
}

export const Dashboard = ({ activeTab, walletAddress }: DashboardProps) => {
  const { certificates, isLoading } = useMyCertificates(walletAddress);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const filteredCertificates = useMemo(() => {
    switch (activeTab) {
      case 'recent':
        return [...certificates].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 3);
      case 'verified':
        return certificates.filter(c => c.status === 'verified');
      case 'favorites':
        return [];
      default:
        return certificates;
    }
  }, [certificates, activeTab]);

  const verifiedCount = certificates.filter(c => c.status === 'verified').length;

  const getTabTitle = () => {
    switch (activeTab) {
      case 'recent': return 'Recent Credentials';
      case 'verified': return 'Verified Credentials';
      case 'favorites': return 'Favorite Credentials';
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
        {/* Stats - Enhanced glass cards */}
        <div className="flex gap-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-elevated rounded-xl p-3 flex items-center gap-2 flex-1 min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-foreground">{certificates.length}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-elevated rounded-xl p-3 flex items-center gap-2 flex-1 min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/10 backdrop-blur-sm border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-foreground">{verifiedCount}</p>
              <p className="text-[10px] text-muted-foreground">Verified</p>
            </div>
          </motion.div>
        </div>

        {/* Section Title */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">{getTabTitle()}</h2>
            <p className="text-sm text-muted-foreground">
              {getTabDescription()}
            </p>
          </div>
        </motion.div>

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
