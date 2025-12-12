// RAG (Retrieval-Augmented Generation) Service for Advanced AI Chatbot
import { sendMessageToAI } from './geminiService';

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: 'booking' | 'manual' | 'policy' | 'faq' | 'history';
    timestamp: Date;
    relevanceScore?: number;
  };
}

export interface UserProfile {
  id: string;
  preferences: {
    language: 'ko' | 'en';
    preferredRoutes: string[];
    bookingHistory: BookingRecord[];
    interactionHistory: ChatInteraction[];
  };
  context: {
    currentPage: string;
    recentActions: string[];
    searchHistory: string[];
  };
}

export interface BookingRecord {
  id: string;
  bookingNumber: string;
  route: string;
  containerType: string;
  quantity: number;
  rate: number;
  bookingDate: Date;
  status: string;
  aiRecommended: boolean;
  savings?: number;
}

export interface ChatInteraction {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
  satisfaction?: number;
  followUpQuestions: string[];
}

class RAGService {
  private documentStore: DocumentChunk[] = [];
  private userProfiles: Map<string, UserProfile> = new Map();
  private vectorStore: Map<string, number[]> = new Map(); // Simple vector storage

  constructor() {
    this.initializeDocumentStore();
    this.initializeUserProfiles();
  }

  // Initialize document store with KMTC knowledge base
  private initializeDocumentStore(): void {
    const documents: DocumentChunk[] = [
      // Booking Guidelines
      {
        id: 'booking_001',
        content: '부킹 최적 시점: 운임이 임계값 이하로 떨어지고, 선복 여유가 충분할 때 부킹하는 것이 가장 효율적입니다. 일반적으로 출항 2-3주 전이 최적 시점입니다.',
        metadata: {
          source: 'KMTC Booking Manual',
          type: 'manual',
          timestamp: new Date('2024-01-01')
        }
      },
      {
        id: 'booking_002',
        content: 'Optimal booking timing: Book when rates fall below threshold and capacity is sufficient. Generally 2-3 weeks before departure is optimal.',
        metadata: {
          source: 'KMTC Booking Manual',
          type: 'manual',
          timestamp: new Date('2024-01-01')
        }
      },
      // Risk Management
      {
        id: 'risk_001',
        content: '리스크 관리: 홍해 위기, 유가 변동, 환율 변화 등 외부 요인을 종합적으로 고려해야 합니다. 리스크 점수가 7점 이상일 때는 부킹을 연기하는 것을 권장합니다.',
        metadata: {
          source: 'Risk Management Guide',
          type: 'policy',
          timestamp: new Date('2024-01-15')
        }
      },
      // Competitor Analysis
      {
        id: 'competitor_001',
        content: '경쟁사 분석: Maersk, MSC, CMA CGM 대비 KMTC의 강점은 아시아 항로 전문성과 경쟁력 있는 운임입니다. 정시도착률은 92%로 업계 평균을 상회합니다.',
        metadata: {
          source: 'Market Intelligence Report',
          type: 'manual',
          timestamp: new Date('2024-02-01')
        }
      },
      // FAQ
      {
        id: 'faq_001',
        content: 'Q: AI 추천을 따르면 얼마나 절약할 수 있나요? A: 평균적으로 수동 부킹 대비 15-20% 비용 절감 효과가 있습니다.',
        metadata: {
          source: 'FAQ Database',
          type: 'faq',
          timestamp: new Date('2024-03-01')
        }
      },
      {
        id: 'faq_002',
        content: 'Q: How much can I save by following AI recommendations? A: On average, 15-20% cost savings compared to manual booking.',
        metadata: {
          source: 'FAQ Database',
          type: 'faq',
          timestamp: new Date('2024-03-01')
        }
      }
    ];

    this.documentStore = documents;
    this.buildVectorIndex();
  }

  // Initialize user profiles with mock data
  private initializeUserProfiles(): void {
    const mockProfile: UserProfile = {
      id: 'user_001',
      preferences: {
        language: 'ko',
        preferredRoutes: ['kr-la', 'kr-eu'],
        bookingHistory: [
          {
            id: 'BK001',
            bookingNumber: 'KMTC20241201001',
            route: 'kr-la',
            containerType: '40HC',
            quantity: 25,
            rate: 2750,
            bookingDate: new Date('2024-12-01'),
            status: 'confirmed',
            aiRecommended: true,
            savings: 150
          }
        ],
        interactionHistory: []
      },
      context: {
        currentPage: 'dashboard',
        recentActions: ['viewed_booking_history', 'checked_rates'],
        searchHistory: ['LA route rates', 'booking optimization']
      }
    };

    this.userProfiles.set('user_001', mockProfile);
  }

