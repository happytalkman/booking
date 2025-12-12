// Real-time Alert and Notification Service
export interface AlertRule {
  id: string;
  name: string;
  type: 'exchange_rate' | 'oil_price' | 'weather' | 'geopolitical';
  condition: 'above' | 'below' | 'change_percent';
  threshold: number;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastTriggered?: Date;
  cooldownMinutes: number;
}

export interface Alert {
  id: string;
  ruleId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  data: any;
  acknowledged: boolean;
  autoAcknowledge: boolean;
}

class AlertService {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private subscribers: ((alert: Alert) => void)[] = [];
  private previousData: Map<string, any> = new Map();
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.initializeDefaultRules();
    this.requestNotificationPermission();
    this.startMonitoring();
  }

  // 기본 알림 규칙 초기화
  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'usd_krw_change',
        name: '원/달러 환율 급변동',
        type: 'exchange_rate',
        condition: 'change_percent',
        threshold: 2.0, // ±2%
        enabled: true,
        priority: 'high',
        cooldownMinutes: 30
      },
      {
        id: 'eur_krw_change',
        name: '원/유로 환율 급변동',
        type: 'exchange_rate',
        condition: 'change_percent',
        threshold: 2.0, // ±2%
        enabled: true,
        priority: 'medium',
        cooldownMinutes: 30
      },
      {
        id: 'oil_price_change',
        name: '유가 급등/급락',
        type: 'oil_price',
        condition: 'change_percent',
        threshold: 5.0, // ±5%
        enabled: true,
        priority: 'high',
        cooldownMinutes: 60
      },
      {
        id: 'storm_risk_high',
        name: '폭풍 위험도 높음',
        type: 'weather',
        condition: 'above',
        threshold: 30.0, // 30%
        enabled: true,
        priority: 'critical',
        cooldownMinutes: 120
      },
      {
        id: 'geopolitical_risk_increase',
        name: '지정학적 리스크 증가',
        type: 'geopolitical',
        condition: 'change_percent',
        threshold: 10.0, // ±10%
        enabled: true,
        priority: 'medium',
        cooldownMinutes: 180
      }
    ];
  }

  // 브라우저 알림 권한 요청
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  // 실시간 모니터링 시작
  private startMonitoring(): void {
    // 30초마다 데이터 체크
    setInterval(() => {
      this.checkAlertConditions();
    }, 30 * 1000);
  }

  // 알림 조건 체크
  private async checkAlertConditions(): Promise<void> {
    try {
      // 실제 데이터 가져오기
      const { realDataService } = await import('./realDataService');
      const currentData = await realDataService.getAllExternalData();

      for (const rule of this.rules.filter(r => r.enabled)) {
        if (this.isInCooldown(rule)) continue;

        const shouldTrigger = this.evaluateRule(rule, currentData);
        if (shouldTrigger) {
          const alert = this.createAlert(rule, currentData);
          this.triggerAlert(alert);
          rule.lastTriggered = new Date();
        }
      }

      // 이전 데이터 저장
      this.previousData.set('latest', currentData);
    } catch (error) {
      console.error('Alert monitoring error:', error);
    }
  }

  // 규칙 평가
  private evaluateRule(rule: AlertRule, currentData: any): boolean {
    const previousData = this.previousData.get('latest');
    if (!previousData) return false;

    switch (rule.type) {
      case 'exchange_rate':
        return this.evaluateExchangeRateRule(rule, currentData, previousData);
      case 'oil_price':
        return this.evaluateOilPriceRule(rule, currentData, previousData);
      case 'weather':
        return this.evaluateWeatherRule(rule, currentData);
      case 'geopolitical':
        return this.evaluateGeopoliticalRule(rule, currentData, previousData);
      default:
        return false;
    }
  }

  // 환율 규칙 평가
  private evaluateExchangeRateRule(rule: AlertRule, current: any, previous: any): boolean {
    const currentUsd = current.exchangeRate?.usdKrw || 0;
    const previousUsd = previous.exchangeRate?.usdKrw || 0;
    const currentEur = current.exchangeRate?.eurKrw || 0;
    const previousEur = previous.exchangeRate?.eurKrw || 0;

    if (rule.condition === 'change_percent') {
      const usdChange = Math.abs((currentUsd - previousUsd) / previousUsd * 100);
      const eurChange = Math.abs((currentEur - previousEur) / previousEur * 100);
      
      return usdChange >= rule.threshold || eurChange >= rule.threshold;
    }

    return false;
  }

  // 유가 규칙 평가
  private evaluateOilPriceRule(rule: AlertRule, current: any, previous: any): boolean {
    const currentBrent = current.oilPrice?.brent || 0;
    const previousBrent = previous.oilPrice?.brent || 0;
    const currentWti = current.oilPrice?.wti || 0;
    const previousWti = previous.oilPrice?.wti || 0;

    if (rule.condition === 'change_percent') {
      const brentChange = Math.abs((currentBrent - previousBrent) / previousBrent * 100);
      const wtiChange = Math.abs((currentWti - previousWti) / previousWti * 100);
      
      return brentChange >= rule.threshold || wtiChange >= rule.threshold;
    }

    return false;
  }

  // 날씨 규칙 평가
  private evaluateWeatherRule(rule: AlertRule, current: any): boolean {
    const stormRisk = (current.weather?.stormRisk || 0) * 100;

    if (rule.condition === 'above') {
      return stormRisk >= rule.threshold;
    }

    return false;
  }

  // 지정학적 리스크 규칙 평가
  private evaluateGeopoliticalRule(rule: AlertRule, current: any, previous: any): boolean {
    const currentRisk = (current.geopolitical?.riskScore || 0) * 100;
    const previousRisk = (previous.geopolitical?.riskScore || 0) * 100;

    if (rule.condition === 'change_percent') {
      const riskChange = Math.abs((currentRisk - previousRisk) / previousRisk * 100);
      return riskChange >= rule.threshold;
    }

    return false;
  }

  // 쿨다운 체크
  private isInCooldown(rule: AlertRule): boolean {
    if (!rule.lastTriggered) return false;
    
    const cooldownMs = rule.cooldownMinutes * 60 * 1000;
    const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
    
    return timeSinceLastTrigger < cooldownMs;
  }

  // 알림 생성
  private createAlert(rule: AlertRule, data: any): Alert {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      title: this.getAlertTitle(rule, data),
      message: this.getAlertMessage(rule, data),
      type: this.getAlertType(rule.priority),
      priority: rule.priority,
      timestamp: new Date(),
      data,
      acknowledged: false,
      autoAcknowledge: rule.priority === 'low'
    };

    return alert;
  }

  // 알림 제목 생성
  private getAlertTitle(rule: AlertRule, data: any): string {
    switch (rule.id) {
      case 'usd_krw_change':
        return '🚨 원/달러 환율 급변동 감지';
      case 'eur_krw_change':
        return '🚨 원/유로 환율 급변동 감지';
      case 'oil_price_change':
        return '⛽ 유가 급등/급락 감지';
      case 'storm_risk_high':
        return '🌪️ 부산항 폭풍 위험도 높음';
      case 'geopolitical_risk_increase':
        return '⚠️ 지정학적 리스크 증가';
      default:
        return '📢 시장 알림';
    }
  }

  // 알림 메시지 생성
  private getAlertMessage(rule: AlertRule, data: any): string {
    const previous = this.previousData.get('latest');
    
    switch (rule.id) {
      case 'usd_krw_change':
        const usdChange = previous ? 
          ((data.exchangeRate.usdKrw - previous.exchangeRate.usdKrw) / previous.exchangeRate.usdKrw * 100).toFixed(1) : '0';
        return `USD/KRW: ₩${data.exchangeRate.usdKrw.toFixed(0)} (${usdChange > 0 ? '+' : ''}${usdChange}%)`;
      
      case 'oil_price_change':
        const brentChange = previous ? 
          ((data.oilPrice.brent - previous.oilPrice.brent) / previous.oilPrice.brent * 100).toFixed(1) : '0';
        return `Brent: $${data.oilPrice.brent.toFixed(2)} (${brentChange > 0 ? '+' : ''}${brentChange}%)`;
      
      case 'storm_risk_high':
        return `부산항 폭풍 위험도: ${(data.weather.stormRisk * 100).toFixed(1)}% - 해상 운송 주의 필요`;
      
      case 'geopolitical_risk_increase':
        return `지정학적 리스크 점수: ${(data.geopolitical.riskScore * 100).toFixed(1)}% - 운임 변동 가능성 증가`;
      
      default:
        return rule.name;
    }
  }

  // 알림 타입 결정
  private getAlertType(priority: string): 'info' | 'warning' | 'error' | 'success' {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  }

  // 알림 트리거
  private triggerAlert(alert: Alert): void {
    // 알림 저장
    this.alerts.unshift(alert);
    
    // 최대 100개 알림만 유지
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    // 구독자들에게 알림
    this.subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert subscriber error:', error);
      }
    });

    // 브라우저 푸시 알림
    this.sendBrowserNotification(alert);

    // 콘솔 로그
    console.log(`🚨 Alert triggered: ${alert.title} - ${alert.message}`);
  }

  // 브라우저 푸시 알림
  private sendBrowserNotification(alert: Alert): void {
    if (this.notificationPermission !== 'granted') return;

    const notification = new Notification(alert.title, {
      body: alert.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: alert.ruleId,
      requireInteraction: alert.priority === 'critical',
      silent: alert.priority === 'low'
    });

    // 5초 후 자동 닫기 (critical 제외)
    if (alert.priority !== 'critical') {
      setTimeout(() => notification.close(), 5000);
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
      this.acknowledgeAlert(alert.id);
    };
  }

  // 공개 메서드들
  public subscribe(callback: (alert: Alert) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  public getAlerts(limit: number = 50): Alert[] {
    return this.alerts.slice(0, limit);
  }

  public getUnacknowledgedAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  public acknowledgeAllAlerts(): void {
    this.alerts.forEach(alert => {
      alert.acknowledged = true;
    });
  }

  public getRules(): AlertRule[] {
    return [...this.rules];
  }

  public updateRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
    }
  }

  public addRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  public removeRule(ruleId: string): void {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index > -1) {
      this.rules.splice(index, 1);
    }
  }

  public testAlert(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      const testAlert: Alert = {
        id: `test_${Date.now()}`,
        ruleId: rule.id,
        title: `[테스트] ${rule.name}`,
        message: '이것은 테스트 알림입니다.',
        type: 'info',
        priority: rule.priority,
        timestamp: new Date(),
        data: {},
        acknowledged: false,
        autoAcknowledge: true
      };
      
      this.triggerAlert(testAlert);
    }
  }
}

// Export singleton instance
export const alertService = new AlertService();