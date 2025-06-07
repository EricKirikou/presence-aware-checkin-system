import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!; // From .env
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const client = await MongoClient.connect(uri);
  const db = client.db('attendance-system'); // Replace with your DB name

  cachedDb = db;
  return db;
}