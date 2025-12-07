import React from 'react';

export type Language = 'ko' | 'en';
export type Theme = 'light' | 'dark' | 'system';

export interface KPI {
  title: string;
  value: string;
  subValue?: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  trendLabel: string;
  icon: React.ComponentType<any>;
  color: string;
}

// Ontology Entity Types based on PDF
export type EntityType = 
  | 'SHIPPER' 
  | 'BOOKING' 
  | 'ROUTE' 
  | 'VESSEL' 
  | 'CONTRACT' 
  | 'MARKET_INDEX' 
  | 'SALES_ACTIVITY'
  | 'COMPETITOR';

export interface GraphNode {
  id: string;
  group: number;
  label: string;
  type: EntityType;
  val: number;
  properties?: Record<string, any>; // Flexible storage for properties like 'industry', 'status'
}

export interface GraphLink {
  source: string;
  target: string;
  relationship: string; // e.g., MAKES_BOOKING, ON_ROUTE
}

export interface MarketInsight {
  title: string;
  content: string;
  sources: { uri: string; title: string }[];
}

export enum Segment {
  ELECTRONICS = 'Electronics', // Samsung, LG
  AUTO_PARTS = 'Auto Parts',   // Hyundai Mobis
  CHEMICALS = 'Chemicals',     // LG Chem
  RETAIL = 'Retail',
  OTHERS = 'Others',
}

export interface FunnelStep {
  stage: string;
  count: number;
  conversionRate: number; // Percentage
}

// Inventory Types
export interface PortInventory {
  port: string;
  d20: number;
  d40: number;
  hc40: number;
  rf: number;
}

// AI Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

// Scenario Types
export interface ScenarioStep {
  stepNumber: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  content?: React.ReactNode; // Custom content for the step visualization
  actionItems?: string[];
}

export interface ScenarioDef {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: React.ComponentType<any>;
  steps: ScenarioStep[];
}