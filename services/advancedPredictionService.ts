// Advanced Multi-Variable Prediction Service
export interface ExternalDataSource {
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    stormRisk: number;
    source: string;
    lastUpdated: Date;
  };
  oilPrice: {
    brent: number;
    wti: number;
    trend: 'rising' | 'falling' | 'stable';
    volatility: number;
    source: string;
    lastUpdated: Date;
  };
  exchangeRate: {
    usdKrw: number;
    eurKrw: number;
    jpyKrw: number;
    trend: 'strengthening' | 'weakening' | 'stable';
    volatility: number;
    source: string;
    lastUpdated: Date;
  };
  economicIndicators: {
    gdpGrowth: number;
    inflation: number;
    interestRate: number;
    tradeVolume: number;
    source: string;
    lastUpdated: Date;
  };
  geopolitical: {
    riskScore: number;
    events: string[];
    regions: Record<string, number>;
    source: string;
    lastUpdated: Date;
  };
}

export interface PredictionModel {
  id: string;
  name: string;
  type: 'linear' | 'neural' | 'ensemble' | 'transformer';
  version: string;
  accuracy: number;
  lastTrained: Date;
  features: string[];
  hyperparameters: Record<string, any>;
}

export interface PredictionResult {
  route: string;
  timeHorizon: number;
  predictedRate: number;
  confidenceInterval: {
    lower: number;
    upper: number;
    confidence: number;
  };
  trend: 'rising' | 'falling' | 'stable';
  volatility: number;
  factors: {
    name: string;
    impact: number;
    direction: 'positive' | 'negative';
    confidence: number;
  }[];
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  modelMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    mape: number; // Mean Absolute Percentage Error
  };
  dataQuality: {
    completeness: number;
    freshness: number;
    reliability: number;
  };
}

export interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  modelA: string;
  modelB: string;
  trafficSplit: number; // 0-100, percentage for model A
  startDate: Date;
  endDate: Date;
  metrics: string[];
  status: 'active' | 'completed' | 'paused';
}

export interface ABTestResult {
  testId: string;
  modelA: {
    predictions: number;
    accuracy: number;
    avgError: number;
    userSatisfaction: number;
  };
  modelB: {
    predictions: number;
    accuracy: number;
    avgError: number;
    userSatisfaction: number;
  };
  winner: 'A' | 'B' | 'tie';
  confidence: number;
  significance: number;
}

class AdvancedPredictionService {
  private models: Map<string, PredictionModel> = new Map();
  private externalData: ExternalDataSource | null = null;
  private predictionHistory: PredictionResult[] = [];
  private abTests: Map<string, ABTestConfig> = new Map();
  private abTestResults: Map<string, ABTestResult> = new Map();

  constructor() {
    this.initializeModels();
    this.startDataCollection();
  }

  // Initialize prediction models
  private initializeModels(): void {
    const models: PredictionModel[] = [
      {
        id: 'linear_v1',
        name: 'Linear Regression Model',
        type: 'linear',
        version: '1.0.0',
        accuracy: 0.78,
        lastTrained: new Date('2024-12-01'),
        features: ['historical_rates', 'seasonality', 'oil_price', 'exchange_rate'],
        hyperparameters: {
          regularization: 0.01,
          learningRate: 0.001
        }
      },
      {
        id: 'neural_v2',
        name: 'Deep Neural Network',
        type: 'neural',
        version: '2.1.0',
        accuracy: 0.85,
        lastTrained: new Date('2024-12-05'),
        features: ['historical_rates', 'weather', 'oil_price', 'exchange_rate', 'economic_indicators', 'geopolitical'],
        hyperparameters: {
          layers: [128, 64, 32],
          dropout: 0.2,
          batchSize: 32,
          epochs: 100
        }
      },
      {
        id: 'ensemble_v1',
        name: 'Ensemble Model',
        type: 'ensemble',
        version: '1.5.0',
        accuracy: 0.89,
        lastTrained: new Date('2024-12-08'),
        features: ['all_available'],
        hyperparameters: {
          models: ['linear_v1', 'neural_v2', 'xgboost_v1'],
          weights: [0.3, 0.5, 0.2]
        }
      },
      {
        id: 'transformer_v1',
        name: 'Transformer Model',
        type: 'transformer',
        version: '1.0.0',
        accuracy: 0.92,
        lastTrained: new Date('2024-12-10'),
        features: ['time_series', 'multivariate', 'attention_weights'],
        hyperparameters: {
          heads: 8,
          layers: 6,
          dModel: 512,
          sequenceLength: 30
        }
      }
    ];

    models.forEach(model => {
      this.models.set(model.id, model);
    });
  }

