import { API_URL } from '@/config/env';
import { NextRequest, NextResponse } from 'next/server';

interface MarketStatus {
    exchange: string;
    status: 'open' | 'closed' | 'pre_market' | 'after_hours';
    next_open?: string;
    next_close?: string;
    timezone: string;
    current_time: string;
}

interface BackendMarketStatus {
    exchange: string;
    timezone: string;
    is_open: boolean;
    session: string;
    session_end: string;
    updated_at: string;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ exchange: string; }>; }
) {
    try {
        const { exchange: exchangeParam } = await params;
        const exchange = exchangeParam.toUpperCase();
        let marketStatus: MarketStatus;

        // Try to fetch from backend first
        try {
            const backendResponse = await fetch(`${API_URL}/market/status/${exchange}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                // Add timeout to prevent hanging
                signal: AbortSignal.timeout(5000), // 5 second timeout
            });

            if (!backendResponse.ok) {
                throw new Error(`Backend API returned ${backendResponse.status}: ${backendResponse.statusText}`);
            }

            const backendData: BackendMarketStatus = await backendResponse.json();

            // Map backend response to our format
            const mapSessionToStatus = (session: string, isOpen: boolean): MarketStatus['status'] => {
                if (isOpen) return 'open';

                switch (session.toLowerCase()) {
                    case 'pre-market':
                    case 'premarket':
                        return 'pre_market';
                    case 'after-hours':
                    case 'afterhours':
                    case 'after_hours':
                        return 'after_hours';
                    case 'closed':
                    default:
                        return 'closed';
                }
            };

            // Calculate next market times based on session_end
            const sessionEnd = new Date(backendData.session_end);
            const nextOpen = backendData.is_open ? null : sessionEnd.toISOString();
            const nextClose = backendData.is_open ? sessionEnd.toISOString() : null;

            marketStatus = {
                exchange: backendData.exchange,
                status: mapSessionToStatus(backendData.session, backendData.is_open),
                next_open: nextOpen || undefined,
                next_close: nextClose || undefined,
                timezone: backendData.timezone,
                current_time: backendData.updated_at
            };
        } catch (backendError) {
            console.warn('Backend API failed, falling back to local calculation:', backendError);

            // Fallback to local calculation
            marketStatus = calculateLocalMarketStatus(exchange);
        }

        return NextResponse.json(marketStatus);

    } catch (error) {
        console.error('Error fetching market status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch market status' },
            { status: 500 }
        );
    }
}

// Local fallback calculation function
function calculateLocalMarketStatus(exchange: string): MarketStatus {
    // Get current time in ET (NYSE timezone)
    const now = new Date();
    const etTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const currentHour = etTime.getHours();
    const currentMinute = etTime.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // minutes since midnight
    const dayOfWeek = etTime.getDay(); // 0 = Sunday, 6 = Saturday

    // Market hours in ET (9:30 AM - 4:00 PM)
    const marketOpen = 9 * 60 + 30; // 9:30 AM in minutes
    const marketClose = 16 * 60; // 4:00 PM in minutes
    const preMarketStart = 4 * 60; // 4:00 AM in minutes
    const afterHoursEnd = 20 * 60; // 8:00 PM in minutes

    let status: MarketStatus['status'] = 'closed';

    // Check if it's a weekday (Monday = 1, Friday = 5)
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    if (exchange === 'US' || exchange === 'NYSE' || exchange === 'NASDAQ') {
        if (isWeekday) {
            if (currentTime >= marketOpen && currentTime < marketClose) {
                status = 'open';
            } else if (currentTime >= preMarketStart && currentTime < marketOpen) {
                status = 'pre_market';
            } else if (currentTime >= marketClose && currentTime < afterHoursEnd) {
                status = 'after_hours';
            } else {
                status = 'closed';
            }
        } else {
            status = 'closed';
        }
    }

    // Calculate next open/close times for local fallback
    const getNextMarketTime = () => {
        const tomorrow = new Date(etTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 30, 0, 0); // Next market open at 9:30 AM

        const todayClose = new Date(etTime);
        todayClose.setHours(16, 0, 0, 0); // Today's market close at 4:00 PM

        let nextOpen: Date;
        let nextClose: Date;

        if (status === 'open') {
            nextClose = todayClose;
            nextOpen = tomorrow;
            // If tomorrow is weekend, find next Monday
            while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
                nextOpen.setDate(nextOpen.getDate() + 1);
            }
        } else {
            // Find next weekday for market open
            nextOpen = new Date(etTime);
            nextOpen.setHours(9, 30, 0, 0);

            if (currentTime >= marketClose || !isWeekday) {
                nextOpen.setDate(nextOpen.getDate() + 1);
            }

            while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
                nextOpen.setDate(nextOpen.getDate() + 1);
            }

            nextClose = new Date(nextOpen);
            nextClose.setHours(16, 0, 0, 0);
        }

        return {
            next_open: nextOpen.toISOString(),
            next_close: nextClose.toISOString()
        };
    };

    const { next_open, next_close } = getNextMarketTime();

    return {
        exchange: exchange,
        status: status,
        next_open: next_open,
        next_close: next_close,
        timezone: 'America/New_York',
        current_time: etTime.toISOString()
    };
}