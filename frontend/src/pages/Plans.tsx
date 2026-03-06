import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, CreditCard, Zap, Crown, Star, Building, Gift, CheckCircle, Coins } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { showUpgradePlan, addFreeCredits } from '../components/Toast';
import { userApi } from '../services/api';
import BackButton from '../components/BackButton';

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 100,
    features: [
      '100 Resume Analyses',
      'Resume Builder',
      'Basic AI Suggestions',
      'PDF Export',
      'Email Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    credits: 500,
    features: [
      '500 Resume Analyses',
      'Priority Processing',
      'Advanced AI Insights',
      'All Export Formats',
      'Priority Support',
      'Custom Templates',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49,
    credits: 1500,
    features: [
      'Unlimited Analyses',
      'Real-time Processing',
      'Full AI Suite',
      'API Access',
      '24/7 Support',
      'Team Management',
      'Custom Branding',
    ],
  },
];

export default function Plans() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [canUseFreeCredits, setCanUseFreeCredits] = useState(true);
  const [freeCreditsUsed, setFreeCreditsUsed] = useState(false);

  useEffect(() => {
    checkFreeCreditsStatus();
  }, [user]);

  const checkFreeCreditsStatus = async () => {
    if (!user) return;
    
    try {
      const response = await userApi.getFreeCreditsStatus();
      if (response.data.success) {
        setCanUseFreeCredits(response.data.data.canUseFreeCredits);
      }
    } catch (error) {
      console.error('Error checking free credits status:', error);
    }
  };

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      navigate('/dashboard');
      return;
    }
    showUpgradePlan();
  };

  const handleBuyCredits = async (credits: number, price: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (price === 0) {
      if (!canUseFreeCredits) {
        toast.info('You have already used your free credits for today. Come back tomorrow!');
        return;
      }

      setLoading('freeCredits');
      try {
        const result = await addFreeCredits();
        if (result) {
          await refreshUser();
          setCanUseFreeCredits(false);
          setFreeCreditsUsed(true);
          toast.success(result.message || 'Free credits added successfully!');
        }
      } catch (error: any) {
        console.error('Failed to add free credits:', error);
        toast.error(error.response?.data?.message || 'Failed to add free credits');
      } finally {
        setLoading(null);
      }
      return;
    }

    setLoading('buyCredits');
    try {
      toast.success(`Successfully purchased ${credits} credits! (Demo)`);
      await refreshUser();
    } catch (error) {
      toast.error('Failed to purchase credits');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton />
        </div>

        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-primary/10 to-purple-10 dark:from-primary/20 dark:to-purple-20 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Plan</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                  {user.subscription.plan} Plan
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Credits</p>
              <p className="text-2xl font-bold text-primary">{user.subscription.credits}</p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get more credits to analyze your resumes and land your dream job. 
            Upgrade anytime as your needs grow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-10' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  {plan.id === 'free' && <Zap className="w-6 h-6 text-yellow-500" />}
                  {plan.id === 'pro' && <Crown className="w-6 h-6 text-purple-500" />}
                  {plan.id === 'enterprise' && <Building className="w-6 h-6 text-blue-500" />}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {plan.credits}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">credits</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.price === 0 ? 'Current Plan' : 'Coming Soon'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <div className="bg-gradient-to-r from-primary/10 to-purple-10 dark:from-primary/20 dark:to-purple-20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Need More Credits?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Purchase additional credits anytime on the free plan
                </p>
              </div>
              <CreditCard className="w-12 h-12 text-primary" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => handleBuyCredits(50, 4.99)}
                disabled={loading === 'buyCredits'}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
              >
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">50</div>
                <div className="text-sm text-gray-500">$4.99</div>
              </button>
              <button
                onClick={() => handleBuyCredits(150, 9.99)}
                disabled={loading === 'buyCredits'}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
              >
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">150</div>
                <div className="text-sm text-gray-500">$9.99</div>
              </button>
              <button
                onClick={() => handleBuyCredits(500, 19.99)}
                disabled={loading === 'buyCredits'}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-primary"
              >
                <div className="text-2xl font-bold text-primary mb-1">500</div>
                <div className="text-sm text-primary">$19.99</div>
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-green-500" />
                    Free Daily Credits
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get 20 free credits (1 time per day)
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleBuyCredits(20, 0)}
                disabled={loading === 'freeCredits' || !canUseFreeCredits || freeCreditsUsed}
                className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  canUseFreeCredits && !freeCreditsUsed
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading === 'freeCredits' ? (
                  <>Processing...</>
                ) : freeCreditsUsed || !canUseFreeCredits ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Free Credits Used Today
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    Get 20 Free Credits
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Click any pack to purchase credits instantly
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
