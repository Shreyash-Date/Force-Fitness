/**
 * Force Fitness — Starter Exercise Dataset
 * Categorized exercises across 6 major muscle groups, equipment types, and difficulty tiers.
 */

export const EXERCISES = [
    // Chest
    {
        id: 'barbell-bench-press',
        name: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        description: 'Compound horizontal pressing movement targeting the pectoralis major, anterior deltoids, and triceps.',
        defaultSets: 4,
        defaultReps: '8-10'
    },
    {
        id: 'incline-dumbbell-press',
        name: 'Incline Dumbbell Press',
        muscleGroup: 'Chest',
        equipment: 'Dumbbell',
        difficulty: 'Intermediate',
        description: 'Emphasizes the clavicular head (upper chest) and provides a deeper stretch at the bottom.',
        defaultSets: 3,
        defaultReps: '10-12'
    },
    {
        id: 'cable-chest-fly',
        name: 'Standing Cable Fly',
        muscleGroup: 'Chest',
        equipment: 'Cable',
        difficulty: 'Beginner',
        description: 'Constant tension chest isolation exercise focused on peak contraction and horizontal adduction.',
        defaultSets: 3,
        defaultReps: '12-15'
    },
    {
        id: 'push-ups',
        name: 'Standard Push-Up',
        muscleGroup: 'Chest',
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        description: 'Fundamental bodyweight pressing movement building chest endurance and core stabilization.',
        defaultSets: 3,
        defaultReps: '15-20'
    },
    {
        id: 'chest-dips',
        name: 'Chest Dips',
        muscleGroup: 'Chest',
        equipment: 'Bodyweight',
        difficulty: 'Advanced',
        description: 'Forward-leaning parallel bar dips targeting the lower pectoralis and anterior shoulders.',
        defaultSets: 3,
        defaultReps: '8-12'
    },
    {
        id: 'pec-deck-machine',
        name: 'Pec Deck Fly Machine',
        muscleGroup: 'Chest',
        equipment: 'Machine',
        difficulty: 'Beginner',
        description: 'Stabilized machine isolation movement for safely overloading the chest without stabilizer fatigue.',
        defaultSets: 3,
        defaultReps: '12-15'
    },

    // Back
    {
        id: 'barbell-deadlift',
        name: 'Conventional Deadlift',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        description: 'Full-body posterior chain power movement targeting the erectors, lats, traps, and glutes.',
        defaultSets: 3,
        defaultReps: '5-6'
    },
    {
        id: 'pull-ups',
        name: 'Pull-Up',
        muscleGroup: 'Back',
        equipment: 'Bodyweight',
        difficulty: 'Intermediate',
        description: 'Classic vertical pulling movement for developing lat width, upper back thickness, and biceps.',
        defaultSets: 4,
        defaultReps: '6-10'
    },
    {
        id: 'barbell-bent-over-row',
        name: 'Barbell Bent-Over Row',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        description: 'Heavy horizontal row building lat density, rhomboids, rear delts, and spinal erector endurance.',
        defaultSets: 4,
        defaultReps: '8-10'
    },
    {
        id: 'lat-pulldown',
        name: 'Wide-Grip Lat Pulldown',
        muscleGroup: 'Back',
        equipment: 'Cable',
        difficulty: 'Beginner',
        description: 'Controlled vertical pulling exercise to isolate latissimus dorsi with adjustable resistance.',
        defaultSets: 3,
        defaultReps: '10-12'
    },
    {
        id: 'seated-cable-row',
        name: 'Seated Cable Row',
        muscleGroup: 'Back',
        equipment: 'Cable',
        difficulty: 'Beginner',
        description: 'Horizontal cable row emphasizing middle traps, rhomboids, and lat thickness.',
        defaultSets: 3,
        defaultReps: '10-12'
    },
    {
        id: 't-bar-row',
        name: 'T-Bar Row Machine',
        muscleGroup: 'Back',
        equipment: 'Machine',
        difficulty: 'Intermediate',
        description: 'Chest-supported or platform row allowing heavy upper-back loading with locked-in hip mechanics.',
        defaultSets: 3,
        defaultReps: '8-12'
    },

    // Legs
    {
        id: 'barbell-back-squat',
        name: 'Barbell Back Squat',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        description: 'King of leg movements for developing quadriceps, glutes, hamstrings, and trunk rigidity.',
        defaultSets: 4,
        defaultReps: '6-8'
    },
    {
        id: 'romanian-deadlift',
        name: 'Romanian Deadlift (RDL)',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        description: 'Hip-hinge movement that stretches and strengthens the hamstrings and gluteal complex.',
        defaultSets: 3,
        defaultReps: '8-10'
    },
    {
        id: 'leg-press-45',
        name: '45-Degree Leg Press',
        muscleGroup: 'Legs',
        equipment: 'Machine',
        difficulty: 'Beginner',
        description: 'Safe high-load compound movement targeting quads and glutes without spinal compression.',
        defaultSets: 3,
        defaultReps: '10-12'
    },
    {
        id: 'walking-dumbbell-lunges',
        name: 'Walking Dumbbell Lunges',
        muscleGroup: 'Legs',
        equipment: 'Dumbbell',
        difficulty: 'Intermediate',
        description: 'Unilateral leg exercise improving balance, hip stability, glute activation, and quad drive.',
        defaultSets: 3,
        defaultReps: '12 per leg'
    },
    {
        id: 'standing-calf-raise',
        name: 'Standing Calf Raise',
        muscleGroup: 'Legs',
        equipment: 'Machine',
        difficulty: 'Beginner',
        description: 'Direct gastrocnemius loading through full ankle dorsiflexion and plantarflexion.',
        defaultSets: 4,
        defaultReps: '15-20'
    },
    {
        id: 'hamstring-leg-curl',
        name: 'Lying Hamstring Curl',
        muscleGroup: 'Legs',
        equipment: 'Machine',
        difficulty: 'Beginner',
        description: 'Isolation knee-flexion exercise focused on peak contraction of all hamstring heads.',
        defaultSets: 3,
        defaultReps: '12-15'
    },

    // Shoulders
    {
        id: 'overhead-barbell-press',
        name: 'Overhead Barbell Press',
        muscleGroup: 'Shoulders',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        description: 'Vertical standing press developing anterior/lateral deltoids, upper chest, and core stability.',
        defaultSets: 4,
        defaultReps: '6-8'
    },
    {
        id: 'dumbbell-lateral-raise',
        name: 'Dumbbell Lateral Raise',
        muscleGroup: 'Shoulders',
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        description: 'Primary isolation movement for developing side deltoid cap and upper body width.',
        defaultSets: 4,
        defaultReps: '12-15'
    },
    {
        id: 'face-pull',
        name: 'Cable Face Pull',
        muscleGroup: 'Shoulders',
        equipment: 'Cable',
        difficulty: 'Beginner',
        description: 'Essential shoulder health movement for posterior deltoids, rotator cuff, and upper traps.',
        defaultSets: 3,
        defaultReps: '15-20'
    },
    {
        id: 'arnold-press',
        name: 'Arnold Dumbbell Press',
        muscleGroup: 'Shoulders',
        equipment: 'Dumbbell',
        difficulty: 'Intermediate',
        description: 'Rotating overhead press engaging anterior and lateral deltoids through full shoulder rotation.',
        defaultSets: 3,
        defaultReps: '10-12'
    },
    {
        id: 'rear-delt-fly',
        name: 'Reverse Pec Deck / Rear Delt Fly',
        muscleGroup: 'Shoulders',
        equipment: 'Machine',
        difficulty: 'Beginner',
        description: 'Targeted machine isolation for rear deltoids and rhomboid upper-back posture.',
        defaultSets: 3,
        defaultReps: '12-15'
    },

    // Arms
    {
        id: 'barbell-bicep-curl',
        name: 'Standing Barbell Bicep Curl',
        muscleGroup: 'Arms',
        equipment: 'Barbell',
        difficulty: 'Beginner',
        description: 'Foundational mass builder for the biceps brachii using strict supinated elbow flexion.',
        defaultSets: 3,
        defaultReps: '10-12'
    },
    {
        id: 'hammer-curl',
        name: 'Incline Dumbbell Hammer Curl',
        muscleGroup: 'Arms',
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        description: 'Neutral-grip arm curl developing the brachialis, brachioradialis, and outer bicep peak.',
        defaultSets: 3,
        defaultReps: '10-12'
    },
    {
        id: 'tricep-rope-pushdown',
        name: 'Cable Tricep Rope Pushdown',
        muscleGroup: 'Arms',
        equipment: 'Cable',
        difficulty: 'Beginner',
        description: 'Isolates the lateral and medial heads of the triceps with full lockout flare at the bottom.',
        defaultSets: 3,
        defaultReps: '12-15'
    },
    {
        id: 'skull-crushers',
        name: 'EZ-Bar Skull Crushers',
        muscleGroup: 'Arms',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        description: 'Lying tricep extension prioritizing the long head of the triceps with deep overhead stretch.',
        defaultSets: 3,
        defaultReps: '10-12'
    },
    {
        id: 'preacher-curl',
        name: 'Preacher Curl Machine',
        muscleGroup: 'Arms',
        equipment: 'Machine',
        difficulty: 'Beginner',
        description: 'Strict bicep isolation preventing shoulder momentum for maximum muscle fatigue.',
        defaultSets: 3,
        defaultReps: '10-12'
    },

    // Core
    {
        id: 'hanging-leg-raise',
        name: 'Hanging Leg Raise',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        difficulty: 'Intermediate',
        description: 'Hanging abdominal exercise targeting lower abs, hip flexors, and grip strength.',
        defaultSets: 3,
        defaultReps: '12-15'
    },
    {
        id: 'plank-hold',
        name: 'Forearm Plank',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        description: 'Isometric core stability holding neutral spine to train transverse abdominis endurance.',
        defaultSets: 3,
        defaultReps: '45-60s'
    },
    {
        id: 'cable-woodchopper',
        name: 'Cable Woodchopper',
        muscleGroup: 'Core',
        equipment: 'Cable',
        difficulty: 'Intermediate',
        description: 'Rotational core power exercise conditioning the internal and external obliques.',
        defaultSets: 3,
        defaultReps: '12 per side'
    },
    {
        id: 'ab-wheel-rollout',
        name: 'Ab Wheel Rollout',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        difficulty: 'Advanced',
        description: 'High-tension anti-extension exercise requiring maximum anterior core bracing.',
        defaultSets: 3,
        defaultReps: '8-12'
    }
];

export const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
export const EQUIPMENT_TYPES = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'];
export const DIFFICULTY_LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
