import React, { useState } from 'react';
import SmartRecommendationCenter from './SmartRecommendationCenter';
import { Language } from '../types';

interface SmartRecommendationButtonProps {
  lang: Language;
}

const SmartRecommendationButton: React.FC<SmartRecommendationButtonProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <SmartRecommendationCenter 
        lang={lang} 
        isOpen={isOpen} 
        onToggle={() => setIsOpen(!isOpen)} 
      />
      
      {/* 오버레이 패널 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-7xl max-h-[90vh] overflow-auto">
            <SmartRecommendationCenter 
              lang={lang} 
              isOpen={true} 
              onToggle={() => setIsOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartRecommendationButton;