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
        // Di sini Anda akan menambahkan logika register yang sebenarnya
        // Untuk sekarang, kita langsung ke sukses
        registerScreen.classList.remove('active');
        successPopup.classList.add('show');
    });

    closePopupBtn.addEventListener('click', () => {
        successPopup.classList.remove('show');
        setTimeout(() => {
            mainAppScreen.classList.add('active');
            // Muat data dashboard
            getWeather();
            renderCalendar(); 
            renderWeeklySummary(currentDate); // BARU: Render rekapan mingguan
        }, 500);
    });
    
    // --- BARU: LOGIKA TOMBOL KELUAR (LOGOUT) ---
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Sembunyikan semua layar dan popup
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.popup-overlay').forEach(p => p.classList.remove('show'));
        
        // Tampilkan splash screen lagi, lalu login
        splashScreen.classList.add('active');
        setTimeout(() => {
            splashScreen.classList.remove('active');
            loginScreen.classList.add('active');
        }, 1500); // Waktu lebih singkat untuk logout
    });

    // --- LOGIKA UTAMA APLIKASI (SETELAH LOGIN) ---

    // ELEMEN APLIKASI UTAMA
    const sidebarMenu = document.getElementById('sidebar-menu');
    const pages = document.querySelectorAll('.page');
    const notificationBellWrapper = document.querySelector('.notification-bell-wrapper');
    const notificationPanel = document.getElementById('notification-panel');
    const sesiFokusBtn = document.getElementById('sesi-fokus-btn'); // BARU
    const yumeWelcomePopup = document.getElementById('yume-welcome-popup'); // BARU
    const yumeSalamKenalBtn = document.getElementById('yume-salam-kenal-btn'); // BARU

    // NAVIGASI HALAMAN (SIDEBAR)
    sidebarMenu.addEventListener('click', (e) => {
        e.preventDefault();
        const navItem = e.target.closest('.nav-item');
        if (!navItem) return;
        
        // --- BARU: Logika untuk tombol Keluar di-handle terpisah ---
        if (navItem.id === 'logout-btn') return; 

        const pageId = navItem.dataset.page;
        if (!pageId) return;

        navigateToPage(pageId);
    });
    
    // --- BARU: Fungsi untuk navigasi dan memicu event halaman ---
    function navigateToPage(pageId) {
        // Hapus kelas 'active' dari semua menu item dan halaman
        sidebarMenu.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));

        // Tambahkan kelas 'active' ke menu item dan halaman yang diklik
        const activeNavItem = sidebarMenu.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        document.getElementById(`${pageId}-page`).classList.add('active');
        
        // --- BARU: Logika khusus saat halaman diaktifkan ---
        if (pageId === 'yume') {
            checkFirstTimeYume();
        } else if (pageId === 'schedule') {
            renderCalendar(); // Render ulang kalender jika dibuka
            renderWeeklySummary(currentDate);
        } else if (pageId === 'nilai') {
            renderNilaiPage(); // Render grafik nilai
        } else if (pageId === 'materi') {
            initMateriPage(); // Inisialisasi pop-up materi
        }
    }
    
    // --- BARU: Logika "Mulai Sesi Fokus" ---
    sesiFokusBtn.addEventListener('click', () => {
        navigateToPage('yume');
    });

    // --- BARU: Logika Pop-up Yume ---
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

    // --- LOGIKA CUACA (DIPERBARUI) ---
    function getWeather() {
        const weatherIconEl = document.getElementById('weather-icon'),
              locationEl = document.getElementById('weather-location'),
              tempEl = document.getElementById('weather-temp'),
              descEl = document.getElementById('weather-desc');
        
        // PENTING: Anda perlu API Key dari layanan cuaca (mis: OpenWeatherMap, WeatherAPI)
        const API_KEY = 'GANTI_DENGAN_API_KEY_ANDA'; // <-- Ganti ini!
        const KOTA = 'Balikpapan'; // Bisa juga diganti berdasarkan geolokasi

        // URL Contoh (menggunakan WeatherAPI.com)
        const API_URL = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${KOTA}&aqi=no&lang=id`;

        /*
        // --- INI ADALAH KODE UNTUK MEMANGGIL API LIVE ---
        // (Dikomenti agar tidak error karena API Key belum ada)

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                const API_URL_GEO = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=no&lang=id`;
                
                fetch(API_URL_GEO)
                    .then(response => response.json())
                    .then(data => {
                        locationEl.textContent = `${data.location.name}, ${data.location.region}`;
                        tempEl.textContent = `${data.current.temp_c}°C`;
                        descEl.textContent = data.current.condition.text;
                        
                        // Mapping ikon (contoh)
                        const iconCode = data.current.condition.icon;
                        if (iconCode.includes('rain')) {
                            weatherIconEl.innerHTML = '<i data-feather="cloud-rain"></i>';
                        } else if (iconCode.includes('cloud')) {
                            weatherIconEl.innerHTML = '<i data-feather="cloud"></i>';
                        } else if (iconCode.includes('sun')) {
                            weatherIconEl.innerHTML = '<i data-feather="sun"></i>';
                        } else {
                            weatherIconEl.innerHTML = '<i data-feather="cloud-sun"></i>';
                        }
                        feather.replace();
                    })
                    .catch(err => {
                        console.error("Error fetching weather:", err);
                        setDummyWeather();
                    });

            }, () => {
                // Jika geolokasi ditolak, gunakan data dummy
                setDummyWeather('Lokasi tidak diizinkan');
            });
        } else {
            // Jika browser tidak support geolokasi
            setDummyWeather('Browser tidak support');
        }
        */

        // --- HAPUS FUNGSI DI BAWAH INI JIKA API LIVE SUDAH AKTIF ---
        // Fungsi dummy sementara (menggantikan yang lama)
        setDummyWeather(); 
    }
    
    function setDummyWeather(errorMsg = null) {
        const weatherIconEl = document.getElementById('weather-icon'),
              locationEl = document.getElementById('weather-location'),
              tempEl = document.getElementById('weather-temp'),
              descEl = document.getElementById('weather-desc');
              
        if (errorMsg) {
            locationEl.textContent = errorMsg;
            tempEl.textContent = '-°C';
            weatherIconEl.innerHTML = '<i data-feather="slash"></i>';
        } else {
            // Data dummy jika fetch gagal atau belum disetup
            locationEl.textContent = 'Jakarta, ID';
            tempEl.textContent = '29°C';
            descEl.textContent = 'Cerah Berawan';
            weatherIconEl.innerHTML = '<i data-feather="cloud-sun"></i>';
        }
        feather.replace();
    }
    
    // --- BARU: LOGIKA AI CHAT (GEMINI) ---
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

        // 1. Tampilkan pesan user
        appendMessage(messageText, 'sent', 'yume-chat-messages');
        yumeChatInput.value = '';

        // 2. Tampilkan loading
        appendMessage('Yume sedang berpikir...', 'received loading', 'yume-chat-messages');

        // 3. Panggil Backend (bukan Gemini langsung!)
        // PENTING: Anda TIDAK BISA memanggil API Gemini langsung dari sini.
        // Anda harus membuat backend (misal: Node.js, Python Flask)
        // Backend Anda akan menerima pesan ini, lalu memanggil API Gemini
        // dengan API Key Anda secara aman, lalu mengembalikan responnya.
        
        // fetch('https://URL_BACKEND_ANDA.com/chat', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ prompt: messageText })
        // })
        // .then(res => res.json())
        // .then(data => {
        //     // Hapus loading
        //     yumeChatMessages.querySelector('.loading').remove();
        //     // Tampilkan respon AI
        //     appendMessage(data.response, 'received', 'yume-chat-messages');
        // })
        
        // --- HAPUS INI JIKA BACKEND SUDAH ADA ---
        // Respon dummy sementara
        setTimeout(() => {
            yumeChatMessages.querySelector('.loading').remove();
            const dummyResponse = "Maaf, koneksi ke otak Yume sedang sibuk! (Backend belum terhubung). Tapi jika terhubung, Yume akan menjawab: '" + messageText + "'.";
            appendMessage(dummyResponse, 'received', 'yume-chat-messages');
        }, 1500);
        // --- ----------------------------- ---
    }
    
    function appendMessage(text, type, containerId) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', ...type.split(' '));
        messageDiv.innerHTML = `<p>${text}</p>`;
        const container = document.getElementById(containerId);
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight; // Auto scroll
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
    const weeklySummaryContent = document.getElementById('weekly-summary-content'); // BARU
    
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
        let startDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // 0=Sen, 6=Min
        for (let i = startDay; i > 0; i--) {
            daysHtml += `<div class="inactive">${lastDateOfLastMonth - i + 1}</div>`;
        }
        
        // Loop untuk hari di bulan ini
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayOfWeek = new Date(year, month, i).getDay(); // 0=Min, 6=Sab
            
            let classes = "";
            let today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                classes += "today ";
            }

            let eventType = null;
            if (scheduleData[dateStr]) {
                // Jika ada data, gunakan tipe event pertama
                eventType = scheduleData[dateStr][0].type;
            } else if (dayOfWeek === 0 || dayOfWeek === 6) {
                // BARU: Jika Sabtu (6) atau Minggu (0) DAN tidak ada event lain
                eventType = 'libur'; // Tandai sebagai 'libur'
                classes += "has-event "; // Tambahkan class agar titik muncul
            }
            
            if (eventType) {
                classes += `has-event event-${eventType} `;
            }
            
            daysHtml += `<div class="${classes.trim()}" data-date="${dateStr}">${i}</div>`;
        }
        
        daysGrid.innerHTML = daysHtml;
    }
    
    // --- BARU: Fungsi untuk Render Rekapan Mingguan ---
    function renderWeeklySummary(date) {
        let html = '';
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1)); // Mulai dari Senin

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            
            const dayName = days[currentDay.getDay()];
            // Abaikan Sabtu dan Minggu di rekapan
            if (currentDay.getDay() === 0 || currentDay.getDay() === 6) continue;
            
            const dateStr = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
            const events = scheduleData[dateStr];
            
            html += `<div class="summary-day"><h5>${dayName}, ${currentDay.getDate()}</h5>`;
            
            if (events && events.some(e => e.type === 'matkul')) {
                events.filter(e => e.type === 'matkul').forEach(event => {
                    html += `
                        <div class="summary-item">
                            <span class="summary-time">${event.time.split(' - ')[0]}</span>
                            <div class="summary-details">
                                <div class="summary-subject">${event.subject}</div>
                                <div class="summary-lecturer">${event.lecturer}</div>
                            </div>
                        </div>
                    `;
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

        // Jika tidak ada event DAN bukan Sabtu/Minggu, jangan tampilkan popup
        if (!events && dayOfWeek !== 0 && dayOfWeek !== 6) return;

        const dateObj = new Date(dateStr + 'T00:00:00');
        popupDateEl.innerText = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        let eventsHtml = '';
        if (events) {
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
        } else if (dayOfWeek === 0 || dayOfWeek === 6) {
            // Tampilkan pesan libur jika Sabtu/Minggu
             eventsHtml = `
                <div class="event-item border-libur">
                    <h4>Libur Akhir Pekan</h4>
                    <div class="event-detail"><i data-feather="coffee"></i> Waktunya istirahat!</div>
                </div>
            `;
        }
        
        popupEventsEl.innerHTML = eventsHtml;
        feather.replace(); // Refresh icons inside the popup
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
    
    
    // --- BARU: LOGIKA HALAMAN MATERI (POPUP) ---
    const materiDetailPopup = document.getElementById('materi-detail-popup');
    const closeMateriPopupBtn = document.getElementById('close-materi-popup-btn');
    
    function initMateriPage() {
        document.querySelectorAll('.materi-card').forEach(card => {
            card.addEventListener('click', () => {
                // Di sini Anda akan mengambil data asli
                // Untuk sekarang, kita tampilkan popup-nya saja
                materiDetailPopup.classList.add('show');
            });
        });
    }
    
    closeMateriPopupBtn.addEventListener('click', () => {
        materiDetailPopup.classList.remove('show');
    });
    
    // Logika Tab di Pop-up Materi
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

    // --- BARU: LOGIKA HALAMAN NILAI (CHART) ---
    let nilaiChart = null;
    function renderNilaiPage() {
        const ctx = document.getElementById('nilai-chart').getContext('2d');
        
        // Data dummy
        const data = {
            labels: ['Kehadiran (5%)', 'Kuis (30%)', 'UTS (30%)', 'UAS (35%)'],
            datasets: [{
                label: 'Nilai Anda',
                data: [100, 85, 78, 90], // Nilai (0-100)
                backgroundColor: [
                    'rgba(217, 70, 111, 0.2)',
                    'rgba(30, 42, 120, 0.2)',
                    'rgba(255, 190, 11, 0.2)',
                    'rgba(42, 157, 143, 0.2)'
                ],
                borderColor: [
                    'rgba(217, 70, 111, 1)',
                    'rgba(30, 42, 120, 1)',
                    'rgba(255, 190, 11, 1)',
                    'rgba(42, 157, 143, 1)'
                ],
                borderWidth: 1
            }]
        };

        // Hancurkan chart lama jika ada, agar tidak tumpang tindih
        if (nilaiChart) {
            nilaiChart.destroy();
        }

        // Buat chart baru
        nilaiChart = new Chart(ctx, {
            type: 'bar', // Anda bisa ganti ke 'pie' atau 'doughnut'
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // --- BARU: LOGIKA HALAMAN PENGATURAN ---
    const themePinkBtn = document.getElementById('theme-pink-btn');
    const themeGreenBtn = document.getElementById('theme-green-btn');
    const themeBlueBtn = document.getElementById('theme-blue-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    
    const themeButtons = [themePinkBtn, themeGreenBtn, themeBlueBtn];
    
    // Palet Tema
    const themes = {
        pink: {
            '--color-primary': '#D9466F',
            '--color-primary-light': '#FFF0F6',
            '--color-primary-extra-light': '#FADADD',
        },
        green: {
            '--color-primary': '#A9C96D', // Kuning-hijau
            '--color-primary-light': '#F6FAE0',
            '--color-primary-extra-light': '#E9F5C7',
        },
        blue: {
            '--color-primary': '#5B86E5',
            '--color-primary-light': '#EBF0FF',
            '--color-primary-extra-light': '#D6E0FF',
        }
    };
    
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const themeName = btn.dataset.theme;
            const themeColors = themes[themeName];
            
            // Terapkan warna
            for (const [key, value] of Object.entries(themeColors)) {
                document.documentElement.style.setProperty(key, value);
            }
            
            // Update tombol aktif
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    deleteAccountBtn.addEventListener('click', () => {
        const confirmation = confirm("APAKAH ANDA YAKIN? Menghapus akun bersifat permanen dan tidak dapat dibatalkan. Semua data Anda akan hilang.");
        if (confirmation) {
            // PENTING: Di sinilah Anda memanggil backend untuk menghapus data user.
            // fetch('https://URL_BACKEND_ANDA.com/delete-account', { method: 'DELETE' })
            // .then(...)
            
            alert("Akun Anda telah dihapus.");
            // Paksa logout
            logoutBtn.click();
        }
    });

});