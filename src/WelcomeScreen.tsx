'use client';

import { Button } from '@/components/ui/button';
import { WalletSelector } from '@/components/wallet/WalletSelector';
import { 
  Zap, 
  Shield, 
  Rocket, 
  Users, 
  TrendingUp, 
  Coins,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered',
      description: 'Create DeFi products with natural language',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Built on Aptos blockchain with advanced security',
    },
    {
      icon: Rocket,
      title: 'Fast',
      description: 'Deploy tokens and pools in minutes',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join the growing Aptos DeFi ecosystem',
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Connect Wallet',
      description: 'Link your Petra or Pontem wallet',
      icon: CheckCircle,
    },
    {
      number: 2,
      title: 'Chat with AI',
      description: 'Describe what you want to create',
      icon: CheckCircle,
    },
    {
      number: 3,
      title: 'Deploy & Earn',
      description: 'Launch your DeFi product on Aptos',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl font-bold">AA</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to{' '}
            <span className="gradient-text">Aptos Assistant</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The first AI-powered DeFi platform that lets you create tokens, 
            liquidity pools, and yield vaults on Aptos using natural language.
          </p>

          <div className="flex items-center justify-center space-x-4 mb-8">
            <WalletSelector />
            <Button
              onClick={onGetStarted}
              variant="outline"
              size="lg"
              className="btn-animate"
            >
              Explore Demo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 card-hover"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">2 min</div>
            <div className="text-gray-600">Average creation time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
            <div className="text-gray-600">AI-powered assistance</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
            <div className="text-gray-600">No coding required</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Create Your First DeFi Product?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of users building the future of DeFi on Aptos
          </p>
          <div className="flex items-center justify-center space-x-4">
            <WalletSelector />
            <Button
              onClick={onGetStarted}
              size="lg"
              className="btn-animate"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
