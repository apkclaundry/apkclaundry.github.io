import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import {addCSS} from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

function isEmployeeIdUnique(id) {
  const employees = JSON.parse(localStorage.getItem('employees')) || [];
  return !employees.some((employee) => employee.id === id);
}

// Fungsi untuk menampilkan data karyawan
function displayEmployees() {
  const employeeTableBody = document.querySelector('#employee-table tbody');
  const employeeList = document.querySelector('.employee-list');
  const employees = JSON.parse(localStorage.getItem('employees')) || [];

  employeeTableBody.innerHTML = ''; // Reset tabel
  employeeList.innerHTML = ''; // Reset list

  employees.forEach((employee) => {
    // Menambahkan data ke dalam tabel
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${employee.id}</td>
      <td>${employee.name}</td>
      <td>${employee.role}</td>
      <td class="actions">
        <button class="edit" onclick="editEmployee('${employee.id}')">&#9998;</button>
        <button class="delete" onclick="deleteEmployee('${employee.id}')">&#128465;</button>
      </td>
    `;
    employeeTableBody.appendChild(row);

    // Menambahkan data ke dalam list untuk tampilan mobile
    const listItem = document.createElement('div');
    listItem.classList.add('employee-item');
    listItem.innerHTML = `
      <p><strong>ID Karyawan:</strong> ${employee.id}</p>
      <p><strong>Nama Karyawan:</strong> ${employee.name}</p>
      <p><strong>Role:</strong> ${employee.role}</p>
      <div class="actions">
        <button class="edit" onclick="editEmployee('${employee.id}')">&#9998;</button>
        <button class="delete" onclick="deleteEmployee('${employee.id}')">&#128465;</button>
      </div>
    `;
    employeeList.appendChild(listItem);
  });
}

function deleteEmployee(id) {
  const employees = JSON.parse(localStorage.getItem('employees')) || [];

  Swal.fire({
    title: 'Anda yakin?',
    text: "Data karyawan ini akan dihapus!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      const updatedEmployees = employees.filter((employee) => employee.id !== id);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      displayEmployees();
      Swal.fire('Dihapus!', 'Data karyawan telah dihapus.', 'success');
    }
  });
}

function editEmployee(id) {
  const employees = JSON.parse(localStorage.getItem('employees')) || [];
  const employee = employees.find((employee) => employee.id === id);

  Swal.fire({
    title: 'Edit Karyawan',
    html: `
      <input id="swal-input-id" class="swal2-input" placeholder="ID Karyawan" value="${employee.id}" disabled>
      <input id="swal-input-name" class="swal2-input" placeholder="Nama Karyawan" value="${employee.name}">
      <select id="swal-input-role" class="swal2-input">
        <option value="Laundry Cleaner" ${employee.role === 'Laundry Cleaner' ? 'selected' : ''}>Laundry Cleaner</option>
        <option value="Laundry Iron" ${employee.role === 'Laundry Iron' ? 'selected' : ''}>Laundry Iron</option>
        <option value="Laundry Kurir" ${employee.role === 'Laundry Kurir' ? 'selected' : ''}>Laundry Kurir</option>
        <option value="Laundry Kasir" ${employee.role === 'Laundry Kasir' ? 'selected' : ''}>Laundry Kasir</option>
      </select>
    `,
    focusConfirm: false,
    preConfirm: () => {
      const name = document.getElementById('swal-input-name').value.trim();
      const role = document.getElementById('swal-input-role').value;

      if (name && role) {
        employee.name = name;
        employee.role = role;
        localStorage.setItem('employees', JSON.stringify(employees));
        displayEmployees();
      } else {
        Swal.showValidationMessage('Mohon lengkapi data!');
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const employeeForm = document.getElementById('employee-form');

  employeeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('employee-id').value.trim();
    const name = document.getElementById('employee-name').value.trim();
    const role = document.getElementById('employee-role').value;

    if (!id || !name || !role) {
      alert('Mohon lengkapi semua data!');
      return;
    }

    if (!isEmployeeIdUnique(id)) {
      alert('ID Karyawan sudah digunakan. Mohon gunakan ID yang berbeda!');
      return;
    }

    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    employees.push({ id, name, role });
    localStorage.setItem('employees', JSON.stringify(employees));
    displayEmployees();
    employeeForm.reset();
  });

  displayEmployees();
});

window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
