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
            renderCalendar(); // Render kalender saat dashboard pertama kali muncul
        }, 500);
    });

    // --- LOGIKA UTAMA APLIKASI (SETELAH LOGIN) ---

    // ELEMEN APLIKASI UTAMA
    const sidebarMenu = document.getElementById('sidebar-menu');
    const pages = document.querySelectorAll('.page');
    const notificationBellWrapper = document.querySelector('.notification-bell-wrapper');
    const notificationPanel = document.getElementById('notification-panel');

    // NAVIGASI HALAMAN (SIDEBAR)
    sidebarMenu.addEventListener('click', (e) => {
        e.preventDefault();
        const navItem = e.target.closest('.nav-item');
        if (!navItem) return;

        // Hapus kelas 'active' dari semua menu item dan halaman
        sidebarMenu.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));

        // Tambahkan kelas 'active' ke menu item dan halaman yang diklik
        const pageId = navItem.dataset.page;
        navItem.classList.add('active');
        document.getElementById(`${pageId}-page`).classList.add('active');
    });
    
    // LOGIKA NOTIFIKASI
    notificationBellWrapper.addEventListener('mouseenter', () => notificationPanel.classList.add('show'));
    notificationBellWrapper.addEventListener('mouseleave', () => notificationPanel.classList.remove('show'));

    // LOGIKA CUACA (DUMMY)
    function getWeather() {
        const weatherIconEl = document.getElementById('weather-icon'),
              locationEl = document.getElementById('weather-location'),
              tempEl = document.getElementById('weather-temp'),
              descEl = document.getElementById('weather-desc');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(() => {
                setTimeout(() => {
                    locationEl.textContent = 'Jakarta, ID';
                    tempEl.textContent = '29°C';
                    descEl.textContent = 'Cerah Berawan';
                    weatherIconEl.innerHTML = '<i data-feather="cloud-sun"></i>';
                    feather.replace();
                }, 1500);
            }, () => {
                locationEl.textContent = 'Lokasi tidak diizinkan';
                tempEl.textContent = '-°C';
                weatherIconEl.innerHTML = '<i data-feather="slash"></i>';
                feather.replace();
            });
        }
    }

    // --- LOGIKA KALENDER DAN JADWAL ---

    // ELEMEN KALENDER
    const monthYearEl = document.getElementById('month-year');
    const daysGrid = document.getElementById('days-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const scheduleDetailPopup = document.getElementById('schedule-detail-popup');
    const closeSchedulePopupBtn = document.getElementById('close-schedule-popup-btn');
    const popupDateEl = document.getElementById('popup-date');
    const popupEventsEl = document.getElementById('popup-events');
    
    let currentDate = new Date(2025, 9, 20); // Set to October 2025 for consistent demo

    // DATA JADWAL (DUMMY) DENGAN TIPE
    const scheduleData = {
        '2025-10-21': [
            { 
                type: 'matkul',
                subject: 'Pemrograman Dasar',
                lecturer: 'Dr . Soeharto',
                time: '08:00 - 14:00',
                topic: 'Input & Output, Variabel'
            }
        ],
        '2025-10-24': [
            {
                type: 'matkul',
                subject: 'Kalkulus Lanjutan',
                lecturer: 'Prof. Budiono',
                time: '10:00 - 12:00',
                topic: 'Integral Lipat Dua'
            },
            {
                type: 'matkul',
                subject: 'Struktur Data',
                lecturer: 'Ibu Siti',
                time: '14:00 - 16:00',
                topic: 'Implementasi Linked List Array'
            }
        ],
        '2025-10-29': [
            {
                type: 'event',
                subject: 'Seminar AI in Education',
                lecturer: 'Guest Speaker',
                time: '13:00 - 15:00',
                topic: 'Exploring the future of learning In Gakhusa Yume Apps'
            }
        ],
        '2025-11-05': [
             {
                type: 'libur',
                subject: 'Libur Nasional',
                lecturer: '-',
                time: 'Seharian',
                topic: 'Maulid Nabi Muhammad SAW'
            }
        ]
    };

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sunday, 1=Monday
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const lastDateOfLastMonth = new Date(year, month, 0).getDate();

        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        monthYearEl.innerText = `${months[month]} ${year}`;

        let daysHtml = "";
        
        // Loop untuk hari dari bulan sebelumnya (inactive)
        let startDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
        for (let i = startDay; i > 0; i--) {
            daysHtml += `<div class="inactive">${lastDateOfLastMonth - i + 1}</div>`;
        }
        
        // Loop untuk hari di bulan ini
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            let classes = "";
            let today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                classes += "today ";
            }
            if (scheduleData[dateStr]) {
                classes += "has-event ";
                // Use the type of the first event for the dot color
                const eventType = scheduleData[dateStr][0].type; 
                classes += `event-${eventType} `;
            }
            daysHtml += `<div class="${classes.trim()}" data-date="${dateStr}">${i}</div>`;
        }
        
        daysGrid.innerHTML = daysHtml;
    }

    function showScheduleDetail(dateStr) {
        const events = scheduleData[dateStr];
        if (!events) return;

        const dateObj = new Date(dateStr + 'T00:00:00');
        popupDateEl.innerText = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        let eventsHtml = '';
        events.forEach(event => {
            let borderColorClass = `border-${event.type}`;
            eventsHtml += `
                <div class="event-item ${borderColorClass}">
                    <h4>${event.subject}</h4>
                    <div class="event-detail"><i data-feather="clock"></i> ${event.time}</div>
                    <div class="event-detail"><i data-feather="user"></i> ${event.lecturer}</div>
                    <div class="event-detail"><i data-feather="file-text"></i> ${event.topic}</div>
                </div>
            `;
        });
        popupEventsEl.innerHTML = eventsHtml;
        feather.replace(); // Refresh icons inside the popup
        scheduleDetailPopup.classList.add('show');
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    daysGrid.addEventListener('click', (e) => {
        const dayElement = e.target.closest('.has-event');
        if (dayElement) {
            showScheduleDetail(dayElement.dataset.date);
        }
    });
    
    closeSchedulePopupBtn.addEventListener('click', () => {
        scheduleDetailPopup.classList.remove('show');
    });

    // Close popup if clicking outside the content
    scheduleDetailPopup.addEventListener('click', (e) => {
        if (e.target === scheduleDetailPopup) {
            scheduleDetailPopup.classList.remove('show');
        }
    });

});