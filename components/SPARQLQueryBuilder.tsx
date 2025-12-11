import React, { useState } from 'react';
import { Code, Play, Save, Download, Copy, Check, Database } from 'lucide-react';
import { Language } from '../types';

interface SPARQLQueryBuilderProps {
  lang: Language;
}

interface QueryTemplate {
  name: string;
  description: string;
  query: string;
}

const SPARQLQueryBuilder: React.FC<SPARQLQueryBuilderProps> = ({ lang }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const t = {
    title: { ko: 'SPARQL 쿼리 빌더', en: 'SPARQL Query Builder' },
    queryEditor: { ko: '쿼리 편집기', en: 'Query Editor' },
    templates: { ko: '템플릿', en: 'Templates' },
    execute: { ko: '실행', en: 'Execute' },
    executing: { ko: '실행 중...', en: 'Executing...' },
    save: { ko: '저장', en: 'Save' },
    export: { ko: '내보내기', en: 'Export' },
    copy: { ko: '복사', en: 'Copy' },
    copied: { ko: '복사됨!', en: 'Copied!' },
    results: { ko: '결과', en: 'Results' },
    noResults: { ko: '결과 없음', en: 'No Results' },
    rows: { ko: '행', en: 'rows' },
    selectTemplate: { ko: '템플릿 선택...', en: 'Select template...' },
    placeholder: { ko: 'SPARQL 쿼리를 입력하세요...', en: 'Enter SPARQL query...' }
  };

  const queryTemplates: QueryTemplate[] = [
    {
      name: lang === 'ko' ? '모든 화주 조회' : 'Get All Shippers',
      description: lang === 'ko' ? '시스템의 모든 화주 목록' : 'List all shippers in the system',
      query: `PREFIX : <http://kmtc.com/ontology#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?shipper ?name
WHERE {
  ?shipper rdf:type :Shipper .
  ?shipper :hasName ?name .
}
ORDER BY ?name`
    },
    {
      name: lang === 'ko' ? '고운임 항로 검색' : 'Find High-Freight Routes',
      description: lang === 'ko' ? '운임이 $3,000 이상인 항로' : 'Routes with freight >= $3,000',
      query: `PREFIX : <http://kmtc.com/ontology#>

SELECT ?route ?origin ?destination ?freight
WHERE {
  ?route rdf:type :Route .
  ?route :hasOrigin ?origin .
  ?route :hasDestination ?destination .
  ?route :hasFreight ?freight .
  FILTER (?freight >= 3000)
}
ORDER BY DESC(?freight)`
    },
    {
      name: lang === 'ko' ? '화주별 부킹 수' : 'Bookings per Shipper',
      description: lang === 'ko' ? '각 화주의 부킹 개수 집계' : 'Count bookings for each shipper',
      query: `PREFIX : <http://kmtc.com/ontology#>

SELECT ?shipper ?name (COUNT(?booking) AS ?bookingCount)
WHERE {
  ?shipper rdf:type :Shipper .
  ?shipper :hasName ?name .
  ?shipper :uses ?booking .
  ?booking rdf:type :Booking .
}
GROUP BY ?shipper ?name
ORDER BY DESC(?bookingCount)`
    },
    {
      name: lang === 'ko' ? '항로 성능 분석' : 'Route Performance Analysis',
      description: lang === 'ko' ? '정시도착률 90% 이상 항로' : 'Routes with OTP >= 90%',
      query: `PREFIX : <http://kmtc.com/ontology#>

SELECT ?route ?origin ?destination ?otp ?freight
WHERE {
  ?route rdf:type :Route .
  ?route :hasOrigin ?origin .
  ?route :hasDestination ?destination .
  ?route :hasOTP ?otp .
  ?route :hasFreight ?freight .
  FILTER (?otp >= 0.9)
}
ORDER BY DESC(?otp)`
    },
    {
      name: lang === 'ko' ? '경쟁사 비교' : 'Competitor Comparison',
      description: lang === 'ko' ? '경쟁사별 운영 항로' : 'Routes operated by competitors',
      query: `PREFIX : <http://kmtc.com/ontology#>

SELECT ?competitor ?name ?route
WHERE {
  ?competitor rdf:type :Competitor .
  ?competitor :hasName ?name .
  ?competitor :operates ?route .
  ?route rdf:type :Route .
}
ORDER BY ?name`
    },
    {
      name: lang === 'ko' ? '리스크 높은 항로' : 'High-Risk Routes',
      description: lang === 'ko' ? '리스크 지수 7.0 이상 항로' : 'Routes with risk index >= 7.0',
      query: `PREFIX : <http://kmtc.com/ontology#>

SELECT ?route ?origin ?destination ?riskIndex ?riskType
WHERE {
  ?route rdf:type :Route .
  ?route :hasOrigin ?origin .
  ?route :hasDestination ?destination .
  ?route :hasRiskIndex ?riskIndex .
  ?route :hasRiskType ?riskType .
  FILTER (?riskIndex >= 7.0)
}
ORDER BY DESC(?riskIndex)`
    }
  ];

  const executeQuery = () => {
    if (!query.trim()) return;

    setIsExecuting(true);

    // 시뮬레이션: 실제로는 SPARQL 엔드포인트 호출
    setTimeout(() => {
      let mockResults: any[] = [];

      if (query.includes('Shipper')) {
        mockResults = [
          { shipper: 'shipper:samsung', name: '삼성전자', bookingCount: 45 },
          { shipper: 'shipper:lg', name: 'LG전자', bookingCount: 38 },
          { shipper: 'shipper:hyundai', name: '현대자동차', bookingCount: 32 },
          { shipper: 'shipper:sk', name: 'SK하이닉스', bookingCount: 28 }
        ];
      } else if (query.includes('Route') && query.includes('freight')) {
        mockResults = [
          { route: 'route:busan-la', origin: '부산', destination: 'LA', freight: 2850, otp: 0.92 },
          { route: 'route:busan-ny', origin: '부산', destination: '뉴욕', freight: 3200, otp: 0.89 },
          { route: 'route:incheon-tokyo', origin: '인천', destination: '도쿄', freight: 1200, otp: 0.95 }
        ];
      } else if (query.includes('Competitor')) {
        mockResults = [
          { competitor: 'comp:kmtc', name: 'KMTC', route: 'route:busan-la' },
          { competitor: 'comp:kmtc', name: 'KMTC', route: 'route:busan-shanghai' },
          { competitor: 'comp:maersk', name: 'Maersk', route: 'route:busan-la' },
          { competitor: 'comp:msc', name: 'MSC', route: 'route:incheon-tokyo' }
        ];
      } else if (query.includes('risk')) {
        mockResults = [
          { route: 'route:busan-europe', origin: '부산', destination: '유럽', riskIndex: 8.5, riskType: '홍해 리스크' },
          { route: 'route:shanghai-suez', origin: '상하이', destination: '수에즈', riskIndex: 7.8, riskType: '지정학적 리스크' }
        ];
      } else {
        mockResults = [
          { message: lang === 'ko' ? '쿼리 실행 완료' : 'Query executed successfully' }
        ];
      }

      setResults(mockResults);
      setIsExecuting(false);
    }, 800);
  };

  const loadTemplate = (templateQuery: string) => {
    setQuery(templateQuery);
    setResults([]);
  };

  const copyQuery = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportResults = () => {
    const csv = convertToCSV(results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sparql-results.csv';
    a.click();
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => JSON.stringify(row[header] || '')).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.title[lang]}
        </h2>
      </div>

      {/* 템플릿 선택 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          {t.templates[lang]}
        </label>
        <select
          value={selectedTemplate}
          onChange={(e) => {
            setSelectedTemplate(e.target.value);
            if (e.target.value) {
              const template = queryTemplates[parseInt(e.target.value)];
              loadTemplate(template.query);
            }
          }}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
        >
          <option value="">{t.selectTemplate[lang]}</option>
          {queryTemplates.map((template, index) => (
            <option key={index} value={index}>
              {template.name} - {template.description}
            </option>
          ))}
        </select>
      </div>

      {/* 쿼리 편집기 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t.queryEditor[lang]}
          </label>
          <div className="flex gap-2">
            <button
              onClick={copyQuery}
              disabled={!query}
              className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t.copied[lang] : t.copy[lang]}
            </button>
          </div>
        </div>
        
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder[lang]}
          className="w-full h-64 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white font-mono text-sm"
          spellCheck={false}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={executeQuery}
            disabled={!query.trim() || isExecuting}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                {t.executing[lang]}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {t.execute[lang]}
              </>
            )}
          </button>

          <button
            onClick={exportResults}
            disabled={results.length === 0}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            {t.export[lang]}
          </button>
        </div>
      </div>

      {/* 결과 */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.results[lang]}
            </h3>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {results.length} {t.rows[lang]}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {Object.keys(results[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    {Object.values(row).map((value: any, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-3 text-sm text-slate-900 dark:text-white"
                      >
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 결과 없음 */}
      {results.length === 0 && !isExecuting && query && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
          <Code className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            {t.noResults[lang]}
          </p>
        </div>
      )}
    </div>
  );
};

export default SPARQLQueryBuilder;
