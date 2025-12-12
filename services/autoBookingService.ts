// Auto Booking Service for managing automated booking rules and executions
import { ragService } from './ragService';

export interface MarketCondition {
  route: string;
  currentRate: number;
  marketTrend: 'rising' | 'falling' | 'stable';
  volatility: number;
  capacity: 'high' | 'medium' | 'low';
  competitorRates: Record<string, number>;
  riskFactors: string[];
}

export interface BookingOpportunity {
  id: string;
  route: string;
  containerType: string;
  quantity: number;
  currentRate: number;
  recommendedRate: number;
  estimatedSavings: number;
  confidence: number;
  urgency: 'high' | 'medium' | 'low';
  validUntil: Date;
  riskAssessment: {
    score: number;
    factors: string[];
    recommendation: 'proceed' | 'caution' | 'stop';
  };
}

export interface AutoBookingRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    routes: string[];
    rateThreshold: number;
    comparison: 'below' | 'above';
    containerTypes: string[];
    minQuantity: number;
    maxQuantity: number;
    timeWindow?: {
      start: string;
      end: string;
    };
    riskLevel: 'low' | 'medium' | 'high';
    marketConditions?: {
      trendRequired?: 'rising' | 'falling' | 'stable';
      maxVolatility?: number;
      minCapacity?: 'high' | 'medium' | 'low';
    };
  };
  actions: {
    autoExecute: boolean;
    requireApproval: boolean;
    approvers: string[];
    maxAmount: number;
    notifyChannels: string[];
    bookingTemplate: {
      priority: 'high' | 'medium' | 'low';
      specialInstructions?: string;
      customerPreferences?: Record<string, any>;
    };
  };
  riskControls: {
    maxDailyBookings: number;
    maxWeeklyAmount: number;
    blackoutDates: string[];
    emergencyStop: boolean;
    riskThreshold: number; // 0-1 scale
    requiresHumanReview: boolean;
  };
  performance: {
    executionCount: number;
    successRate: number;
    totalSavings: number;
    avgExecutionTime: number;
    lastOptimized: Date;
  };
}

export interface RiskAssessment {
  score: number; // 0-1 scale, 0 = low risk, 1 = high risk
  factors: {
    marketVolatility: number;
    routeStability: number;
    carrierReliability: number;
    seasonalFactors: number;
    geopoliticalRisk: number;
    economicIndicators: number;
  };
  recommendation: 'proceed' | 'caution' | 'stop';
  reasoning: string[];
  mitigationStrategies: string[];
}

class AutoBookingService {
  private rules: Map<string, AutoBookingRule> = new Map();
  private marketData: Map<string, MarketCondition> = new Map();
  private executionHistory: any[] = [];
  private riskThresholds = {
    low: 0.3,
    medium: 0.6,
    high: 0.8
  };

  constructor() {
    this.initializeMarketData();
    this.startMarketMonitoring();
  }

  // Initialize market data with mock data
  private initializeMarketData(): void {
    const mockMarketData: MarketCondition[] = [
      {
        route: 'kr-la',
        currentRate: 2750,
        marketTrend: 'falling',
        volatility: 0.15,
        capacity: 'high',
        competitorRates: {
          'Maersk': 2850,
          'MSC': 2820,
          'CMA CGM': 2780
        },
        riskFactors: ['Seasonal demand decline', 'Increased capacity']
      },
      {
        route: 'kr-eu',
        currentRate: 3200,
        marketTrend: 'stable',
        volatility: 0.08,
        capacity: 'medium',
        competitorRates: {
          'Maersk': 3250,
          'MSC': 3180,
          'Hapag-Lloyd': 3220
        },
        riskFactors: ['Stable demand', 'Normal capacity']
      },
      {
        route: 'kr-cn',
        currentRate: 1200,
        marketTrend: 'rising',
        volatility: 0.25,
        capacity: 'low',
        competitorRates: {
          'COSCO': 1250,
          'OOCL': 1230,
          'Evergreen': 1280
        },
        riskFactors: ['High demand', 'Limited capacity', 'Port congestion']
      }
    ];

    mockMarketData.forEach(data => {
      this.marketData.set(data.route, data);
    });
  }

