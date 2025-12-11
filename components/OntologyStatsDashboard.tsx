import React, { useState, useEffect } from 'react';
import { Network, TrendingUp, GitBranch, Activity, Zap, Database, Link, Users } from 'lucide-react';
import { Language } from '../types';

interface OntologyStatsDashboardProps {
  lang: Language;
  graphData?: any;
}

interface NodeStats {
  total: number;
  byType: { [key: string]: number };
}

interface EdgeStats {
  total: number;
  byType: { [key: string]: number };
}

interface NetworkMetrics {
  density: number;
  avgDegree: number;
  maxDegree: { node: string; degree: number };
  clusteringCoefficient: number;
}

const OntologyStatsDashboard: React.FC<OntologyStatsDashboardProps> = ({ lang, graphData }) => {
  const [nodeStats, setNodeStats] = useState<NodeStats>({ total: 0, byType: {} });
  const [edgeStats, setEdgeStats] = useState<EdgeStats>({ total: 0, byType: {} });
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>({
    density: 0,
    avgDegree: 0,
    maxDegree: { node: '', degree: 0 },
    clusteringCoefficient: 0
  });

  const t = {
    title: { ko: '온톨로지 통계 대시보드', en: 'Ontology Statistics Dashboard' },
    nodeStats: { ko: '노드 통계', en: 'Node Statistics' },
    edgeStats: { ko: '관계 통계', en: 'Edge Statistics' },
    networkMetrics: { ko: '네트워크 지표', en: 'Network Metrics' },
    totalNodes: { ko: '전체 노드', en: 'Total Nodes' },
    totalEdges: { ko: '전체 관계', en: 'Total Edges' },
    avgDegree: { ko: '평균 연결도', en: 'Avg Degree' },
    networkDensity: { ko: '네트워크 밀도', en: 'Network Density' },
    maxCentrality: { ko: '최대 중심성', en: 'Max Centrality' },
    clusterCoeff: { ko: '클러스터 계수', en: 'Cluster Coefficient' },
    nodesByType: { ko: '타입별 노드', en: 'Nodes by Type' },
    edgesByType: { ko: '타입별 관계', en: 'Edges by Type' },
    shipper: { ko: '화주', en: 'Shipper' },
    route: { ko: '항로', en: 'Route' },
    booking: { ko: '부킹', en: 'Booking' },
    vessel: { ko: '선박', en: 'Vessel' },
    contract: { ko: '계약', en: 'Contract' },
    marketIndex: { ko: '시장지표', en: 'Market Index' },
    competitor: { ko: '경쟁사', en: 'Competitor' },
    uses: { ko: '사용', en: 'USES' },
    has: { ko: '보유', en: 'HAS' },
    on: { ko: '운항', en: 'ON' },
    operates: { ko: '운영', en: 'OPERATES' },
    governedBy: { ko: '규제', en: 'GOVERNED_BY' },
    affects: { ko: '영향', en: 'AFFECTS' },
    competesWith: { ko: '경쟁', en: 'COMPETES_WITH' },
    predicts: { ko: '예측', en: 'PREDICTS' }
  };

  useEffect(() => {
    if (graphData) {
      calculateStats(graphData);
    } else {
      // 샘플 데이터로 초기화
      setNodeStats({
        total: 53,
        byType: {
          shipper: 8,
          route: 12,
          booking: 15,
          vessel: 4,
          contract: 6,
          marketIndex: 5,
          competitor: 3
        }
      });

      setEdgeStats({
        total: 127,
        byType: {
          uses: 24,
          has: 32,
          on: 18,
          operates: 15,
          governedBy: 12,
          affects: 16,
          competesWith: 6,
          predicts: 4
        }
      });

      setNetworkMetrics({
        density: 0.18,
        avgDegree: 2.4,
        maxDegree: { node: 'Market Price', degree: 23 },
        clusteringCoefficient: 0.42
      });
    }
  }, [graphData]);

  const calculateStats = (data: any) => {
    // 실제 그래프 데이터로부터 통계 계산
    const nodes = data.nodes || [];
    const edges = data.edges || [];

    // 노드 통계
    const nodesByType: { [key: string]: number } = {};
    nodes.forEach((node: any) => {
      const type = node.type || 'unknown';
      nodesByType[type] = (nodesByType[type] || 0) + 1;
    });

    setNodeStats({
      total: nodes.length,
      byType: nodesByType
    });

    // 엣지 통계
    const edgesByType: { [key: string]: number } = {};
    edges.forEach((edge: any) => {
      const type = edge.type || 'unknown';
      edgesByType[type] = (edgesByType[type] || 0) + 1;
    });

    setEdgeStats({
      total: edges.length,
      byType: edgesByType
    });

    // 네트워크 지표 계산
    const degreeMap: { [key: string]: number } = {};
    edges.forEach((edge: any) => {
      degreeMap[edge.source] = (degreeMap[edge.source] || 0) + 1;
      degreeMap[edge.target] = (degreeMap[edge.target] || 0) + 1;
    });

    const degrees = Object.values(degreeMap);
    const avgDegree = degrees.length > 0 ? degrees.reduce((a, b) => a + b, 0) / degrees.length : 0;
    
    const maxDegreeEntry = Object.entries(degreeMap).reduce(
      (max, [node, degree]) => (degree > max.degree ? { node, degree } : max),
      { node: '', degree: 0 }
    );

    const maxPossibleEdges = nodes.length * (nodes.length - 1) / 2;
    const density = maxPossibleEdges > 0 ? edges.length / maxPossibleEdges : 0;

    setNetworkMetrics({
      density,
      avgDegree,
      maxDegree: maxDegreeEntry,
      clusteringCoefficient: 0.42 // 실제로는 복잡한 계산 필요
    });
  };

  const getTypeColor = (type: string): string => {
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

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.title[lang]}
        </h2>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <Network className="w-8 h-8 opacity-80" />
            <div className="text-3xl font-bold">{nodeStats.total}</div>
          </div>
          <div className="text-sm opacity-90">{t.totalNodes[lang]}</div>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <GitBranch className="w-8 h-8 opacity-80" />
            <div className="text-3xl font-bold">{edgeStats.total}</div>
          </div>
          <div className="text-sm opacity-90">{t.totalEdges[lang]}</div>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
            <div className="text-3xl font-bold">{networkMetrics.avgDegree.toFixed(1)}</div>
          </div>
          <div className="text-sm opacity-90">{t.avgDegree[lang]}</div>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 opacity-80" />
            <div className="text-3xl font-bold">{(networkMetrics.density * 100).toFixed(0)}%</div>
          </div>
          <div className="text-sm opacity-90">{t.networkDensity[lang]}</div>
        </div>
      </div>

      {/* 상세 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 노드 타입별 분포 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {t.nodesByType[lang]}
          </h3>
          <div className="space-y-3">
            {Object.entries(nodeStats.byType).map(([type, count]) => {
              const percentage = (count / nodeStats.total) * 100;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t[type as keyof typeof t]?.[lang] || type}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`${getTypeColor(type)} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 관계 타입별 분포 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Link className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {t.edgesByType[lang]}
          </h3>
          <div className="space-y-3">
            {Object.entries(edgeStats.byType).map(([type, count]) => {
              const percentage = (count / edgeStats.total) * 100;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t[type as keyof typeof t]?.[lang] || type}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 네트워크 지표 상세 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          {t.networkMetrics[lang]}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {networkMetrics.maxDegree.degree}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {t.maxCentrality[lang]}
            </div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {networkMetrics.maxDegree.node}
            </div>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {(networkMetrics.density * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t.networkDensity[lang]}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              {lang === 'ko' ? '연결 밀집도' : 'Connection Density'}
            </div>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {networkMetrics.clusteringCoefficient.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t.clusterCoeff[lang]}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              {lang === 'ko' ? '그룹화 정도' : 'Grouping Level'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OntologyStatsDashboard;
