export type AssetType = 'stock' | 'mutual_fund' | 'bond' | 'etf' | 'crypto' | 'index';
export type MarketRegion = 'INDIA' | 'GLOBAL' | 'USA' | 'EUROPE' | 'ASIA';
export type NewsSourceCategory = 'INDIAN_MEDIA' | 'GLOBAL_MEDIA' | 'OFFICIAL_REGULATOR';

// User & Authentication Interfaces
export type UserRole = 'INVESTOR' | 'ANALYST' | 'INSTITUTIONAL' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  preferredRegion: MarketRegion | 'ALL';
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  expiresAt: string;
  user: UserProfile;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  preferredRegion?: MarketRegion | 'ALL';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  session?: AuthSession;
  resetToken?: string;
}

// Data Model Documentation Schema Metadata
export interface EntityField {
  name: string;
  type: string;
  keyType?: 'PK' | 'FK' | 'INDEX';
  required: boolean;
  description: string;
}

export interface EntityModel {
  name: string;
  tableName: string;
  category: 'AUTH' | 'MARKET_DATA' | 'USER_PORTFOLIO' | 'AI_INTELLIGENCE';
  description: string;
  fields: EntityField[];
  relationships: {
    targetEntity: string;
    type: '1:1' | '1:N' | 'N:M';
    description: string;
  }[];
  accessPatterns: string[];
}

export interface PricePoint {
  time: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export interface AssetQuote {
  symbol: string;
  name: string;
  type: AssetType;
  region: MarketRegion;
  exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE' | 'LSE' | 'TYO' | 'CRYPTO' | 'BOND';
  price: number;
  change: number;
  changePercent: number;
  high52w: number;
  low52w: number;
  volume: string;
  marketCap?: string;
  peRatio?: number;
  pbRatio?: number;
  dividendYield?: number;
  eps?: number;
  sector?: string;
  country?: string;
  currency: string;
  nav?: number; // Mutual funds / ETFs
  expenseRatio?: number;
  ytm?: number; // Bonds
  coupon?: number; // Bonds
  maturityDate?: string; // Bonds
  creditRating?: string; // Bonds
  sparkline: number[];
  chartData: PricePoint[];
}

export interface FundamentalAnalysis {
  healthScore: number; // 0 - 100
  revenueGrowthYoY: number;
  profitMargin: number;
  roe: number;
  debtToEquity: number;
  quickRatio: number;
  cashPosition: string;
  valuationVerdict: 'UNDERVALUED' | 'FAIRLY VALUED' | 'OVERVALUED';
  valuationNote: string;
  competitiveMoat: 'WIDE' | 'NARROW' | 'NONE';
}

export interface TechnicalAnalysis {
  trend: 'STRONG UPTREND' | 'UPTREND' | 'NEUTRAL' | 'DOWNTREND' | 'STRONG DOWNTREND';
  ma50: number;
  ma200: number;
  rsi14: number; // e.g. 62
  rsiStatus: 'OVERBOUGHT' | 'NEUTRAL' | 'OVERSOLD';
  macdSignal: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  stochastic: number;
  adx: number;
  supportLevels: number[];
  resistanceLevels: number[];
  verdict: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  entryPoint: string;
  stopLoss: number;
  targetPrice: number;
}

export interface SentimentAnalysis {
  overallScore: number; // -100 to +100
  sentimentTag: 'STRONG BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG BEARISH';
  newsPositivePercent: number;
  newsNeutralPercent: number;
  newsNegativePercent: number;
  socialMediaPositivePercent: number;
  insiderActivity: string;
  analystConsensusPercentBuy: number;
  confidenceScore: number;
  trendingTopics: string[];
}

export interface EarningsForecast {
  nextEarningsDate: string;
  consensusRevenue: string;
  consensusEPS: number;
  aiPredictedRevenue: string;
  aiPredictedEPS: number;
  beatProbability: number; // 0 - 100%
  expectedPostEarningsVolatility: string;
  targetIfBeat: number;
  targetIfMiss: number;
}

export interface RiskAssessment {
  bullCaseProbability: number;
  baseCaseProbability: number;
  bearCaseProbability: number;
  riskVerdict: 'LOW' | 'MANAGEABLE' | 'ELEVATED' | 'HIGH';
  keyRisks: {
    level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    probability: string;
    impact: string;
  }[];
}

export interface AIStockAnalysisReport {
  symbol: string;
  name: string;
  currentPrice: number;
  recommendation: 'STRONG BUY' | 'BUY' | 'HOLD' | 'REDUCE' | 'SELL';
  targetPrice12m: number;
  upsidePotentialPercent: number;
  downsideRiskPercent: number;
  riskRewardRatio: number;
  aiConfidenceScore: number; // 0 - 100
  holdingPeriod: string;
  positionSizeRecommendation: string;
  actionSummary: string;
  fundamentals: FundamentalAnalysis;
  technicals: TechnicalAnalysis;
  sentiment: SentimentAnalysis;
  earnings: EarningsForecast;
  risk: RiskAssessment;
  lastUpdated: string;
}

export interface MarketNewsItem {
  id: string;
  timestamp: string;
  source: string; // e.g. 'Moneycontrol', 'Economic Times', 'LiveMint', 'Bloomberg', 'Reuters', 'Financial Express'
  sourceCategory: NewsSourceCategory;
  region: MarketRegion;
  headline: string;
  summary: string;
  url?: string;
  relevanceScore: number; // 0 - 10
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  importance: 'CRITICAL' | 'IMPORTANT' | 'NEUTRAL' | 'NEGATIVE';
  affectedStocks: string[];
  affectedSectors: string[];
  credibilityScore: number; // 0 - 100
  aiImpactAnalysis: string;
  recommendedAction: string;
}

export interface ScreenerFilter {
  sector: string;
  region?: MarketRegion | 'ALL';
  minMarketCap?: number;
  maxPe?: number;
  minDivYield?: number;
  minRoe?: number;
  maxDebtEquity?: number;
  minAiScore?: number;
  presetStrategy?: 'VALUE_MOMENTUM' | 'QUALITY_GROWTH' | 'DIVIDEND_ARISTOCRATS' | 'CUSTOM';
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  type: AssetType;
  region: MarketRegion;
  shares: number;
  avgCost: number;
  currentPrice: number;
  allocationPercent: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
}

export interface PortfolioSummary {
  id: string;
  userId: string;
  name: string;
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  cashBalance: number;
  holdings: PortfolioHolding[];
  var951d: number; // e.g. -2.3%
  sharpeRatio: number;
  beta: number;
  diversificationScore: number; // 0 - 100
  sectorExposures: { sector: string; percent: number }[];
}

export interface AlertTrigger {
  id: string;
  userId?: string;
  symbol: string;
  title: string;
  type: 'PRICE_BREAKOUT' | 'VOLUME_SPIKE' | 'NEWS_TRIGGER' | 'FED_DECISION' | 'EARNINGS_SURPRISE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  timestamp: string;
  message: string;
  currentPrice: number;
  recommendation: string;
  isRead: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  groundingSources?: { title: string; url: string }[];
  suggestedActions?: string[];
}

