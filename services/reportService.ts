// Smart Report Generation Service
export interface ReportTemplate {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  sections: ReportSection[];
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    recipients: string[];
  };
  lastGenerated?: Date;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'kpi' | 'chart' | 'table' | 'text' | 'prediction' | 'alert_summary';
  config: any;
  order: number;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  title: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  data: ReportData;
  format: 'html' | 'pdf' | 'json';
  size: number; // bytes
  downloadUrl?: string;
}

export interface ReportData {
  summary: {
    totalAlerts: number;
    avgAccuracy: number;
    keyInsights: string[];
    recommendations: string[];
  };
  kpis: {
    exchangeRateChange: number;
    oilPriceChange: number;
    weatherRiskDays: number;
    predictionAccuracy: number;
  };
  charts: {
    trendData: any[];
    riskHeatmap: any[];
    accuracyHistory: any[];
  };
  alerts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    details: any[];
  };
}

class ReportService {
  private templates: ReportTemplate[] = [];
  private generatedReports: GeneratedReport[] = [];
  private isGenerating: boolean = false;

  constructor() {
    this.initializeDefaultTemplates();
    this.startScheduledReports();
  }

  // 기본 템플릿 초기화
  private initializeDefaultTemplates(): void {
    this.templates = [
      {
        id: 'daily_summary',
        name: '일일 요약 리포트',
        type: 'daily',
        sections: [
          {
            id: 'kpi_overview',
            title: 'KPI 개요',
            type: 'kpi',
            config: { metrics: ['exchange_rate', 'oil_price', 'weather_risk', 'prediction_accuracy'] },
            order: 1
          },
          {
            id: 'alert_summary',
            title: '알림 요약',
            type: 'alert_summary',
            config: { period: '24h' },
            order: 2
          },
          {
            id: 'trend_chart',
            title: '시장 트렌드',
            type: 'chart',
            config: { chartType: 'line', metrics: ['usd_krw', 'brent_oil'] },
            order: 3
          },
          {
            id: 'predictions',
            title: 'AI 예측 성능',
            type: 'prediction',
            config: { models: ['ensemble_v1', 'neural_v2'] },
            order: 4
          }
        ],
        schedule: {
          enabled: true,
          frequency: 'daily',
          time: '09:00',
          recipients: ['admin@kmtc.com']
        }
      },
      {
        id: 'weekly_analysis',
        name: '주간 분석 리포트',
        type: 'weekly',
        sections: [
          {
            id: 'executive_summary',
            title: '경영진 요약',
            type: 'text',
            config: { template: 'executive_summary' },
            order: 1
          },
          {
            id: 'market_performance',
            title: '시장 성과 분석',
            type: 'chart',
            config: { chartType: 'combo', period: '7d' },
            order: 2
          },
          {
            id: 'risk_analysis',
            title: '리스크 분석',
            type: 'table',
            config: { riskTypes: ['geopolitical', 'weather', 'market'] },
            order: 3
          },
          {
            id: 'competitor_benchmark',
            title: '경쟁사 벤치마킹',
            type: 'table',
            config: { competitors: ['CompA', 'CompB', 'CompC'] },
            order: 4
          }
        ],
        schedule: {
          enabled: true,
          frequency: 'weekly',
          time: '08:00',
          recipients: ['ceo@kmtc.com', 'cfo@kmtc.com']
        }
      },
      {
        id: 'monthly_comprehensive',
        name: '월간 종합 리포트',
        type: 'monthly',
        sections: [
          {
            id: 'monthly_overview',
            title: '월간 개요',
            type: 'kpi',
            config: { period: '30d', comparison: 'previous_month' },
            order: 1
          },
          {
            id: 'detailed_analysis',
            title: '상세 분석',
            type: 'chart',
            config: { chartType: 'dashboard', period: '30d' },
            order: 2
          },
          {
            id: 'ai_insights',
            title: 'AI 인사이트',
            type: 'prediction',
            config: { insights: true, recommendations: true },
            order: 3
          },
          {
            id: 'action_items',
            title: '액션 아이템',
            type: 'text',
            config: { template: 'action_items' },
            order: 4
          }
        ],
        schedule: {
          enabled: true,
          frequency: 'monthly',
          time: '07:00',
          recipients: ['board@kmtc.com']
        }
      }
    ];
  }

  // 예약된 리포트 시작
  private startScheduledReports(): void {
    // 매시간 스케줄 체크
    setInterval(() => {
      this.checkScheduledReports();
    }, 60 * 60 * 1000);
  }

  // 스케줄된 리포트 체크
  private checkScheduledReports(): void {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.templates.forEach(template => {
      if (!template.schedule?.enabled) return;

      const shouldGenerate = this.shouldGenerateReport(template, now, currentTime);
      if (shouldGenerate) {
        this.generateReport(template.id, 'auto');
      }
    });
  }

