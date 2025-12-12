// AI-based Rate Prediction Accuracy Enhancement Service
export interface PredictionAccuracy {
  modelId: string;
  accuracy: number;
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  mae: number;  // Mean Absolute Error
  r2Score: number; // R-squared
  lastUpdated: Date;
  sampleSize: number;
}

export interface SeasonalPattern {
  month: number;
  seasonalFactor: number;
  confidence: number;
  historicalData: number[];
}

export interface OnlineLearningMetrics {
  totalPredictions: number;
  correctPredictions: number;
  learningRate: number;
  adaptationSpeed: number;
  lastModelUpdate: Date;
  performanceTrend: 'improving' | 'stable' | 'declining';
}

export interface ModelComparison {
  modelId: string;
  name: string;
  accuracy: number;
  speed: number;
  memoryUsage: number;
  isActive: boolean;
  lastPerformance: Date;
}

class AILearningService {
  private accuracyHistory: Map<string, PredictionAccuracy[]> = new Map();
  private seasonalPatterns: SeasonalPattern[] = [];
  private onlineLearningMetrics: OnlineLearningMetrics;
  private modelComparisons: ModelComparison[] = [];
  private realPredictions: Array<{
    timestamp: Date;
    predicted: number;
    actual?: number;
    route: string;
    modelId: string;
    factors: any;
  }> = [];

  constructor() {
    this.initializeMetrics();
    this.initializeModels();
    this.startOnlineLearning();
    this.detectSeasonalPatterns();
  }

  // 메트릭 초기화
  private initializeMetrics(): void {
    this.onlineLearningMetrics = {
      totalPredictions: 0,
      correctPredictions: 0,
      learningRate: 0.01,
      adaptationSpeed: 0.85,
      lastModelUpdate: new Date(),
      performanceTrend: 'stable'
    };
  }

  // 모델 초기화
  private initializeModels(): void {
    this.modelComparisons = [
      {
        modelId: 'linear_v1',
        name: 'Linear Regression',
        accuracy: 0.78,
        speed: 0.95,
        memoryUsage: 0.2,
        isActive: true,
        lastPerformance: new Date()
      },
      {
        modelId: 'neural_v2',
        name: 'Deep Neural Network',
        accuracy: 0.85,
        speed: 0.7,
        memoryUsage: 0.6,
        isActive: true,
        lastPerformance: new Date()
      },
      {
        modelId: 'ensemble_v1',
        name: 'Ensemble Model',
        accuracy: 0.89,
        speed: 0.6,
        memoryUsage: 0.8,
        isActive: true,
        lastPerformance: new Date()
      },
      {
        modelId: 'transformer_v1',
        name: 'Transformer Model',
        accuracy: 0.92,
        speed: 0.4,
        memoryUsage: 0.9,
        isActive: true,
        lastPerformance: new Date()
      }
    ];
  }

  // 온라인 학습 시작
  private startOnlineLearning(): void {
    // 10분마다 모델 성능 업데이트
    setInterval(() => {
      this.updateModelPerformance();
    }, 10 * 60 * 1000);

    // 1시간마다 계절성 패턴 업데이트
    setInterval(() => {
      this.detectSeasonalPatterns();
    }, 60 * 60 * 1000);

    // 30분마다 모델 비교 및 최적화
    setInterval(() => {
      this.optimizeModelSelection();
    }, 30 * 60 * 1000);
  }

  // 예측 기록
  public recordPrediction(
    predicted: number,
    route: string,
    modelId: string,
    factors: any
  ): string {
    const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.realPredictions.push({
      timestamp: new Date(),
      predicted,
      route,
      modelId,
      factors
    });

    this.onlineLearningMetrics.totalPredictions++;

    // 최대 1000개 예측만 유지
    if (this.realPredictions.length > 1000) {
      this.realPredictions = this.realPredictions.slice(-1000);
    }

    return predictionId;
  }

  // 실제 값 업데이트 (예측 정확도 계산용)
  public updateActualValue(predictionId: string, actualValue: number): void {
    // 실제 구현에서는 predictionId로 찾아야 하지만, 
    // 시뮬레이션을 위해 최근 예측에 실제 값 추가
    const recentPredictions = this.realPredictions.slice(-10);
    recentPredictions.forEach(pred => {
      if (!pred.actual) {
        // 시뮬레이션: 실제 값은 예측값의 ±10% 범위
        pred.actual = pred.predicted * (0.9 + Math.random() * 0.2);
      }
    });

    this.calculateAccuracy();
  }

  // 정확도 계산
  private calculateAccuracy(): void {
    const predictionsWithActual = this.realPredictions.filter(p => p.actual !== undefined);
    
    if (predictionsWithActual.length < 10) return;

    // 모델별 정확도 계산
    const modelGroups = this.groupBy(predictionsWithActual, 'modelId');
    
    Object.entries(modelGroups).forEach(([modelId, predictions]) => {
      const accuracy = this.calculateModelAccuracy(predictions);
      
      if (!this.accuracyHistory.has(modelId)) {
        this.accuracyHistory.set(modelId, []);
      }
      
      const history = this.accuracyHistory.get(modelId)!;
      history.push(accuracy);
      
      // 최대 100개 기록만 유지
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      // 모델 비교 데이터 업데이트
      const modelComparison = this.modelComparisons.find(m => m.modelId === modelId);
      if (modelComparison) {
        modelComparison.accuracy = accuracy.accuracy;
        modelComparison.lastPerformance = new Date();
      }
    });
  }

  // 모델 정확도 계산
  private calculateModelAccuracy(predictions: any[]): PredictionAccuracy {
    const errors = predictions.map(p => Math.abs(p.predicted - p.actual!));
    const squaredErrors = predictions.map(p => Math.pow(p.predicted - p.actual!, 2));
    const percentageErrors = predictions.map(p => Math.abs((p.predicted - p.actual!) / p.actual!) * 100);

    const mae = errors.reduce((sum, error) => sum + error, 0) / errors.length;
    const mse = squaredErrors.reduce((sum, error) => sum + error, 0) / squaredErrors.length;
    const rmse = Math.sqrt(mse);
    const mape = percentageErrors.reduce((sum, error) => sum + error, 0) / percentageErrors.length;

    // R-squared 계산
    const actualMean = predictions.reduce((sum, p) => sum + p.actual!, 0) / predictions.length;
    const totalSumSquares = predictions.reduce((sum, p) => sum + Math.pow(p.actual! - actualMean, 2), 0);
    const residualSumSquares = squaredErrors.reduce((sum, error) => sum + error, 0);
    const r2Score = 1 - (residualSumSquares / totalSumSquares);

    const accuracy = Math.max(0, 1 - (mape / 100));

    return {
      modelId: predictions[0].modelId,
      accuracy,
      mape,
      rmse,
      mae,
      r2Score,
      lastUpdated: new Date(),
      sampleSize: predictions.length
    };
  }

  // 계절성 패턴 감지
  private detectSeasonalPatterns(): void {
    const monthlyData = this.groupPredictionsByMonth();
    
    this.seasonalPatterns = Object.entries(monthlyData).map(([month, data]) => {
      const monthNum = parseInt(month);
      const values = data.map(d => d.predicted);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const yearlyAverage = this.calculateYearlyAverage();
      
      return {
        month: monthNum,
        seasonalFactor: average / yearlyAverage,
        confidence: Math.min(0.95, values.length / 30), // 30개 이상 데이터면 95% 신뢰도
        historicalData: values
      };
    });
  }

  // 월별 예측 그룹화
  private groupPredictionsByMonth(): Record<string, any[]> {
    return this.realPredictions.reduce((groups, prediction) => {
      const month = prediction.timestamp.getMonth();
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(prediction);
      return groups;
    }, {} as Record<string, any[]>);
  }

  // 연평균 계산
  private calculateYearlyAverage(): number {
    if (this.realPredictions.length === 0) return 2800; // 기본값
    
    const total = this.realPredictions.reduce((sum, pred) => sum + pred.predicted, 0);
    return total / this.realPredictions.length;
  }

  // 모델 성능 업데이트
  private updateModelPerformance(): void {
    // 시뮬레이션: 모델 성능 변화
    this.modelComparisons.forEach(model => {
      // 성능 변화 시뮬레이션 (±2%)
      const change = (Math.random() - 0.5) * 0.04;
      model.accuracy = Math.max(0.5, Math.min(0.98, model.accuracy + change));
      
      // 메모리 사용량 변화
      model.memoryUsage = Math.max(0.1, Math.min(1.0, model.memoryUsage + (Math.random() - 0.5) * 0.1));
    });

    // 성능 트렌드 업데이트
    this.updatePerformanceTrend();
  }

