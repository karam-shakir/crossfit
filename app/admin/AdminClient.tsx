'use client';
import { todaySA } from '@/lib/timezone';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

type AdminTab = 'wod' | 'members' | 'weekly' | 'sports' | 'logs';

const WOD_TYPES = ['AMRAP', 'للوقت', 'قوة', 'تدريب'];
const DIFFICULTY_OPTIONS = ['مبتدئ', 'متوسط', 'متقدم', 'نخبة'];
const FOCUS_OPTIONS = [
  '', 'الأرجل والمؤخرة', 'الأكتاف والضغط', 'الجمناستكس', 'رفع الأثقال الأوليمبي',
  'التحمل والقلب', 'الرفعة الميتة', 'القرفصاء', 'الظهر والسحب', 'كامل الجسم'
];

function emptyWod(date: string) {
  return { date, title: '', type: 'للوقت', duration: '', rounds: '', notes: '', warmup: [], strength: [], metcon: [], cooldown: [] };
}

function emptyExercise() {
  return { exerciseId: '', reps: '', weight: '', distance: '', time: '', notes: '' };
}

export default function AdminClient({ member, exercises }: { member: any; exercises: any[] }) {
  const [tab, setTab] = useState<AdminTab>('wod');
  const [wod, setWod] = useState<any>(emptyWod(todaySA()));
  const [wodLoading, setWodLoading] = useState(false);
  const [wodSaved, setWodSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('metcon');
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [newMember, setNewMember] = useState({ username: '', nameAr: '', password: '' });
  const [addingMember, setAddingMember] = useState(false);

  // Weekly AI plan state
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null);