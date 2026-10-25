/**
 * Force Fitness — Workout Planner Storage & State Manager
 * Synchronizes 7-day schedule, day selection, rest-day states, and exercise assignments in localStorage.
 */

const SCHEDULE_STORAGE_KEY = 'force_fitness_workout_schedule_v1';
const SELECTED_DAY_STORAGE_KEY = 'force_fitness_selected_day_v1';

export const DEFAULT_SCHEDULE = [
    {
        dayId: 'monday',
        dayName: 'Monday',
        dayNumber: 1,
        isRest: false,
        routineName: 'Chest & Triceps (Push)',
        exercises: [
            {
                id: 'barbell-bench-press',
                name: 'Barbell Bench Press',
                muscleGroup: 'Chest',
                equipment: 'Barbell',
                sets: 4,
                reps: '8-10',
                duration: '',
                rest: '90s',
                notes: 'Retract scapulae and maintain 5-point body contact.'
            },
            {
                id: 'incline-dumbbell-press',
                name: 'Incline Dumbbell Press',
                muscleGroup: 'Chest',
                equipment: 'Dumbbell',
                sets: 3,
                reps: '10-12',
                duration: '',
                rest: '75s',
                notes: 'Deep stretch at bottom, squeeze chest at top.'
            },
            {
                id: 'tricep-rope-pushdown',
                name: 'Cable Tricep Rope Pushdown',
                muscleGroup: 'Arms',
                equipment: 'Cable',
                sets: 3,
                reps: '12-15',
                duration: '',
                rest: '60s',
                notes: 'Flare ropes outward at peak contraction.'
            }
        ]
    },
    {
        dayId: 'tuesday',
        dayName: 'Tuesday',
        dayNumber: 2,
        isRest: false,
        routineName: 'Back & Biceps (Pull)',
        exercises: [
            {
                id: 'pull-ups',
                name: 'Pull-Up',
                muscleGroup: 'Back',
                equipment: 'Bodyweight',
                sets: 4,
                reps: '6-10',
                duration: '',
                rest: '90s',
                notes: 'Full dead-hang stretch at bottom, drive elbows down.'
            },
            {
                id: 'barbell-bent-over-row',
                name: 'Barbell Bent-Over Row',
                muscleGroup: 'Back',
                equipment: 'Barbell',
                sets: 4,
                reps: '8-10',
                duration: '',
                rest: '90s',
                notes: 'Hinge at 45 degrees, pull barbell to lower ribcage.'
            },
            {
                id: 'barbell-bicep-curl',
                name: 'Standing Barbell Bicep Curl',
                muscleGroup: 'Arms',
                equipment: 'Barbell',
                sets: 3,
                reps: '10-12',
                duration: '',
                rest: '60s',
                notes: 'Pin elbows to ribs and control the eccentric phase.'
            }
        ]
    },
    {
        dayId: 'wednesday',
        dayName: 'Wednesday',
        dayNumber: 3,
        isRest: true,
        routineName: 'Rest & Recovery',
        exercises: []
    },
    {
        dayId: 'thursday',
        dayName: 'Thursday',
        dayNumber: 4,
        isRest: false,
        routineName: 'Legs & Core',
        exercises: [
            {
                id: 'barbell-back-squat',
                name: 'Barbell Back Squat',
                muscleGroup: 'Legs',
                equipment: 'Barbell',
                sets: 4,
                reps: '6-8',
                duration: '',
                rest: '120s',
                notes: 'Hit parallel depth, push knees out in line with toes.'
            },
            {
                id: 'romanian-deadlift',
                name: 'Romanian Deadlift (RDL)',
                muscleGroup: 'Legs',
                equipment: 'Barbell',
                sets: 3,
                reps: '8-10',
                duration: '',
                rest: '90s',
                notes: 'Hinge hips backwards, feel stretch in hamstrings.'
            },
            {
                id: 'hanging-leg-raise',
                name: 'Hanging Leg Raise',
                muscleGroup: 'Core',
                equipment: 'Bodyweight',
                sets: 3,
                reps: '12-15',
                duration: '',
                rest: '60s',
                notes: 'Avoid swinging; initiate pull with abdominal brace.'
            }
        ]
    },
    {
        dayId: 'friday',
        dayName: 'Friday',
        dayNumber: 5,
        isRest: false,
        routineName: 'Shoulders & Arms',
        exercises: [
            {
                id: 'overhead-barbell-press',
                name: 'Overhead Barbell Press',
                muscleGroup: 'Shoulders',
                equipment: 'Barbell',
                sets: 4,
                reps: '6-8',
                duration: '',
                rest: '90s',
                notes: 'Brace glutes and core; press directly overhead.'
            },
            {
                id: 'dumbbell-lateral-raise',
                name: 'Dumbbell Lateral Raise',
                muscleGroup: 'Shoulders',
                equipment: 'Dumbbell',
                sets: 4,
                reps: '12-15',
                duration: '',
                rest: '60s',
                notes: 'Lead with elbows with slight forward torso lean.'
            },
            {
                id: 'hammer-curl',
                name: 'Incline Dumbbell Hammer Curl',
                muscleGroup: 'Arms',
                equipment: 'Dumbbell',
                sets: 3,
                reps: '10-12',
                duration: '',
                rest: '60s',
                notes: 'Neutral grip emphasizing brachialis and forearm.'
            }
        ]
    },
    {
        dayId: 'saturday',
        dayName: 'Saturday',
        dayNumber: 6,
        isRest: true,
        routineName: 'Rest & Mobility',
        exercises: []
    },
    {
        dayId: 'sunday',
        dayName: 'Sunday',
        dayNumber: 7,
        isRest: true,
        routineName: 'Rest & Recovery',
        exercises: []
    }
];

