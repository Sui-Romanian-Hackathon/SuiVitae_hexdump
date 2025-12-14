import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Header } from '@/components/dashboard/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ConnectScreen } from '@/components/dashboard/ConnectScreen';

const Index = () => {
  const { isConnected, address, fullAddress, balance, disconnect } = useWallet();
  const [activeTab, setActiveTab] = useState('all');

  if (!isConnected) {
    return (
      <div className="min-h-screen mesh-gradient">
        <ConnectScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient">
      <Header
        isConnected={isConnected}
        address={address}
        balance={balance}
        onDisconnect={disconnect}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Dashboard activeTab={activeTab} walletAddress={fullAddress} />
    </div>
  );
};

export default Index;
