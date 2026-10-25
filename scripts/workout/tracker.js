/**
 * Force Fitness — Active Workout Tracker (Phase 4)
 * Real-time workout execution with set tracking, rest timer, pause/resume,
 * session persistence, and structured completion records.
 */

import {
    getSchedule,
    getActiveSession,
    saveActiveSession,
    clearActiveSession,
    addCompletedSession
} from './storage.js';
import { escapeHtml } from './utils.js';

// ─── State ───────────────────────────────────────────────────────────────────

let session = null;
let animFrameId = null;
let container = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseRestSeconds(restStr) {
    if (!restStr) return 90;
    const match = String(restStr).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 90;
}

function parseTargetReps(repsStr) {
    const str = String(repsStr || '10');
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 10;
}

function formatTime(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
        return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getElapsedMs() {
    if (!session) return 0;
    if (session.isPaused && session.lastPauseAt) {
        return (session.lastPauseAt - session.startedAt) - session.pausedMs;
    }
    return (Date.now() - session.startedAt) - session.pausedMs;
}

function getRestRemainingMs() {
    if (!session || !session.isResting || !session.restStartedAt) return 0;
    let elapsed;
    if (session.isPaused && session.lastPauseAt) {
        elapsed = (session.lastPauseAt - session.restStartedAt) - session.restPausedMs;
    } else {
        elapsed = (Date.now() - session.restStartedAt) - session.restPausedMs;
    }
    return Math.max(0, session.restDurationMs - elapsed);
}

function getTotalSets() {
    if (!session) return 0;
    return session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
}

function getCompletedSetsCount() {
    if (!session) return 0;
    return session.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
}

function isSessionComplete() {
    if (!session) return false;
    return session.exercises.every(ex => ex.sets.every(s => s.completed));
}

// ─── Session Lifecycle ───────────────────────────────────────────────────────

function buildSessionFromDay(day) {
    return {
        dayId: day.dayId,
        dayName: day.dayName,
        routineName: day.routineName,
        startedAt: Date.now(),
        pausedMs: 0,
        lastPauseAt: null,
        lastSavedAt: Date.now(),
        isPaused: false,
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        isResting: false,
        restStartedAt: null,
        restDurationMs: null,
        restPausedMs: 0,
        exercises: day.exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            muscleGroup: ex.muscleGroup || 'General',
            equipment: ex.equipment || 'Bodyweight',
            notes: ex.notes || '',
            targetReps: ex.reps || '10-12',
            restSeconds: parseRestSeconds(ex.rest),
            sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
                setNumber: i + 1,
                targetReps: parseTargetReps(ex.reps),
                reps: null,
                weight: null,
                completed: false
            }))
        }))
    };
}

function startSession(dayId) {
    const existing = getActiveSession();
    if (existing) {
        const ok = confirm(
            `You have an unfinished "${existing.routineName}" session. Starting a new workout will discard it. Continue?`
        );
        if (!ok) return;
        clearActiveSession();
    }

    const schedule = getSchedule();
    const day = schedule.find(d => d.dayId === dayId);
    if (!day || day.isRest || !day.exercises?.length) return;

    session = buildSessionFromDay(day);
    saveActiveSession(session);
    startTimerLoop();
    renderActiveWorkout();
}

function restoreSession() {
    const saved = getActiveSession();
    if (!saved) return false;
    session = saved;

    // Auto-pause restored sessions and account for the time gap
    if (!session.isPaused) {
        const gap = session.lastSavedAt ? (Date.now() - session.lastSavedAt) : 0;
        session.pausedMs += gap;
        session.isPaused = true;
        session.lastPauseAt = Date.now();
        if (session.isResting) {
            session.restPausedMs += gap;
        }
    }

    // If rest timer already expired while away, clear it
    if (session.isResting) {
        const remaining = getRestRemainingMs();
        if (remaining <= 0) {
            session.isResting = false;
            session.restStartedAt = null;
            session.restDurationMs = null;
            session.restPausedMs = 0;
            advanceToNextSet();
        }
    }

    saveActiveSession(session);
    startTimerLoop();
    return true;
}

