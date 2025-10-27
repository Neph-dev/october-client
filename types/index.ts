export * from "./Industry";
export * from "./KeyPerson";

export interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: WebSource[];
    web_sources?: WebSource[];
    companies_referenced?: string[];
    confidence?: number;
    processing_time?: number;
}

export interface WebSource {
    title: string;
    url: string;
    snippet: string;
    source: string;
    published_at: string;
    relevance: number;
}

export interface AIQueryResponse {
    answer: string;
    sources: any[];
    web_sources: WebSource[];
    used_web_search: boolean;
    confidence: number;
    processing_time: number;
    companies_referenced: string[];
}

export interface Ticker {
    company_name: string;
    ticker: string;
    stock_exchange: string;
    industry: string;
    country: string;
}

export interface TickersResponse {
    tickers: Ticker[];
    count: number;
    last_updated: string;
}