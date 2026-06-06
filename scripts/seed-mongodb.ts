/**
 * MongoDB Seed Script
 * Run with: npx tsx scripts/seed-mongodb.ts
 *
 * This migrates all existing JSON data files to MongoDB Atlas.
 * Run ONCE after setting MONGODB_URI in .env.local
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import dns from 'dns';

// Force Google DNS (bypass home router DNS that doesn't support SRV records)
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

const dbName = process.env.MONGODB_DB || 'matanikeh';

function readJson(file: string) {
  const p = path.join(process.cwd(), 'data', file);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

async function seed() {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(dbName);

  console.log(`\n🌱 Seeding database: ${dbName}\n`);

  // Members
  const membersData = readJson('members.json');
  if (membersData?.members?.length) {
    await db.collection('members').deleteMany({});
    await db.collection('members').insertMany(membersData.members);
    console.log(`✅ Members: ${membersData.members.length} inserted`);
  }

  // Exercises
  const exercisesData = readJson('exercises.json');
  if (exercisesData?.exercises?.length) {
    await db.collection('exercises').deleteMany({});
    await db.collection('exercises').insertMany(exercisesData.exercises);
    console.log(`✅ Exercises: ${exercisesData.exercises.length} inserted`);
  }

  // WODs
  const wodsData = readJson('wods.json');
  if (wodsData?.wods?.length) {
    await db.collection('wods').deleteMany({});
    await db.collection('wods').insertMany(wodsData.wods);
    console.log(`✅ WODs: ${wodsData.wods.length} inserted`);
  }

  // Logbook
  const logbookData = readJson('logbook.json');
  if (logbookData?.entries?.length) {
    await db.collection('logbook').deleteMany({});
    await db.collection('logbook').insertMany(logbookData.entries);
    console.log(`✅ Logbook: ${logbookData.entries.length} inserted`);
  }

  // PRs
  const prsData = readJson('prs.json');
  if (prsData?.records?.length) {
    await db.collection('prs').deleteMany({});
    await db.collection('prs').insertMany(prsData.records);
    console.log(`✅ PRs: ${prsData.records.length} inserted`);
  }

  // Measurements
  const measurementsData = readJson('measurements.json');
  if (measurementsData?.records?.length) {
    await db.collection('measurements').deleteMany({});
    await db.collection('measurements').insertMany(measurementsData.records);
    console.log(`✅ Measurements: ${measurementsData.records.length} inserted`);
  }

  // Attendance
  const attendanceData = readJson('attendance.json');
  if (attendanceData?.records?.length) {
    await db.collection('attendance').deleteMany({});
    await db.collection('attendance').insertMany(attendanceData.records);
    console.log(`✅ Attendance: ${attendanceData.records.length} inserted`);
  }

  // Benchmarks
  const benchmarksData = readJson('benchmarks.json');
  if (benchmarksData?.benchmarks?.length) {
    await db.collection('benchmarks').deleteMany({});
    await db.collection('benchmarks').insertMany(benchmarksData.benchmarks);
    console.log(`✅ Benchmarks: ${benchmarksData.benchmarks.length} inserted`);
  }
  if (benchmarksData?.results?.length) {
    await db.collection('benchmark_results').deleteMany({});
    await db.collection('benchmark_results').insertMany(benchmarksData.results);
    console.log(`✅ Benchmark results: ${benchmarksData.results.length} inserted`);
  }

  // Skills
  const skillsData = readJson('skills.json');
  if (skillsData?.skills?.length) {
    await db.collection('skills').deleteMany({});
    await db.collection('skills').insertMany(skillsData.skills);
    console.log(`✅ Skills: ${skillsData.skills.length} inserted`);
  }
  if (skillsData?.records?.length) {
    await db.collection('skill_records').deleteMany({});
    await db.collection('skill_records').insertMany(skillsData.records);
    console.log(`✅ Skill records: ${skillsData.records.length} inserted`);
  }

  // Comments
  const commentsData = readJson('comments.json');
  if (commentsData?.comments?.length) {
    await db.collection('comments').deleteMany({});
    await db.collection('comments').insertMany(commentsData.comments);
    console.log(`✅ Comments: ${commentsData.comments.length} inserted`);
  }

  // Create indexes for performance
  console.log('\n📐 Creating indexes...');
  await db.collection('members').createIndex({ username: 1 }, { unique: true });
  await db.collection('members').createIndex({ id: 1 }, { unique: true });
  await db.collection('wods').createIndex({ date: 1 }, { unique: true });
  await db.collection('logbook').createIndex({ memberId: 1 });
  await db.collection('logbook').createIndex({ createdAt: -1 });
  await db.collection('prs').createIndex({ memberId: 1 });
  await db.collection('measurements').createIndex({ memberId: 1 });
  await db.collection('attendance').createIndex({ memberId: 1 });
  await db.collection('attendance').createIndex({ memberId: 1, date: 1 });
  await db.collection('benchmark_results').createIndex({ memberId: 1 });
  await db.collection('skill_records').createIndex({ memberId: 1, skillId: 1 }, { unique: true });
  await db.collection('comments').createIndex({ date: 1 });
  console.log('✅ Indexes created');

  await client.close();
  console.log('\n🎉 Seed complete!\n');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