function pauseSession() {
    if (!session || session.isPaused) return;
    session.isPaused = true;
    session.lastPauseAt = Date.now();
    saveActiveSession(session);
    renderActiveWorkout();
}

function resumeSession() {
    if (!session || !session.isPaused) return;
    const pausedDuration = Date.now() - session.lastPauseAt;
    session.pausedMs += pausedDuration;
    if (session.isResting) {
        session.restPausedMs += pausedDuration;
    }
    session.isPaused = false;
    session.lastPauseAt = null;
    saveActiveSession(session);
    renderActiveWorkout();
}

function abandonSession() {
    const ok = confirm('Are you sure you want to abandon this workout?\nAll progress will be lost.');
    if (!ok) return;
    stopTimerLoop();
    session = null;
    clearActiveSession();
    renderStartScreen();
}

function finishSession() {
    if (!session) return;
    stopTimerLoop();

    const record = {
        id: `session-${session.startedAt}`,
        dayId: session.dayId,
        dayName: session.dayName,
        routineName: session.routineName,
        startedAt: new Date(session.startedAt).toISOString(),
        finishedAt: new Date().toISOString(),
        elapsedMs: getElapsedMs(),
        exercises: session.exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            sets: ex.sets.map(s => ({
                setNumber: s.setNumber,
                reps: s.completed ? (s.reps ?? s.targetReps) : 0,
                weight: s.weight ?? 0,
                completed: s.completed
            }))
        })),
        totalSetsPlanned: getTotalSets(),
        totalSetsCompleted: getCompletedSetsCount(),
        status: isSessionComplete() ? 'completed' : 'partial'
    };

    addCompletedSession(record);
    clearActiveSession();

    const elapsed = getElapsedMs();
    session = null;
    renderCompletionScreen(record, elapsed);
}

// ─── Set & Exercise Logic ────────────────────────────────────────────────────

function completeSet(exIdx, setIdx, reps, weight) {
    if (!session) return;
    const exercise = session.exercises[exIdx];
    if (!exercise) return;
    const set = exercise.sets[setIdx];
    if (!set || set.completed) return;

    set.completed = true;
    set.reps = reps;
    set.weight = weight || null;

    // Check if more uncompleted sets remain for this exercise
    const nextUncompleted = exercise.sets.findIndex(s => !s.completed);
    if (nextUncompleted !== -1) {
        session.currentSetIndex = nextUncompleted;
        // Start rest timer
        session.isResting = true;
        session.restStartedAt = Date.now();
        session.restDurationMs = exercise.restSeconds * 1000;
        session.restPausedMs = 0;
    } else {
        // All sets done for this exercise — auto-advance
        session.isResting = false;
        session.restStartedAt = null;
        session.restDurationMs = null;
        session.restPausedMs = 0;

        const nextExIdx = session.exercises.findIndex(
            (ex, idx) => idx > exIdx && ex.sets.some(s => !s.completed)
        );
        if (nextExIdx !== -1) {
            session.currentExerciseIndex = nextExIdx;
            session.currentSetIndex = session.exercises[nextExIdx].sets.findIndex(s => !s.completed);
        }
    }

    saveActiveSession(session);
    renderActiveWorkout();
}

function skipRest() {
    if (!session || !session.isResting) return;
    session.isResting = false;
    session.restStartedAt = null;
    session.restDurationMs = null;
    session.restPausedMs = 0;
    saveActiveSession(session);
    renderActiveWorkout();
}

