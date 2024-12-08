// import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

function showMessage(message, type) {
    const messageBox = document.getElementById('message');
    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
    messageBox.style.display = 'block';

    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

function loginUser() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        showMessage('Please fill in all fields!', 'error');
        return;
    }

    // Ambil data pengguna dari local storage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Cari pengguna berdasarkan email dan password
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        showMessage('Login successful!', 'success');
        // Redirect ke halaman utama atau dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    } else {
        showMessage('Invalid email or password!', 'error');
    }
}

window.loginUser = loginUser;

document.getElementById('back-btn').addEventListener('click', function (e) {
    e.preventDefault(); // Mencegah default button behavior
    window.location.href = 'index.html'; // Redirect ke halaman LP.html
});