export function getSchedule() {
    try {
        const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
        if (!raw) {
            saveSchedule(DEFAULT_SCHEDULE);
            return JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 7) {
            // Ensure any existing items have fallback values and valid schema
            parsed.forEach((day, index) => {
                if (!day || typeof day !== 'object') {
                    parsed[index] = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE[index]));
                    return;
                }
                day.dayId = day.dayId || DEFAULT_SCHEDULE[index].dayId;
                day.dayName = day.dayName || DEFAULT_SCHEDULE[index].dayName;
                day.dayNumber = day.dayNumber || (index + 1);
                day.isRest = Boolean(day.isRest);
                day.routineName = typeof day.routineName === 'string' && day.routineName.trim()
                    ? day.routineName.trim()
                    : (day.isRest ? 'Rest & Recovery' : 'Workout Routine');

                if (!Array.isArray(day.exercises)) {
                    day.exercises = [];
                }
                day.exercises.forEach((ex, exIdx) => {
                    if (!ex || typeof ex !== 'object') return;
                    if (!ex.id) ex.id = `ex-${day.dayId}-${exIdx}`;
                    if (!ex.name) ex.name = 'Exercise';
                    if (ex.sets === undefined || ex.sets === null) ex.sets = 3;
                    if (ex.reps === undefined || ex.reps === null) ex.reps = '10-12';
                    if (ex.duration === undefined || ex.duration === null) ex.duration = '';
                    if (ex.rest === undefined || ex.rest === null) ex.rest = '90s';
                    if (ex.notes === undefined || ex.notes === null) ex.notes = '';
                });
            });
            return parsed;
        }
    } catch (e) {
        console.warn('Failed to parse schedule from localStorage, resetting to default.', e);
    }
    saveSchedule(DEFAULT_SCHEDULE);
    return JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
}

export function saveSchedule(schedule) {
    try {
        localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
        window.dispatchEvent(new CustomEvent('schedule-updated', { detail: schedule }));
    } catch (e) {
        console.error('Failed to save schedule to localStorage.', e);
    }
}

export function getSelectedDayId() {
    try {
        const saved = localStorage.getItem(SELECTED_DAY_STORAGE_KEY);
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return validDays.includes(saved) ? saved : 'monday';
    } catch (_) {
        return 'monday';
    }
}

export function setSelectedDayId(dayId) {
    try {
        localStorage.setItem(SELECTED_DAY_STORAGE_KEY, dayId);
        window.dispatchEvent(new CustomEvent('selected-day-changed', { detail: dayId }));
    } catch (e) {
        console.error('Failed to set selected day.', e);
    }
}

