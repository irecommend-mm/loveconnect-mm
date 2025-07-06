
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Heart, Eye, Zap, MessageCircle, Shield, X } from 'lucide-react';

interface PremiumFeaturesProps {
  onClose: () => void;
  onUpgrade: (plan: string) => void;
}

const PremiumFeatures = ({ onClose, onUpgrade }: PremiumFeaturesProps) => {
  const plans = [
    {
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      features: [
        'Unlimited likes',
        'See who likes you',
        'Rewind your last swipe',
        'One Boost per month',
        'Read receipts'
      ],
      popular: false
    },
    {
      name: 'Premium+',
      price: '$19.99',
      period: 'month',
      features: [
        'Everything in Premium',
        '5 Super Likes per week',
        'Weekly Boost',
        'Priority customer support',
        'Advanced filters',
        'Incognito mode'
      ],
      popular: true
    },
    {
      name: 'Gold',
      price: '$29.99',
      period: 'month',
      features: [
        'Everything in Premium+',
        'Unlimited Super Likes',
        'Daily Boost',
        'Profile verification',
        'Message before matching',
        'Premium profile badge'
      ],
      popular: false
    }
  ];

  const allFeatures = [
    { icon: Heart, title: 'Unlimited Likes', description: 'Like as many profiles as you want' },
    { icon: Eye, title: 'See Who Likes You', description: 'No more guessing - see everyone who liked you' },
    { icon: Zap, title: 'Boost Your Profile', description: 'Be seen by more people in your area' },
    { icon: MessageCircle, title: 'Read Receipts', description: 'Know when your messages are read' },
    { icon: Shield, title: 'Incognito Mode', description: 'Browse profiles privately' },
    { icon: Crown, title: 'Super Likes', description: 'Stand out with special likes' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-md p-6 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold">Premium Features</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allFeatures.map((feature, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl">
                <feature.icon className="h-8 w-8 text-purple-500 mb-3" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-purple-500 shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => onUpgrade(plan.name)}
                  >
                    Choose {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>All plans include a 7-day free trial. Cancel anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatures;
