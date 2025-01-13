import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

// Event listener untuk form submit
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the default form submission behavior

    // Capture the values from the form
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validasi sederhana
    if (!username || !password) {
        Swal.fire('Peringatan', 'Semua field wajib diisi!', 'warning');
        return;
    }

    // Create an object to hold the login credentials
    const credentials = {
        username: username,
        password: password
    };

    try {
        // Send a POST request to your backend login endpoint
        const response = await fetch('https://apkclaundry.vercel.app/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials) // Send the credentials in the request body
        });

        if (response.ok) {
            // If login is successful, get the response (which might include a token)
            const result = await response.json();

            // Example: Save the token to localStorage (if your backend returns a JWT token)
            localStorage.setItem('authToken', result.token);

            // Show success notification with SweetAlert
            await Swal.fire({
                title: 'Login Berhasil!',
                text: 'Anda akan diarahkan ke dashboard.',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            // Redirect to the dashboard or home page after successful login
            window.location.href = 'dashboard.html'; // You can change this to your desired page
        } else {
            // If the login failed, show an error message
            const error = await response.json();
            Swal.fire('Login Gagal', error.message || 'Periksa kembali username dan password Anda.', 'error');
        }
    } catch (err) {
        // If there's a network or other error, show an alert
        Swal.fire('Error', 'Terjadi kesalahan: ' + err.message, 'error');
    }
});

// Event listener untuk tombol kembali
document.getElementById('back-btn').addEventListener('click', function (e) {
    e.preventDefault(); // Mencegah default button behavior
    window.location.href = 'index.html'; // Redirect ke halaman LP.html
});