export function getDay(dayId) {
    const schedule = getSchedule();
    return schedule.find(d => d.dayId === dayId) || schedule[0];
}

export function updateDayRoutineName(dayId, newName) {
    const schedule = getSchedule();
    const day = schedule.find(d => d.dayId === dayId);
    if (day) {
        day.routineName = newName.trim() || (day.isRest ? 'Rest Day' : 'Workout Routine');
        saveSchedule(schedule);
    }
    return schedule;
}

export function toggleRestDay(dayId) {
    const schedule = getSchedule();
    const day = schedule.find(d => d.dayId === dayId);
    if (day) {
        day.isRest = !day.isRest;
        day.routineName = day.isRest ? 'Rest & Recovery' : 'Custom Routine';
        saveSchedule(schedule);
    }
    return schedule;
}

export function addExerciseToDay(dayId, exerciseData) {
    const schedule = getSchedule();
    const day = schedule.find(d => d.dayId === dayId);
    if (day) {
        if (day.isRest) {
            day.isRest = false;
            day.routineName = 'Custom Routine';
        }
        if (!Array.isArray(day.exercises)) {
            day.exercises = [];
        }
        day.exercises.push({
            id: exerciseData.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: exerciseData.name || 'Unnamed Exercise',
            muscleGroup: exerciseData.muscleGroup || 'General',
            equipment: exerciseData.equipment || 'Bodyweight',
            sets: exerciseData.defaultSets || 3,
            reps: exerciseData.defaultReps || '10-12',
            duration: exerciseData.duration || (exerciseData.defaultReps && /^\d[\d\s\-]*s$/i.test(exerciseData.defaultReps.trim()) ? exerciseData.defaultReps : ''),
            rest: exerciseData.rest || '90s',
            notes: exerciseData.notes || exerciseData.description || ''
        });
        saveSchedule(schedule);
    }
    return schedule;
}

export function removeExerciseFromDay(dayId, exerciseIndex) {
    const schedule = getSchedule();
    const day = schedule.find(d => d.dayId === dayId);
    if (day && Array.isArray(day.exercises)) {
        day.exercises.splice(exerciseIndex, 1);
        saveSchedule(schedule);
    }
    return schedule;
}

export function reorderDayExercise(dayId, fromIndex, toIndex) {
    const schedule = getSchedule();
    const day = schedule.find(d => d.dayId === dayId);
    if (!day || !Array.isArray(day.exercises)) return schedule;
    if (fromIndex < 0 || fromIndex >= day.exercises.length || toIndex < 0 || toIndex >= day.exercises.length) {
        return schedule;
    }
    const [movedItem] = day.exercises.splice(fromIndex, 1);
    day.exercises.splice(toIndex, 0, movedItem);
    saveSchedule(schedule);
    return schedule;
}

export function updateFullDayRoutine(dayId, { routineName, isRest, exercises }) {
    const schedule = getSchedule();
    const day = schedule.find(d => d.dayId === dayId);
    if (!day) return schedule;

    if (typeof routineName === 'string') {
        day.routineName = routineName.trim() || (isRest ? 'Rest Day' : 'Workout Routine');
    }
    if (typeof isRest === 'boolean') {
        day.isRest = isRest;
    }
    if (Array.isArray(exercises)) {
        day.exercises = exercises.map((ex, idx) => ({
            id: ex.id || `custom-${Date.now()}-${idx}`,
            name: (ex.name || 'Custom Exercise').trim(),
            muscleGroup: ex.muscleGroup || 'General',
            equipment: ex.equipment || 'Bodyweight',
            sets: Math.max(1, Math.min(10, parseInt(ex.sets, 10) || 3)),
            reps: String(ex.reps || '10-12').trim(),
            duration: String(ex.duration || '').trim(),
            rest: String(ex.rest || '90s').trim(),
            notes: String(ex.notes || '').trim()
        }));
    }
    saveSchedule(schedule);
    return schedule;
}

export function replaceSchedule(newSchedule) {
    if (Array.isArray(newSchedule) && newSchedule.length === 7) {
        saveSchedule(newSchedule);
    }
    return getSchedule();
}

export function resetScheduleToDefault() {
    saveSchedule(DEFAULT_SCHEDULE);
    return JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
}