  // Start monitoring market conditions
  private startMarketMonitoring(): void {
    // Simulate real-time market monitoring
    setInterval(() => {
      this.updateMarketConditions();
      this.evaluateBookingOpportunities();
    }, 30000); // Check every 30 seconds
  }

  // Update market conditions with simulated data
  private updateMarketConditions(): void {
    this.marketData.forEach((condition, route) => {
      // Simulate rate changes
      const rateChange = (Math.random() - 0.5) * 100; // ±$50 change
      condition.currentRate = Math.max(1000, condition.currentRate + rateChange);
      
      // Update volatility
      condition.volatility = Math.max(0.05, Math.min(0.5, condition.volatility + (Math.random() - 0.5) * 0.1));
      
      // Update trend based on recent changes
      if (rateChange > 20) condition.marketTrend = 'rising';
      else if (rateChange < -20) condition.marketTrend = 'falling';
      else condition.marketTrend = 'stable';
      
      this.marketData.set(route, condition);
    });
  }

  // Evaluate booking opportunities based on rules
  public evaluateBookingOpportunities(): BookingOpportunity[] {
    const opportunities: BookingOpportunity[] = [];

    this.rules.forEach(rule => {
      if (!rule.enabled || rule.riskControls.emergencyStop) return;

      rule.conditions.routes.forEach(route => {
        const marketCondition = this.marketData.get(route);
        if (!marketCondition) return;

        // Check if conditions are met
        const conditionsMet = this.checkRuleConditions(rule, marketCondition);
        if (!conditionsMet) return;

        // Assess risk
        const riskAssessment = this.assessRisk(route, rule);
        if (riskAssessment.score > this.riskThresholds[rule.conditions.riskLevel]) return;

        // Calculate opportunity
        const opportunity = this.calculateBookingOpportunity(rule, marketCondition, riskAssessment);
        if (opportunity) {
          opportunities.push(opportunity);
        }
      });
    });

    return opportunities;
  }

  // Check if rule conditions are met
  private checkRuleConditions(rule: AutoBookingRule, marketCondition: MarketCondition): boolean {
    // Rate threshold check
    const rateConditionMet = rule.conditions.comparison === 'below' 
      ? marketCondition.currentRate <= rule.conditions.rateThreshold
      : marketCondition.currentRate >= rule.conditions.rateThreshold;

    if (!rateConditionMet) return false;

    // Market conditions check
    if (rule.conditions.marketConditions) {
      const { trendRequired, maxVolatility, minCapacity } = rule.conditions.marketConditions;
      
      if (trendRequired && marketCondition.marketTrend !== trendRequired) return false;
      if (maxVolatility && marketCondition.volatility > maxVolatility) return false;
      if (minCapacity) {
        const capacityOrder = { low: 0, medium: 1, high: 2 };
        if (capacityOrder[marketCondition.capacity] < capacityOrder[minCapacity]) return false;
      }
    }

    // Time window check
    if (rule.conditions.timeWindow) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const startTime = parseInt(rule.conditions.timeWindow.start.replace(':', ''));
      const endTime = parseInt(rule.conditions.timeWindow.end.replace(':', ''));
      
      if (currentTime < startTime || currentTime > endTime) return false;
    }

