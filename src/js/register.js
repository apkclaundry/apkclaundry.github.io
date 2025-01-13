import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

// Event listener untuk tombol sign up
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Mencegah submit form secara default

    // Menampilkan notifikasi
    Swal.fire('Registrasi Gagal', 'Anda Harus Menjadi Admin', 'error');
});

// Event listener untuk tombol kembali
document.getElementById('back-btn').addEventListener('click', function (e) {
    e.preventDefault(); // Mencegah default button behavior
    window.location.href = 'index.html'; // Redirect ke halaman index.html
});
