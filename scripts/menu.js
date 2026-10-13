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

        // hamburger -> X animation
        lines[0].classList.toggle('rotate-45');
        lines[0].classList.toggle('translate-y-2');
        lines[1].classList.toggle('opacity-0');
        lines[2].classList.toggle('-rotate-45');
        lines[2].classList.toggle('-translate-y-2');
    });

    // close menu when a link is tapped
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => menuBtn.click());
    });
}