// ─── Phase 4 & 5: Active Session & Completion History ────────────────────────

export const ACTIVE_SESSION_KEY = 'force_fitness_active_session_v1';
export const COMPLETED_SESSIONS_KEY = 'force_fitness_completed_sessions_v1';
export const PREFERENCES_STORAGE_KEY = 'force_fitness_user_preferences_v1';
export const CUSTOM_WORKOUTS_KEY = 'force_fitness_custom_workouts_v1';
export const EXERCISE_CONFIGS_KEY = 'force_fitness_exercise_configs_v1';

export const DEFAULT_PREFERENCES = {
    weightUnit: 'kg',   // 'kg' | 'lbs'
    weeklyGoal: 4,      // 1 to 7 days
    soundEnabled: true,
    chartPeriod: '7d'   // '7d' | '4w'
};

// ─── Preferences Persistence ─────────────────────────────────────────────────

export function getPreferences() {
    try {
        const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (!raw) return { ...DEFAULT_PREFERENCES };
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_PREFERENCES };
        return {
            weightUnit: parsed.weightUnit === 'lbs' ? 'lbs' : 'kg',
            weeklyGoal: Math.max(1, Math.min(7, parseInt(parsed.weeklyGoal, 10) || 4)),
            soundEnabled: parsed.soundEnabled !== false,
            chartPeriod: parsed.chartPeriod === '4w' ? '4w' : '7d'
        };
    } catch (e) {
        console.warn('Failed to parse preferences from localStorage, using defaults.', e);
        return { ...DEFAULT_PREFERENCES };
    }
}

export function savePreferences(prefs) {
    try {
        const current = getPreferences();
        const updated = {
            weightUnit: prefs.weightUnit === 'lbs' ? 'lbs' : 'kg',
            weeklyGoal: Math.max(1, Math.min(7, parseInt(prefs.weeklyGoal, 10) || current.weeklyGoal)),
            soundEnabled: prefs.soundEnabled !== undefined ? Boolean(prefs.soundEnabled) : current.soundEnabled,
            chartPeriod: prefs.chartPeriod === '4w' ? '4w' : '7d'
        };
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('preferences-updated', { detail: updated }));
        return updated;
    } catch (e) {
        console.warn('Failed to save preferences to localStorage.', e);
        return getPreferences();
    }
}

export function updatePreference(key, value) {
    const prefs = getPreferences();
    prefs[key] = value;
    return savePreferences(prefs);
}

// ─── Active Session Persistence ──────────────────────────────────────────────

export function getActiveSession() {
    try {
        const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (!session || typeof session !== 'object') {
            clearActiveSession();
            return null;
        }
        // Basic schema verification: must have startedAt & exercises array
        if (!session.startedAt || !Array.isArray(session.exercises) || session.exercises.length === 0) {
            console.warn('Malformed active session detected; clearing corrupted session data.');
            clearActiveSession();
            return null;
        }
        // Sanitize numeric fields to guard against corrupt state
        session.pausedMs = Number(session.pausedMs) || 0;
        session.currentExerciseIndex = Math.max(0, Number(session.currentExerciseIndex) || 0);
        session.currentSetIndex = Math.max(0, Number(session.currentSetIndex) || 0);
        return session;
    } catch (e) {
        console.warn('Failed to parse active session, clearing safely.', e);
        clearActiveSession();
        return null;
    }
}

export function saveActiveSession(session) {
    try {
        if (!session) return;
        session.lastSavedAt = Date.now();
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
        console.error('Failed to save active session to localStorage.', e);
    }
}

