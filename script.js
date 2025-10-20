document.addEventListener('DOMContentLoaded', function() {

    // ELEMEN GLOBAL
    const splashScreen = document.getElementById('splash-screen');
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    const mainAppScreen = document.getElementById('main-app-screen');
    const successPopup = document.getElementById('success-popup');

    const emailRegisterBtn = document.getElementById('email-register-btn');
    const backToLoginBtn = document.getElementById('back-to-login-btn');
    const registerForm = document.getElementById('register-form');
    const closePopupBtn = document.getElementById('close-popup-btn');

    // Inisialisasi Feather Icons
    feather.replace();

    // --- LOGIKA AUTENTIKASI DAN PERALIHAN LAYAR AWAL ---
    setTimeout(() => {
        splashScreen.classList.remove('active');
        loginScreen.classList.add('active');
    }, 3500);

    emailRegisterBtn.addEventListener('click', () => {
        loginScreen.classList.remove('active');
        registerScreen.classList.add('active');
    });

    backToLoginBtn.addEventListener('click', () => {
        registerScreen.classList.remove('active');
        loginScreen.classList.add('active');
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        registerScreen.classList.remove('active');
        successPopup.classList.add('show');
    });

    closePopupBtn.addEventListener('click', () => {
        successPopup.classList.remove('show');
        setTimeout(() => {
            mainAppScreen.classList.add('active');
            getWeather();
            renderCalendar();
            renderWeeklySummary(currentDate);
        }, 500);
    });

    // --- LOGIKA TOMBOL KELUAR (LOGOUT) ---
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.popup-overlay').forEach(p => p.classList.remove('show'));
        splashScreen.classList.add('active');
        setTimeout(() => {
            splashScreen.classList.remove('active');
            loginScreen.classList.add('active');
        }, 1500);
    });

    // --- LOGIKA UTAMA APLIKASI (SETELAH LOGIN) ---

    // ELEMEN APLIKASI UTAMA
    const sidebar = document.querySelector('.sidebar');
    const pages = document.querySelectorAll('.page');
    const notificationBellWrapper = document.querySelector('.notification-bell-wrapper');
    const notificationPanel = document.getElementById('notification-panel');
    const sesiFokusBtn = document.getElementById('sesi-fokus-btn');
    const yumeWelcomePopup = document.getElementById('yume-welcome-popup');
    const yumeSalamKenalBtn = document.getElementById('yume-salam-kenal-btn');

    // NAVIGASI HALAMAN (SIDEBAR)
     sidebar.addEventListener('click', (e) => {
        // Cek apakah yang diklik adalah link logout
        const logoutLink = e.target.closest('#logout-btn');
        if (logoutLink) {
            // Biarkan listener logoutBtn yang menangani
            return;
        }

        const navItem = e.target.closest('.nav-item');
        if (!navItem) return;

        // Cegah aksi default hanya jika bukan link logout
        e.preventDefault();

        const pageId = navItem.dataset.page;
        if (!pageId) return;

        navigateToPage(pageId);
    });


    function navigateToPage(pageId) {
        sidebar.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));

        const activeNavItem = sidebar.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        document.getElementById(`${pageId}-page`).classList.add('active');

        if (pageId === 'yume') {
            checkFirstTimeYume();
        } else if (pageId === 'schedule') {
            renderCalendar();
            renderWeeklySummary(currentDate);
        } else if (pageId === 'nilai') {
            renderNilaiPage();
        } else if (pageId === 'materi') {
            initMateriPage();
        }
    }

    sesiFokusBtn.addEventListener('click', () => {
        navigateToPage('yume');
    });

    function checkFirstTimeYume() {
        if (!localStorage.getItem('hasMetYume')) {
            yumeWelcomePopup.classList.add('show');
        }
    }

    yumeSalamKenalBtn.addEventListener('click', () => {
        yumeWelcomePopup.classList.remove('show');
        localStorage.setItem('hasMetYume', 'true');
    });

    // LOGIKA NOTIFIKASI
    notificationBellWrapper.addEventListener('mouseenter', () => notificationPanel.classList.add('show'));
    notificationBellWrapper.addEventListener('mouseleave', () => notificationPanel.classList.remove('show'));

    // LOGIKA POP-UP PROFIL
    const profilePicWrapper = document.querySelector('.profile-pic-wrapper');
    const profilePanel = document.getElementById('profile-panel');

    profilePicWrapper.addEventListener('mouseenter', () => profilePanel.classList.add('show'));
    profilePicWrapper.addEventListener('mouseleave', () => profilePanel.classList.remove('show'));

    // --- LOGIKA CUACA (DIPERBARUI DENGAN IKON) ---
    function getWeather() {
        // ... (Kode API tetap sama) ...
        setDummyWeather();
    }

    function updateWeatherDisplay(location, temp, description, iconCode = null) {
        const weatherIconEl = document.getElementById('weather-icon'),
              locationEl = document.getElementById('weather-location'),
              tempEl = document.getElementById('weather-temp'),
              descEl = document.getElementById('weather-desc');

        locationEl.textContent = `${location}`;
        tempEl.textContent = `${temp}°C`;
        descEl.textContent = description;

        let iconFeather = 'sun'; // Default icon

        if (iconCode === 'sunny') {
            iconFeather = 'sun';
        } else if (iconCode === 'slash') {
            iconFeather = 'slash';
        } else if (iconCode && (iconCode.includes('cloudy') || iconCode.includes('overcast'))) {
             iconFeather = 'cloud';
        } else if (iconCode && (iconCode.includes('rain') || iconCode.includes('drizzle'))) {
             iconFeather = 'cloud-rain';
        } else if (iconCode && iconCode.includes('thunder')) {
             iconFeather = 'cloud-lightning';
        } else if (iconCode && (iconCode.includes('snow') || iconCode.includes('sleet'))) {
             iconFeather = 'cloud-snow';
        }

        weatherIconEl.innerHTML = `<i data-feather="${iconFeather}"></i>`;
        feather.replace(); // Refresh icons
    }

    function setDummyWeather(errorMsg = null) {
        if (errorMsg) {
            updateWeatherDisplay(errorMsg, '-', 'Tidak Tersedia', 'slash');
        } else {
            updateWeatherDisplay('Jakarta, ID', '29', 'Cerah Berawan', 'sunny');
        }
    }

    // --- LOGIKA AI CHAT (GEMINI) ---
    const yumeChatInput = document.getElementById('yume-chat-input');
    const yumeSendBtn = document.getElementById('yume-send-btn');
    const yumeChatMessages = document.getElementById('yume-chat-messages');

    yumeSendBtn.addEventListener('click', sendYumeMessage);
    yumeChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendYumeMessage();
    });

    function sendYumeMessage() {
        const messageText = yumeChatInput.value.trim();
        if (messageText === '') return;

        appendMessage(messageText, 'sent', 'yume-chat-messages');
        yumeChatInput.value = '';
        appendMessage('Yume sedang berpikir...', 'received loading', 'yume-chat-messages');

        setTimeout(() => {
            yumeChatMessages.querySelector('.loading').remove();
            const dummyResponse = "Maaf, koneksi ke otak Yume sedang sibuk! (Backend belum terhubung). Tapi jika terhubung, Yume akan menjawab: '" + messageText + "'.";
            appendMessage(dummyResponse, 'received', 'yume-chat-messages');
        }, 1500);
    }

    function appendMessage(text, type, containerId) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', ...type.split(' '));
        messageDiv.innerHTML = `<p>${text}</p>`;
        const container = document.getElementById(containerId);
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    // --- LOGIKA KALENDER DAN JADWAL ---
    const monthYearEl = document.getElementById('month-year');
    const daysGrid = document.getElementById('days-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const scheduleDetailPopup = document.getElementById('schedule-detail-popup');
    const closeSchedulePopupBtn = document.getElementById('close-schedule-popup-btn');
    const popupDateEl = document.getElementById('popup-date');
    const popupEventsEl = document.getElementById('popup-events');
    const weeklySummaryContent = document.getElementById('weekly-summary-content');
    let currentDate = new Date(2025, 9, 20);
    const scheduleData = {
        '2025-10-21': [{ type: 'matkul', subject: 'Pemrograman Dasar', lecturer: 'Dr . Soeharto', time: '08:00 - 14:00', topic: 'Input & Output, Variabel' }],
        '2025-10-24': [{ type: 'matkul', subject: 'Kalkulus Lanjutan', lecturer: 'Prof. Budiono', time: '10:00 - 12:00', topic: 'Integral Lipat Dua' }, { type: 'matkul', subject: 'Struktur Data', lecturer: 'Ibu Siti', time: '14:00 - 16:00', topic: 'Implementasi Linked List Array' }],
        '2025-10-29': [{ type: 'event', subject: 'Seminar AI in Education', lecturer: 'Guest Speaker', time: '13:00 - 15:00', topic: 'Exploring the future of learning In Gakhusa Yume Apps' }],
        '2025-11-05': [{ type: 'libur', subject: 'Libur Nasional', lecturer: '-', time: 'Seharian', topic: 'Maulid Nabi Muhammad SAW' }]
    };

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const lastDateOfLastMonth = new Date(year, month, 0).getDate();
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        monthYearEl.innerText = `${months[month]} ${year}`;
        let daysHtml = "";
        let startDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
        for (let i = startDay; i > 0; i--) {
            daysHtml += `<div class="inactive">${lastDateOfLastMonth - i + 1}</div>`;
        }
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayOfWeek = new Date(year, month, i).getDay();
            let classes = "";
            let today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                classes += "today ";
            }
            let eventType = null;
            if (scheduleData[dateStr]) {
                eventType = scheduleData[dateStr][0].type;
            } else if (dayOfWeek === 0 || dayOfWeek === 6) {
                eventType = 'libur';
                classes += "has-event ";
            }
            if (eventType) {
                classes += `has-event event-${eventType} `;
            }
            daysHtml += `<div class="${classes.trim()}" data-date="${dateStr}">${i}</div>`;
        }
        daysGrid.innerHTML = daysHtml;
    }

    function renderWeeklySummary(date) {
        let html = '';
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1));
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            const dayName = days[currentDay.getDay()];
            if (currentDay.getDay() === 0 || currentDay.getDay() === 6) continue;
            const dateStr = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
            const events = scheduleData[dateStr];
            html += `<div class="summary-day"><h5>${dayName}, ${currentDay.getDate()}</h5>`;
            if (events && events.some(e => e.type === 'matkul')) {
                events.filter(e => e.type === 'matkul').forEach(event => {
                    html += `<div class="summary-item"><span class="summary-time">${event.time.split(' - ')[0]}</span><div class="summary-details"><div class="summary-subject">${event.subject}</div><div class="summary-lecturer">${event.lecturer}</div></div></div>`;
                });
            } else {
                html += `<div class="no-schedule">Tidak ada jadwal</div>`;
            }
            html += `</div>`;
        }
        weeklySummaryContent.innerHTML = html;
    }

    function showScheduleDetail(dateStr) {
        const events = scheduleData[dateStr];
        const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();
        if (!events && dayOfWeek !== 0 && dayOfWeek !== 6) return;
        const dateObj = new Date(dateStr + 'T00:00:00');
        popupDateEl.innerText = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        let eventsHtml = '';
        if (events) {
            events.forEach(event => {
                let borderColorClass = `border-${event.type}`;
                eventsHtml += `<div class="event-item ${borderColorClass}"><h4>${event.subject}</h4><div class="event-detail"><i data-feather="clock"></i> ${event.time}</div><div class="event-detail"><i data-feather="user"></i> ${event.lecturer}</div><div class="event-detail"><i data-feather="file-text"></i> ${event.topic}</div></div>`;
            });
        } else if (dayOfWeek === 0 || dayOfWeek === 6) {
             eventsHtml = `<div class="event-item border-libur"><h4>Libur Akhir Pekan</h4><div class="event-detail"><i data-feather="coffee"></i> Waktunya istirahat!</div></div>`;
        }
        popupEventsEl.innerHTML = eventsHtml;
        feather.replace();
        scheduleDetailPopup.classList.add('show');
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        renderWeeklySummary(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        renderWeeklySummary(currentDate);
    });

    daysGrid.addEventListener('click', (e) => {
        const dayElement = e.target.closest('div[data-date]');
        if (dayElement) {
            showScheduleDetail(dayElement.dataset.date);
        }
    });

    closeSchedulePopupBtn.addEventListener('click', () => {
        scheduleDetailPopup.classList.remove('show');
    });

    scheduleDetailPopup.addEventListener('click', (e) => {
        if (e.target === scheduleDetailPopup) {
            scheduleDetailPopup.classList.remove('show');
        }
    });

    // --- LOGIKA HALAMAN MATERI (POPUP) ---
    const materiDetailPopup = document.getElementById('materi-detail-popup');
    const closeMateriPopupBtn = document.getElementById('close-materi-popup-btn');

    function initMateriPage() {
        document.querySelectorAll('.materi-card').forEach(card => {
            card.addEventListener('click', () => {
                materiDetailPopup.classList.add('show');
            });
        });
    }

    closeMateriPopupBtn.addEventListener('click', () => {
        materiDetailPopup.classList.remove('show');
    });

    const materiTabs = document.querySelector('.materi-popup-tabs');
    materiTabs.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.tab-link');
        if (!tabBtn) return;
        materiTabs.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
        tabBtn.classList.add('active');
        const tabContentId = tabBtn.dataset.tab;
        materiDetailPopup.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tabContentId).classList.add('active');
    });

    // --- LOGIKA HALAMAN NILAI (CHART) ---
    let nilaiChart = null;
    function renderNilaiPage() {
        const ctx = document.getElementById('nilai-chart').getContext('2d');
        const data = {
            labels: ['Kehadiran (5%)', 'Kuis (30%)', 'UTS (30%)', 'UAS (35%)'],
            datasets: [{
                label: 'Nilai Anda',
                data: [100, 85, 78, 90],
                backgroundColor: ['rgba(217, 70, 111, 0.7)', 'rgba(30, 42, 120, 0.7)', 'rgba(255, 190, 11, 0.7)', 'rgba(42, 157, 143, 0.7)'],
                borderColor: ['rgba(217, 70, 111, 1)', 'rgba(30, 42, 120, 1)', 'rgba(255, 190, 11, 1)', 'rgba(42, 157, 143, 1)'],
                borderWidth: 1
            }]
        };
        if (nilaiChart) {
            nilaiChart.destroy();
        }
        nilaiChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: 'var(--color-text-secondary)', font: { size: 12 } }
                    },
                    title: { display: false }
                },
            }
        });
    }

    // --- LOGIKA HALAMAN PENGATURAN ---
    const themePinkBtn = document.getElementById('theme-pink-btn');
    const themeGreenBtn = document.getElementById('theme-green-btn');
    const themeBlueBtn = document.getElementById('theme-blue-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const themeButtons = [themePinkBtn, themeGreenBtn, themeBlueBtn];
    const themes = {
        pink: { '--color-primary': '#D9466F', '--color-primary-light': '#FFF0F6', '--color-primary-extra-light': '#FADADD' },
        green: { '--color-primary': '#A9C96D', '--color-primary-light': '#F6FAE0', '--color-primary-extra-light': '#E9F5C7' },
        blue: { '--color-primary': '#5B86E5', '--color-primary-light': '#EBF0FF', '--color-primary-extra-light': '#D6E0FF' }
    };

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const themeName = btn.dataset.theme;
            const themeColors = themes[themeName];
            for (const [key, value] of Object.entries(themeColors)) {
                document.documentElement.style.setProperty(key, value);
            }
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    deleteAccountBtn.addEventListener('click', () => {
        const confirmation = confirm("APAKAH ANDA YAKIN? Menghapus akun bersifat permanen dan tidak dapat dibatalkan. Semua data Anda akan hilang.");
        if (confirmation) {
            alert("Akun Anda telah dihapus.");
            logoutBtn.click();
        }
    });

});