function advanceToNextSet() {
    if (!session) return;
    const currentEx = session.exercises[session.currentExerciseIndex];
    if (currentEx) {
        const nextSet = currentEx.sets.findIndex(s => !s.completed);
        if (nextSet !== -1) {
            session.currentSetIndex = nextSet;
            return;
        }
    }
    for (let i = session.currentExerciseIndex + 1; i < session.exercises.length; i++) {
        const nextSet = session.exercises[i].sets.findIndex(s => !s.completed);
        if (nextSet !== -1) {
            session.currentExerciseIndex = i;
            session.currentSetIndex = nextSet;
            return;
        }
    }
}

function goToExercise(exIdx) {
    if (!session || exIdx < 0 || exIdx >= session.exercises.length) return;
    session.currentExerciseIndex = exIdx;
    const firstUncompleted = session.exercises[exIdx].sets.findIndex(s => !s.completed);
    session.currentSetIndex = firstUncompleted !== -1 ? firstUncompleted : 0;
    session.isResting = false;
    session.restStartedAt = null;
    session.restDurationMs = null;
    session.restPausedMs = 0;
    saveActiveSession(session);
    renderActiveWorkout();
}

// ─── Timer Loop ──────────────────────────────────────────────────────────────

function startTimerLoop() {
    stopTimerLoop();
    let lastRestCheck = 0;

    function tick(timestamp) {
        updateTimerDisplays();

        // Throttle rest-expiry checks to every ~250ms
        if (session && session.isResting && !session.isPaused && timestamp - lastRestCheck > 250) {
            lastRestCheck = timestamp;
            const remaining = getRestRemainingMs();
            if (remaining <= 0) {
                session.isResting = false;
                session.restStartedAt = null;
                session.restDurationMs = null;
                session.restPausedMs = 0;
                advanceToNextSet();
                saveActiveSession(session);
                playRestEndSound();
                renderActiveWorkout();
            }
        }

        animFrameId = requestAnimationFrame(tick);
    }
    animFrameId = requestAnimationFrame(tick);
}

function stopTimerLoop() {
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
}

function updateTimerDisplays() {
    const elapsedEl = document.getElementById('tracker-elapsed');
    if (elapsedEl) elapsedEl.textContent = formatTime(getElapsedMs());

    if (session && session.isResting) {
        const remaining = getRestRemainingMs();
        const restTimeEl = document.getElementById('rest-timer-display');
        if (restTimeEl) restTimeEl.textContent = formatTime(remaining);

        const ringEl = document.getElementById('rest-timer-ring');
        if (ringEl && session.restDurationMs > 0) {
            const circumference = 2 * Math.PI * 70;
            const progress = remaining / session.restDurationMs;
            ringEl.setAttribute('stroke-dashoffset', String(circumference * (1 - progress)));
        }
    }

    const progressEl = document.getElementById('tracker-progress-bar');
    if (progressEl) {
        const total = getTotalSets();
        const done = getCompletedSetsCount();
        progressEl.style.width = `${total > 0 ? (done / total) * 100 : 0}%`;
    }

    const progressTextEl = document.getElementById('tracker-progress-text');
    if (progressTextEl) {
        progressTextEl.textContent = `${getCompletedSetsCount()} / ${getTotalSets()} sets`;
    }
}

function playRestEndSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.value = 0.25;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.stop(ctx.currentTime + 0.35);
    } catch (_) { /* audio not supported — fail silently */ }
}

// ─── Rendering: Start Screen ─────────────────────────────────────────────────

