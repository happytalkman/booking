import React, { useState } from 'react';
import { Filter, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../types';

interface RelationshipFilterProps {
  lang: Language;
  relationships: string[];
  visibleRelationships: string[];
  onRelationshipToggle: (relationship: string) => void;
  onToggleAll: (visible: boolean) => void;
}

const RelationshipFilter: React.FC<RelationshipFilterProps> = ({
  lang,
  relationships,
  visibleRelationships,
  onRelationshipToggle,
  onToggleAll
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const t = {
    title: { ko: '관계 필터', en: 'Relationship Filter' },
    showAll: { ko: '모두 표시', en: 'Show All' },
    hideAll: { ko: '모두 숨기기', en: 'Hide All' },
    visible: { ko: '표시됨', en: 'Visible' },
    hidden: { ko: '숨김', en: 'Hidden' }
  };

  const relationshipLabels: { [key: string]: { ko: string; en: string } } = {
    USES: { ko: '사용', en: 'Uses' },
    HAS: { ko: '보유', en: 'Has' },
    ON: { ko: '운항', en: 'On' },
    OPERATES: { ko: '운영', en: 'Operates' },
    GOVERNED_BY: { ko: '규제됨', en: 'Governed By' },
    AFFECTS: { ko: '영향', en: 'Affects' },
    COMPETES_WITH: { ko: '경쟁', en: 'Competes With' },
    PREDICTS: { ko: '예측', en: 'Predicts' }
  };

  const getRelationshipColor = (relationship: string) => {
    const colors: { [key: string]: string } = {
      USES: 'bg-blue-500',
      HAS: 'bg-green-500',
      ON: 'bg-purple-500',
      OPERATES: 'bg-orange-500',
      GOVERNED_BY: 'bg-pink-500',
      AFFECTS: 'bg-red-500',
      COMPETES_WITH: 'bg-yellow-500',
      PREDICTS: 'bg-indigo-500'
    };
    return colors[relationship] || 'bg-gray-500';
  };

  const allVisible = visibleRelationships.length === relationships.length;
  const noneVisible = visibleRelationships.length === 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      {/* 헤더 */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="font-medium text-slate-900 dark:text-white text-sm">
            {t.title[lang]}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ({visibleRelationships.length}/{relationships.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </div>

      {/* 컨텐츠 */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-700 p-4">
          {/* 전체 제어 버튼 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => onToggleAll(true)}
              disabled={allVisible}
              className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 disabled:bg-slate-100 disabled:text-slate-400 text-green-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              <Eye className="w-3 h-3" />
              {t.showAll[lang]}
            </button>
            <button
              onClick={() => onToggleAll(false)}
              disabled={noneVisible}
              className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 disabled:bg-slate-100 disabled:text-slate-400 text-red-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              <EyeOff className="w-3 h-3" />
              {t.hideAll[lang]}
            </button>
          </div>

          {/* 관계 목록 */}
          <div className="space-y-2">
            {relationships.map((relationship) => {
              const isVisible = visibleRelationships.includes(relationship);
              const label = relationshipLabels[relationship]?.[lang] || relationship;
              
              return (
                <div
                  key={relationship}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isVisible
                      ? 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 opacity-60'
                  }`}
                  onClick={() => onRelationshipToggle(relationship)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getRelationshipColor(relationship)}`} />
                    <span className="font-medium text-slate-900 dark:text-white text-sm">
                      {label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {relationship}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isVisible ? (
                      <>
                        <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          {t.visible[lang]}
                        </span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-400 font-medium">
                          {t.hidden[lang]}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 통계 */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{t.visible[lang]}: {visibleRelationships.length}</span>
              <span>{t.hidden[lang]}: {relationships.length - visibleRelationships.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipFilter;