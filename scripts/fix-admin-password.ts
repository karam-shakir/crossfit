/**
 * Fix admin password: replace placeholder hash with real bcrypt hash
 * Run: npx tsx scripts/fix-admin-password.ts
 */
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || 'matanikeh';

async function fix() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // Find admin with placeholder hash
  const admin = await db.collection('members').findOne({ id: 'admin' });
  if (!admin) { console.log('❌ Admin not found'); await client.close(); return; }

  if (admin.password === '$2a$10$placeholder') {
    const hash = await bcrypt.hash('admin123', 10);
    await db.collection('members').updateOne({ id: 'admin' }, { $set: { password: hash } });
    console.log('✅ Admin password hash updated to real bcrypt hash');
  } else {
    console.log('✅ Admin password already has a real hash — no change needed');
  }

  await client.close();
}

fix().catch(e => { console.error('❌', e.message); process.exit(1); });
