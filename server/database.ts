import { db, pool } from "./db";

let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

export async function testDatabaseConnection(): Promise<boolean> {
  connectionAttempts++;
  
  try {
    console.log(`[database] Testing connection (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})...`);
    
    // Test the connection with a simple query using the existing pool
    const result = await pool.query("SELECT 1 as test");
    
    if (result.rows && result.rows.length > 0) {
      console.log(`[database] Connection test successful`);
      connectionAttempts = 0; // Reset on success
      return true;
    }
    
    throw new Error("No result returned from test query");
    
  } catch (error: any) {
    console.error(`[database] Connection test failed (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`, error.message);
    
    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      console.error(`[database] Max connection attempts reached. Database connection failed.`);
      connectionAttempts = 0; // Reset for next attempt
      return false;
    }
    
    // Wait before retry (exponential backoff)
    const delay = Math.pow(2, connectionAttempts) * 1000;
    console.log(`[database] Retrying connection in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return testDatabaseConnection();
  }
}

export async function getDatabase() {
  return db;
}