function renderStartScreen() {
    if (!container) return;
    const schedule = getSchedule();
    const trainingDays = schedule.filter(d => !d.isRest && d.exercises?.length > 0);
    const saved = getActiveSession();

    let resumeBanner = '';
    if (saved) {
        const elapsed = saved.lastPauseAt
            ? (saved.lastPauseAt - saved.startedAt) - saved.pausedMs
            : 0;
        const completedSets = saved.exercises.reduce(
            (sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0
        );
        const totalSets = saved.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        resumeBanner = `
            <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl p-6 shadow-sm animate-fadeIn">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider">Unfinished Session</span>
                        </div>
                        <h3 class="text-lg font-black text-dark">${escapeHtml(saved.routineName)}</h3>
                        <p class="text-sm text-gray-600 mt-0.5">
                            ${escapeHtml(saved.dayName)} &bull; ${completedSets}/${totalSets} sets &bull; ${formatTime(elapsed)} elapsed
                        </p>
                    </div>
                    <button data-action="resume-saved"
                        class="px-6 py-3 bg-emerald-600 text-white rounded-full font-bold text-sm hover:bg-emerald-700 hover:scale-105 active:scale-95 transition shadow-md cursor-pointer whitespace-nowrap">
                        Resume Session →
                    </button>
                </div>
            </div>`;
    }

    let dayCardsHtml = '';
    if (trainingDays.length === 0) {
        dayCardsHtml = `
            <div class="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 text-center shadow-md col-span-full">
                <div class="max-w-sm mx-auto space-y-3">
                    <div class="w-14 h-14 rounded-full bg-cream border-2 border-gray-200 flex items-center justify-center mx-auto">
                        <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                    </div>
                    <h3 class="text-lg font-black text-dark">No Training Days</h3>
                    <p class="text-sm text-gray-500 leading-relaxed">
                        Add exercises to your weekly schedule first, then come back here to start a workout session.
                    </p>
                </div>
            </div>`;
    } else {
        dayCardsHtml = trainingDays.map(day => {
            const totalSets = day.exercises.reduce((s, e) => s + (e.sets || 3), 0);
            return `
                <div class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div class="p-5 space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">${escapeHtml(day.dayName)}</span>
                            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                        </div>
                        <h3 class="text-base font-black text-dark leading-tight">${escapeHtml(day.routineName)}</h3>
                        <div class="flex flex-wrap gap-2">
                            <span class="px-2 py-0.5 bg-cream text-gray-600 rounded text-xs font-semibold">
                                ${day.exercises.length} exercise${day.exercises.length !== 1 ? 's' : ''}
                            </span>
                            <span class="px-2 py-0.5 bg-cream text-gray-600 rounded text-xs font-semibold">
                                ${totalSets} sets
                            </span>
                        </div>
                    </div>
                    <div class="px-5 pb-5">
                        <button data-action="start-session" data-day-id="${day.dayId}"
                            class="w-full py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 active:scale-[0.97] transition cursor-pointer">
                            Start Workout →
                        </button>
                    </div>
                </div>`;
        }).join('');
    }

    container.innerHTML = `
        <div class="space-y-6 animate-fadeIn">
            ${resumeBanner}

            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-11 h-11 rounded-full bg-cream border-2 border-black flex items-center justify-center shrink-0">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xl font-black text-dark">Ready to Train?</h2>
                        <p class="text-sm text-gray-500">Select a training day to begin your session.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${dayCardsHtml}
                </div>
            </div>
        </div>`;
}

// ─── Rendering: Active Workout ───────────────────────────────────────────────

function renderActiveWorkout() {
    if (!session || !container) return;

    const currentEx = session.exercises[session.currentExerciseIndex];
    const allDone = isSessionComplete();
    const totalSets = getTotalSets();
    const completedSets = getCompletedSetsCount();
    const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

    container.innerHTML = `
        <div class="space-y-5 animate-fadeIn">
            <!-- Top Control Bar -->
            <div class="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-sm">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-cream flex items-center justify-center border border-gray-200 shrink-0">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Elapsed</p>
                            <p id="tracker-elapsed" class="text-2xl font-black text-dark tabular-nums leading-none">${formatTime(getElapsedMs())}</p>
                        </div>
                    </div>

                    <div class="flex-1 max-w-xs w-full">
                        <div class="flex justify-between items-center mb-1.5">
                            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                            <span id="tracker-progress-text" class="text-xs font-black text-dark">${completedSets} / ${totalSets} sets</span>
                        </div>
                        <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div id="tracker-progress-bar" class="h-full bg-black rounded-full transition-all duration-500 ease-out" style="width: ${progressPct}%"></div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                        <button data-action="${session.isPaused ? 'resume' : 'pause'}"
                            class="px-4 py-2 rounded-full font-bold text-xs border-2 transition cursor-pointer ${
                                session.isPaused
                                    ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                            }">
                            ${session.isPaused ? '▶ Resume' : '⏸ Pause'}
                        </button>
                        <button data-action="abandon"
                            class="px-4 py-2 rounded-full font-bold text-xs text-red-500 border-2 border-red-200 hover:bg-red-50 transition cursor-pointer">
                            ✕ Abandon
                        </button>
                    </div>
                </div>
                ${session.isPaused ? `
                    <div class="mt-3 text-center">
                        <span class="inline-flex px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full font-bold text-xs animate-timer-pulse">
                            ⏸ Session Paused
                        </span>
                    </div>` : ''}
            </div>

            <!-- Exercise Breadcrumbs -->
            ${renderExerciseBreadcrumbs()}

            <!-- Current Exercise Card -->
            ${currentEx ? renderExerciseCard(currentEx, session.currentExerciseIndex) : ''}

            <!-- Sets Section -->
            ${currentEx ? renderSetsSection(currentEx, session.currentExerciseIndex) : ''}

            <!-- Navigation -->
            ${renderNavigationBar(allDone)}

            <!-- Rest Timer Overlay -->
            ${session.isResting && !session.isPaused ? renderRestTimer() : ''}
        </div>`;
}

function renderExerciseBreadcrumbs() {
    if (!session) return '';
    const pills = session.exercises.map((ex, idx) => {
        const allDone = ex.sets.every(s => s.completed);
        const isCurrent = idx === session.currentExerciseIndex;
        const hasSomeDone = ex.sets.some(s => s.completed);

        let pillClass, label;
        if (allDone) {
            pillClass = 'bg-emerald-100 text-emerald-700 border-emerald-300';
            label = '✓';
        } else if (isCurrent) {
            pillClass = 'bg-black text-white border-black shadow-md scale-110';
            label = idx + 1;
        } else if (hasSomeDone) {
            pillClass = 'bg-amber-100 text-amber-700 border-amber-300';
            label = idx + 1;
        } else {
            pillClass = 'bg-gray-100 text-gray-400 border-gray-200';
            label = idx + 1;
        }

        return `
            <button data-action="go-exercise" data-exercise-index="${idx}"
                class="w-9 h-9 rounded-full border-2 font-bold text-xs flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 ${pillClass}"
                title="${escapeHtml(ex.name)}">
                ${label}
            </button>`;
    }).join('');

    return `
        <div class="flex items-center justify-center gap-2 flex-wrap py-1">
            ${pills}
        </div>`;
}

function renderExerciseCard(exercise, exIdx) {
    const totalExercises = session.exercises.length;
    const exCompletedSets = exercise.sets.filter(s => s.completed).length;
    const exTotalSets = exercise.sets.length;
    const exDone = exCompletedSets === exTotalSets;

    return `
        <div class="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm ${exDone ? 'ring-2 ring-emerald-200' : ''}">
            <div class="flex items-start justify-between gap-4 mb-3">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Exercise ${exIdx + 1} of ${totalExercises}
                </span>
                ${exDone ? '<span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">✓ Complete</span>' : ''}
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-dark leading-tight mb-3">${escapeHtml(exercise.name)}</h2>
            <div class="flex flex-wrap gap-2 mb-1">
                <span class="px-3 py-1 bg-black text-white rounded-full text-xs font-bold">${escapeHtml(exercise.muscleGroup)}</span>
                <span class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">${escapeHtml(exercise.equipment)}</span>
                <span class="px-3 py-1 bg-cream text-gray-600 rounded-full text-xs font-bold">
                    ${exercise.targetReps} reps &bull; ${exercise.restSeconds}s rest
                </span>
            </div>
            ${exercise.notes ? `
                <div class="mt-4 bg-cream rounded-xl p-4 border border-gray-200">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">💡 Coach Notes</p>
                    <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(exercise.notes)}</p>
                </div>` : ''}
        </div>`;
}

