/**
 * TradingView Real-time Data Service
 * Uses TradingView's WebSocket API for live quotes
 */

interface TradingViewMessage {
    method: string;
    params: any[];
}

interface TradingViewQuoteData {
    symbol: string;
    price: number;
    change: number;
    change_percent: number;
    volume: number;
    bid: number;
    ask: number;
    last_update: number;
}

class TradingViewRealTimeService {
    private ws: WebSocket | null = null;
    private subscribers: Map<string, (data: TradingViewQuoteData) => void> = new Map();
    private sessionId: string = '';
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    constructor() {
        if (typeof window !== 'undefined') {
            this.connect();
        }
    }

    private connect() {
        try {
            this.ws = new WebSocket('wss://data.tradingview.com/socket.io/websocket');

            this.ws.onopen = () => {
                console.log('TradingView WebSocket connected');
                this.reconnectAttempts = 0;
                this.authenticate();
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.ws.onclose = () => {
                console.log('TradingView WebSocket disconnected');
                this.reconnect();
            };

            this.ws.onerror = (error) => {
                console.error('TradingView WebSocket error:', error);
            };

        } catch (error) {
            console.error('Failed to connect to TradingView WebSocket:', error);
        }
    }

    private reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Reconnecting to TradingView... Attempt ${this.reconnectAttempts}`);
                this.connect();
            }, 5000 * this.reconnectAttempts);
        }
    }

    private authenticate() {
        const authMessage: TradingViewMessage = {
            method: 'set_auth_token',
            params: ['unauthorized_user_token']
        };

        this.sendMessage(authMessage);

        // Create session
        const sessionMessage: TradingViewMessage = {
            method: 'chart_create_session',
            params: ['cs_1', '']
        };

        this.sendMessage(sessionMessage);
        this.sessionId = 'cs_1';
    }

    private sendMessage(message: TradingViewMessage) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    private handleMessage(data: string) {
        try {
            const messages = data.split('\n').filter(msg => msg.trim());

            for (const messageStr of messages) {
                if (messageStr.startsWith('~')) {
                    continue; // Heartbeat message
                }

                const message = JSON.parse(messageStr);

                if (message.method === 'symbol_resolved') {
                    this.handleSymbolResolved(message.params);
                } else if (message.method === 'symbol_data') {
                    this.handleSymbolData(message.params);
                }
            }
        } catch (error) {
            console.error('Error parsing TradingView message:', error);
        }
    }

    private handleSymbolResolved(params: any[]) {
        console.log('Symbol resolved:', params);
    }

    private handleSymbolData(params: any[]) {
        try {
            const [sessionId, symbolInfo, , data] = params;

            if (data && data.lp !== undefined) { // lp = last price
                const quoteData: TradingViewQuoteData = {
                    symbol: symbolInfo.symbol,
                    price: data.lp,
                    change: data.ch || 0,
                    change_percent: data.chp || 0,
                    volume: data.volume || 0,
                    bid: data.bid || 0,
                    ask: data.ask || 0,
                    last_update: Date.now(),
                };

                // Notify subscribers
                const callback = this.subscribers.get(symbolInfo.symbol);
                if (callback) {
                    callback(quoteData);
                }
            }
        } catch (error) {
            console.error('Error handling symbol data:', error);
        }
    }

    public subscribeToSymbol(symbol: string, callback: (data: TradingViewQuoteData) => void) {
        this.subscribers.set(symbol, callback);

        if (this.ws && this.ws.readyState === WebSocket.OPEN && this.sessionId) {
            const subscribeMessage: TradingViewMessage = {
                method: 'resolve_symbol',
                params: [this.sessionId, `symbol_${symbol}`, `=${symbol}`]
            };

            this.sendMessage(subscribeMessage);

            // Create series for the symbol
            const seriesMessage: TradingViewMessage = {
                method: 'create_series',
                params: [this.sessionId, `series_${symbol}`, `symbol_${symbol}`, '1', 300]
            };

            this.sendMessage(seriesMessage);
        }
    }

    public unsubscribeFromSymbol(symbol: string) {
        this.subscribers.delete(symbol);

        if (this.ws && this.ws.readyState === WebSocket.OPEN && this.sessionId) {
            const unsubscribeMessage: TradingViewMessage = {
                method: 'remove_series',
                params: [this.sessionId, `series_${symbol}`]
            };

            this.sendMessage(unsubscribeMessage);
        }
    }

    public disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.subscribers.clear();
    }
}

// Singleton instance
let tradingViewService: TradingViewRealTimeService | null = null;

export const getTradingViewService = () => {
    if (!tradingViewService && typeof window !== 'undefined') {
        tradingViewService = new TradingViewRealTimeService();
    }
    return tradingViewService;
};

export type { TradingViewQuoteData };