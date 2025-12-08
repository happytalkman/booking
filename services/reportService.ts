/**
 * Report Service
 * 액션 결과 리포트 생성 및 다운로드
 */

import { ActionResult } from './actionService';

export class ReportService {
  /**
   * PDF 리포트 생성 (HTML → PDF 변환)
   */
  generatePDFReport(actionResult: ActionResult, insightTitle: string): void {
    // HTML 콘텐츠 생성
    const htmlContent = this.generateHTMLReport(actionResult, insightTitle);
    
    // 새 창에서 열기 (인쇄 대화상자)
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // 로드 완료 후 인쇄 대화상자 표시
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  /**
   * JSON 리포트 다운로드
   */
  downloadJSONReport(actionResult: ActionResult, insightTitle: string): void {
    const reportData = {
      title: insightTitle,
      ...actionResult,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    
    this.downloadBlob(blob, `action-report-${actionResult.actionId}.json`);
  }

  /**
   * CSV 리포트 다운로드
   */
  downloadCSVReport(actionResult: ActionResult, insightTitle: string): void {
    let csv = 'Action Report\n\n';
    csv += `Title,${insightTitle}\n`;
    csv += `Action ID,${actionResult.actionId}\n`;
    csv += `Timestamp,${actionResult.timestamp}\n`;
    csv += `Status,${actionResult.success ? 'Success' : 'Failed'}\n`;
    csv += `Message,${actionResult.message}\n\n`;

    csv += 'Next Steps\n';
    actionResult.nextSteps.forEach((step, idx) => {
      csv += `${idx + 1},${step}\n`;
    });

    csv += '\nOntology Updates\n';
    csv += 'Entity,Property,Old Value,New Value,Reason\n';
    actionResult.ontologyUpdates.forEach(update => {
      csv += `${update.entity},${update.property},${update.oldValue},${update.newValue},"${update.reason}"\n`;
    });

    csv += '\nNotifications\n';
    csv += 'ID,Type,Title,Message,Action Required\n';
    actionResult.notifications.forEach(notif => {
      csv += `${notif.id},${notif.type},${notif.title},"${notif.message}",${notif.actionRequired}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `action-report-${actionResult.actionId}.csv`);
  }

  /**
   * Markdown 리포트 다운로드
   */
  downloadMarkdownReport(actionResult: ActionResult, insightTitle: string): void {
    let md = `# AI 인사이트 액션 리포트\n\n`;
    md += `## ${insightTitle}\n\n`;
    md += `- **액션 ID**: ${actionResult.actionId}\n`;
    md += `- **실행 시간**: ${new Date(actionResult.timestamp).toLocaleString('ko-KR')}\n`;
    md += `- **상태**: ${actionResult.success ? '✅ 성공' : '❌ 실패'}\n\n`;
    
    md += `### 📋 실행 결과\n\n`;
    md += `${actionResult.message}\n\n`;

    md += `### 🎯 다음 단계\n\n`;
    actionResult.nextSteps.forEach((step, idx) => {
      md += `${idx + 1}. ${step}\n`;
    });

    md += `\n### 🔄 온톨로지 업데이트\n\n`;
    actionResult.ontologyUpdates.forEach(update => {
      md += `#### ${update.entity}\n\n`;
      md += `- **속성**: \`${update.property}\`\n`;
      md += `- **이전 값**: \`${update.oldValue}\`\n`;
      md += `- **새 값**: \`${update.newValue}\`\n`;
      md += `- **사유**: ${update.reason}\n\n`;
    });

    md += `### 🔔 생성된 알림 (${actionResult.notifications.length}개)\n\n`;
    actionResult.notifications.forEach(notif => {
      md += `#### ${notif.title}\n\n`;
      md += `- **타입**: ${notif.type}\n`;
      md += `- **메시지**: ${notif.message}\n`;
      md += `- **조치 필요**: ${notif.actionRequired ? '예' : '아니오'}\n`;
      md += `- **관련 엔티티**: ${notif.relatedEntities.join(', ')}\n\n`;
    });

    md += `---\n\n`;
    md += `*리포트 생성 시간: ${new Date().toLocaleString('ko-KR')}*\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    this.downloadBlob(blob, `action-report-${actionResult.actionId}.md`);
  }

  /**
   * HTML 리포트 생성
   */
  private generateHTMLReport(actionResult: ActionResult, insightTitle: string): string {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI 인사이트 액션 리포트</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 { 
      color: #1e293b;
      font-size: 32px;
      margin-bottom: 10px;
    }
    h2 { 
      color: #3b82f6;
      font-size: 24px;
      margin: 30px 0 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    h3 {
      color: #475569;
      font-size: 18px;
      margin: 20px 0 10px;
    }
    .meta {
      background: #f1f5f9;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .meta-item {
      display: flex;
      margin: 8px 0;
    }
    .meta-label {
      font-weight: bold;
      min-width: 120px;
      color: #64748b;
    }
    .meta-value {
      color: #1e293b;
    }
    .success-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
    }
    .message-box {
      background: #dbeafe;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .steps-list {
      list-style: none;
      counter-reset: step-counter;
    }
    .steps-list li {
      counter-increment: step-counter;
      padding: 12px;
      margin: 10px 0;
      background: #f8fafc;
      border-left: 3px solid #3b82f6;
      border-radius: 4px;
    }
    .steps-list li::before {
      content: counter(step-counter);
      background: #3b82f6;
      color: white;
      font-weight: bold;
      padding: 4px 10px;
      border-radius: 50%;
      margin-right: 12px;
      font-size: 14px;
    }
    .update-card {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      padding: 15px;
      margin: 15px 0;
      border-radius: 6px;
    }
    .update-card code {
      background: #f3e8ff;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }
    .value-change {
      display: flex;
      gap: 20px;
      margin: 10px 0;
    }
    .value-box {
      flex: 1;
      padding: 10px;
      border-radius: 4px;
    }
    .old-value {
      background: #fee2e2;
      border: 1px solid #fecaca;
    }
    .new-value {
      background: #d1fae5;
      border: 1px solid #a7f3d0;
      font-weight: bold;
    }
    .notification {
      padding: 15px;
      margin: 10px 0;
      border-radius: 6px;
      border-left: 4px solid;
    }
    .notification.success {
      background: #d1fae5;
      border-color: #10b981;
    }
    .notification.warning {
      background: #fef3c7;
      border-color: #f59e0b;
    }
    .notification.info {
      background: #dbeafe;
      border-color: #3b82f6;
    }
    .notification-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .notification-meta {
      font-size: 12px;
      color: #64748b;
      margin-top: 8px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }
    @media print {
      body { background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 AI 인사이트 액션 리포트</h1>
      <h2>${insightTitle}</h2>
    </div>

    <div class="meta">
      <div class="meta-item">
        <span class="meta-label">액션 ID:</span>
        <span class="meta-value"><code>${actionResult.actionId}</code></span>
      </div>
      <div class="meta-item">
        <span class="meta-label">실행 시간:</span>
        <span class="meta-value">${new Date(actionResult.timestamp).toLocaleString('ko-KR')}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">상태:</span>
        <span class="meta-value">
          ${actionResult.success ? '<span class="success-badge">✅ 성공</span>' : '<span class="error-badge">❌ 실패</span>'}
        </span>
      </div>
    </div>

    <div class="message-box">
      <strong>📋 실행 결과:</strong><br>
      ${actionResult.message}
    </div>

    <h2>🎯 다음 단계</h2>
    <ul class="steps-list">
      ${actionResult.nextSteps.map(step => `<li>${step}</li>`).join('')}
    </ul>

    <h2>🔄 온톨로지 업데이트 (${actionResult.ontologyUpdates.length}개)</h2>
    ${actionResult.ontologyUpdates.map(update => `
      <div class="update-card">
        <h3><code>${update.entity}</code></h3>
        <p><strong>속성:</strong> <code>${update.property}</code></p>
        <div class="value-change">
          <div class="value-box old-value">
            <strong>이전 값:</strong><br>
            <code>${JSON.stringify(update.oldValue)}</code>
          </div>
          <div class="value-box new-value">
            <strong>새 값:</strong><br>
            <code>${JSON.stringify(update.newValue)}</code>
          </div>
        </div>
        <p style="margin-top: 10px; font-style: italic; color: #64748b;">
          ${update.reason}
        </p>
      </div>
    `).join('')}

    <h2>🔔 생성된 알림 (${actionResult.notifications.length}개)</h2>
    ${actionResult.notifications.map(notif => `
      <div class="notification ${notif.type}">
        <div class="notification-title">${notif.title}</div>
        <div>${notif.message}</div>
        <div class="notification-meta">
          ${notif.actionRequired ? '🔴 조치 필요' : '✅ 정보성'} • 
          ${new Date(notif.timestamp).toLocaleTimeString('ko-KR')} • 
          ${notif.relatedEntities.length}개 엔티티 연결
        </div>
      </div>
    `).join('')}

    <div class="footer">
      <p>KMTC 온톨로지 기반 부킹 에이전틱AI 플랫폼</p>
      <p>리포트 생성 시간: ${new Date().toLocaleString('ko-KR')}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Blob 다운로드 헬퍼
   */
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
}

export const reportService = new ReportService();
