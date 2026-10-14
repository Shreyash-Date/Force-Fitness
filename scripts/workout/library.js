/**
 * Force Fitness — Exercise Library Controller (Phase 2)
 * Manages search, filtering by muscle group/equipment/difficulty, and adding exercises to selected day.
 */

import { EXERCISES, MUSCLE_GROUPS, EQUIPMENT_TYPES, DIFFICULTY_LEVELS } from './exercises-data.js';
import { getSelectedDayId, getDay, addExerciseToDay } from './storage.js';

let currentSearch = '';
let currentMuscle = 'All';
let currentEquipment = 'All';
let currentDifficulty = 'All';

export function initLibrary() {
    renderLibraryFilters();
    renderLibraryList();

    // Listen for schedule day changes to update the button label "+ Add to [Day]"
    window.addEventListener('selected-day-changed', () => {
        renderLibraryList();
    });
}

function renderLibraryFilters() {
    const filterContainer = document.getElementById('library-filters-container');
    if (!filterContainer) return;

    filterContainer.innerHTML = `
        <div class="flex flex-col gap-4">
            <!-- Search Input and Dropdowns Row -->
            <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <!-- Search Input -->
                <div class="relative flex-1">
                    <input id="exercise-search-input" type="text" value="${escapeHtml(currentSearch)}"
                        placeholder="Search exercises by name, muscle, or equipment..."
                        class="w-full bg-white border border-gray-300 rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black">
                    <span class="absolute left-4 top-3 text-gray-400">
                        🔍
                    </span>
                    ${currentSearch ? `<button id="clear-search-btn" class="absolute right-3.5 top-2.5 text-xs text-gray-400 hover:text-black">✕</button>` : ''}
                </div>

                <!-- Dropdowns -->
                <div class="flex flex-wrap gap-2.5 items-center">
                    <!-- Equipment Select -->
                    <div class="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <label for="equipment-filter-select">Equipment:</label>
                        <select id="equipment-filter-select"
                            class="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black">
                            ${EQUIPMENT_TYPES.map(eq => `<option value="${eq}" ${currentEquipment === eq ? 'selected' : ''}>${eq}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Difficulty Select -->
                    <div class="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <label for="difficulty-filter-select">Difficulty:</label>
                        <select id="difficulty-filter-select"
                            class="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black">
                            ${DIFFICULTY_LEVELS.map(diff => `<option value="${diff}" ${currentDifficulty === diff ? 'selected' : ''}>${diff}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <!-- Muscle Group Filter Pills -->
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

    // Attach filter event listeners
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

    const muscleBtns = filterContainer.querySelectorAll('.muscle-pill-btn');
    muscleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentMuscle = btn.getAttribute('data-muscle') || 'All';
            renderLibraryFilters();
            renderLibraryList();
        });
    });
}

export function renderLibraryList() {
    const listContainer = document.getElementById('library-list-container');
    if (!listContainer) return;

    const filtered = EXERCISES.filter(ex => {
        // Search filter
        if (currentSearch) {
            const query = currentSearch.toLowerCase();
            const matchName = ex.name.toLowerCase().includes(query);
            const matchMuscle = ex.muscleGroup.toLowerCase().includes(query);
            const matchEq = ex.equipment.toLowerCase().includes(query);
            if (!matchName && !matchMuscle && !matchEq) return false;
        }

        // Muscle filter
        if (currentMuscle !== 'All' && ex.muscleGroup !== currentMuscle) {
            return false;
        }

        // Equipment filter
        if (currentEquipment !== 'All' && ex.equipment !== currentEquipment) {
            return false;
        }

        // Difficulty filter
        if (currentDifficulty !== 'All' && ex.difficulty !== currentDifficulty) {
            return false;
        }

        return true;
    });

    const selectedDayId = getSelectedDayId();
    const currentDay = getDay(selectedDayId);
    const dayLabel = currentDay ? currentDay.dayName : 'Today';

    // Header summary row
    const countText = `Showing ${filtered.length} of ${EXERCISES.length} exercises`;

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="py-4">
                <p class="text-xs font-semibold text-gray-500 mb-4">${countText}</p>
                <div class="bg-white rounded-3xl p-10 text-center border border-gray-200">
                    <p class="text-3xl mb-2">🔎</p>
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
                ${filtered.map(ex => {
                    return `
                        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition flex flex-col justify-between">
                            <div>
                                <!-- Top Tags -->
                                <div class="flex items-center justify-between gap-2 mb-2.5">
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-black text-white">
                                        ${escapeHtml(ex.muscleGroup)}
                                    </span>
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                        ${escapeHtml(ex.equipment)}
                                    </span>
                                </div>

                                <!-- Exercise Name -->
                                <h3 class="text-lg font-black text-dark tracking-tight">
                                    ${escapeHtml(ex.name)}
                                </h3>

                                <!-- Difficulty & Form Guidance -->
                                <p class="text-xs text-gray-500 mt-2 leading-relaxed">
                                    ${escapeHtml(ex.description)}
                                </p>
                            </div>

                            <!-- Bottom Action -->
                            <div class="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span class="text-xs font-semibold text-gray-400">
                                    ${escapeHtml(ex.difficulty)} • ${ex.defaultSets}×${escapeHtml(ex.defaultReps)}
                                </span>
                                <button type="button" data-exercise-id="${ex.id}"
                                    class="add-to-day-btn px-4 py-1.5 bg-gray-dark text-white rounded-full text-xs font-bold hover:bg-black hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1">
                                    <span>+ Add to ${dayLabel}</span>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    // Attach Add to Day button listeners
    const addBtns = listContainer.querySelectorAll('.add-to-day-btn');
    addBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const exerciseId = btn.getAttribute('data-exercise-id');
            const exercise = EXERCISES.find(e => e.id === exerciseId);
            if (!exercise) return;

            addExerciseToDay(selectedDayId, exercise);

            // Button feedback
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span>✓ Added!</span>`;
            btn.classList.add('bg-green-600');
            btn.classList.remove('bg-gray-dark', 'hover:bg-black');

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('bg-green-600');
                btn.classList.add('bg-gray-dark', 'hover:bg-black');
            }, 1000);

            // Dispatch global event for schedule sync
            window.dispatchEvent(new CustomEvent('schedule-updated'));
        });
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
