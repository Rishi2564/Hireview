import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment.");
}

const client = new MongoClient(uri);

export const mongoClientPromise =
  global.__mongoClientPromise ?? (global.__mongoClientPromise = client.connect());

