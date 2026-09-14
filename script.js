document.addEventListener('DOMContentLoaded', function() {

    // 1. ПЛАВНЫЙ СКРОЛЛ ПО КНОПКАМ НАВИГАЦИИ
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // 2. МАСКА ДЛЯ ВВОДА ТЕЛЕФОНА
    const phoneInput = document.getElementById('phoneInput');

    function formatPhoneNumber(value) {
        let digits = value.replace(/\D/g, '');

        if (digits.startsWith('8')) {
            digits = '7' + digits.slice(1);
        }
        if (digits.startsWith('9') && digits.length <= 10) {
            digits = '7' + digits;
        }
        if (digits.length > 0 && !digits.startsWith('7')) {
            digits = '7' + digits;
        }

        digits = digits.slice(0, 11);

        let formatted = '+7';
        if (digits.length > 1) {
            formatted += ' (' + digits.slice(1, 4);
        }
        if (digits.length >= 5) {
            formatted += ') ' + digits.slice(4, 7);
        }
        if (digits.length >= 8) {
            formatted += '-' + digits.slice(7, 9);
        }
        if (digits.length >= 10) {
            formatted += '-' + digits.slice(9, 11);
        }
        return formatted;
    }

    phoneInput.addEventListener('focus', function() {
        if (this.value === '' || this.value === '+7') {
            this.value = '+7 ';
        }
    });

    phoneInput.addEventListener('input', function() {
        const cursorPos = this.selectionStart;
        const oldValue = this.value;

        this.value = formatPhoneNumber(this.value);

        if (cursorPos === oldValue.length) {
            this.setSelectionRange(this.value.length, this.value.length);
        }
    });

    phoneInput.addEventListener('blur', function() {
        const digits = this.value.replace(/\D/g, '');
        if (digits.length <= 1) {
            this.value = '';
        }
    });

    // 3. ОТПРАВКА ФОРМЫ НА FORMSPREE
    const leadForm = document.getElementById('leadForm');
    const messageDiv = document.getElementById('formMessage');

    if (leadForm) {
        leadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const phoneValue = phoneInput.value.trim();
            const digitsCount = phoneValue.replace(/\D/g, '').length;

            if (digitsCount < 11) {
                messageDiv.textContent = 'Пожалуйста, введите номер полностью (11 цифр).';
                messageDiv.className = 'form-message error';
                return;
            }

            const formData = new FormData(leadForm);
            const submitBtn = leadForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;

            fetch(leadForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    messageDiv.textContent = ' Спасибо! Ваша заявка отправлена. Антон перезвонит вам в ближайшее время.';
                    messageDiv.className = 'form-message success';
                    phoneInput.value = '';
                } else {
                    return response.json().then(data => {
                        throw new Error(data.errors ? data.errors.map(err => err.message).join(', ') : 'Ошибка отправки');
                    });
                }
            })
            .catch(error => {
                messageDiv.textContent = ' Ошибка: ' + error.message;
                messageDiv.className = 'form-message error';
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

                setTimeout(() => {
                    messageDiv.style.display = 'none';
                    messageDiv.className = 'form-message';
                }, 7000);
            });
        });
    }

    // 4. РАБОТА КАРУСЕЛЕЙ
    const carousels = document.querySelectorAll('.carousel-wrapper');
    carousels.forEach(wrapper => {
        const container = wrapper.querySelector('.carousel-container');
        const prevBtn = wrapper.querySelector('.prev');
        const nextBtn = wrapper.querySelector('.next');

        if (container && prevBtn && nextBtn) {
            const getScrollAmount = () => {
                const item = container.querySelector('.carousel-item');
                if (!item) return 300;
                return item.offsetWidth + 20;
            };

            nextBtn.addEventListener('click', () => {
                container.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
            });

            prevBtn.addEventListener('click', () => {
                container.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
            });
        }
    });
});