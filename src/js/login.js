// Pastikan script dijalankan setelah DOM dimuat sepenuhnya
document.addEventListener('DOMContentLoaded', function () {
    // Event listener untuk tombol login
    const loginBtn = document.getElementById('login-btn');
    const backBtn = document.getElementById('back-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', async function () {
            // Mengambil nilai dari input email dan password
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Validasi input
            if (!email || !password) {
                alert('Email dan password harus diisi!');
                return;
            }

            // Membuat objek kredensial
            const credentials = {
                email: email,
                password: password
            };

            try {
                // Mengirim permintaan POST ke endpoint login backend
                const response = await fetch('https://apkclaundry.vercel.app/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });

                if (response.ok) {
                    // Jika login berhasil, simpan token dan redirect
                    const result = await response.json();
                    localStorage.setItem('authToken', result.token);
                    alert('Login berhasil!');

                    // Redirect ke halaman dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    // Jika login gagal, tampilkan pesan kesalahan
                    const error = await response.json();
                    alert('Login gagal: ' + error.message);
                }
            } catch (err) {
                // Jika terjadi kesalahan jaringan atau lainnya
                alert('Terjadi kesalahan: ' + err.message);
            }
        });
    }

    // Event listener untuk tombol kembali ke menu utama
    if (backBtn) {
        backBtn.addEventListener('click', function (e) {
            e.preventDefault(); // Mencegah perilaku default button
            window.location.href = 'index.html'; // Redirect ke halaman utama
        });
    }
});
