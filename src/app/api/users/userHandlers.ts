import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('JWT_SECRET is not set');
    throw new Error('JWT_SECRET is not set');
}

// Handler for user registration
export const registerUser = async (username: string, email: string, password: string) => {
    try {
        if (!username || !password || !email) {
            return { error: 'Missing required fields', status: 400 };
        }

        const client = await pool.connect();
        const existingUser = await client.query('SELECT * FROM wine_users WHERE username = $1 OR email = $2', [username, email]);
        
        if (existingUser.rows.length > 0) {
            client.release();
            return { error: 'Username or email already exists', status: 400 };
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await client.query(
            'INSERT INTO wine_users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );
        client.release();

        return { message: 'User registered successfully', user: result.rows[0], status: 201 };
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Registration failed', status: 500 };
    }
};

// Handler for user login
export const loginUser = async (username: string, password: string) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM wine_users WHERE username = $1', [username]);
        client.release();

        if (result.rows.length === 0) {
            return { error: 'User not found', status: 404 };
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return { error: 'Invalid password', status: 401 };
        }

        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password_hash;

        return { token, user: userWithoutPassword, status: 200 };
    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Login failed', status: 500 };
    }
};

// Handler for user logout
export const logoutUser = async () => {
    // For JWT, we don't need to do anything server-side
    // The client should remove the token from storage
    return { message: 'User logged out successfully', status: 200 };
};

// Handler for getting the current user
export const getCurrentUser = async (token: string) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number, username: string };
        const result = await pool.query('SELECT id, username, email FROM wine_users WHERE id = $1', [decoded.userId]);
        
        if (result.rows.length === 0) {
            return { error: 'User not found', status: 404 };
        }

        return { user: result.rows[0], status: 200 };
    } catch (error) {
        console.error('Get current user error:', error);
        return { error: 'Failed to get current user', status: 500 };
    }
};
