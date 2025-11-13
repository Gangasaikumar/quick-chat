import mongoose from "mongoose";
import type { Connection } from "mongoose";

// Cache for multiple DB connections
const connectionsCache: Map<string, Connection> = new Map();
let primaryConnection: Connection | null = null;
let isConnecting = false;

/**
 * Establishes the primary connection pool to the MongoDB server.
 */
export const connectPrimary = async (): Promise<void> => {
  if (primaryConnection || isConnecting) return;

  isConnecting = true;
  const mongoURI = process.env.MONGOURL || "mongodb://127.0.0.1:27017/";

  try {
    await mongoose.connect(mongoURI);
    primaryConnection = mongoose.connection;

    console.log("Primary MongoDB connection established.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  } finally {
    isConnecting = false;
  }
};

/**
 * Ensures that the DB connection is ready before returning a Connection object.
 * @param dbName The name of the database to use.
 * @returns Promise<Connection>
 */
export const getDb = async (dbName: string): Promise<Connection> => {
  // Wait for primary connection
  if (!primaryConnection) {
    await connectPrimary();
  }

  if (!primaryConnection) {
    throw new Error("Primary connection could not be established.");
  }

  // Return cached connection if available
  if (connectionsCache.has(dbName)) {
    return connectionsCache.get(dbName)!;
  }

  // Create new DB connection from the primary pool
  const dbConnection = primaryConnection.useDb(dbName, { useCache: true });
  connectionsCache.set(dbName, dbConnection);

  console.log(`🔄 Switched to database: ${dbName}`);
  return dbConnection;
};
