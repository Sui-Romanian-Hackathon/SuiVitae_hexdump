import { useCallback, useState } from 'react';
import { useCurrentAccount, useCurrentWallet, useDisconnectWallet, useConnectWallet, useSuiClient } from '@mysten/dapp-kit';
import { formatAddress } from '@mysten/sui.js/utils';
import { useQuery } from '@tanstack/react-query';

export const useWallet = () => {
  const currentAccount = useCurrentAccount();
  const { currentWallet, isConnected } = useCurrentWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutateAsync: connect } = useConnectWallet();
  const client = useSuiClient();
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch balance
  const { data: balance } = useQuery({
    queryKey: ['sui-balance', currentAccount?.address],
    queryFn: async () => {
      if (!currentAccount?.address) return null;
      const balance = await client.getBalance({
        owner: currentAccount.address,
      });
      return balance;
    },
    enabled: !!currentAccount?.address,
  });

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [connect]);

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const formattedBalance = balance
    ? `${(Number(balance.totalBalance) / 1e9).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} SUI`
    : null;

  const formattedAddress = currentAccount?.address
    ? formatAddress(currentAccount.address)
    : null;

  return {
    isConnected: isConnected && !!currentAccount,
    address: formattedAddress,
    fullAddress: currentAccount?.address || null, // Full address for blockchain queries
    balance: formattedBalance,
    isConnecting,
    connect: connectWallet,
    disconnect: disconnectWallet,
    currentAccount, // Expose for certificate fetching
  };
};
