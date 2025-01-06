// Event listener untuk form login
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Mencegah perilaku default form submission

    // Mengambil nilai dari input username dan password
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validasi input
    if (!username || !password) {
        alert('Username dan password harus diisi!');
        return;
    }

    // Membuat objek kredensial
    const credentials = {
        username: username,
        password: password
    };

    try {
        // Mengirim permintaan POST ke endpoint login backend
        const response = await fetch('https://apkclaundry.vercel.app/login  ', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials) // Mengirim kredensial dalam body request
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

// Event listener untuk tombol kembali ke menu utama
document.getElementById('back-btn').addEventListener('click', function (e) {
    e.preventDefault(); // Mencegah perilaku default button
    window.location.href = 'index.html'; // Redirect ke halaman utama
});