export function clearActiveSession() {
    try {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch (e) {
        console.error('Failed to clear active session.', e);
    }
}

// ─── Completed Workout Records Persistence ───────────────────────────────────

export function getCompletedSessions() {
    try {
        const raw = localStorage.getItem(COMPLETED_SESSIONS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            console.warn('Completed sessions stored as non-array, resetting.');
            return [];
        }
        // Sanitize and deduplicate stored records safely
        const sanitized = [];
        const seenIds = new Set();
        for (const rec of parsed) {
            if (!rec || typeof rec !== 'object') continue;
            const id = rec.id || `session-${rec.startedAt || Date.now()}`;
            if (seenIds.has(id)) continue;
            seenIds.add(id);

            const validRecord = {
                id,
                dayId: String(rec.dayId || 'custom'),
                dayName: String(rec.dayName || 'Workout Day'),
                routineName: String(rec.routineName || 'Completed Routine'),
                startedAt: rec.startedAt || new Date().toISOString(),
                finishedAt: rec.finishedAt || new Date().toISOString(),
                elapsedMs: Math.max(0, Number(rec.elapsedMs) || 0),
                exercises: Array.isArray(rec.exercises) ? rec.exercises.map((ex, exIdx) => ({
                    id: ex.id || `ex-${exIdx}`,
                    name: ex.name || 'Exercise',
                    muscleGroup: ex.muscleGroup || 'General',
                    sets: Array.isArray(ex.sets) ? ex.sets.map((s, sIdx) => ({
                        setNumber: Number(s.setNumber) || (sIdx + 1),
                        reps: Number(s.reps) || 0,
                        weight: s.weight !== null && s.weight !== undefined && !isNaN(s.weight) && Number(s.weight) > 0 ? Number(s.weight) : null,
                        completed: Boolean(s.completed)
                    })) : []
                })) : [],
                totalSetsPlanned: Number(rec.totalSetsPlanned) || 0,
                totalSetsCompleted: Number(rec.totalSetsCompleted) || 0,
                status: rec.status === 'completed' ? 'completed' : 'partial'
            };
            sanitized.push(validRecord);
        }
        // Sort descending by finishedAt/startedAt
        sanitized.sort((a, b) => new Date(b.finishedAt || b.startedAt).getTime() - new Date(a.finishedAt || a.startedAt).getTime());
        return sanitized;
    } catch (e) {
        console.warn('Failed to parse completed sessions from localStorage.', e);
        return [];
    }
}

export function saveCompletedSessions(sessions) {
    try {
        if (!Array.isArray(sessions)) return;
        localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
        console.error('Failed to save completed sessions to localStorage.', e);
    }
}

export function addCompletedSession(record) {
    if (!record || typeof record !== 'object') return false;
    const sessions = getCompletedSessions();
    const recordId = record.id || `session-${Date.now()}`;
    record.id = recordId;

    // Guard against duplicate records by ID
    const duplicateById = sessions.some(s => s.id === recordId);
    if (duplicateById) {
        console.warn('Duplicate workout record by ID skipped:', recordId);
        return false;
    }

    // Guard against duplicate records by matching routineName and very close timestamps (<5s)
    const recordStartMs = new Date(record.startedAt).getTime();
    const duplicateByTimestamp = sessions.some(s => {
        const existingStartMs = new Date(s.startedAt).getTime();
        const timeDiff = Math.abs(existingStartMs - recordStartMs);
        return s.routineName === record.routineName && timeDiff < 5000;
    });

    if (duplicateByTimestamp) {
        console.warn('Duplicate workout record by timestamp skipped.');
        return false;
    }

    // Insert at front (newest first)
    sessions.unshift(record);
    saveCompletedSessions(sessions);
    window.dispatchEvent(new CustomEvent('workout-history-updated', { detail: { record, sessions } }));
    return true;
}

export function deleteCompletedSession(recordId) {
    if (!recordId) return false;
    const sessions = getCompletedSessions();
    const filtered = sessions.filter(s => s.id !== recordId);
    if (filtered.length !== sessions.length) {
        saveCompletedSessions(filtered);
        window.dispatchEvent(new CustomEvent('workout-history-updated', { detail: { deletedId: recordId, sessions: filtered } }));
        return true;
    }
    return false;
}

export function clearCompletedSessions() {
    saveCompletedSessions([]);
    window.dispatchEvent(new CustomEvent('workout-history-updated', { detail: { cleared: true, sessions: [] } }));
}

// ─── Custom Workouts & Exercise Configs ───────────────────────────────────────

export function getCustomWorkouts() {
    try {
        const raw = localStorage.getItem(CUSTOM_WORKOUTS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(w => w && typeof w === 'object' && w.name) : [];
    } catch (e) {
        console.warn('Failed to parse custom workouts.', e);
        return [];
    }
}

export function saveCustomWorkout(workout) {
    try {
        if (!workout || !workout.name) return null;
        const list = getCustomWorkouts();
        const record = {
            id: workout.id || `custom-wkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: String(workout.name).trim(),
            description: String(workout.description || '').trim(),
            targetMuscle: workout.targetMuscle || 'General',
            exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
            createdAt: workout.createdAt || new Date().toISOString()
        };
        const idx = list.findIndex(w => w.id === record.id);
        if (idx !== -1) {
            list[idx] = record;
        } else {
            list.unshift(record);
        }
        localStorage.setItem(CUSTOM_WORKOUTS_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('custom-workouts-updated', { detail: list }));
        return record;
    } catch (e) {
        console.warn('Failed to save custom workout.', e);
        return null;
    }
}

export function deleteCustomWorkout(workoutId) {
    try {
        const list = getCustomWorkouts().filter(w => w.id !== workoutId);
        localStorage.setItem(CUSTOM_WORKOUTS_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('custom-workouts-updated', { detail: list }));
        return list;
    } catch (e) {
        console.warn('Failed to delete custom workout.', e);
        return getCustomWorkouts();
    }
}

export function getExerciseConfigs() {
    try {
        const raw = localStorage.getItem(EXERCISE_CONFIGS_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (e) {
        console.warn('Failed to parse exercise configs.', e);
        return {};
    }
}

export function saveExerciseConfig(exerciseId, config) {
    try {
        if (!exerciseId) return;
        const configs = getExerciseConfigs();
        configs[exerciseId] = {
            ...(configs[exerciseId] || {}),
            ...config,
            updatedAt: Date.now()
        };
        localStorage.setItem(EXERCISE_CONFIGS_KEY, JSON.stringify(configs));
    } catch (e) {
        console.warn('Failed to save exercise config.', e);
    }
}

// ─── Full Data Backup / Import / Reset Safeguards ────────────────────────────

export function exportAllData() {
    return JSON.stringify({
        version: 1,
        app: 'Force Fitness Workout Planner',
        exportedAt: new Date().toISOString(),
        preferences: getPreferences(),
        schedule: getSchedule(),
        customWorkouts: getCustomWorkouts(),
        exerciseConfigs: getExerciseConfigs(),
        completedSessions: getCompletedSessions()
    }, null, 2);
}

export function importAllData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        if (!data || typeof data !== 'object') throw new Error('Data must be a valid JSON object');

        if (data.preferences) savePreferences(data.preferences);
        if (Array.isArray(data.schedule) && data.schedule.length === 7) replaceSchedule(data.schedule);
        if (Array.isArray(data.customWorkouts)) localStorage.setItem(CUSTOM_WORKOUTS_KEY, JSON.stringify(data.customWorkouts));
        if (data.exerciseConfigs && typeof data.exerciseConfigs === 'object') localStorage.setItem(EXERCISE_CONFIGS_KEY, JSON.stringify(data.exerciseConfigs));
        if (Array.isArray(data.completedSessions)) {
            saveCompletedSessions(data.completedSessions);
        }

        window.dispatchEvent(new CustomEvent('schedule-updated'));
        window.dispatchEvent(new CustomEvent('workout-history-updated'));
        window.dispatchEvent(new CustomEvent('preferences-updated'));
        return { success: true };
    } catch (e) {
        console.error('Import failed:', e);
        return { success: false, error: e.message };
    }
}

export function resetAllData() {
    try {
        localStorage.removeItem(SCHEDULE_STORAGE_KEY);
        localStorage.removeItem(SELECTED_DAY_STORAGE_KEY);
        localStorage.removeItem(ACTIVE_SESSION_KEY);
        localStorage.removeItem(COMPLETED_SESSIONS_KEY);
        localStorage.removeItem(PREFERENCES_STORAGE_KEY);
        localStorage.removeItem(CUSTOM_WORKOUTS_KEY);
        localStorage.removeItem(EXERCISE_CONFIGS_KEY);
        window.dispatchEvent(new CustomEvent('schedule-updated'));
        window.dispatchEvent(new CustomEvent('workout-history-updated'));
        window.dispatchEvent(new CustomEvent('preferences-updated'));
        return true;
    } catch (e) {
        console.error('Reset failed:', e);
        return false;
    }
}