function renderSetsSection(exercise, exIdx) {
    const completedCount = exercise.sets.filter(s => s.completed).length;

    const setRows = exercise.sets.map((set, sIdx) => {
        if (set.completed) {
            // Completed set row — compact with checkmark
            return `
                <div class="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl" data-set-row>
                    <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                    <div class="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span class="text-sm font-bold text-emerald-800">Set ${set.setNumber}</span>
                        <span class="text-sm text-emerald-700">${set.reps ?? set.targetReps} reps</span>
                        ${set.weight ? `<span class="text-sm text-emerald-600">${set.weight} lbs</span>` : ''}
                    </div>
                </div>`;
        }

        const isActive = sIdx === session.currentSetIndex;
        if (isActive) {
            // Active set row — expanded with inputs
            return `
                <div class="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-3 tracker-active-set" data-set-row>
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            ${set.setNumber}
                        </div>
                        <span class="font-black text-dark text-sm">Set ${set.setNumber}</span>
                        <span class="text-xs text-gray-500">Target: ${exercise.targetReps} reps</span>
                    </div>
                    <div class="flex flex-wrap items-end gap-3">
                        <div class="flex flex-col">
                            <label for="reps-input-${exIdx}-${sIdx}" class="text-[10px] font-bold text-gray-500 uppercase mb-1">Reps</label>
                            <input type="number" id="reps-input-${exIdx}-${sIdx}"
                                class="set-input w-20 px-3 py-2 border-2 border-gray-300 rounded-xl text-center font-bold text-dark text-sm focus:border-black focus:outline-none transition"
                                value="${set.targetReps}" min="0" max="999" />
                        </div>
                        <div class="flex flex-col">
                            <label for="weight-input-${exIdx}-${sIdx}" class="text-[10px] font-bold text-gray-500 uppercase mb-1">Weight (lbs)</label>
                            <input type="number" id="weight-input-${exIdx}-${sIdx}"
                                class="set-input w-24 px-3 py-2 border-2 border-gray-300 rounded-xl text-center font-bold text-dark text-sm focus:border-black focus:outline-none transition"
                                placeholder="—" min="0" max="9999" step="2.5" />
                        </div>
                        <button data-action="complete-set" data-exercise-index="${exIdx}" data-set-index="${sIdx}"
                            class="px-5 py-2 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 active:scale-95 transition cursor-pointer flex items-center gap-1.5 shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                            Complete
                        </button>
                    </div>
                </div>`;
        }

        // Future set row — greyed out
        return `
            <div class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl opacity-50" data-set-row>
                <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm shrink-0">
                    ${set.setNumber}
                </div>
                <span class="text-sm text-gray-500">Set ${set.setNumber} &bull; ${exercise.targetReps} reps</span>
            </div>`;
    }).join('');

    return `
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-black text-dark">Sets</h3>
                <span class="text-xs font-bold text-gray-500">
                    ${completedCount} of ${exercise.sets.length} completed
                </span>
            </div>
            <div class="space-y-2">
                ${setRows}
            </div>
        </div>`;
}

