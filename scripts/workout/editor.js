/**
 * Force Fitness — Workout Editor (Phase 3)
 * Full-featured interactive editor for custom routine names, exercise selection,
 * removal, reordering, sets, reps, duration, rest intervals, and coaching notes.
 */

import { getDay, updateFullDayRoutine } from './storage.js';
import { EXERCISES, MUSCLE_GROUPS, EQUIPMENT_TYPES } from './exercises-data.js';
import { escapeHtml } from './utils.js';

let activeDayId = null;
let isEditorActive = false;
let draftRoutine = null;
let pickerSearch = '';
let pickerMuscle = 'All';
let pickerEquipment = 'All';

export function isEditingActive() {
    return isEditorActive;
}

export function getActiveEditingDayId() {
    return activeDayId;
}

export function startEditing(dayId) {
    const day = getDay(dayId);
    if (!day) return;

    activeDayId = dayId;
    isEditorActive = true;
    
    // Deep clone to draft so cancel can revert cleanly
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

    // Ensure all exercises have valid defaults for Phase 3 fields
    draftRoutine.exercises.forEach(ex => {
        if (ex.sets === undefined || ex.sets === null) ex.sets = 3;
        if (ex.reps === undefined || ex.reps === null) ex.reps = '10-12';
        if (ex.duration === undefined || ex.duration === null) ex.duration = '';
        if (ex.rest === undefined || ex.rest === null) ex.rest = '90s';
        if (ex.notes === undefined || ex.notes === null) ex.notes = '';
    });

    renderEditorUI();
}

export function cancelEditing() {
    isEditorActive = false;
    draftRoutine = null;
    activeDayId = null;
    window.dispatchEvent(new CustomEvent('editor-closed', { detail: { saved: false } }));
}

