import React, { useState } from 'react';
import { Search, ArrowRight, GitBranch, Zap, X } from 'lucide-react';
import { Language } from '../types';

interface PathFinderProps {
  lang: Language;
  graphData?: any;
  onPathFound?: (path: any[]) => void;
}

interface PathNode {
  id: string;
  label: string;
  type: string;
}

interface Path {
  nodes: PathNode[];
  edges: string[];
  length: number;
}

const PathFinder: React.FC<PathFinderProps> = ({ lang, graphData, onPathFound }) => {
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [paths, setPaths] = useState<Path[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllPaths, setShowAllPaths] = useState(false);

  const t = {
    title: { ko: '경로 탐색', en: 'Path Finder' },
    startNode: { ko: '시작 노드', en: 'Start Node' },
    endNode: { ko: '끝 노드', en: 'End Node' },
    findPath: { ko: '경로 찾기', en: 'Find Path' },
    shortestPath: { ko: '최단 경로', en: 'Shortest Path' },
    allPaths: { ko: '모든 경로', en: 'All Paths' },
    pathLength: { ko: '경로 길이', en: 'Path Length' },
    hops: { ko: '홉', en: 'hops' },
    noPathFound: { ko: '경로를 찾을 수 없습니다', en: 'No path found' },
    searching: { ko: '검색 중...', en: 'Searching...' },
    showMore: { ko: '더 보기', en: 'Show More' },
    showLess: { ko: '접기', en: 'Show Less' },
    pathsFound: { ko: '개 경로 발견', en: 'paths found' },
    selectNodes: { ko: '시작과 끝 노드를 선택하세요', en: 'Select start and end nodes' },
    placeholder: { ko: '노드 이름 입력...', en: 'Enter node name...' }
  };

  // 샘플 노드 목록
  const sampleNodes = [
    { id: 'samsung', label: '삼성전자', type: 'shipper' },
    { id: 'lg', label: 'LG전자', type: 'shipper' },
    { id: 'hyundai', label: '현대자동차', type: 'shipper' },
    { id: 'busan-la', label: '부산-LA', type: 'route' },
    { id: 'busan-shanghai', label: '부산-상하이', type: 'route' },
    { id: 'incheon-tokyo', label: '인천-도쿄', type: 'route' },
    { id: 'booking-001', label: '부킹-001', type: 'booking' },
    { id: 'booking-002', label: '부킹-002', type: 'booking' },
    { id: 'market-price', label: 'Market Price', type: 'marketIndex' },
    { id: 'kmtc', label: 'KMTC', type: 'competitor' },
    { id: 'maersk', label: 'Maersk', type: 'competitor' },
    { id: 'contract-a', label: '계약-A', type: 'contract' }
  ];

  const findPaths = () => {
    if (!startNode || !endNode) return;

    setIsSearching(true);

    // 시뮬레이션: 실제로는 그래프 알고리즘 사용
    setTimeout(() => {
      const foundPaths: Path[] = [];

      // 경로 1: 최단 경로
      if (startNode === 'samsung' && endNode === 'market-price') {
        foundPaths.push({
          nodes: [
            { id: 'samsung', label: '삼성전자', type: 'shipper' },
            { id: 'booking-001', label: '부킹-001', type: 'booking' },
            { id: 'busan-la', label: '부산-LA', type: 'route' },
            { id: 'market-price', label: 'Market Price', type: 'marketIndex' }
          ],
          edges: ['USES', 'ON', 'AFFECTS'],
          length: 3
        });

        foundPaths.push({
          nodes: [
            { id: 'samsung', label: '삼성전자', type: 'shipper' },
            { id: 'contract-a', label: '계약-A', type: 'contract' },
            { id: 'busan-la', label: '부산-LA', type: 'route' },
            { id: 'market-price', label: 'Market Price', type: 'marketIndex' }
          ],
          edges: ['GOVERNED_BY', 'HAS', 'AFFECTS'],
          length: 3
        });

        foundPaths.push({
          nodes: [
            { id: 'samsung', label: '삼성전자', type: 'shipper' },
            { id: 'booking-001', label: '부킹-001', type: 'booking' },
            { id: 'kmtc', label: 'KMTC', type: 'competitor' },
            { id: 'busan-la', label: '부산-LA', type: 'route' },
            { id: 'market-price', label: 'Market Price', type: 'marketIndex' }
          ],
          edges: ['USES', 'OPERATES', 'HAS', 'AFFECTS'],
          length: 4
        });
      } else {
        // 기본 경로 생성
        foundPaths.push({
          nodes: [
            sampleNodes.find(n => n.id === startNode) || { id: startNode, label: startNode, type: 'unknown' },
            { id: 'intermediate', label: 'Intermediate', type: 'unknown' },
            sampleNodes.find(n => n.id === endNode) || { id: endNode, label: endNode, type: 'unknown' }
          ],
          edges: ['CONNECTS', 'CONNECTS'],
          length: 2
        });
      }

      setPaths(foundPaths);
      setIsSearching(false);

      if (onPathFound && foundPaths.length > 0) {
        onPathFound(foundPaths[0].nodes);
      }
    }, 800);
  };

  const getNodeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      shipper: 'bg-blue-500',
      route: 'bg-green-500',
      booking: 'bg-purple-500',
      vessel: 'bg-orange-500',
      contract: 'bg-pink-500',
      marketIndex: 'bg-red-500',
      competitor: 'bg-yellow-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const displayedPaths = showAllPaths ? paths : paths.slice(0, 1);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <GitBranch className="w-8 h-8 text-green-600 dark:text-green-400" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.title[lang]}
        </h2>
      </div>

      {/* 검색 입력 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t.startNode[lang]}
            </label>
            <select
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="">{t.selectNodes[lang]}</option>
              {sampleNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.label} ({node.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t.endNode[lang]}
            </label>
            <select
              value={endNode}
              onChange={(e) => setEndNode(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="">{t.selectNodes[lang]}</option>
              {sampleNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.label} ({node.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={findPaths}
          disabled={!startNode || !endNode || isSearching}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              {t.searching[lang]}
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              {t.findPath[lang]}
            </>
          )}
        </button>
      </div>

      {/* 경로 결과 */}
      {paths.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {paths.length} {t.pathsFound[lang]}
            </h3>
            {paths.length > 1 && (
              <button
                onClick={() => setShowAllPaths(!showAllPaths)}
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                {showAllPaths ? t.showLess[lang] : t.showMore[lang]}
              </button>
            )}
          </div>

          {displayedPaths.map((path, pathIndex) => (
            <div
              key={pathIndex}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {pathIndex === 0 && (
                    <Zap className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="font-medium text-slate-900 dark:text-white">
                    {pathIndex === 0 ? t.shortestPath[lang] : `${lang === 'ko' ? '경로' : 'Path'} ${pathIndex + 1}`}
                  </span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {path.length} {t.hops[lang]}
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {path.nodes.map((node, nodeIndex) => (
                  <React.Fragment key={nodeIndex}>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${getNodeColor(node.type)}`} />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {node.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({node.type})
                      </span>
                    </div>

                    {nodeIndex < path.nodes.length - 1 && (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded">
                          {path.edges[nodeIndex]}
                        </span>
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 경로 없음 */}
      {paths.length === 0 && !isSearching && startNode && endNode && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
          <X className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            {t.noPathFound[lang]}
          </p>
        </div>
      )}
    </div>
  );
};

export default PathFinder;