function renderRestTimer() {
    if (!session || !session.isResting) return '';
    const remaining = getRestRemainingMs();
    const circumference = 2 * Math.PI * 70;
    const progress = session.restDurationMs > 0 ? remaining / session.restDurationMs : 0;
    const dashOffset = circumference * (1 - progress);

    const currentEx = session.exercises[session.currentExerciseIndex];
    const nextSetNum = session.currentSetIndex + 1;
    const totalSetsForEx = currentEx ? currentEx.sets.length : 0;

    return `
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="rest-overlay">
            <div class="bg-white rounded-3xl p-8 sm:p-10 text-center max-w-sm w-full shadow-2xl animate-slide-up">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Rest Period</p>

                <div class="relative mx-auto w-40 h-40 mb-5">
                    <svg class="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="70" stroke="#e5e7eb" stroke-width="8" fill="none" />
                        <circle id="rest-timer-ring" cx="80" cy="80" r="70" stroke="#000" stroke-width="8" fill="none"
                            stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
                            stroke-linecap="round" class="timer-ring-circle" />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span id="rest-timer-display" class="text-3xl font-black text-dark tabular-nums">${formatTime(remaining)}</span>
                    </div>
                </div>

                <p class="text-sm text-gray-600 mb-6">
                    Next: <span class="font-bold text-dark">Set ${nextSetNum}</span> of ${totalSetsForEx}
                </p>

                <button data-action="skip-rest"
                    class="px-6 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 active:scale-95 transition cursor-pointer shadow-md">
                    Skip Rest →
                </button>
            </div>
        </div>`;
}

