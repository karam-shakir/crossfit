'use client';
import { todaySA } from '@/lib/timezone';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { BENCHMARK_OPTIONS } from '@/lib/crossfitProgramming';

type AdminTab = 'wod' | 'members' | 'weekly' | 'sports' | 'gym' | 'running' | 'cali' | 'logs';

const WOD_TYPES = ['AMRAP', 'للوقت', 'قوة', 'تدريب'];
const DIFFICULTY_OPTIONS = ['مبتدئ', 'متوسط', 'متقدم', 'نخبة'];
const FOCUS_OPTIONS = [
  '', 'الأرجل والمؤخرة', 'الأكتاف والضغط', 'الجمناستيك', 'رفع الأثقال الأولمبي',
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
  const [weeklyError, setWeeklyError] = useState('');
  const [weeklyFromDate, setWeeklyFromDate] = useState(todaySA());
  const [weeklyDays, setWeeklyDays] = useState(7);
  const [weekMode, setWeekMode] = useState<'crossfit' | 'mixed'>('crossfit');
  const [calisthenicsDays, setCalisthenicsDays] = useState(1);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [viewingSaved, setViewingSaved] = useState<any>(null);
  const [savedLoading, setSavedLoading] = useState(false);

  // Coach override state (CrossFit weekly plan)
  const [showCoachOverride, setShowCoachOverride] = useState(false);
  const [coachFocus, setCoachFocus] = useState('balanced');
  const [intensityBias, setIntensityBias] = useState('balanced');
  const [restDaysCount, setRestDaysCount] = useState(-1);
  const [hyroxMode, setHyroxMode] = useState(false);
  const [targetAudience, setTargetAudience] = useState('all');
  const [forbidInput, setForbidInput] = useState('');
  const [forbidList, setForbidList] = useState<string[]>([]);
  const [forceInput, setForceInput] = useState('');
  const [forceList, setForceList] = useState<string[]>([]);
  const [coachSpecialNotes, setCoachSpecialNotes] = useState('');
  const [weeklyClassDuration, setWeeklyClassDuration] = useState('60');   // مدة الحصة اليومية بالدقائق
  const [weeklyEquipmentNote, setWeeklyEquipmentNote] = useState('');     // قيد معدات لكامل الأسبوع
  const [weeklyRxFocus, setWeeklyRxFocus] = useState('balanced');         // rx / scaled / balanced
  const [weeklyBenchmarkName, setWeeklyBenchmarkName] = useState('');     // بنشمارك محدد لهذا الأسبوع
  const [weeklyBenchmarkDate, setWeeklyBenchmarkDate] = useState('');     // التاريخ المفروض عليه البنشمارك

  // AI generation state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiTheme, setAiTheme] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState('متوسط');
  const [aiFocus, setAiFocus] = useState('');
  const [wodMode, setWodMode] = useState<'crossfit' | 'calisthenics'>('crossfit');
  const [aiGeneratedMode, setAiGeneratedMode] = useState<'crossfit' | 'calisthenics'>('crossfit');
  // WOD coach override
  const [wodSessionType, setWodSessionType] = useState('balanced');   // heavy / skill / cardio / deload / balanced
  const [wodMetconFormat, setWodMetconFormat] = useState('');          // AMRAP / للوقت / EMOM / بالجولات / ''
  const [wodStrengthPattern, setWodStrengthPattern] = useState('');    // squat / hinge / push / pull / olympic / ''
  const [wodForbidExercises, setWodForbidExercises] = useState<string[]>([]);
  const [wodForceExercise, setWodForceExercise] = useState('');        // تمرين يجب أن يظهر
  const [wodSpecialNotes, setWodSpecialNotes] = useState('');
  const [wodForbidInput, setWodForbidInput] = useState('');
  const [wodDuration, setWodDuration] = useState('');                  // مدة الميتكون المرغوبة بالدقائق
  const [wodClassDuration, setWodClassDuration] = useState('60');       // مدة الحصة الكاملة بالدقائق
  const [wodEquipmentNote, setWodEquipmentNote] = useState('');         // قيد معدات اليوم
  const [wodRxFocus, setWodRxFocus] = useState('balanced');             // rx / scaled / balanced
  const [wodBenchmarkName, setWodBenchmarkName] = useState('');         // بنشمارك محدد (fran, cindy, ...)
  const [wodCyclePhaseOverride, setWodCyclePhaseOverride] = useState('auto'); // auto/foundation/build/peak/deload — تمرين اليوم
  const [weeklyCyclePhaseOverride, setWeeklyCyclePhaseOverride] = useState('auto'); // نفسها لخطة الأسبوع
  const [wodGeneratedCyclePhaseLabel, setWodGeneratedCyclePhaseLabel] = useState('');
  const [wodPartnerMode, setWodPartnerMode] = useState(false);            // يوم بارتنر — تمرين اليوم
  const [wodGeneratedPartnerLabel, setWodGeneratedPartnerLabel] = useState(''); // صيغة البارتنر التي اختارها التوليد الأخير
  const [weeklyPartnerDaysCount, setWeeklyPartnerDaysCount] = useState(-1); // -1 auto / 0 بدون / N عدد أيام صريح — خطة الأسبوع

  // دورة تدريج الكروسفت — حالة القراءة قبل التوليد (تُعرض كشريط توضيحي في لوحة الإدارة)
  const [wodCycleStatus, setWodCycleStatus] = useState<any>(null);
  const [wodCycleStatusLoading, setWodCycleStatusLoading] = useState(false);
  useEffect(() => {
    if (tab === 'wod' && !wodCycleStatus && !wodCycleStatusLoading) {
      setWodCycleStatusLoading(true);
      fetch('/api/wod/cycle-status').then(r => r.json()).then(d => setWodCycleStatus(d)).finally(() => setWodCycleStatusLoading(false));
    }
  }, [tab]);
  function refreshWodCycleStatus() {
    setWodCycleStatusLoading(true);
    fetch('/api/wod/cycle-status').then(r => r.json()).then(d => setWodCycleStatus(d)).finally(() => setWodCycleStatusLoading(false));
  }
  const CYCLE_PHASE_OPTIONS = [
    { v: 'auto', label: '🔄 تلقائي' },
    { v: 'foundation', label: 'التأسيس' },
    { v: 'build', label: 'البناء' },
    { v: 'peak', label: 'الذروة' },
    { v: 'deload', label: 'التفريغ' },
  ];
  function addWodForbid() {
    const v = wodForbidInput.trim().toLowerCase();
    if (v && !wodForbidExercises.includes(v)) setWodForbidExercises(p => [...p, v]);
    setWodForbidInput('');
  }
  function setWodModeSafe(mode: 'crossfit' | 'calisthenics') {
    setWodMode(mode);
    setWodForceExercise('');
    setWodBenchmarkName('');
  }
  const CROSSFIT_EXERCISE_IDS = ['back-squat','front-squat','deadlift','power-clean','clean-and-jerk','snatch','shoulder-press','push-press','thruster','pull-up','kipping-pull-up','muscle-up','handstand-pushup','toes-to-bar','double-under','burpee','wall-ball','kettle-bell-swing','row','run','air-squat'];
  const CALISTHENICS_EXERCISE_IDS = ['pull-up','push-up','muscle-up','handstand-pushup','toes-to-bar','rope-climb','double-under','burpee','box-jump','sit-up','air-squat'];

  // ===== Fix Cooldown =====
  const [fixCooldownFrom, setFixCooldownFrom] = useState(todaySA());
  const [fixCooldownTo, setFixCooldownTo] = useState(todaySA());
  const [fixCooldownLoading, setFixCooldownLoading] = useState(false);
  const [fixCooldownResult, setFixCooldownResult] = useState<any>(null);
  const [fixCooldownError, setFixCooldownError] = useState('');

  async function handleFixCooldown() {
    setFixCooldownLoading(true); setFixCooldownResult(null); setFixCooldownError('');
    try {
      const res = await fetch('/api/wod/fix-cooldown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDate: fixCooldownFrom, toDate: fixCooldownTo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل');
      setFixCooldownResult(data);
    } catch (e: any) {
      setFixCooldownError(e.message);
    } finally {
      setFixCooldownLoading(false);
    }
  }

  // ===== Gym Technogym =====
  const [gymMembers, setGymMembers] = useState<any[]>([]);
  const [gymSelectedMember, setGymSelectedMember] = useState('');
  const [gymFromDate, setGymFromDate] = useState(todaySA());
  const [gymLoading, setGymLoading] = useState(false);
  const [gymPlan, setGymPlan] = useState<any>(null);
  const [gymError, setGymError] = useState('');
  const [gymSaved, setGymSaved] = useState(false);
  const [gymProfile, setGymProfile] = useState<any>(null);
  const [gymOverride, setGymOverride] = useState<any>(null); // قيم المدرب المعدّلة
  const [gymShowOverride, setGymShowOverride] = useState(false);
  const [gymCyclePhaseOverride, setGymCyclePhaseOverride] = useState('auto'); // auto/foundation/build/peak/deload
  const [gymCycleStatus, setGymCycleStatus] = useState<any>(null);
  const [gymCycleStatusLoading, setGymCycleStatusLoading] = useState(false);

  useEffect(() => {
    if ((tab === 'gym' || tab === 'running' || tab === 'cali') && gymMembers.length === 0) {
      fetch('/api/members').then(r => r.json()).then(m => setGymMembers(Array.isArray(m) ? m.filter((x: any) => x.role !== 'admin') : []));
    }
  }, [tab]);

  // دورة تدريج الجيم الشخصية — تُجلب لكل عضو عند اختياره
  useEffect(() => {
    if (tab === 'gym' && gymSelectedMember) {
      setGymCycleStatus(null);
      setGymCyclePhaseOverride('auto');
      setGymCycleStatusLoading(true);
      fetch(`/api/gym/cycle-status?memberId=${gymSelectedMember}`).then(r => r.json()).then(d => setGymCycleStatus(d)).finally(() => setGymCycleStatusLoading(false));
    }
  }, [tab, gymSelectedMember]);
  function refreshGymCycleStatus() {
    if (!gymSelectedMember) return;
    setGymCycleStatusLoading(true);
    fetch(`/api/gym/cycle-status?memberId=${gymSelectedMember}`).then(r => r.json()).then(d => setGymCycleStatus(d)).finally(() => setGymCycleStatusLoading(false));
  }

  // ===== Calisthenics Program =====
  const [caliSelectedMember, setCaliSelectedMember] = useState('');
  const [caliFromDate, setCaliFromDate] = useState(todaySA());
  const [caliLoading, setCaliLoading] = useState(false);
  const [caliPlan, setCaliPlan] = useState<any>(null);
  const [caliError, setCaliError] = useState('');
  const [caliSaved, setCaliSaved] = useState(false);
  const [caliProfile, setCaliProfile] = useState<any>(null);
  const [caliOverride, setCaliOverride] = useState<any>(null);
  const [caliShowOverride, setCaliShowOverride] = useState(false);

  useEffect(() => {
    if (caliSelectedMember) {
      setCaliProfile(null); setCaliOverride(null); setCaliShowOverride(false);
      fetch(`/api/calisthenics/profile?memberId=${caliSelectedMember}`).then(r => r.json()).then(d => {
        setCaliProfile(d || null);
        if (d) setCaliOverride({
          goal: d.goal, level: d.level, daysPerWeek: d.daysPerWeek, gender: d.gender || 'male',
          skillGoals: d.skillGoals || [], equipment: d.equipment || [],
          maxPushups: d.maxPushups ?? '', maxPullups: d.maxPullups ?? '', maxDips: d.maxDips ?? '', plankSeconds: d.plankSeconds ?? '',
          limitations: d.limitations || '', specialInstructions: '',
        });
      });
    }
  }, [caliSelectedMember]);

  function caliToggleSkill(s: string) {
    setCaliOverride((prev: any) => ({
      ...prev,
      skillGoals: prev.skillGoals.includes(s) ? prev.skillGoals.filter((x: string) => x !== s) : [...prev.skillGoals, s],
    }));
  }
  function caliToggleEquipment(e: string) {
    setCaliOverride((prev: any) => ({
      ...prev,
      equipment: prev.equipment.includes(e) ? prev.equipment.filter((x: string) => x !== e) : [...prev.equipment, e],
    }));
  }

  async function generateCaliPlan() {
    if (!caliSelectedMember) return;
    setCaliLoading(true); setCaliPlan(null); setCaliError(''); setCaliSaved(false);
    try {
      const res = await fetch('/api/calisthenics/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: caliSelectedMember, fromDate: caliFromDate, override: caliOverride }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل التوليد');
      setCaliPlan(data);
      setCaliSaved(true);
    } catch (e: any) {
      setCaliError(e.message);
    } finally {
      setCaliLoading(false);
    }
  }

  // ===== Running (العدّائين) =====
  const [runSelectedMember, setRunSelectedMember] = useState('');
  const [runFromDate, setRunFromDate] = useState(todaySA());
  const [runLoading, setRunLoading] = useState(false);
  const [runPlan, setRunPlan] = useState<any>(null);
  const [runError, setRunError] = useState('');
  const [runSaved, setRunSaved] = useState(false);
  const [runProfile, setRunProfile] = useState<any>(null);
  const [runOverride, setRunOverride] = useState<any>(null);
  const [runShowOverride, setRunShowOverride] = useState(false);
  const [runCyclePhaseOverride, setRunCyclePhaseOverride] = useState('auto'); // auto/foundation/build/peak/deload — أهداف السباق العادية
  const [runWalkStageOverride, setRunWalkStageOverride] = useState<number | null>(null); // فرض مرحلة مشي/جري لبرنامج كبار السن
  const [runCycleStatus, setRunCycleStatus] = useState<any>(null);
  const [runCycleStatusLoading, setRunCycleStatusLoading] = useState(false);

  useEffect(() => {
    if (runSelectedMember) {
      setRunProfile(null); setRunShowOverride(false); setRunCycleStatus(null); setRunCyclePhaseOverride('auto'); setRunWalkStageOverride(null);
      fetch(`/api/running/profile?memberId=${runSelectedMember}`).then(r => r.json()).then(d => {
        setRunProfile(d || null);
        // نهيّئ دائماً حتى بلا بروفايل محفوظ — يتيح للمدرب إعداد عضو جديد (مثلاً برنامج كبار سن) من الصفر
        setRunOverride({
          goal: d?.goal || 'general_endurance', level: d?.level || 'beginner', daysPerWeek: d?.daysPerWeek || 3,
          gender: d?.gender || 'male', surface: d?.surface || 'mixed', currentWeeklyKm: d?.currentWeeklyKm || '',
          best5kTime: d?.best5kTime || '', targetRaceDate: d?.targetRaceDate || '', limitations: d?.limitations || '',
          specialInstructions: '',
        });
      });
      setRunCycleStatusLoading(true);
      fetch(`/api/running/cycle-status?memberId=${runSelectedMember}`).then(r => r.json()).then(d => setRunCycleStatus(d)).finally(() => setRunCycleStatusLoading(false));
    }
  }, [runSelectedMember]);
  function refreshRunCycleStatus() {
    if (!runSelectedMember) return;
    setRunCycleStatusLoading(true);
    fetch(`/api/running/cycle-status?memberId=${runSelectedMember}`).then(r => r.json()).then(d => setRunCycleStatus(d)).finally(() => setRunCycleStatusLoading(false));
  }

  async function generateRunPlan() {
    if (!runSelectedMember) return;
    setRunLoading(true); setRunPlan(null); setRunError(''); setRunSaved(false);
    try {
      const res = await fetch('/api/running/generate-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: runSelectedMember, fromDate: runFromDate, override: runOverride,
          cyclePhaseOverride: runCyclePhaseOverride,
          walkRunStageOverride: runWalkStageOverride === null ? undefined : runWalkStageOverride,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل التوليد');
      setRunPlan(data);
      setRunSaved(true);
      refreshRunCycleStatus();
    } catch (e: any) {
      setRunError(e.message);
    } finally {
      setRunLoading(false);
    }
  }

  useEffect(() => {
    if (gymSelectedMember) {
      setGymProfile(null); setGymOverride(null); setGymShowOverride(false);
      fetch(`/api/gym/profile?memberId=${gymSelectedMember}`).then(r => r.json()).then(d => {
        setGymProfile(d || null);
        if (d) setGymOverride({ goal: d.goal, level: d.level, daysPerWeek: d.daysPerWeek, gender: d.gender || 'male', focusAreas: d.focusAreas || [], limitations: d.limitations || '', specialInstructions: '' });
      });
    }
  }, [gymSelectedMember]);

  function gymToggleFocus(area: string) {
    setGymOverride((prev: any) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area) ? prev.focusAreas.filter((a: string) => a !== area) : [...prev.focusAreas, area],
    }));
  }

  function addToForbid() {
    const v = forbidInput.trim().toLowerCase();
    if (v && !forbidList.includes(v)) setForbidList(p => [...p, v]);
    setForbidInput('');
  }
  function addToForce() {
    const v = forceInput.trim().toLowerCase();
    if (v && !forceList.includes(v)) setForceList(p => [...p, v]);
    setForceInput('');
  }

  async function generateGymPlan() {
    if (!gymSelectedMember) return;
    setGymLoading(true); setGymPlan(null); setGymError(''); setGymSaved(false);
    try {
      const res = await fetch('/api/gym/generate-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: gymSelectedMember, fromDate: gymFromDate, override: gymOverride, cyclePhaseOverride: gymCyclePhaseOverride }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل التوليد');
      setGymPlan(data);
      setGymSaved(true);
      refreshGymCycleStatus();
    } catch (e: any) {
      setGymError(e.message);
    } finally {
      setGymLoading(false);
    }
  }

  // ===== Sports Weekly Plans =====
  type SportsTab = 'hyrox' | 'kettlebell' | 'calisthenics';
  const [sportsTab, setSportsTab] = useState<SportsTab>('hyrox');
  const [sportsFromDate, setSportsFromDate] = useState(todaySA());
  const [sportsDays, setSportsDays] = useState(5);
  const [sportsDifficulty, setSportsDifficulty] = useState('متوسط');
  const [sportsLoading, setSportsLoading] = useState(false);
  const [sportsPlan, setSportsPlan] = useState<any>(null);
  const [sportsError, setSportsError] = useState('');
  const [sportsSaving, setSportsSaving] = useState(false);
  const [sportsSaved, setSportsSaved] = useState(false);
  // Sports coach override
  const [showSportsOverride, setShowSportsOverride] = useState(false);
  const [sportsCoachFocus, setSportsCoachFocus] = useState('balanced');
  const [sportsIntensityBias, setSportsIntensityBias] = useState('balanced');
  const [sportsRestDays, setSportsRestDays] = useState(-1);
  const [sportsSpecialNotes, setSportsSpecialNotes] = useState('');
  // Hyrox specific
  const [hyroxTargetEvent, setHyroxTargetEvent] = useState('');
  const [hyroxWeekGoal, setHyroxWeekGoal] = useState('');
  const [hyroxIncludeSimulation, setHyroxIncludeSimulation] = useState(true);
  // Kettlebell specific
  const [kbPriorityEvent, setKbPriorityEvent] = useState('');
  // Calisthenics specific
  const [calisSkillFocus, setCalisSkillFocus] = useState('');

  async function generateSportsPlan() {
    setSportsLoading(true); setSportsError(''); setSportsPlan(null); setSportsSaved(false);
    try {
      const res = await fetch(`/api/${sportsTab}/generate-week`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDate: sportsFromDate, days: sportsDays, difficulty: sportsDifficulty,
          coachFocus: sportsCoachFocus, intensityBias: sportsIntensityBias,
          restDays: sportsRestDays, specialNotes: sportsSpecialNotes,
          ...(sportsTab === 'hyrox' && { targetEvent: hyroxTargetEvent, weekGoal: hyroxWeekGoal, includeSimulation: hyroxIncludeSimulation }),
          ...(sportsTab === 'kettlebell' && { priorityEvent: kbPriorityEvent }),
          ...(sportsTab === 'calisthenics' && { skillFocus: calisSkillFocus }),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSportsError(data.error || 'خطأ في التوليد'); return; }
      setSportsPlan(data);
    } catch (e: any) { setSportsError(e.message); }
    setSportsLoading(false);
  }

  async function saveSportsPlan() {
    if (!sportsPlan) return;
    setSportsSaving(true);
    try {
      const res = await fetch(`/api/${sportsTab}/save-week`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: sportsPlan.sessions || [] }),
      });
      if (res.ok) setSportsSaved(true);
    } catch {}
    setSportsSaving(false);
  }

  // Load WOD for selected date
  async function loadWod(date: string) {
    setWodLoading(true);
    const res = await fetch(`/api/wod?date=${date}`);
    const data = await res.json();
    if (data) {
      setWod({ ...data, duration: data.duration || '', rounds: data.rounds || '' });
      if (data.aiTheme) setAiTheme(data.aiTheme);
      else setAiTheme('');
    } else {
      setWod(emptyWod(date));
      setAiTheme('');
    }
    setWodLoading(false);
  }

  useEffect(() => {
    loadWod(wod.date);
  }, []);

  async function saveWod() {
    setWodLoading(true);
    await fetch('/api/wod', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...wod,
        duration: wod.duration ? Number(wod.duration) : undefined,
        rounds: wod.rounds ? Number(wod.rounds) : undefined,
      }),
    });
    setWodSaved(true);
    setTimeout(() => setWodSaved(false), 2000);
    setWodLoading(false);
  }

  async function deleteWod() {
    if (!wod.id) return;
    if (!confirm(`حذف تمرين ${wod.date}؟`)) return;
    setWodLoading(true);
    await fetch(`/api/wod?id=${wod.id}`, { method: 'DELETE' });
    setWod(emptyWod(wod.date));
    setAiTheme('');
    setWodLoading(false);
  }

  function addExercise(section: string) {
    setWod((p: any) => ({ ...p, [section]: [...p[section], emptyExercise()] }));
  }

  function updateExercise(section: string, idx: number, field: string, value: string) {
    setWod((p: any) => ({
      ...p,
      [section]: p[section].map((e: any, i: number) => i === idx ? { ...e, [field]: value } : e)
    }));
  }

  function removeExercise(section: string, idx: number) {
    setWod((p: any) => ({ ...p, [section]: p[section].filter((_: any, i: number) => i !== idx) }));
  }

  // AI Generate WOD
  async function generateAiWod() {
    setAiGenerating(true);
    setAiError('');
    setAiTheme('');
    try {
      const res = await fetch('/api/wod/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: wod.date,
          difficulty: aiDifficulty,
          focus: aiFocus || undefined,
          wodMode,
          sessionType: wodSessionType,
          metconFormat: wodMetconFormat || undefined,
          strengthPattern: wodStrengthPattern || undefined,
          forbidExercises: wodForbidExercises,
          forceExercise: wodForceExercise || undefined,
          specialNotes: wodSpecialNotes || undefined,
          targetDuration: wodDuration ? Number(wodDuration) : undefined,
          classDuration: Number(wodClassDuration),
          equipmentNote: wodEquipmentNote || undefined,
          rxFocus: wodRxFocus,
          benchmarkName: wodBenchmarkName || undefined,
          cyclePhaseOverride: wodCyclePhaseOverride,
          partnerMode: wodPartnerMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || 'حدث خطأ في التوليد');
        return;
      }
      const generated = data.wod;
      setWod({
        ...generated,
        duration: generated.duration ? String(generated.duration) : '',
        rounds: generated.rounds ? String(generated.rounds) : '',
      });
      if (data.theme) setAiTheme(data.theme);
      setWodGeneratedCyclePhaseLabel(data.cyclePhaseLabel || '');
      setWodGeneratedPartnerLabel(data.isPartnerWod ? (data.partnerFormatLabel || 'بارتنر') : '');
      setAiGeneratedMode(wodMode);
      setShowAiPanel(false);
      setActiveSection('strength');
    } catch (e: any) {
      setAiError(e.message || 'فشل الاتصال بالذكاء الاصطناعي');
    } finally {
      setAiGenerating(false);
    }
  }

  // Weekly AI plan — full WODs
  async function generateWeeklyPlan() {
    setWeeklyLoading(true);
    setWeeklyError('');
    setWeeklyPlan(null);
    setPlanSaved(false);
    setViewingSaved(null);
    try {
      const res = await fetch('/api/wod/generate-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDate: weeklyFromDate, days: weeklyDays, difficulty: aiDifficulty, weekMode, calisthenicsDays,
          coachFocus, intensityBias, restDaysCount, hyroxMode, targetAudience,
          forbidExercises: forbidList, forceExercises: forceList, specialNotes: coachSpecialNotes,
          classDuration: Number(weeklyClassDuration),
          equipmentNote: weeklyEquipmentNote || undefined,
          rxFocus: weeklyRxFocus,
          benchmarkName: weeklyBenchmarkName || undefined,
          benchmarkDate: weeklyBenchmarkName ? (weeklyBenchmarkDate || undefined) : undefined,
          cyclePhaseOverride: weeklyCyclePhaseOverride,
          partnerDaysCount: weeklyPartnerDaysCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setWeeklyError(data.error || 'خطأ'); return; }
      setWeeklyPlan(data);
      refreshWodCycleStatus(); // الأسبوع الجديد قد يكون غيّر مرحلة الدورة — حدّث الشريط التوضيحي
    } catch (e: any) {
      setWeeklyError(e.message);
    } finally {
      setWeeklyLoading(false);
    }
  }

  async function saveWeeklyPlan() {
    if (!weeklyPlan) return;
    setSavingPlan(true);
    try {
      const label = `خطة ${weeklyDays} أيام من ${weeklyFromDate}`;
      // 1. Save plan record
      await fetch('/api/weekly-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...weeklyPlan, label, fromDate: weeklyFromDate, days: weeklyDays }),
      });
      // 2. Save each WOD fully to the calendar
      for (const wod of weeklyPlan.wods || []) {
        await fetch('/api/wod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: wod.date,
            title: wod.title,
            titleEn: wod.titleEn || '',
            type: wod.type,
            duration: wod.duration,
            rounds: wod.rounds,
            notes: wod.notes || '',
            aiTheme: wod.aiTheme || '',
            pattern: wod.pattern || null,
            isPartnerWod: wod.isPartnerWod || false,
            partnerFormat: wod.partnerFormat || null,
            isCalisthenics: wod.isCalisthenics || false,
            warmup:    wod.warmup    || [],
            strength:  wod.strength  || [],
            metcon:    wod.metcon    || [],
            accessory: wod.accessory || [],
            cooldown:  wod.cooldown  || [],
          }),
        });
      }
      setPlanSaved(true);
      loadSavedPlans();
    } catch {}
    setSavingPlan(false);
  }

  async function loadSavedPlans() {
    setSavedLoading(true);
    const res = await fetch('/api/weekly-plans');
    const data = await res.json();
    setSavedPlans(Array.isArray(data) ? data : []);
    setSavedLoading(false);
  }

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function deleteSavedPlan(id: string, deleteWods: boolean) {
    setDeleteConfirm(null);
    await fetch(`/api/weekly-plans?id=${id}&deleteWods=${deleteWods}`, { method: 'DELETE' });
    setSavedPlans(p => p.filter(x => x.id !== id));
    if (viewingSaved?.id === id) setViewingSaved(null);
  }

  // Load saved plans when tab opens
  useEffect(() => {
    if (tab === 'weekly') loadSavedPlans();
  }, [tab]);

  // ===== Login Logs =====
  const [logs, setLogs] = useState<any[]>([]);
  const [logStats, setLogStats] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsTab, setLogsTab] = useState<'stats' | 'detail'>('stats');
  const [logFilter, setLogFilter] = useState('');

  useEffect(() => {
    if (tab === 'logs') loadLogs();
  }, [tab]);

  async function loadLogs() {
    setLogsLoading(true);
    const res = await fetch('/api/login-logs');
    const data = await res.json();
    setLogs(data.logs || []);
    setLogStats(data.stats || []);
    setLogsLoading(false);
  }

  async function clearLogs() {
    if (!confirm('حذف كل سجل الدخول؟')) return;
    await fetch('/api/login-logs', { method: 'DELETE' });
    setLogs([]); setLogStats([]);
  }

  // Members
  const [memberStats, setMemberStats] = useState<any[]>([]);
  const [newMemberCredentials, setNewMemberCredentials] = useState<any>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [resetPwdId, setResetPwdId] = useState<string | null>(null);
  const [resetPwdValue, setResetPwdValue] = useState('');
  const [resetPwdLoading, setResetPwdLoading] = useState(false);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [memberNotes, setMemberNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'members') {
      setMembersLoading(true);
      Promise.all([
        fetch('/api/members').then(r => r.json()),
        fetch('/api/leaderboard').then(r => r.json()),
      ]).then(([m, s]) => {
        setMembers(Array.isArray(m) ? m : []);
        setMemberStats(Array.isArray(s) ? s : []);
        setMembersLoading(false);
      });
    }
  }, [tab]);

  async function addMember() {
    setAddingMember(true);
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMember),
    });
    if (res.ok) {
      const m = await res.json();
      setMembers(prev => [...prev, m]);
      setNewMemberCredentials({ nameAr: m.nameAr, username: newMember.username, password: newMember.password });
      setNewMember({ username: '', nameAr: '', password: '' });
    } else {
      const err = await res.json();
      alert(err.error || 'خطأ في إضافة العضو');
    }
    setAddingMember(false);
  }

  async function deleteMember(id: string) {
    if (!confirm('حذف هذا العضو؟')) return;
    await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  async function togglePermission(id: string, perm: 'canViewWods' | 'canGenerateWod', current: boolean) {
    const res = await fetch(`/api/members/permissions?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [perm]: !current }),
    });
    if (res.ok) {
      setMembers(prev => prev.map(m => m.id === id ? { ...m, [perm]: !current } : m));
    }
  }

  async function impersonateMember(id: string, nameAr: string) {
    if (!confirm(`ستنتقل للتصفح كـ "${nameAr}" — ستُعاد للوحة الإدارة تلقائياً عند الضغط على "العودة للإدارة". متأكد؟`)) return;
    setImpersonating(id);
    const res = await fetch('/api/admin/impersonate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: id }),
    });
    if (res.ok) { window.location.href = '/'; }
    else { alert('فشل التبديل'); setImpersonating(null); }
  }

  async function resetPassword(id: string) {
    if (!resetPwdValue || resetPwdValue.length < 4) return;
    setResetPwdLoading(true);
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: id, newPassword: resetPwdValue }),
    });
    setResetPwdLoading(false);
    if (res.ok) { setResetPwdId(null); setResetPwdValue(''); alert('✅ تم تغيير كلمة المرور'); }
    else { const e = await res.json(); alert(e.error || 'فشل'); }
  }

  async function saveMemberNotes(id: string) {
    setSavingNotes(id);
    await fetch('/api/admin/member-notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: id, notes: memberNotes[id] || '' }),
    });
    setSavingNotes(null);
  }

  async function restoreAdmin() {
    const res = await fetch('/api/admin/restore', { method: 'POST' });
    if (res.ok) { window.location.href = '/admin'; }
    else { alert('فشل استعادة حساب المدير'); }
  }

  const sections = [
    { key: 'warmup', label: 'الإحماء 🔆' },
    { key: 'strength', label: 'القوة 🏋️' },
    { key: 'metcon', label: 'الـ WOD 🔥' },
    { key: 'cooldown', label: 'التهدئة 🧘' },
  ];

  return (
    <div className="min-h-dvh flex w-full overflow-x-hidden">
      <Navbar member={member} />
      <main className="flex-1 min-w-0 lg:mr-56 pb-safe-nav lg:pb-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 pt-safe pb-6 space-y-6">

          <h1 className="text-xl font-bold text-white">⚙️ لوحة الإدارة</h1>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setTab('wod')}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'wod' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
              🔥 WOD اليومي
            </button>
            <button onClick={() => setTab('weekly')}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'weekly' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              📅 خطة CrossFit
            </button>
            <button onClick={() => setTab('sports')}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'sports' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              🏋️ خطة الرياضات
            </button>
            <button onClick={() => setTab('gym')}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'gym' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              🏛️ جيم Technogym
            </button>
            <button onClick={() => setTab('running')}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'running' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              🏃 العدّائين
            </button>
            <button onClick={() => setTab('cali')}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'cali' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              🤸 كاليسثنكس
            </button>
            <button onClick={() => setTab('members')}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'members' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              👥 الأعضاء
            </button>
            <button onClick={() => setTab('logs')}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'logs' ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              📋 سجل الدخول
            </button>
          </div>

          {/* WOD Builder */}
          {tab === 'wod' && (
            <div className="space-y-4">
              {/* شريط دورة التدريج — يعرض المرحلة القادمة قبل التوليد الفعلي */}
              {wodCycleStatus && (
                <div className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${
                  wodCycleStatus.autoDeloadTriggered
                    ? 'bg-amber-900/30 border-amber-700/50 text-amber-200'
                    : 'bg-indigo-900/20 border-indigo-700/40 text-indigo-200'
                }`}>
                  <span className="text-lg leading-none">{wodCycleStatus.autoDeloadTriggered ? '⚠️' : '📈'}</span>
                  <div className="flex-1 leading-relaxed">
                    <div className="font-semibold text-white">
                      دورة التدريج القادمة: {wodCycleStatus.nextPhaseLabel} — {wodCycleStatus.nextPhaseInfo?.pctLabel}
                    </div>
                    <div className="text-xs opacity-80 mt-0.5">{wodCycleStatus.nextPhaseInfo?.description}</div>
                    {wodCycleStatus.autoDeloadTriggered && (
                      <div className="text-xs mt-1 text-amber-300">سيُفرض أسبوع تفريغ تلقائياً عند توليد الأسبوع القادم (4 أسابيع منذ آخر تفريغ) — يمكن تجاوز ذلك من "فرض مرحلة الدورة" أدناه</div>
                    )}
                    {wodCycleStatus.latest && (
                      <div className="text-xs opacity-70 mt-1">آخر أسبوع مُولَّد: {wodCycleStatus.latest.weekStartDate} — {wodCycleStatus.latest.weeklyIntensityLabel}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Date picker + Save */}
              <div className="flex gap-3">
                <input type="date" value={wod.date}
                  onChange={e => { setWod((p: any) => ({ ...p, date: e.target.value })); loadWod(e.target.value); }}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                <button onClick={saveWod} disabled={wodLoading}
                  className={`px-6 py-2 rounded-xl text-sm font-semibold transition-colors ${wodSaved ? 'bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-400 text-white disabled:bg-gray-700'}`}>
                  {wodSaved ? '✅ تم الحفظ' : wodLoading ? '...' : 'حفظ WOD'}
                </button>
                {wod.id && (
                  <button onClick={deleteWod} disabled={wodLoading}
                    className="px-3 py-2 rounded-xl text-sm font-semibold bg-red-900/60 hover:bg-red-700 text-red-300 hover:text-white transition-colors border border-red-800/50"
                    title="حذف هذا التمرين">
                    🗑
                  </button>
                )}
              </div>

              {/* AI Generation Button */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowAiPanel(p => !p)}
                  className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                    wodMode === 'calisthenics'
                      ? 'bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600'
                      : 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600'
                  }`}>
                  <span className="text-lg">{wodMode === 'calisthenics' ? '🤸' : '🤖'}</span>
                  توليد تلقائي بالذكاء الاصطناعي
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {wodMode === 'calisthenics' ? 'Calisthenics' : 'CompTrain Style'}
                  </span>
                </button>

                {/* AI Panel */}
                {showAiPanel && (
                  <div className="bg-gray-900 rounded-2xl border border-purple-700/40 overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🧠</span>
                        <h3 className="text-white font-bold text-sm">إعدادات المدرب للتوليد</h3>
                      </div>
                      <button onClick={() => setShowAiPanel(false)} className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/10 transition-all">✕</button>
                    </div>

                    <div className="p-4 space-y-4">

                      {/* نوع الجلسة (CrossFit / Calisthenics) */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">🏷️ نوع الجلسة</label>
                        <div className="flex rounded-xl overflow-hidden border border-purple-700/40">
                          <button onClick={() => setWodModeSafe('crossfit')}
                            className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${wodMode === 'crossfit' ? 'bg-orange-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-gray-200'}`}>
                            🔥 CrossFit
                          </button>
                          <button onClick={() => setWodModeSafe('calisthenics')}
                            className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${wodMode === 'calisthenics' ? 'bg-emerald-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-gray-200'}`}>
                            🤸 Calisthenics
                          </button>
                        </div>
                      </div>

                      {/* نوع الجلسة (Heavy / Skill / Cardio...) */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">⚡ طابع الجلسة</label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {[
                            { v: 'balanced', l: '⚖️ متوازن',        sub: 'قوة + ميتكون كلاسيكي CompTrain Style' },
                            { v: 'heavy',    l: '🔴 يوم ثقيل',      sub: 'قوة compound 80-90% + ميتكون قصير 8-12 دق' },
                            { v: 'skill',    l: '🎯 يوم تقنية',     sub: 'Olympic Lifting / Gymnastics + ميتكون خفيف' },
                            { v: 'cardio',   l: '🫀 يوم تحمل',      sub: 'ميتكون طويل AMRAP 20+ دقيقة، أوزان خفيفة' },
                            { v: 'deload',   l: '🔄 يوم تفريغ',     sub: '60-70% شدة — استرداد، تقنية، لا إجهاد' },
                          ].map(s => (
                            <button key={s.v} onClick={() => setWodSessionType(s.v)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-right text-sm transition-all ${wodSessionType === s.v ? 'border-orange-500 bg-orange-900/20 text-white' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'}`}>
                              <span className="font-bold flex-1">{s.l}</span>
                              <span className="text-xs text-gray-500 truncate">{s.sub}</span>
                              {wodSessionType === s.v && <span className="text-orange-400 flex-shrink-0">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* المستوى والتركيز */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 font-semibold block mb-2">📊 المستوى</label>
                          <div className="grid grid-cols-2 gap-1">
                            {DIFFICULTY_OPTIONS.map(d => (
                              <button key={d} onClick={() => setAiDifficulty(d)}
                                className={`py-2 rounded-xl text-xs font-bold border transition-all ${aiDifficulty === d ? 'border-purple-500 bg-purple-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 font-semibold block mb-2">🎯 التركيز</label>
                          <select value={aiFocus} onChange={e => setAiFocus(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-2 py-2 text-white text-xs focus:outline-none focus:border-purple-500">
                            <option value="">كامل الجسم</option>
                            {FOCUS_OPTIONS.filter(f => f).map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                      </div>

                      {wodMode === 'crossfit' && (
                        <>
                          {/* نمط القوة */}
                          <div>
                            <label className="text-xs text-gray-400 font-semibold block mb-2">🏋️ نمط القوة (اختياري)</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { v: '', l: 'تلقائي' },
                                { v: 'squat', l: '🦵 Squat' },
                                { v: 'hinge', l: '🔽 Hinge' },
                                { v: 'push', l: '💥 Push' },
                                { v: 'pull', l: '⬆️ Pull' },
                                { v: 'olympic', l: '🥇 Olympic' },
                              ].map(p => (
                                <button key={p.v} onClick={() => setWodStrengthPattern(p.v)}
                                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${wodStrengthPattern === p.v ? 'border-blue-500 bg-blue-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                                  {p.l}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* صيغة الميتكون */}
                          <div>
                            <label className="text-xs text-gray-400 font-semibold block mb-2">⏱️ صيغة الميتكون (اختياري)</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {['', 'AMRAP', 'للوقت', 'EMOM', 'بالجولات', 'Chipper'].map(f => (
                                <button key={f} onClick={() => setWodMetconFormat(f)}
                                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${wodMetconFormat === f ? 'border-teal-500 bg-teal-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                                  {f || 'تلقائي'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* المدة المرغوبة */}
                          <div>
                            <label className="text-xs text-gray-400 font-semibold block mb-2">
                              ⏱ مدة الميتكون — <span className="text-white">{wodDuration ? wodDuration + ' دقيقة' : 'تلقائي'}</span>
                            </label>
                            <div className="flex gap-1.5 flex-wrap">
                              {['', '8', '10', '12', '15', '18', '20', '25', '30'].map(n => (
                                <button key={n} onClick={() => setWodDuration(n)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${wodDuration === n ? 'border-purple-500 bg-purple-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                                  {n || 'تلقائي'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* تمرين مطلوب */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">⚡ تمرين مطلوب إدراجه</label>
                        <select value={wodForceExercise} onChange={e => setWodForceExercise(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-green-500">
                          <option value="">لا يوجد — الـ AI يختار</option>
                          {(wodMode === 'crossfit' ? CROSSFIT_EXERCISE_IDS : CALISTHENICS_EXERCISE_IDS).map(id => (
                            <option key={id} value={id}>{id}</option>
                          ))}
                        </select>
                      </div>

                      {/* تمارين محظورة */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">🚫 تمارين محظورة اليوم</label>
                        <div className="flex gap-2">
                          <select value={wodForbidInput} onChange={e => setWodForbidInput(e.target.value)}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-2 py-2 text-white text-xs focus:outline-none focus:border-red-500">
                            <option value="">اختر تمريناً لحذفه...</option>
                            {(wodMode === 'crossfit' ? CROSSFIT_EXERCISE_IDS : CALISTHENICS_EXERCISE_IDS).map(id => (
                              <option key={id} value={id}>{id}</option>
                            ))}
                          </select>
                          <button onClick={addWodForbid} className="px-3 py-2 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-xs font-bold hover:bg-red-900/60">+</button>
                        </div>
                        {wodForbidExercises.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {wodForbidExercises.map(ex => (
                              <span key={ex} onClick={() => setWodForbidExercises(p => p.filter(x => x !== ex))}
                                className="text-xs px-2 py-0.5 bg-red-900/30 border border-red-700/40 text-red-300 rounded-lg cursor-pointer hover:bg-red-900/50">
                                {ex} ✕
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {wodMode === 'crossfit' && (
                        <>
                          {/* مدة الحصة الكاملة */}
                          <div>
                            <label className="text-xs text-gray-400 font-semibold block mb-2">🏛️ مدة الحصة الكاملة</label>
                            <div className="grid grid-cols-4 gap-1.5">
                              {['45', '60', '75', '90'].map(d => (
                                <button key={d} onClick={() => setWodClassDuration(d)}
                                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${wodClassDuration === d ? 'border-purple-500 bg-purple-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                                  {d} د
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* التركيز RX/Scaled */}
                          <div>
                            <label className="text-xs text-gray-400 font-semibold block mb-2">🎯 تركيز الحصة</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { v: 'balanced', l: '⚖️ متوازن' },
                                { v: 'rx',       l: '🔥 RX متمرس' },
                                { v: 'scaled',   l: '🌱 Scaled مبتدئين' },
                              ].map(r => (
                                <button key={r.v} onClick={() => setWodRxFocus(r.v)}
                                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${wodRxFocus === r.v ? 'border-teal-500 bg-teal-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                                  {r.l}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* فرض مرحلة دورة التدريج ليوم اليوم فقط */}
                          <div>
                            <label className="text-xs text-gray-400 font-semibold block mb-2">📈 مرحلة دورة التدريج (تلقائياً حسب الأسبوع الحالي، أو فرض مرحلة)</label>
                            <div className="grid grid-cols-5 gap-1.5">
                              {CYCLE_PHASE_OPTIONS.map(p => (
                                <button key={p.v} onClick={() => setWodCyclePhaseOverride(p.v)}
                                  className={`py-2 rounded-xl text-[11px] font-semibold border transition-all ${wodCyclePhaseOverride === p.v ? 'border-indigo-500 bg-indigo-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* بنشمارك محدد */}
                          <div>
                            <label className="text-xs text-gray-400 font-semibold block mb-2">🏆 تمرين بنشمارك محدد (اختياري)</label>
                            <select value={wodBenchmarkName} onChange={e => setWodBenchmarkName(e.target.value)}
                              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500">
                              <option value="">بدون — تصميم حر</option>
                              {BENCHMARK_OPTIONS.map(b => (
                                <option key={b.key} value={b.key}>{b.label} — {b.kind === 'hero' ? 'Hero WOD' : 'Girl WOD'}</option>
                              ))}
                            </select>
                            {wodBenchmarkName && (
                              <p className="text-xs text-yellow-500 mt-1.5">سيُعاد إنتاج هذا التمرين بحركاته وتكراراته الرسمية — بدون قوة أو أكسسوار إضافي</p>
                            )}
                          </div>

                          {/* يوم بارتنر */}
                          <div>
                            <button onClick={() => setWodPartnerMode(!wodPartnerMode)}
                              disabled={!!wodBenchmarkName}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all disabled:opacity-40 ${
                                wodPartnerMode ? 'border-pink-500 bg-pink-900/20' : 'border-gray-700 bg-gray-800'
                              }`}>
                              <span className="text-sm font-semibold text-white">🤝 يوم بارتنر</span>
                              <span className={`w-10 h-5 rounded-full relative transition-all ${wodPartnerMode ? 'bg-pink-500' : 'bg-gray-600'}`}>
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${wodPartnerMode ? 'right-0.5' : 'left-0.5'}`} />
                              </span>
                            </button>
                            {wodPartnerMode && (
                              <p className="text-xs text-pink-400 mt-1.5">صيغة البارتنر تُختار تلقائياً حسب نمط اليوم — الميتكون والإحماء والتهدئة ثنائية، والقوة تبقى فردية لكل عضو</p>
                            )}
                            {wodBenchmarkName && (
                              <p className="text-xs text-gray-500 mt-1.5">غير متاح مع يوم البنشمارك</p>
                            )}
                          </div>

                          {/* قيود المعدات */}
                          <div>
                            <label className="text-xs text-gray-400 font-semibold block mb-2">🛠️ قيود المعدات اليوم (اختياري)</label>
                            <textarea value={wodEquipmentNote} onChange={e => setWodEquipmentNote(e.target.value)}
                              placeholder="مثال: بار أولمبي واحد فقط متاح اليوم&#10;مثال: لا يوجد Rig كافٍ لعدد كبير من العقلة دفعة واحدة"
                              rows={2}
                              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500 resize-none" />
                          </div>
                        </>
                      )}

                      {/* تعليمات خاصة */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">📝 تعليمات خاصة للـ AI</label>
                        <textarea value={wodSpecialNotes} onChange={e => setWodSpecialNotes(e.target.value)}
                          placeholder="مثال: الأعضاء مرهقون من أمس — اجعل الميتكون قصيراً&#10;مثال: ركّز على Power Clean اليوم مع ميتكون يتضمنه&#10;مثال: لا تمارين ظهر اليوم بسبب إصابات"
                          rows={3}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500 resize-none" />
                      </div>

                      {/* Reset */}
                      <button onClick={() => { setWodSessionType('balanced'); setWodMetconFormat(''); setWodStrengthPattern(''); setWodForbidExercises([]); setWodForceExercise(''); setWodSpecialNotes(''); setWodDuration(''); setAiDifficulty('متوسط'); setAiFocus(''); setWodClassDuration('60'); setWodEquipmentNote(''); setWodRxFocus('balanced'); setWodBenchmarkName(''); setWodPartnerMode(false); }}
                        className="w-full py-2 rounded-xl border border-gray-700 text-gray-400 text-xs font-semibold hover:border-gray-500 hover:text-gray-300 transition-all">
                        ↺ إعادة تعيين
                      </button>

                      {aiError && (
                        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-red-400 text-xs">⚠️ {aiError}</div>
                      )}

                      {/* Generate Button */}
                      <button onClick={generateAiWod} disabled={aiGenerating}
                        className={`w-full py-3.5 rounded-xl disabled:from-gray-700 disabled:to-gray-700 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                          wodMode === 'calisthenics'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/30'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/30'
                        }`}>
                        {aiGenerating ? (
                          <><span className="animate-spin">⚙️</span> يحلل الأسبوع ويولد التمرين...</>
                        ) : wodMode === 'calisthenics' ? (
                          <>🤸 توليد تمرين Calisthenics</>
                        ) : (
                          <>🤖 توليد WOD بـ Claude AI</>
                        )}
                      </button>
                      {aiGenerating && (
                        <p className="text-center text-xs text-purple-400 animate-pulse">🏋️ يتم تحليل الأسبوع الماضي وبناء تمرين متكامل...</p>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Theme Banner */}
                {aiTheme && !showAiPanel && (
                  <div className={`rounded-xl p-3 flex items-start gap-2 ${
                    aiGeneratedMode === 'calisthenics'
                      ? 'bg-emerald-900/20 border border-emerald-700/30'
                      : 'bg-purple-900/20 border border-purple-700/30'
                  }`}>
                    <span className={`mt-0.5 flex-shrink-0 ${aiGeneratedMode === 'calisthenics' ? 'text-emerald-400' : 'text-purple-400'}`}>
                      {aiGeneratedMode === 'calisthenics' ? '🤸' : '🔗'}
                    </span>
                    <div>
                      <div className={`text-xs font-semibold mb-0.5 ${aiGeneratedMode === 'calisthenics' ? 'text-emerald-400' : 'text-purple-400'}`}>
                        {aiGeneratedMode === 'calisthenics' ? 'هدف تمرين Calisthenics' : 'الرابط بين القوة والميتكون'}
                      </div>
                      <div className="text-xs text-gray-300">{aiTheme}</div>
                      {wodGeneratedCyclePhaseLabel && (
                        <div className="text-[11px] text-indigo-300 mt-1">📈 مرحلة الدورة المستخدمة: {wodGeneratedCyclePhaseLabel}</div>
                      )}
                      {wodGeneratedPartnerLabel && (
                        <div className="text-[11px] text-pink-300 mt-1">🤝 صيغة البارتنر: {wodGeneratedPartnerLabel}</div>
                      )}
                    </div>
                  </div>
                )}
                {wod.isPartnerWod && !aiTheme && (
                  <div className="rounded-xl p-3 flex items-center gap-2 bg-pink-900/20 border border-pink-700/30">
                    <span className="text-pink-400">🤝</span>
                    <span className="text-xs text-pink-300 font-semibold">هذا تمرين بارتنر محفوظ</span>
                  </div>
                )}
              </div>

              {/* WOD info */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">عنوان التمرين</label>
                  <input type="text" value={wod.title} onChange={e => setWod((p: any) => ({ ...p, title: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="مثال: تمرين يوم الاثنين — تحمل + قوة" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">نوع WOD</label>
                    <select value={wod.type} onChange={e => setWod((p: any) => ({ ...p, type: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                      {WOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">المدة (دقائق)</label>
                    <input type="number" value={wod.duration} onChange={e => setWod((p: any) => ({ ...p, duration: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                      placeholder="20" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">الراوندات</label>
                    <input type="number" value={wod.rounds} onChange={e => setWod((p: any) => ({ ...p, rounds: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                      placeholder="3" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">ملاحظات للأعضاء</label>
                  <input type="text" value={wod.notes} onChange={e => setWod((p: any) => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="مثال: ركّزوا على التقنية اليوم" />
                </div>
              </div>

              {/* Section tabs */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {sections.map(s => (
                  <button key={s.key} onClick={() => setActiveSection(s.key)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      activeSection === s.key ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}>
                    {s.label}
                    {wod[s.key]?.length > 0 && (
                      <span className="mr-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{wod[s.key].length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Exercise builder */}
              {sections.map(s => (
                <div key={s.key} className={activeSection === s.key ? 'space-y-3' : 'hidden'}>
                  {wod[s.key]?.map((ex: any, i: number) => {
                    const exInfo = exercises.find((e: any) => e.id === ex.exerciseId);
                    return (
                      <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-bold w-6">#{i + 1}</span>
                          <select value={ex.exerciseId}
                            onChange={e => updateExercise(s.key, i, 'exerciseId', e.target.value)}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                            <option value="">اختر التمرين</option>
                            {exercises.map((e: any) => (
                              <option key={e.id} value={e.id}>{e.nameAr} ({e.nameEn})</option>
                            ))}
                          </select>
                          <button onClick={() => removeExercise(s.key, i)}
                            className="w-8 h-8 rounded-lg bg-red-900 hover:bg-red-700 flex items-center justify-center text-sm transition-colors flex-shrink-0">
                            ×
                          </button>
                        </div>
                        {exInfo && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>💪 {exInfo.muscles}</span>
                            <span className="bg-gray-800 px-2 py-0.5 rounded-full">{exInfo.category}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={ex.reps} onChange={e => updateExercise(s.key, i, 'reps', e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                            placeholder="تكرارات (مثال: 21-15-9)" />
                          <input type="text" value={ex.weight} onChange={e => updateExercise(s.key, i, 'weight', e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                            placeholder="وزن (مثال: 60 كجم)" />
                          <input type="text" value={ex.distance} onChange={e => updateExercise(s.key, i, 'distance', e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                            placeholder="مسافة (مثال: 400م)" />
                          <input type="text" value={ex.time} onChange={e => updateExercise(s.key, i, 'time', e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                            placeholder="وقت (مثال: 3 دقائق)" />
                        </div>
                        <input type="text" value={ex.notes} onChange={e => updateExercise(s.key, i, 'notes', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                          placeholder="ملاحظة خاصة بهذا التمرين" />
                      </div>
                    );
                  })}
                  <button onClick={() => addExercise(s.key)}
                    className="w-full py-3 rounded-xl border border-dashed border-gray-700 text-gray-400 hover:border-orange-500 hover:text-orange-400 text-sm transition-colors">
                    + إضافة تمرين
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Weekly AI Plan */}
          {tab === 'weekly' && (
            <div className="space-y-4">

              {/* Header */}
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/40 rounded-2xl border border-indigo-700/40 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧠</span>
                  <div>
                    <h2 className="font-extrabold text-white text-base">التخطيط الأسبوعي بالذكاء الاصطناعي</h2>
                    <p className="text-xs text-indigo-300">يحلل التمارين السابقة ويبني خطة CrossFit احترافية</p>
                  </div>
                </div>
              </div>

              {/* Step 1 — نوع الخطة والتاريخ */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">① نوع الخطة والمدة</p>

                {/* Week Mode Toggle */}
                <div className="flex rounded-xl overflow-hidden border border-indigo-700/50">
                  <button onClick={() => setWeekMode('crossfit')}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${weekMode === 'crossfit' ? 'bg-indigo-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-gray-200'}`}>
                    🔥 CrossFit كامل
                  </button>
                  <button onClick={() => setWeekMode('mixed')}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${weekMode === 'mixed' ? 'bg-emerald-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-gray-200'}`}>
                    🤸 مختلط + Calisthenics
                  </button>
                </div>

                {weekMode === 'mixed' && (
                  <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-3 space-y-2">
                    <p className="text-xs text-emerald-300 font-semibold">🤸 عدد أيام Calisthenics</p>
                    <div className="flex gap-2">
                      {[1, 2].map(n => (
                        <button key={n} onClick={() => setCalisthenicsDays(n)}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${calisthenicsDays === n ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                          {n === 1 ? 'يوم واحد' : 'يومان'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">📅 من تاريخ</label>
                    <input type="date" value={weeklyFromDate} onChange={e => setWeeklyFromDate(e.target.value)}
                      className="w-full bg-gray-800 border border-indigo-700/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">عدد الأيام — <span className="text-indigo-300 font-semibold">{weeklyDays}</span></label>
                    <input type="range" min={1} max={30} step={1} value={weeklyDays}
                      onChange={e => setWeeklyDays(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer mt-2" />
                    <div className="flex gap-1 flex-wrap mt-1.5">
                      {[3,5,7,10,14,21,30].map(n => (
                        <button key={n} onClick={() => setWeeklyDays(n)}
                          className={`text-xs px-2 py-0.5 rounded-lg border transition-colors ${weeklyDays === n ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 — إعدادات المدرب */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <button onClick={() => setShowCoachOverride(o => !o)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚙️</span>
                    <div>
                      <p className="text-sm font-bold text-white">إعدادات المدرب المتقدمة</p>
                      <p className="text-xs text-gray-500">تركيز الأسبوع • الشدة • Hyrox • تمارين مخصصة</p>
                    </div>
                  </div>
                  <span className={`text-gray-500 text-sm transition-transform ${showCoachOverride ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showCoachOverride && (
                  <div className="border-t border-gray-800 p-4 space-y-4">

                    {/* المستوى العام */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">📊 المستوى العام للأسبوع</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { v: 'مبتدئ',  l: '🟢 مبتدئ' },
                          { v: 'متوسط',  l: '🔵 متوسط' },
                          { v: 'متقدم',  l: '🟠 متقدم' },
                          { v: 'نخبة',   l: '🔴 نخبة' },
                        ].map(d => (
                          <button key={d.v} onClick={() => setAiDifficulty(d.v)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${aiDifficulty === d.v ? 'border-indigo-500 bg-indigo-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                            {d.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* الجمهور المستهدف */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">👥 الجمهور المستهدف</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { v: 'all',       l: '👥 الكل' },
                          { v: 'beginners', l: '🟢 مبتدئون' },
                          { v: 'advanced',  l: '🔴 متقدمون' },
                        ].map(a => (
                          <button key={a.v} onClick={() => setTargetAudience(a.v)}
                            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${targetAudience === a.v ? 'border-blue-500 bg-blue-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                            {a.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* تركيز الأسبوع */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">🎯 تركيز الأسبوع</label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          { v: 'balanced',  l: '⚖️ متوازن',        sub: 'توزيع كلاسيكي HEAVY/MEDIUM/SKILL/REST' },
                          { v: 'strength',  l: '💪 أسبوع قوة',     sub: 'أحمال ثقيلة أكثر (80-90% 1RM) + ميتكون قصير' },
                          { v: 'cardio',    l: '🫀 أسبوع تحمل',    sub: 'ميتكون طويل AMRAP + أوزان معتدلة' },
                          { v: 'technique', l: '🎯 أسبوع تقنية',   sub: 'Olympic Lifting + Gymnastics skills' },
                          { v: 'deload',    l: '🔄 أسبوع تفريغ',   sub: '60-70% شدة — راحة واسترداد نشط' },
                        ].map(f => (
                          <button key={f.v} onClick={() => setCoachFocus(f.v)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-right text-sm transition-all ${coachFocus === f.v ? 'border-indigo-500 bg-indigo-900/30 text-white' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'}`}>
                            <span className="font-semibold flex-1">{f.l}</span>
                            <span className="text-xs text-gray-500">{f.sub}</span>
                            {coachFocus === f.v && <span className="text-indigo-400">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* تحيّز الشدة */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">🔥 تحيّز الشدة العامة</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { v: 'balanced', l: '⚖️ متوازن' },
                          { v: 'heavy',    l: '🔴 ثقيل' },
                          { v: 'moderate', l: '🟡 متوسط' },
                          { v: 'light',    l: '🟢 خفيف' },
                        ].map(i => (
                          <button key={i.v} onClick={() => setIntensityBias(i.v)}
                            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${intensityBias === i.v ? 'border-orange-500 bg-orange-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                            {i.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* أيام الراحة */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">
                        😴 أيام الراحة — <span className="text-white">{restDaysCount < 0 ? 'تلقائي (الـ AI يقرر)' : restDaysCount + ' أيام'}</span>
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {[-1, 0, 1, 2, 3, 4].map(n => (
                          <button key={n} onClick={() => setRestDaysCount(n)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${restDaysCount === n ? 'border-slate-400 bg-slate-700 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                            {n < 0 ? 'تلقائي' : n === 0 ? 'لا راحة' : n}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* أيام البارتنر */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">
                        🤝 أيام البارتنر — <span className="text-white">{weeklyPartnerDaysCount < 0 ? 'تلقائي (الـ AI يقرر 0 أو 1)' : weeklyPartnerDaysCount === 0 ? 'بدون' : weeklyPartnerDaysCount + ' يوم'}</span>
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {[-1, 0, 1, 2].map(n => (
                          <button key={n} onClick={() => setWeeklyPartnerDaysCount(n)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${weeklyPartnerDaysCount === n ? 'border-pink-500 bg-pink-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                            {n < 0 ? 'تلقائي' : n === 0 ? 'بدون' : n}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1.5">البارتنر صيغة تُعاد بها تنسيق يوم موجود أصلاً في تسلسل الأنماط (ليس يوماً إضافياً) — القوة تبقى فردية، والميتكون والإحماء والتهدئة ثنائية.</p>
                    </div>

                    {/* مرحلة دورة التدريج */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">
                        📈 مرحلة دورة التدريج {weeklyCyclePhaseOverride === 'auto' && wodCycleStatus ? <span className="text-white">— القادمة تلقائياً: {wodCycleStatus.nextPhaseLabel}</span> : null}
                      </label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {CYCLE_PHASE_OPTIONS.map(p => (
                          <button key={p.v} onClick={() => setWeeklyCyclePhaseOverride(p.v)}
                            className={`py-2 rounded-xl text-[11px] font-semibold border transition-all ${weeklyCyclePhaseOverride === p.v ? 'border-indigo-500 bg-indigo-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1.5">تلقائي = يتقدم للمرحلة التالية في دورة 4 أسابيع (تأسيس→بناء→ذروة→تفريغ) بناءً على آخر أسبوع مُولَّد. فرض "تفريغ" هنا يعادل تفعيل "أسبوع تفريغ" في التركيز الأسبوعي أعلاه لكن بأوزان مُدرَّجة فعلياً.</p>
                    </div>

                    {/* Hyrox toggle */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">🏁 Hyrox</label>
                      <button onClick={() => setHyroxMode(h => !h)}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold border transition-all ${hyroxMode ? 'border-red-500 bg-red-900/30 text-red-300' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                        {hyroxMode ? '✓ تفعيل يوم Hyrox (run + row + sled + burpee)' : 'إضافة يوم Hyrox للأسبوع'}
                      </button>
                    </div>

                    {/* مدة الحصة اليومية */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">🏛️ مدة الحصة اليومية</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {['45', '60', '75', '90'].map(d => (
                          <button key={d} onClick={() => setWeeklyClassDuration(d)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${weeklyClassDuration === d ? 'border-purple-500 bg-purple-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                            {d} د
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* التركيز RX/Scaled */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">🎯 تركيز الأسبوع RX/Scaled</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { v: 'balanced', l: '⚖️ متوازن' },
                          { v: 'rx',       l: '🔥 RX متمرس' },
                          { v: 'scaled',   l: '🌱 Scaled مبتدئين' },
                        ].map(r => (
                          <button key={r.v} onClick={() => setWeeklyRxFocus(r.v)}
                            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${weeklyRxFocus === r.v ? 'border-teal-500 bg-teal-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                            {r.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* يوم بنشمارك محدد */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">🏆 يوم بنشمارك محدد هذا الأسبوع (اختياري)</label>
                      <select value={weeklyBenchmarkName} onChange={e => setWeeklyBenchmarkName(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500">
                        <option value="">بدون — لا يوجد بنشمارك مفروض</option>
                        {BENCHMARK_OPTIONS.map(b => (
                          <option key={b.key} value={b.key}>{b.label} — {b.kind === 'hero' ? 'Hero WOD' : 'Girl WOD'}</option>
                        ))}
                      </select>
                      {weeklyBenchmarkName && (
                        <input type="date" value={weeklyBenchmarkDate} onChange={e => setWeeklyBenchmarkDate(e.target.value)}
                          min={weeklyFromDate}
                          className="w-full mt-2 bg-gray-800 border border-yellow-700/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
                      )}
                    </div>

                    {/* قيود المعدات */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">🛠️ قيود المعدات هذا الأسبوع (اختياري)</label>
                      <textarea value={weeklyEquipmentNote} onChange={e => setWeeklyEquipmentNote(e.target.value)}
                        placeholder="مثال: بار أولمبي واحد فقط متاح هذا الأسبوع&#10;مثال: صيانة الحلقات — تجنب Muscle-up"
                        rows={2}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500 resize-none" />
                    </div>

                    {/* تمارين محظورة */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">🚫 تمارين محظورة هذا الأسبوع</label>
                      <div className="flex gap-2">
                        <input value={forbidInput} onChange={e => setForbidInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addToForbid()}
                          placeholder="مثال: deadlift"
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500" />
                        <button onClick={addToForbid} className="px-3 py-2 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-xs font-bold hover:bg-red-900/60">+</button>
                      </div>
                      {forbidList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {forbidList.map(ex => (
                            <span key={ex} onClick={() => setForbidList(p => p.filter(x => x !== ex))}
                              className="text-xs px-2 py-0.5 bg-red-900/30 border border-red-700/40 text-red-300 rounded-lg cursor-pointer hover:bg-red-900/50">
                              {ex} ✕
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* تمارين مطلوبة */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">⚡ تمارين مطلوبة هذا الأسبوع</label>
                      <div className="flex gap-2">
                        <input value={forceInput} onChange={e => setForceInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addToForce()}
                          placeholder="مثال: snatch"
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-green-500" />
                        <button onClick={addToForce} className="px-3 py-2 bg-green-900/40 border border-green-700/50 rounded-xl text-green-300 text-xs font-bold hover:bg-green-900/60">+</button>
                      </div>
                      {forceList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {forceList.map(ex => (
                            <span key={ex} onClick={() => setForceList(p => p.filter(x => x !== ex))}
                              className="text-xs px-2 py-0.5 bg-green-900/30 border border-green-700/40 text-green-300 rounded-lg cursor-pointer hover:bg-green-900/50">
                              {ex} ✕
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* تعليمات خاصة */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">📝 تعليمات خاصة للـ AI</label>
                      <textarea value={coachSpecialNotes} onChange={e => setCoachSpecialNotes(e.target.value)}
                        placeholder="مثال: الأعضاء يستعدون لبطولة — ركّز على الوقت&#10;مثال: تجنب تمارين الظهر هذا الأسبوع&#10;مثال: أدرج EMOM يومياً"
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none" />
                    </div>

                    {/* Reset */}
                    <button onClick={() => { setCoachFocus('balanced'); setIntensityBias('balanced'); setRestDaysCount(-1); setHyroxMode(false); setTargetAudience('all'); setForbidList([]); setForceList([]); setCoachSpecialNotes(''); setAiDifficulty('متوسط'); setWeeklyClassDuration('60'); setWeeklyEquipmentNote(''); setWeeklyRxFocus('balanced'); setWeeklyBenchmarkName(''); setWeeklyBenchmarkDate(''); setWeeklyPartnerDaysCount(-1); }}
                      className="w-full py-2 rounded-xl border border-gray-700 text-gray-400 text-xs font-semibold hover:border-gray-500 hover:text-gray-300 transition-all">
                      ↺ إعادة تعيين لافتراضيات الـ AI
                    </button>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              {weeklyError && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-red-400 text-xs">⚠️ {weeklyError}</div>
              )}
              <button onClick={generateWeeklyPlan} disabled={weeklyLoading}
                className={`w-full py-4 rounded-2xl text-white font-extrabold text-base transition-all shadow-lg disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed ${
                  weekMode === 'mixed'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/30'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-900/30'
                }`}>
                {weeklyLoading ? (
                  <span className="flex items-center justify-center gap-2"><span className="animate-spin">⚙️</span> يحلل التمارين السابقة ويبني الخطة...</span>
                ) : weekMode === 'mixed' ? (
                  <><span>🤸</span> توليد أسبوع مختلط CrossFit + Calisthenics</>
                ) : (
                  <><span>🤖</span> توليد الخطة الأسبوعية</>
                )}
              </button>
              {weeklyLoading && (
                <p className="text-center text-xs text-indigo-400 animate-pulse">
                  📊 يحلل الذكاء الاصطناعي سجل التمارين ويوازن بين القوة والتحمل والراحة...
                </p>
              )}

              {/* Save button */}
              {weeklyPlan && (
                <button onClick={saveWeeklyPlan} disabled={savingPlan || planSaved}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                    planSaved ? 'bg-green-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}>
                  {planSaved ? '✅ تم الحفظ وإضافة التمارين للتقويم' : savingPlan ? '⏳ جاري الحفظ وإنشاء التمارين...' : '💾 حفظ الخطة وإضافتها للتقويم'}
                </button>
              )}

              {/* Saved Plans List */}
              {savedPlans.length > 0 && !weeklyPlan && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <span>📁</span> الخطط المحفوظة ({savedPlans.length})
                  </h3>
                  {savedLoading ? (
                    <div className="text-center text-gray-500 py-4 text-sm">جاري التحميل...</div>
                  ) : (
                    savedPlans.map(p => (
                      <div key={p.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white text-sm">{p.label}</span>
                          <div className="flex gap-2">
                            <button onClick={() => setViewingSaved(viewingSaved?.id === p.id ? null : p)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-900/30 px-3 py-1 rounded-lg transition-colors">
                              {viewingSaved?.id === p.id ? 'إخفاء' : 'عرض'}
                            </button>
                            <button onClick={() => setDeleteConfirm(p.id)}
                              className="text-xs text-red-400 hover:text-red-300 bg-red-900/20 px-2 py-1 rounded-lg transition-colors">
                              🗑
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(p.createdAt).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          {' · '}{p.days} أيام
                        </div>

                        {/* Expanded saved plan */}
                        {viewingSaved?.id === p.id && (
                          <div className="mt-4 space-y-3 border-t border-gray-800 pt-4">
                            {p.weekSummary && (
                              <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-3 text-xs text-gray-300">
                                📋 {p.weekSummary}
                              </div>
                            )}
                            {p.plan?.map((day: any, i: number) => {
                              const icons: Record<string, string> = { crossfit: '🔥', hyrox: '🏁', kettlebell: '🏋️', rest: '😴', active_recovery: '🧘' };
                              const colors: Record<string, string> = { crossfit: 'border-orange-700/40', hyrox: 'border-red-700/40', kettlebell: 'border-yellow-700/40', rest: 'border-blue-700/40', active_recovery: 'border-green-700/40' };
                              return (
                                <div key={i} className={`rounded-xl border p-3 bg-gray-800/50 ${colors[day.type] || 'border-gray-700'}`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span>{icons[day.type] || '📅'}</span>
                                    <span className="font-semibold text-white text-sm">{day.dayName}</span>
                                    <span className="text-xs text-gray-500">{day.date}</span>
                                    <span className="text-xs text-gray-400 mr-auto">{day.intensity}</span>
                                  </div>
                                  <div className="text-xs text-gray-300">{day.title}</div>
                                  {day.aiInsight && <div className="text-xs text-gray-500 mt-1">💡 {day.aiInsight}</div>}
                                </div>
                              );
                            })}
                            {p.nutritionNote && (
                              <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 text-xs text-gray-300">
                                🥗 {p.nutritionNote}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Weekly Plan Result */}
              {weeklyPlan && (
                <div className="space-y-4">
                  {weeklyPlan.cyclePhaseLabel && (
                    <div className={`rounded-xl border px-4 py-2.5 text-sm flex items-center gap-2 ${
                      weeklyPlan.autoDeloadTriggered ? 'bg-amber-900/30 border-amber-700/50 text-amber-200' : 'bg-indigo-900/20 border-indigo-700/40 text-indigo-200'
                    }`}>
                      <span>{weeklyPlan.autoDeloadTriggered ? '⚠️' : '📈'}</span>
                      <span>
                        هذا الأسبوع بُرمج على مرحلة: <span className="font-semibold text-white">{weeklyPlan.cyclePhaseLabel}</span>
                        {weeklyPlan.autoDeloadTriggered ? ' — فُرض تلقائياً بعد 4 أسابيع بدون تفريغ' : ''}
                        {weeklyPlan.weekIntensity ? ` — شدة الأسبوع الماضي: ${weeklyPlan.weekIntensity}` : ''}
                      </span>
                    </div>
                  )}
                  {weeklyPlan.weekSummary && (
                    <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-2xl p-4">
                      <h3 className="font-semibold text-indigo-300 mb-2">📋 فلسفة الأسبوع</h3>
                      <p className="text-sm text-gray-300">{weeklyPlan.weekSummary}</p>
                    </div>
                  )}
                  {weeklyPlan.progressionNote && (
                    <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-4">
                      <h3 className="font-semibold text-emerald-300 mb-2">🗒️ خطة الأسبوع القادم</h3>
                      <p className="text-sm text-gray-300">{weeklyPlan.progressionNote}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {weeklyPlan.wods?.map((wod: any, i: number) => {
                      const isRest = wod.isRest || wod.type === 'راحة' || wod.type === 'راحة نشطة';
                      const isCalis = wod.isCalisthenics === true;
                      const isPartner = wod.isPartnerWod === true;
                      const PARTNER_FORMAT_LABELS: Record<string, string> = {
                        you_go_i_go: 'أنت تعمل/أنا أعمل', synchro: 'متزامن', shared_reps: 'تكرارات مشتركة', relay_carry: 'تتابع وحمل',
                      };
                      const SECTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
                        warmup:    { label: 'الإحماء',    icon: '🔆', color: 'text-yellow-400' },
                        strength:  { label: 'القوة',      icon: '🏋️', color: 'text-blue-400' },
                        metcon:    { label: 'الـ WOD',    icon: '🔥', color: 'text-orange-400' },
                        accessory: { label: 'الأكسسوار', icon: '💪', color: 'text-purple-400' },
                        cooldown:  { label: 'التهدئة',    icon: '🧘', color: 'text-teal-400' },
                      };
                      return (
                        <div key={i} className={`rounded-2xl border overflow-hidden ${
                          isRest ? 'border-blue-700/30 bg-blue-900/10'
                          : isCalis ? 'border-emerald-700/50 bg-emerald-900/10'
                          : isPartner ? 'border-pink-700/50 bg-pink-900/10'
                          : 'border-gray-700 bg-gray-900'
                        }`}>
                          {/* Header */}
                          <div className={`p-4 border-b ${isCalis ? 'border-emerald-800/40' : isPartner ? 'border-pink-800/40' : 'border-gray-800'}`}>
                            {isCalis && (
                              <div className="mb-2 inline-flex items-center gap-1.5 bg-emerald-700/30 border border-emerald-600/40 rounded-full px-2.5 py-0.5 text-xs text-emerald-300 font-semibold">
                                🤸 يوم Calisthenics
                              </div>
                            )}
                            {isPartner && (
                              <div className="mb-2 inline-flex items-center gap-1.5 bg-pink-700/30 border border-pink-600/40 rounded-full px-2.5 py-0.5 text-xs text-pink-300 font-semibold">
                                🤝 يوم بارتنر — {PARTNER_FORMAT_LABELS[wod.partnerFormat] || wod.partnerFormat}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{isRest ? '😴' : isCalis ? '🤸' : isPartner ? '🤝' : '🔥'}</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">{wod.dayName}</span>
                                    <span className="text-xs text-gray-500">{wod.date}</span>
                                  </div>
                                  <div className="text-xs text-gray-400">{wod.titleEn || wod.title}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{wod.type}</span>
                                {wod.duration && <span className="text-xs text-gray-500">⏱ {wod.duration}د</span>}
                                {wod.rounds && <span className="text-xs text-gray-500">🔄 {wod.rounds}</span>}
                              </div>
                            </div>
                            {wod.aiTheme && (
                              <div className="mt-2 bg-purple-900/20 rounded-lg p-2 text-xs text-purple-300">
                                🔗 {wod.aiTheme}
                              </div>
                            )}
                            {wod.notes && (
                              <div className="mt-2 text-xs text-gray-400">📝 {wod.notes}</div>
                            )}
                          </div>

                          {/* Sections */}
                          {!isRest && (
                            <div className="p-4 space-y-4">
                              {(['warmup', 'strength', 'metcon', 'accessory', 'cooldown'] as const).map(sec => {
                                const items = ((wod as any)[sec] || []).filter((e: any) => e.exerciseId);
                                if (!items.length) return null;
                                const { label, icon, color } = SECTION_LABELS[sec];
                                return (
                                  <div key={sec}>
                                    <h4 className={`font-semibold text-xs mb-2 flex items-center gap-1 ${color}`}>
                                      <span>{icon}</span>{label} ({items.length})
                                    </h4>
                                    <div className="space-y-1">
                                      {items.map((ex: any, j: number) => (
                                        <div key={j} className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2 text-xs">
                                          <span className="text-gray-500 font-mono w-4">{j + 1}</span>
                                          <span className="text-white font-medium flex-1">{ex.exerciseId}</span>
                                          {ex.reps && <span className="text-orange-300 bg-orange-900/30 px-2 py-0.5 rounded">{ex.reps}</span>}
                                          {ex.weight && <span className="text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded">{ex.weight}</span>}
                                          {ex.notes && <span className="text-gray-400">· {ex.notes}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {weeklyPlan.recoveryTips?.length > 0 && (
                    <div className="bg-green-900/20 border border-green-700/30 rounded-2xl p-4">
                      <h3 className="font-semibold text-green-400 mb-2">🌿 نصائح التعافي</h3>
                      {weeklyPlan.recoveryTips.map((t: string, i: number) => (
                        <div key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-green-400">•</span>{t}</div>
                      ))}
                    </div>
                  )}
                  {weeklyPlan.nutritionNote && (
                    <div className="bg-amber-900/20 border border-amber-700/30 rounded-2xl p-4">
                      <h3 className="font-semibold text-amber-400 mb-2">🥗 التغذية</h3>
                      <p className="text-sm text-gray-300">{weeklyPlan.nutritionNote}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Fix Cooldown Section */}
              <div className="bg-gray-900 border border-yellow-700/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧘</span>
                  <div>
                    <h2 className="font-bold text-yellow-300 text-base">إصلاح التهدئة للجلسات الحالية</h2>
                    <p className="text-xs text-gray-400">يصلح قسم التهدئة فقط للجلسات المولَّدة دون إعادة توليد التمرين كاملاً</p>
                  </div>
                </div>
                <div className="flex gap-3 items-end flex-wrap">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">من تاريخ</label>
                    <input type="date" value={fixCooldownFrom} onChange={e => setFixCooldownFrom(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">إلى تاريخ</label>
                    <input type="date" value={fixCooldownTo} onChange={e => setFixCooldownTo(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
                  </div>
                  <button onClick={handleFixCooldown} disabled={fixCooldownLoading}
                    className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors">
                    {fixCooldownLoading ? '⏳ جاري الإصلاح...' : '🔧 إصلاح التهدئة'}
                  </button>
                </div>
                {fixCooldownError && (
                  <p className="text-red-400 text-sm">{fixCooldownError}</p>
                )}
                {fixCooldownResult && (
                  <div className="bg-gray-800 rounded-xl p-4 space-y-2">
                    <p className="text-green-400 font-semibold text-sm">
                      تم إصلاح {fixCooldownResult.fixed} من أصل {fixCooldownResult.total} جلسة
                    </p>
                    <div className="space-y-1">
                      {fixCooldownResult.results?.map((r: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-400">{r.date}</span>
                          <span className={r.status.startsWith('تم') ? 'text-green-400' : r.status.startsWith('خطأ') ? 'text-red-400' : 'text-gray-500'}>{r.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sports Weekly Plans */}
          {tab === 'sports' && (
            <div className="space-y-4">
              {/* Sport selector */}
              <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
                {([
                  { id: 'hyrox',       label: '🏁 Hyrox',       active: 'bg-red-600' },
                  { id: 'kettlebell',  label: '🔔 Kettlebell',   active: 'bg-yellow-600' },
                  { id: 'calisthenics',label: '🤸 Calisthenics', active: 'bg-emerald-600' },
                ] as const).map(s => (
                  <button key={s.id}
                    onClick={() => { setSportsTab(s.id); setSportsPlan(null); setSportsSaved(false); setSportsError(''); setSportsCoachFocus('balanced'); setSportsIntensityBias('balanced'); setSportsRestDays(-1); setSportsSpecialNotes(''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${sportsTab === s.id ? s.active + ' text-white' : 'text-gray-400 hover:text-white'}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Settings — Step 1 */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">① الإعدادات الأساسية</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">📅 من تاريخ</label>
                    <input type="date" value={sportsFromDate} onChange={e => setSportsFromDate(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">عدد الأيام — <span className="text-emerald-300 font-bold">{sportsDays}</span></label>
                    <div className="flex gap-1.5 flex-wrap mt-1">
                      {[3,4,5,6,7].map(n => (
                        <button key={n} onClick={() => setSportsDays(n)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${sportsDays === n ? 'border-emerald-500 bg-emerald-900/40 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">📊 المستوى العام</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DIFFICULTY_OPTIONS.map(d => (
                      <button key={d} onClick={() => setSportsDifficulty(d)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${sportsDifficulty === d ? 'border-emerald-500 bg-emerald-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coach Override — Step 2 */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <button onClick={() => setShowSportsOverride(o => !o)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚙️</span>
                    <div>
                      <p className="text-sm font-bold text-white">إعدادات المدرب المتقدمة</p>
                      <p className="text-xs text-gray-500">
                        {sportsTab === 'hyrox' ? 'تركيز الأسبوع • محاكاة السباق • هدف الأسبوع' : sportsTab === 'kettlebell' ? 'تركيز الأسبوع • حدث الأولوية • الشدة' : 'تركيز الأسبوع • مهارة الأولوية • الشدة'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-gray-500 text-sm transition-transform ${showSportsOverride ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showSportsOverride && (
                  <div className="border-t border-gray-800 p-4 space-y-4">

                    {/* تركيز الأسبوع — حسب الرياضة */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">🎯 تركيز الأسبوع</label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {sportsTab === 'hyrox' && [
                          { v: 'balanced',   l: '⚖️ متوازن',          sub: 'strength + simulation + running + rest' },
                          { v: 'strength',   l: '💪 أسبوع قوة',       sub: 'Deadlift/Squat ثقيل + محطات بـ 90-100%' },
                          { v: 'endurance',  l: '🫀 أسبوع تحمل',     sub: 'Running intervals + Zone 2 + محطات خفيفة' },
                          { v: 'simulation', l: '🏁 أسبوع محاكاة',    sub: 'جلستان Simulation كاملتان' },
                          { v: 'deload',     l: '🔄 أسبوع تفريغ',     sub: '60-70% شدة — راحة واسترداد' },
                        ].map(f => (
                          <button key={f.v} onClick={() => setSportsCoachFocus(f.v)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-right text-sm transition-all ${sportsCoachFocus === f.v ? 'border-red-500 bg-red-900/20 text-white' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'}`}>
                            <span className="font-semibold flex-1">{f.l}</span>
                            <span className="text-xs text-gray-500">{f.sub}</span>
                            {sportsCoachFocus === f.v && <span className="text-red-400">✓</span>}
                          </button>
                        ))}
                        {sportsTab === 'kettlebell' && [
                          { v: 'balanced',      l: '⚖️ متوازن',             sub: 'biathlon + strength + conditioning' },
                          { v: 'biathlon',      l: '🔔 أسبوع ثنائي الحدث', sub: 'Jerk + Snatch بحجم عالٍ' },
                          { v: 'snatch',        l: '⚡ أسبوع الخطف',        sub: 'Snatch فقط بتقنية عالية' },
                          { v: 'longcycle',     l: '🔄 أسبوع Long Cycle',   sub: 'Clean & Jerk بأثقال متصاعدة' },
                          { v: 'strength',      l: '💪 أسبوع قوة',          sub: 'KB Deadlift/Press/Squat ثقيل' },
                          { v: 'conditioning',  l: '🔥 أسبوع تكييف',        sub: 'دوائر GPP عالية الشدة' },
                        ].map(f => (
                          <button key={f.v} onClick={() => setSportsCoachFocus(f.v)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-right text-sm transition-all ${sportsCoachFocus === f.v ? 'border-yellow-500 bg-yellow-900/20 text-white' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'}`}>
                            <span className="font-semibold flex-1">{f.l}</span>
                            <span className="text-xs text-gray-500">{f.sub}</span>
                            {sportsCoachFocus === f.v && <span className="text-yellow-400">✓</span>}
                          </button>
                        ))}
                        {sportsTab === 'calisthenics' && [
                          { v: 'balanced',  l: '⚖️ متوازن',         sub: 'strength + skills + endurance' },
                          { v: 'strength',  l: '💪 أسبوع قوة',      sub: 'Pull/Push/Dips بوزن إضافي' },
                          { v: 'skills',    l: '🎯 أسبوع مهارات',   sub: 'Handstand/Muscle-up/Lever تقنية' },
                          { v: 'endurance', l: '🔥 أسبوع تحمل',     sub: 'circuits عالية التكرار، EMOM' },
                          { v: 'mixed',     l: '⚡ أسبوع مختلط',    sub: 'قوة + مهارة + تحمل' },
                        ].map(f => (
                          <button key={f.v} onClick={() => setSportsCoachFocus(f.v)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-right text-sm transition-all ${sportsCoachFocus === f.v ? 'border-emerald-500 bg-emerald-900/20 text-white' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'}`}>
                            <span className="font-semibold flex-1">{f.l}</span>
                            <span className="text-xs text-gray-500">{f.sub}</span>
                            {sportsCoachFocus === f.v && <span className="text-emerald-400">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hyrox: إعدادات خاصة */}
                    {sportsTab === 'hyrox' && (
                      <>
                        <div>
                          <label className="text-xs text-gray-400 font-semibold block mb-2">🏁 فئة السباق المستهدفة</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {['', 'HYROX Open', 'HYROX Pro', 'HYROX Doubles'].map(ev => (
                              <button key={ev} onClick={() => setHyroxTargetEvent(ev)}
                                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${hyroxTargetEvent === ev ? 'border-red-500 bg-red-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                                {ev || 'عام'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 font-semibold block mb-2">🏁 يوم محاكاة السباق</label>
                          <button onClick={() => setHyroxIncludeSimulation(h => !h)}
                            className={`w-full py-2.5 rounded-xl text-sm font-bold border transition-all ${hyroxIncludeSimulation ? 'border-red-500 bg-red-900/30 text-red-300' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                            {hyroxIncludeSimulation ? '✓ تفعيل — أدرج جلسة Simulation هذا الأسبوع' : 'بدون Simulation هذا الأسبوع'}
                          </button>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 font-semibold block mb-2">🎯 هدف الأسبوع</label>
                          <input value={hyroxWeekGoal} onChange={e => setHyroxWeekGoal(e.target.value)}
                            placeholder="مثال: تحسين وقت الـ 1km / رفع Farmer Carry 2×28كجم"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500" />
                        </div>
                      </>
                    )}

                    {/* Kettlebell: حدث الأولوية */}
                    {sportsTab === 'kettlebell' && (
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">🔔 حدث الأولوية للبطولة القادمة</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {['', 'biathlon', 'snatch', 'longcycle'].map(ev => (
                            <button key={ev} onClick={() => setKbPriorityEvent(ev)}
                              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${kbPriorityEvent === ev ? 'border-yellow-500 bg-yellow-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                              {ev === '' ? 'لا أولوية' : ev === 'biathlon' ? 'Biathlon' : ev === 'snatch' ? 'Snatch' : 'Long Cycle'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Calisthenics: مهارة الأولوية */}
                    {sportsTab === 'calisthenics' && (
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">🎯 مهارة الأولوية هذا الأسبوع</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {['', 'handstand', 'muscle-up', 'front-lever', 'back-lever', 'planche'].map(sk => (
                            <button key={sk} onClick={() => setCalisSkillFocus(sk)}
                              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${calisSkillFocus === sk ? 'border-emerald-500 bg-emerald-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                              {sk === '' ? 'لا أولوية' : sk === 'handstand' ? '🤸 Handstand' : sk === 'muscle-up' ? '💪 Muscle-up' : sk === 'front-lever' ? '📐 Front Lever' : sk === 'back-lever' ? '📐 Back Lever' : '🏋️ Planche'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* تحيّز الشدة */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">🔥 تحيّز الشدة العامة</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { v: 'balanced', l: '⚖️ متوازن' },
                          { v: 'heavy',    l: '🔴 ثقيل' },
                          { v: 'moderate', l: '🟡 متوسط' },
                          { v: 'light',    l: '🟢 خفيف' },
                        ].map(i => (
                          <button key={i.v} onClick={() => setSportsIntensityBias(i.v)}
                            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${sportsIntensityBias === i.v ? 'border-orange-500 bg-orange-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                            {i.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* أيام الراحة */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">
                        😴 أيام الراحة — <span className="text-white">{sportsRestDays < 0 ? 'تلقائي' : sportsRestDays}</span>
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {[-1, 0, 1, 2, 3].map(n => (
                          <button key={n} onClick={() => setSportsRestDays(n)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${sportsRestDays === n ? 'border-slate-400 bg-slate-700 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                            {n < 0 ? 'تلقائي' : n === 0 ? 'لا راحة' : n}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* تعليمات خاصة */}
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">📝 تعليمات خاصة للـ AI</label>
                      <textarea value={sportsSpecialNotes} onChange={e => setSportsSpecialNotes(e.target.value)}
                        placeholder={sportsTab === 'hyrox' ? 'مثال: الأعضاء يستعدون لسباق بعد أسبوعين — خفف الحجم&#10;مثال: ركّز على Ski Erg هذا الأسبوع' : sportsTab === 'kettlebell' ? 'مثال: 10 دقائق Jerk كحد أدنى في كل جلسة حدث&#10;مثال: الأعضاء ضعفاء في التنفس — ركّز عليه' : 'مثال: ركّز على جودة Hollow Body في كل تمرين&#10;مثال: لا وزن إضافي هذا الأسبوع للمصابين'}
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none" />
                    </div>

                    {/* Reset */}
                    <button onClick={() => { setSportsCoachFocus('balanced'); setSportsIntensityBias('balanced'); setSportsRestDays(-1); setSportsSpecialNotes(''); setHyroxTargetEvent(''); setHyroxWeekGoal(''); setHyroxIncludeSimulation(true); setKbPriorityEvent(''); setCalisSkillFocus(''); }}
                      className="w-full py-2 rounded-xl border border-gray-700 text-gray-400 text-xs font-semibold hover:border-gray-500 hover:text-gray-300 transition-all">
                      ↺ إعادة تعيين لافتراضيات الـ AI
                    </button>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              {sportsError && <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-3 py-2.5 text-sm text-red-400">❌ {sportsError}</div>}
              <button onClick={generateSportsPlan} disabled={sportsLoading}
                className={`w-full py-4 rounded-2xl text-white font-extrabold text-base transition-all shadow-lg disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed ${
                  sportsTab === 'hyrox' ? 'bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 shadow-red-900/30'
                  : sportsTab === 'kettlebell' ? 'bg-gradient-to-r from-yellow-700 to-amber-700 hover:from-yellow-600 hover:to-amber-600 shadow-yellow-900/30'
                  : 'bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-900/30'
                }`}>
                {sportsLoading ? (
                  <span className="flex items-center justify-center gap-2"><span className="animate-spin">⚙️</span> جاري التوليد...</span>
                ) : (
                  <><span>🤖</span> توليد الخطة الأسبوعية — {sportsTab === 'hyrox' ? 'HYROX' : sportsTab === 'kettlebell' ? 'Kettlebell' : 'Calisthenics'}</>
                )}
              </button>

              {/* Results */}
              {sportsPlan && (
                <div className="space-y-3">
                  {/* Summary */}
                  {sportsPlan.weekSummary && (
                    <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-3 text-xs text-emerald-300">
                      🎯 {sportsPlan.weekSummary}
                    </div>
                  )}

                  {/* Sessions */}
                  {(sportsPlan.sessions || []).map((s: any, i: number) => (
                    <div key={i} className={`rounded-xl border p-3 space-y-1 ${s.isRest ? 'border-gray-700 bg-gray-900/40' : 'border-emerald-700/30 bg-emerald-900/10'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.isRest ? 'bg-gray-700 text-gray-400' : 'bg-emerald-700/40 text-emerald-300'}`}>
                            {s.isRest ? '😴 راحة' : sportsTab === 'hyrox' ? s.sessionType : sportsTab === 'kettlebell' ? s.eventType : s.sessionType}
                          </span>
                          <span className="text-xs text-gray-400">{s.dayName}</span>
                        </div>
                        <span className="text-xs text-gray-500">{s.date}</span>
                      </div>
                      {!s.isRest && (
                        <>
                          <div className="text-sm font-semibold text-white">{s.title}</div>
                          {s.coachNote && <div className="text-xs text-gray-400">💬 {s.coachNote}</div>}
                          <div className="flex gap-2 flex-wrap mt-1">
                            {s.difficulty && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{s.difficulty}</span>}
                            {s.totalDuration && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">⏱ {s.totalDuration} د</span>}
                            {s.focus && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{s.focus}</span>}
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Save button */}
                  <button onClick={saveSportsPlan} disabled={sportsSaving || sportsSaved}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${sportsSaved ? 'bg-green-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50'}`}>
                    {sportsSaved ? '✅ تم الحفظ — ستظهر في سجل التمارين' : sportsSaving ? '⏳ جاري الحفظ...' : '💾 حفظ الخطة في التقويم'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Members management */}
          {tab === 'members' && (
            <div className="space-y-4">
              {/* Add member form */}
              <div className="bg-gray-900 rounded-2xl p-4 border border-purple-700 space-y-3">
                <h2 className="font-semibold text-purple-400">إضافة عضو جديد</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">الاسم بالعربي</label>
                    <input type="text" value={newMember.nameAr} onChange={e => setNewMember(p => ({ ...p, nameAr: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                      placeholder="مثال: محمد أحمد" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">اسم المستخدم</label>
                    <input type="text" value={newMember.username} onChange={e => setNewMember(p => ({ ...p, username: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                      placeholder="مثال: mohammed" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">كلمة المرور</label>
                  <input type="text" value={newMember.password} onChange={e => setNewMember(p => ({ ...p, password: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="كلمة مرور مؤقتة" />
                </div>
                <button onClick={addMember} disabled={!newMember.nameAr || !newMember.username || !newMember.password || addingMember}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
                  {addingMember ? 'جاري الإضافة...' : 'إضافة العضو 👥'}
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  placeholder="🔍 بحث بالاسم أو اسم المستخدم..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                />
                {memberSearch && (
                  <button onClick={() => setMemberSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs">✕</button>
                )}
              </div>

              {/* Members list */}
              {membersLoading ? (
                <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
              ) : (
                <div className="space-y-3">
                  {members
                    .filter(m => !memberSearch || m.nameAr.includes(memberSearch) || m.username.toLowerCase().includes(memberSearch.toLowerCase()))
                    .map(m => {
                      const st = memberStats.find(s => s.id === m.id);
                      const isExpanded = expandedMember === m.id;
                      const isResetting = resetPwdId === m.id;
                      return (
                        <div key={m.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                          {/* Header row */}
                          <div className="p-4 flex items-center gap-3">
                            <span className="text-2xl">{m.avatar}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white flex items-center gap-2">
                                {m.nameAr}
                                {m.role === 'admin' && <span className="text-xs bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded-full">👑 مدير</span>}
                              </div>
                              <div className="text-xs text-gray-400">@{m.username} • انضم {m.joinDate}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Impersonate button (non-admin members only) */}
                              {m.role !== 'admin' && (
                                <button
                                  onClick={() => impersonateMember(m.id, m.nameAr)}
                                  disabled={impersonating === m.id}
                                  className="text-xs bg-indigo-900/50 hover:bg-indigo-700/60 border border-indigo-700/50 text-indigo-300 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                                  title="الدخول كهذا العضو"
                                >
                                  {impersonating === m.id ? '⏳' : '🎭 دخول'}
                                </button>
                              )}
                              {/* Expand toggle */}
                              <button
                                onClick={() => setExpandedMember(isExpanded ? null : m.id)}
                                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-sm transition-colors"
                              >
                                {isExpanded ? '▲' : '▼'}
                              </button>
                              {/* Delete */}
                              {m.id !== 'admin' && (
                                <button onClick={() => deleteMember(m.id)}
                                  className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-red-800 flex items-center justify-center text-sm transition-colors">
                                  🗑
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Stats row */}
                          {st && (
                            <div className="grid grid-cols-4 gap-0 border-t border-gray-800">
                              {[
                                { label: 'هذا الشهر', value: st.monthSessions, unit: 'جلسة', color: 'text-orange-400' },
                                { label: 'الإجمالي',  value: st.totalSessions, unit: 'جلسة', color: 'text-blue-400' },
                                { label: 'الأرقام',   value: st.totalPRs,      unit: 'PR',   color: 'text-yellow-400' },
                                { label: 'الاستمرار', value: st.streak,        unit: 'يوم',  color: 'text-green-400' },
                              ].map((item, i) => (
                                <div key={item.label} className={`p-2 text-center ${i < 3 ? 'border-l border-gray-800' : ''}`}>
                                  <div className={`text-base font-bold ${item.color}`}>{item.value}</div>
                                  <div className="text-[10px] text-gray-500">{item.label}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Expanded section */}
                          {isExpanded && (
                            <div className="p-4 space-y-4 border-t border-gray-800 bg-gray-950/40">

                              {/* Permissions */}
                              {m.role !== 'admin' && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-2">🔐 الصلاحيات</div>
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() => togglePermission(m.id, 'canViewWods', m.canViewWods !== false)}
                                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                                        m.canViewWods !== false
                                          ? 'bg-green-900/40 border-green-700/50 text-green-400'
                                          : 'bg-red-900/40 border-red-700/50 text-red-400'
                                      }`}
                                    >
                                      {m.canViewWods !== false ? '✅' : '🚫'} سجل التمارين
                                    </button>
                                    <button
                                      onClick={() => togglePermission(m.id, 'canGenerateWod', m.canGenerateWod !== false)}
                                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                                        m.canGenerateWod !== false
                                          ? 'bg-green-900/40 border-green-700/50 text-green-400'
                                          : 'bg-red-900/40 border-red-700/50 text-red-400'
                                      }`}
                                    >
                                      {m.canGenerateWod !== false ? '✅' : '🚫'} توليد التمرين
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Reset password */}
                              {m.role !== 'admin' && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-2">🔑 إعادة تعيين كلمة المرور</div>
                                  {!isResetting ? (
                                    <button
                                      onClick={() => { setResetPwdId(m.id); setResetPwdValue(''); }}
                                      className="text-xs bg-orange-900/30 border border-orange-700/40 text-orange-400 px-3 py-1.5 rounded-lg hover:bg-orange-800/40 transition-colors"
                                    >
                                      تغيير كلمة المرور
                                    </button>
                                  ) : (
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={resetPwdValue}
                                        onChange={e => setResetPwdValue(e.target.value)}
                                        placeholder="كلمة المرور الجديدة (4+ أحرف)"
                                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-500"
                                        onKeyDown={e => e.key === 'Enter' && resetPassword(m.id)}
                                      />
                                      <button
                                        onClick={() => resetPassword(m.id)}
                                        disabled={resetPwdLoading || resetPwdValue.length < 4}
                                        className="text-xs bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                                      >
                                        {resetPwdLoading ? '...' : 'حفظ'}
                                      </button>
                                      <button onClick={() => setResetPwdId(null)} className="text-xs text-gray-500 px-2 hover:text-white">إلغاء</button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Admin notes */}
                              <div>
                                <div className="text-xs text-gray-500 mb-2">📝 ملاحظات المدرب</div>
                                <textarea
                                  value={memberNotes[m.id] ?? ((m as any).adminNotes || '')}
                                  onChange={e => setMemberNotes(p => ({ ...p, [m.id]: e.target.value }))}
                                  placeholder="أضف ملاحظاتك عن هذا العضو كمدرب..."
                                  rows={3}
                                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                                />
                                <button
                                  onClick={() => saveMemberNotes(m.id)}
                                  disabled={savingNotes === m.id}
                                  className="mt-2 text-xs bg-purple-700 hover:bg-purple-600 disabled:bg-gray-700 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
                                >
                                  {savingNotes === m.id ? 'جاري الحفظ...' : '💾 حفظ الملاحظات'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  {members.filter(m => !memberSearch || m.nameAr.includes(memberSearch) || m.username.toLowerCase().includes(memberSearch.toLowerCase())).length === 0 && (
                    <div className="text-center text-gray-500 py-8">لا توجد نتائج</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Login Logs */}
          {tab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white flex items-center gap-2">📋 سجل الدخول للمنصة</h2>
                <button onClick={clearLogs} className="text-xs text-red-400 hover:text-red-300 bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors">
                  🗑 مسح السجل
                </button>
              </div>

              {/* Sub tabs */}
              <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
                <button onClick={() => setLogsTab('stats')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${logsTab === 'stats' ? 'bg-teal-600 text-white' : 'text-gray-400'}`}>
                  📊 إحصائيات الأعضاء
                </button>
                <button onClick={() => setLogsTab('detail')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${logsTab === 'detail' ? 'bg-teal-600 text-white' : 'text-gray-400'}`}>
                  🕒 السجل التفصيلي
                </button>
              </div>

              {logsLoading ? (
                <div className="text-center text-gray-500 py-12">جاري التحميل...</div>
              ) : logsTab === 'stats' ? (
                /* ===== إحصائيات لكل عضو ===== */
                <div className="space-y-3">
                  {logStats.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">لا توجد بيانات بعد — انتظر أول دخول للأعضاء</div>
                  ) : logStats.map((s, i) => (
                    <div key={s.memberId} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-teal-400 w-8">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white">{s.memberName}</div>
                          <div className="text-xs text-gray-500">@{s.username} • {s.role === 'admin' ? '👑 مدير' : '🏋️ عضو'}</div>
                        </div>
                        <div className="text-center flex-shrink-0">
                          <div className="text-2xl font-bold text-teal-400">{s.totalLogins}</div>
                          <div className="text-xs text-gray-500">دخول</div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>
                          <span className="text-gray-600">أول دخول: </span>
                          <span className="text-gray-400">{new Date(s.firstLogin).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">آخر دخول: </span>
                          <span className="text-teal-400 font-medium">{new Date(s.lastLogin).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })} — {new Date(s.lastLogin).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ===== السجل التفصيلي ===== */
                <div className="space-y-3">
                  {/* فلتر */}
                  <input
                    value={logFilter}
                    onChange={e => setLogFilter(e.target.value)}
                    placeholder="🔍 ابحث باسم العضو أو اسم المستخدم..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500"
                  />
                  <div className="text-xs text-gray-600 text-left">{logs.length} سجل</div>
                  {logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">لا توجد سجلات</div>
                  ) : (
                    <div className="space-y-2">
                      {logs
                        .filter(l => !logFilter || l.memberName?.includes(logFilter) || l.username?.includes(logFilter))
                        .map((l, i) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-900 rounded-xl border border-gray-800 px-4 py-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-sm">{l.memberName}</span>
                                <span className="text-xs text-gray-600">@{l.username}</span>
                                {l.role === 'admin' && <span className="text-xs bg-purple-900/40 text-purple-300 px-1.5 rounded">مدير</span>}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                🌐 {l.ip !== 'unknown' ? l.ip : 'غير معروف'}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-teal-400 font-medium">
                                {new Date(l.loginAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="text-xs text-gray-600">
                                {new Date(l.loginAt).toLocaleDateString('ar-SA', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* ===== Gym Technogym ===== */}
          {tab === 'gym' && (
            <div className="space-y-4">

              {/* Header */}
              <div className="bg-gradient-to-br from-violet-900/50 to-indigo-900/40 rounded-2xl border border-violet-700/40 p-4">
                <h2 className="font-extrabold text-white text-base">🏛️ توليد جدول Technogym</h2>
                <p className="text-xs text-violet-300 mt-0.5">اختر العضو وخصّص الإعدادات كمدرب قبل التوليد</p>
              </div>

              {/* Step 1 — Member + Date */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">① اختيار العضو والتاريخ</p>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">العضو</label>
                  <select value={gymSelectedMember}
                    onChange={e => { setGymSelectedMember(e.target.value); setGymPlan(null); setGymSaved(false); setGymError(''); }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500">
                    <option value="">-- اختر عضو --</option>
                    {gymMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.nameAr} (@{m.username})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">📅 تاريخ بداية الجدول</label>
                  <input type="date" value={gymFromDate} onChange={e => setGymFromDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500" />
                </div>

                {/* بروفايل العضو المحفوظ */}
                {gymSelectedMember && !gymProfile && (
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl px-3 py-2.5 text-sm text-yellow-400 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>العضو لم يعبّئ بروفايله — يمكنك إنشاء إعداداته يدوياً أدناه</span>
                  </div>
                )}
                {gymSelectedMember && gymProfile && (
                  <div className="bg-gray-800/60 rounded-xl border border-gray-700/40 px-3 py-2.5 space-y-1.5">
                    <p className="text-xs text-gray-500 font-semibold">بروفايل العضو المحفوظ:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: gymProfile.goal, bg: 'bg-violet-900/50 text-violet-300 border-violet-700/40' },
                        { label: gymProfile.level, bg: 'bg-blue-900/50 text-blue-300 border-blue-700/40' },
                        { label: gymProfile.daysPerWeek + ' أيام', bg: 'bg-green-900/50 text-green-300 border-green-700/40' },
                        { label: gymProfile.gender === 'female' ? 'أنثى' : 'ذكر', bg: 'bg-gray-700/60 text-gray-300 border-gray-600/40' },
                        gymProfile.age ? { label: gymProfile.age + ' سنة', bg: 'bg-gray-700/60 text-gray-400 border-gray-600/40' } : null,
                        gymProfile.weight ? { label: gymProfile.weight + 'كجم', bg: 'bg-gray-700/60 text-gray-400 border-gray-600/40' } : null,
                      ].filter(Boolean).map((b: any, i: number) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-lg border ${b.bg}`}>{b.label}</span>
                      ))}
                    </div>
                    {gymProfile.focusAreas?.length > 0 && (
                      <p className="text-xs text-gray-400">💪 {gymProfile.focusAreas.join(' • ')}</p>
                    )}
    {gymProfile.limitations && (
                      <p className="text-xs text-yellow-500">⚠️ {gymProfile.limitations}</p>
                    )}
                  </div>
                )}
              </div>

              {/* شريط دورة التدريج الشخصية لهذا العضو */}
              {gymSelectedMember && gymCycleStatus && (
                <div className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${
                  gymCycleStatus.autoDeloadTriggered
                    ? 'bg-amber-900/30 border-amber-700/50 text-amber-200'
                    : 'bg-indigo-900/20 border-indigo-700/40 text-indigo-200'
                }`}>
                  <span className="text-lg leading-none">{gymCycleStatus.autoDeloadTriggered ? '⚠️' : '📈'}</span>
                  <div className="flex-1 leading-relaxed">
                    <div className="font-semibold text-white">
                      دورة التدريج القادمة لهذا العضو: {gymCycleStatus.nextPhaseLabel} — {gymCycleStatus.nextPhaseInfo?.pctLabel}
                    </div>
                    <div className="text-xs opacity-80 mt-0.5">{gymCycleStatus.nextPhaseInfo?.description}</div>
                    {gymCycleStatus.autoDeloadTriggered && (
                      <div className="text-xs mt-1 text-amber-300">سيُفرض أسبوع تفريغ تلقائياً لهذا العضو (4 أسابيع منذ آخر تفريغ له) — يمكن تجاوز ذلك من "فرض مرحلة الدورة" أدناه</div>
                    )}
                    {gymCycleStatus.latest && (
                      <div className="text-xs opacity-70 mt-1">آخر أسبوع مُولَّد له: {gymCycleStatus.latest.weekStartDate}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2 — Coach Overrides */}
              {gymSelectedMember && gymOverride && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                  <button onClick={() => setGymShowOverride(o => !o)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚙️</span>
                      <div>
                        <p className="text-sm font-bold text-white">إعدادات المدرب</p>
                        <p className="text-xs text-gray-500">تعديل الخيارات قبل التوليد</p>
                      </div>
                    </div>
                    <span className={`text-gray-500 text-sm transition-transform ${gymShowOverride ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {gymShowOverride && (
                    <div className="border-t border-gray-800 p-4 space-y-4">

                      {/* الجنس */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">👤 الجنس (يؤثر على الأوزان)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[{ v: 'male', l: '♂️ ذكر' }, { v: 'female', l: '♀️ أنثى' }].map(g => (
                            <button key={g.v} onClick={() => setGymOverride((p: any) => ({ ...p, gender: g.v }))}
                              className={`py-2 rounded-xl text-sm font-semibold border transition-all ${gymOverride.gender === g.v ? 'border-indigo-500 bg-indigo-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                              {g.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* مرحلة دورة التدريج */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">
                          📈 مرحلة دورة التدريج {gymCyclePhaseOverride === 'auto' && gymCycleStatus ? <span className="text-white">— القادمة تلقائياً: {gymCycleStatus.nextPhaseLabel}</span> : null}
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {CYCLE_PHASE_OPTIONS.map(p => (
                            <button key={p.v} onClick={() => setGymCyclePhaseOverride(p.v)}
                              className={`py-2 rounded-xl text-[11px] font-semibold border transition-all ${gymCyclePhaseOverride === p.v ? 'border-indigo-500 bg-indigo-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* الهدف */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">🎯 الهدف</label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {[
                            { v: 'muscle_gain',    l: '💪 بناء العضلة',         sub: 'أحمال ثقيلة 8-12 rep' },
                            { v: 'weight_loss',    l: '🔥 خسارة الوزن',         sub: 'كارديو + قوة 12-20 rep' },
                            { v: 'strength',       l: '🏋️ بناء القوة',          sub: 'Compound ثقيل 3-6 rep' },
                            { v: 'body_recomp',    l: '🎯 إعادة تشكيل الجسم',   sub: 'قوة + كارديو متوازن' },
                            { v: 'general_fitness',l: '⚡ لياقة عامة',           sub: 'تنويع شامل' },
                          ].map(g => (
                            <button key={g.v} onClick={() => setGymOverride((p: any) => ({ ...p, goal: g.v }))}
                              className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-right text-sm transition-all ${gymOverride.goal === g.v ? 'border-violet-500 bg-violet-900/30 text-white' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'}`}>
                              <span className="font-semibold flex-1">{g.l}</span>
                              <span className="text-xs text-gray-500">{g.sub}</span>
                              {gymOverride.goal === g.v && <span className="text-violet-400">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* المستوى */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">📊 المستوى الفعلي (تقييم المدرب)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { v: 'beginner',     l: '🟢 مبتدئ',  sub: '< سنة' },
                            { v: 'intermediate', l: '🔵 متوسط',  sub: '1-3 سنوات' },
                            { v: 'advanced',     l: '🟠 متقدم',  sub: '3-5 سنوات' },
                            { v: 'elite',        l: '🔴 محترف',  sub: '+5 سنوات' },
                          ].map(l => (
                            <button key={l.v} onClick={() => setGymOverride((p: any) => ({ ...p, level: l.v }))}
                              className={`flex flex-col items-center py-2.5 px-2 rounded-xl border text-sm font-bold transition-all ${gymOverride.level === l.v ? 'border-blue-500 bg-blue-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                              <span>{l.l}</span>
                              <span className="text-xs text-gray-500 font-normal mt-0.5">{l.sub}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* الأيام */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">📅 أيام التدريب أسبوعياً</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[3, 4, 5, 6].map(n => (
                            <button key={n} onClick={() => setGymOverride((p: any) => ({ ...p, daysPerWeek: n }))}
                              className={`py-3 rounded-xl border font-extrabold text-lg transition-all ${gymOverride.daysPerWeek === n ? 'border-violet-500 bg-violet-600 text-white' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                              {n}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5 text-center">
                          {gymOverride.daysPerWeek === 3 ? 'Full Body × 3' : gymOverride.daysPerWeek === 4 ? 'Upper/Lower × 2' : gymOverride.daysPerWeek === 5 ? 'Push/Pull/Legs' : 'PPL مزدوج'}
                        </p>
                      </div>

                      {/* مناطق التركيز */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">💪 مناطق التركيز</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {['الصدر','الظهر','الأرجل','الأكتاف','الذراعين','البطن والجذع','المؤخرة','الساق السفلى'].map(area => (
                            <button key={area} onClick={() => gymToggleFocus(area)}
                              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all text-right ${gymOverride.focusAreas?.includes(area) ? 'border-orange-500 bg-orange-900/30 text-orange-300' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                              {gymOverride.focusAreas?.includes(area) ? '✓ ' : ''}{area}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* قيود الإصابات */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">⚠️ قيود / إصابات (تعديل المدرب)</label>
                        <textarea value={gymOverride.limitations}
                          onChange={e => setGymOverride((p: any) => ({ ...p, limitations: e.target.value }))}
                          placeholder="مثال: ألم في الركبة اليسرى — تجنب Leg Extension&#10;ديسك في الظهر — لا Deadlift"
                          rows={3}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 resize-none" />
                      </div>

                      {/* تعليمات خاصة */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">📝 تعليمات خاصة للـ AI من المدرب</label>
                        <textarea value={gymOverride.specialInstructions}
                          onChange={e => setGymOverride((p: any) => ({ ...p, specialInstructions: e.target.value }))}
                          placeholder="مثال: العضو يستعد لبطولة — ركّز على الحجم الكبير&#10;مثال: جلسات قصيرة لا تتجاوز 45 دقيقة&#10;مثال: ركّز على الأوزان الحرة وقلّل الأجهزة"
                          rows={3}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500 resize-none" />
                        <p className="text-xs text-gray-600 mt-1">هذه التعليمات تُرسل مباشرة للـ AI لمراعاتها في التوليد</p>
                      </div>

                      {/* Reset button */}
                      {gymProfile && (
                        <button onClick={() => setGymOverride({ goal: gymProfile.goal, level: gymProfile.level, daysPerWeek: gymProfile.daysPerWeek, gender: gymProfile.gender || 'male', focusAreas: gymProfile.focusAreas || [], limitations: gymProfile.limitations || '', specialInstructions: '' })}
                          className="w-full py-2 rounded-xl border border-gray-700 text-gray-400 text-xs font-semibold hover:border-gray-500 hover:text-gray-300 transition-all">
                          ↺ إعادة تعيين لقيم البروفايل الأصلية
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* إنشاء بروفايل جديد إذا لم يكن موجوداً */}
              {gymSelectedMember && !gymProfile && !gymOverride && (
                <button onClick={() => setGymOverride({ goal: 'general_fitness', level: 'beginner', daysPerWeek: 3, gender: 'male', focusAreas: [], limitations: '', specialInstructions: '' })}
                  className="w-full py-3 rounded-xl border border-dashed border-violet-700/60 text-violet-400 text-sm font-semibold hover:bg-violet-900/10 transition-all">
                  + إنشاء بروفايل مؤقت لهذا العضو
                </button>
              )}

              {/* Generate Button */}
              {gymSelectedMember && gymOverride && (
                <div className="space-y-2">
                  <button onClick={generateGymPlan} disabled={gymLoading}
                    className="w-full py-4 rounded-2xl text-white font-extrabold text-base transition-all shadow-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed shadow-violet-900/30">
                    {gymLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span> جاري التوليد بـ Claude AI...
                      </span>
                    ) : '🤖 توليد الجدول الأسبوعي'}
                  </button>
                  {gymLoading && (
                    <p className="text-xs text-gray-500 text-center">قد يستغرق 30-60 ثانية حسب عدد الأيام</p>
                  )}
                  {gymError && (
                    <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-3 py-2.5 text-sm text-red-400 flex items-start gap-2">
                      <span>❌</span><span>{gymError}</span>
                    </div>
                  )}
                  {gymSaved && !gymError && (
                    <div className="bg-green-900/20 border border-green-700/40 rounded-xl px-3 py-2.5 text-sm text-green-400 flex items-center gap-2">
                      <span>✅</span><span>تم التوليد والحفظ للعضو بنجاح</span>
                    </div>
                  )}
                </div>
              )}

              {/* Plan Preview */}
              {gymPlan?.sessions && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">📋 الجدول المُولَّد</h3>
                    <span className="text-xs text-gray-500">{gymPlan.sessions.filter((s: any) => !s.isRest).length} أيام تمرين • {gymPlan.sessions.filter((s: any) => s.isRest).length} أيام راحة</span>
                  </div>

                  {gymPlan.cyclePhaseLabel && (
                    <div className={`rounded-xl border px-3 py-2 text-xs flex items-center gap-2 ${
                      gymPlan.autoDeloadTriggered ? 'bg-amber-900/30 border-amber-700/50 text-amber-200' : 'bg-indigo-900/20 border-indigo-700/40 text-indigo-200'
                    }`}>
                      <span>{gymPlan.autoDeloadTriggered ? '⚠️' : '📈'}</span>
                      <span>
                        بُرمج على مرحلة: <span className="font-semibold text-white">{gymPlan.cyclePhaseLabel}</span>
                        {gymPlan.autoDeloadTriggered ? ' — فُرض تلقائياً بعد 4 أسابيع بدون تفريغ' : ''}
                      </span>
                    </div>
                  )}
                  {gymPlan.estimatedOneRM && Object.keys(gymPlan.estimatedOneRM).length > 0 && (
                    <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl px-3 py-2.5 text-xs text-emerald-300">
                      🎯 استُخدمت تقديرات 1RM فعلية من سجل العضو لـ: {Object.entries(gymPlan.estimatedOneRM).map(([id, v]) => `${id} (${v}كجم)`).join('، ')}
                    </div>
                  )}
                  {gymPlan.weekSummary && (
                    <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl px-3 py-2.5 text-xs text-indigo-300">
                      📌 {gymPlan.weekSummary}
                    </div>
                  )}

                  {gymPlan.sessions.map((s: any, i: number) => (
                    <div key={i} className={`rounded-2xl border overflow-hidden ${s.isRest ? 'border-gray-700/30 bg-gray-900/30' : 'border-violet-700/30 bg-violet-900/10'}`}>
                      <div className="p-3 flex items-center gap-3">
                        <div className="flex-shrink-0 text-center">
                          <div className="text-xl">{s.isRest ? '😴' : s.splitType === 'Push' ? '🔴' : s.splitType === 'Pull' ? '🔵' : s.splitType === 'Legs' ? '🟢' : s.splitType === 'Upper' ? '🟣' : s.splitType === 'Lower' ? '🟡' : '🔷'}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{s.dayName}</span>
                            <span className="text-xs text-gray-500">{s.date}</span>
                            {!s.isRest && <span className="text-xs bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded-full border border-violet-700/30">{s.splitType}</span>}
                            {s.intensity && !s.isRest && (
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${s.intensity === 'Heavy' ? 'bg-red-900/40 text-red-400 border-red-700/30' : s.intensity === 'Moderate' ? 'bg-orange-900/40 text-orange-400 border-orange-700/30' : 'bg-green-900/40 text-green-400 border-green-700/30'}`}>
                                {s.intensity}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 truncate">
                            {s.isRest ? 'يوم راحة واسترداد' : s.title}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {s.duration > 0 && <div className="text-xs text-gray-500">⏱ {s.duration}د</div>}
                          {!s.isRest && <div className="text-xs text-violet-400">{s.exercises?.length || 0} تمارين</div>}
                        </div>
                      </div>
                      {!s.isRest && s.exercises?.length > 0 && (
                        <div className="border-t border-white/5 px-3 py-2 space-y-1">
                          {s.exercises.map((ex: any, j: number) => (
                            <div key={j} className="flex items-center gap-2 text-xs">
                              <span className="text-violet-500 flex-shrink-0">{j + 1}.</span>
                              <span className="flex-1 text-gray-300">{ex.nameAr}</span>
                              <span className="text-gray-500">{ex.muscleGroup}</span>
                              <span className="text-gray-600 flex-shrink-0">{ex.sets} مج</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {gymPlan.progressionNote && (
                    <div className="bg-teal-900/20 border border-teal-700/30 rounded-xl px-3 py-2.5 text-xs text-teal-300">
                      📈 {gymPlan.progressionNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===== Running (العدّائين) ===== */}
          {tab === 'running' && (
            <div className="space-y-4">

              {/* Header */}
              <div className="bg-gradient-to-br from-cyan-900/50 to-sky-900/40 rounded-2xl border border-cyan-700/40 p-4">
                <h2 className="font-extrabold text-white text-base">🏃 توليد برنامج العدّائين</h2>
                <p className="text-xs text-cyan-300 mt-0.5">اختر العداء وخصّص الإعدادات كمدرب قبل التوليد</p>
              </div>

              {/* Step 1 — Member + Date */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">① اختيار العداء والتاريخ</p>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">العضو</label>
                  <select value={runSelectedMember}
                    onChange={e => { setRunSelectedMember(e.target.value); setRunPlan(null); setRunSaved(false); setRunError(''); }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500">
                    <option value="">-- اختر عضو --</option>
                    {gymMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.nameAr} (@{m.username})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">📅 تاريخ بداية البرنامج</label>
                  <input type="date" value={runFromDate} onChange={e => setRunFromDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
                </div>

                {runSelectedMember && !runProfile && (
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl px-3 py-2.5 text-sm text-yellow-400 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>العضو لم يعبّئ بروفايل العدّاء — يمكنك إنشاء إعداداته يدوياً أدناه</span>
                  </div>
                )}
                {runSelectedMember && runProfile && (
                  <div className="bg-gray-800/60 rounded-xl border border-gray-700/40 px-3 py-2.5 space-y-1.5">
                    <p className="text-xs text-gray-500 font-semibold">بروفايل العداء المحفوظ:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: runProfile.goal, bg: 'bg-cyan-900/50 text-cyan-300 border-cyan-700/40' },
                        { label: runProfile.level, bg: 'bg-blue-900/50 text-blue-300 border-blue-700/40' },
                        { label: runProfile.daysPerWeek + ' أيام', bg: 'bg-green-900/50 text-green-300 border-green-700/40' },
                        runProfile.currentWeeklyKm ? { label: runProfile.currentWeeklyKm + ' كم/أسبوع', bg: 'bg-gray-700/60 text-gray-300 border-gray-600/40' } : null,
                        runProfile.best5kTime ? { label: '5كم: ' + runProfile.best5kTime, bg: 'bg-orange-900/50 text-orange-300 border-orange-700/40' } : null,
                        { label: runProfile.surface, bg: 'bg-gray-700/60 text-gray-400 border-gray-600/40' },
                      ].filter(Boolean).map((b: any, i: number) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-lg border ${b.bg}`}>{b.label}</span>
                      ))}
                    </div>
                    {runProfile.targetRaceDate && (
                      <p className="text-xs text-cyan-400">🏁 سباق مستهدف: {runProfile.targetRaceDate}</p>
                    )}
                    {runProfile.limitations && (
                      <p className="text-xs text-yellow-500">⚠️ {runProfile.limitations}</p>
                    )}
                  </div>
                )}
              </div>

              {/* شريط حالة البرنامج — دورة تدريج / تخفيف سباق / مرحلة مشي-جري كبار السن */}
              {runSelectedMember && runCycleStatus && (
                <div className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${
                  runCycleStatus.mode === 'taper' || runCycleStatus.autoDeloadTriggered
                    ? 'bg-amber-900/30 border-amber-700/50 text-amber-200'
                    : runCycleStatus.mode === 'senior'
                    ? 'bg-emerald-900/20 border-emerald-700/40 text-emerald-200'
                    : 'bg-cyan-900/20 border-cyan-700/40 text-cyan-200'
                }`}>
                  <span className="text-lg leading-none">
                    {runCycleStatus.mode === 'taper' ? '🏁' : runCycleStatus.mode === 'senior' ? '🚶' : runCycleStatus.autoDeloadTriggered ? '⚠️' : '📈'}
                  </span>
                  <div className="flex-1 leading-relaxed">
                    {runCycleStatus.mode === 'senior' && (
                      <>
                        <div className="font-semibold text-white">المرحلة الحالية: {runCycleStatus.currentStageLabel}</div>
                        <div className="text-xs opacity-80 mt-0.5">
                          {runCycleStatus.isMaxStage ? 'وصل لمرحلة الحفاظ الصحي — لا حاجة لترقية أكثر' : `متبقٍ ${runCycleStatus.weeksUntilNextStage} ${runCycleStatus.weeksUntilNextStage === 1 ? 'أسبوع' : 'أسابيع'} للترقية التالية`}
                        </div>
                      </>
                    )}
                    {runCycleStatus.mode === 'taper' && (
                      <>
                        <div className="font-semibold text-white">{runCycleStatus.taperInfo?.phaseLabel}</div>
                        <div className="text-xs opacity-80 mt-0.5">متبقٍ {runCycleStatus.taperInfo?.weeksUntilRace} على السباق — سيُخفَّض الحجم تلقائياً</div>
                      </>
                    )}
                    {runCycleStatus.mode === 'cycle' && (
                      <>
                        <div className="font-semibold text-white">دورة التدريج القادمة: {runCycleStatus.nextPhaseLabel}</div>
                        <div className="text-xs opacity-80 mt-0.5">{runCycleStatus.nextPhaseInfo?.description}</div>
                        {runCycleStatus.autoDeloadTriggered && <div className="text-xs mt-1 text-amber-300">سيُفرض أسبوع تفريغ تلقائياً (4 أسابيع منذ آخر تفريغ)</div>}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2 — Coach Overrides */}
              {runSelectedMember && runOverride && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                  <button onClick={() => setRunShowOverride(o => !o)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚙️</span>
                      <div>
                        <p className="text-sm font-bold text-white">إعدادات المدرب</p>
                        <p className="text-xs text-gray-500">تعديل الخيارات قبل التوليد</p>
                      </div>
                    </div>
                    <span className={`text-gray-500 text-sm transition-transform ${runShowOverride ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {runShowOverride && (
                    <div className="border-t border-gray-800 p-4 space-y-4">

                      {/* الهدف */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">🎯 الهدف</label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {[
                            { v: 'general_endurance', l: '🏃 تحمل عام',       sub: '80/20 وبناء القاعدة' },
                            { v: 'fat_burn',          l: '🔥 حرق الدهون',     sub: 'Zone 2 + HIIT' },
                            { v: 'race_5k',           l: '⚡ سباق 5 كم',      sub: 'سرعة وجودة' },
                            { v: 'race_10k',          l: '🎯 سباق 10 كم',     sub: 'سرعة + تحمل' },
                            { v: 'half_marathon',     l: '🏅 نصف ماراثون',    sub: 'جري طويل حتى 19كم' },
                            { v: 'marathon',          l: '🏆 ماراثون',         sub: 'أحجام عالية' },
                            { v: 'speed',             l: '💨 سرعة قصوى',       sub: 'انفجارية + تلال' },
                            { v: 'senior_walk_run',   l: '🚶 مشي وجري لكبار السن', sub: 'صحة عامة — بلا سباقات' },
                          ].map(g => (
                            <button key={g.v} onClick={() => setRunOverride((p: any) => ({ ...p, goal: g.v }))}
                              className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-right text-sm transition-all ${runOverride.goal === g.v ? 'border-cyan-500 bg-cyan-900/30 text-white' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'}`}>
                              <span className="font-semibold flex-1">{g.l}</span>
                              <span className="text-xs text-gray-500">{g.sub}</span>
                              {runOverride.goal === g.v && <span className="text-cyan-400">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* فرض مرحلة الدورة (أهداف السباق) أو مرحلة المشي/الجري (كبار السن) */}
                      {runOverride.goal === 'senior_walk_run' ? (
                        <div>
                          <label className="text-xs text-gray-400 font-semibold block mb-2">📈 فرض مرحلة المشي/الجري (اختياري — الافتراضي تلقائي)</label>
                          <select value={runWalkStageOverride === null ? '' : runWalkStageOverride}
                            onChange={e => setRunWalkStageOverride(e.target.value === '' ? null : Number(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500">
                            <option value="">🔄 تلقائي — حسب التقدّم المُسجَّل</option>
                            {Array.from({ length: 9 }, (_, i) => i).map(n => (
                              <option key={n} value={n}>مرحلة {n}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="text-xs text-gray-400 font-semibold block mb-2">📈 فرض مرحلة دورة التدريج (يُتجاهَل تلقائياً إن كان هناك تخفيف سباق نشط)</label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {CYCLE_PHASE_OPTIONS.map(p => (
                              <button key={p.v} onClick={() => setRunCyclePhaseOverride(p.v)}
                                className={`py-2 rounded-xl text-[11px] font-semibold border transition-all ${runCyclePhaseOverride === p.v ? 'border-cyan-500 bg-cyan-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* المستوى */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">📊 المستوى الفعلي (تقييم المدرب)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { v: 'beginner',     l: '🟢 مبتدئ',  sub: '15-25 كم/أسبوع' },
                            { v: 'intermediate', l: '🔵 متوسط',  sub: '25-45 كم/أسبوع' },
                            { v: 'advanced',     l: '🟠 متقدم',  sub: '45-70 كم/أسبوع' },
                            { v: 'elite',        l: '🔴 نخبة',   sub: '70+ كم/أسبوع' },
                          ].map(l => (
                            <button key={l.v} onClick={() => setRunOverride((p: any) => ({ ...p, level: l.v }))}
                              className={`flex flex-col items-center py-2.5 px-2 rounded-xl border text-sm font-bold transition-all ${runOverride.level === l.v ? 'border-blue-500 bg-blue-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                              <span>{l.l}</span>
                              <span className="text-xs text-gray-500 font-normal mt-0.5">{l.sub}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* الأيام */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">📅 أيام الجري أسبوعياً</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[3, 4, 5, 6].map(n => (
                            <button key={n} onClick={() => setRunOverride((p: any) => ({ ...p, daysPerWeek: n }))}
                              className={`py-3 rounded-xl border font-extrabold text-lg transition-all ${runOverride.daysPerWeek === n ? 'border-cyan-500 bg-cyan-600 text-white' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                              {n}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5 text-center">
                          {runOverride.daysPerWeek === 3 ? 'سهل + جودة + طويل' : runOverride.daysPerWeek === 4 ? '+ إيقاعي' : runOverride.daysPerWeek === 5 ? '+ استرداد' : '+ تلال وانطلاقات'}
                        </p>
                      </div>

                      {/* السطح */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">🛤️ السطح</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { v: 'outdoor',   l: '🌳 خارجي' },
                            { v: 'treadmill', l: '🏃 تريدميل' },
                            { v: 'track',     l: '🏟️ مضمار' },
                            { v: 'mixed',     l: '🔄 مختلط' },
                          ].map(s => (
                            <button key={s.v} onClick={() => setRunOverride((p: any) => ({ ...p, surface: s.v }))}
                              className={`py-2 rounded-xl border text-xs font-semibold transition-all ${runOverride.surface === s.v ? 'border-cyan-500 bg-cyan-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                              {s.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* بيانات الجري */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 font-semibold block mb-1.5">🛣️ الحجم الحالي كم/أسبوع</label>
                          <input type="number" value={runOverride.currentWeeklyKm}
                            onChange={e => setRunOverride((p: any) => ({ ...p, currentWeeklyKm: e.target.value }))}
                            placeholder="20"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 font-semibold block mb-1.5">⚡ أفضل زمن 5كم</label>
                          <input type="text" value={runOverride.best5kTime} dir="ltr"
                            onChange={e => setRunOverride((p: any) => ({ ...p, best5kTime: e.target.value }))}
                            placeholder="28:30"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm text-center font-mono focus:outline-none focus:border-cyan-500" />
                        </div>
                      </div>

                      {/* سباق مستهدف */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-1.5">🏁 سباق مستهدف (اختياري)</label>
                        <input type="date" value={runOverride.targetRaceDate}
                          onChange={e => setRunOverride((p: any) => ({ ...p, targetRaceDate: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
                      </div>

                      {/* قيود الإصابات */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">⚠️ قيود / إصابات (تعديل المدرب)</label>
                        <textarea value={runOverride.limitations}
                          onChange={e => setRunOverride((p: any) => ({ ...p, limitations: e.target.value }))}
                          placeholder="مثال: Shin Splints — تدرج بطيء وسطح ناعم&#10;ألم ركبة — لا منحدرات"
                          rows={3}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 resize-none" />
                      </div>

                      {/* تعليمات خاصة */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">📝 تعليمات خاصة للـ AI من المدرب</label>
                        <textarea value={runOverride.specialInstructions}
                          onChange={e => setRunOverride((p: any) => ({ ...p, specialInstructions: e.target.value }))}
                          placeholder="مثال: العداء يستعد لسباق الرياض — ركّز على الإيقاع المستهدف&#10;مثال: جلسات قصيرة لا تتجاوز 45 دقيقة&#10;مثال: الجري فجراً فقط بسبب الحرارة"
                          rows={3}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none" />
                        <p className="text-xs text-gray-600 mt-1">هذه التعليمات تُرسل مباشرة للـ AI لمراعاتها في التوليد</p>
                      </div>

                      {/* Reset */}
                      {runProfile && (
                        <button onClick={() => setRunOverride({ goal: runProfile.goal, level: runProfile.level, daysPerWeek: runProfile.daysPerWeek, gender: runProfile.gender || 'male', surface: runProfile.surface || 'mixed', currentWeeklyKm: runProfile.currentWeeklyKm || '', best5kTime: runProfile.best5kTime || '', targetRaceDate: runProfile.targetRaceDate || '', limitations: runProfile.limitations || '', specialInstructions: '' })}
                          className="w-full py-2 rounded-xl border border-gray-700 text-gray-400 text-xs font-semibold hover:border-gray-500 hover:text-gray-300 transition-all">
                          ↺ إعادة تعيين لقيم البروفايل الأصلية
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* إنشاء بروفايل مؤقت */}
              {runSelectedMember && !runProfile && !runOverride && (
                <button onClick={() => setRunOverride({ goal: 'general_endurance', level: 'beginner', daysPerWeek: 3, gender: 'male', surface: 'mixed', currentWeeklyKm: '', best5kTime: '', targetRaceDate: '', limitations: '', specialInstructions: '' })}
                  className="w-full py-3 rounded-xl border border-dashed border-cyan-700/60 text-cyan-400 text-sm font-semibold hover:bg-cyan-900/10 transition-all">
                  + إنشاء بروفايل مؤقت لهذا العداء
                </button>
              )}

              {/* Generate Button */}
              {runSelectedMember && runOverride && (
                <div className="space-y-2">
                  <button onClick={generateRunPlan} disabled={runLoading}
                    className="w-full py-4 rounded-2xl text-white font-extrabold text-base transition-all shadow-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed shadow-cyan-900/30">
                    {runLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span> جاري التوليد بـ Claude AI...
                      </span>
                    ) : '🤖 توليد برنامج الجري الأسبوعي'}
                  </button>
                  {runLoading && (
                    <p className="text-xs text-gray-500 text-center">قد يستغرق 30-60 ثانية حسب عدد الأيام</p>
                  )}
                  {runError && (
                    <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-3 py-2.5 text-sm text-red-400 flex items-start gap-2">
                      <span>❌</span><span>{runError}</span>
                    </div>
                  )}
                  {runSaved && !runError && (
                    <div className="bg-green-900/20 border border-green-700/40 rounded-xl px-3 py-2.5 text-sm text-green-400 flex items-center gap-2">
                      <span>✅</span><span>تم التوليد والحفظ للعداء بنجاح</span>
                    </div>
                  )}
                </div>
              )}

              {/* Plan Preview */}
              {runPlan?.sessions && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">📋 البرنامج المُولَّد</h3>
                    <span className="text-xs text-gray-500">
                      {runPlan.sessions.filter((s: any) => !s.isRest).length} أيام جري • {runPlan.sessions.reduce((n: number, s: any) => n + (s.totalDistanceKm || 0), 0).toFixed(0)} كم
                    </span>
                  </div>

                  {runPlan.mode === 'senior' && (
                    <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl px-3 py-2.5 text-xs text-emerald-300 flex items-center gap-2">
                      <span>{runPlan.justAdvanced ? '🎉' : '🚶'}</span>
                      <span>المرحلة: <span className="font-semibold text-white">{runPlan.stageLabel}</span>{runPlan.justAdvanced ? ' — ترقية جديدة هذا الأسبوع!' : ''}</span>
                    </div>
                  )}
                  {runPlan.mode === 'taper' && (
                    <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl px-3 py-2.5 text-xs text-amber-200 flex items-center gap-2">
                      <span>🏁</span>
                      <span>{runPlan.taperInfo?.phaseLabel} — متبقٍ {runPlan.taperInfo?.weeksUntilRace} على السباق</span>
                    </div>
                  )}
                  {runPlan.mode === 'cycle' && runPlan.cyclePhaseLabel && (
                    <div className={`rounded-xl border px-3 py-2.5 text-xs flex items-center gap-2 ${runPlan.autoDeloadTriggered ? 'bg-amber-900/30 border-amber-700/50 text-amber-200' : 'bg-cyan-900/20 border-cyan-700/40 text-cyan-200'}`}>
                      <span>{runPlan.autoDeloadTriggered ? '⚠️' : '📈'}</span>
                      <span>بُرمج على مرحلة: <span className="font-semibold text-white">{runPlan.cyclePhaseLabel}</span>{runPlan.autoDeloadTriggered ? ' — فُرض تلقائياً' : ''}</span>
                    </div>
                  )}
                  {runPlan.weekSummary && (
                    <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-xl px-3 py-2.5 text-xs text-cyan-300">
                      📌 {runPlan.weekSummary}
                    </div>
                  )}

                  {runPlan.sessions.map((s: any, i: number) => (
                    <div key={i} className={`rounded-2xl border overflow-hidden ${s.isRest ? 'border-gray-700/30 bg-gray-900/30' : 'border-cyan-700/30 bg-cyan-900/10'}`}>
                      <div className="p-3 flex items-center gap-3">
                        <div className="flex-shrink-0 text-center">
                          <div className="text-xl">{s.isRest ? '😴' : s.runType === 'Intervals' ? '⚡' : s.runType === 'Tempo' ? '🔥' : s.runType === 'Long' ? '🛣️' : s.runType === 'Hills' ? '⛰️' : s.runType === 'Recovery' ? '💧' : s.runType === 'Fartlek' ? '🎲' : '🌿'}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{s.dayName}</span>
                            <span className="text-xs text-gray-500">{s.date}</span>
                            {!s.isRest && <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-700/30">{s.runType}</span>}
                            {s.intensity && !s.isRest && (
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${s.intensity === 'Hard' ? 'bg-red-900/40 text-red-400 border-red-700/30' : s.intensity === 'Moderate' ? 'bg-orange-900/40 text-orange-400 border-orange-700/30' : 'bg-green-900/40 text-green-400 border-green-700/30'}`}>
                                {s.intensity}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 truncate">
                            {s.isRest ? 'يوم راحة واستشفاء' : s.title}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {s.totalDistanceKm > 0 && <div className="text-xs text-cyan-400">{s.totalDistanceKm} كم</div>}
                          {s.duration > 0 && <div className="text-xs text-gray-500">⏱ {s.duration}د</div>}
                        </div>
                      </div>
                      {!s.isRest && s.segments?.length > 0 && (
                        <div className="border-t border-white/5 px-3 py-2 space-y-1">
                          {s.segments.map((seg: any, j: number) => (
                            <div key={j} className="flex items-center gap-2 text-xs">
                              <span className="text-cyan-500 flex-shrink-0">{j + 1}.</span>
                              <span className="flex-1 text-gray-300">{seg.name}</span>
                              <span className="text-gray-500">{seg.type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {runPlan.progressionNote && (
                    <div className="bg-teal-900/20 border border-teal-700/30 rounded-xl px-3 py-2.5 text-xs text-teal-300">
                      📈 {runPlan.progressionNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===== Calisthenics Program ===== */}
          {tab === 'cali' && (
            <div className="space-y-4">

              {/* Header */}
              <div className="bg-gradient-to-br from-emerald-900/50 to-green-900/40 rounded-2xl border border-emerald-700/40 p-4">
                <h2 className="font-extrabold text-white text-base">🤸 توليد برنامج الكاليسثنكس</h2>
                <p className="text-xs text-emerald-300 mt-0.5">اختر المتدرب وخصّص الإعدادات كمدرب قبل التوليد</p>
              </div>

              {/* Step 1 — Member + Date */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">① اختيار المتدرب والتاريخ</p>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">العضو</label>
                  <select value={caliSelectedMember}
                    onChange={e => { setCaliSelectedMember(e.target.value); setCaliPlan(null); setCaliSaved(false); setCaliError(''); }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
                    <option value="">-- اختر عضو --</option>
                    {gymMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.nameAr} (@{m.username})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">📅 تاريخ بداية البرنامج</label>
                  <input type="date" value={caliFromDate} onChange={e => setCaliFromDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                </div>

                {caliSelectedMember && !caliProfile && (
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl px-3 py-2.5 text-sm text-yellow-400 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>العضو لم يعبّئ بروفايل الكاليسثنكس — يمكنك إنشاء إعداداته يدوياً أدناه</span>
                  </div>
                )}
                {caliSelectedMember && caliProfile && (
                  <div className="bg-gray-800/60 rounded-xl border border-gray-700/40 px-3 py-2.5 space-y-1.5">
                    <p className="text-xs text-gray-500 font-semibold">بروفايل المتدرب المحفوظ:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: caliProfile.goal, bg: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/40' },
                        { label: caliProfile.level, bg: 'bg-blue-900/50 text-blue-300 border-blue-700/40' },
                        { label: caliProfile.daysPerWeek + ' أيام', bg: 'bg-green-900/50 text-green-300 border-green-700/40' },
                        caliProfile.maxPushups !== undefined ? { label: `ضغط: ${caliProfile.maxPushups}`, bg: 'bg-gray-700/60 text-gray-300 border-gray-600/40' } : null,
                        caliProfile.maxPullups !== undefined ? { label: `عقلة: ${caliProfile.maxPullups}`, bg: 'bg-gray-700/60 text-gray-300 border-gray-600/40' } : null,
                        caliProfile.maxDips !== undefined ? { label: `ديبس: ${caliProfile.maxDips}`, bg: 'bg-gray-700/60 text-gray-300 border-gray-600/40' } : null,
                      ].filter(Boolean).map((b: any, i: number) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-lg border ${b.bg}`}>{b.label}</span>
                      ))}
                    </div>
                    {caliProfile.skillGoals?.length > 0 && (
                      <p className="text-xs text-violet-400">🤸 المهارات: {caliProfile.skillGoals.join(' • ')}</p>
                    )}
                    {caliProfile.equipment?.length > 0 && (
                      <p className="text-xs text-gray-400">🛠️ المعدات: {caliProfile.equipment.join(' • ')}</p>
                    )}
                    {caliProfile.limitations && (
                      <p className="text-xs text-yellow-500">⚠️ {caliProfile.limitations}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2 — Coach Overrides */}
              {caliSelectedMember && caliOverride && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                  <button onClick={() => setCaliShowOverride(o => !o)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚙️</span>
                      <div>
                        <p className="text-sm font-bold text-white">إعدادات المدرب</p>
                        <p className="text-xs text-gray-500">تعديل الخيارات قبل التوليد</p>
                      </div>
                    </div>
                    <span className={`text-gray-500 text-sm transition-transform ${caliShowOverride ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {caliShowOverride && (
                    <div className="border-t border-gray-800 p-4 space-y-4">

                      {/* الهدف */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">🎯 الهدف</label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {[
                            { v: 'strength',    l: '💪 قوة بوزن الجسم', sub: 'تدرجات صعبة 3-6 rep' },
                            { v: 'skills',      l: '🤸 مهارات',          sub: 'Skill Work أول الجلسة' },
                            { v: 'muscle_gain', l: '🏗️ بناء عضلي',       sub: '8-15 rep + Tempo' },
                            { v: 'endurance',   l: '🔄 تحمل عضلي',       sub: 'Circuits + AMRAP' },
                            { v: 'fat_burn',    l: '🔥 حرق الدهون',      sub: 'HIIT بوزن الجسم' },
                          ].map(g => (
                            <button key={g.v} onClick={() => setCaliOverride((p: any) => ({ ...p, goal: g.v }))}
                              className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-right text-sm transition-all ${caliOverride.goal === g.v ? 'border-emerald-500 bg-emerald-900/30 text-white' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'}`}>
                              <span className="font-semibold flex-1">{g.l}</span>
                              <span className="text-xs text-gray-500">{g.sub}</span>
                              {caliOverride.goal === g.v && <span className="text-emerald-400">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* المستوى */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">📊 المستوى الفعلي (تقييم المدرب)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { v: 'beginner',     l: '🟢 مبتدئ',  sub: '< 10 ضغط' },
                            { v: 'intermediate', l: '🔵 متوسط',  sub: '5+ عقلة' },
                            { v: 'advanced',     l: '🟠 متقدم',  sub: '12+ عقلة' },
                            { v: 'elite',        l: '🔴 نخبة',   sub: 'رافعات ومهارات' },
                          ].map(l => (
                            <button key={l.v} onClick={() => setCaliOverride((p: any) => ({ ...p, level: l.v }))}
                              className={`flex flex-col items-center py-2.5 px-2 rounded-xl border text-sm font-bold transition-all ${caliOverride.level === l.v ? 'border-blue-500 bg-blue-900/30 text-white' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                              <span>{l.l}</span>
                              <span className="text-xs text-gray-500 font-normal mt-0.5">{l.sub}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* الأيام */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">📅 أيام التدريب أسبوعياً</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[3, 4, 5, 6].map(n => (
                            <button key={n} onClick={() => setCaliOverride((p: any) => ({ ...p, daysPerWeek: n }))}
                              className={`py-3 rounded-xl border font-extrabold text-lg transition-all ${caliOverride.daysPerWeek === n ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                              {n}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5 text-center">
                          {caliOverride.daysPerWeek === 3 ? 'Full Body × 3' : caliOverride.daysPerWeek === 4 ? 'Upper / Lower' : caliOverride.daysPerWeek === 5 ? 'PPL + مهارات + جذع' : 'PPL × 2'}
                        </p>
                      </div>

                      {/* المهارات */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">🤸 المهارات المستهدفة</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {['Handstand','Muscle-up','Front Lever','Back Lever','Planche','Pistol Squat','Human Flag','L-sit','Dragon Flag'].map(s => (
                            <button key={s} onClick={() => caliToggleSkill(s)}
                              className={`px-2 py-2 rounded-xl border text-[11px] font-semibold transition-all ${caliOverride.skillGoals?.includes(s) ? 'border-violet-500 bg-violet-900/30 text-violet-300' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`} dir="ltr">
                              {caliOverride.skillGoals?.includes(s) ? '✓ ' : ''}{s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* المعدات */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">🛠️ المعدات المتاحة</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {['بار عقلة','متوازي/باراليتس','حلقات','أربطة مقاومة','جدار','لا شيء (أرض فقط)'].map(e => (
                            <button key={e} onClick={() => caliToggleEquipment(e)}
                              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all text-right ${caliOverride.equipment?.includes(e) ? 'border-emerald-500 bg-emerald-900/30 text-emerald-300' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
                              {caliOverride.equipment?.includes(e) ? '✓ ' : ''}{e}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* الأرقام الحالية */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">🧪 الأرقام الحالية (اختبار المدرب)</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { k: 'maxPushups',   l: 'ضغط' },
                            { k: 'maxPullups',   l: 'عقلة' },
                            { k: 'maxDips',      l: 'ديبس' },
                            { k: 'plankSeconds', l: 'بلانك ث' },
                          ].map(f => (
                            <div key={f.k}>
                              <label className="text-[10px] text-gray-500 block mb-1 text-center">{f.l}</label>
                              <input type="number" value={caliOverride[f.k]}
                                onChange={e => setCaliOverride((p: any) => ({ ...p, [f.k]: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-emerald-500" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* قيود الإصابات */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">⚠️ قيود / إصابات (تعديل المدرب)</label>
                        <textarea value={caliOverride.limitations}
                          onChange={e => setCaliOverride((p: any) => ({ ...p, limitations: e.target.value }))}
                          placeholder="مثال: ألم رسغ — بدائل على القبضة&#10;كتف حساس — لا ديبس عميق"
                          rows={3}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 resize-none" />
                      </div>

                      {/* تعليمات خاصة */}
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-2">📝 تعليمات خاصة للـ AI من المدرب</label>
                        <textarea value={caliOverride.specialInstructions}
                          onChange={e => setCaliOverride((p: any) => ({ ...p, specialInstructions: e.target.value }))}
                          placeholder="مثال: ركّز على Muscle-up — العضو قريب منها&#10;مثال: جلسات منزلية قصيرة 40 دقيقة&#10;مثال: أضف عمل Mobility إضافي للكتفين"
                          rows={3}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none" />
                        <p className="text-xs text-gray-600 mt-1">هذه التعليمات تُرسل مباشرة للـ AI لمراعاتها في التوليد</p>
                      </div>

                      {/* Reset */}
                      {caliProfile && (
                        <button onClick={() => setCaliOverride({ goal: caliProfile.goal, level: caliProfile.level, daysPerWeek: caliProfile.daysPerWeek, gender: caliProfile.gender || 'male', skillGoals: caliProfile.skillGoals || [], equipment: caliProfile.equipment || [], maxPushups: caliProfile.maxPushups ?? '', maxPullups: caliProfile.maxPullups ?? '', maxDips: caliProfile.maxDips ?? '', plankSeconds: caliProfile.plankSeconds ?? '', limitations: caliProfile.limitations || '', specialInstructions: '' })}
                          className="w-full py-2 rounded-xl border border-gray-700 text-gray-400 text-xs font-semibold hover:border-gray-500 hover:text-gray-300 transition-all">
                          ↺ إعادة تعيين لقيم البروفايل الأصلية
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* إنشاء بروفايل مؤقت */}
              {caliSelectedMember && !caliProfile && !caliOverride && (
                <button onClick={() => setCaliOverride({ goal: 'strength', level: 'beginner', daysPerWeek: 3, gender: 'male', skillGoals: [], equipment: ['جدار'], maxPushups: '', maxPullups: '', maxDips: '', plankSeconds: '', limitations: '', specialInstructions: '' })}
                  className="w-full py-3 rounded-xl border border-dashed border-emerald-700/60 text-emerald-400 text-sm font-semibold hover:bg-emerald-900/10 transition-all">
                  + إنشاء بروفايل مؤقت لهذا المتدرب
                </button>
              )}

              {/* Generate Button */}
              {caliSelectedMember && caliOverride && (
                <div className="space-y-2">
                  <button onClick={generateCaliPlan} disabled={caliLoading}
                    className="w-full py-4 rounded-2xl text-white font-extrabold text-base transition-all shadow-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed shadow-emerald-900/30">
                    {caliLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span> جاري التوليد بـ Claude AI...
                      </span>
                    ) : '🤖 توليد برنامج الكاليسثنكس الأسبوعي'}
                  </button>
                  {caliLoading && (
                    <p className="text-xs text-gray-500 text-center">قد يستغرق 30-60 ثانية حسب عدد الأيام</p>
                  )}
                  {caliError && (
                    <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-3 py-2.5 text-sm text-red-400 flex items-start gap-2">
                      <span>❌</span><span>{caliError}</span>
                    </div>
                  )}
                  {caliSaved && !caliError && (
                    <div className="bg-green-900/20 border border-green-700/40 rounded-xl px-3 py-2.5 text-sm text-green-400 flex items-center gap-2">
                      <span>✅</span><span>تم التوليد والحفظ للمتدرب بنجاح</span>
                    </div>
                  )}
                </div>
              )}

              {/* Plan Preview */}
              {caliPlan?.sessions && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">📋 البرنامج المُولَّد</h3>
                    <span className="text-xs text-gray-500">
                      {caliPlan.sessions.filter((s: any) => !s.isRest).length} أيام تدريب • {caliPlan.sessions.filter((s: any) => s.isRest).length} أيام راحة
                    </span>
                  </div>

                  {caliPlan.weekSummary && (
                    <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl px-3 py-2.5 text-xs text-emerald-300">
                      📌 {caliPlan.weekSummary}
                    </div>
                  )}

                  {caliPlan.sessions.map((s: any, i: number) => (
                    <div key={i} className={`rounded-2xl border overflow-hidden ${s.isRest ? 'border-gray-700/30 bg-gray-900/30' : 'border-emerald-700/30 bg-emerald-900/10'}`}>
                      <div className="p-3 flex items-center gap-3">
                        <div className="flex-shrink-0 text-center">
                          <div className="text-xl">{s.isRest ? '😴' : s.sessionType === 'Push' ? '🙌' : s.sessionType === 'Pull' ? '🏗️' : s.sessionType === 'Legs' ? '🦵' : s.sessionType === 'Skills' ? '🤸' : s.sessionType === 'Core' ? '🧱' : s.sessionType === 'Endurance' ? '🔄' : '💪'}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{s.dayName}</span>
                            <span className="text-xs text-gray-500">{s.date}</span>
                            {!s.isRest && <span className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/30">{s.sessionType}</span>}
                            {s.intensity && !s.isRest && (
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${s.intensity === 'Heavy' ? 'bg-red-900/40 text-red-400 border-red-700/30' : s.intensity === 'Moderate' ? 'bg-orange-900/40 text-orange-400 border-orange-700/30' : 'bg-green-900/40 text-green-400 border-green-700/30'}`}>
                                {s.intensity}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 truncate">
                            {s.isRest ? 'يوم راحة واستشفاء' : s.title}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {s.duration > 0 && <div className="text-xs text-gray-500">⏱ {s.duration}د</div>}
                          {!s.isRest && <div className="text-xs text-emerald-400">{(s.exercises?.length || 0) + (s.skillWork?.length || 0)} تمارين</div>}
                        </div>
                      </div>
                      {!s.isRest && (s.skillWork?.length > 0 || s.exercises?.length > 0) && (
                        <div className="border-t border-white/5 px-3 py-2 space-y-1">
                          {(s.skillWork || []).map((ex: any, j: number) => (
                            <div key={'sk' + j} className="flex items-center gap-2 text-xs">
                              <span className="text-violet-400 flex-shrink-0">🤸</span>
                              <span className="flex-1 text-violet-300">{ex.name}</span>
                              <span className="text-gray-600 flex-shrink-0">{ex.sets} مج</span>
                            </div>
                          ))}
                          {(s.exercises || []).map((ex: any, j: number) => (
                            <div key={j} className="flex items-center gap-2 text-xs">
                              <span className="text-emerald-500 flex-shrink-0">{j + 1}.</span>
                              <span className="flex-1 text-gray-300">{ex.name}</span>
                              <span className="text-gray-500">{ex.targetMuscles}</span>
                              <span className="text-gray-600 flex-shrink-0">{ex.sets} مج</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {caliPlan.progressionNote && (
                    <div className="bg-teal-900/20 border border-teal-700/30 rounded-xl px-3 py-2.5 text-xs text-teal-300">
                      📈 {caliPlan.progressionNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-lg text-center">🗑 حذف الخطة</h3>
            <p className="text-sm text-gray-400 text-center">
              هل تريد حذف سجل الخطة فقط، أم حذف التمارين من التقويم أيضاً؟
            </p>
            <div className="space-y-2">
              <button
                onClick={() => deleteSavedPlan(deleteConfirm, true)}
                className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
              >
                🗑 حذف الخطة والتمارين من التقويم
              </button>
              <button
                onClick={() => deleteSavedPlan(deleteConfirm, false)}
                className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm transition-colors"
              >
                📁 حذف السجل فقط (إبقاء التمارين)
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: بيانات العضو الجديد */}
      {newMemberCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-gray-900 border border-green-700/50 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-lg text-center">✅ تم إضافة العضو</h3>
            <p className="text-sm text-gray-400 text-center">احتفظ ببيانات الدخول وشاركها مع العضو</p>
            <div className="bg-gray-800 rounded-xl p-4 space-y-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">الاسم</span>
                <span className="text-white">{newMemberCredentials.nameAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">اسم المستخدم</span>
                <span className="text-green-400">{newMemberCredentials.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">كلمة المرور</span>
                <span className="text-orange-400">{newMemberCredentials.password}</span>
              </div>
            </div>
            <button
              onClick={async () => {
                const text = `🏋️ بيانات دخول منصة المطانيخ CrossFit\n\nالاسم: ${newMemberCredentials.nameAr}\nاسم المستخدم: ${newMemberCredentials.username}\nكلمة المرور: ${newMemberCredentials.password}\n\n📱 الرابط: ${window.location.origin}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.547 5.874L0 24l6.304-1.524A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.366l-.358-.214-3.742.904.938-3.64-.234-.374A9.818 9.818 0 1112 21.818z"/></svg>
              إرسال عبر واتساب
            </button>
            <button onClick={() => setNewMemberCredentials(null)}
              className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors">
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}




