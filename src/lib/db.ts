import { MongoClient, Db } from 'mongodb';

const uri = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/examease';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not defined in environment variables. Using default local MongoDB connection string.');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  // Extract database name from URI or default to 'examease'
  const dbName = uri.split('/').pop()?.split('?')[0] || 'examease';
  return connectedClient.db(dbName);
}

export default clientPromise;
