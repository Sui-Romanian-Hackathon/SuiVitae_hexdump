import { motion } from 'framer-motion';
import { Wallet, Shield, Zap, Globe, GraduationCap } from 'lucide-react';
import { ConnectButton } from '@mysten/dapp-kit';

export const ConnectScreen = () => {
  const features = [
    { icon: Shield, label: 'Secure & Decentralized' },
    { icon: Zap, label: 'Instant Verification' },
    { icon: Globe, label: 'Globally Recognized' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
    <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className="w-full max-w-md"
    >
    {/* Main Card - Enhanced glass */}
    <div className="glass-elevated rounded-[2rem] p-8 relative overflow-hidden">
    {/* Decorative gradient orbs */}
    <div className="absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-br from-primary/40 to-accent/30 rounded-full blur-3xl animate-pulse-glow" />
    <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-gradient-to-br from-accent/30 to-primary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

    {/* Content */}
    <div className="relative">
    {/* Logo */}
    <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
    className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/30"
    >
    <GraduationCap className="w-10 h-10 text-primary-foreground" />
    </motion.div>

    <motion.h1
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="text-2xl font-bold text-center text-foreground mb-2"
    >
    SuiVitae Passport
    </motion.h1>

    <motion.p
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="text-center text-muted-foreground text-sm mb-8"
    >
    Your credentials, permanently stored on the blockchain.
    <br />
    Verifiable. Portable. Yours forever.
    </motion.p>

    {/* Features - Glass styled */}
    <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="flex justify-center gap-4 mb-8"
    >
    {features.map((feature, index) => {
      const Icon = feature.icon;
      return (
        <motion.div
        key={feature.label}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 + index * 0.1 }}
        className="flex flex-col items-center gap-2"
        >
        <div className="w-11 h-11 rounded-xl glass-subtle flex items-center justify-center border border-white/30">
        <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-[10px] text-muted-foreground font-medium text-center max-w-[70px]">
        {feature.label}
        </span>
        </motion.div>
      );
    })}
    </motion.div>

    {/* Connect Button - Using dapp-kit ConnectButton */}
    <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.7 }}
    className="w-full"
    >
    <div className="[&_button]:!w-full [&_button]:!flex [&_button]:!items-center [&_button]:!justify-center [&_button]:!gap-3 [&_button]:!px-6 [&_button]:!py-4 [&_button]:!rounded-2xl [&_button]:!bg-gradient-to-r [&_button]:!from-primary [&_button]:!to-accent [&_button]:!text-primary-foreground [&_button]:!font-semibold [&_button]:!text-base [&_button]:!shadow-xl [&_button]:!shadow-primary/30 [&_button]:!hover:shadow-2xl [&_button]:!hover:shadow-primary/40 [&_button]:!transition-all">
      <ConnectButton />
    </div>
    </motion.div>

    <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.8 }}
    className="text-center text-xs text-muted-foreground mt-4"
    >
    Supports Sui Wallet, Suiet & Ethos Wallet
    </motion.p>
    </div>
    </div>

    {/* Bottom text */}
    <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1 }}
    className="text-center text-xs text-muted-foreground mt-6"
    >
    Powered by Sui Blockchain & Walrus Protocol
    </motion.p>
    </motion.div>
    </div>
  );
};
