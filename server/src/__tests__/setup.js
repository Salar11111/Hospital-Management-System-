import { execSync } from 'node:child_process';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';

function findSystemMongod() {
  try {
    const cmd = process.platform === 'win32' ? 'where mongod' : 'which mongod';
    return execSync(cmd, { encoding: 'utf8' })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find(Boolean);
  } catch {
    return undefined;
  }
}

let mongod;
let connected = false;

export async function startDb() {
  const systemBinary = findSystemMongod();
  mongod = await MongoMemoryServer.create({
    binary: systemBinary ? { systemBinary } : undefined,
  });
  process.env.MONGODB_URI = mongod.getUri();
  await mongoose.connect(mongod.getUri());
  connected = true;
}

export async function stopDb() {
  if (!connected) return;
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  connected = false;
  if (mongod) {
    await mongod.stop();
    mongod = undefined;
  }
}
