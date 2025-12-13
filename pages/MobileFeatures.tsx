import React from 'react';
import MobileEnhancedFeatures from '../components/MobileEnhancedFeatures';

interface MobileFeaturesProps {
  lang: 'ko' | 'en';
}

const MobileFeatures: React.FC<MobileFeaturesProps> = ({ lang }) => {
  return (
    <div className="space-y-6">
      <MobileEnhancedFeatures lang={lang} />
    </div>
  );
};

export default MobileFeatures;