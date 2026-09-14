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

    // 2. МАСКА ДЛЯ ТЕЛЕФОНА С НЕИЗМЕНЯЕМОЙ ЦИФРОЙ 9 И PLACEHOLDER
    const phoneInput = document.getElementById('phoneInput');
    const FIXED_PREFIX = '+7 (9'; // Префикс, который нельзя стереть
    const PLACEHOLDER = '+7 (___) ___-__-__'; // Красивый placeholder

    // Изначально поле пустое, чтобы был виден placeholder
    phoneInput.value = '';

    // Форматирование номера с принудительным префиксом
    function formatPhoneNumber(value) {
        // Убираем все нецифровые символы
        let digits = value.replace(/\D/g, '');

        // Если пользователь стер всё — возвращаем пустую строку (placeholder вернётся)
        if (digits.length <= 1) {
            return '';
        }

        // Обрабатываем первую цифру: если 8 -> 7
        if (digits.startsWith('8')) {
            digits = '7' + digits.slice(1);
        }
        // Если первая цифра не 7 — принудительно ставим 7
        if (!digits.startsWith('7')) {
            digits = '7' + digits;
        }

        // Ограничиваем 11 цифрами (7 + 10 цифр номера)
        digits = digits.slice(0, 11);

        // Собираем номер: +7 (XXX) XXX-XX-XX
        let formatted = '+7';
        if (digits.length >= 2) {
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

    // Обработка фокуса: если поле пустое — подставляем префикс
    phoneInput.addEventListener('focus', function() {
        if (this.value === '' || this.value === FIXED_PREFIX) {
            this.value = FIXED_PREFIX;
            // Ставим курсор в конец
            const len = this.value.length;
            this.setSelectionRange(len, len);
        }
    });

    // Обработка ввода
    phoneInput.addEventListener('input', function() {
        let newValue = formatPhoneNumber(this.value);

        // Защита префикса: если пользователь начал вводить цифры, но префикс был стерт
        if (newValue !== '' && !newValue.startsWith('+7 (9')) {
            newValue = FIXED_PREFIX + newValue.replace(/^\+?7?\s*\(?9?/, '');
        }

        this.value = newValue;

        // Если поле не пустое — ставим курсор в конец
        if (this.value !== '') {
            const len = this.value.length;
            this.setSelectionRange(len, len);
        }
    });

    // Защита от удаления цифры 9 через Backspace и Delete
    phoneInput.addEventListener('keydown', function(e) {
        const cursorPos = this.selectionStart;
        const selectionEnd = this.selectionEnd;

        // Если нажали Backspace
        if (e.key === 'Backspace') {
            // Позиция цифры "9" в строке "+7 (9" — это индекс 4
            // Если курсор стоит на позиции 5 (сразу после 9) или выделяет 9 — блокируем
            if (cursorPos === 5 || (cursorPos <= 5 && selectionEnd > 4)) {
                e.preventDefault();
                // Восстанавливаем префикс, если его стерли
                if (!this.value.startsWith('+7 (9')) {
                    this.value = FIXED_PREFIX;
                }
                this.setSelectionRange(5, 5);
            }
        }

        // Если нажали Delete
        if (e.key === 'Delete') {
            // Если курсор стоит прямо перед "9" (позиция 4) — блокируем
            if (cursorPos === 4) {
                e.preventDefault();
                this.setSelectionRange(5, 5);
            }
        }

        // Если пользователь пытается выделить и удалить все символы
        if ((e.key === 'Backspace' || e.key === 'Delete') && selectionEnd - cursorPos > 3) {
            if (cursorPos < 5) {
                e.preventDefault();
                this.value = FIXED_PREFIX;
                this.setSelectionRange(5, 5);
            }
        }
    });

    // Обработка потери фокуса: если номер не введён — очищаем поле, чтобы вернулся placeholder
    phoneInput.addEventListener('blur', function() {
        const digits = this.value.replace(/\D/g, '');
        // Если введено меньше 11 цифр (т.е. номер не полный) — очищаем полностью
        if (digits.length < 11) {
            this.value = ''; // Возвращаем placeholder
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

            // Проверяем, что номер полный (11 цифр: 7 + 10)
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
                    phoneInput.value = ''; // Очищаем поле после отправки (вернётся placeholder)
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