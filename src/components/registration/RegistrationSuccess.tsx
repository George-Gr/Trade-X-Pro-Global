import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Mail, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RegistrationSuccessProps {
  email: string;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ email }) => {
  return (
    <div className="min-h-screen bg-primary relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 pattern-grid opacity-30" />
        <div className="absolute inset-0 pattern-mesh" />
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-gold/30 to-transparent blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-green-500/30 to-transparent blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 pattern-dots opacity-20" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card border border-primary-foreground/20 backdrop-blur-xl bg-primary-foreground/10 shadow-2xl p-8 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-primary-foreground mb-2">
                Registration Successful!
              </h1>
              <p className="text-primary-foreground/70 mb-6">
                Your Trade X Pro account has been created
              </p>
            </motion.div>

            {/* Email Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-gold" />
                <span className="text-primary-foreground font-medium">
                  Check Your Email
                </span>
              </div>
              <p className="text-sm text-primary-foreground/60">
                We've sent a verification link to:
              </p>
              <p className="text-gold font-medium mt-1">{email}</p>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 mb-6"
            >
              <h3 className="text-sm font-semibold text-primary-foreground">
                What's Next?
              </h3>
              <div className="text-left space-y-2">
                <div className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 text-gold text-xs font-bold">
                    1
                  </span>
                  <span className="text-primary-foreground/80">
                    Verify your email address
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 text-gold text-xs font-bold">
                    2
                  </span>
                  <span className="text-primary-foreground/80">
                    Complete KYC verification
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 text-gold text-xs font-bold">
                    3
                  </span>
                  <span className="text-primary-foreground/80">
                    Wait for admin to fund your account
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 text-gold text-xs font-bold">
                    4
                  </span>
                  <span className="text-primary-foreground/80">
                    Start trading!
                  </span>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/login">
                <Button className="w-full btn-glow bg-gold text-gold-foreground hover:bg-gold-hover py-6 text-lg font-bold shadow-lg hover:shadow-gold/25 transition-all duration-300 group">
                  Continue to Login
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-foreground/50 hover:text-primary-foreground/70 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Trade X Pro</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