  // 성능 트렌드 업데이트
  private updatePerformanceTrend(): void {
    const recentAccuracy = this.getRecentAccuracy();
    const previousAccuracy = this.getPreviousAccuracy();

    if (recentAccuracy > previousAccuracy + 0.02) {
      this.onlineLearningMetrics.performanceTrend = 'improving';
    } else if (recentAccuracy < previousAccuracy - 0.02) {
      this.onlineLearningMetrics.performanceTrend = 'declining';
    } else {
      this.onlineLearningMetrics.performanceTrend = 'stable';
    }

    this.onlineLearningMetrics.lastModelUpdate = new Date();
  }

  // 모델 선택 최적화
  private optimizeModelSelection(): void {
    // 성능 기반 모델 활성화/비활성화
    this.modelComparisons.forEach(model => {
      // 정확도가 70% 미만이면 비활성화
      if (model.accuracy < 0.7) {
        model.isActive = false;
      } else if (model.accuracy > 0.8) {
        model.isActive = true;
      }
    });

    // 최고 성능 모델 찾기
    const bestModel = this.modelComparisons
      .filter(m => m.isActive)
      .sort((a, b) => b.accuracy - a.accuracy)[0];

    if (bestModel) {
      console.log(`🎯 Best performing model: ${bestModel.name} (${(bestModel.accuracy * 100).toFixed(1)}%)`);
    }
  }

  // 유틸리티 메서드들
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private getRecentAccuracy(): number {
    const recentPredictions = this.realPredictions.slice(-50);
    if (recentPredictions.length === 0) return 0.8;
    
    const withActual = recentPredictions.filter(p => p.actual);
    if (withActual.length === 0) return 0.8;
    
    const accuracy = this.calculateModelAccuracy(withActual);
    return accuracy.accuracy;
  }

  private getPreviousAccuracy(): number {
    const previousPredictions = this.realPredictions.slice(-100, -50);
    if (previousPredictions.length === 0) return 0.8;
    
    const withActual = previousPredictions.filter(p => p.actual);
    if (withActual.length === 0) return 0.8;
    
    const accuracy = this.calculateModelAccuracy(withActual);
    return accuracy.accuracy;
  }

  // 공개 메서드들
  public getAccuracyHistory(modelId: string): PredictionAccuracy[] {
    return this.accuracyHistory.get(modelId) || [];
  }

  public getAllAccuracyHistory(): Map<string, PredictionAccuracy[]> {
    return new Map(this.accuracyHistory);
  }

  public getSeasonalPatterns(): SeasonalPattern[] {
    return [...this.seasonalPatterns];
  }

  public getOnlineLearningMetrics(): OnlineLearningMetrics {
    return { ...this.onlineLearningMetrics };
  }

  public getModelComparisons(): ModelComparison[] {
    return [...this.modelComparisons];
  }

  public getBestModel(): ModelComparison | null {
    const activeModels = this.modelComparisons.filter(m => m.isActive);
    if (activeModels.length === 0) return null;
    
    return activeModels.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    );
  }

  public adjustConfidenceInterval(modelId: string, route: string): { lower: number; upper: number; confidence: number } {
    const history = this.accuracyHistory.get(modelId);
    if (!history || history.length === 0) {
      return { lower: 0.8, upper: 1.2, confidence: 0.8 };
    }

    const latestAccuracy = history[history.length - 1];
    const seasonalFactor = this.getSeasonalFactor(new Date().getMonth());
    
    // 동적 신뢰도 구간 계산
    const baseConfidence = latestAccuracy.accuracy;
    const seasonalAdjustment = seasonalFactor * 0.1;
    const volatilityAdjustment = latestAccuracy.rmse / 1000; // RMSE 기반 변동성
    
    const adjustedConfidence = Math.max(0.6, Math.min(0.95, 
      baseConfidence + seasonalAdjustment - volatilityAdjustment
    ));

    const margin = (1 - adjustedConfidence) * 0.5;
    
    return {
      lower: 1 - margin,
      upper: 1 + margin,
      confidence: adjustedConfidence
    };
  }

  private getSeasonalFactor(month: number): number {
    const pattern = this.seasonalPatterns.find(p => p.month === month);
    return pattern ? pattern.seasonalFactor : 1.0;
  }

  public simulateRealTimeUpdate(): void {
    // 실시간 업데이트 시뮬레이션
    this.updateActualValue('', 0);
    this.updateModelPerformance();
  }
}

// Export singleton instance
export const aiLearningService = new AILearningService();