import { motion } from 'framer-motion';
import { Shield, Clock, ExternalLink } from 'lucide-react';
import type { Certificate } from '@/hooks/useMyCertificates';

interface CredentialCardProps {
  certificate: Certificate;
  index: number;
  onClick: () => void;
}

const gradientMap = {
  purple: 'from-violet-600 via-purple-600 to-indigo-600',
  teal: 'from-teal-500 via-cyan-600 to-blue-600',
  pink: 'from-pink-500 via-rose-500 to-purple-600',
  orange: 'from-orange-500 via-amber-500 to-rose-500',
};

export const CredentialCard = ({ certificate, index, onClick }: CredentialCardProps) => {
  const gradient = gradientMap[certificate.gradient];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: index * 0.08,
      }}
      whileHover={{ 
        y: -8,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div
        className={`relative h-52 rounded-3xl bg-gradient-to-br ${gradient} p-6 overflow-hidden shadow-card group-hover:shadow-card-hover transition-shadow duration-300`}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl transform -translate-x-5 translate-y-5" />
        </div>

        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
                {certificate.issuerLogo}
              </div>
              <div>
                <p className="text-white/80 text-xs font-medium">{certificate.issuer}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {certificate.status === 'verified' ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  <Shield className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-semibold text-white uppercase tracking-wide">Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  <Clock className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-semibold text-white uppercase tracking-wide">Pending</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div>
            <h3 className="text-white font-semibold text-lg leading-tight mb-2 line-clamp-2">
              {certificate.title}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-xs">
                {new Date(certificate.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 text-white/60 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </motion.div>
            </div>

            {/* Skills */}
            {certificate.skills && (
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {certificate.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 text-[10px] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
        />
      </div>
    </motion.div>
  );
};
