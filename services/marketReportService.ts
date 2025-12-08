/**
 * Market Report Service
 * 시장 인텔리전스 보고서 생성 및 내보내기
 */

import { MarketInsight } from '../types';

export interface MarketReportData {
  title: string;
  generatedAt: string;
  insights: MarketInsight[];
  marketIndicators: {
    scfi: number;
    oil: number;
    forex: number;
  };
  competitorAlerts: Array<{
    title: string;
    description: string;
    date: string;
  }>;
}

export class MarketReportService {
  generatePDFReport(data: MarketReportData): void {
    const htmlContent = this.generateHTMLReport(data);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => { printWindow.print(); };
    }
  }

  downloadMarkdownReport(data: MarketReportData): void {
    let md = '#  시장 인텔리전스 리포트\n\n';
    md += '**생성일시**: ' + new Date(data.generatedAt).toLocaleString('ko-KR') + '\n\n';
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    this.downloadBlob(blob, 'market-report-' + this.getDateString() + '.md');
  }

  private generateHTMLReport(data: MarketReportData): string {
    return '<html><body><h1>Market Report</h1></body></html>';
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private getDateString(): string {
    const now = new Date();
    return now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
  }
}

export const marketReportService = new MarketReportService();
