/**
 * Force Fitness — Smart Workout Plan Generator (Phase 3)
 * Generates tailored 7-day splits with sensible recovery periods based on:
 * 1. Fitness Goal (Hypertrophy, Strength, Fat Loss, General Fitness)
 * 2. Experience Level (Beginner, Intermediate, Advanced)
 * 3. Training Days / Week (2 to 6 days)
 * 4. Available Equipment (Full Gym, Dumbbells Only, Bodyweight Only)
 * 5. Preferred Session Duration (30, 45, 60, 90 mins)
 *
 * Generated schedules are completely editable in the Workout Editor.
 */

import { EXERCISES } from './exercises-data.js';
import { replaceSchedule, setSelectedDayId } from './storage.js';

let isGeneratorOpen = false;
let previewSchedule = null;

export function initGenerator() {
    // Attach listener for opening modal
    const openBtn = document.getElementById('open-plan-generator-btn');
    if (openBtn) {
        openBtn.addEventListener('click', openGeneratorModal);
    }
}

export function openGeneratorModal() {
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

export function closeGeneratorModal() {
    const modal = document.getElementById('plan-generator-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    isGeneratorOpen = false;
    previewSchedule = null;
}

function renderGeneratorModal(modal) {
    modal.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
                
                <!-- Modal Top Header -->
                <div class="p-6 border-b border-gray-200 flex items-center justify-between bg-cream">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-black text-white">
                                Phase 3 Feature
                            </span>
                            <span class="text-xs font-bold text-gray-500">
                                Algorithmic Periodization Engine
                            </span>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                            Smart Workout Plan Generator
                        </h2>
                    </div>
                    <button id="close-generator-modal-btn" type="button"
                        class="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition cursor-pointer">
                        ✕
                    </button>
                </div>

                <!-- Modal Body: 5 Interactive Inputs -->
                <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-white" id="generator-modal-body">
                    
                    <p class="text-sm text-gray-600 leading-relaxed">
                        Configure your training preferences below. The engine will structure an optimal 7-day routine with sensible recovery days and balanced muscular volume tailored to your equipment and schedule.
                    </p>

                    <!-- Validation Alert Banner -->
                    <div id="generator-alert-banner" class="hidden p-4 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200"></div>

                    <!-- Input 1: Fitness Goal -->
                    <div class="space-y-2">
                        <label class="block text-xs font-black uppercase tracking-wider text-dark">
                            1. Primary Fitness Goal:
                        </label>
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

                    <!-- Input 2: Experience Level -->
                    <div class="space-y-2">
                        <label class="block text-xs font-black uppercase tracking-wider text-dark">
                            2. Training Experience Level:
                        </label>
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

                    <!-- Input 3: Training Days / Week -->
                    <div class="space-y-2">
                        <label class="block text-xs font-black uppercase tracking-wider text-dark">
                            3. Training Frequency (Days / Week):
                        </label>
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
                        <p class="text-[11px] text-gray-500 font-medium">
                            Recovery days will automatically be placed at optimal intervals to prevent systemic overtraining.
                        </p>
                    </div>

                    <!-- Input 4: Available Equipment -->
                    <div class="space-y-2">
                        <label class="block text-xs font-black uppercase tracking-wider text-dark">
                            4. Available Equipment:
                        </label>
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

                    <!-- Input 5: Preferred Session Duration -->
                    <div class="space-y-2">
                        <label class="block text-xs font-black uppercase tracking-wider text-dark">
                            5. Preferred Session Duration:
                        </label>
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

                    <!-- Generated Preview Container (Populated when user clicks Preview) -->
                    <div id="generator-preview-container" class="hidden pt-4 border-t border-gray-200 space-y-4"></div>

                </div>

                <!-- Modal Bottom Action Bar -->
                <div class="p-6 border-t border-gray-200 bg-cream flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span class="text-xs text-gray-500 font-semibold">
                        Ready to generate? You can freely edit any exercises afterwards.
                    </span>

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

    // Dynamic style update for radio option cards
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

            // Trigger global updates
            window.dispatchEvent(new CustomEvent('schedule-updated'));
            window.dispatchEvent(new CustomEvent('selected-day-changed', { detail: { dayId: 'monday' } }));

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

export function createScheduleFromConfig(config) {
    const { goal, experience, days, equipment, duration } = config;

    // Filter available exercises according to equipment
    let allowedExercises = EXERCISES;
    if (equipment === 'bodyweight_home') {
        allowedExercises = EXERCISES.filter(e => e.equipment === 'Bodyweight');
    } else if (equipment === 'dumbbells_only') {
        allowedExercises = EXERCISES.filter(e => e.equipment === 'Dumbbell' || e.equipment === 'Bodyweight');
    }

    // Determine target exercise count per session based on duration
    let exCountPerSession = 5;
    if (duration === '30_min') exCountPerSession = 3;
    else if (duration === '45_min') exCountPerSession = 4;
    else if (duration === '60_min') exCountPerSession = 5;
    else if (duration === '90_min') exCountPerSession = 6;

    // Set parameters based on goal & experience
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
        // general fitness
        targetSets = 3;
        targetReps = '10-12';
        targetRest = '60s';
        goalNote = 'Controlled form, full range of motion, and mindful breathing.';
    }

    // Generate 7-day templates with sensible recovery days
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

        // Select exercises for this day based on focus muscle groups
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

    // Iterate through requested muscle groups in round-robin fashion
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
                reps: pick.defaultReps && pick.defaultReps.includes('s') ? pick.defaultReps : params.targetReps,
                duration: pick.defaultReps && pick.defaultReps.includes('s') ? pick.defaultReps : '',
                rest: params.targetRest,
                notes: `${params.goalNote} ${pick.description || ''}`.trim()
            });
        }
        muscleIdx++;
    }

    // Fallback: If pool is restricted and we need more exercises, pick from any remaining allowed
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
                reps: pick.defaultReps && pick.defaultReps.includes('s') ? pick.defaultReps : params.targetReps,
                duration: pick.defaultReps && pick.defaultReps.includes('s') ? pick.defaultReps : '',
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

    container.classList.remove('hidden');

    const trainingDaysCount = schedule.filter(d => !d.isRest).length;
    const restDaysCount = 7 - trainingDaysCount;
    let totalSets = 0;
    schedule.forEach(d => {
        if (!d.isRest) {
            d.exercises.forEach(ex => totalSets += (ex.sets || 3));
        }
    });

    container.innerHTML = `
        <div class="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-300 space-y-4 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                <h3 class="text-base font-black text-dark flex items-center gap-2">
                    <span>Generated Schedule Preview</span>
                    <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        ${trainingDaysCount} Training / ${restDaysCount} Rest
                    </span>
                </h3>
                <span class="text-xs font-bold text-gray-500">
                    Est. Weekly Volume: ${totalSets} sets
                </span>
            </div>

            <!-- 7-Day Preview Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
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
                            <h4 class="text-xs font-black line-clamp-2 leading-tight">
                                ${escapeHtml(d.routineName)}
                            </h4>
                        </div>
                        <div class="mt-2 pt-1 border-t border-gray-100 text-[10px] font-bold">
                            ${d.isRest ? 'Rest' : `${d.exercises.length} exercises`}
                        </div>
                    </div>
                `).join('')}
            </div>

            <p class="text-xs text-gray-500 italic">
                Click <strong>"Generate &amp; Apply Schedule"</strong> below to replace your weekly schedule.
            </p>
        </div>
    `;

    // Scroll into preview smoothly
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

    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
