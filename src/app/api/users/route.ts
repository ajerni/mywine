import { registerUser, loginUser, logoutUser, getCurrentUser } from './userHandlers';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    console.log('POST request received:', request.url);
    try {
        const url = new URL(request.url);
        const path = url.pathname.split('/').pop();
        const body = await request.json();

        console.log('Path:', path);

        let result;
        switch (path) {
            case 'login':
                console.log('Calling loginUser');
                result = await loginUser(body.username, body.password);
                break;
            case 'register':
                console.log('Calling registerUser');
                result = await registerUser(body.username, body.email, body.password);
                break;
            case 'logout':
                console.log('Calling logoutUser');
                result = await logoutUser();
                break;
            default:
                console.log('No specific path matched');
                return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 });
        }

        return NextResponse.json(result, { status: result.status });
    } catch (error) {
        console.error('Unhandled error in POST:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    console.log('GET request received');
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }
        const result = await getCurrentUser(token);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Unhandled error in GET:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
