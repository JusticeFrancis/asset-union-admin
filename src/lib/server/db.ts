import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __assetUnionMongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = global.__assetUnionMongoose ?? { conn: null, promise: null };
global.__assetUnionMongoose = cached;

export async function connectDb() {
  if (cached.conn) return cached.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
