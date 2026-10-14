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
            // Ensure any existing items have fallback values for new Phase 3 fields
            parsed.forEach(day => {
                if (Array.isArray(day.exercises)) {
                    day.exercises.forEach(ex => {
                        if (ex.duration === undefined) ex.duration = '';
                        if (ex.rest === undefined) ex.rest = '90s';
                        if (ex.notes === undefined) ex.notes = '';
                    });
                }
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
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
}

export function getSelectedDayId() {
    const saved = localStorage.getItem(SELECTED_DAY_STORAGE_KEY);
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return validDays.includes(saved) ? saved : 'monday';
}

export function setSelectedDayId(dayId) {
    localStorage.setItem(SELECTED_DAY_STORAGE_KEY, dayId);
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
        if (day.isRest) {
            if (!day.routineName || day.routineName.includes('Workout') || day.routineName.includes('Push') || day.routineName.includes('Pull')) {
                day.routineName = 'Rest & Recovery';
            }
        } else {
            if (!day.routineName || day.routineName.includes('Rest')) {
                day.routineName = 'Custom Routine';
            }
        }
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
            id: exerciseData.id || `custom-${Date.now()}`,
            name: exerciseData.name || 'Unnamed Exercise',
            muscleGroup: exerciseData.muscleGroup || 'General',
            equipment: exerciseData.equipment || 'Bodyweight',
            sets: exerciseData.defaultSets || 3,
            reps: exerciseData.defaultReps || '10-12',
            duration: exerciseData.duration || (exerciseData.defaultReps && exerciseData.defaultReps.includes('s') ? exerciseData.defaultReps : ''),
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
        day.exercises = exercises.map(ex => ({
            id: ex.id || `custom-${Date.now()}`,
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
