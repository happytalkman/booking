import React, { useState } from 'react';
import MultimodalAIAssistant from './MultimodalAIAssistant';
import { Language } from '../types';

interface MultimodalAIButtonProps {
  lang: Language;
}

const MultimodalAIButton: React.FC<MultimodalAIButtonProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <MultimodalAIAssistant 
        lang={lang} 
        isOpen={isOpen} 
        onToggle={() => setIsOpen(!isOpen)} 
      />
      
      {/* 오버레이 패널 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <MultimodalAIAssistant 
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

export default MultimodalAIButton;