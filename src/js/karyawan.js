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
    console.log('Hired Date:', employee.hired_date);  // Tambahkan log ini

    const formattedSalary = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(employee.salary);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${employee.id}</td>
      <td>${employee.username}</td>
      <td>${employee.role}</td>
      <td>${employee.phone}</td>
      <td>${employee.address}</td>

      <td>${formattedSalary}</td>
      <td>${employee.salary_date}</td>
      <td class="actions">
        <button class="salary" onclick="addSalary('${employee.id}')">💰</button>
        <button class="edit" onclick="editEmployee('${employee.id}')">&#9998;</button>
        <button class="delete" onclick="deleteEmployee('${employee.id}')">&#128465;</button>
      </td>
    `;
    employeeTableBody.appendChild(row);
//      <td>${employee.hired_date ? new Date(employee.hired_date.trim()).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</td>
    // Menambahkan data ke dalam list untuk tampilan mobile
    const listItem = document.createElement("div");
    listItem.classList.add("employee-item");
    listItem.innerHTML = `
      <p><strong>ID Karyawan:</strong> ${employee.id}</p>
      <p><strong>Nama Karyawan:</strong> ${employee.username}</p>
      <p><strong>Role:</strong> ${employee.role}</p>
      <p><strong>Tanggal Rekrutment :</strong> ${new Date(employee.hired_date).toLocaleDateString()}</p>     
      <p><strong>Gaji bulan ini:</strong> ${formattedSalary}</p>
      <div class="actions">
        <button class="salary" onclick="addSalary('${employee.id}')">💰</button>
        <button class="edit" onclick="editEmployee('${employee.id}')">&#9998;</button>
        <button class="delete" onclick="deleteEmployee('${employee.id}')">&#128465;</button>
      </div>
    `;
    employeeList.appendChild(listItem);
  });
}

// Fungsi untuk menambahkan atau mengupdate salary karyawan
async function addSalary(id) {
  const token = getAuthToken();

  try {
    const getResponse = await fetch(`https://apkclaundry.vercel.app/employee-id?id=${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!getResponse.ok) {
      throw new Error("Gagal mengambil data karyawan.");
    }

    const employee = await getResponse.json();
    localStorage.setItem("employeeData", JSON.stringify(employee));

    const { value: salary } = await Swal.fire({
      title: "Masukkan Gaji Karyawan",
      input: "number",
      inputLabel: "Gaji (Rp)",
      inputPlaceholder: "Masukkan jumlah gaji",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return "Gaji harus lebih dari 0!";
        }
      },
    });

    if (salary) {
      const storedEmployee = JSON.parse(localStorage.getItem("employeeData"));
      const updatedData = {
        username: storedEmployee.username,
        role: storedEmployee.role,
        phone: storedEmployee.phone,
        address: storedEmployee.address,
        salary: Number(salary),
        salary_date: new Date().toISOString() // Menambahkan tanggal update salary dalam format yang benar
      };

      const response = await fetch(`https://apkclaundry.vercel.app/employee-id?id=${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          title: "Berhasil!",
          text: result.message,
          icon: "success",
          confirmButtonText: "OK"
        }).then(() => {
          window.location.href = "karyawan.html"; // Redirect ke halaman karyawan setelah update
        });
      } else {
        throw new Error(result.message || "Gagal memperbarui gaji.");
      }
    }
  } catch (error) {
    console.error("Error updating salary:", error);
    Swal.fire("Error!", "Gagal memperbarui gaji.", "error");
  }
}


// Event listener untuk memuat data
document.addEventListener("DOMContentLoaded", () => {
  fetchEmployees(); // Ambil data karyawan saat halaman dimuat
});

// Fungsi untuk mengedit data karyawan
async function editEmployee(id) {
  const token = getAuthToken();

  try {
    const response = await fetch(`https://apkclaundry.vercel.app/employee-id?id=${id}`, {
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
        <label for="swal-input-name">Nama Karyawan</label>
        <input id="swal-input-name" class="swal2-input" value="${employee.username}">
        <label for="swal-input-phone">Nomor Telepon</label>
        <input id="swal-input-phone" class="swal2-input" value="${employee.phone}">
        <label for="swal-input-address">Alamat</label>
        <input id="swal-input-address" class="swal2-input" value="${employee.address}">
        <label for="swal-input-role">Role</label>
        <select id="swal-input-role" class="swal2-input">
          <option value="admin" ${employee.role === "admin" ? "selected" : ""}>Admin</option>
          <option value="Laundry Cleaner" ${employee.role === "Laundry Cleaner" ? "selected" : ""}>Laundry Cleaner</option>
          <option value="Laundry Iron" ${employee.role === "Laundry Iron" ? "selected" : ""}>Laundry Iron</option>
          <option value="Laundry Kurir" ${employee.role === "Laundry Kurir" ? "selected" : ""}>Laundry Kurir</option>
          <option value="Laundry Kasir" ${employee.role === "Laundry Kasir" ? "selected" : ""}>Laundry Kasir</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: async () => {
        const username = document.getElementById("swal-input-name").value.trim();
        const phone = document.getElementById("swal-input-phone").value.trim();
        const address = document.getElementById("swal-input-address").value.trim();
        const role = document.getElementById("swal-input-role").value;

        if (!username || !phone || !address || !role) {
          Swal.showValidationMessage("Semua bidang harus diisi!");
          return false;
        }

        try {
          const updateResponse = await fetch(`https://apkclaundry.vercel.app/employee-id?id=${id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, phone, address, role }),
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
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`https://apkclaundry.vercel.app/employee-id?id=${id}`, {
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

// Event listener untuk memuat data
document.addEventListener("DOMContentLoaded", () => {
  const employeeForm = document.getElementById("employee-form");

  if (!employeeForm) {
    console.error("Form karyawan tidak ditemukan.");
    return;
  }

  employeeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    const name = document.getElementById("employee-name").value.trim();
    const phone = document.getElementById("employee-phone").value.trim();
    const address = document.getElementById("employee-address").value.trim();
    const role = document.getElementById("employee-role").value;
    const password = document.getElementById("employee-password").value.trim();

    if (!name || !phone || !address || !role || !password) {
      Swal.fire({
        title: "Peringatan!",
        text: "Mohon lengkapi semua data!",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await fetch("https://apkclaundry.vercel.app/Register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: name, phone, address, role, password }),
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

window.addSalary = addSalary;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
