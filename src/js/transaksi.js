document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id'); // Ambil ID dari URL

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.id === parseInt(orderId)); // Cari pesanan berdasarkan ID

  if (order) {
    // Tampilkan detail pesanan
    document.getElementById('customer-name').textContent = order.name;
    document.getElementById('customer-phone').textContent = order.phone;
    document.getElementById('service-type').textContent = order.service;
    document.getElementById('weight').textContent = order.weight;
    document.getElementById('total-price').textContent = order.totalPrice;
    document.getElementById('order-date').textContent = order.date;

    // Menambahkan event listener untuk tombol konfirmasi pembayaran
    document.getElementById('confirm-payment').addEventListener('click', function() {
      // Update status pembayaran menjadi 'Paid'
      order.isPaid = true;

      // Simpan kembali pesanan yang sudah diperbarui ke localStorage
      localStorage.setItem('orders', JSON.stringify(orders));

      // Tampilkan notifikasi sukses
      Swal.fire('Pembayaran Berhasil', 'Status pembayaran telah diubah menjadi Paid.', 'success').then(() => {
        // Setelah pembayaran berhasil, arahkan kembali ke halaman dashboard
        window.location.href = 'index.html'; // Ganti dengan nama file halaman dashboard yang sesuai
      });
    });
  } else {
    Swal.fire('Error', 'Data transaksi tidak ditemukan.', 'error').then(() => {
      window.location.href = 'index.html'; // Arahkan kembali ke halaman dashboard jika ID tidak ditemukan
    });
  }
});
