import React, { useState, useEffect } from 'react';
import { FileText, Download, Mail, Calendar, Settings, Plus, Trash2, Eye, Clock, CheckCircle2 as CheckCircle, AlertCircle } from 'lucide-react';
import { reportService, ReportTemplate, GeneratedReport } from '../services/reportService';

interface SmartReportGeneratorProps {
  lang: 'ko' | 'en';
}

const SmartReportGenerator: React.FC<SmartReportGeneratorProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'reports' | 'schedule'>('reports');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const t = {
    title: { ko: '스마트 리포트 생성기', en: 'Smart Report Generator' },
    templates: { ko: '템플릿', en: 'Templates' },
    reports: { ko: '생성된 리포트', en: 'Generated Reports' },
    schedule: { ko: '스케줄', en: 'Schedule' },
    generate: { ko: '리포트 생성', en: 'Generate Report' },
    generating: { ko: '생성 중...', en: 'Generating...' },
    download: { ko: '다운로드', en: 'Download' },
    email: { ko: '이메일 발송', en: 'Send Email' },
    view: { ko: '보기', en: 'View' },
    delete: { ko: '삭제', en: 'Delete' },
    
    // Template types
    daily: { ko: '일일', en: 'Daily' },
    weekly: { ko: '주간', en: 'Weekly' },
    monthly: { ko: '월간', en: 'Monthly' },
    custom: { ko: '사용자 정의', en: 'Custom' },
    
    // Status
    enabled: { ko: '활성화', en: 'Enabled' },
    disabled: { ko: '비활성화', en: 'Disabled' },
    lastGenerated: { ko: '마지막 생성', en: 'Last Generated' },
    never: { ko: '없음', en: 'Never' },
    
    // Report info
    generatedAt: { ko: '생성일시', en: 'Generated At' },
    period: { ko: '기간', en: 'Period' },
    size: { ko: '크기', en: 'Size' },
    
    // Actions
    generateNow: { ko: '지금 생성', en: 'Generate Now' },
    editTemplate: { ko: '템플릿 편집', en: 'Edit Template' },
    newTemplate: { ko: '새 템플릿', en: 'New Template' },
    
    // Messages
    noReports: { ko: '생성된 리포트가 없습니다', en: 'No reports generated yet' },
    selectTemplate: { ko: '템플릿을 선택하세요', en: 'Select a template' },
    reportGenerated: { ko: '리포트가 생성되었습니다', en: 'Report generated successfully' }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setTemplates(reportService.getTemplates());
    setReports(reportService.getGeneratedReports());
    setIsGenerating(reportService.isGeneratingReport());
  };

  const handleGenerateReport = async (templateId: string) => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      await reportService.generateReport(templateId, 'manual');
      loadData();
      
      // 성공 알림 (실제 구현에서는 토스트 알림 사용)
      console.log('✅ Report generated successfully');
    } catch (error) {
      console.error('❌ Report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    if (report.downloadUrl) {
      const link = document.createElement('a');
      link.href = report.downloadUrl;
      link.download = `${report.title}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('정말로 이 리포트를 삭제하시겠습니까?')) {
      reportService.deleteReport(reportId);
      loadData();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'weekly': return <Calendar className="w-4 h-4 text-green-500" />;
      case 'monthly': return <Calendar className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const renderTemplates = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300">{t.templates[lang]}</h4>
        <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {templates.map(template => (
          <div key={template.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTemplateIcon(template.type)}
                <h5 className="font-medium text-slate-800 dark:text-slate-200">{template.name}</h5>
              </div>
              <div className="flex items-center gap-2">
                {template.schedule?.enabled ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  template.schedule?.enabled
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {template.schedule?.enabled ? t.enabled[lang] : t.disabled[lang]}
                </span>
              </div>
            </div>
            
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {t[template.type as keyof typeof t][lang]} • {template.sections.length} sections
              {template.schedule?.enabled && (
                <span className="ml-2">• {template.schedule.time} {template.schedule.frequency}</span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t.lastGenerated[lang]}: {template.lastGenerated ? template.lastGenerated.toLocaleDateString() : t.never[lang]}
              </div>
              <button
                onClick={() => handleGenerateReport(template.id)}
                disabled={isGenerating}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isGenerating ? t.generating[lang] : t.generateNow[lang]}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300">{t.reports[lang]}</h4>
        <div className="flex items-center gap-2">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-sm"
          >
            <option value="">{t.selectTemplate[lang]}</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
          <button
            onClick={() => selectedTemplate && handleGenerateReport(selectedTemplate)}
            disabled={!selectedTemplate || isGenerating}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition disabled:opacity-50"
          >
            {isGenerating ? t.generating[lang] : t.generate[lang]}
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t.noReports[lang]}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800 dark:text-slate-200">{report.title}</h5>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadReport(report)}
                    className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    title={t.download[lang]}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    title={t.delete[lang]}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div>
                  <span className="font-medium">{t.generatedAt[lang]}:</span>
                  <br />
                  {report.generatedAt.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">{t.period[lang]}:</span>
                  <br />
                  {report.period.start.toLocaleDateString()} - {report.period.end.toLocaleDateString()}
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{t.size[lang]}: {formatFileSize(report.size)}</span>
                <span>{report.format.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-slate-700 dark:text-slate-300">{t.schedule[lang]}</h4>
      
      <div className="space-y-3">
        {templates.filter(t => t.schedule?.enabled).map(template => (
          <div key={template.id} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-slate-800 dark:text-slate-200">{template.name}</h5>
              <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <div>빈도: {template.schedule?.frequency}</div>
              <div>시간: {template.schedule?.time}</div>
              <div>수신자: {template.schedule?.recipients?.join(', ')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Report Generator Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-lg transition-all ${
          isGenerating
            ? 'bg-yellow-600 hover:bg-yellow-700 animate-pulse'
            : 'bg-purple-600 hover:bg-purple-700'
        } text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
        title={`${reports.length} reports generated`}
      >
        <FileText className="w-5 h-5" />
        {reports.length > 0 && (
          <span className="absolute -top-1 -right-1 kmtc-badge-danger rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
            {reports.length > 99 ? '99+' : reports.length}
          </span>
        )}
      </button>

      {/* Report Generator Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">{t.title[lang]}</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {[
              { key: 'reports', label: t.reports[lang] },
              { key: 'templates', label: t.templates[lang] },
              { key: 'schedule', label: t.schedule[lang] }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 p-3 text-sm font-medium transition ${
                  activeTab === key
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 max-h-80 overflow-y-auto">
            {activeTab === 'templates' && renderTemplates()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'schedule' && renderSchedule()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartReportGenerator;