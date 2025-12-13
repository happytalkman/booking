import React, { useState } from 'react';
import SecurityDashboard from './SecurityDashboard';
import { Language } from '../types';

interface SecurityDashboardButtonProps {
  lang: Language;
}

const SecurityDashboardButton: React.FC<SecurityDashboardButtonProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <SecurityDashboard 
        lang={lang} 
        isOpen={isOpen} 
        onToggle={() => setIsOpen(!isOpen)} 
      />
      
      {/* 오버레이 패널 */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50">
          <SecurityDashboard 
            lang={lang} 
            isOpen={true} 
            onToggle={() => setIsOpen(false)} 
          />
        </div>
      )}
    </div>
  );
};

export default SecurityDashboardButton;