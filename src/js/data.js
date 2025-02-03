import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

const saveButton = document.getElementById("save-btn");
const customerForm = document.getElementById("customer-form");
const orderTableBody = document.querySelector("#order-table tbody");

// Fungsi untuk mendapatkan token dari localStorage
function getAuthToken() {
    const token = localStorage.getItem("authToken");
    console.log("Token retrieved from localStorage:", token); // Debug log
    if (!token) {
        Swal.fire({
            title: "Error!",
            text: "Token tidak ditemukan, silakan login kembali.",
            icon: "error",
            confirmButtonText: "Login",
        }).then(() => {
            window.location.href = "/login.html"; // Ganti dengan halaman login Anda
        });
        throw new Error("Token tidak ditemukan di localStorage.");
    }
    return token;
}

// Fungsi untuk mengambil semua pelanggan
async function getCustomers() {
    const token = getAuthToken();
    try {
        const response = await fetch('https://apkclaundry.vercel.app/customer', {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (response.status === 401) {
            Swal.fire('Unauthorized', 'Please log in to access this resource', 'warning').then(() => {
                window.location.href = '/login'; // Redirect to login page
            });
            return [];
        }
        if (response.status === 404) throw new Error('Data pelanggan tidak ditemukan');
        if (!response.ok) throw new Error('Gagal mengambil data pelanggan');
        const customers = await response.json();
        return customers;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', error.message, 'error');
        return [];
    }
}

// Fungsi untuk menambahkan pelanggan baru
async function addCustomer() {
    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const address = document.getElementById("customer-address").value.trim();
    const email = document.getElementById("customer-email").value.trim();

    if (!name || !phone || !address || !email) {
        Swal.fire('Peringatan', 'Semua field wajib diisi!', 'warning');
        return;
    }

    const token = getAuthToken();
    try {
        const response = await fetch('https://apkclaundry.vercel.app/customer', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, phone, address, email })
        });

        if (!response.ok) throw new Error('Gagal menambahkan pelanggan');
        Swal.fire('Sukses', 'Pelanggan berhasil ditambahkan!', 'success');
        displayCustomers();
        customerForm.reset();
    } catch (error) {
        console.error(error);
        Swal.fire('Error', error.message, 'error');
    }
}

// Fungsi untuk mengedit pelanggan
async function editCustomer(customerId) {
    console.log('Edit Customer ID:', customerId); // Debugging
    if (!customerId) {
        Swal.fire('Error', 'ID pelanggan tidak ditemukan', 'error');
        return;
    }

    const token = getAuthToken();
    try {
        const response = await fetch(`https://apkclaundry.vercel.app/customer-id?id=${customerId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) throw new Error('Gagal mengambil data pelanggan');
        
        const customer = await response.json();
        console.log('Customer data:', customer); // Debugging

        const { value: formValues } = await Swal.fire({
            title: 'Edit Data Pelanggan',
            html: `
                <input id="swal-name" class="swal2-input" value="${customer.name}" placeholder="Nama">
                <input id="swal-phone" class="swal2-input" value="${customer.phone}" placeholder="Telepon">
                <input id="swal-address" class="swal2-input" value="${customer.address}" placeholder="Alamat">
                <input id="swal-email" class="swal2-input" value="${customer.email}" placeholder="Email">
            `,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    name: document.getElementById('swal-name').value.trim(),
                    phone: document.getElementById('swal-phone').value.trim(),
                    address: document.getElementById('swal-address').value.trim(),
                    email: document.getElementById('swal-email').value.trim(),
                };
            }
        });

        if (formValues) {
            const updateResponse = await fetch(`https://apkclaundry.vercel.app/customer-id?id=${customerId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formValues)
            });

            if (!updateResponse.ok) throw new Error('Gagal memperbarui data pelanggan');
            Swal.fire('Sukses', 'Data pelanggan diperbarui!', 'success');
            displayCustomers();
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', error.message, 'error');
    }
}

// Fungsi untuk menghapus pelanggan
async function deleteCustomer(customerId) {
    console.log('Delete Customer ID:', customerId); // Debugging
    if (!customerId) {
        Swal.fire('Error', 'ID pelanggan tidak ditemukan', 'error');
        return;
    }

    const token = getAuthToken();
    try {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data pelanggan akan dihapus permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            const deleteResponse = await fetch(`https://apkclaundry.vercel.app/customer-id?id=${customerId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!deleteResponse.ok) {
                const errorMessage = await deleteResponse.text();
                Swal.fire('Error', errorMessage, 'error');
                return;
            }
            
            Swal.fire('Sukses', 'Data pelanggan berhasil dihapus!', 'success');
            displayCustomers();
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', error.message, 'error');
    }
}

// Fungsi untuk menampilkan data pelanggan di tabel
async function displayCustomers() {
    const customers = await getCustomers();
    console.log('Customers:', customers); // Debugging: pastikan atribut ID terlihat dengan nama yang benar

    orderTableBody.innerHTML = "";
    const orderList = document.querySelector('.order-list');
    orderList.innerHTML = ""; // Clear the mobile view list

    customers.forEach(customer => {
        console.log('Customer:', customer); // Debugging
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.phone}</td>
            <td>${customer.address}</td>
            <td>${customer.email}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editCustomer('${customer.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${customer.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        orderTableBody.appendChild(row);

        // Mobile view
        const listItem = document.createElement("div");
        listItem.classList.add("order-item");
        listItem.dataset.id = customer.id;
        listItem.innerHTML = `
            <p><strong>ID:</strong> ${customer.id}</p>
            <p><strong>Nama:</strong> ${customer.name}</p>
            <p><strong>Nomor Telepon:</strong> ${customer.phone}</p>
            <p><strong>Alamat:</strong> ${customer.address}</p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <div class="actions">
                <button class="btn btn-sm btn-warning" onclick="editCustomer('${customer.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${customer.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        orderList.appendChild(listItem);
    });
}

// Event listener untuk menambahkan pelanggan
saveButton.addEventListener("click", addCustomer);

// Tampilkan pelanggan saat halaman dimuat
document.addEventListener("DOMContentLoaded", displayCustomers);
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;