    return true;
  }

  // Assess risk for a booking opportunity
  public assessRisk(route: string, rule?: AutoBookingRule): RiskAssessment {
    const marketCondition = this.marketData.get(route);
    if (!marketCondition) {
      return {
        score: 1.0,
        factors: {
          marketVolatility: 1.0,
          routeStability: 1.0,
          carrierReliability: 1.0,
          seasonalFactors: 1.0,
          geopoliticalRisk: 1.0,
          economicIndicators: 1.0
        },
        recommendation: 'stop',
        reasoning: ['No market data available'],
        mitigationStrategies: []
      };
    }

    // Calculate individual risk factors
    const factors = {
      marketVolatility: Math.min(1.0, marketCondition.volatility * 2), // Scale volatility
      routeStability: this.calculateRouteStability(route),
      carrierReliability: this.calculateCarrierReliability(route),
      seasonalFactors: this.calculateSeasonalRisk(),
      geopoliticalRisk: this.calculateGeopoliticalRisk(route),
      economicIndicators: this.calculateEconomicRisk()
    };

    // Calculate overall risk score (weighted average)
    const weights = {
      marketVolatility: 0.25,
      routeStability: 0.20,
      carrierReliability: 0.15,
      seasonalFactors: 0.15,
      geopoliticalRisk: 0.15,
      economicIndicators: 0.10
    };

    const score = Object.entries(factors).reduce((sum, [key, value]) => {
      return sum + value * weights[key as keyof typeof weights];
    }, 0);

    // Generate recommendation
    let recommendation: 'proceed' | 'caution' | 'stop';
    if (score <= 0.3) recommendation = 'proceed';
    else if (score <= 0.6) recommendation = 'caution';
    else recommendation = 'stop';

    // Generate reasoning
    const reasoning: string[] = [];
    if (factors.marketVolatility > 0.5) reasoning.push('High market volatility detected');
    if (factors.routeStability > 0.6) reasoning.push('Route showing instability');
    if (factors.geopoliticalRisk > 0.7) reasoning.push('Elevated geopolitical risk');
    if (marketCondition.capacity === 'low') reasoning.push('Limited capacity availability');

    // Generate mitigation strategies
    const mitigationStrategies: string[] = [];
    if (score > 0.4) {
      mitigationStrategies.push('Consider smaller booking quantities');
      mitigationStrategies.push('Implement closer monitoring');
      mitigationStrategies.push('Prepare contingency plans');
    }
    if (factors.marketVolatility > 0.6) {
      mitigationStrategies.push('Use rate hedging strategies');
    }

    return {
      score,
      factors,
      recommendation,
      reasoning,
      mitigationStrategies
    };
  }

  // Calculate route stability (mock implementation)
  private calculateRouteStability(route: string): number {
    const stabilityMap: Record<string, number> = {
      'kr-la': 0.2,
      'kr-eu': 0.3,
      'kr-cn': 0.6,
      'kr-jp': 0.1,
      'kr-ny': 0.4
    };
    return stabilityMap[route] || 0.5;
  }

  // Calculate carrier reliability (mock implementation)
  private calculateCarrierReliability(route: string): number {
    // KMTC reliability score (mock)
    return 0.15; // Generally reliable
  }

  // Calculate seasonal risk (mock implementation)
  private calculateSeasonalRisk(): number {
    const month = new Date().getMonth();
    // Higher risk during peak seasons (Nov-Jan, May-Jul)
    if ([10, 11, 0, 4, 5, 6].includes(month)) return 0.4;
    return 0.2;
  }

  // Calculate geopolitical risk (mock implementation)
  private calculateGeopoliticalRisk(route: string): number {
    const riskMap: Record<string, number> = {
      'kr-la': 0.2,
      'kr-eu': 0.3,
      'kr-cn': 0.4,
      'kr-jp': 0.1,
      'kr-ny': 0.2
    };
    return riskMap[route] || 0.3;
  }

  // Calculate economic risk (mock implementation)
  private calculateEconomicRisk(): number {
    // Based on global economic indicators
    return 0.25;
  }

  // Calculate booking opportunity
  private calculateBookingOpportunity(
    rule: AutoBookingRule, 
    marketCondition: MarketCondition, 
    riskAssessment: RiskAssessment
  ): BookingOpportunity | null {
    const route = marketCondition.route;
    const currentRate = marketCondition.currentRate;
    const thresholdRate = rule.conditions.rateThreshold;
    
    // Calculate potential savings
    const estimatedSavings = Math.abs(currentRate - thresholdRate) * 
      (rule.conditions.minQuantity + rule.conditions.maxQuantity) / 2;

    // Calculate confidence based on market conditions and risk
    const confidence = Math.max(0.1, Math.min(0.95, 
      (1 - riskAssessment.score) * 
      (1 - marketCondition.volatility) * 
      (marketCondition.capacity === 'high' ? 1.2 : marketCondition.capacity === 'medium' ? 1.0 : 0.8)
    ));

    // Determine urgency
    let urgency: 'high' | 'medium' | 'low' = 'medium';
    if (marketCondition.marketTrend === 'rising' && rule.conditions.comparison === 'below') urgency = 'high';
    else if (marketCondition.volatility > 0.3) urgency = 'high';
    else if (confidence > 0.8) urgency = 'low';

    // Calculate validity period
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + (urgency === 'high' ? 2 : urgency === 'medium' ? 6 : 12));

    return {
      id: `opp_${Date.now()}_${route}`,
      route,
      containerType: rule.conditions.containerTypes[0], // Use first container type
      quantity: Math.floor((rule.conditions.minQuantity + rule.conditions.maxQuantity) / 2),
      currentRate,
      recommendedRate: currentRate,
      estimatedSavings,
      confidence,
      urgency,
      validUntil,
      riskAssessment
    };
  }

  // Execute automatic booking
  public async executeAutoBooking(opportunity: BookingOpportunity, rule: AutoBookingRule): Promise<{
    success: boolean;
    bookingNumber?: string;
    error?: string;
    executionTime: number;
  }> {
    const startTime = Date.now();

    try {
      // Pre-execution checks
      if (!this.preExecutionChecks(rule, opportunity)) {
        return {
          success: false,
          error: 'Pre-execution checks failed',
          executionTime: Date.now() - startTime
        };
      }

      // Simulate booking execution
      await this.simulateBookingExecution(opportunity);

      // Generate booking number
      const bookingNumber = `AUTO${Date.now().toString().slice(-8)}`;

      // Update rule performance
      this.updateRulePerformance(rule.id, true, opportunity.estimatedSavings);

      // Log execution
      this.logExecution(rule, opportunity, 'success', bookingNumber);

      return {
        success: true,
        bookingNumber,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      // Update rule performance
      this.updateRulePerformance(rule.id, false, 0);

      // Log execution
      this.logExecution(rule, opportunity, 'failed', undefined, error as Error);

      return {
        success: false,
        error: (error as Error).message,
        executionTime: Date.now() - startTime
      };
    }
  }

  // Pre-execution checks
  private preExecutionChecks(rule: AutoBookingRule, opportunity: BookingOpportunity): boolean {
    // Check daily booking limit
    const today = new Date().toDateString();
    const todayExecutions = this.executionHistory.filter(exec => 
      exec.ruleId === rule.id && 
      new Date(exec.timestamp).toDateString() === today
    ).length;

    if (todayExecutions >= rule.riskControls.maxDailyBookings) {
      console.log('Daily booking limit exceeded');
      return false;
    }

    // Check weekly amount limit
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weeklyAmount = this.executionHistory
      .filter(exec => 
        exec.ruleId === rule.id && 
        new Date(exec.timestamp) >= weekStart
      )
      .reduce((sum, exec) => sum + (exec.amount || 0), 0);

    const estimatedAmount = opportunity.currentRate * opportunity.quantity;
    if (weeklyAmount + estimatedAmount > rule.riskControls.maxWeeklyAmount) {
      console.log('Weekly amount limit exceeded');
      return false;
    }

    // Check blackout dates
    const today_str = new Date().toISOString().split('T')[0];
    if (rule.riskControls.blackoutDates.includes(today_str)) {
      console.log('Blackout date restriction');
      return false;
    }

    // Check emergency stop
    if (rule.riskControls.emergencyStop) {
      console.log('Emergency stop activated');
      return false;
    }

    return true;
  }

  // Simulate booking execution
  private async simulateBookingExecution(opportunity: BookingOpportunity): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Booking system temporarily unavailable');
    }
  }

  // Update rule performance metrics
  private updateRulePerformance(ruleId: string, success: boolean, savings: number): void {
    const rule = this.rules.get(ruleId);
    if (!rule) return;

    rule.performance.executionCount++;
    if (success) {
      rule.performance.totalSavings += savings;
    }
    
    // Recalculate success rate
    const successfulExecutions = this.executionHistory.filter(exec => 
      exec.ruleId === ruleId && exec.status === 'success'
    ).length;
    rule.performance.successRate = successfulExecutions / rule.performance.executionCount;

    this.rules.set(ruleId, rule);
  }

  // Log execution for audit trail
  private logExecution(
    rule: AutoBookingRule, 
    opportunity: BookingOpportunity, 
    status: string, 
    bookingNumber?: string, 
    error?: Error
  ): void {
    const execution = {
      id: `exec_${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      timestamp: new Date(),
      status,
      opportunity,
      bookingNumber,
      error: error?.message,
      amount: opportunity.currentRate * opportunity.quantity
    };

    this.executionHistory.push(execution);

    // Keep only last 1000 executions
    if (this.executionHistory.length > 1000) {
      this.executionHistory = this.executionHistory.slice(-1000);
    }
  }

  // Get market condition for a route
  public getMarketCondition(route: string): MarketCondition | null {
    return this.marketData.get(route) || null;
  }

  // Get all market conditions
  public getAllMarketConditions(): MarketCondition[] {
    return Array.from(this.marketData.values());
  }

  // Add or update a rule
  public addRule(rule: AutoBookingRule): void {
    this.rules.set(rule.id, rule);
  }

  // Get rule by ID
  public getRule(ruleId: string): AutoBookingRule | null {
    return this.rules.get(ruleId) || null;
  }

  // Get all rules
  public getAllRules(): AutoBookingRule[] {
    return Array.from(this.rules.values());
  }

  // Remove rule
  public removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  // Get execution history
  public getExecutionHistory(ruleId?: string): any[] {
    if (ruleId) {
      return this.executionHistory.filter(exec => exec.ruleId === ruleId);
    }
    return this.executionHistory;
  }

  // Emergency stop all rules
  public emergencyStopAll(): void {
    this.rules.forEach(rule => {
      rule.riskControls.emergencyStop = true;
      this.rules.set(rule.id, rule);
    });
  }

  // Resume all rules
  public resumeAll(): void {
    this.rules.forEach(rule => {
      rule.riskControls.emergencyStop = false;
      this.rules.set(rule.id, rule);
    });
  }

  // Get system statistics
  public getSystemStats(): {
    totalRules: number;
    activeRules: number;
    totalExecutions: number;
    successRate: number;
    totalSavings: number;
    avgExecutionTime: number;
  } {
    const totalRules = this.rules.size;
    const activeRules = Array.from(this.rules.values()).filter(rule => rule.enabled).length;
    const totalExecutions = this.executionHistory.length;
    const successfulExecutions = this.executionHistory.filter(exec => exec.status === 'success').length;
    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;
    const totalSavings = Array.from(this.rules.values()).reduce((sum, rule) => sum + rule.performance.totalSavings, 0);
    const avgExecutionTime = Array.from(this.rules.values()).reduce((sum, rule) => sum + rule.performance.avgExecutionTime, 0) / totalRules;

    return {
      totalRules,
      activeRules,
      totalExecutions,
      successRate,
      totalSavings,
      avgExecutionTime
    };
  }
}

// Export singleton instance
export const autoBookingService = new AutoBookingService();