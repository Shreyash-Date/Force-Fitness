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
                reps: '8-10'
            },
            {
                id: 'incline-dumbbell-press',
                name: 'Incline Dumbbell Press',
                muscleGroup: 'Chest',
                equipment: 'Dumbbell',
                sets: 3,
                reps: '10-12'
            },
            {
                id: 'tricep-rope-pushdown',
                name: 'Cable Tricep Rope Pushdown',
                muscleGroup: 'Arms',
                equipment: 'Cable',
                sets: 3,
                reps: '12-15'
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
                reps: '6-10'
            },
            {
                id: 'barbell-bent-over-row',
                name: 'Barbell Bent-Over Row',
                muscleGroup: 'Back',
                equipment: 'Barbell',
                sets: 4,
                reps: '8-10'
            },
            {
                id: 'barbell-bicep-curl',
                name: 'Standing Barbell Bicep Curl',
                muscleGroup: 'Arms',
                equipment: 'Barbell',
                sets: 3,
                reps: '10-12'
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
                reps: '6-8'
            },
            {
                id: 'romanian-deadlift',
                name: 'Romanian Deadlift (RDL)',
                muscleGroup: 'Legs',
                equipment: 'Barbell',
                sets: 3,
                reps: '8-10'
            },
            {
                id: 'hanging-leg-raise',
                name: 'Hanging Leg Raise',
                muscleGroup: 'Core',
                equipment: 'Bodyweight',
                sets: 3,
                reps: '12-15'
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
                reps: '6-8'
            },
            {
                id: 'dumbbell-lateral-raise',
                name: 'Dumbbell Lateral Raise',
                muscleGroup: 'Shoulders',
                equipment: 'Dumbbell',
                sets: 4,
                reps: '12-15'
            },
            {
                id: 'hammer-curl',
                name: 'Incline Dumbbell Hammer Curl',
                muscleGroup: 'Arms',
                equipment: 'Dumbbell',
                sets: 3,
                reps: '10-12'
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
        day.exercises.push({
            id: exerciseData.id,
            name: exerciseData.name,
            muscleGroup: exerciseData.muscleGroup,
            equipment: exerciseData.equipment,
            sets: exerciseData.defaultSets || 3,
            reps: exerciseData.defaultReps || '10-12'
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