function renderNavigationBar(allDone) {
    if (!session) return '';
    const exIdx = session.currentExerciseIndex;
    const totalExercises = session.exercises.length;
    const hasPrev = exIdx > 0;

    // Find next exercise with uncompleted sets
    const hasNextExercise = session.exercises.findIndex(
        (ex, idx) => idx > exIdx && ex.sets.some(s => !s.completed)
    ) !== -1;

    if (allDone) {
        return `
            <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 border-2 border-emerald-200 text-center shadow-sm">
                <p class="text-emerald-700 font-bold text-sm mb-3">🎉 All sets completed!</p>
                <button data-action="finish"
                    class="px-8 py-3 bg-emerald-600 text-white rounded-full font-black text-base hover:bg-emerald-700 hover:scale-105 active:scale-95 transition cursor-pointer shadow-lg">
                    Complete Workout 🏁
                </button>
            </div>`;
    }

    return `
        <div class="flex items-center justify-between gap-3">
            ${hasPrev ? `
                <button data-action="go-exercise" data-exercise-index="${exIdx - 1}"
                    class="px-5 py-2.5 bg-white text-gray-700 border-2 border-gray-200 rounded-full font-bold text-sm hover:bg-gray-100 active:scale-95 transition cursor-pointer">
                    ← Previous
                </button>` : '<div></div>'}

            <div class="flex items-center gap-2">
                <button data-action="finish"
                    class="px-5 py-2.5 bg-gray-100 text-gray-600 border-2 border-gray-200 rounded-full font-bold text-xs hover:bg-gray-200 active:scale-95 transition cursor-pointer">
                    Finish Early
                </button>
                ${hasNextExercise ? `
                    <button data-action="go-exercise" data-exercise-index="${session.exercises.findIndex((ex, idx) => idx > exIdx && ex.sets.some(s => !s.completed))}"
                        class="px-5 py-2.5 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 hover:scale-105 active:scale-95 transition cursor-pointer shadow-md">
                        Next Exercise →
                    </button>` : ''}
            </div>
        </div>`;
}

// ─── Rendering: Completion Screen ────────────────────────────────────────────

