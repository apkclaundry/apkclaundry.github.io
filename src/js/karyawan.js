import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

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

// Fungsi untuk menampilkan data karyawan
async function fetchEmployees() {
  const token = getAuthToken();

  try {
    console.log("Fetching employees with token:", token);

    const response = await fetch("https://apkclaundry.vercel.app/employee", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Menggunakan token yang benar
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const employees = await response.json();
    console.log("Employees fetched:", employees);
    displayEmployees(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    Swal.fire({
      title: "Error!",
      text: "Gagal mengambil data karyawan.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

// Fungsi untuk menampilkan data ke tabel atau list
function displayEmployees(employees) {
  const employeeTableBody = document.querySelector("#employee-table tbody");
  const employeeList = document.querySelector(".employee-list");

  if (!employeeTableBody || !employeeList) {
    console.error("Tabel atau daftar karyawan tidak ditemukan di DOM.");
    return;
  }

  employeeTableBody.innerHTML = ""; // Reset tabel
  employeeList.innerHTML = ""; // Reset list

  employees.forEach((employee) => {
    // Menambahkan data ke tabel
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${employee.id}</td>
      <td>${employee.username}</td>
      <td>${employee.role}</td>
      <td>${employee.phone}</td>
      <td>${employee.address}</td>
      <td>${new Date(employee.hired_date).toLocaleDateString()}</td>
      <td class="actions">
        <button class="edit" onclick="editEmployee('${employee.id}')">&#9998;</button>
        <button class="delete" onclick="deleteEmployee('${employee.id}')">&#128465;</button>
      </td>
    `;
    employeeTableBody.appendChild(row);

    // Menambahkan data ke dalam list untuk tampilan mobile
    const listItem = document.createElement("div");
    listItem.classList.add("employee-item");
    listItem.innerHTML = `
      <p><strong>ID Karyawan:</strong> ${employee.id}</p>
      <p><strong>Nama Karyawan:</strong> ${employee.username}</p>
      <p><strong>Role:</strong> ${employee.role}</p>
      <div class="actions">
        <button class="edit" onclick="editEmployee('${employee.id}')">&#9998;</button>
        <button class="delete" onclick="deleteEmployee('${employee.id}')">&#128465;</button>
      </div>
    `;
    employeeList.appendChild(listItem);
  });
}

// Fungsi lainnya seperti editEmployee, deleteEmployee, searchEmployees tetap sama...


// Fungsi untuk mengedit data karyawan
async function editEmployee(id) {
  const token = getAuthToken();

  try {
    const response = await fetch(`https://apkclaundry.vercel.app/employee/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data karyawan.");
    }

    const employee = await response.json();

    Swal.fire({
      title: "Edit Karyawan",
      html: `
        <input id="swal-input-id" class="swal2-input" value="${employee.id}" disabled>
        <input id="swal-input-name" class="swal2-input" value="${employee.username}">
        <select id="swal-input-role" class="swal2-input">
          <option value="admin" ${employee.role === "admin" ? "selected" : ""}>Admin</option>
          <option value="Laundry Cleaner" ${employee.role === "Laundry Cleaner" ? "selected" : ""}>Laundry Cleaner</option>
          <option value="Laundry Iron" ${employee.role === "Laundry Iron" ? "selected" : ""}>Laundry Iron</option>
          <option value="Laundry Kurir" ${employee.role === "Laundry Kurir" ? "selected" : ""}>Laundry Kurir</option>
          <option value="Laundry Kasir" ${employee.role === "Laundry Kasir" ? "selected" : ""}>Laundry Kasir</option>
        </select>
      `,
      focusConfirm: false,
      preConfirm: async () => {
        const name = document.getElementById("swal-input-name").value.trim();
        const role = document.getElementById("swal-input-role").value;

        if (!name || !role) {
          Swal.showValidationMessage("Mohon lengkapi data!");
          return;
        }

        try {
          const updateResponse = await fetch(`https://apkclaundry.vercel.app/employee/${id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: name, role }),
          });

          if (!updateResponse.ok) {
            throw new Error("Gagal memperbarui data karyawan.");
          }

          Swal.fire("Berhasil!", "Data karyawan berhasil diperbarui.", "success");
          fetchEmployees(); // Refresh data
        } catch (error) {
          console.error("Error updating employee:", error);
          Swal.fire("Error!", "Gagal memperbarui data karyawan.", "error");
        }
      },
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    Swal.fire({
      title: "Error!",
      text: "Gagal mengambil data karyawan.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

// Fungsi untuk menghapus karyawan
async function deleteEmployee(id) {
  const token = getAuthToken();

  Swal.fire({
    title: "Anda yakin?",
    text: "Data karyawan ini akan dihapus!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    reverseButtons: true,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`https://apkclaundry.vercel.app/employee/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        Swal.fire("Dihapus!", "Data karyawan telah dihapus.", "success");
        fetchEmployees(); // Refresh data
      } catch (error) {
        console.error("Error deleting employee:", error);
        Swal.fire({
          title: "Error!",
          text: "Gagal menghapus data karyawan.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  });
}

// Fungsi untuk pencarian karyawan
function searchEmployees() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) {
    console.error("Input pencarian tidak ditemukan.");
    return;
  }

  const searchValue = searchInput.value.toLowerCase();
  const employeeRows = document.querySelectorAll("#employee-table tbody tr");

  employeeRows.forEach((row) => {
    const username = row.cells[1].textContent.toLowerCase();
    if (username.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Event listener pada DOM
document.addEventListener("DOMContentLoaded", () => {
  const employeeForm = document.getElementById("employee-form");
  const searchInput = document.getElementById("search-input");

  if (!employeeForm) {
    console.error("Form karyawan tidak ditemukan.");
    return;
  }

  employeeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    const id = document.getElementById("employee-id").value.trim();
    const name = document.getElementById("employee-name").value.trim();
    const role = document.getElementById("employee-role").value;

    if (!id || !name || !role) {
      Swal.fire({
        title: "Peringatan!",
        text: "Mohon lengkapi semua data!",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await fetch("https://apkclaundry.vercel.app/employee", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, username: name, role }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      Swal.fire("Berhasil!", "Data karyawan berhasil ditambahkan.", "success");
      fetchEmployees(); // Refresh data
      employeeForm.reset();
    } catch (error) {
      console.error("Error adding employee:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal menambahkan data karyawan.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  });

  if (searchInput) {
    searchInput.addEventListener("input", searchEmployees);
  }

  fetchEmployees(); // Ambil data karyawan saat halaman dimuat
});

window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
