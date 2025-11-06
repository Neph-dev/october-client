import { API_URL } from '@/config/env';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; }>; }
) {
    try {
        const { id: articleId } = await params;

        if (!articleId) {
            return NextResponse.json(
                { error: 'Article ID is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_URL}/ai/summarise/${articleId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Backend API responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Return the data with proper CORS headers
        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (error) {
        console.error('Error fetching AI summary from backend:', error);

        // Return error response
        return NextResponse.json(
            { error: 'Failed to fetch article summary' },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            }
        );
    }
}

export async function OPTIONS(request: NextRequest) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}