  // 리포트 생성 여부 판단
  private shouldGenerateReport(template: ReportTemplate, now: Date, currentTime: string): boolean {
    if (!template.schedule || template.schedule.time !== currentTime) return false;

    const lastGenerated = template.lastGenerated;
    if (!lastGenerated) return true;

    const timeDiff = now.getTime() - lastGenerated.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    switch (template.schedule.frequency) {
      case 'daily':
        return hoursDiff >= 23; // 23시간 이상 경과
      case 'weekly':
        return hoursDiff >= 167; // 7일 - 1시간
      case 'monthly':
        return hoursDiff >= 719; // 30일 - 1시간
      default:
        return false;
    }
  }

  // 리포트 생성
  public async generateReport(templateId: string, trigger: 'manual' | 'auto' = 'manual'): Promise<GeneratedReport> {
    if (this.isGenerating) {
      throw new Error('Another report is currently being generated');
    }

    this.isGenerating = true;

    try {
      const template = this.templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // 리포트 데이터 수집
      const reportData = await this.collectReportData(template);
      
      // 리포트 생성
      const report: GeneratedReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        templateId: template.id,
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        generatedAt: new Date(),
        period: this.getReportPeriod(template.type),
        data: reportData,
        format: 'html',
        size: 0 // 실제 구현시 계산
      };

      // HTML 생성
      const htmlContent = this.generateHTMLReport(template, report);
      report.size = new Blob([htmlContent]).size;
      report.downloadUrl = this.createDownloadUrl(htmlContent, report.id);

      // 리포트 저장
      this.generatedReports.unshift(report);
      
      // 최대 50개 리포트만 유지
      if (this.generatedReports.length > 50) {
        this.generatedReports = this.generatedReports.slice(0, 50);
      }

      // 템플릿 업데이트
      template.lastGenerated = new Date();

      // 이메일 발송 (시뮬레이션)
      if (trigger === 'auto' && template.schedule?.recipients) {
        this.sendEmailReport(report, template.schedule.recipients);
      }

      console.log(`📊 Report generated: ${report.title}`);
      return report;

    } finally {
      this.isGenerating = false;
    }
  }

  // 리포트 데이터 수집
  private async collectReportData(template: ReportTemplate): Promise<ReportData> {
    // 실제 구현에서는 각 서비스에서 데이터를 가져옴
    const { alertService } = await import('./alertService');
    const { aiLearningService } = await import('./aiLearningService');
    const { realDataService } = await import('./realDataService');

    const alerts = alertService.getAlerts(100);
    const models = aiLearningService.getModelComparisons();
    const externalData = await realDataService.getAllExternalData();

    return {
      summary: {
        totalAlerts: alerts.length,
        avgAccuracy: models.reduce((sum, m) => sum + m.accuracy, 0) / models.length,
        keyInsights: [
          '환율 변동성이 전주 대비 15% 증가',
          '유가 상승으로 인한 운임 상승 압력 예상',
          'AI 예측 정확도가 92%로 개선'
        ],
        recommendations: [
          '환율 헤지 전략 검토 필요',
          '유류할증료 조정 고려',
          '예측 모델 성능 지속 모니터링'
        ]
      },
      kpis: {
        exchangeRateChange: (Math.random() - 0.5) * 4, // ±2%
        oilPriceChange: (Math.random() - 0.5) * 6, // ±3%
        weatherRiskDays: Math.floor(Math.random() * 5),
        predictionAccuracy: 0.89 + Math.random() * 0.08 // 89-97%
      },
      charts: {
        trendData: this.generateTrendData(),
        riskHeatmap: this.generateRiskHeatmap(),
        accuracyHistory: this.generateAccuracyHistory()
      },
      alerts: {
        critical: alerts.filter(a => a.priority === 'critical').length,
        high: alerts.filter(a => a.priority === 'high').length,
        medium: alerts.filter(a => a.priority === 'medium').length,
        low: alerts.filter(a => a.priority === 'low').length,
        details: alerts.slice(0, 10)
      }
    };
  }

  // 리포트 기간 계산
  private getReportPeriod(type: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (type) {
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      default:
        start.setDate(start.getDate() - 1);
    }

    return { start, end };
  }

  // HTML 리포트 생성
  private generateHTMLReport(template: ReportTemplate, report: GeneratedReport): string {
    const { data } = report;
    
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #1e293b; font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; }
        .kpi-value { font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 5px; }
        .kpi-label { color: #64748b; font-size: 14px; }
        .alert-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .alert-item { padding: 15px; border-radius: 8px; text-align: center; color: white; }
        .alert-critical { background: #ef4444; }
        .alert-high { background: #f97316; }
        .alert-medium { background: #eab308; }
        .alert-low { background: #22c55e; }
        .insights { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 8px 8px 0; }
        .recommendations { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 0 8px 8px 0; }
        .footer { background: #f1f5f9; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; color: #64748b; font-size: 12px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${report.title}</h1>
            <p>생성일시: ${report.generatedAt.toLocaleString()} | 기간: ${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()}</p>
        </div>
        
        <div class="content">
            <!-- KPI 개요 -->
            <div class="section">
                <h2>📊 주요 지표 (KPI)</h2>
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-value">${data.kpis.exchangeRateChange > 0 ? '+' : ''}${data.kpis.exchangeRateChange.toFixed(1)}%</div>
                        <div class="kpi-label">환율 변동</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-value">${data.kpis.oilPriceChange > 0 ? '+' : ''}${data.kpis.oilPriceChange.toFixed(1)}%</div>
                        <div class="kpi-label">유가 변동</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-value">${data.kpis.weatherRiskDays}</div>
                        <div class="kpi-label">고위험 날씨 일수</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-value">${(data.kpis.predictionAccuracy * 100).toFixed(1)}%</div>
                        <div class="kpi-label">AI 예측 정확도</div>
                    </div>
                </div>
            </div>

            <!-- 알림 요약 -->
            <div class="section">
                <h2>🚨 알림 요약</h2>
                <div class="alert-summary">
                    <div class="alert-item alert-critical">
                        <div style="font-size: 24px; font-weight: bold;">${data.alerts.critical}</div>
                        <div>긴급</div>
                    </div>
                    <div class="alert-item alert-high">
                        <div style="font-size: 24px; font-weight: bold;">${data.alerts.high}</div>
                        <div>높음</div>
                    </div>
                    <div class="alert-item alert-medium">
                        <div style="font-size: 24px; font-weight: bold;">${data.alerts.medium}</div>
                        <div>보통</div>
                    </div>
                    <div class="alert-item alert-low">
                        <div style="font-size: 24px; font-weight: bold;">${data.alerts.low}</div>
                        <div>낮음</div>
                    </div>
                </div>
            </div>

            <!-- 주요 인사이트 -->
            <div class="section">
                <h2>💡 주요 인사이트</h2>
                <div class="insights">
                    <ul>
                        ${data.summary.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <!-- 권장사항 -->
            <div class="section">
                <h2>🎯 권장사항</h2>
                <div class="recommendations">
                    <ul>
                        ${data.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>KMTC 온톨로지 기반 부킹 에이전틱 AI 플랫폼 | 자동 생성 리포트</p>
            <p>이 리포트는 AI 시스템에 의해 자동으로 생성되었습니다.</p>
        </div>
    </div>
</body>
</html>`;
  }

  // 다운로드 URL 생성
  private createDownloadUrl(content: string, reportId: string): string {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // 실제 구현에서는 서버에 저장하고 영구 URL 반환
    return url;
  }

  // 이메일 발송 (시뮬레이션)
  private sendEmailReport(report: GeneratedReport, recipients: string[]): void {
    console.log(`📧 Email sent to ${recipients.join(', ')}: ${report.title}`);
    // 실제 구현에서는 이메일 서비스 API 호출
  }

  // 트렌드 데이터 생성
  private generateTrendData(): any[] {
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
        usdKrw: 1470 + (Math.random() - 0.5) * 20,
        brent: 72 + (Math.random() - 0.5) * 8
      });
    }
    return data;
  }

  // 리스크 히트맵 데이터 생성
  private generateRiskHeatmap(): any[] {
    return [
      { region: 'Asia', risk: Math.random() },
      { region: 'Europe', risk: Math.random() },
      { region: 'Middle East', risk: Math.random() },
      { region: 'Americas', risk: Math.random() }
    ];
  }

  // 정확도 히스토리 생성
  private generateAccuracyHistory(): any[] {
    const data = [];
    for (let i = 0; i < 7; i++) {
      data.push({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
        accuracy: 0.85 + Math.random() * 0.1
      });
    }
    return data;
  }

  // 공개 메서드들
  public getTemplates(): ReportTemplate[] {
    return [...this.templates];
  }

  public getGeneratedReports(limit: number = 20): GeneratedReport[] {
    return this.generatedReports.slice(0, limit);
  }

  public getTemplate(templateId: string): ReportTemplate | null {
    return this.templates.find(t => t.id === templateId) || null;
  }

  public updateTemplate(templateId: string, updates: Partial<ReportTemplate>): void {
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      Object.assign(template, updates);
    }
  }

  public deleteReport(reportId: string): void {
    const index = this.generatedReports.findIndex(r => r.id === reportId);
    if (index > -1) {
      // URL 정리
      const report = this.generatedReports[index];
      if (report.downloadUrl) {
        URL.revokeObjectURL(report.downloadUrl);
      }
      
      this.generatedReports.splice(index, 1);
    }
  }

  public isGeneratingReport(): boolean {
    return this.isGenerating;
  }

  // PDF 생성 (시뮬레이션)
  public async generatePDFReport(reportId: string): Promise<string> {
    const report = this.generatedReports.find(r => r.id === reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // 실제 구현에서는 HTML을 PDF로 변환
    console.log(`📄 PDF generated for report: ${report.title}`);
    return `pdf_${reportId}.pdf`;
  }
}

// Export singleton instance
export const reportService = new ReportService();