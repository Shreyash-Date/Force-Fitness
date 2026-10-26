/**
 * Force Fitness — Workout Planner Standalone Application Bundle
 * Combines storage, schedule, exercise library, editor, generator, tracker, and analytics
 * into an optimized script supporting both direct file:// execution and HTTP server environments.
 */

(function () {
    'use strict';

    if (window.__FORCE_FITNESS_APP_INITIALIZED__) return;
    window.__FORCE_FITNESS_APP_INITIALIZED__ = true;

    // ─── 1. Utilities ──────────────────────────────────────────────────────────
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ─── 2. Exercise Catalog Data ──────────────────────────────────────────────
    const EXERCISES = [
        {
            id: 'barbell-bench-press',
            name: 'Barbell Bench Press',
            muscleGroup: 'Chest',
            equipment: 'Barbell',
            difficulty: 'Intermediate',
            defaultSets: 4,
            defaultReps: '8-10',
            description: 'Classic compound movement targeting the pectoralis major, anterior deltoids, and triceps.'
        },
        {
            id: 'incline-dumbbell-press',
            name: 'Incline Dumbbell Press',
            muscleGroup: 'Chest',
            equipment: 'Dumbbell',
            difficulty: 'Intermediate',
            defaultSets: 3,
            defaultReps: '10-12',
            description: 'Targets upper clavicular head of the chest with high stabilization demand.'
        },
        {
            id: 'push-up',
            name: 'Standard Push-Up',
            muscleGroup: 'Chest',
            equipment: 'Bodyweight',
            difficulty: 'Beginner',
            defaultSets: 3,
            defaultReps: '15-20',
            description: 'Fundamental horizontal pressing movement building pectoral and core endurance.'
        },
        {
            id: 'cable-chest-fly',
            name: 'Cable Chest Fly',
            muscleGroup: 'Chest',
            equipment: 'Cable',
            difficulty: 'Intermediate',
            defaultSets: 3,
            defaultReps: '12-15',
            description: 'Provides continuous tension through full chest adduction and peak contraction.'
        },
        {
            id: 'pull-ups',
            name: 'Pull-Up',
            muscleGroup: 'Back',
            equipment: 'Bodyweight',
            difficulty: 'Intermediate',
            defaultSets: 4,
            defaultReps: '6-10',
            description: 'Elite vertical pulling compound exercise targeting the latissimus dorsi and biceps.'
        },
        {
            id: 'barbell-bent-over-row',
            name: 'Barbell Bent-Over Row',
            muscleGroup: 'Back',
            equipment: 'Barbell',
            difficulty: 'Intermediate',
            defaultSets: 4,
            defaultReps: '8-10',
            description: 'Builds thickness across rhomboids, mid-traps, and lats with posterior chain stability.'
        },
        {
            id: 'lat-pulldown',
            name: 'Lat Pulldown',
            muscleGroup: 'Back',
            equipment: 'Cable',
            difficulty: 'Beginner',
            defaultSets: 3,
            defaultReps: '10-12',
            description: 'Controlled vertical pull emphasizing upper lat width and scapular depression.'
        },
        {
            id: 'single-arm-dumbbell-row',
            name: 'Single-Arm Dumbbell Row',
            muscleGroup: 'Back',
            equipment: 'Dumbbell',
            difficulty: 'Beginner',
            defaultSets: 3,
            defaultReps: '10-12',
            description: 'Unilateral row addressing muscle imbalances and core anti-rotational stability.'
        },
        {
            id: 'barbell-back-squat',
            name: 'Barbell Back Squat',
            muscleGroup: 'Legs',
            equipment: 'Barbell',
            difficulty: 'Advanced',
            defaultSets: 4,
            defaultReps: '6-8',
            description: 'King of leg exercises developing quadriceps, glutes, hamstrings, and trunk rigidity.'
        },
        {
            id: 'romanian-deadlift',
            name: 'Romanian Deadlift (RDL)',
            muscleGroup: 'Legs',
            equipment: 'Barbell',
            difficulty: 'Intermediate',
            defaultSets: 3,
            defaultReps: '8-10',
            description: 'Hip hinge movement maximizing hamstring and glute eccentric loading.'
        },
        {
            id: 'dumbbell-goblet-squat',
            name: 'Goblet Squat',
            muscleGroup: 'Legs',
            equipment: 'Dumbbell',
            difficulty: 'Beginner',
            defaultSets: 3,
            defaultReps: '12-15',
            description: 'Front-loaded squat encouraging upright posture, hip mobility, and quad activation.'
        },
        {
            id: 'walking-lunges',
            name: 'Dumbbell Walking Lunges',
            muscleGroup: 'Legs',
            equipment: 'Dumbbell',
            difficulty: 'Intermediate',
            defaultSets: 3,
            defaultReps: '12 steps/leg',
            description: 'Dynamic unilateral leg builder testing balance, glute drive, and stabilizer endurance.'
        },
        {
            id: 'leg-press',
            name: 'Machine Leg Press',
            muscleGroup: 'Legs',
            equipment: 'Machine',
            difficulty: 'Beginner',
            defaultSets: 3,
            defaultReps: '10-12',
            description: 'High-volume leg hypertrophy with reduced lumbar spine compressive loading.'
        },
        {
            id: 'overhead-barbell-press',
            name: 'Overhead Barbell Press',
            muscleGroup: 'Shoulders',
            equipment: 'Barbell',
            difficulty: 'Intermediate',
            defaultSets: 4,
            defaultReps: '6-8',
            description: 'Strict vertical press developing anterior and lateral deltoids plus core brace.'
        },
        {
            id: 'dumbbell-lateral-raise',
            name: 'Dumbbell Lateral Raise',
            muscleGroup: 'Shoulders',
            equipment: 'Dumbbell',
            difficulty: 'Beginner',
            defaultSets: 4,
            defaultReps: '12-15',
            description: 'Isolation builder for side deltoid hypertrophy and shoulder width appearance.'
        },
        {
            id: 'face-pull',
            name: 'Cable Face Pull',
            muscleGroup: 'Shoulders',
            equipment: 'Cable',
            difficulty: 'Beginner',
            defaultSets: 3,
            defaultReps: '15-20',
            description: 'Key postural exercise targeting rear deltoids, rhomboids, and rotator cuff stability.'
        },
        {
            id: 'dumbbell-arnold-press',
            name: 'Arnold Dumbbell Press',
            muscleGroup: 'Shoulders',
            equipment: 'Dumbbell',
            difficulty: 'Intermediate',
            defaultSets: 3,
            defaultReps: '10-12',
            description: 'Rotational shoulder press engaging anterior and medial deltoids through full range.'
        },
        {
            id: 'barbell-bicep-curl',
            name: 'Standing Barbell Bicep Curl',
            muscleGroup: 'Arms',
            equipment: 'Barbell',
            difficulty: 'Beginner',
            defaultSets: 3,
            defaultReps: '10-12',
            description: 'Foundational bicep mass builder utilizing strict elbow flexion.'
        },
        {
            id: 'tricep-rope-pushdown',
            name: 'Cable Tricep Rope Pushdown',
            muscleGroup: 'Arms',
            equipment: 'Cable',
            difficulty: 'Beginner',
            defaultSets: 3,
            defaultReps: '12-15',
            description: 'Isolates lateral and medial triceps heads with continuous cable resistance.'
        },
        {
            id: 'hammer-curl',
            name: 'Incline Dumbbell Hammer Curl',
            muscleGroup: 'Arms',
            equipment: 'Dumbbell',
            difficulty: 'Beginner',
            defaultSets: 3,
            defaultReps: '10-12',
            description: 'Neutral grip targeting brachialis and brachioradialis for forearm and arm thickness.'
        },
        {
            id: 'skull-crushers',
            name: 'Lying EZ-Bar Skull Crusher',
            muscleGroup: 'Arms',
            equipment: 'Barbell',
            difficulty: 'Intermediate',
            defaultSets: 3,
            defaultReps: '10-12',
            description: 'Direct tricep long head isolation through deep elbow flexion stretch.'
        },
        {
            id: 'dips',
            name: 'Parallel Bar Dips',
            muscleGroup: 'Arms',
            equipment: 'Bodyweight',
            difficulty: 'Intermediate',
            defaultSets: 3,
            defaultReps: '8-12',
            description: 'Heavy compound exercise loading triceps and lower chest with vertical push.'
        },
        {
            id: 'plank',
            name: 'Front Plank Hold',
            muscleGroup: 'Core',
            equipment: 'Bodyweight',
            difficulty: 'Beginner',
            defaultSets: 3,
            defaultReps: '45-60s',
            description: 'Isometric anti-extension core hold building deep transverse abdominis strength.'
        },
        {
            id: 'hanging-leg-raise',
            name: 'Hanging Leg Raise',
            muscleGroup: 'Core',
            equipment: 'Bodyweight',
            difficulty: 'Intermediate',
            defaultSets: 3,
            defaultReps: '12-15',
            description: 'Intense lower abdominal exercise emphasizing posterior pelvic tilt and grip.'
        },
        {
            id: 'ab-wheel-rollout',
            name: 'Ab Wheel Rollout',
            muscleGroup: 'Core',
            equipment: 'Bodyweight',
            difficulty: 'Advanced',
            defaultSets: 3,
            defaultReps: '8-10',
            description: 'Extreme anti-extension challenge building full anterior chain resilience.'
        },
        {
            id: 'cable-woodchopper',
            name: 'Cable Woodchopper',
            muscleGroup: 'Core',
            equipment: 'Cable',
            difficulty: 'Beginner',
            defaultSets: 3,
            defaultReps: '12/side',
            description: 'Rotational power movement activating internal and external obliques.'
        },
        {
            id: 'deadlift',
            name: 'Conventional Barbell Deadlift',
            muscleGroup: 'Back',
            equipment: 'Barbell',
            difficulty: 'Advanced',
            defaultSets: 3,
            defaultReps: '5-5',
            description: 'Total posterior chain powerhouse recruiting glutes, hamstrings, erectores, and traps.'
        },
        {
            id: 'bulgarian-split-squat',
            name: 'Bulgarian Split Squat',
            muscleGroup: 'Legs',
            equipment: 'Dumbbell',
            difficulty: 'Intermediate',
            defaultSets: 3,
            defaultReps: '8-10/leg',
            description: 'Demanding single-leg exercise eliminating strength asymmetries in quads and glutes.'
        },
        {
            id: 'standing-calf-raise',
            name: 'Standing Dumbbell Calf Raise',
            muscleGroup: 'Legs',
            equipment: 'Dumbbell',
            difficulty: 'Beginner',
            defaultSets: 4,
            defaultReps: '15-20',
            description: 'Full ankle plantarflexion loading gastrocnemius under stretch and contraction.'
        },
        {
            id: 'cable-lateral-raise',
            name: 'Cable Lateral Raise',
            muscleGroup: 'Shoulders',
            equipment: 'Cable',
            difficulty: 'Intermediate',
            defaultSets: 3,
            defaultReps: '12-15',
            description: 'Smooth constant resistance curve for lateral delt isolation without momentum.'
        },
        {
            id: 'russian-twists',
            name: 'Weighted Russian Twists',
            muscleGroup: 'Core',
            equipment: 'Dumbbell',
            difficulty: 'Beginner',
            defaultSets: 3,
            defaultReps: '20 twists',
            description: 'Dynamic rotational movement challenging balance, obliques, and hip flexors.'
        },
        {
            id: 'chin-up',
            name: 'Supinated Chin-Up',
            muscleGroup: 'Arms',
            equipment: 'Bodyweight',
            difficulty: 'Intermediate',
            defaultSets: 3,
            defaultReps: '6-10',
            description: 'Compound pulling exercise placing high mechanical tension on biceps and lats.'
        }
    ];

    const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
    const EQUIPMENT_TYPES = ['All', 'Barbell', 'Dumbbell', 'Bodyweight', 'Cable', 'Machine'];
    const DIFFICULTY_LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    // ─── 3. Storage & State Management ─────────────────────────────────────────
    const SCHEDULE_STORAGE_KEY = 'force_fitness_workout_schedule_v1';
    const SELECTED_DAY_STORAGE_KEY = 'force_fitness_selected_day_v1';
    const ACTIVE_SESSION_KEY = 'force_fitness_active_session_v1';
    const COMPLETED_SESSIONS_KEY = 'force_fitness_completed_sessions_v1';
    const PREFERENCES_STORAGE_KEY = 'force_fitness_user_preferences_v1';
    const CUSTOM_WORKOUTS_KEY = 'force_fitness_custom_workouts_v1';
    const EXERCISE_CONFIGS_KEY = 'force_fitness_exercise_configs_v1';

    const DEFAULT_SCHEDULE = [
        {
            dayId: 'monday',
            dayName: 'Monday',
            dayNumber: 1,
            isRest: false,
            routineName: 'Chest & Triceps (Push)',
            exercises: [
                { id: 'barbell-bench-press', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', sets: 4, reps: '8-10', duration: '', rest: '90s', notes: 'Retract scapulae and maintain 5-point body contact.' },
                { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell', sets: 3, reps: '10-12', duration: '', rest: '75s', notes: 'Deep stretch at bottom, squeeze chest at top.' },
                { id: 'tricep-rope-pushdown', name: 'Cable Tricep Rope Pushdown', muscleGroup: 'Arms', equipment: 'Cable', sets: 3, reps: '12-15', duration: '', rest: '60s', notes: 'Flare ropes outward at peak contraction.' }
            ]
        },
        {
            dayId: 'tuesday',
            dayName: 'Tuesday',
            dayNumber: 2,
            isRest: false,
            routineName: 'Back & Biceps (Pull)',
            exercises: [
                { id: 'pull-ups', name: 'Pull-Up', muscleGroup: 'Back', equipment: 'Bodyweight', sets: 4, reps: '6-10', duration: '', rest: '90s', notes: 'Full dead-hang stretch at bottom, drive elbows down.' },
                { id: 'barbell-bent-over-row', name: 'Barbell Bent-Over Row', muscleGroup: 'Back', equipment: 'Barbell', sets: 4, reps: '8-10', duration: '', rest: '90s', notes: 'Hinge at 45 degrees, pull barbell to lower ribcage.' },
                { id: 'barbell-bicep-curl', name: 'Standing Barbell Bicep Curl', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '10-12', duration: '', rest: '60s', notes: 'Pin elbows to ribs and control the eccentric phase.' }
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
                { id: 'barbell-back-squat', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell', sets: 4, reps: '6-8', duration: '', rest: '120s', notes: 'Hit parallel depth, push knees out in line with toes.' },
                { id: 'romanian-deadlift', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', equipment: 'Barbell', sets: 3, reps: '8-10', duration: '', rest: '90s', notes: 'Hinge hips backwards, feel stretch in hamstrings.' },
                { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'Core', equipment: 'Bodyweight', sets: 3, reps: '12-15', duration: '', rest: '60s', notes: 'Avoid swinging; initiate pull with abdominal brace.' }
            ]
        },
        {
            dayId: 'friday',
            dayName: 'Friday',
            dayNumber: 5,
            isRest: false,
            routineName: 'Shoulders & Arms',
            exercises: [
                { id: 'overhead-barbell-press', name: 'Overhead Barbell Press', muscleGroup: 'Shoulders', equipment: 'Barbell', sets: 4, reps: '6-8', duration: '', rest: '90s', notes: 'Brace glutes and core; press directly overhead.' },
                { id: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', sets: 4, reps: '12-15', duration: '', rest: '60s', notes: 'Lead with elbows with slight forward torso lean.' },
                { id: 'hammer-curl', name: 'Incline Dumbbell Hammer Curl', muscleGroup: 'Arms', equipment: 'Dumbbell', sets: 3, reps: '10-12', duration: '', rest: '60s', notes: 'Neutral grip emphasizing brachialis and forearm.' }
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

    const DEFAULT_PREFERENCES = {
        weightUnit: 'kg',
        weeklyGoal: 4,
        soundEnabled: true,
        chartPeriod: '7d'
    };

    function getSchedule() {
        try {
            const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
            if (!raw) {
                saveSchedule(DEFAULT_SCHEDULE);
                return JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length === 7) {
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

    function saveSchedule(schedule) {
        try {
            localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
            window.dispatchEvent(new CustomEvent('schedule-updated', { detail: schedule }));
        } catch (e) {
            console.error('Failed to save schedule to localStorage.', e);
        }
    }

    function getSelectedDayId() {
        try {
            const saved = localStorage.getItem(SELECTED_DAY_STORAGE_KEY);
            const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            return validDays.includes(saved) ? saved : 'monday';
        } catch (_) {
            return 'monday';
        }
    }

    function setSelectedDayId(dayId) {
        try {
            localStorage.setItem(SELECTED_DAY_STORAGE_KEY, dayId);
            window.dispatchEvent(new CustomEvent('selected-day-changed', { detail: dayId }));
        } catch (e) {
            console.error('Failed to set selected day.', e);
        }
    }

    function getDay(dayId) {
        const schedule = getSchedule();
        return schedule.find(d => d.dayId === dayId) || schedule[0];
    }

    function updateDayRoutineName(dayId, newName) {
        const schedule = getSchedule();
        const day = schedule.find(d => d.dayId === dayId);
        if (day) {
            day.routineName = newName.trim() || (day.isRest ? 'Rest Day' : 'Workout Routine');
            saveSchedule(schedule);
        }
        return schedule;
    }

    function toggleRestDay(dayId) {
        const schedule = getSchedule();
        const day = schedule.find(d => d.dayId === dayId);
        if (day) {
            day.isRest = !day.isRest;
            day.routineName = day.isRest ? 'Rest & Recovery' : 'Custom Routine';
            saveSchedule(schedule);
        }
        return schedule;
    }

    function addExerciseToDay(dayId, exerciseData) {
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

    function removeExerciseFromDay(dayId, exerciseIndex) {
        const schedule = getSchedule();
        const day = schedule.find(d => d.dayId === dayId);
        if (day && Array.isArray(day.exercises)) {
            day.exercises.splice(exerciseIndex, 1);
            saveSchedule(schedule);
        }
        return schedule;
    }

    function reorderDayExercise(dayId, fromIndex, toIndex) {
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

    function updateFullDayRoutine(dayId, { routineName, isRest, exercises }) {
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

    function replaceSchedule(newSchedule) {
        if (Array.isArray(newSchedule) && newSchedule.length === 7) {
            saveSchedule(newSchedule);
        }
        return getSchedule();
    }

    function resetScheduleToDefault() {
        saveSchedule(DEFAULT_SCHEDULE);
        return JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
    }

    function getPreferences() {
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

    function savePreferences(prefs) {
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

    function getActiveSession() {
        try {
            const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
            if (!raw) return null;
            const session = JSON.parse(raw);
            if (!session || typeof session !== 'object') {
                clearActiveSession();
                return null;
            }
            if (!session.startedAt || !Array.isArray(session.exercises) || session.exercises.length === 0) {
                clearActiveSession();
                return null;
            }
            session.pausedMs = Number(session.pausedMs) || 0;
            session.currentExerciseIndex = Math.max(0, Number(session.currentExerciseIndex) || 0);
            session.currentSetIndex = Math.max(0, Number(session.currentSetIndex) || 0);
            return session;
        } catch (e) {
            clearActiveSession();
            return null;
        }
    }

    function saveActiveSession(session) {
        try {
            if (!session) return;
            session.lastSavedAt = Date.now();
            localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
        } catch (e) {
            console.error('Failed to save active session to localStorage.', e);
        }
    }

    function clearActiveSession() {
        try {
            localStorage.removeItem(ACTIVE_SESSION_KEY);
        } catch (e) {
            console.error('Failed to clear active session.', e);
        }
    }

    function getCompletedSessions() {
        try {
            const raw = localStorage.getItem(COMPLETED_SESSIONS_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
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
            sanitized.sort((a, b) => new Date(b.finishedAt || b.startedAt).getTime() - new Date(a.finishedAt || a.startedAt).getTime());
            return sanitized;
        } catch (e) {
            return [];
        }
    }

    function saveCompletedSessions(sessions) {
        try {
            if (!Array.isArray(sessions)) return;
            localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(sessions));
        } catch (e) {
            console.error('Failed to save completed sessions to localStorage.', e);
        }
    }

    function addCompletedSession(record) {
        if (!record || typeof record !== 'object') return false;
        const sessions = getCompletedSessions();
        const recordId = record.id || `session-${Date.now()}`;
        record.id = recordId;

        const duplicateById = sessions.some(s => s.id === recordId);
        if (duplicateById) return false;

        const recordStartMs = new Date(record.startedAt).getTime();
        const duplicateByTimestamp = sessions.some(s => {
            const existingStartMs = new Date(s.startedAt).getTime();
            const timeDiff = Math.abs(existingStartMs - recordStartMs);
            return s.routineName === record.routineName && timeDiff < 5000;
        });

        if (duplicateByTimestamp) return false;

        sessions.unshift(record);
        saveCompletedSessions(sessions);
        window.dispatchEvent(new CustomEvent('workout-history-updated', { detail: { record, sessions } }));
        return true;
    }

    function deleteCompletedSession(recordId) {
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

    function clearCompletedSessions() {
        saveCompletedSessions([]);
        window.dispatchEvent(new CustomEvent('workout-history-updated', { detail: { cleared: true, sessions: [] } }));
    }

    function exportAllData() {
        return JSON.stringify({
            version: 1,
            app: 'Force Fitness Workout Planner',
            exportedAt: new Date().toISOString(),
            preferences: getPreferences(),
            schedule: getSchedule(),
            completedSessions: getCompletedSessions()
        }, null, 2);
    }

    function importAllData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data || typeof data !== 'object') throw new Error('Data must be a valid JSON object');

            if (data.preferences) savePreferences(data.preferences);
            if (Array.isArray(data.schedule) && data.schedule.length === 7) replaceSchedule(data.schedule);
            if (Array.isArray(data.completedSessions)) {
                saveCompletedSessions(data.completedSessions);
            }

            window.dispatchEvent(new CustomEvent('schedule-updated'));
            window.dispatchEvent(new CustomEvent('workout-history-updated'));
            window.dispatchEvent(new CustomEvent('preferences-updated'));
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // ─── 4. Workout Editor ─────────────────────────────────────────────────────
    let activeDayId = null;
    let isEditorActive = false;
    let draftRoutine = null;
    let pickerSearch = '';
    let pickerMuscle = 'All';
    let pickerEquipment = 'All';

    function isEditingActive() {
        return isEditorActive;
    }

    function getActiveEditingDayId() {
        return activeDayId;
    }

    function startEditing(dayId) {
        const day = getDay(dayId);
        if (!day) return;

        activeDayId = dayId;
        isEditorActive = true;

        draftRoutine = {
            dayId: day.dayId,
            dayName: day.dayName,
            dayNumber: day.dayNumber,
            isRest: !!day.isRest,
            routineName: day.routineName || (day.isRest ? 'Rest Day' : 'Custom Routine'),
            exercises: Array.isArray(day.exercises)
                ? JSON.parse(JSON.stringify(day.exercises))
                : []
        };

        draftRoutine.exercises.forEach(ex => {
            if (ex.sets === undefined || ex.sets === null) ex.sets = 3;
            if (ex.reps === undefined || ex.reps === null) ex.reps = '10-12';
            if (ex.duration === undefined || ex.duration === null) ex.duration = '';
            if (ex.rest === undefined || ex.rest === null) ex.rest = '90s';
            if (ex.notes === undefined || ex.notes === null) ex.notes = '';
        });

        renderEditorUI();
    }

    function cancelEditing() {
        isEditorActive = false;
        draftRoutine = null;
        activeDayId = null;
        window.dispatchEvent(new CustomEvent('editor-closed', { detail: { saved: false } }));
    }

    function saveEditing() {
        if (!draftRoutine || !activeDayId) return false;

        const validationError = validateDraft(draftRoutine);
        if (validationError) {
            showEditorNotification(validationError, 'error');
            return false;
        }

        updateFullDayRoutine(activeDayId, {
            routineName: draftRoutine.routineName,
            isRest: draftRoutine.isRest,
            exercises: draftRoutine.exercises
        });

        isEditorActive = false;
        draftRoutine = null;
        const savedDayId = activeDayId;
        activeDayId = null;

        showEditorNotification('Workout routine saved successfully!', 'success');
        window.dispatchEvent(new CustomEvent('schedule-updated', { detail: { dayId: savedDayId } }));
        window.dispatchEvent(new CustomEvent('editor-closed', { detail: { saved: true, dayId: savedDayId } }));
        return true;
    }

    function validateDraft(draft) {
        if (!draft.isRest) {
            if (!draft.routineName || draft.routineName.trim().length === 0) {
                return 'Please enter a routine name for this training day.';
            }
            if (draft.routineName.trim().length > 60) {
                return 'Routine name cannot exceed 60 characters.';
            }
            if (!Array.isArray(draft.exercises) || draft.exercises.length === 0) {
                return 'Please add at least 1 exercise or toggle this day to a Rest Day.';
            }
            for (let i = 0; i < draft.exercises.length; i++) {
                const ex = draft.exercises[i];
                const sets = parseInt(ex.sets, 10);
                if (isNaN(sets) || sets < 1 || sets > 10) {
                    return `Exercise #${i + 1} (${ex.name}): Sets must be between 1 and 10.`;
                }
                if ((!ex.reps || !ex.reps.trim()) && (!ex.duration || !ex.duration.trim())) {
                    return `Exercise #${i + 1} (${ex.name}): Must specify either target reps or duration.`;
                }
            }
        }
        return null;
    }

    function renderEditorUI() {
        const detailContainer = document.getElementById('selected-day-detail-panel');
        if (!detailContainer || !draftRoutine) return;

        const exCount = draftRoutine.exercises ? draftRoutine.exercises.length : 0;

        detailContainer.innerHTML = `
            <div class="bg-white rounded-3xl p-6 md:p-8 border-2 border-black shadow-xl space-y-6 animate-fadeIn transition-all">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                    <div>
                        <div class="flex items-center gap-2 mb-1.5">
                            <span class="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-black text-white">
                                Editing Day ${draftRoutine.dayNumber}
                            </span>
                            <span class="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                Workout Editor Mode
                            </span>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black text-dark">
                            ${escapeHtml(draftRoutine.dayName)} Routine
                        </h2>
                    </div>

                    <div class="flex items-center gap-3">
                        <button id="cancel-editor-btn" type="button"
                            class="px-5 py-2.5 rounded-full border border-gray-300 font-bold text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition cursor-pointer">
                            ✕ Cancel
                        </button>
                        <button id="save-editor-btn" type="button"
                            class="px-6 py-2.5 rounded-full bg-black text-white font-bold text-xs sm:text-sm hover:bg-gray-800 hover:scale-105 active:scale-95 transition shadow cursor-pointer flex items-center gap-1.5">
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>

                <div id="editor-notification" class="hidden"></div>

                <div class="bg-cream rounded-2xl p-5 border border-gray-300 space-y-4">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <label class="text-xs font-black uppercase tracking-wider text-gray-700">Day Type:</label>
                            <div class="inline-flex rounded-full bg-white p-1 border border-gray-300 shadow-inner">
                                <button type="button" id="editor-set-training-btn"
                                    class="px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                                        !draftRoutine.isRest ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-black'
                                    }">
                                    Training Day
                                </button>
                                <button type="button" id="editor-set-rest-btn"
                                    class="px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                                        draftRoutine.isRest ? 'bg-amber-500 text-white shadow' : 'text-gray-600 hover:text-black'
                                    }">
                                    Rest Day
                                </button>
                            </div>
                        </div>

                        <div class="text-xs font-bold text-gray-600">
                            ${draftRoutine.isRest ? 'Recovery Day' : `${exCount} exercise${exCount === 1 ? '' : 's'} assigned`}
                        </div>
                    </div>

                    ${!draftRoutine.isRest ? `
                        <div>
                            <label for="editor-routine-name" class="block text-xs font-black uppercase tracking-wider text-dark mb-1">
                                Custom Routine Name: <span class="text-red-500">*</span>
                            </label>
                            <input id="editor-routine-name" type="text" maxlength="60"
                                value="${escapeHtml(draftRoutine.routineName)}"
                                placeholder="e.g. Chest & Triceps Hypertrophy, Upper Body Power, Legs & Abs"
                                class="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold text-dark focus:outline-none focus:ring-2 focus:ring-black">
                        </div>
                    ` : `
                        <div class="p-4 bg-white rounded-xl border border-dashed border-amber-300 text-sm text-gray-700">
                            <strong>Rest &amp; Recovery Day selected.</strong> Muscle tissue rebuilds and nervous system recovers during rest days. No exercises required.
                        </div>
                    `}
                </div>

                ${!draftRoutine.isRest ? `
                    <div class="space-y-4">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 class="text-lg font-black text-dark">
                                    Exercises in Routine (${exCount})
                                </h3>
                                <p class="text-xs text-gray-500">
                                    Reorder movements using ↑ ↓ arrows. Customize sets, reps, duration, rest intervals, and coaching cues.
                                </p>
                            </div>

                            <button id="editor-open-picker-btn" type="button"
                                class="px-4 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                                <span>+ Add Exercise to Routine</span>
                            </button>
                        </div>

                        ${exCount === 0 ? `
                            <div class="bg-gray-50 rounded-2xl p-8 border border-dashed border-gray-300 text-center space-y-3">
                                <div class="w-10 h-10 rounded-full bg-gray-200 text-dark font-black text-sm flex items-center justify-center mx-auto">0</div>
                                <h4 class="text-base font-bold text-dark">No exercises in this routine yet</h4>
                                <p class="text-xs text-gray-500 max-w-sm mx-auto">
                                    Click the button below to pick exercises from the Force Fitness catalog.
                                </p>
                                <button id="editor-empty-picker-btn" type="button"
                                    class="px-5 py-2.5 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition cursor-pointer">
                                    + Browse &amp; Add Exercises
                                </button>
                            </div>
                        ` : `
                            <div class="space-y-3" id="editor-exercise-items-list">
                                ${draftRoutine.exercises.map((ex, idx) => `
                                    <div class="bg-white border border-gray-300 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-gray-400 transition space-y-4" data-index="${idx}">
                                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                                            <div class="flex items-center gap-3">
                                                <span class="w-7 h-7 rounded-full bg-cream text-dark font-black text-xs flex items-center justify-center shrink-0 border border-gray-300">
                                                    ${idx + 1}
                                                </span>
                                                <div>
                                                    <h4 class="text-base font-black text-dark tracking-tight">
                                                        ${escapeHtml(ex.name)}
                                                    </h4>
                                                    <div class="flex items-center gap-2 mt-1">
                                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-black text-white">
                                                            ${escapeHtml(ex.muscleGroup || 'General')}
                                                        </span>
                                                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                                                            ${escapeHtml(ex.equipment || 'Bodyweight')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="flex items-center gap-2 self-end sm:self-center">
                                                <button type="button" data-move-up="${idx}" title="Move up in routine"
                                                    class="editor-move-up-btn p-1.5 rounded-lg border border-gray-300 text-xs font-bold hover:bg-cream transition cursor-pointer ${
                                                        idx === 0 ? 'opacity-30 cursor-not-allowed' : ''
                                                    }" ${idx === 0 ? 'disabled' : ''}>
                                                    ▲
                                                </button>
                                                <button type="button" data-move-down="${idx}" title="Move down in routine"
                                                    class="editor-move-down-btn p-1.5 rounded-lg border border-gray-300 text-xs font-bold hover:bg-cream transition cursor-pointer ${
                                                        idx === exCount - 1 ? 'opacity-30 cursor-not-allowed' : ''
                                                    }" ${idx === exCount - 1 ? 'disabled' : ''}>
                                                    ▼
                                                </button>
                                                <button type="button" data-remove-index="${idx}" title="Remove this exercise"
                                                    class="editor-remove-ex-btn ml-2 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-800 transition cursor-pointer">
                                                    ✕ Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div>
                                                <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sets (1-10)</label>
                                                <input type="number" min="1" max="10" data-field="sets" data-index="${idx}"
                                                    value="${ex.sets || 3}"
                                                    class="editor-field-input w-full bg-cream border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Target Reps</label>
                                                <input type="text" data-field="reps" data-index="${idx}"
                                                    value="${escapeHtml(ex.reps || '10-12')}"
                                                    placeholder="e.g. 8-10 or AMRAP"
                                                    class="editor-field-input w-full bg-cream border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Duration (opt.)</label>
                                                <input type="text" data-field="duration" data-index="${idx}"
                                                    value="${escapeHtml(ex.duration || '')}"
                                                    placeholder="e.g. 45s, 60s"
                                                    class="editor-field-input w-full bg-cream border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rest Interval</label>
                                                <select data-field="rest" data-index="${idx}"
                                                    class="editor-field-input w-full bg-cream border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                                                    <option value="30s" ${ex.rest === '30s' ? 'selected' : ''}>30 sec (Density)</option>
                                                    <option value="45s" ${ex.rest === '45s' ? 'selected' : ''}>45 sec (Fat Loss)</option>
                                                    <option value="60s" ${ex.rest === '60s' ? 'selected' : ''}>60 sec (Standard)</option>
                                                    <option value="75s" ${ex.rest === '75s' ? 'selected' : ''}>75 sec</option>
                                                    <option value="90s" ${ex.rest === '90s' || !ex.rest ? 'selected' : ''}>90 sec (Hypertrophy)</option>
                                                    <option value="120s" ${ex.rest === '120s' ? 'selected' : ''}>120 sec (Strength)</option>
                                                    <option value="180s" ${ex.rest === '180s' ? 'selected' : ''}>180 sec (Max Power)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Coaching Notes / Form Cues:</label>
                                            <input type="text" data-field="notes" data-index="${idx}"
                                                value="${escapeHtml(ex.notes || '')}"
                                                placeholder="e.g. 3-sec eccentric tempo, full lockout, squeeze peak contraction"
                                                class="editor-field-input w-full bg-cream border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                ` : ''}

                <div class="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span class="text-xs text-gray-500 font-medium">
                        Unsaved edits stay in draft until you click <strong>Save Changes</strong>.
                    </span>
                    <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button id="cancel-editor-btn-bottom" type="button"
                            class="px-5 py-2.5 rounded-full border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-100 transition cursor-pointer">
                            ✕ Discard Edits
                        </button>
                        <button id="save-editor-btn-bottom" type="button"
                            class="px-6 py-2.5 rounded-full bg-black text-white font-bold text-xs hover:bg-gray-800 transition shadow cursor-pointer">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;

        attachEditorListeners();
    }

    function attachEditorListeners() {
        const detailContainer = document.getElementById('selected-day-detail-panel');
        if (!detailContainer) return;

        const routineInput = document.getElementById('editor-routine-name');
        if (routineInput) {
            routineInput.addEventListener('input', (e) => {
                if (draftRoutine) draftRoutine.routineName = e.target.value;
            });
        }

        const setTrainingBtn = document.getElementById('editor-set-training-btn');
        const setRestBtn = document.getElementById('editor-set-rest-btn');
        if (setTrainingBtn) {
            setTrainingBtn.addEventListener('click', () => {
                if (draftRoutine && draftRoutine.isRest) {
                    draftRoutine.isRest = false;
                    if (!draftRoutine.routineName || draftRoutine.routineName.includes('Rest')) {
                        draftRoutine.routineName = 'Custom Routine';
                    }
                    renderEditorUI();
                }
            });
        }
        if (setRestBtn) {
            setRestBtn.addEventListener('click', () => {
                if (draftRoutine && !draftRoutine.isRest) {
                    draftRoutine.isRest = true;
                    draftRoutine.routineName = 'Rest & Recovery';
                    renderEditorUI();
                }
            });
        }

        ['save-editor-btn', 'save-editor-btn-bottom'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', saveEditing);
        });

        ['cancel-editor-btn', 'cancel-editor-btn-bottom'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', cancelEditing);
        });

        detailContainer.querySelectorAll('.editor-field-input').forEach(input => {
            const handler = (e) => {
                const idx = parseInt(input.getAttribute('data-index'), 10);
                const field = input.getAttribute('data-field');
                if (!isNaN(idx) && field && draftRoutine && draftRoutine.exercises[idx]) {
                    draftRoutine.exercises[idx][field] = e.target.value;
                }
            };
            input.addEventListener('change', handler);
            input.addEventListener('input', handler);
        });

        detailContainer.querySelectorAll('.editor-move-up-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-move-up'), 10);
                if (!isNaN(idx) && idx > 0 && draftRoutine) {
                    const temp = draftRoutine.exercises[idx - 1];
                    draftRoutine.exercises[idx - 1] = draftRoutine.exercises[idx];
                    draftRoutine.exercises[idx] = temp;
                    renderEditorUI();
                }
            });
        });

        detailContainer.querySelectorAll('.editor-move-down-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-move-down'), 10);
                if (!isNaN(idx) && draftRoutine && idx < draftRoutine.exercises.length - 1) {
                    const temp = draftRoutine.exercises[idx + 1];
                    draftRoutine.exercises[idx + 1] = draftRoutine.exercises[idx];
                    draftRoutine.exercises[idx] = temp;
                    renderEditorUI();
                }
            });
        });

        detailContainer.querySelectorAll('.editor-remove-ex-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-remove-index'), 10);
                if (!isNaN(idx) && draftRoutine) {
                    draftRoutine.exercises.splice(idx, 1);
                    renderEditorUI();
                }
            });
        });

        ['editor-open-picker-btn', 'editor-empty-picker-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', openExercisePickerModal);
        });
    }

    function showEditorNotification(message, type = 'error') {
        const banner = document.getElementById('editor-notification');
        if (!banner) return;
        banner.className = `p-4 rounded-xl text-xs font-bold transition flex items-center justify-between ${
            type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`;
        banner.innerHTML = `
            <span>${escapeHtml(message)}</span>
            <button type="button" class="text-xs text-gray-500 hover:text-black cursor-pointer" onclick="this.parentElement.classList.add('hidden')">✕</button>
        `;
        banner.classList.remove('hidden');
        if (type === 'success') {
            setTimeout(() => banner.classList.add('hidden'), 3000);
        }
    }

    function openExercisePickerModal() {
        let modal = document.getElementById('editor-picker-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'editor-picker-modal';
            document.body.appendChild(modal);
        }
        pickerSearch = '';
        pickerMuscle = 'All';
        pickerEquipment = 'All';
        renderPickerModalContent(modal);
        modal.classList.remove('hidden');
    }

    function closeExercisePickerModal() {
        const modal = document.getElementById('editor-picker-modal');
        if (modal) modal.classList.add('hidden');
    }

    function renderPickerModalContent(modal) {
        const filtered = EXERCISES.filter(ex => {
            if (pickerSearch) {
                const q = pickerSearch.toLowerCase();
                const mName = ex.name.toLowerCase().includes(q);
                const mMuscle = ex.muscleGroup.toLowerCase().includes(q);
                const mEq = ex.equipment.toLowerCase().includes(q);
                if (!mName && !mMuscle && !mEq) return false;
            }
            if (pickerMuscle !== 'All' && ex.muscleGroup !== pickerMuscle) return false;
            if (pickerEquipment !== 'All' && ex.equipment !== pickerEquipment) return false;
            return true;
        });

        modal.innerHTML = `
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                <div class="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
                    <div class="p-6 border-b border-gray-200 flex items-center justify-between bg-cream">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Exercise Catalog</span>
                            <h3 class="text-xl font-black text-dark">Add Exercise to ${escapeHtml(draftRoutine ? draftRoutine.dayName : 'Routine')}</h3>
                        </div>
                        <button id="close-picker-modal-btn" type="button"
                            class="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition cursor-pointer">
                            ✕
                        </button>
                    </div>

                    <div class="p-4 border-b border-gray-100 space-y-3 bg-white">
                        <div class="flex flex-col sm:flex-row gap-2">
                            <div class="relative flex-1">
                                <input id="picker-search-input" type="text" value="${escapeHtml(pickerSearch)}"
                                    placeholder="Search by name, muscle, or equipment..."
                                    class="w-full bg-cream border border-gray-300 rounded-full py-2 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black">
                            </div>
                            <select id="picker-equipment-select"
                                class="bg-cream border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black">
                                ${EQUIPMENT_TYPES.map(eq => `<option value="${eq}" ${pickerEquipment === eq ? 'selected' : ''}>${eq}</option>`).join('')}
                            </select>
                        </div>
                        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                            ${MUSCLE_GROUPS.map(muscle => `
                                <button type="button" data-picker-muscle="${muscle}"
                                    class="picker-muscle-pill px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer transition ${
                                        pickerMuscle === muscle ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }">
                                    ${muscle}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                        ${filtered.length === 0 ? `
                            <div class="p-8 text-center text-gray-500 text-xs">No exercises match your filter criteria.</div>
                        ` : `
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                ${filtered.map(ex => {
                                    const isAlreadyIn = draftRoutine && draftRoutine.exercises.some(e => e.id === ex.id);
                                    return `
                                        <div class="p-3.5 rounded-2xl border border-gray-200 hover:border-gray-400 bg-white shadow-sm flex flex-col justify-between transition">
                                            <div>
                                                <div class="flex items-center justify-between gap-1 mb-1.5">
                                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white">${escapeHtml(ex.muscleGroup)}</span>
                                                    <span class="text-[10px] font-semibold text-gray-500">${escapeHtml(ex.equipment)}</span>
                                                </div>
                                                <h4 class="text-sm font-black text-dark">${escapeHtml(ex.name)}</h4>
                                                <p class="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-snug">${escapeHtml(ex.description)}</p>
                                            </div>
                                            <div class="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                                <span class="text-[10px] font-bold text-gray-400">${ex.defaultSets} sets × ${escapeHtml(ex.defaultReps)}</span>
                                                <button type="button" data-add-to-draft="${ex.id}"
                                                    class="picker-add-btn px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                                        isAlreadyIn ? 'bg-cream text-dark border border-gray-300 hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                                                    }">
                                                    ${isAlreadyIn ? '+ Add Again' : '+ Add'}
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </div>

                    <div class="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                        <span>Showing ${filtered.length} of ${EXERCISES.length} exercises</span>
                        <button id="picker-done-btn" type="button" class="px-5 py-2 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition cursor-pointer">Done</button>
                    </div>
                </div>
            </div>
        `;

        const closeBtn = modal.querySelector('#close-picker-modal-btn');
        const doneBtn = modal.querySelector('#picker-done-btn');
        [closeBtn, doneBtn].forEach(b => {
            if (b) b.addEventListener('click', closeExercisePickerModal);
        });

        const searchInput = modal.querySelector('#picker-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                pickerSearch = e.target.value.trim();
                renderPickerModalContent(modal);
            });
        }

        const eqSelect = modal.querySelector('#picker-equipment-select');
        if (eqSelect) {
            eqSelect.addEventListener('change', (e) => {
                pickerEquipment = e.target.value;
                renderPickerModalContent(modal);
            });
        }

        modal.querySelectorAll('.picker-muscle-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                pickerMuscle = pill.getAttribute('data-picker-muscle') || 'All';
                renderPickerModalContent(modal);
            });
        });

        modal.querySelectorAll('.picker-add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const exId = btn.getAttribute('data-add-to-draft');
                const exercise = EXERCISES.find(e => e.id === exId);
                if (!exercise || !draftRoutine) return;

                draftRoutine.exercises.push({
                    id: exercise.id,
                    name: exercise.name,
                    muscleGroup: exercise.muscleGroup,
                    equipment: exercise.equipment,
                    sets: exercise.defaultSets || 3,
                    reps: exercise.defaultReps || '10-12',
                    duration: exercise.defaultReps && /^\d[\d\s\-]*s$/i.test(exercise.defaultReps.trim()) ? exercise.defaultReps : '',
                    rest: '90s',
                    notes: exercise.description || ''
                });

                btn.textContent = '✓ Added!';
                btn.classList.add('bg-emerald-600', 'text-white');
                setTimeout(() => renderPickerModalContent(modal), 600);
                renderEditorUI();
            });
        });
    }

    // ─── 5. Smart Plan Generator ───────────────────────────────────────────────
    let isGeneratorOpen = false;
    let previewSchedule = null;

    function initGenerator() {
        const openBtn = document.getElementById('open-plan-generator-btn');
        if (openBtn) openBtn.addEventListener('click', openGeneratorModal);
    }

    function openGeneratorModal() {
        let modal = document.getElementById('plan-generator-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'plan-generator-modal';
            document.body.appendChild(modal);
        }
        isGeneratorOpen = true;
        previewSchedule = null;
        renderGeneratorModal(modal);
        modal.classList.remove('hidden');
    }

    function closeGeneratorModal() {
        const modal = document.getElementById('plan-generator-modal');
        if (modal) modal.classList.add('hidden');
        isGeneratorOpen = false;
        previewSchedule = null;
    }

    function renderGeneratorModal(modal) {
        modal.innerHTML = `
            <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
                <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
                    <div class="p-6 border-b border-gray-200 flex items-center justify-between bg-cream">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-black text-white">Algorithmic Engine</span>
                                <span class="text-xs font-bold text-gray-500">Periodized Schedule</span>
                            </div>
                            <h2 class="text-2xl sm:text-3xl font-black text-dark tracking-tight">Smart Workout Plan Generator</h2>
                        </div>
                        <button id="close-generator-modal-btn" type="button"
                            class="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition cursor-pointer">
                            ✕
                        </button>
                    </div>

                    <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-white" id="generator-modal-body">
                        <p class="text-sm text-gray-600 leading-relaxed">
                            Configure your training preferences below. The engine will structure an optimal 7-day routine with sensible recovery days and balanced muscular volume tailored to your equipment and schedule.
                        </p>
                        <div id="generator-alert-banner" class="hidden p-4 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200"></div>

                        <div class="space-y-2">
                            <label class="block text-xs font-black uppercase tracking-wider text-dark">1. Primary Fitness Goal:</label>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label class="generator-option-card flex items-start gap-3 p-3.5 rounded-2xl border-2 border-black bg-cream cursor-pointer transition">
                                    <input type="radio" name="gen-goal" value="hypertrophy" checked class="mt-1 accent-black">
                                    <div>
                                        <span class="font-black text-sm text-dark block">Muscle Building (Hypertrophy)</span>
                                        <span class="text-xs text-gray-500 block mt-0.5">Moderate-heavy load, 8-12 rep range, 75-90s rest for maximum muscle hypertrophy.</span>
                                    </div>
                                </label>
                                <label class="generator-option-card flex items-start gap-3 p-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-400 cursor-pointer transition">
                                    <input type="radio" name="gen-goal" value="strength" class="mt-1 accent-black">
                                    <div>
                                        <span class="font-black text-sm text-dark block">Strength &amp; Power</span>
                                        <span class="text-xs text-gray-500 block mt-0.5">Heavy compound lifts, 4-6 rep strength focus, 120-180s full neurological recovery.</span>
                                    </div>
                                </label>
                                <label class="generator-option-card flex items-start gap-3 p-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-400 cursor-pointer transition">
                                    <input type="radio" name="gen-goal" value="fat_loss" class="mt-1 accent-black">
                                    <div>
                                        <span class="font-black text-sm text-dark block">Fat Loss &amp; Conditioning</span>
                                        <span class="text-xs text-gray-500 block mt-0.5">Higher density, 12-15 reps, 45-60s rest to elevate heart rate and metabolic output.</span>
                                    </div>
                                </label>
                                <label class="generator-option-card flex items-start gap-3 p-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-400 cursor-pointer transition">
                                    <input type="radio" name="gen-goal" value="general_fitness" class="mt-1 accent-black">
                                    <div>
                                        <span class="font-black text-sm text-dark block">General Fitness &amp; Longevity</span>
                                        <span class="text-xs text-gray-500 block mt-0.5">Balanced full-body movement, core stability, posture, and cardiovascular health.</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-xs font-black uppercase tracking-wider text-dark">2. Training Experience Level:</label>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label class="generator-option-card flex items-center gap-2.5 p-3 rounded-2xl border-2 border-gray-200 hover:border-gray-400 cursor-pointer transition">
                                    <input type="radio" name="gen-experience" value="beginner" class="accent-black">
                                    <div>
                                        <span class="font-bold text-xs text-dark block">Beginner</span>
                                        <span class="text-[11px] text-gray-500 block">0–1 years training</span>
                                    </div>
                                </label>
                                <label class="generator-option-card flex items-center gap-2.5 p-3 rounded-2xl border-2 border-black bg-cream cursor-pointer transition">
                                    <input type="radio" name="gen-experience" value="intermediate" checked class="accent-black">
                                    <div>
                                        <span class="font-bold text-xs text-dark block">Intermediate</span>
                                        <span class="text-[11px] text-gray-500 block">1–3 years training</span>
                                    </div>
                                </label>
                                <label class="generator-option-card flex items-center gap-2.5 p-3 rounded-2xl border-2 border-gray-200 hover:border-gray-400 cursor-pointer transition">
                                    <input type="radio" name="gen-experience" value="advanced" class="accent-black">
                                    <div>
                                        <span class="font-bold text-xs text-dark block">Advanced</span>
                                        <span class="text-[11px] text-gray-500 block">3+ years training</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-xs font-black uppercase tracking-wider text-dark">3. Training Frequency (Days / Week):</label>
                            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                ${[2, 3, 4, 5, 6].map(d => `
                                    <label class="generator-option-card text-center p-3 rounded-2xl border-2 ${
                                        d === 4 ? 'border-black bg-cream' : 'border-gray-200 hover:border-gray-400'
                                    } cursor-pointer transition flex flex-col items-center justify-center">
                                        <input type="radio" name="gen-days" value="${d}" ${d === 4 ? 'checked' : ''} class="sr-only">
                                        <span class="font-black text-lg text-dark">${d} Days</span>
                                        <span class="text-[10px] text-gray-500 font-bold mt-0.5">
                                            ${d === 2 ? 'Full Body' : d === 3 ? 'Full Body 3x' : d === 4 ? 'Upper/Lower' : d === 5 ? 'PPL + U/L' : 'PPL × 2'}
                                        </span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-xs font-black uppercase tracking-wider text-dark">4. Available Equipment:</label>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label class="generator-option-card flex items-start gap-3 p-3.5 rounded-2xl border-2 border-black bg-cream cursor-pointer transition">
                                    <input type="radio" name="gen-equipment" value="full_gym" checked class="mt-1 accent-black">
                                    <div>
                                        <span class="font-black text-xs text-dark block">Full Gym</span>
                                        <span class="text-[11px] text-gray-500 block mt-0.5">Barbells, Dumbbells, Cables, &amp; Machines</span>
                                    </div>
                                </label>
                                <label class="generator-option-card flex items-start gap-3 p-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-400 cursor-pointer transition">
                                    <input type="radio" name="gen-equipment" value="dumbbells_only" class="mt-1 accent-black">
                                    <div>
                                        <span class="font-black text-xs text-dark block">Dumbbells Only</span>
                                        <span class="text-[11px] text-gray-500 block mt-0.5">Dumbbells, Bench, &amp; Bodyweight</span>
                                    </div>
                                </label>
                                <label class="generator-option-card flex items-start gap-3 p-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-400 cursor-pointer transition">
                                    <input type="radio" name="gen-equipment" value="bodyweight_home" class="mt-1 accent-black">
                                    <div>
                                        <span class="font-black text-xs text-dark block">Bodyweight / Home</span>
                                        <span class="text-[11px] text-gray-500 block mt-0.5">Calisthenics, Pull-up bar &amp; Floor core</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-xs font-black uppercase tracking-wider text-dark">5. Preferred Session Duration:</label>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                ${[
                                    { val: '30_min', label: '30 Minutes', desc: '3 movements (Express)' },
                                    { val: '45_min', label: '45 Minutes', desc: '4 movements (Efficient)' },
                                    { val: '60_min', label: '60 Minutes', desc: '5 movements (Standard)', default: true },
                                    { val: '90_min', label: '90 Minutes', desc: '6-7 movements (High Vol)' }
                                ].map(dur => `
                                    <label class="generator-option-card flex flex-col justify-between p-3 rounded-2xl border-2 ${
                                        dur.default ? 'border-black bg-cream' : 'border-gray-200 hover:border-gray-400'
                                    } cursor-pointer transition">
                                        <div class="flex items-center justify-between mb-1">
                                            <span class="font-black text-xs text-dark">${dur.label}</span>
                                            <input type="radio" name="gen-duration" value="${dur.val}" ${dur.default ? 'checked' : ''} class="accent-black">
                                        </div>
                                        <span class="text-[10px] text-gray-500 font-semibold">${dur.desc}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div id="generator-preview-container" class="hidden pt-4 border-t border-gray-200 space-y-4"></div>
                    </div>

                    <div class="p-6 border-t border-gray-200 bg-cream flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span class="text-xs text-gray-500 font-semibold">Ready to generate? You can freely edit any exercises afterwards.</span>
                        <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <button id="generator-preview-btn" type="button"
                                class="px-5 py-2.5 rounded-full border border-gray-300 bg-white font-bold text-xs text-dark hover:bg-gray-100 transition cursor-pointer">
                                Preview Schedule
                            </button>
                            <button id="generator-apply-btn" type="button"
                                class="px-6 py-2.5 rounded-full bg-black text-white font-bold text-xs hover:bg-gray-800 hover:scale-105 active:scale-95 transition shadow cursor-pointer">
                                Generate &amp; Apply Schedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        attachGeneratorEvents(modal);
    }

    function attachGeneratorEvents(modal) {
        const closeBtn = modal.querySelector('#close-generator-modal-btn');
        if (closeBtn) closeBtn.addEventListener('click', closeGeneratorModal);

        modal.querySelectorAll('.generator-option-card input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const groupName = radio.name;
                modal.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
                    const card = r.closest('.generator-option-card');
                    if (card) {
                        if (r.checked) {
                            card.classList.add('border-black', 'bg-cream');
                            card.classList.remove('border-gray-200');
                        } else {
                            card.classList.remove('border-black', 'bg-cream');
                            card.classList.add('border-gray-200');
                        }
                    }
                });
            });
        });

        const previewBtn = modal.querySelector('#generator-preview-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                const config = collectGeneratorInputs(modal);
                if (!config) return;
                previewSchedule = createScheduleFromConfig(config);
                renderSchedulePreview(modal, previewSchedule, config);
            });
        }

        const applyBtn = modal.querySelector('#generator-apply-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const config = collectGeneratorInputs(modal);
                if (!config) return;
                const scheduleToApply = previewSchedule || createScheduleFromConfig(config);
                replaceSchedule(scheduleToApply);
                setSelectedDayId('monday');
                closeGeneratorModal();
                window.dispatchEvent(new CustomEvent('schedule-updated'));
                window.dispatchEvent(new CustomEvent('selected-day-changed', { detail: 'monday' }));
                showGlobalToast('New workout schedule generated & applied successfully!');
            });
        }
    }

    function collectGeneratorInputs(modal) {
        const goalRadio = modal.querySelector('input[name="gen-goal"]:checked');
        const expRadio = modal.querySelector('input[name="gen-experience"]:checked');
        const daysRadio = modal.querySelector('input[name="gen-days"]:checked');
        const eqRadio = modal.querySelector('input[name="gen-equipment"]:checked');
        const durRadio = modal.querySelector('input[name="gen-duration"]:checked');
        const alertBanner = modal.querySelector('#generator-alert-banner');

        if (!goalRadio || !expRadio || !daysRadio || !eqRadio || !durRadio) {
            if (alertBanner) {
                alertBanner.textContent = 'Please make sure all 5 training parameters are selected.';
                alertBanner.classList.remove('hidden');
            }
            return null;
        }

        if (alertBanner) alertBanner.classList.add('hidden');

        return {
            goal: goalRadio.value,
            experience: expRadio.value,
            days: parseInt(daysRadio.value, 10),
            equipment: eqRadio.value,
            duration: durRadio.value
        };
    }

    function createScheduleFromConfig(config) {
        const { goal, experience, days, equipment, duration } = config;
        let allowedExercises = EXERCISES;
        if (equipment === 'bodyweight_home') {
            allowedExercises = EXERCISES.filter(e => e.equipment === 'Bodyweight');
        } else if (equipment === 'dumbbells_only') {
            allowedExercises = EXERCISES.filter(e => e.equipment === 'Dumbbell' || e.equipment === 'Bodyweight');
        }

        let exCountPerSession = 5;
        if (duration === '30_min') exCountPerSession = 3;
        else if (duration === '45_min') exCountPerSession = 4;
        else if (duration === '60_min') exCountPerSession = 5;
        else if (duration === '90_min') exCountPerSession = 6;

        let targetSets = 3;
        let targetReps = '10-12';
        let targetRest = '90s';
        let goalNote = '';

        if (goal === 'hypertrophy') {
            targetSets = experience === 'advanced' ? 4 : 3;
            targetReps = '8-12';
            targetRest = '75s';
            goalNote = 'Focus on 3s eccentric tempo and maximum stretch under tension.';
        } else if (goal === 'strength') {
            targetSets = experience === 'beginner' ? 3 : 4;
            targetReps = '4-6';
            targetRest = '120s';
            goalNote = 'Compound strength focus. Maintain solid brace and explosive drive.';
        } else if (goal === 'fat_loss') {
            targetSets = 3;
            targetReps = '12-15';
            targetRest = '45s';
            goalNote = 'Maintain elevated heart rate. Strict rest intervals.';
        } else {
            targetSets = 3;
            targetReps = '10-12';
            targetRest = '60s';
            goalNote = 'Controlled form, full range of motion, and mindful breathing.';
        }

        const dayTemplates = getDayTemplatesForSplit(days, goal);

        return dayTemplates.map((template, dayIndex) => {
            const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const dayIds = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

            if (template.isRest) {
                return {
                    dayId: dayIds[dayIndex],
                    dayName: dayNames[dayIndex],
                    dayNumber: dayIndex + 1,
                    isRest: true,
                    routineName: template.routineName || 'Rest & Recovery',
                    exercises: []
                };
            }

            const selectedExercises = pickExercisesForMuscles(
                template.focusMuscles,
                allowedExercises,
                exCountPerSession,
                { targetSets, targetReps, targetRest, goalNote }
            );

            return {
                dayId: dayIds[dayIndex],
                dayName: dayNames[dayIndex],
                dayNumber: dayIndex + 1,
                isRest: false,
                routineName: template.routineName,
                exercises: selectedExercises
            };
        });
    }

    function getDayTemplatesForSplit(days, goal) {
        switch (days) {
            case 2:
                return [
                    { isRest: true, routineName: 'Rest & Mobility' },
                    { isRest: false, routineName: 'Full Body (A) — Foundation', focusMuscles: ['Chest', 'Legs', 'Back', 'Core'] },
                    { isRest: true, routineName: 'Rest & Recovery' },
                    { isRest: true, routineName: 'Rest & Recovery' },
                    { isRest: false, routineName: 'Full Body (B) — Athletic', focusMuscles: ['Back', 'Shoulders', 'Legs', 'Arms'] },
                    { isRest: true, routineName: 'Rest & Active Recovery' },
                    { isRest: true, routineName: 'Rest & Recovery' }
                ];
            case 3:
                return [
                    { isRest: false, routineName: 'Full Body (A) — Push & Quad Focus', focusMuscles: ['Chest', 'Legs', 'Shoulders', 'Arms'] },
                    { isRest: true, routineName: 'Rest & Recovery' },
                    { isRest: false, routineName: 'Full Body (B) — Pull & Posterior Chain', focusMuscles: ['Back', 'Legs', 'Arms', 'Core'] },
                    { isRest: true, routineName: 'Rest & Recovery' },
                    { isRest: false, routineName: 'Full Body (C) — Compound Synergy', focusMuscles: ['Legs', 'Chest', 'Back', 'Shoulders'] },
                    { isRest: true, routineName: 'Rest & Mobility' },
                    { isRest: true, routineName: 'Rest & Recovery' }
                ];
            case 4:
                return [
                    { isRest: false, routineName: 'Upper Body (A) — Power & Press', focusMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'] },
                    { isRest: false, routineName: 'Lower Body (A) — Quads & Core', focusMuscles: ['Legs', 'Core'] },
                    { isRest: true, routineName: 'Rest & Recovery' },
                    { isRest: false, routineName: 'Upper Body (B) — Hypertrophy & Pull', focusMuscles: ['Back', 'Chest', 'Shoulders', 'Arms'] },
                    { isRest: false, routineName: 'Lower Body (B) — Hamstrings & Glutes', focusMuscles: ['Legs', 'Core'] },
                    { isRest: true, routineName: 'Rest & Mobility' },
                    { isRest: true, routineName: 'Rest & Recovery' }
                ];
            case 5:
                return [
                    { isRest: false, routineName: 'Push (Chest, Delts & Triceps)', focusMuscles: ['Chest', 'Shoulders', 'Arms'] },
                    { isRest: false, routineName: 'Pull (Back, Rear Delts & Biceps)', focusMuscles: ['Back', 'Shoulders', 'Arms'] },
                    { isRest: false, routineName: 'Legs & Core Conditioning', focusMuscles: ['Legs', 'Core'] },
                    { isRest: true, routineName: 'Mid-Week Rest & Recovery' },
                    { isRest: false, routineName: 'Upper Body Compound Hypertrophy', focusMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'] },
                    { isRest: false, routineName: 'Lower Body & Core Power', focusMuscles: ['Legs', 'Core'] },
                    { isRest: true, routineName: 'Rest & Recovery' }
                ];
            case 6:
                return [
                    { isRest: false, routineName: 'Push (A) — Horizontal Press Focus', focusMuscles: ['Chest', 'Shoulders', 'Arms'] },
                    { isRest: false, routineName: 'Pull (A) — Vertical Lat Focus', focusMuscles: ['Back', 'Arms'] },
                    { isRest: false, routineName: 'Legs (A) — Quad Dominant', focusMuscles: ['Legs', 'Core'] },
                    { isRest: false, routineName: 'Push (B) — Incline & Overhead', focusMuscles: ['Shoulders', 'Chest', 'Arms'] },
                    { isRest: false, routineName: 'Pull (B) — Horizontal Density & Rows', focusMuscles: ['Back', 'Shoulders', 'Arms'] },
                    { isRest: false, routineName: 'Legs (B) — Hamstrings & Glutes', focusMuscles: ['Legs', 'Core'] },
                    { isRest: true, routineName: 'Rest & Total Recovery' }
                ];
            default:
                return getDayTemplatesForSplit(4, goal);
        }
    }

    function pickExercisesForMuscles(muscles, allowedPool, count, params) {
        const chosen = [];
        const usedIds = new Set();
        let muscleIdx = 0;
        while (chosen.length < count && muscleIdx < muscles.length * 3) {
            const targetMuscle = muscles[muscleIdx % muscles.length];
            const candidates = allowedPool.filter(e => e.muscleGroup === targetMuscle && !usedIds.has(e.id));
            if (candidates.length > 0) {
                const pick = candidates[0];
                usedIds.add(pick.id);
                chosen.push({
                    id: pick.id,
                    name: pick.name,
                    muscleGroup: pick.muscleGroup,
                    equipment: pick.equipment,
                    sets: params.targetSets,
                    reps: pick.defaultReps && /^\d[\d\s\-]*s$/i.test(pick.defaultReps.trim()) ? pick.defaultReps : params.targetReps,
                    duration: pick.defaultReps && /^\d[\d\s\-]*s$/i.test(pick.defaultReps.trim()) ? pick.defaultReps : '',
                    rest: params.targetRest,
                    notes: `${params.goalNote} ${pick.description || ''}`.trim()
                });
            }
            muscleIdx++;
        }

        if (chosen.length < count) {
            const remaining = allowedPool.filter(e => !usedIds.has(e.id));
            for (const pick of remaining) {
                if (chosen.length >= count) break;
                usedIds.add(pick.id);
                chosen.push({
                    id: pick.id,
                    name: pick.name,
                    muscleGroup: pick.muscleGroup,
                    equipment: pick.equipment,
                    sets: params.targetSets,
                    reps: pick.defaultReps && /^\d[\d\s\-]*s$/i.test(pick.defaultReps.trim()) ? pick.defaultReps : params.targetReps,
                    duration: pick.defaultReps && /^\d[\d\s\-]*s$/i.test(pick.defaultReps.trim()) ? pick.defaultReps : '',
                    rest: params.targetRest,
                    notes: params.goalNote
                });
            }
        }
        return chosen;
    }

    function renderSchedulePreview(modal, schedule, config) {
        const container = modal.querySelector('#generator-preview-container');
        if (!container) return;

        const trainingDays = schedule.filter(d => !d.isRest).length;
        const totalSets = schedule.reduce((sum, d) => sum + (d.isRest ? 0 : d.exercises.reduce((s, e) => s + e.sets, 0)), 0);

        container.classList.remove('hidden');
        container.innerHTML = `
            <div class="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div>
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Preview Generated Split</span>
                        <h4 class="text-lg font-black text-dark">${trainingDays}-Day Custom Routine</h4>
                    </div>
                    <span class="px-3 py-1 bg-black text-white text-xs font-bold rounded-full">${totalSets} Total Sets/Wk</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    ${schedule.map(d => `
                        <div class="p-3 rounded-xl border ${
                            d.isRest ? 'bg-cream border-gray-200 text-gray-500' : 'bg-white border-gray-300 text-dark shadow-sm'
                        } flex flex-col justify-between min-h-28">
                            <div>
                                <div class="flex items-center justify-between font-bold text-xs mb-1">
                                    <span>${escapeHtml(d.dayName)}</span>
                                    <span class="text-[9px] px-1.5 py-0.2 rounded font-black ${d.isRest ? 'bg-amber-100 text-amber-800' : 'bg-black text-white'}">
                                        D${d.dayNumber}
                                    </span>
                                </div>
                                <h4 class="text-xs font-black line-clamp-2 leading-tight">${escapeHtml(d.routineName)}</h4>
                            </div>
                            <div class="mt-2 pt-1 border-t border-gray-100 text-[10px] font-bold">
                                ${d.isRest ? 'Rest' : `${d.exercises.length} exercises`}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <p class="text-xs text-gray-500 italic">Click <strong>"Generate &amp; Apply Schedule"</strong> below to replace your weekly schedule.</p>
            </div>
        `;
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function showGlobalToast(message) {
        let toast = document.getElementById('force-fitness-global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'force-fitness-global-toast';
            document.body.appendChild(toast);
        }
        toast.className = 'fixed bottom-6 right-6 z-50 bg-black text-white px-6 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border border-gray-700 flex items-center gap-2 animate-fadeIn';
        toast.innerHTML = `<span>✓</span> <span>${escapeHtml(message)}</span>`;
        toast.style.display = 'flex';
        setTimeout(() => { toast.style.display = 'none'; }, 4000);
    }

    // ─── 6. Exercise Library Catalog ───────────────────────────────────────────
    let currentSearch = '';
    let currentMuscle = 'All';
    let currentEquipment = 'All';
    let currentDifficulty = 'All';

    function initLibrary() {
        renderLibraryFilters();
        renderLibraryList();
        window.addEventListener('selected-day-changed', () => renderLibraryList());
        window.addEventListener('schedule-updated', () => renderLibraryList());
    }

    function renderLibraryFilters() {
        const filterContainer = document.getElementById('library-filters-container');
        if (!filterContainer) return;

        filterContainer.innerHTML = `
            <div class="flex flex-col gap-4">
                <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    <div class="relative flex-1">
                        <input id="exercise-search-input" type="text" value="${escapeHtml(currentSearch)}"
                            placeholder="Search exercises by name, muscle, or equipment..."
                            class="w-full bg-white border border-gray-300 rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black">
                        <span class="absolute left-4 top-3.5 text-gray-400 flex items-center justify-center">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </span>
                        ${currentSearch ? `<button id="clear-search-btn" class="absolute right-3.5 top-2.5 text-xs text-gray-400 hover:text-black">✕</button>` : ''}
                    </div>

                    <div class="flex flex-wrap gap-2.5 items-center">
                        <div class="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <label for="equipment-filter-select">Equipment:</label>
                            <select id="equipment-filter-select"
                                class="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black">
                                ${EQUIPMENT_TYPES.map(eq => `<option value="${eq}" ${currentEquipment === eq ? 'selected' : ''}>${eq}</option>`).join('')}
                            </select>
                        </div>
                        <div class="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <label for="difficulty-filter-select">Difficulty:</label>
                            <select id="difficulty-filter-select"
                                class="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black">
                                ${DIFFICULTY_LEVELS.map(diff => `<option value="${diff}" ${currentDifficulty === diff ? 'selected' : ''}>${diff}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Muscles:</span>
                    ${MUSCLE_GROUPS.map(muscle => {
                        const isActive = currentMuscle === muscle;
                        return `
                            <button type="button" data-muscle="${muscle}"
                                class="muscle-pill-btn px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                                    isActive ? 'bg-black text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }">
                                ${muscle}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        const searchInput = document.getElementById('exercise-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.trim();
                renderLibraryList();
            });
        }

        const clearBtn = document.getElementById('clear-search-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                currentSearch = '';
                renderLibraryFilters();
                renderLibraryList();
            });
        }

        const eqSelect = document.getElementById('equipment-filter-select');
        if (eqSelect) {
            eqSelect.addEventListener('change', (e) => {
                currentEquipment = e.target.value;
                renderLibraryList();
            });
        }

        const diffSelect = document.getElementById('difficulty-filter-select');
        if (diffSelect) {
            diffSelect.addEventListener('change', (e) => {
                currentDifficulty = e.target.value;
                renderLibraryList();
            });
        }

        filterContainer.querySelectorAll('.muscle-pill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentMuscle = btn.getAttribute('data-muscle') || 'All';
                renderLibraryFilters();
                renderLibraryList();
            });
        });
    }

    function renderLibraryList() {
        const listContainer = document.getElementById('library-list-container');
        if (!listContainer) return;

        const filtered = EXERCISES.filter(ex => {
            if (currentSearch) {
                const query = currentSearch.toLowerCase();
                const matchName = ex.name.toLowerCase().includes(query);
                const matchMuscle = ex.muscleGroup.toLowerCase().includes(query);
                const matchEq = ex.equipment.toLowerCase().includes(query);
                if (!matchName && !matchMuscle && !matchEq) return false;
            }
            if (currentMuscle !== 'All' && ex.muscleGroup !== currentMuscle) return false;
            if (currentEquipment !== 'All' && ex.equipment !== currentEquipment) return false;
            if (currentDifficulty !== 'All' && ex.difficulty !== currentDifficulty) return false;
            return true;
        });

        const selectedDayId = getSelectedDayId();
        const currentDay = getDay(selectedDayId);
        const dayLabel = currentDay ? currentDay.dayName : 'Today';
        const countText = `Showing ${filtered.length} of ${EXERCISES.length} exercises`;

        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <div class="py-4">
                    <p class="text-xs font-semibold text-gray-500 mb-4">${countText}</p>
                    <div class="bg-white rounded-3xl p-10 text-center border border-gray-200">
                        <div class="w-12 h-12 rounded-full bg-cream border border-gray-300 flex items-center justify-center mx-auto mb-3 text-dark font-black text-sm">0</div>
                        <h3 class="text-xl font-bold text-dark">No exercises found</h3>
                        <p class="text-gray-500 text-sm mt-1">Try clearing your filters or search keywords.</p>
                        <button id="reset-filters-btn" class="mt-4 px-5 py-2 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition">
                            Reset Filters
                        </button>
                    </div>
                </div>
            `;
            const resetBtn = document.getElementById('reset-filters-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    currentSearch = '';
                    currentMuscle = 'All';
                    currentEquipment = 'All';
                    currentDifficulty = 'All';
                    renderLibraryFilters();
                    renderLibraryList();
                });
            }
            return;
        }

        listContainer.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
                    <span>${countText}</span>
                    <span>Active Target: <strong class="text-dark">${dayLabel}</strong></span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${filtered.map(ex => `
                        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between gap-2 mb-2.5">
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-black text-white">${escapeHtml(ex.muscleGroup)}</span>
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">${escapeHtml(ex.equipment)}</span>
                                </div>
                                <h3 class="text-lg font-black text-dark tracking-tight">${escapeHtml(ex.name)}</h3>
                                <p class="text-xs text-gray-500 mt-2 leading-relaxed">${escapeHtml(ex.description)}</p>
                            </div>
                            <div class="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span class="text-xs font-semibold text-gray-400">${escapeHtml(ex.difficulty)} • ${ex.defaultSets}×${escapeHtml(ex.defaultReps)}</span>
                                <button type="button" data-exercise-id="${ex.id}"
                                    class="add-to-day-btn px-4 py-1.5 bg-gray-dark text-white rounded-full text-xs font-bold hover:bg-black hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1">
                                    <span>+ Add to ${dayLabel}</span>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        listContainer.querySelectorAll('.add-to-day-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const exerciseId = btn.getAttribute('data-exercise-id');
                const exercise = EXERCISES.find(e => e.id === exerciseId);
                if (!exercise) return;

                const currentDayId = getSelectedDayId();
                addExerciseToDay(currentDayId, exercise);

                const originalText = btn.innerHTML;
                btn.innerHTML = `<span>✓ Added!</span>`;
                btn.classList.add('bg-green-600');
                btn.classList.remove('bg-gray-dark', 'hover:bg-black');

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('bg-green-600');
                    btn.classList.add('bg-gray-dark', 'hover:bg-black');
                }, 1000);

                window.dispatchEvent(new CustomEvent('schedule-updated'));
            });
        });
    }

    // ─── 7. Active Workout Tracker ─────────────────────────────────────────────
    let session = null;
    let animFrameId = null;
    let trackerContainer = null;

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
            const ok = confirm(`You have an unfinished "${existing.routineName}" session. Starting a new workout will discard it. Continue?`);
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

        if (!session.isPaused) {
            const gap = session.lastSavedAt ? (Date.now() - session.lastSavedAt) : 0;
            session.pausedMs += gap;
            session.isPaused = true;
            session.lastPauseAt = Date.now();
            if (session.isResting) {
                session.restPausedMs += gap;
            }
        }

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
                    weight: (s.weight !== null && s.weight !== undefined && Number(s.weight) > 0) ? Number(s.weight) : null,
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

    function completeSet(exIdx, setIdx, reps, weight) {
        if (!session) return;
        const exercise = session.exercises[exIdx];
        if (!exercise) return;
        const set = exercise.sets[setIdx];
        if (!set || set.completed) return;

        set.completed = true;
        set.reps = reps;
        set.weight = weight || null;

        const nextUncompleted = exercise.sets.findIndex(s => !s.completed);
        if (nextUncompleted !== -1) {
            session.currentSetIndex = nextUncompleted;
            session.isResting = true;
            session.restStartedAt = Date.now();
            session.restDurationMs = exercise.restSeconds * 1000;
            session.restPausedMs = 0;
        } else {
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

    function startTimerLoop() {
        stopTimerLoop();
        let lastRestCheck = 0;

        function tick(timestamp) {
            updateTimerDisplays();
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
            const prefs = getPreferences();
            if (prefs && prefs.soundEnabled === false) return;
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
        } catch (_) {}
    }

    function renderStartScreen() {
        if (!trackerContainer) return;
        const schedule = getSchedule();
        const trainingDays = schedule.filter(d => !d.isRest && d.exercises?.length > 0);
        const saved = getActiveSession();

        let resumeBanner = '';
        if (saved) {
            const elapsed = saved.lastPauseAt
                ? (saved.lastPauseAt - saved.startedAt) - saved.pausedMs
                : 0;
            const completedSets = saved.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
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

        trackerContainer.innerHTML = `
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

    function renderActiveWorkout() {
        if (!session || !trackerContainer) return;
        const currentEx = session.exercises[session.currentExerciseIndex];
        const allDone = isSessionComplete();
        const totalSets = getTotalSets();
        const completedSets = getCompletedSetsCount();
        const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

        trackerContainer.innerHTML = `
            <div class="space-y-5 animate-fadeIn">
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
                                    session.isPaused ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
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

                ${renderExerciseBreadcrumbs()}
                ${currentEx ? renderExerciseCard(currentEx, session.currentExerciseIndex) : ''}
                ${currentEx ? renderSetsSection(currentEx, session.currentExerciseIndex) : ''}
                ${renderNavigationBar(allDone)}
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

        return `<div class="flex items-center justify-center gap-2 flex-wrap py-1">${pills}</div>`;
    }

    function renderExerciseCard(exercise, exIdx) {
        const totalExercises = session.exercises.length;
        const exCompletedSets = exercise.sets.filter(s => s.completed).length;
        const exTotalSets = exercise.sets.length;
        const exDone = exCompletedSets === exTotalSets;

        return `
            <div class="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm ${exDone ? 'ring-2 ring-emerald-200' : ''}">
                <div class="flex items-start justify-between gap-4 mb-3">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Exercise ${exIdx + 1} of ${totalExercises}</span>
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
        const unit = getPreferences().weightUnit || 'kg';

        const setRows = exercise.sets.map((set, sIdx) => {
            if (set.completed) {
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
                            ${set.weight ? `<span class="text-sm text-emerald-600">${set.weight} ${unit}</span>` : ''}
                        </div>
                    </div>`;
            }

            const isActive = sIdx === session.currentSetIndex;
            if (isActive) {
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
                                <label for="weight-input-${exIdx}-${sIdx}" class="text-[10px] font-bold text-gray-500 uppercase mb-1">Weight (${unit})</label>
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
                    <span class="text-xs font-bold text-gray-500">${completedCount} of ${exercise.sets.length} completed</span>
                </div>
                <div class="space-y-2">${setRows}</div>
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
        const hasPrev = exIdx > 0;
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

    function renderCompletionScreen(record, elapsedMs) {
        if (!trackerContainer) return;
        const exerciseCount = record.exercises.length;

        trackerContainer.innerHTML = `
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
                        <div class="pt-4 flex flex-wrap items-center justify-center gap-3">
                            <button data-action="new-workout"
                                class="px-6 py-3 bg-white text-dark border-2 border-gray-300 rounded-full font-bold text-sm hover:bg-gray-100 active:scale-95 transition cursor-pointer">
                                Start New Workout
                            </button>
                            <button data-action="view-analytics"
                                class="px-6 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 hover:scale-105 active:scale-95 transition cursor-pointer shadow-md">
                                View in Analytics →
                            </button>
                        </div>
                        <p class="text-xs text-gray-400">Completion record saved &bull; ID: ${escapeHtml(record.id)}</p>
                    </div>
                </div>
            </div>`;
    }

    function setupTrackerEvents() {
        if (!trackerContainer) return;
        trackerContainer.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            const action = target.dataset.action;
            switch (action) {
                case 'start-session': startSession(target.dataset.dayId); break;
                case 'resume-saved': if (restoreSession()) renderActiveWorkout(); break;
                case 'pause': pauseSession(); break;
                case 'resume': resumeSession(); break;
                case 'abandon': abandonSession(); break;
                case 'complete-set': handleCompleteSet(target); break;
                case 'skip-rest': skipRest(); break;
                case 'go-exercise': goToExercise(parseInt(target.dataset.exerciseIndex, 10)); break;
                case 'finish': finishSession(); break;
                case 'new-workout': renderStartScreen(); break;
                case 'view-analytics': {
                    const analyticsTab = document.getElementById('tab-analytics');
                    if (analyticsTab) analyticsTab.click();
                    break;
                }
            }
        });

        trackerContainer.addEventListener('keydown', (e) => {
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
        const repsInput = trackerContainer.querySelector(`#reps-input-${exIdx}-${setIdx}`);
        const weightInput = trackerContainer.querySelector(`#weight-input-${exIdx}-${setIdx}`);
        const reps = repsInput ? parseInt(repsInput.value, 10) || 0 : 0;
        const weight = weightInput ? parseFloat(weightInput.value) || null : null;
        completeSet(exIdx, setIdx, reps, weight);
    }

    function onTrackerTabActivated() {
        if (!session) renderStartScreen();
    }

    function initTracker() {
        trackerContainer = document.getElementById('view-tracker');
        if (!trackerContainer) return;
        setupTrackerEvents();
        if (restoreSession()) {
            renderActiveWorkout();
        } else {
            renderStartScreen();
        }

        window.addEventListener('beforeunload', () => {
            if (session) saveActiveSession(session);
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && session) {
                renderActiveWorkout();
            }
        });
    }

    // ─── 8. Analytics & Progress Engine ────────────────────────────────────────
    let analyticsContainer = null;
    let currentSearchTerm = '';
    let currentStatusFilter = 'all';
    let selectedWeightExercise = '';
    let expandedSessionIds = new Set();
    let pendingDeleteId = null;
    let isClearAllModalOpen = false;

    function formatDuration(ms) {
        if (!ms || isNaN(ms) || ms < 0) return '0m';
        const totalSec = Math.floor(ms / 1000);
        const hrs = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        if (hrs > 0) return `${hrs}h ${mins}m`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    }

    function formatDatePretty(dateStr) {
        if (!dateStr) return 'Unknown Date';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return 'Invalid Date';
            return d.toLocaleDateString(undefined, {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
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

    function getWeekBounds(refDate = new Date()) {
        const d = new Date(refDate);
        const day = d.getDay();
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

    function parseLocalDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return new Date();
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
        return new Date(dateStr);
    }

    function computeWeeklyStats(sessions, weeklyGoal = 4) {
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

    function computeDurationStats(sessions) {
        const totalMs = sessions.reduce((acc, s) => acc + (Number(s.elapsedMs) || 0), 0);
        const avgMs = sessions.length ? Math.round(totalMs / sessions.length) : 0;
        return { totalMs, avgMs, totalWorkouts: sessions.length };
    }

    function computeStreakStats(sessions) {
        if (!sessions || sessions.length === 0) {
            return { currentStreak: 0, longestStreak: 0 };
        }

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

    function computeActivityChartData(sessions) {
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

    function computeWeightHistory(sessions) {
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

        return { exerciseNames, statsByExercise };
    }

    function renderAnalytics() {
        analyticsContainer = document.getElementById('view-analytics');
        if (!analyticsContainer) return;

        const sessions = getCompletedSessions();
        const prefs = getPreferences();
        const weekly = computeWeeklyStats(sessions, prefs.weeklyGoal);
        const duration = computeDurationStats(sessions);
        const streaks = computeStreakStats(sessions);
        const chartData = computeActivityChartData(sessions);
        const weightData = computeWeightHistory(sessions);

        if (!selectedWeightExercise || !weightData.statsByExercise[selectedWeightExercise]) {
            selectedWeightExercise = weightData.exerciseNames[0] || '';
        }

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

        analyticsContainer.innerHTML = `
            <div class="space-y-8 animate-fadeIn">
                <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="inline-flex px-3 py-1 bg-black text-white rounded-full font-semibold text-xs">Analytics Dashboard</span>
                                <span class="text-xs font-semibold text-gray-500">Live Statistics</span>
                            </div>
                            <h2 class="text-2xl sm:text-3xl font-black text-dark tracking-tight">Progress &amp; Training Analytics</h2>
                            <p class="text-gray-600 text-sm mt-1 max-w-xl">
                                Real-time volume tracking, consistency streaks, strength progression, and verified workout logs.
                            </p>
                        </div>

                        <div class="flex flex-wrap items-center gap-3">
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

                            <div class="flex items-center gap-2 bg-cream px-3 py-1.5 rounded-full border border-gray-300 text-xs font-bold text-dark">
                                <label for="weekly-goal-select" class="text-gray-600">Goal:</label>
                                <select id="weekly-goal-select" data-action="change-goal"
                                    class="bg-transparent font-black text-dark focus:outline-none cursor-pointer">
                                    ${[2, 3, 4, 5, 6, 7].map(g => `<option value="${g}" ${prefs.weeklyGoal === g ? 'selected' : ''}>${g} days/wk</option>`).join('')}
                                </select>
                            </div>

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

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
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
                                <div class="w-full bg-gray-200 h-2.5 rounded-full mt-3 overflow-hidden">
                                    <div class="bg-black h-full rounded-full transition-all duration-500" style="width: ${weekly.completionPct}%"></div>
                                </div>
                            </div>
                            <p class="text-xs text-gray-600 mt-3 font-medium">
                                ${weekly.completedCount >= weekly.weeklyGoal ? 'Goal crushed this week! 🏆' : `${weekly.weeklyGoal - weekly.completedCount} more workouts to reach goal`}
                            </p>
                        </div>

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

                ${renderActivityChartSection(chartData)}
                ${renderWeightHistorySection(weightData, prefs.weightUnit)}
                ${renderWorkoutHistorySection(filteredSessions, sessions.length, prefs.weightUnit)}
                ${renderModals()}
            </div>
        `;
    }

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

                <div class="grid grid-cols-7 gap-2 sm:gap-4 pt-4 pb-2 items-end min-h-[220px]">
                    ${chartData.map(col => {
                        const hasWorkout = col.totalMins > 0;
                        const heightPercent = hasWorkout
                            ? Math.max(18, Math.min(100, Math.round((col.totalMins / maxMins) * 100)))
                            : 6;

                        return `
                            <div class="flex flex-col items-center group relative h-full justify-end">
                                <div class="absolute -top-12 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-dark text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
                                    ${hasWorkout ? `${col.totalMins}m &bull; ${col.totalSets} sets &bull; ${escapeHtml(col.routines.join(', '))}` : 'Rest Day'}
                                </div>
                                <div class="mb-2 text-[10px] font-bold text-gray-500 h-4 flex items-center">
                                    ${hasWorkout ? `<span class="text-dark font-black">${col.totalMins}m</span>` : '<span class="opacity-0">-</span>'}
                                </div>
                                <div class="w-full max-w-[48px] bg-gray-100 rounded-2xl flex flex-col justify-end p-1 h-[140px] border border-gray-200/80 transition-all duration-300 group-hover:border-black">
                                    <div class="w-full rounded-xl transition-all duration-500 ${hasWorkout ? (col.isToday ? 'bg-emerald-600' : 'bg-black') : 'bg-transparent'}"
                                        style="height: ${heightPercent}%">
                                    </div>
                                </div>
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

    function renderWorkoutHistorySection(filteredSessions, totalAllCount, weightUnit) {
        return `
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
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

                    <div class="flex flex-wrap items-center gap-2.5">
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
                            <button type="button" data-action="open-clear-all" title="Clear all history records"
                                class="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full font-bold text-xs hover:bg-red-600 hover:text-white transition cursor-pointer">
                                Clear History
                            </button>
                        ` : ''}
                    </div>
                </div>

                ${totalAllCount === 0 ? `
                    <div class="bg-cream rounded-2xl p-10 text-center border border-gray-200">
                        <div class="max-w-md mx-auto space-y-4">
                            <div class="w-16 h-16 rounded-full bg-white border border-gray-300 flex items-center justify-center mx-auto text-2xl shadow-sm">🏆</div>
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
                    <div class="bg-cream rounded-2xl p-8 text-center border border-gray-200">
                        <p class="text-xs font-bold text-gray-600">No workout records matched your search or filters.</p>
                        <button type="button" data-action="reset-filters" class="mt-2 text-xs font-black text-dark underline cursor-pointer">
                            Reset Filters
                        </button>
                    </div>
                ` : `
                    <div class="space-y-4">
                        ${filteredSessions.map(sess => renderSessionCard(sess, weightUnit)).join('')}
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

                        <button type="button" data-action="toggle-expand" data-id="${escapeHtml(session.id)}"
                            class="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-full font-bold text-xs hover:bg-gray-100 transition cursor-pointer">
                            ${isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
                        </button>
                        <button type="button" data-action="confirm-delete" data-id="${escapeHtml(session.id)}" title="Delete workout record"
                            class="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>

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

    function renderModals() {
        let modalsHtml = '';
        if (pendingDeleteId) {
            const sessions = getCompletedSessions();
            const target = sessions.find(s => s.id === pendingDeleteId);
            const routineName = target ? target.routineName : 'this workout';
            const dateStr = target ? formatDatePretty(target.finishedAt || target.startedAt) : '';

            modalsHtml += `
                <div id="delete-confirm-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true">
                    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 animate-slide-up">
                        <div class="w-14 h-14 rounded-full bg-red-100 border-2 border-red-300 text-red-600 flex items-center justify-center mx-auto text-2xl">⚠️</div>
                        <div class="text-center space-y-2">
                            <h3 class="text-xl font-black text-dark">Delete Workout Record?</h3>
                            <p class="text-xs text-gray-600 leading-relaxed">
                                Are you sure you want to permanently delete the record for <strong class="text-dark">${escapeHtml(routineName)}</strong> (${escapeHtml(dateStr)})?
                            </p>
                            <p class="text-[11px] text-red-600 font-bold">This action cannot be undone and will recalculate all weekly stats and streaks.</p>
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

        if (isClearAllModalOpen) {
            modalsHtml += `
                <div id="clear-all-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true">
                    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 animate-slide-up">
                        <div class="w-14 h-14 rounded-full bg-red-100 border-2 border-red-400 text-red-600 flex items-center justify-center mx-auto text-2xl">🗑️</div>
                        <div class="text-center space-y-2">
                            <h3 class="text-xl font-black text-dark">Clear All Workout History?</h3>
                            <p class="text-xs text-gray-600 leading-relaxed">
                                This will permanently delete all saved workout records and reset consistency streaks and weekly volume calculations.
                            </p>
                            <p class="text-[11px] text-red-600 font-bold">We recommend downloading a backup first using the "Backup" button.</p>
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

    function setupAnalyticsEventListeners() {
        if (!analyticsContainer) return;
        analyticsContainer.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            const action = target.dataset.action;

            switch (action) {
                case 'set-unit':
                    savePreferences({ weightUnit: target.dataset.unit });
                    renderAnalytics();
                    break;
                case 'toggle-expand': {
                    const id = target.dataset.id;
                    if (expandedSessionIds.has(id)) expandedSessionIds.delete(id);
                    else expandedSessionIds.add(id);
                    renderAnalytics();
                    break;
                }
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
                case 'jump-active-workout': {
                    const trackerTabBtn = document.getElementById('tab-tracker');
                    if (trackerTabBtn) trackerTabBtn.click();
                    break;
                }
                case 'export-data':
                    handleExportData();
                    break;
                case 'trigger-import': {
                    const fileInput = document.getElementById('import-file-input');
                    if (fileInput) fileInput.click();
                    break;
                }
            }
        });

        analyticsContainer.addEventListener('input', (e) => {
            if (e.target.id === 'history-search-input') {
                currentSearchTerm = e.target.value;
                renderAnalytics();
                const newSearch = analyticsContainer.querySelector('#history-search-input');
                if (newSearch) {
                    newSearch.focus();
                    newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
                }
            }
        });

        analyticsContainer.addEventListener('change', (e) => {
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
                alert('Failed to parse backup file: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    function onAnalyticsTabActivated() {
        renderAnalytics();
    }

    function initAnalytics() {
        analyticsContainer = document.getElementById('view-analytics');
        if (!analyticsContainer) return;
        setupAnalyticsEventListeners();
        renderAnalytics();

        window.addEventListener('workout-history-updated', () => {
            if (analyticsContainer && !analyticsContainer.classList.contains('hidden')) {
                renderAnalytics();
            }
        });

        window.addEventListener('preferences-updated', () => {
            if (analyticsContainer && !analyticsContainer.classList.contains('hidden')) {
                renderAnalytics();
            }
        });
    }

    // ─── 9. 7-Day Schedule Controller ──────────────────────────────────────────
    function initSchedule() {
        renderSchedule();
        window.addEventListener('schedule-updated', () => renderSchedule());
        window.addEventListener('editor-closed', () => renderSchedule());
    }

    function renderSchedule() {
        const schedule = getSchedule();
        const selectedDayId = getSelectedDayId();

        renderWeekGrid(schedule, selectedDayId);

        if (isEditingActive() && getActiveEditingDayId() === selectedDayId) {
            renderEditorUI();
        } else {
            renderDayDetailPanel(selectedDayId);
        }

        updateDashboardMetrics(schedule);
    }

    function renderWeekGrid(schedule, selectedDayId) {
        const gridContainer = document.getElementById('week-schedule-grid');
        if (!gridContainer) return;

        gridContainer.innerHTML = schedule.map(day => {
            const isSelected = day.dayId === selectedDayId;
            const exerciseCount = day.exercises ? day.exercises.length : 0;

            return `
                <div data-day-id="${day.dayId}"
                    class="day-card bg-white rounded-2xl p-3.5 xl:p-4 border transition duration-200 cursor-pointer flex flex-col justify-between min-h-[105px] ${
                        isSelected
                            ? 'border-black ring-2 ring-black bg-cream shadow-md -translate-y-1'
                            : 'border-gray-200 shadow-sm hover:border-gray-400 hover:shadow-md'
                    }">
                    <div>
                        <div class="flex items-center justify-between gap-1 font-black text-dark mb-1">
                            <span class="text-sm xl:text-base">${escapeHtml(day.dayName)}</span>
                            <span class="text-[10px] xl:text-[11px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0 ${
                                isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
                            }">
                                Day ${day.dayNumber}
                            </span>
                        </div>
                        <p class="text-xs font-bold text-dark truncate">
                            ${escapeHtml(day.routineName || (day.isRest ? 'Rest Day' : 'Workout Routine'))}
                        </p>
                    </div>

                    <div class="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5 text-[11px]">
                        <span class="font-bold ${day.isRest ? 'text-gray-400' : 'text-emerald-600'} truncate">
                            ${day.isRest ? 'Rest Day' : `${exerciseCount} exercise${exerciseCount === 1 ? '' : 's'}`}
                        </span>
                        ${isSelected ? '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black text-white uppercase tracking-wider shrink-0">Selected</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        gridContainer.querySelectorAll('.day-card').forEach(card => {
            card.addEventListener('click', () => {
                const dayId = card.getAttribute('data-day-id');
                if (dayId && dayId !== selectedDayId) {
                    setSelectedDayId(dayId);
                    renderSchedule();
                }
            });
        });
    }

    function renderDayDetailPanel(dayId) {
        const detailContainer = document.getElementById('selected-day-detail-panel');
        if (!detailContainer) return;
        const day = getDay(dayId);
        if (!day) return;
        const exerciseCount = day.exercises ? day.exercises.length : 0;

        detailContainer.innerHTML = `
            <div class="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-md space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black text-white">
                                Day ${day.dayNumber}
                            </span>
                            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                day.isRest ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }">
                                ${day.isRest ? '● Rest Day' : '● Training Day'}
                            </span>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black text-dark">
                            ${escapeHtml(day.dayName)} Routine
                        </h2>
                    </div>

                    <div class="flex items-center flex-wrap gap-2.5">
                        ${!day.isRest ? `
                            <button id="open-editor-btn" type="button"
                                class="px-5 py-2.5 rounded-full bg-black text-white font-bold text-xs sm:text-sm hover:bg-gray-800 hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-2 shadow-sm">
                                <span>Edit Workout</span>
                            </button>
                        ` : ''}

                        <button id="toggle-rest-day-btn" type="button"
                            class="px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-sm ${
                                day.isRest 
                                    ? 'bg-black text-white hover:bg-gray-800' 
                                    : 'bg-cream text-dark border border-gray-300 hover:bg-gray-200'
                            }">
                            <span>${day.isRest ? 'Switch to Training Day' : 'Set as Rest Day'}</span>
                        </button>
                    </div>
                </div>

                ${!day.isRest ? `
                    <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-cream p-4 rounded-2xl border border-gray-200">
                        <div class="flex-1">
                            <label for="routine-name-input" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Routine Name:
                            </label>
                            <input id="routine-name-input" type="text" value="${escapeHtml(day.routineName || '')}"
                                placeholder="e.g. Chest & Triceps (Push)"
                                class="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-bold text-dark focus:outline-none focus:ring-2 focus:ring-black">
                        </div>
                        <div class="self-end sm:self-center text-xs text-gray-500 font-medium">
                            ${exerciseCount} exercises in routine
                        </div>
                    </div>
                ` : `
                    <div class="p-6 bg-cream rounded-2xl border border-gray-200 text-center">
                        <span class="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">Rest &amp; Recovery Mode</span>
                        <h3 class="text-lg font-bold text-dark">Scheduled Recovery Day</h3>
                        <p class="text-gray-600 text-sm mt-1 max-w-md mx-auto">
                            Rest days are essential for muscle repair, glycogen replenishment, and nervous system recovery.
                        </p>
                    </div>
                `}

                ${!day.isRest ? `
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-black text-dark">
                                Scheduled Exercises (${exerciseCount})
                            </h3>
                            <div class="flex items-center gap-2">
                                <button id="open-editor-quick-btn" type="button"
                                    class="px-3.5 py-1.5 bg-cream border border-gray-300 text-dark rounded-full text-xs font-bold hover:bg-gray-200 transition flex items-center gap-1 cursor-pointer">
                                    <span>Full Editor</span>
                                </button>
                                <button id="jump-to-library-btn" type="button"
                                    class="px-4 py-1.5 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition flex items-center gap-1 cursor-pointer">
                                    <span>+ Add From Exercise Library</span>
                                </button>
                            </div>
                        </div>

                        ${exerciseCount === 0 ? `
                            <div class="bg-gray-50 rounded-2xl p-8 border border-dashed border-gray-300 text-center space-y-3">
                                <div class="w-10 h-10 rounded-full bg-gray-200 text-dark font-black text-sm flex items-center justify-center mx-auto">0</div>
                                <h4 class="text-base font-bold text-dark">No exercises assigned yet</h4>
                                <p class="text-xs text-gray-500 max-w-sm mx-auto">
                                    Add movements from the Exercise Library or open the Workout Editor to design your routine for ${escapeHtml(day.dayName)}.
                                </p>
                                <div class="flex flex-wrap justify-center gap-2">
                                    <button id="editor-start-empty-btn" type="button"
                                        class="px-5 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition cursor-pointer">
                                        Open Workout Editor
                                    </button>
                                    <button id="jump-to-library-empty-btn" type="button"
                                        class="px-5 py-2 bg-cream text-dark border border-gray-300 rounded-full text-xs font-bold hover:bg-gray-200 transition cursor-pointer">
                                        Browse Exercise Library
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <div class="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                                <div class="divide-y divide-gray-100">
                                    ${day.exercises.map((ex, idx) => `
                                        <div class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition">
                                            <div class="flex items-start gap-3.5">
                                                <span class="w-7 h-7 rounded-full bg-cream text-dark font-black text-xs flex items-center justify-center shrink-0 border border-gray-300 mt-0.5">
                                                    ${idx + 1}
                                                </span>
                                                <div>
                                                    <div class="flex items-center gap-2 flex-wrap">
                                                        <h4 class="text-sm sm:text-base font-black text-dark">${escapeHtml(ex.name)}</h4>
                                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-black text-white">
                                                            ${escapeHtml(ex.muscleGroup || 'General')}
                                                        </span>
                                                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                                            ${escapeHtml(ex.equipment || 'Bodyweight')}
                                                        </span>
                                                    </div>
                                                    ${ex.notes ? `
                                                        <p class="text-xs text-gray-500 mt-1 max-w-lg leading-relaxed">
                                                            <span class="font-bold text-gray-600">Note:</span> ${escapeHtml(ex.notes)}
                                                        </p>
                                                    ` : ''}
                                                </div>
                                            </div>

                                            <div class="flex items-center gap-3 self-end sm:self-center shrink-0">
                                                <div class="flex items-center gap-1.5 flex-wrap">
                                                    <span class="text-xs font-black text-gray-800 bg-cream border border-gray-300 px-3 py-1 rounded-full">
                                                        ${ex.sets || 3} sets × ${escapeHtml(ex.reps || '10-12')}
                                                    </span>
                                                    ${ex.duration ? `
                                                        <span class="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                                                            ${escapeHtml(ex.duration)}
                                                        </span>
                                                    ` : ''}
                                                    <span class="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                                        ${escapeHtml(ex.rest || '90s')} rest
                                                    </span>
                                                </div>
                                                <button type="button" data-remove-index="${idx}"
                                                    class="remove-exercise-btn text-xs font-bold text-red-600 hover:text-red-800 px-2.5 py-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                                    title="Remove exercise from this day">
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `}
                    </div>
                ` : ''}
            </div>
        `;

        const openEditorBtn = document.getElementById('open-editor-btn');
        const openEditorQuickBtn = document.getElementById('open-editor-quick-btn');
        const editorStartEmptyBtn = document.getElementById('editor-start-empty-btn');
        [openEditorBtn, openEditorQuickBtn, editorStartEmptyBtn].forEach(btn => {
            if (btn) btn.addEventListener('click', () => startEditing(dayId));
        });

        const toggleRestBtn = document.getElementById('toggle-rest-day-btn');
        if (toggleRestBtn) {
            toggleRestBtn.addEventListener('click', () => {
                toggleRestDay(dayId);
                renderSchedule();
            });
        }

        const routineInput = document.getElementById('routine-name-input');
        if (routineInput) {
            routineInput.addEventListener('change', (e) => {
                updateDayRoutineName(dayId, e.target.value);
                renderSchedule();
            });
        }

        detailContainer.querySelectorAll('.remove-exercise-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-remove-index'), 10);
                if (!isNaN(idx)) {
                    removeExerciseFromDay(dayId, idx);
                    renderSchedule();
                }
            });
        });

        const jumpLibraryBtn = document.getElementById('jump-to-library-btn');
        const jumpLibraryEmptyBtn = document.getElementById('jump-to-library-empty-btn');
        [jumpLibraryBtn, jumpLibraryEmptyBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    const libraryTabBtn = document.getElementById('tab-library');
                    if (libraryTabBtn) {
                        libraryTabBtn.click();
                        const libSection = document.getElementById('library-filters-container');
                        if (libSection) libSection.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
        });
    }

    function updateDashboardMetrics(schedule) {
        const trainingDaysCount = schedule.filter(d => !d.isRest).length;
        const restDaysCount = 7 - trainingDaysCount;
        
        let totalSets = 0;
        schedule.forEach(d => {
            if (!d.isRest && Array.isArray(d.exercises)) {
                d.exercises.forEach(ex => {
                    totalSets += (ex.sets || 3);
                });
            }
        });

        const splitMetric = document.getElementById('metric-split-title');
        const splitSub = document.getElementById('metric-split-sub');
        if (splitMetric) splitMetric.textContent = `${trainingDaysCount}-Day Split`;
        if (splitSub) splitSub.textContent = `${trainingDaysCount} Training / ${restDaysCount} Rest Days`;

        const catMetric = document.getElementById('metric-catalog-title');
        const catSub = document.getElementById('metric-catalog-sub');
        if (catMetric) catMetric.textContent = '32 Exercises';
        if (catSub) catSub.textContent = 'Catalog Active • Filterable';

        const volMetric = document.getElementById('metric-volume-title');
        const volSub = document.getElementById('metric-volume-sub');
        if (volMetric) volMetric.textContent = `${totalSets} Sets / Wk`;
        if (volSub) volSub.textContent = `${totalSets} Total Weekly Sets`;
    }

    // ─── 10. Application Orchestrator & Tab Navigation ────────────────────────
    function initApp() {
        initSchedule();
        initLibrary();
        initGenerator();
        initTracker();
        initAnalytics();

        const tabButtons = document.querySelectorAll('[role="tab"]');
        const tabPanels = document.querySelectorAll('[role="tabpanel"]');

        function switchTab(targetTabId) {
            tabButtons.forEach(btn => {
                const isTarget = btn.getAttribute('aria-controls') === targetTabId;
                btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
                btn.tabIndex = isTarget ? 0 : -1;

                if (isTarget) {
                    btn.classList.add('bg-black', 'text-white', 'shadow');
                    btn.classList.remove('text-gray-700', 'hover:bg-gray-200');
                } else {
                    btn.classList.remove('bg-black', 'text-white', 'shadow');
                    btn.classList.add('text-gray-700', 'hover:bg-gray-200');
                }
            });

            tabPanels.forEach(panel => {
                const isTarget = panel.id === targetTabId;
                if (isTarget) {
                    panel.classList.remove('hidden');
                    panel.setAttribute('aria-hidden', 'false');
                } else {
                    panel.classList.add('hidden');
                    panel.setAttribute('aria-hidden', 'true');
                }
            });

            if (targetTabId === 'view-tracker') {
                onTrackerTabActivated();
            }
            if (targetTabId === 'view-analytics') {
                onAnalyticsTabActivated();
            }
        }

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('aria-controls');
                if (targetId) switchTab(targetId);
            });

            btn.addEventListener('keydown', (e) => {
                const tabsArray = Array.from(tabButtons);
                const currentIndex = tabsArray.indexOf(btn);
                let nextIndex = null;

                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    nextIndex = (currentIndex + 1) % tabsArray.length;
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    nextIndex = (currentIndex - 1 + tabsArray.length) % tabsArray.length;
                } else if (e.key === 'Home') {
                    nextIndex = 0;
                } else if (e.key === 'End') {
                    nextIndex = tabsArray.length - 1;
                }

                if (nextIndex !== null) {
                    e.preventDefault();
                    const nextTab = tabsArray[nextIndex];
                    nextTab.focus();
                    nextTab.click();
                }
            });
        });

        // Mobile nav toggle if present
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (menuBtn && mobileMenu) {
            const lines = menuBtn.querySelectorAll('.line');
            menuBtn.addEventListener('click', () => {
                const isOpen = mobileMenu.classList.toggle('opacity-100');
                mobileMenu.classList.toggle('translate-y-0', isOpen);
                mobileMenu.classList.toggle('-translate-y-3', !isOpen);
                mobileMenu.classList.toggle('invisible', !isOpen);
                mobileMenu.classList.toggle('opacity-0', !isOpen);

                menuBtn.setAttribute('aria-expanded', isOpen);
                mobileMenu.setAttribute('aria-hidden', !isOpen);

                if (lines.length >= 3) {
                    lines[0].classList.toggle('rotate-45');
                    lines[0].classList.toggle('translate-y-2');
                    lines[1].classList.toggle('opacity-0');
                    lines[2].classList.toggle('-rotate-45');
                    lines[2].classList.toggle('-translate-y-2');
                }
            });

            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => menuBtn.click());
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();
