const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        const message = document.getElementById('message');

        const nameError = document.getElementById('nameError');
        const emailError = document.getElementById('emailError');
        const phoneError = document.getElementById('phoneError');
        const messageError = document.getElementById('messageError');
        const formSuccess = document.getElementById('formSuccess');

        let isValid = true;

        // Reset errors
        nameError.textContent = '';
        emailError.textContent = '';
        phoneError.textContent = '';
        messageError.textContent = '';
        formSuccess.classList.add('hidden');

        // Name validation
        if (!name.value.trim()) {
            nameError.textContent = 'Please enter your name.';
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            emailError.textContent = 'Please enter your email.';
            isValid = false;
        } else if (!emailRegex.test(email.value.trim())) {
            emailError.textContent = 'Please enter a valid email address.';
            isValid = false;
        }

        // Phone validation
        const phoneRegex = /^[+]?[\d\s-]{7,15}$/;
        if (!phone.value.trim()) {
            phoneError.textContent = 'Please enter your phone number.';
            isValid = false;
        } else if (!phoneRegex.test(phone.value.trim())) {
            phoneError.textContent = 'Please enter a valid phone number.';
            isValid = false;
        }

        // Message validation
        if (!message.value.trim()) {
            messageError.textContent = 'Please enter a message.';
            isValid = false;
        }

        if (isValid) {
            formSuccess.classList.remove('hidden');
            contactForm.reset();
        }
    });
}
