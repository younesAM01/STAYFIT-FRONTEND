import React from 'react';
import { Check } from 'lucide-react';

const MembershipPlans = () => {
  const plans = [
    {
      id: 'starter',
      name: 'STARTER PLAN',
      price: '$40',
      period: 'per month',
      features: [
        'Unlimited club access',
        'Open 24/7',
        'Access to live team training',
        'Spa & fight club',
        'Functional Fitness 1 on 1',
        'Personal Health Coaching'
      ],
      highlight: false
    },
    {
      id: 'standard',
      name: 'STANDARD PLAN',
      price: '$100',
      period: 'per month',
      features: [
        'Unlimited club access',
        'Diet Plan included',
        '5 Days a Week',
        'Open, fight club',
        'Health and Fitness Tips',
        'Personal Health Coaching'
      ],
      highlight: true
    },
    {
      id: 'premium',
      name: 'PREMIUM PLAN',
      price: '$140',
      period: 'per month',
      features: [
        'Membership Card',
        '7 Days a Week',
        'Diet Plan included',
        'Spa & Fight club, Cardio Classes',
        'Health and Fitness Tips',
        'Personal Health Coaching'
      ],
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center py-16 px-4 bg-opacity-90 relative">
      {/* Background overlay with fitness images */}
      <div className="absolute inset-0 bg-red-950 bg-opacity-80 z-0"></div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center relative z-10">
        MEMBERSHIP PLAN
      </h1>
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-6xl justify-center relative z-10">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`w-full md:w-1/3 border border-gray-700 rounded-lg p-6 transition-transform hover:scale-105 ${
              plan.highlight ? 'border-red-600' : ''
            }`}
          >
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              {plan.name}
            </h2>
            
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="text-sm text-gray-400 ml-1">{plan.period}</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="text-white h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex justify-center">
              <button 
                className={`px-6 py-2 rounded font-medium transition-colors ${
                  plan.highlight 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'border border-white text-white hover:bg-white hover:text-red-900'
                }`}
              >
                GET STARTED
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipPlans;