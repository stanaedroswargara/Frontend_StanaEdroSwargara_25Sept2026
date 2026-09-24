# 📋 Kanban Task Management Board

> **Frontend Developer Take Home Test - Adhivasindo**  
> Created by: **Stana Edro Swargara**

Aplikasi Manajemen Tugas (Kanban Board) interaktif berbasis **Ionic React + Vite + TypeScript + Zustand + @dnd-kit**. Aplikasi ini dirancang dengan antarmuka modern, bebas emoji hardcode (menggunakan ikon SVG presisi), responsif, serta dilengkapi fitur CRUD lengkap, manajemen tim, filter presisi, ekspor/impor JSON, dan notifikasi toast kustom.

---

## ✨ Fitur Utama

### 1. 📊 Tampilan Papan & Kolom (Board & Columns)
- **5 Kolom Standar**: `To Do`, `Doing`, `Review`, `Done`, dan `Rework`.
- **Manajemen Kolom Dinamis**: Tambah kolom baru, ubah nama kolom, atau hapus kolom beserta tugas di dalamnya.
- **Nama Perusahaan / Board Dinamis**: Klik langsung pada nama papan di header (default: *Adhivasindo*) untuk mengedit nama perusahaan secara inline.

### 2. 📇 Kartu Tugas (Task Cards) & Drag & Drop
- **Task Card**: Menampilkan Judul, Deskripsi singkat, Avatar & Inisial Assignee, Due Date, Chip Label warna, Chip Prioritas, Indikator Progress Subtask, Gambar Cover, dan Jumlah Lampiran.
- **Drag & Drop Interaktif**: Pindahkan tugas antar kolom secara presisi menggunakan library `@dnd-kit` lengkap dengan *Drag Overlay*.

### 3. ⚙️ Modal Tugas Lengkap (Task Modal)
- **Panel Kiri**:
  - Edit Judul Task (dengan validasi form).
  - Upload Gambar Cover (*Add Cover Image*) & hapus cover.
  - Penugasan Tim (Assignees) & tombol cepat tambah anggota tim (`+`).
  - Pemilihan Due Date (Tanggal Jatuh Tempo).
  - Pilihan Kolom & Label (`Feature`, `Bug`, `Issue`, `Undefined`) dengan `CustomSelect`.
  - Pilihan Prioritas (`Low`, `Medium`, `High`, `Critical`) dengan `CustomSelect`.
  - Tombol **Mark Complete** untuk menyelesaikan seluruh subtask sekaligus.
- **Panel Kanan**:
  - Textarea Deskripsi Tugas yang dapat diedit langsung.
  - Upload Lampiran (PDF, Doc, Spreadsheet, Gambar, File lainnya) dengan perhitungan ukuran file dan ikon spesifik.
  - **Subtask / Checklist**: Tambah subtask baru (`Enter` / tombol `Add subtask`), centang checklist, hapus subtask, dan *dynamic progress bar* (misal `2/3 67%`).
  - **Log Aktivitas**: Menampilkan pembuat task aktif (*Active Creator*) dan status pembaruan.
  - **Hapus Task**: Tombol hapus dengan konfirmasi dua langkah (*Delete confirmation*).

### 4. 👥 Kelola Karyawan / Tim (Employee Management CRUD)
- **Tambah Karyawan**: Input Nama Lengkap, Palet Warna Identitas, dan URL Avatar (opsional, auto-generate SVG avatar jika dikosongkan).
- **Daftar Karyawan**: Menampilkan daftar tim beserta badge jumlah tugas yang sedang ditugaskan.
- **Edit Karyawan**: Edit Nama dan Warna Theme secara inline.
- **Hapus Karyawan**: Hapus karyawan dengan konfirmasi aman (penugasan pada task terkait otomatis dibersihkan).

### 5. 🔍 Pencarian & Penyaringan Presisi (Search & Filtering)
- **Real-time Search**: Cari tugas berdasarkan judul atau isi deskripsi.
- **Filter Beragam**: Filter berdasarkan Assignee (anggota tim), Label, dan Rentang Tanggal (*Due Date From & To*).
- **Clear All Filters**: Reset seluruh filter dalam satu klik.

### 6. 🎨 Komponen UI Kustom Premium
- **`CustomSelect`**: Dropdown kustom pengganti `<select>` bawaan browser dengan indikator warna, ikon SVG, dan animasi rotasi panah 180°.
- **`CustomToast`**: Banner notifikasi melayang di pojok kanan bawah dengan *countdown progress bar* dan indikator tipe (*Success*, *Danger*, *Warning*, *Info*).

### 7. 💾 Penyimpanan & Ekspor/Impor Data
- **Persistence (LocalStorage)**: Seluruh data papan, kolom, tugas, dan anggota tim tersimpan otomatis di `localStorage` via Zustand middleware.
- **Ekspor JSON**: Backup seluruh data papan ke file `.json`.
- **Impor JSON**: Restore data dari file `.json` secara instan.

---

## 🛠️ Teknologi yang Digunakan

- **Core & Framework**: [React 18](https://react.dev/), [Vite 5](https://vitejs.dev/), [TypeScript 5](https://www.typescriptlang.org/)
- **UI Framework**: [Ionic React (`@ionic/react`)](https://ionicframework.com/docs/react)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (`persist` middleware)
- **Drag and Drop**: [`@dnd-kit/core`](https://dndkit.com/), `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Ikon & Styling**: Vanilla CSS3 (SVG Icons, CSS Variables, Flexbox, Grid, Modern Glassmorphism Shadows)

---

## 🚀 Cara Menjalankan Aplikasi (Getting Started)

### Prasyarat
- **Node.js**: v18.0.0 atau lebih baru
- **npm**: v9.0.0 atau lebih baru

### Langkah-Langkah Instalasi

1. **Buka Terminal / Command Prompt** dan masuk ke direktori proyek:
   ```bash
   cd "HomeTestStana"
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

4. **Buka di Browser**:
   Buka URL yang tertera di terminal, biasanya:
   [http://localhost:5173](http://localhost:5173)

---

## 📁 Struktur Direktori Proyek

```
kanban-board/
├── public/
├── src/
│   ├── components/
│   │   ├── Board/
│   │   │   ├── BoardHeader.tsx       # Header Papan, Filter, Export/Import, Edit Nama Board
│   │   │   └── BoardHeader.css
│   │   ├── Column/
│   │   │   ├── KanbanColumn.tsx      # Komponen Kolom Kanban & Tambah Task
│   │   │   └── KanbanColumn.css
│   │   ├── TaskCard/
│   │   │   ├── TaskCard.tsx          # Kartu Tugas di Board
│   │   │   └── TaskCard.css
│   │   ├── TaskModal/
│   │   │   ├── TaskModal.tsx         # Modal Edit/Detail Task Lengkap
│   │   │   └── TaskModal.css
│   │   ├── EmployeeModal/
│   │   │   ├── EmployeeModal.tsx     # Modal CRUD Kelola Karyawan / Tim
│   │   │   └── EmployeeModal.css
│   │   └── common/
│   │       ├── Avatar.tsx            # Komponen Avatar & Inisial
│   │       ├── CustomSelect.tsx      # Komponen Custom Dropdown Select
│   │       ├── CustomToast.tsx       # Komponen Floating Toast Notification
│   │       └── Icon.tsx              # Komponen Ikon SVG Terpusat
│   ├── data/
│   │   └── seedData.ts               # Data Awal Dummy (Bahasa Indonesia)
│   ├── pages/
│   │   ├── BoardPage.tsx             # Halaman Utama Kanban Board & Context DnD
│   │   └── BoardPage.css
│   ├── store/
│   │   ├── types.ts                  # Tipe Data TypeScript (Task, Column, Assignee, dll)
│   │   └── useTaskStore.ts           # State Management Utama (Zustand + Persist)
│   ├── theme/
│   │   └── variables.css             # Tema & Variabel Warna
│   ├── App.tsx                       # Setup Routing & Ionic Shell
│   └── main.tsx                      # Entrypoint Aplikasi
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md                         # Dokumentasi Proyek
```

---

## 👤 Penulis / Author

**Stana Edro Swargara**  
*Frontend Developer Candidate - Take Home Test Adhivasindo*
