/**
 * Force Fitness — Progress, History & Analytics Engine (Phase 5)
 * Robust data visualization, workout history logs, weekly stats,
 * consistency streaks, activity charts, weight progression, and deletion safeguards.
 */

import {
    getCompletedSessions,
    deleteCompletedSession,
    clearCompletedSessions,
    getPreferences,
    savePreferences,
    updatePreference,
    exportAllData,
    importAllData,
    resetAllData
} from './storage.js';
import { escapeHtml } from './utils.js';

// ─── Module State ─────────────────────────────────────────────────────────────

let container = null;
let currentSearchTerm = '';
let currentStatusFilter = 'all'; // 'all' | 'completed' | 'partial'
let selectedWeightExercise = '';
let expandedSessionIds = new Set();
let pendingDeleteId = null;
let isClearAllModalOpen = false;

// ─── Formatting Helpers ───────────────────────────────────────────────────────

export function formatDuration(ms) {
    if (!ms || isNaN(ms) || ms < 0) return '0m';
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hrs > 0) {
        return `${hrs}h ${mins}m`;
    }
    if (mins > 0) {
        return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
}

export function formatDurationShort(ms) {
    if (!ms || isNaN(ms) || ms < 0) return '0m';
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);

    if (hrs > 0) {
        return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
}

function formatDatePretty(dateStr) {
    if (!dateStr) return 'Unknown Date';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'Invalid Date';
        return d.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
        return dateStr;
    }
}

function formatDateShort(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (_) {
        return '';
    }
}

// ─── Date & Week Calculation Helpers ──────────────────────────────────────────

function getWeekBounds(refDate = new Date()) {
    const d = new Date(refDate);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMon = (day === 0 ? -6 : 1) - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMon);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
}

function getDayString(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// ─── Statistics Calculations ──────────────────────────────────────────────────

export function computeWeeklyStats(sessions, weeklyGoal = 4) {
    const { monday, sunday } = getWeekBounds();
    const monTime = monday.getTime();
    const sunTime = sunday.getTime();

    const thisWeekSessions = sessions.filter(s => {
        const t = new Date(s.finishedAt || s.startedAt).getTime();
        return t >= monTime && t <= sunTime;
    });

    const completedCount = thisWeekSessions.length;
    const completionPct = Math.min(100, Math.round((completedCount / (weeklyGoal || 4)) * 100));
    const totalWeeklySets = thisWeekSessions.reduce((acc, s) => acc + (Number(s.totalSetsCompleted) || 0), 0);
    const totalWeeklyDurationMs = thisWeekSessions.reduce((acc, s) => acc + (Number(s.elapsedMs) || 0), 0);

    return {
        completedCount,
        weeklyGoal,
        completionPct,
        totalWeeklySets,
        totalWeeklyDurationMs,
        thisWeekSessions
    };
}

export function computeDurationStats(sessions) {
    const totalMs = sessions.reduce((acc, s) => acc + (Number(s.elapsedMs) || 0), 0);
    const avgMs = sessions.length ? Math.round(totalMs / sessions.length) : 0;
    return {
        totalMs,
        avgMs,
        totalWorkouts: sessions.length
    };
}

function parseLocalDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return new Date();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(dateStr);
}

