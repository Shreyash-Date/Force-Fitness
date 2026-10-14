/**
 * Force Fitness — 7-Day Schedule Controller (Phase 3)
 * Manages 7-day calendar, day selection, rest-day toggling, routine display,
 * Workout Editor invocation, and smart Plan Generator synchronization.
 */

import {
    getSchedule,
    getSelectedDayId,
    setSelectedDayId,
    getDay,
    updateDayRoutineName,
    toggleRestDay,
    removeExerciseFromDay
} from './storage.js';
import { isEditingActive, startEditing, renderEditorUI, getActiveEditingDayId } from './editor.js';
import { openGeneratorModal } from './generator.js';

export function initSchedule() {
    renderSchedule();

    // Listen for storage and schedule events
    window.addEventListener('schedule-updated', () => {
        renderSchedule();
    });

    window.addEventListener('editor-closed', () => {
        renderSchedule();
    });

    // Generator trigger button on schedule banner if present
    const genBtn = document.getElementById('open-plan-generator-btn');
    if (genBtn) {
        genBtn.addEventListener('click', openGeneratorModal);
    }
}

export function renderSchedule() {
    const schedule = getSchedule();
    const selectedDayId = getSelectedDayId();

    renderWeekGrid(schedule, selectedDayId);
    
    // If editor is currently active on the selected day, keep editor rendered
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
                class="day-card bg-white rounded-2xl p-3.5 xl:p-4 border transition duration-200 cursor-pointer flex flex-col justify-between min-h-36 ${
                    isSelected
                        ? 'border-black ring-2 ring-black bg-cream shadow-md -translate-y-1'
                        : 'border-gray-200 shadow-sm hover:border-gray-400 hover:shadow-md'
                }">
                <!-- Card Header -->
                <div>
                    <div class="flex items-center justify-between gap-1 font-black text-dark mb-1.5">
                        <span class="text-sm xl:text-base">${escapeHtml(day.dayName)}</span>
                        <span class="text-[10px] xl:text-[11px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0 ${
                            day.isRest ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                        }">
                            Day ${day.dayNumber}
                        </span>
                    </div>

                    <!-- Routine Title -->
                    <p class="text-xs font-bold text-dark line-clamp-1 mb-1">
                        ${escapeHtml(day.routineName || (day.isRest ? 'Rest Day' : 'Workout Routine'))}
                    </p>

                    <!-- Exercise Preview or Rest Message -->
                    ${day.isRest ? `
                        <span class="inline-flex px-2 py-0.5 rounded bg-gray-100 text-[10px] font-semibold text-gray-500">
                            Rest &amp; Recovery
                        </span>
                    ` : `
                        <p class="text-[11px] text-gray-500 line-clamp-2">
                            ${exerciseCount === 0 
                                ? '<span class="text-gray-400 italic">No exercises added yet</span>' 
                                : day.exercises.slice(0, 2).map(e => escapeHtml(e.name)).join(', ') + (exerciseCount > 2 ? '...' : '')
                            }
                        </p>
                    `}
                </div>

                <!-- Card Footer Info -->
                <div class="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span class="font-bold ${day.isRest ? 'text-gray-400' : 'text-emerald-600'}">
                        ${day.isRest ? 'Rest Day' : `${exerciseCount} exercise${exerciseCount === 1 ? '' : 's'}`}
                    </span>
                    ${isSelected ? '<span class="text-[10px] font-bold text-black uppercase tracking-wider">● Selected</span>' : ''}
                </div>
            </div>
        `;
    }).join('');

    // Attach click listeners to day cards
    gridContainer.querySelectorAll('.day-card').forEach(card => {
        card.addEventListener('click', () => {
            const dayId = card.getAttribute('data-day-id');
            if (dayId && dayId !== selectedDayId) {
                setSelectedDayId(dayId);
                window.dispatchEvent(new CustomEvent('selected-day-changed', { detail: { dayId } }));
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
            
            <!-- Top Header & Controls -->
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

                <!-- Action Controls: Edit Workout, Toggle Rest Day -->
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

            <!-- Routine Name Field (Only if training day) -->
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

            <!-- Assigned Exercises List -->
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

                                                <!-- Coaching cues / Notes preview -->
                                                ${ex.notes ? `
                                                    <p class="text-xs text-gray-500 mt-1 max-w-lg leading-relaxed">
                                                        <span class="font-bold text-gray-600">Note:</span> ${escapeHtml(ex.notes)}
                                                    </p>
                                                ` : ''}
                                            </div>
                                        </div>

                                        <div class="flex items-center gap-3 self-end sm:self-center shrink-0">
                                            <!-- Sets / Reps / Duration / Rest tags -->
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

    // Listeners for Day Detail Panel
    const openEditorBtn = document.getElementById('open-editor-btn');
    const openEditorQuickBtn = document.getElementById('open-editor-quick-btn');
    const editorStartEmptyBtn = document.getElementById('editor-start-empty-btn');
    [openEditorBtn, openEditorQuickBtn, editorStartEmptyBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                startEditing(dayId);
            });
        }
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

    const removeBtns = detailContainer.querySelectorAll('.remove-exercise-btn');
    removeBtns.forEach(btn => {
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
                    if (libSection) {
                        libSection.scrollIntoView({ behavior: 'smooth' });
                    }
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

    // Update Overview Card 1: Active Split
    const splitMetric = document.getElementById('metric-split-title');
    const splitSub = document.getElementById('metric-split-sub');
    if (splitMetric) splitMetric.textContent = `${trainingDaysCount}-Day Split`;
    if (splitSub) splitSub.textContent = `${trainingDaysCount} Training / ${restDaysCount} Rest Days`;

    // Update Overview Card 2: Catalog Count
    const catMetric = document.getElementById('metric-catalog-title');
    const catSub = document.getElementById('metric-catalog-sub');
    if (catMetric) catMetric.textContent = '32 Exercises';
    if (catSub) catSub.textContent = 'Catalog Active • Filterable';

    // Update Overview Card 4: Volume
    const volMetric = document.getElementById('metric-volume-title');
    const volSub = document.getElementById('metric-volume-sub');
    if (volMetric) volMetric.textContent = `${totalSets} Sets / Wk`;
    if (volSub) volSub.textContent = `${totalSets} Total Weekly Sets`;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
