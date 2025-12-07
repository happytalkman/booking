// Machine Learning Prediction Service using TensorFlow.js
// Note: In production, you would install @tensorflow/tfjs
// For now, we'll create a simulation that can be easily replaced with real TensorFlow.js

interface PredictionResult {
  predictedRate: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors: {
    name: string;
    impact: number;
  }[];
}

interface HistoricalData {
  date: Date;
  rate: number;
  oilPrice: number;
  demand: number;
  seasonality: number;
}

class MLPredictionService {
  private model: any = null;
  private isModelLoaded = false;

  // Simulate model loading
  async loadModel(): Promise<void> {
    if (this.isModelLoaded) return;

    // In production, you would do:
    // import * as tf from '@tensorflow/tfjs';
    // this.model = await tf.loadLayersModel('/models/rate-prediction/model.json');
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.isModelLoaded = true;
    console.log('ML Model loaded (simulated)');
  }

  // Generate synthetic historical data
  private generateHistoricalData(months: number = 12): HistoricalData[] {
    const data: HistoricalData[] = [];
    const baseRate = 2750;
    const now = new Date();

    for (let i = months; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);

      // Simulate seasonal pattern
      const seasonality = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.1 + 1;
      
      // Simulate trend
      const trend = 1 + (months - i) * 0.01;
      
      // Add some randomness
      const noise = (Math.random() - 0.5) * 0.1;

      data.push({
        date,
        rate: baseRate * seasonality * trend * (1 + noise),
        oilPrice: 80 + Math.random() * 20,
        demand: 100 + Math.random() * 30,
        seasonality: seasonality
      });
    }

    return data;
  }

  // Simple linear regression for demonstration
  private simpleLinearRegression(data: number[]): { slope: number; intercept: number } {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  // Predict future rate
  async predictRate(
    route: string,
    daysAhead: number = 30
  ): Promise<PredictionResult> {
    await this.loadModel();

    // Generate historical data
    const historicalData = this.generateHistoricalData(12);
    const rates = historicalData.map(d => d.rate);

    // Simple prediction using linear regression
    const { slope, intercept } = this.simpleLinearRegression(rates);
    const predictedRate = slope * (rates.length + daysAhead / 30) + intercept;

    // Calculate confidence based on data variance
    const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
    const variance = rates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / rates.length;
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(50, Math.min(95, 100 - (stdDev / mean) * 100));

    // Determine trend
    const currentRate = rates[rates.length - 1];
    const rateChange = ((predictedRate - currentRate) / currentRate) * 100;
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (rateChange > 2) trend = 'up';
    else if (rateChange < -2) trend = 'down';

    // Factor analysis
    const factors = [
      { name: 'Historical Trend', impact: Math.abs(slope) / predictedRate * 100 },
      { name: 'Seasonality', impact: 15 + Math.random() * 10 },
      { name: 'Market Demand', impact: 20 + Math.random() * 15 },
      { name: 'Oil Price', impact: 10 + Math.random() * 10 },
      { name: 'Competition', impact: 8 + Math.random() * 7 }
    ];

    return {
      predictedRate: Math.round(predictedRate),
      confidence: Math.round(confidence),
      trend,
      factors: factors.sort((a, b) => b.impact - a.impact)
    };
  }

  // Predict booking probability
  async predictBookingProbability(
    customerId: string,
    daysUntilExpected: number
  ): Promise<{ probability: number; confidence: number; riskLevel: 'low' | 'medium' | 'high' }> {
    await this.loadModel();

    // Simulate prediction
    const baseProbability = 0.85;
    const daysFactor = Math.max(0, 1 - daysUntilExpected / 30);
    const randomFactor = (Math.random() - 0.5) * 0.2;

    const probability = Math.max(0, Math.min(1, baseProbability * daysFactor + randomFactor));
    const confidence = 75 + Math.random() * 20;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (probability < 0.5) riskLevel = 'high';
    else if (probability < 0.7) riskLevel = 'medium';

    return {
      probability: Math.round(probability * 100) / 100,
      confidence: Math.round(confidence),
      riskLevel
    };
  }

  // Anomaly detection
  async detectAnomalies(
    data: number[]
  ): Promise<{ isAnomaly: boolean; score: number; threshold: number }> {
    await this.loadModel();

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );

    const lastValue = data[data.length - 1];
    const zScore = Math.abs((lastValue - mean) / stdDev);
    const threshold = 2.5; // 2.5 standard deviations

    return {
      isAnomaly: zScore > threshold,
      score: zScore,
      threshold
    };
  }

  // Get model info
  getModelInfo(): { loaded: boolean; version: string; accuracy: number } {
    return {
      loaded: this.isModelLoaded,
      version: '1.0.0-beta',
      accuracy: 0.87 // 87% accuracy (simulated)
    };
  }
}

// Export singleton instance
export const mlPredictionService = new MLPredictionService();

// Helper function to format prediction for display
export const formatPrediction = (prediction: PredictionResult, lang: 'ko' | 'en') => {
  const t = {
    predicted: { ko: '예측 운임', en: 'Predicted Rate' },
    confidence: { ko: '신뢰도', en: 'Confidence' },
    trend: { ko: '추세', en: 'Trend' },
    up: { ko: '상승', en: 'Up' },
    down: { ko: '하락', en: 'Down' },
    stable: { ko: '안정', en: 'Stable' },
    factors: { ko: '주요 요인', en: 'Key Factors' }
  };

  return {
    title: `${t.predicted[lang]}: $${prediction.predictedRate.toLocaleString()}`,
    confidence: `${t.confidence[lang]}: ${prediction.confidence}%`,
    trend: `${t.trend[lang]}: ${t[prediction.trend][lang]}`,
    factors: prediction.factors.map(f => `${f.name}: ${f.impact.toFixed(1)}%`)
  };
};