export function computeStreakStats(sessions) {
    if (!sessions || sessions.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    // Collect unique dates (YYYY-MM-DD)
    const dateSet = new Set();
    sessions.forEach(s => {
        try {
            const d = new Date(s.finishedAt || s.startedAt);
            if (!isNaN(d.getTime())) {
                dateSet.add(getDayString(d));
            }
        } catch (_) {}
    });

    const sortedDates = Array.from(dateSet).sort().reverse();
    if (sortedDates.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    const todayStr = getDayString(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getDayString(yesterday);

    // Current streak: must include today or yesterday to be active
    let currentStreak = 0;
    if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
        currentStreak = 1;
        let prevDate = parseLocalDate(sortedDates[0]);

        for (let i = 1; i < sortedDates.length; i++) {
            const expectedPrev = new Date(prevDate);
            expectedPrev.setDate(expectedPrev.getDate() - 1);
            const expectedPrevStr = getDayString(expectedPrev);

            if (sortedDates[i] === expectedPrevStr) {
                currentStreak++;
                prevDate = expectedPrev;
            } else {
                break;
            }
        }
    }

    // Longest streak across history
    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const curr = parseLocalDate(sortedDates[i - 1]);
        curr.setDate(curr.getDate() - 1);
        if (getDayString(curr) === sortedDates[i]) {
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
            tempStreak = 1;
        }
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak;

    return { currentStreak, longestStreak };
}

export function computeActivityChartData(sessions) {
    const { monday } = getWeekBounds();
    const daysData = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayStr = getDayString(new Date());

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dayStr = getDayString(d);
        const isToday = dayStr === todayStr;

        const daySessions = sessions.filter(s => {
            const sDate = new Date(s.finishedAt || s.startedAt);
            return getDayString(sDate) === dayStr;
        });

        const totalMins = daySessions.reduce((acc, s) => acc + Math.round((Number(s.elapsedMs) || 0) / 60000), 0);
        const totalSets = daySessions.reduce((acc, s) => acc + (Number(s.totalSetsCompleted) || 0), 0);
        const routines = daySessions.map(s => s.routineName).filter(Boolean);

        daysData.push({
            dayName: dayNames[i],
            dateNum: d.getDate(),
            dayStr,
            isToday,
            sessionCount: daySessions.length,
            totalMins,
            totalSets,
            routines
        });
    }

    return daysData;
}

export function computeWeightHistory(sessions) {
    // Map of exercise name -> array of records
    const exerciseMap = {};

    sessions.forEach(session => {
        if (!Array.isArray(session.exercises)) return;
        const dateStr = session.finishedAt || session.startedAt;

        session.exercises.forEach(ex => {
            if (!ex || !ex.name || !Array.isArray(ex.sets)) return;
            const exName = ex.name.trim();

            ex.sets.forEach(set => {
                if (set.completed && set.weight !== null && set.weight !== undefined && Number(set.weight) > 0) {
                    if (!exerciseMap[exName]) {
                        exerciseMap[exName] = [];
                    }
                    const weight = Number(set.weight);
                    const reps = Number(set.reps) || 1;
                    // Epley 1RM formula: Weight * (1 + Reps / 30)
                    const estimated1RM = Math.round(weight * (1 + reps / 30) * 10) / 10;

                    exerciseMap[exName].push({
                        date: dateStr,
                        routineName: session.routineName,
                        setNumber: set.setNumber || 1,
                        weight,
                        reps,
                        estimated1RM
                    });
                }
            });
        });
    });

    const exerciseNames = Object.keys(exerciseMap).sort();
    const statsByExercise = {};

    exerciseNames.forEach(name => {
        const records = exerciseMap[name];
        // Sort chronologically
        records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const maxWeight = Math.max(...records.map(r => r.weight));
        const max1RM = Math.max(...records.map(r => r.estimated1RM));
        const latestRecord = records[records.length - 1];

        statsByExercise[name] = {
            records,
            maxWeight,
            max1RM,
            latestRecord,
            totalSetsLogged: records.length
        };
    });

    return {
        exerciseNames,
        statsByExercise
    };
}

// ─── Main Render Function ─────────────────────────────────────────────────────

export function renderAnalytics() {
    container = document.getElementById('view-analytics');
    if (!container) return;

    const sessions = getCompletedSessions();
    const prefs = getPreferences();

    const weekly = computeWeeklyStats(sessions, prefs.weeklyGoal);
    const duration = computeDurationStats(sessions);
    const streaks = computeStreakStats(sessions);
    const chartData = computeActivityChartData(sessions);
    const weightData = computeWeightHistory(sessions);

    // Auto-select first exercise with weight history if none selected
    if (!selectedWeightExercise || !weightData.statsByExercise[selectedWeightExercise]) {
        selectedWeightExercise = weightData.exerciseNames[0] || '';
    }

    // Filter history records
    let filteredSessions = [...sessions];
    if (currentStatusFilter !== 'all') {
        filteredSessions = filteredSessions.filter(s => s.status === currentStatusFilter);
    }
    if (currentSearchTerm.trim()) {
        const q = currentSearchTerm.toLowerCase();
        filteredSessions = filteredSessions.filter(s =>
            (s.routineName && s.routineName.toLowerCase().includes(q)) ||
            (s.dayName && s.dayName.toLowerCase().includes(q)) ||
            (Array.isArray(s.exercises) && s.exercises.some(ex => ex.name && ex.name.toLowerCase().includes(q)))
        );
    }

    container.innerHTML = `
        <div class="space-y-8 animate-fadeIn">

            <!-- Top Header & Controls Toolbar -->
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="inline-flex px-3 py-1 bg-black text-white rounded-full font-semibold text-xs">
                                Analytics Dashboard
                            </span>
                            <span class="text-xs font-semibold text-gray-500">
                                Phase 5 Persistence
                            </span>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                            Progress &amp; Training Analytics
                        </h2>
                        <p class="text-gray-600 text-sm mt-1 max-w-xl">
                            Real-time volume tracking, consistency streaks, strength progression, and verified workout logs.
                        </p>
                    </div>

                    <!-- Preferences & Quick Actions -->
                    <div class="flex flex-wrap items-center gap-3">
                        <!-- Weight Unit Toggle -->
                        <div class="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
                            <button id="pref-unit-kg" type="button" data-action="set-unit" data-unit="kg"
                                class="px-3 py-1 text-xs font-black rounded-full transition cursor-pointer ${prefs.weightUnit === 'kg' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-black'}">
                                KG
                            </button>
                            <button id="pref-unit-lbs" type="button" data-action="set-unit" data-unit="lbs"
                                class="px-3 py-1 text-xs font-black rounded-full transition cursor-pointer ${prefs.weightUnit === 'lbs' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-black'}">
                                LBS
                            </button>
                        </div>

                        <!-- Weekly Target Dropdown -->
                        <div class="flex items-center gap-2 bg-cream px-3 py-1.5 rounded-full border border-gray-300 text-xs font-bold text-dark">
                            <label for="weekly-goal-select" class="text-gray-600">Goal:</label>
                            <select id="weekly-goal-select" data-action="change-goal"
                                class="bg-transparent font-black text-dark focus:outline-none cursor-pointer">
                                ${[2, 3, 4, 5, 6, 7].map(g => `<option value="${g}" ${prefs.weeklyGoal === g ? 'selected' : ''}>${g} days/wk</option>`).join('')}
                            </select>
                        </div>

                        <!-- Data Management Menu Trigger -->
                        <div class="flex items-center gap-2">
                            <button id="export-data-btn" type="button" data-action="export-data" title="Export Backup"
                                class="px-3.5 py-2 bg-white text-gray-700 border border-gray-300 rounded-full font-bold text-xs hover:bg-black hover:text-white hover:border-black transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                </svg>
                                <span>Backup</span>
                            </button>

                            <button id="import-data-btn" type="button" data-action="trigger-import" title="Restore Data"
                                class="px-3.5 py-2 bg-white text-gray-700 border border-gray-300 rounded-full font-bold text-xs hover:bg-black hover:text-white hover:border-black transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                                </svg>
                                <span>Restore</span>
                            </button>
                            <input id="import-file-input" type="file" accept=".json" class="hidden">
                        </div>
                    </div>
                </div>

                <!-- 4 KPI Metrics Row -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                    
                    <!-- KPI 1: Weekly Goal -->
                    <div class="bg-cream rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <span>Weekly Progress</span>
                                <span class="text-emerald-700 font-black">${weekly.completionPct}%</span>
                            </div>
                            <div class="mt-3 flex items-baseline gap-2">
                                <span class="text-3xl font-black text-dark">${weekly.completedCount}</span>
                                <span class="text-gray-500 font-bold text-sm">/ ${weekly.weeklyGoal} workouts</span>
                            </div>
                            <!-- Progress Bar -->
                            <div class="w-full bg-gray-200 h-2.5 rounded-full mt-3 overflow-hidden">
                                <div class="bg-black h-full rounded-full transition-all duration-500" style="width: ${weekly.completionPct}%"></div>
                            </div>
                        </div>
                        <p class="text-xs text-gray-600 mt-3 font-medium">
                            ${weekly.completedCount >= weekly.weeklyGoal ? 'Goal crushed this week! 🏆' : `${weekly.weeklyGoal - weekly.completedCount} more workouts to reach goal`}
                        </p>
                    </div>

                    <!-- KPI 2: Consistency Streak -->
                    <div class="bg-cream rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <span>Consistency Streak</span>
                                <span class="text-base">🔥</span>
                            </div>
                            <div class="mt-3 flex items-baseline gap-2">
                                <span class="text-3xl font-black text-dark">${streaks.currentStreak}</span>
                                <span class="text-gray-500 font-bold text-sm">${streaks.currentStreak === 1 ? 'Day' : 'Days'}</span>
                            </div>
                        </div>
                        <div class="mt-3 pt-3 border-t border-gray-300 flex items-center justify-between text-xs text-gray-600 font-medium">
                            <span>Best Streak</span>
                            <span class="font-black text-dark">${streaks.longestStreak} ${streaks.longestStreak === 1 ? 'day' : 'days'}</span>
                        </div>
                    </div>

                    <!-- KPI 3: Total Duration -->
                    <div class="bg-cream rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <span>Total Workout Time</span>
                                <span class="text-base">⏱️</span>
                            </div>
                            <div class="mt-3 flex items-baseline gap-2">
                                <span class="text-3xl font-black text-dark">${formatDuration(duration.totalMs)}</span>
                            </div>
                        </div>
                        <div class="mt-3 pt-3 border-t border-gray-300 flex items-center justify-between text-xs text-gray-600 font-medium">
                            <span>Average Session</span>
                            <span class="font-black text-dark">${formatDuration(duration.avgMs)}</span>
                        </div>
                    </div>

                    <!-- KPI 4: Total Completed Volume -->
                    <div class="bg-cream rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <span>Logged Workouts</span>
                                <span class="text-base">📋</span>
                            </div>
                            <div class="mt-3 flex items-baseline gap-2">
                                <span class="text-3xl font-black text-dark">${duration.totalWorkouts}</span>
                                <span class="text-gray-500 font-bold text-sm">${duration.totalWorkouts === 1 ? 'session' : 'sessions'}</span>
                            </div>
                        </div>
                        <div class="mt-3 pt-3 border-t border-gray-300 flex items-center justify-between text-xs text-gray-600 font-medium">
                            <span>This Week</span>
                            <span class="font-black text-dark">${weekly.totalWeeklySets} sets</span>
                        </div>
                    </div>

                </div>
            </div>

            <!-- 7-Day Activity Visualizer Chart -->
            ${renderActivityChartSection(chartData)}

            <!-- Strength & Weight Progression Section -->
            ${renderWeightHistorySection(weightData, prefs.weightUnit)}

            <!-- Workout History Log Section -->
            ${renderWorkoutHistorySection(filteredSessions, sessions.length, prefs.weightUnit)}

            <!-- Safe Modals (Conditional Render) -->
            ${renderModals()}

        </div>
    `;
}

// ─── Component: Activity Chart ────────────────────────────────────────────────

function renderActivityChartSection(chartData) {
    const maxMins = Math.max(45, ...chartData.map(d => d.totalMins));
    const totalWeeklyMins = chartData.reduce((acc, d) => acc + d.totalMins, 0);

    return `
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 class="text-xl font-black text-dark">Weekly Activity Chart</h3>
                    <p class="text-xs text-gray-500 mt-0.5">Daily training sessions and workout durations recorded this week.</p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="px-3.5 py-1.5 bg-cream rounded-full border border-gray-300 text-xs font-black text-dark">
                        ${totalWeeklyMins > 0 ? `${totalWeeklyMins} total mins this week` : 'No workouts this week'}
                    </span>
                </div>
            </div>

            <!-- Activity Chart Grid (7 Columns) -->
            <div class="grid grid-cols-7 gap-2 sm:gap-4 pt-4 pb-2 items-end min-h-[220px]">
                ${chartData.map(col => {
                    const hasWorkout = col.totalMins > 0;
                    const heightPercent = hasWorkout
                        ? Math.max(18, Math.min(100, Math.round((col.totalMins / maxMins) * 100)))
                        : 6;

                    return `
                        <div class="flex flex-col items-center group relative h-full justify-end">
                            
                            <!-- Tooltip on Hover -->
                            <div class="absolute -top-12 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-dark text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
                                ${hasWorkout ? `${col.totalMins}m &bull; ${col.totalSets} sets &bull; ${escapeHtml(col.routines.join(', '))}` : 'Rest Day'}
                            </div>

                            <!-- Duration Pill above Bar -->
                            <div class="mb-2 text-[10px] font-bold text-gray-500 h-4 flex items-center">
                                ${hasWorkout ? `<span class="text-dark font-black">${col.totalMins}m</span>` : '<span class="opacity-0">-</span>'}
                            </div>

                            <!-- Bar Column -->
                            <div class="w-full max-w-[48px] bg-gray-100 rounded-2xl flex flex-col justify-end p-1 h-[140px] border border-gray-200/80 transition-all duration-300 group-hover:border-black">
                                <div class="w-full rounded-xl transition-all duration-500 ${hasWorkout ? (col.isToday ? 'bg-emerald-600' : 'bg-black') : 'bg-transparent'}"
                                    style="height: ${heightPercent}%">
                                </div>
                            </div>

                            <!-- Day Label -->
                            <div class="mt-3 text-center">
                                <p class="text-xs font-black ${col.isToday ? 'text-black' : 'text-gray-700'}">${col.dayName}</p>
                                <span class="text-[10px] font-semibold text-gray-400 ${col.isToday ? 'px-1.5 py-0.5 bg-black text-white rounded-full' : ''}">
                                    ${col.dateNum}
                                </span>
                            </div>

                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Empty State Notice if week is empty -->
            ${totalWeeklyMins === 0 ? `
                <div class="bg-cream rounded-2xl p-4 text-center border border-gray-200 mt-2">
                    <p class="text-xs text-gray-600 font-medium">
                        No training logged for the current week yet. Start an active workout in the <strong class="text-dark">Active Workout</strong> tab to populate this chart!
                    </p>
                </div>
            ` : ''}
        </div>
    `;
}

// ─── Component: Strength & Weight History ─────────────────────────────────────

function renderWeightHistorySection(weightData, weightUnit) {
    const { exerciseNames, statsByExercise } = weightData;

    return `
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 class="text-xl font-black text-dark">Recorded Weight &amp; Strength History</h3>
                    <p class="text-xs text-gray-500 mt-0.5">Track personal records (PRs), logged set weights, and estimated 1RMs.</p>
                </div>

                ${exerciseNames.length > 0 ? `
                    <!-- Exercise Selector Dropdown -->
                    <div class="flex items-center gap-2">
                        <label for="weight-exercise-select" class="text-xs font-bold text-gray-600">Exercise:</label>
                        <select id="weight-exercise-select" data-action="change-weight-exercise"
                            class="bg-cream border border-gray-300 rounded-full px-4 py-2 text-xs font-black text-dark focus:outline-none focus:ring-2 focus:ring-black cursor-pointer">
                            ${exerciseNames.map(name => `
                                <option value="${escapeHtml(name)}" ${selectedWeightExercise === name ? 'selected' : ''}>
                                    ${escapeHtml(name)} (${statsByExercise[name].records.length} sets)
                                </option>
                            `).join('')}
                        </select>
                    </div>
                ` : ''}
            </div>

            ${exerciseNames.length === 0 ? `
                <!-- Empty State: No weights logged yet -->
                <div class="bg-cream rounded-2xl p-8 text-center border border-gray-200">
                    <div class="max-w-md mx-auto space-y-3">
                        <div class="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center mx-auto text-xl">
                            🏋️
                        </div>
                        <h4 class="text-base font-black text-dark">No Weight Data Recorded Yet</h4>
                        <p class="text-xs text-gray-600 leading-relaxed">
                            During your active workouts in the <strong class="text-dark">Active Workout</strong> tab, enter the weight lifted (e.g. 60 ${weightUnit}) next to your sets. Your strength progression, Personal Records (PRs), and estimated 1RMs will automatically be charted here.
                        </p>
                    </div>
                </div>
            ` : `
                <!-- Exercise Stats Cards -->
                ${renderSelectedExerciseStats(statsByExercise[selectedWeightExercise], weightUnit)}
            `}
        </div>
    `;
}

function renderSelectedExerciseStats(stats, weightUnit) {
    if (!stats) return '';

    const { records, maxWeight, max1RM, latestRecord, totalSetsLogged } = stats;

    return `
        <div class="space-y-6 animate-fadeIn">
            <!-- 3 Stat Badges -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-cream rounded-2xl p-4 border border-gray-200">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Personal Record (PR)</p>
                    <p class="text-2xl font-black text-dark mt-1">${maxWeight} <span class="text-sm font-bold text-gray-600">${weightUnit}</span></p>
                    <p class="text-[11px] text-gray-500 mt-0.5">Heaviest successful set logged</p>
                </div>
                <div class="bg-cream rounded-2xl p-4 border border-gray-200">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated 1RM</p>
                    <p class="text-2xl font-black text-dark mt-1">${max1RM} <span class="text-sm font-bold text-gray-600">${weightUnit}</span></p>
                    <p class="text-[11px] text-gray-500 mt-0.5">Calculated via Epley Formula</p>
                </div>
                <div class="bg-cream rounded-2xl p-4 border border-gray-200">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Latest Recorded Set</p>
                    <p class="text-2xl font-black text-dark mt-1">${latestRecord.weight} <span class="text-sm font-bold text-gray-600">${weightUnit} &times; ${latestRecord.reps} reps</span></p>
                    <p class="text-[11px] text-gray-500 mt-0.5">${formatDateShort(latestRecord.date)}</p>
                </div>
            </div>

            <!-- Historical Progression Log -->
            <div class="border border-gray-200 rounded-2xl overflow-hidden">
                <div class="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                    <span class="text-xs font-black text-dark uppercase tracking-wider">Set-by-Set Weight Progression (${totalSetsLogged} sets)</span>
                    <span class="text-[11px] font-semibold text-gray-500">Chronological Log</span>
                </div>
                <div class="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                    ${[...records].reverse().map(rec => {
                        const isPR = rec.weight === maxWeight;
                        return `
                            <div class="px-5 py-3 flex items-center justify-between hover:bg-cream/50 transition text-xs">
                                <div>
                                    <span class="font-bold text-dark">${formatDatePretty(rec.date)}</span>
                                    <span class="text-gray-400 mx-1.5">&bull;</span>
                                    <span class="text-gray-600">Set ${rec.setNumber}</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="font-black text-dark text-sm">${rec.weight} ${weightUnit} &times; ${rec.reps} reps</span>
                                    <span class="text-gray-500 font-semibold text-[11px] hidden sm:inline">(~${rec.estimated1RM} 1RM)</span>
                                    ${isPR ? `<span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-black text-[10px] border border-amber-300">PR 🏆</span>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

// ─── Component: Workout History ───────────────────────────────────────────────

function renderWorkoutHistorySection(filteredSessions, totalAllCount, weightUnit) {
    return `
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            
            <!-- History Header & Filter Controls -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="text-xl font-black text-dark">Completed Workout History</h3>
                        <span class="px-2.5 py-0.5 bg-black text-white rounded-full font-bold text-xs">
                            ${filteredSessions.length} ${filteredSessions.length === 1 ? 'record' : 'records'}
                        </span>
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">Chronological record of every completed and saved training session.</p>
                </div>

                <!-- Search and Status Filters -->
                <div class="flex flex-wrap items-center gap-2.5">
                    <!-- Search Input -->
                    <div class="relative">
                        <input id="history-search-input" type="text" value="${escapeHtml(currentSearchTerm)}"
                            placeholder="Search history..."
                            class="bg-cream border border-gray-300 rounded-full py-1.5 pl-8 pr-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black">
                        <span class="absolute left-2.5 top-2 text-gray-400">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </span>
                    </div>

                    <!-- Status Filter Tabs -->
                    <div class="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
                        <button type="button" data-action="filter-status" data-status="all"
                            class="px-2.5 py-1 text-xs font-bold rounded-full transition cursor-pointer ${currentStatusFilter === 'all' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-black'}">
                            All
                        </button>
                        <button type="button" data-action="filter-status" data-status="completed"
                            class="px-2.5 py-1 text-xs font-bold rounded-full transition cursor-pointer ${currentStatusFilter === 'completed' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-black'}">
                            Complete
                        </button>
                        <button type="button" data-action="filter-status" data-status="partial"
                            class="px-2.5 py-1 text-xs font-bold rounded-full transition cursor-pointer ${currentStatusFilter === 'partial' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-black'}">
                            Partial
                        </button>
                    </div>

                    ${totalAllCount > 0 ? `
                        <!-- Clear All Button -->
                        <button type="button" data-action="open-clear-all" title="Clear all history records"
                            class="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full font-bold text-xs hover:bg-red-600 hover:text-white transition cursor-pointer">
                            Clear History
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- History List -->
            ${totalAllCount === 0 ? `
                <!-- Empty State: No history at all -->
                <div class="bg-cream rounded-2xl p-10 text-center border border-gray-200">
                    <div class="max-w-md mx-auto space-y-4">
                        <div class="w-16 h-16 rounded-full bg-white border border-gray-300 flex items-center justify-center mx-auto text-2xl shadow-sm">
                            🏆
                        </div>
                        <h4 class="text-xl font-black text-dark">No Workout History Records Yet</h4>
                        <p class="text-xs text-gray-600 leading-relaxed">
                            Once you finish your first workout in the <strong class="text-dark">Active Workout</strong> tab, your structured completion records, time duration, sets completed, and weight logs will appear here.
                        </p>
                        <div class="pt-2">
                            <button type="button" data-action="jump-active-workout"
                                class="px-6 py-2.5 bg-black text-white rounded-full font-bold text-xs hover:bg-gray-800 hover:scale-105 active:scale-95 transition shadow cursor-pointer">
                                Start an Active Workout →
                            </button>
                        </div>
                    </div>
                </div>
            ` : filteredSessions.length === 0 ? `
                <!-- Filter Empty State -->
                <div class="bg-cream rounded-2xl p-8 text-center border border-gray-200">
                    <p class="text-xs font-bold text-gray-600">No workout records matched your search or filters.</p>
                    <button type="button" data-action="reset-filters" class="mt-2 text-xs font-black text-dark underline cursor-pointer">
                        Reset Filters
                    </button>
                </div>
            ` : `
                <div class="space-y-4">
                    ${filteredSessions.map(session => renderSessionCard(session, weightUnit)).join('')}
                </div>
            `}

        </div>
    `;
}

function renderSessionCard(session, weightUnit) {
    const isExpanded = expandedSessionIds.has(session.id);
    const exerciseCount = Array.isArray(session.exercises) ? session.exercises.length : 0;
    const isCompleted = session.status === 'completed';

    return `
        <div class="bg-cream rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-gray-400 transition space-y-4" data-session-id="${escapeHtml(session.id)}">
            
            <!-- Card Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-black px-2.5 py-0.5 rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}">
                            ${isCompleted ? 'Completed ✓' : 'Partial ⏱️'}
                        </span>
                        <span class="text-xs font-bold text-gray-500">${escapeHtml(session.dayName)}</span>
                    </div>
                    <h4 class="text-lg font-black text-dark mt-1">${escapeHtml(session.routineName)}</h4>
                    <p class="text-xs text-gray-500">${formatDatePretty(session.finishedAt || session.startedAt)}</p>
                </div>

                <!-- Metric Badges & Action Buttons -->
                <div class="flex flex-wrap items-center gap-2 sm:self-center">
                    <span class="px-3 py-1 bg-white rounded-full border border-gray-300 text-xs font-black text-dark">
                        ⏱️ ${formatDuration(session.elapsedMs)}
                    </span>
                    <span class="px-3 py-1 bg-white rounded-full border border-gray-300 text-xs font-black text-dark">
                        💪 ${session.totalSetsCompleted}/${session.totalSetsPlanned} sets
                    </span>
                    <span class="px-3 py-1 bg-white rounded-full border border-gray-300 text-xs font-black text-dark">
                        📋 ${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}
                    </span>

                    <!-- Expand / Collapse Breakdown -->
                    <button type="button" data-action="toggle-expand" data-id="${escapeHtml(session.id)}"
                        class="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-full font-bold text-xs hover:bg-gray-100 transition cursor-pointer">
                        ${isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
                    </button>

                    <!-- Delete Button -->
                    <button type="button" data-action="confirm-delete" data-id="${escapeHtml(session.id)}" title="Delete workout record"
                        class="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition cursor-pointer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Expandable Detailed Exercise Breakdown -->
            ${isExpanded ? `
                <div class="pt-4 border-t border-gray-200 space-y-3 animate-fadeIn">
                    <p class="text-xs font-black text-gray-500 uppercase tracking-wider">Exercise Breakdown</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${(session.exercises || []).map(ex => `
                            <div class="bg-white rounded-xl p-3 border border-gray-200 text-xs space-y-1.5">
                                <div class="flex items-center justify-between font-black text-dark">
                                    <span>${escapeHtml(ex.name)}</span>
                                    <span class="text-[10px] text-gray-500 font-semibold uppercase">${escapeHtml(ex.muscleGroup || '')}</span>
                                </div>
                                <div class="flex flex-wrap gap-1.5 pt-1">
                                    ${(ex.sets || []).map(s => `
                                        <span class="px-2 py-0.5 rounded-md font-semibold text-[11px] ${s.completed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}">
                                            S${s.setNumber}: ${s.completed ? `${s.reps} reps${s.weight ? ` @ ${s.weight}${weightUnit}` : ''}` : 'Skipped'}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

        </div>
    `;
}

// ─── Modal Dialogs (Deletion Confirmations) ───────────────────────────────────

function renderModals() {
    let modalsHtml = '';

    // Single Record Deletion Modal
    if (pendingDeleteId) {
        const sessions = getCompletedSessions();
        const target = sessions.find(s => s.id === pendingDeleteId);
        const routineName = target ? target.routineName : 'this workout';
        const dateStr = target ? formatDatePretty(target.finishedAt || target.startedAt) : '';

        modalsHtml += `
            <div id="delete-confirm-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true">
                <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 animate-slide-up">
                    <div class="w-14 h-14 rounded-full bg-red-100 border-2 border-red-300 text-red-600 flex items-center justify-center mx-auto text-2xl">
                        ⚠️
                    </div>
                    <div class="text-center space-y-2">
                        <h3 class="text-xl font-black text-dark">Delete Workout Record?</h3>
                        <p class="text-xs text-gray-600 leading-relaxed">
                            Are you sure you want to permanently delete the record for <strong class="text-dark">${escapeHtml(routineName)}</strong> (${escapeHtml(dateStr)})?
                        </p>
                        <p class="text-[11px] text-red-600 font-bold">
                            This action cannot be undone and will recalculate all weekly stats and streaks.
                        </p>
                    </div>
                    <div class="flex items-center justify-end gap-3 pt-2">
                        <button type="button" data-action="cancel-delete"
                            class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full font-bold text-xs hover:bg-gray-200 transition cursor-pointer">
                            Cancel
                        </button>
                        <button type="button" data-action="execute-delete"
                            class="px-5 py-2.5 bg-red-600 text-white rounded-full font-bold text-xs hover:bg-red-700 hover:scale-105 active:scale-95 transition shadow cursor-pointer">
                            Yes, Delete Record
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Clear All History Modal
    if (isClearAllModalOpen) {
        modalsHtml += `
            <div id="clear-all-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true">
                <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 animate-slide-up">
                    <div class="w-14 h-14 rounded-full bg-red-100 border-2 border-red-400 text-red-600 flex items-center justify-center mx-auto text-2xl">
                        🗑️
                    </div>
                    <div class="text-center space-y-2">
                        <h3 class="text-xl font-black text-dark">Clear All Workout History?</h3>
                        <p class="text-xs text-gray-600 leading-relaxed">
                            This will permanently delete all saved workout records and reset consistency streaks and weekly volume calculations.
                        </p>
                        <p class="text-[11px] text-red-600 font-bold">
                            We recommend downloading a backup first using the "Backup" button.
                        </p>
                    </div>
                    <div class="flex items-center justify-end gap-3 pt-2">
                        <button type="button" data-action="cancel-clear-all"
                            class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full font-bold text-xs hover:bg-gray-200 transition cursor-pointer">
                            Cancel
                        </button>
                        <button type="button" data-action="execute-clear-all"
                            class="px-5 py-2.5 bg-red-600 text-white rounded-full font-bold text-xs hover:bg-red-700 hover:scale-105 active:scale-95 transition shadow cursor-pointer">
                            Yes, Clear All Records
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    return modalsHtml;
}

// ─── Event Handling ──────────────────────────────────────────────────────────

function setupEventListeners() {
    if (!container) return;

    container.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;

        switch (action) {
            case 'set-unit':
                savePreferences({ weightUnit: target.dataset.unit });
                renderAnalytics();
                break;

            case 'toggle-expand':
                {
                    const id = target.dataset.id;
                    if (expandedSessionIds.has(id)) {
                        expandedSessionIds.delete(id);
                    } else {
                        expandedSessionIds.add(id);
                    }
                    renderAnalytics();
                }
                break;

            case 'confirm-delete':
                pendingDeleteId = target.dataset.id;
                renderAnalytics();
                break;

            case 'cancel-delete':
                pendingDeleteId = null;
                renderAnalytics();
                break;

            case 'execute-delete':
                if (pendingDeleteId) {
                    deleteCompletedSession(pendingDeleteId);
                    pendingDeleteId = null;
                    renderAnalytics();
                }
                break;

            case 'open-clear-all':
                isClearAllModalOpen = true;
                renderAnalytics();
                break;

            case 'cancel-clear-all':
                isClearAllModalOpen = false;
                renderAnalytics();
                break;

            case 'execute-clear-all':
                clearCompletedSessions();
                isClearAllModalOpen = false;
                renderAnalytics();
                break;

            case 'filter-status':
                currentStatusFilter = target.dataset.status;
                renderAnalytics();
                break;

            case 'reset-filters':
                currentSearchTerm = '';
                currentStatusFilter = 'all';
                renderAnalytics();
                break;

            case 'jump-active-workout':
                {
                    const trackerTabBtn = document.getElementById('tab-tracker');
                    if (trackerTabBtn) trackerTabBtn.click();
                }
                break;

            case 'export-data':
                handleExportData();
                break;

            case 'trigger-import':
                {
                    const fileInput = document.getElementById('import-file-input');
                    if (fileInput) fileInput.click();
                }
                break;
        }
    });

    // Handle Search Input
    container.addEventListener('input', (e) => {
        if (e.target.id === 'history-search-input') {
            currentSearchTerm = e.target.value;
            // Debounce-free light filter or re-render
            const sessionsList = container.querySelector('.space-y-4');
            // Re-render whole panel to maintain state
            renderAnalytics();
            const newSearch = container.querySelector('#history-search-input');
            if (newSearch) {
                newSearch.focus();
                newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
            }
        }
    });

    // Handle Dropdowns (Weekly Goal & Weight Exercise)
    container.addEventListener('change', (e) => {
        if (e.target.id === 'weekly-goal-select') {
            const goal = parseInt(e.target.value, 10);
            if (goal >= 1 && goal <= 7) {
                savePreferences({ weeklyGoal: goal });
                renderAnalytics();
            }
        } else if (e.target.id === 'weight-exercise-select') {
            selectedWeightExercise = e.target.value;
            renderAnalytics();
        } else if (e.target.id === 'import-file-input') {
            handleImportFile(e.target.files);
        }
    });

    // ESC key closes modals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (pendingDeleteId || isClearAllModalOpen) {
                pendingDeleteId = null;
                isClearAllModalOpen = false;
                renderAnalytics();
            }
        }
    });
}

