import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ENV } from '../config/env.js';

// Create PostgreSQL connection
const databaseUrl = ENV.DATABASE_URL;
let sslOption = false;
try {
    const { hostname, searchParams } = new URL(databaseUrl);
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
    const sslMode = searchParams.get('sslmode');
    // Enable SSL when not local, or when explicitly requested via sslmode=require
    sslOption = isLocalHost ? false : { rejectUnauthorized: false };
    if (sslMode === 'require') {
        sslOption = { rejectUnauthorized: false };
    }
} catch (_) {
    // Fallback: keep default ssl=false on URL parse issues
}

const client = postgres(databaseUrl, { ssl: sslOption });

// Create Drizzle instance
export const db = drizzle(client);

// Test database connection
export const testConnection = async () => {
    try {
        await client`SELECT 1`;
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await client.end();
    process.exit(0);
}); 