export function saveEditing() {
    if (!draftRoutine || !activeDayId) return false;

    // Validation
    const validationError = validateDraft(draftRoutine);
    if (validationError) {
        showEditorNotification(validationError, 'error');
        return false;
    }

    // Persist to storage
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

export function renderEditorUI() {
    const detailContainer = document.getElementById('selected-day-detail-panel');
    if (!detailContainer || !draftRoutine) return;

    const exCount = draftRoutine.exercises ? draftRoutine.exercises.length : 0;

    detailContainer.innerHTML = `
        <div class="bg-white rounded-3xl p-6 md:p-8 border-2 border-black shadow-xl space-y-6 animate-fadeIn transition-all">
            
            <!-- Editor Top Header -->
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

                <!-- Top Save / Cancel Action Buttons -->
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

            <!-- Notification Banner Container -->
            <div id="editor-notification" class="hidden"></div>

            <!-- Routine Name & Rest Day Switcher -->
            <div class="bg-cream rounded-2xl p-5 border border-gray-300 space-y-4">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <!-- Day Type Toggle -->
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

                    <!-- Summary Counter -->
                    <div class="text-xs font-bold text-gray-600">
                        ${draftRoutine.isRest ? 'Recovery Day' : `${exCount} exercise${exCount === 1 ? '' : 's'} assigned`}
                    </div>
                </div>

                <!-- Custom Name Input -->
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

            <!-- Exercises Management Section -->
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

                        <!-- Open Exercise Picker Modal Button -->
                        <button id="editor-open-picker-btn" type="button"
                            class="px-4 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                            <span>+ Add Exercise to Routine</span>
                        </button>
                    </div>

                    <!-- Exercises List -->
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
                                    
                                    <!-- Exercise Item Header -->
                                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                                        <div class="flex items-center gap-3">
                                            <!-- Order Number -->
                                            <span class="w-7 h-7 rounded-full bg-cream text-dark font-black text-xs flex items-center justify-center shrink-0 border border-gray-300">
                                                ${idx + 1}
                                            </span>
                                            
                                            <!-- Exercise Title & Tags -->
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

                                        <!-- Controls: Reorder & Remove -->
                                        <div class="flex items-center gap-2 self-end sm:self-center">
                                            <!-- Move Up -->
                                            <button type="button" data-move-up="${idx}" title="Move up in routine"
                                                class="editor-move-up-btn p-1.5 rounded-lg border border-gray-300 text-xs font-bold hover:bg-cream transition cursor-pointer ${
                                                    idx === 0 ? 'opacity-30 cursor-not-allowed' : ''
                                                }" ${idx === 0 ? 'disabled' : ''}>
                                                ▲
                                            </button>
                                            
                                            <!-- Move Down -->
                                            <button type="button" data-move-down="${idx}" title="Move down in routine"
                                                class="editor-move-down-btn p-1.5 rounded-lg border border-gray-300 text-xs font-bold hover:bg-cream transition cursor-pointer ${
                                                    idx === exCount - 1 ? 'opacity-30 cursor-not-allowed' : ''
                                                }" ${idx === exCount - 1 ? 'disabled' : ''}>
                                                ▼
                                            </button>

                                            <!-- Remove -->
                                            <button type="button" data-remove-index="${idx}" title="Remove this exercise"
                                                class="editor-remove-ex-btn ml-2 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-800 transition cursor-pointer">
                                                ✕ Remove
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Editable Parameters Grid: Sets, Reps, Duration, Rest -->
                                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <!-- Sets -->
                                        <div>
                                            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                Sets (1-10)
                                            </label>
                                            <input type="number" min="1" max="10" data-field="sets" data-index="${idx}"
                                                value="${ex.sets || 3}"
                                                class="editor-field-input w-full bg-cream border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                                        </div>

                                        <!-- Reps -->
                                        <div>
                                            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                Target Reps
                                            </label>
                                            <input type="text" data-field="reps" data-index="${idx}"
                                                value="${escapeHtml(ex.reps || '10-12')}"
                                                placeholder="e.g. 8-10 or AMRAP"
                                                class="editor-field-input w-full bg-cream border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                                        </div>

                                        <!-- Duration -->
                                        <div>
                                            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                Duration (opt.)
                                            </label>
                                            <input type="text" data-field="duration" data-index="${idx}"
                                                value="${escapeHtml(ex.duration || '')}"
                                                placeholder="e.g. 45s, 60s"
                                                class="editor-field-input w-full bg-cream border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                                        </div>

                                        <!-- Rest Interval -->
                                        <div>
                                            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                Rest Interval
                                            </label>
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

                                    <!-- Coaching Notes / Form Cues -->
                                    <div>
                                        <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                            Coaching Notes / Form Cues:
                                        </label>
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

            <!-- Bottom Save / Cancel Action Bar -->
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

    // Routine Name change
    const routineInput = document.getElementById('editor-routine-name');
    if (routineInput) {
        routineInput.addEventListener('input', (e) => {
            if (draftRoutine) {
                draftRoutine.routineName = e.target.value;
            }
        });
    }

    // Toggle day type: Training vs Rest
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

    // Save buttons
    ['save-editor-btn', 'save-editor-btn-bottom'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', saveEditing);
    });

    // Cancel buttons
    ['cancel-editor-btn', 'cancel-editor-btn-bottom'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', cancelEditing);
    });

    // Field inputs
    detailContainer.querySelectorAll('.editor-field-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(input.getAttribute('data-index'), 10);
            const field = input.getAttribute('data-field');
            if (!isNaN(idx) && field && draftRoutine && draftRoutine.exercises[idx]) {
                draftRoutine.exercises[idx][field] = e.target.value;
            }
        });
        input.addEventListener('input', (e) => {
            const idx = parseInt(input.getAttribute('data-index'), 10);
            const field = input.getAttribute('data-field');
            if (!isNaN(idx) && field && draftRoutine && draftRoutine.exercises[idx]) {
                draftRoutine.exercises[idx][field] = e.target.value;
            }
        });
    });

    // Move Up
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

    // Move Down
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

    // Remove exercise
    detailContainer.querySelectorAll('.editor-remove-ex-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-remove-index'), 10);
            if (!isNaN(idx) && draftRoutine) {
                draftRoutine.exercises.splice(idx, 1);
                renderEditorUI();
            }
        });
    });

    // Open Exercise Picker
    ['editor-open-picker-btn', 'editor-empty-picker-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', openExercisePickerModal);
    });
}

function showEditorNotification(message, type = 'error') {
    const banner = document.getElementById('editor-notification');
    if (!banner) return;

    banner.className = `p-4 rounded-xl text-xs font-bold transition flex items-center justify-between ${
        type === 'error'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
    }`;
    banner.innerHTML = `
        <span>${escapeHtml(message)}</span>
        <button type="button" class="text-xs text-gray-500 hover:text-black cursor-pointer" onclick="this.parentElement.classList.add('hidden')">✕</button>
    `;
    banner.classList.remove('hidden');

    if (type === 'success') {
        setTimeout(() => {
            banner.classList.add('hidden');
        }, 3000);
    }
}

// Exercise Picker Modal for selecting exercises directly into draft
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
    if (modal) {
        modal.classList.add('hidden');
    }
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
                
                <!-- Modal Header -->
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

                <!-- Modal Filter Bar -->
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

                    <!-- Muscle Pills -->
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

                <!-- Modal Exercise List Grid -->
                <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                    ${filtered.length === 0 ? `
                        <div class="p-8 text-center text-gray-500 text-xs">
                            No exercises match your filter criteria.
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            ${filtered.map(ex => {
                                const isAlreadyIn = draftRoutine && draftRoutine.exercises.some(e => e.id === ex.id);
                                return `
                                    <div class="p-3.5 rounded-2xl border border-gray-200 hover:border-gray-400 bg-white shadow-sm flex flex-col justify-between transition">
                                        <div>
                                            <div class="flex items-center justify-between gap-1 mb-1.5">
                                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white">
                                                    ${escapeHtml(ex.muscleGroup)}
                                                </span>
                                                <span class="text-[10px] font-semibold text-gray-500">
                                                    ${escapeHtml(ex.equipment)}
                                                </span>
                                            </div>
                                            <h4 class="text-sm font-black text-dark">${escapeHtml(ex.name)}</h4>
                                            <p class="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-snug">
                                                ${escapeHtml(ex.description)}
                                            </p>
                                        </div>

                                        <div class="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                            <span class="text-[10px] font-bold text-gray-400">
                                                ${ex.defaultSets} sets × ${escapeHtml(ex.defaultReps)}
                                            </span>
                                            <button type="button" data-add-to-draft="${ex.id}"
                                                class="picker-add-btn px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                                    isAlreadyIn
                                                        ? 'bg-cream text-dark border border-gray-300 hover:bg-gray-200'
                                                        : 'bg-black text-white hover:bg-gray-800'
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

                <!-- Modal Footer -->
                <div class="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                    <span>Showing ${filtered.length} of ${EXERCISES.length} exercises</span>
                    <button id="picker-done-btn" type="button"
                        class="px-5 py-2 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition cursor-pointer">
                        Done
                    </button>
                </div>

            </div>
        </div>
    `;

    // Modal listeners
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

            // Brief feedback
            btn.textContent = '✓ Added!';
            btn.classList.add('bg-emerald-600', 'text-white');
            setTimeout(() => {
                renderPickerModalContent(modal);
            }, 600);

            // Update main editor view behind the modal
            renderEditorUI();
        });
    });
}

