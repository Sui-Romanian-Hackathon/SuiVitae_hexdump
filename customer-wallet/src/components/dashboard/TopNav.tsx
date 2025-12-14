import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  Clock, 
  Star, 
  Shield,
  EyeOff,
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
}

const navItems: NavItem[] = [
  { icon: LayoutGrid, label: 'All', id: 'all' },
  { icon: Clock, label: 'Recent', id: 'recent' },
  { icon: Star, label: 'Favorites', id: 'favorites' },
  { icon: Shield, label: 'Verified', id: 'verified' },
  { icon: EyeOff, label: 'Hidden', id: 'hidden' },
];

interface TopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TopNav = ({ activeTab, onTabChange }: TopNavProps) => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex items-center justify-center py-3"
    >
      {/* Floating Pill Navigation - Enhanced glass effect */}
      <div className="glass-pill rounded-full px-1.5 py-1 flex items-center gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/30'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full shadow-lg shadow-primary/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-primary-foreground' : ''}`} />
              <span className="relative z-10 hidden sm:inline">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};
