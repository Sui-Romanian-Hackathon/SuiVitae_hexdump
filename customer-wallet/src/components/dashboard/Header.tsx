import { motion } from 'framer-motion';
import { Search, Wallet, LogOut, ChevronDown, GraduationCap, Settings } from 'lucide-react';
import { useState } from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import { TopNav } from './TopNav';

interface HeaderProps {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  onDisconnect: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header = ({ 
  isConnected, 
  address, 
  balance, 
  onDisconnect,
  activeTab,
  onTabChange,
}: HeaderProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
      className="sticky top-0 z-20"
    >
      {/* Top bar - Enhanced glass */}
      <div className="glass border-b border-white/20 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-foreground tracking-tight text-sm">SuiVitae</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Certificate Wallet</p>
            </div>
          </div>

          {/* Search - Glass styled */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search certificates..."
                className="w-full pl-10 pr-4 py-2 rounded-xl glass-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/40 text-xs text-muted-foreground border border-white/30">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            >
              <Settings className="w-4 h-4" />
            </motion.button>

            {/* Wallet Button - Using dapp-kit ConnectButton */}
            <div className="relative">
              {isConnected ? (
                <>
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full glass-subtle hover:bg-white/40 transition-all group"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
                      <Wallet className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <span className="text-xs font-medium text-foreground hidden sm:inline">{address}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </motion.button>
                </>
              ) : (
                <div className="[&_button]:!flex [&_button]:!items-center [&_button]:!gap-2 [&_button]:!px-4 [&_button]:!py-2 [&_button]:!rounded-full [&_button]:!bg-gradient-to-r [&_button]:!from-primary [&_button]:!to-accent [&_button]:!text-primary-foreground [&_button]:!font-medium [&_button]:!text-sm [&_button]:!shadow-lg [&_button]:!shadow-primary/25 [&_button]:!hover:shadow-xl [&_button]:!hover:shadow-primary/30 [&_button]:!transition-all">
                  <ConnectButton />
                </div>
              )}

              {/* Dropdown - Solid background for visibility */}
              {showDropdown && isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 glass-elevated rounded-2xl p-2 z-50"
                >
                  <div className="px-3 py-2 border-b border-white/20 mb-2">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="text-sm font-semibold text-foreground">{balance}</p>
                  </div>
                  <button
                    onClick={() => {
                      onDisconnect();
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs - Subtle glass background */}
      <div className="glass-subtle border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <TopNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      </div>
    </motion.header>
  );
};