  // Simple vector similarity calculation (in production, use proper embeddings)
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  // Build simple vector index
  private buildVectorIndex(): void {
    this.documentStore.forEach(doc => {
      // Simple word frequency vector (in production, use proper embeddings)
      const words = doc.content.toLowerCase().split(/\s+/);
      const wordCount: Record<string, number> = {};
      
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });

      // Convert to simple vector (top 10 most frequent words)
      const vector = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([,count]) => count);

      this.vectorStore.set(doc.id, vector);
    });
  }

  // Retrieve relevant documents based on query
  public retrieveRelevantDocuments(query: string, limit: number = 3): DocumentChunk[] {
    const relevantDocs = this.documentStore
      .map(doc => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          relevanceScore: this.calculateSimilarity(query, doc.content)
        }
      }))
      .filter(doc => doc.metadata.relevanceScore! > 0.1)
      .sort((a, b) => (b.metadata.relevanceScore! - a.metadata.relevanceScore!))
      .slice(0, limit);

    return relevantDocs;
  }

  // Get user context for personalization
  public getUserContext(userId: string = 'user_001'): UserProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  // Update user profile based on interaction
  public updateUserProfile(userId: string, interaction: ChatInteraction): void {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      profile.preferences.interactionHistory.push(interaction);
      
      // Update search history
      profile.context.searchHistory.unshift(interaction.query);
      profile.context.searchHistory = profile.context.searchHistory.slice(0, 10);
      
      this.userProfiles.set(userId, profile);
    }
  }

  // Generate personalized recommendations
  public generatePersonalizedRecommendations(userId: string): string[] {
    const profile = this.getUserContext(userId);
    if (!profile) return [];

    const recommendations: string[] = [];
    
    // Based on booking history
    if (profile.preferences.bookingHistory.length > 0) {
      const lastBooking = profile.preferences.bookingHistory[0];
      recommendations.push(
        profile.preferences.language === 'ko' 
          ? `${lastBooking.route} 항로의 최신 운임 동향을 확인해보세요`
          : `Check latest rate trends for ${lastBooking.route} route`
      );
    }

    // Based on preferred routes
    profile.preferences.preferredRoutes.forEach(route => {
      recommendations.push(
        profile.preferences.language === 'ko'
          ? `${route} 항로 최적 부킹 시점 분석`
          : `Optimal booking timing analysis for ${route} route`
      );
    });

    // Based on recent actions
    if (profile.context.recentActions.includes('viewed_booking_history')) {
      recommendations.push(
        profile.preferences.language === 'ko'
          ? '부킹 패턴 분석 및 개선 방안'
          : 'Booking pattern analysis and improvement suggestions'
      );
    }

    return recommendations.slice(0, 3);
  }

  // Enhanced AI response with RAG
  public async generateRAGResponse(
    query: string, 
    context: string, 
    userId: string = 'user_001'
  ): Promise<{
    response: string;
    sources: string[];
    recommendations: string[];
    confidence: number;
  }> {
    try {
      // 1. Retrieve relevant documents
      const relevantDocs = this.retrieveRelevantDocuments(query);
      
      // 2. Get user context
      const userProfile = this.getUserContext(userId);
      
      // 3. Build enhanced prompt with context
      const contextualPrompt = this.buildContextualPrompt(
        query, 
        context, 
        relevantDocs, 
        userProfile
      );
      
      // 4. Get AI response
      const aiResponse = await sendMessageToAI(contextualPrompt, context);
      
      // 5. Generate personalized recommendations
      const recommendations = this.generatePersonalizedRecommendations(userId);
      
      // 6. Calculate confidence score
      const confidence = this.calculateConfidence(query, relevantDocs);
      
      // 7. Update user profile
      const interaction: ChatInteraction = {
        id: Date.now().toString(),
        query,
        response: aiResponse,
        timestamp: new Date(),
        followUpQuestions: recommendations
      };
      this.updateUserProfile(userId, interaction);
      
      return {
        response: aiResponse,
        sources: relevantDocs.map(doc => doc.metadata.source),
        recommendations,
        confidence
      };
      
    } catch (error) {
      console.error('RAG Service Error:', error);
      throw error;
    }
  }

  // Build contextual prompt with retrieved documents and user context
  private buildContextualPrompt(
    query: string,
    context: string,
    relevantDocs: DocumentChunk[],
    userProfile: UserProfile | null
  ): string {
    let prompt = `You are KMTC AI Assistant, an expert in shipping and logistics optimization.\n\n`;
    
    // Add user context
    if (userProfile) {
      prompt += `User Context:\n`;
      prompt += `- Language: ${userProfile.preferences.language}\n`;
      prompt += `- Current Page: ${context}\n`;
      prompt += `- Preferred Routes: ${userProfile.preferences.preferredRoutes.join(', ')}\n`;
      
      if (userProfile.preferences.bookingHistory.length > 0) {
        const lastBooking = userProfile.preferences.bookingHistory[0];
        prompt += `- Recent Booking: ${lastBooking.bookingNumber} (${lastBooking.route}, ${lastBooking.quantity} TEU)\n`;
      }
      prompt += `\n`;
    }
    
    // Add relevant documents
    if (relevantDocs.length > 0) {
      prompt += `Relevant Knowledge Base:\n`;
      relevantDocs.forEach((doc, index) => {
        prompt += `${index + 1}. ${doc.content}\n`;
        prompt += `   Source: ${doc.metadata.source}\n\n`;
      });
    }
    
    // Add the actual query
    prompt += `User Question: ${query}\n\n`;
    
    // Add instructions
    prompt += `Instructions:\n`;
    prompt += `- Provide accurate, helpful responses based on the knowledge base\n`;
    prompt += `- If information is not in the knowledge base, clearly state this\n`;
    prompt += `- Use the user's preferred language (${userProfile?.preferences.language || 'en'})\n`;
    prompt += `- Provide actionable insights when possible\n`;
    prompt += `- Reference sources when using specific information\n`;
    
    return prompt;
  }

  // Calculate confidence score based on document relevance
  private calculateConfidence(query: string, relevantDocs: DocumentChunk[]): number {
    if (relevantDocs.length === 0) return 0.3;
    
    const avgRelevance = relevantDocs.reduce((sum, doc) => 
      sum + (doc.metadata.relevanceScore || 0), 0
    ) / relevantDocs.length;
    
    return Math.min(0.95, 0.5 + avgRelevance);
  }

  // Add new document to knowledge base
  public addDocument(content: string, metadata: Omit<DocumentChunk['metadata'], 'timestamp'>): void {
    const newDoc: DocumentChunk = {
      id: `doc_${Date.now()}`,
      content,
      metadata: {
        ...metadata,
        timestamp: new Date()
      }
    };
    
    this.documentStore.push(newDoc);
    this.buildVectorIndex(); // Rebuild index
  }

  // Get user booking history for context
  public getUserBookingHistory(userId: string): BookingRecord[] {
    const profile = this.getUserContext(userId);
    return profile?.preferences.bookingHistory || [];
  }

  // Analyze user patterns for better recommendations
  public analyzeUserPatterns(userId: string): {
    preferredRoutes: string[];
    averageBookingSize: number;
    bookingFrequency: string;
    costSavings: number;
  } {
    const profile = this.getUserContext(userId);
    if (!profile || profile.preferences.bookingHistory.length === 0) {
      return {
        preferredRoutes: [],
        averageBookingSize: 0,
        bookingFrequency: 'unknown',
        costSavings: 0
      };
    }

    const bookings = profile.preferences.bookingHistory;
    
    // Calculate preferred routes
    const routeCounts: Record<string, number> = {};
    bookings.forEach(booking => {
      routeCounts[booking.route] = (routeCounts[booking.route] || 0) + 1;
    });
    
    const preferredRoutes = Object.entries(routeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([route]) => route);
    
    // Calculate average booking size
    const averageBookingSize = bookings.reduce((sum, booking) => 
      sum + booking.quantity, 0
    ) / bookings.length;
    
    // Calculate total cost savings
    const costSavings = bookings.reduce((sum, booking) => 
      sum + (booking.savings || 0), 0
    );
    
    return {
      preferredRoutes,
      averageBookingSize: Math.round(averageBookingSize),
      bookingFrequency: 'monthly', // Simplified
      costSavings
    };
  }
}

// Export singleton instance
export const ragService = new RAGService();