function renderCompletionScreen(record, elapsedMs) {
    if (!container) return;
    const exerciseCount = record.exercises.length;

    container.innerHTML = `
        <div class="space-y-6 animate-fadeIn">
            <div class="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-md text-center">
                <div class="max-w-md mx-auto space-y-6">

                    <div class="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-500 flex items-center justify-center mx-auto animate-slide-up">
                        <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>

                    <div>
                        <h2 class="text-3xl sm:text-4xl font-black text-dark">
                            ${record.status === 'completed' ? 'Workout Complete! 🎉' : 'Session Saved ✓'}
                        </h2>
                        <p class="text-gray-500 mt-2 text-sm">${escapeHtml(record.routineName)} &bull; ${escapeHtml(record.dayName)}</p>
                    </div>

                    <div class="grid grid-cols-3 gap-4 pt-2">
                        <div class="bg-cream rounded-2xl p-4 border border-gray-200">
                            <p class="text-2xl font-black text-dark">${formatTime(elapsedMs)}</p>
                            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Duration</p>
                        </div>
                        <div class="bg-cream rounded-2xl p-4 border border-gray-200">
                            <p class="text-2xl font-black text-dark">${record.totalSetsCompleted}/${record.totalSetsPlanned}</p>
                            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Sets</p>
                        </div>
                        <div class="bg-cream rounded-2xl p-4 border border-gray-200">
                            <p class="text-2xl font-black text-dark">${exerciseCount}</p>
                            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Exercises</p>
                        </div>
                    </div>

                    <div class="pt-4">
                        <button data-action="new-workout"
                            class="px-8 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 hover:scale-105 active:scale-95 transition cursor-pointer shadow-md">
                            Start New Workout
                        </button>
                    </div>

                    <p class="text-xs text-gray-400">
                        Completion record saved &bull; ID: ${escapeHtml(record.id)}
                    </p>
                </div>
            </div>
        </div>`;
}

// ─── Event Handling ──────────────────────────────────────────────────────────

function setupEventDelegation() {
    if (!container) return;

    container.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;

        switch (action) {
            case 'start-session':
                startSession(target.dataset.dayId);
                break;
            case 'resume-saved':
                if (restoreSession()) renderActiveWorkout();
                break;
            case 'pause':
                pauseSession();
                break;
            case 'resume':
                resumeSession();
                break;
            case 'abandon':
                abandonSession();
                break;
            case 'complete-set':
                handleCompleteSet(target);
                break;
            case 'skip-rest':
                skipRest();
                break;
            case 'go-exercise':
                goToExercise(parseInt(target.dataset.exerciseIndex, 10));
                break;
            case 'finish':
                finishSession();
                break;
            case 'new-workout':
                renderStartScreen();
                break;
        }
    });

    // Allow Enter key on reps/weight inputs to complete the set
    container.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.classList.contains('set-input')) {
            const row = e.target.closest('[data-set-row]');
            if (row) {
                const btn = row.querySelector('[data-action="complete-set"]');
                if (btn) btn.click();
            }
        }
    });
}

function handleCompleteSet(target) {
    const exIdx = parseInt(target.dataset.exerciseIndex, 10);
    const setIdx = parseInt(target.dataset.setIndex, 10);
    const repsInput = container.querySelector(`#reps-input-${exIdx}-${setIdx}`);
    const weightInput = container.querySelector(`#weight-input-${exIdx}-${setIdx}`);
    const reps = repsInput ? parseInt(repsInput.value, 10) || 0 : 0;
    const weight = weightInput ? parseFloat(weightInput.value) || null : null;
    completeSet(exIdx, setIdx, reps, weight);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Called when the Active Workout tab becomes visible.
 * Re-renders start screen to pick up schedule changes (if no active session).
 */
export function onTrackerTabActivated() {
    if (!session) {
        renderStartScreen();
    }
}

/**
 * Initialize the Active Workout Tracker.
 * Restores any saved session or shows the start screen.
 */
export function initTracker() {
    container = document.getElementById('view-tracker');
    if (!container) return;

    setupEventDelegation();

    // Try to restore a saved session
    if (restoreSession()) {
        renderActiveWorkout();
    } else {
        renderStartScreen();
    }

    // Persist session state before tab/window close
    window.addEventListener('beforeunload', () => {
        if (session) saveActiveSession(session);
    });

    // Correct timer display when returning to tab
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && session) {
            renderActiveWorkout();
        }
    });
}