// ─── Import / Export Handlers ────────────────────────────────────────────────

function handleExportData() {
    try {
        const jsonStr = exportAllData();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = getDayString(new Date());
        a.href = url;
        a.download = `force-fitness-backup-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Export failed:', e);
        alert('Failed to export data: ' + e.message);
    }
}

function handleImportFile(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const result = importAllData(e.target.result);
            if (result && result.success) {
                renderAnalytics();
                alert('Force Fitness data imported successfully!');
            } else {
                alert('Failed to import data: ' + (result?.error || 'Invalid format'));
            }
        } catch (err) {
            console.error('Import parse error:', err);
            alert('Failed to parse backup file: ' + err.message);
        }
    };

    reader.readAsText(file);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function onAnalyticsTabActivated() {
    renderAnalytics();
}

export function initAnalytics() {
    container = document.getElementById('view-analytics');
    if (!container) return;

    setupEventListeners();
    renderAnalytics();

    // Listen for workout history updates from active tracker or editor
    window.addEventListener('workout-history-updated', () => {
        if (container && !container.classList.contains('hidden')) {
            renderAnalytics();
        }
    });

    // Listen for preference changes
    window.addEventListener('preferences-updated', () => {
        if (container && !container.classList.contains('hidden')) {
            renderAnalytics();
        }
    });
}
