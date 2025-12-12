import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Target } from 'lucide-react';
import { Language } from '../types';

interface GraphSearchBoxProps {
  lang: Language;
  nodes: any[];
  onNodeFound: (node: any) => void;
  onClear: () => void;
}

const GraphSearchBox: React.FC<GraphSearchBoxProps> = ({ 
  lang, 
  nodes, 
  onNodeFound, 
  onClear 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = {
    placeholder: { ko: '노드 검색... (예: 삼성전자, KMTC)', en: 'Search nodes... (e.g. Samsung, KMTC)' },
    noResults: { ko: '검색 결과 없음', en: 'No results found' },
    clear: { ko: '지우기', en: 'Clear' },
    found: { ko: '개 결과', en: 'results' }
  };

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = nodes.filter(node => 
        node.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.type?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8); // 최대 8개 결과
      
      setSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, nodes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectNode(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleSelectNode(suggestions[0]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectNode = (node: any) => {
    setSearchTerm(node.label || node.id);
    setShowSuggestions(false);
    onNodeFound(node);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    onClear();
    inputRef.current?.focus();
  };

  const getNodeTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      shipper: 'text-blue-600 bg-blue-100',
      route: 'text-green-600 bg-green-100',
      booking: 'text-purple-600 bg-purple-100',
      vessel: 'text-orange-600 bg-orange-100',
      contract: 'text-pink-600 bg-pink-100',
      marketIndex: 'text-red-600 bg-red-100',
      competitor: 'text-yellow-600 bg-yellow-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="relative">
      {/* 검색 입력창 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && setShowSuggestions(true)}
          placeholder={t.placeholder[lang]}
          className="w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors"
          >
            <X className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {suggestions.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                {suggestions.length} {t.found[lang]}
              </div>
              {suggestions.map((node, index) => (
                <div
                  key={node.id}
                  onClick={() => handleSelectNode(node)}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white text-sm">
                        {node.label || node.id}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNodeTypeColor(node.type)}`}>
                      {node.type}
                    </span>
                  </div>
                  {node.id !== node.label && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 ml-5">
                      ID: {node.id}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="px-3 py-4 text-center text-slate-500 dark:text-slate-400 text-sm">
              {t.noResults[lang]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GraphSearchBox;