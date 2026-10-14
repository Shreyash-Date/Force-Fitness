/**
 * Force Fitness — Workout Planner UI Coordinator (Phase 2)
 * Manages responsive view switching, accessible navigation, 7-day schedule, and exercise library.
 */

import { initSchedule } from './schedule.js';
import { initLibrary } from './library.js';
import { initGenerator } from './generator.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Functional Schedule Engine & Editor (Phase 3)
    initSchedule();

    // 2. Initialize Exercise Library Catalog & Filters
    initLibrary();

    // 3. Initialize Smart Workout Plan Generator (Phase 3)
    initGenerator();

    // 3. Tab Navigation Setup
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
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('aria-controls');
            if (targetId) {
                switchTab(targetId);
            }
        });

        // Accessible Keyboard navigation for tabs
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
});