  // Start collecting external data
  private startDataCollection(): void {
    // Simulate real-time data collection
    this.updateExternalData();
    
    // Update every 5 minutes
    setInterval(() => {
      this.updateExternalData();
    }, 5 * 60 * 1000);
  }

  // Update external data sources
  private updateExternalData(): void {
    const now = new Date();
    
    // Simulate external data (in production, this would call real APIs)
    this.externalData = {
      weather: {
        temperature: 15 + Math.random() * 20, // 15-35°C
        humidity: 40 + Math.random() * 40, // 40-80%
        windSpeed: Math.random() * 30, // 0-30 km/h
        precipitation: Math.random() * 10, // 0-10mm
        stormRisk: Math.random() * 0.3, // 0-30%
        source: 'OpenWeatherMap API',
        lastUpdated: new Date(now.getTime() - Math.random() * 10 * 60 * 1000) // Within last 10 minutes
      },
      oilPrice: {
        brent: 70 + Math.random() * 20, // $70-90
        wti: 65 + Math.random() * 20, // $65-85
        trend: ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)] as any,
        volatility: Math.random() * 0.2, // 0-20%
        source: 'Bloomberg Energy API',
        lastUpdated: new Date(now.getTime() - Math.random() * 15 * 60 * 1000) // Within last 15 minutes
      },
      exchangeRate: {
        usdKrw: 1300 + Math.random() * 100, // 1300-1400
        eurKrw: 1400 + Math.random() * 100, // 1400-1500
        jpyKrw: 9 + Math.random() * 2, // 9-11
        trend: ['strengthening', 'weakening', 'stable'][Math.floor(Math.random() * 3)] as any,
        volatility: Math.random() * 0.15, // 0-15%
        source: 'Bank of Korea API',
        lastUpdated: new Date(now.getTime() - Math.random() * 5 * 60 * 1000) // Within last 5 minutes
      },
      economicIndicators: {
        gdpGrowth: 2 + Math.random() * 3, // 2-5%
        inflation: 1 + Math.random() * 4, // 1-5%
        interestRate: 3 + Math.random() * 2, // 3-5%
        tradeVolume: 90 + Math.random() * 20, // 90-110 (index)
        source: 'OECD Statistics API',
        lastUpdated: new Date(now.getTime() - Math.random() * 60 * 60 * 1000) // Within last hour
      },
      geopolitical: {
        riskScore: Math.random() * 0.5, // 0-50%
        events: ['Trade tensions', 'Regional conflicts', 'Policy changes'],
        regions: {
          'Asia': Math.random() * 0.3,
          'Europe': Math.random() * 0.2,
          'Americas': Math.random() * 0.25
        },
        source: 'Reuters Risk Intelligence',
        lastUpdated: new Date(now.getTime() - Math.random() * 30 * 60 * 1000) // Within last 30 minutes
      }
    };
  }

  // Advanced multi-variable prediction
  public async predictWithMultipleVariables(
    route: string,
    timeHorizon: number,
    modelId: string = 'ensemble_v1'
  ): Promise<PredictionResult> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Simulate model prediction with external variables
    const baseRate = 2800; // Base rate for kr-la
    const randomFactor = (Math.random() - 0.5) * 0.2; // ±10% random variation

    // Calculate impact of external factors
    const impacts = this.calculateFactorImpacts();
    const totalImpact = impacts.reduce((sum, factor) => sum + factor.impact, 0);

    const predictedRate = Math.round(baseRate * (1 + totalImpact / 100 + randomFactor));

    // Calculate confidence interval
    const uncertainty = Math.max(0.05, 1 - model.accuracy); // Minimum 5% uncertainty
    const margin = predictedRate * uncertainty;
    
    const confidenceInterval = {
      lower: Math.round(predictedRate - margin),
      upper: Math.round(predictedRate + margin),
      confidence: model.accuracy
    };

    // Determine trend
    const trendScore = impacts.reduce((sum, factor) => 
      sum + (factor.direction === 'positive' ? factor.impact : -factor.impact), 0
    );
    
    let trend: 'rising' | 'falling' | 'stable';
    if (trendScore > 2) trend = 'rising';
    else if (trendScore < -2) trend = 'falling';
    else trend = 'stable';

    // Calculate volatility
    const volatility = Math.min(0.3, uncertainty + (this.externalData?.oilPrice.volatility || 0));

    // Generate scenarios
    const scenarios = {
      optimistic: Math.round(predictedRate * 0.9),
      realistic: predictedRate,
      pessimistic: Math.round(predictedRate * 1.1)
    };

    // Model metrics (simulated)
    const modelMetrics = {
      accuracy: model.accuracy,
      precision: model.accuracy + Math.random() * 0.05,
      recall: model.accuracy - Math.random() * 0.05,
      f1Score: model.accuracy,
      mape: (1 - model.accuracy) * 20 // Convert to percentage error
    };

    // Data quality assessment
    const dataQuality = {
      completeness: 0.95 + Math.random() * 0.05,
      freshness: 0.9 + Math.random() * 0.1,
      reliability: 0.85 + Math.random() * 0.1
    };

    const result: PredictionResult = {
      route,
      timeHorizon,
      predictedRate,
      confidenceInterval,
      trend,
      volatility,
      factors: impacts,
      scenarios,
      modelMetrics,
      dataQuality
    };

    // Store prediction for accuracy tracking
    this.predictionHistory.push(result);
    
    // Keep only last 1000 predictions
    if (this.predictionHistory.length > 1000) {
      this.predictionHistory = this.predictionHistory.slice(-1000);
    }

    return result;
  }

  // Calculate impact of external factors
  private calculateFactorImpacts(): Array<{
    name: string;
    impact: number;
    direction: 'positive' | 'negative';
    confidence: number;
  }> {
    if (!this.externalData) return [];

    const factors = [];

    // Oil price impact
    const oilImpact = this.externalData.oilPrice.brent > 80 ? 
      (this.externalData.oilPrice.brent - 80) * 0.5 : 
      (80 - this.externalData.oilPrice.brent) * -0.3;
    
    factors.push({
      name: 'Oil Price',
      impact: Math.abs(oilImpact),
      direction: oilImpact > 0 ? 'positive' : 'negative',
      confidence: 0.85
    });

    // Exchange rate impact
    const usdKrwImpact = this.externalData.exchangeRate.usdKrw > 1350 ?
      (this.externalData.exchangeRate.usdKrw - 1350) * 0.02 :
      (1350 - this.externalData.exchangeRate.usdKrw) * -0.02;

    factors.push({
      name: 'USD/KRW Exchange Rate',
      impact: Math.abs(usdKrwImpact),
      direction: usdKrwImpact > 0 ? 'positive' : 'negative',
      confidence: 0.78
    });

    // Weather impact
    const weatherImpact = this.externalData.weather.stormRisk * 10;
    factors.push({
      name: 'Weather Conditions',
      impact: weatherImpact,
      direction: 'positive',
      confidence: 0.65
    });

    // Economic indicators impact
    const gdpImpact = (this.externalData.economicIndicators.gdpGrowth - 3) * 0.8;
    factors.push({
      name: 'GDP Growth',
      impact: Math.abs(gdpImpact),
      direction: gdpImpact > 0 ? 'negative' : 'positive', // Higher GDP = lower rates due to efficiency
      confidence: 0.72
    });

    // Geopolitical risk impact
    const geoImpact = this.externalData.geopolitical.riskScore * 15;
    factors.push({
      name: 'Geopolitical Risk',
      impact: geoImpact,
      direction: 'positive',
      confidence: 0.60
    });

    // Trade volume impact
    const tradeImpact = (this.externalData.economicIndicators.tradeVolume - 100) * 0.1;
    factors.push({
      name: 'Trade Volume',
      impact: Math.abs(tradeImpact),
      direction: tradeImpact > 0 ? 'positive' : 'negative',
      confidence: 0.80
    });

    return factors.sort((a, b) => b.impact - a.impact);
  }

  // Start A/B test
  public startABTest(config: ABTestConfig): void {
    this.abTests.set(config.id, config);
  }

  // Get A/B test results
  public getABTestResults(testId: string): ABTestResult | null {
    return this.abTestResults.get(testId) || null;
  }

  // Simulate A/B test execution
  public async runABTest(testId: string, route: string, timeHorizon: number): Promise<string> {
    const test = this.abTests.get(testId);
    if (!test) throw new Error('Test not found');

    // Determine which model to use based on traffic split
    const useModelA = Math.random() * 100 < test.trafficSplit;
    const modelId = useModelA ? test.modelA : test.modelB;

    // Run prediction
    await this.predictWithMultipleVariables(route, timeHorizon, modelId);

    return modelId;
  }

  // Calculate prediction accuracy over time
  public calculateAccuracyMetrics(modelId: string, days: number = 30): {
    accuracy: number;
    mape: number;
    rmse: number;
    trend: 'improving' | 'declining' | 'stable';
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentPredictions = this.predictionHistory.filter(p => 
      new Date(p.route) >= cutoffDate // Simplified date check
    );

    if (recentPredictions.length === 0) {
      return {
        accuracy: 0,
        mape: 100,
        rmse: 1000,
        trend: 'stable'
      };
    }

    // Simulate accuracy calculation (in production, compare with actual rates)
    const accuracy = recentPredictions.reduce((sum, p) => sum + p.modelMetrics.accuracy, 0) / recentPredictions.length;
    const mape = recentPredictions.reduce((sum, p) => sum + p.modelMetrics.mape, 0) / recentPredictions.length;
    const rmse = Math.sqrt(recentPredictions.reduce((sum, p) => sum + Math.pow(p.modelMetrics.mape, 2), 0) / recentPredictions.length);

    // Determine trend (simplified)
    const recentAccuracy = recentPredictions.slice(-7).reduce((sum, p) => sum + p.modelMetrics.accuracy, 0) / 7;
    const olderAccuracy = recentPredictions.slice(0, 7).reduce((sum, p) => sum + p.modelMetrics.accuracy, 0) / 7;
    
    let trend: 'improving' | 'declining' | 'stable';
    if (recentAccuracy > olderAccuracy + 0.02) trend = 'improving';
    else if (recentAccuracy < olderAccuracy - 0.02) trend = 'declining';
    else trend = 'stable';

    return { accuracy, mape, rmse, trend };
  }

  // Get available models
  public getAvailableModels(): PredictionModel[] {
    return Array.from(this.models.values());
  }

  // Get external data
  public getExternalData(): ExternalDataSource | null {
    return this.externalData;
  }

  // Get prediction history
  public getPredictionHistory(limit: number = 100): PredictionResult[] {
    return this.predictionHistory.slice(-limit);
  }

  // Feature importance analysis
  public getFeatureImportance(modelId: string): Array<{
    feature: string;
    importance: number;
    description: string;
  }> {
    const model = this.models.get(modelId);
    if (!model) return [];

    // Simulate feature importance (in production, this would come from the actual model)
    const features = [
      { feature: 'historical_rates', importance: 0.35, description: 'Historical rate patterns' },
      { feature: 'oil_price', importance: 0.25, description: 'Crude oil price fluctuations' },
      { feature: 'exchange_rate', importance: 0.15, description: 'Currency exchange rates' },
      { feature: 'seasonality', importance: 0.12, description: 'Seasonal demand patterns' },
      { feature: 'economic_indicators', importance: 0.08, description: 'GDP, inflation, trade volume' },
      { feature: 'weather', importance: 0.03, description: 'Weather and storm risks' },
      { feature: 'geopolitical', importance: 0.02, description: 'Political and regulatory risks' }
    ];

    return features.filter(f => model.features.includes(f.feature) || model.features.includes('all_available'));
  }

  // Model comparison
  public compareModels(modelIds: string[], route: string, timeHorizon: number): Promise<{
    models: Array<{
      id: string;
      name: string;
      prediction: number;
      confidence: number;
      accuracy: number;
    }>;
    recommendation: string;
  }> {
    const results = modelIds.map(id => {
      const model = this.models.get(id);
      if (!model) return null;

      // Simulate prediction for comparison
      const baseRate = 2800;
      const variation = (Math.random() - 0.5) * 0.1;
      const prediction = Math.round(baseRate * (1 + variation));

      return {
        id,
        name: model.name,
        prediction,
        confidence: model.accuracy,
        accuracy: model.accuracy
      };
    }).filter(Boolean);

    // Find best model (highest accuracy)
    const bestModel = results.reduce((best, current) => 
      current!.accuracy > best!.accuracy ? current : best
    );

    return Promise.resolve({
      models: results as any[],
      recommendation: bestModel!.id
    });
  }
}

// Export singleton instance
export const advancedPredictionService = new AdvancedPredictionService();