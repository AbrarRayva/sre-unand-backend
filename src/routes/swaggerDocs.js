/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Registrasi, login, profil, dan ubah password.
 *   - name: Users
 *     description: Manajemen pengguna (HR).
 *   - name: Divisions
 *     description: Data divisi dan anggota.
 *   - name: WorkPrograms
 *     description: Program kerja organisasi.
 *   - name: Documents
 *     description: Dokumen organisasi.
 *   - name: Articles (Public)
 *     description: Artikel terpublikasi untuk publik.
 *   - name: Articles (Admin)
 *     description: Manajemen artikel (Media).
 *   - name: Cash
 *     description: Iuran kas dan administrasi keuangan.
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Daftar semua pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     x-permission: users.manage
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar pengguna
 *   post:
 *     summary: Membuat pengguna baru
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     x-permission: users.manage
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, position]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               position:
 *                 type: string
 *                 enum: [P, VP, SEC, DIRECTOR, MANAGER, STAFF]
 *               division_id:
 *                 type: integer
 *               sub_division_id:
 *                 type: integer
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pengguna dibuat
 */

/**
 * @swagger
 * /api/admin/users/csv-template:
 *   get:
 *     summary: Unduh template CSV pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     x-permission: users.manage
 *     responses:
 *       200:
 *         description: Template CSV dikirim
 */

/**
 * @swagger
 * /api/admin/users/bulk-upload:
 *   post:
 *     summary: Unggah CSV untuk impor massal pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     x-permission: users.manage
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Impor selesai
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Detail pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     x-permission: users.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail pengguna
 *   put:
 *     summary: Perbarui pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     x-permission: users.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               position:
 *                 type: string
 *               division_id:
 *                 type: integer
 *               sub_division_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Pengguna diperbarui
 *   delete:
 *     summary: Hapus pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     x-permission: users.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pengguna dihapus
 */

/**
 * @swagger
 * /api/divisions:
 *   get:
 *     summary: Daftar semua divisi
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar divisi
 */

/**
 * @swagger
 * /api/divisions/{id}:
 *   get:
 *     summary: Detail divisi
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail divisi
 */

/**
 * @swagger
 * /api/divisions/{id}/members:
 *   get:
 *     summary: Anggota pada divisi
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Daftar anggota divisi
 */

/**
 * @swagger
 * /api/work-programs:
 *   get:
 *     summary: Daftar program kerja
 *     tags: [WorkPrograms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar program kerja
 *   post:
 *     summary: Buat program kerja
 *     tags: [WorkPrograms]
 *     security:
 *       - bearerAuth: []
 *     x-permission: workprograms.manage
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               division_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Program kerja dibuat
 */

/**
 * @swagger
 * /api/work-programs/{id}:
 *   get:
 *     summary: Detail program kerja
 *     tags: [WorkPrograms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail program kerja
 *   put:
 *     summary: Perbarui program kerja
 *     tags: [WorkPrograms]
 *     security:
 *       - bearerAuth: []
 *     x-permission: workprograms.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               division_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Program kerja diperbarui
 *   delete:
 *     summary: Hapus program kerja
 *     tags: [WorkPrograms]
 *     security:
 *       - bearerAuth: []
 *     x-permission: workprograms.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Program kerja dihapus
 */

/**
 * @swagger
 * /api/work-programs/division/{divisionId}:
 *   get:
 *     summary: Daftar program kerja per divisi
 *     tags: [WorkPrograms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: divisionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil program kerja per divisi
 */

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Daftar dokumen
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar dokumen
 *   post:
 *     summary: Unggah dokumen
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     x-permission: documents.manage
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dokumen diunggah
 */

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Detail dokumen
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail dokumen
 *   put:
 *     summary: Perbarui dokumen
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     x-permission: documents.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dokumen diperbarui
 *   delete:
 *     summary: Hapus dokumen
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     x-permission: documents.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dokumen dihapus
 */

/**
 * @swagger
 * /api/documents/{id}/download:
 *   get:
 *     summary: Unduh dokumen
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: File dikirim
 */

/**
 * @swagger
 * /api/articles/published:
 *   get:
 *     summary: Daftar artikel terpublikasi (publik)
 *     tags: ["Articles (Public)"]
 *     security: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil artikel terpublikasi
 */

/**
 * @swagger
 * /api/articles/published/{id}:
 *   get:
 *     summary: Detail artikel terpublikasi (publik)
 *     tags: ["Articles (Public)"]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail artikel terpublikasi
 */

/**
 * @swagger
 * /api/articles/admin:
 *   get:
 *     summary: Daftar semua artikel (admin)
 *     tags: ["Articles (Admin)"]
 *     security:
 *       - bearerAuth: []
 *     x-permission: articles.manage
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar artikel
 *   post:
 *     summary: Buat artikel (admin)
 *     tags: ["Articles (Admin)"]
 *     security:
 *       - bearerAuth: []
 *     x-permission: articles.manage
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Artikel dibuat
 */

/**
 * @swagger
 * /api/articles/admin/{id}:
 *   get:
 *     summary: Detail artikel (admin)
 *     tags: ["Articles (Admin)"]
 *     security:
 *       - bearerAuth: []
 *     x-permission: articles.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail artikel
 *   put:
 *     summary: Perbarui artikel (admin)
 *     tags: ["Articles (Admin)"]
 *     security:
 *       - bearerAuth: []
 *     x-permission: articles.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Artikel diperbarui
 *   delete:
 *     summary: Hapus artikel (admin)
 *     tags: ["Articles (Admin)"]
 *     security:
 *       - bearerAuth: []
 *     x-permission: articles.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Artikel dihapus
 */

/**
 * @swagger
 * /api/articles/admin/{id}/publish:
 *   put:
 *     summary: Publikasikan artikel (admin)
 *     tags: ["Articles (Admin)"]
 *     security:
 *       - bearerAuth: []
 *     x-permission: articles.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Artikel dipublikasikan
 */

/**
 * @swagger
 * /api/cash/periods:
 *   get:
 *     summary: Daftar periode kas
 *     tags: [Cash]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil periode
 */

/**
 * @swagger
 * /api/cash/periods/{id}:
 *   get:
 *     summary: Detail periode kas
 *     tags: [Cash]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail periode kas
 */

/**
 * @swagger
 * /api/cash/my-transactions:
 *   get:
 *     summary: Daftar transaksi kas saya
 *     tags: [Cash]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil transaksi
 */

/**
 * @swagger
 * /api/cash/transactions:
 *   post:
 *     summary: Ajukan transaksi kas (unggah bukti)
 *     tags: [Cash]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [period_id, amount, proof]
 *             properties:
 *               period_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *               proof:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Transaksi diajukan
 */

/**
 * @swagger
 * /api/cash/admin/periods:
 *   post:
 *     summary: Buat periode kas (admin)
 *     tags: [Cash]
 *     security:
 *       - bearerAuth: []
 *     x-permission: cash.manage
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, start_date, end_date, amount]
 *             properties:
 *               title:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Periode kas dibuat
 */

/**
 * @swagger
 * /api/cash/admin/periods/{id}:
 *   put:
 *     summary: Perbarui periode kas (admin)
 *     tags: [Cash]
 *     security:
 *       - bearerAuth: []
 *     x-permission: cash.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Periode diperbarui
 *   delete:
 *     summary: Hapus periode kas (admin)
 *     tags: [Cash]
 *     security:
 *       - bearerAuth: []
 *     x-permission: cash.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Periode dihapus
 */

/**
 * @swagger
 * /api/cash/admin/transactions:
 *   get:
 *     summary: Daftar semua transaksi kas (admin)
 *     tags: [Cash]
 *     security:
 *       - bearerAuth: []
 *     x-permission: cash.manage
 *     responses:
 *       200:
 *         description: Berhasil mengambil transaksi
 */

/**
 * @swagger
 * /api/cash/admin/transactions/{id}/verify:
 *   put:
 *     summary: Verifikasi transaksi kas (admin)
 *     tags: [Cash]
 *     security:
 *       - bearerAuth: []
 *     x-permission: cash.manage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaksi diverifikasi
 */

/**
 * @swagger
 * /api/cash/admin/statistics:
 *   get:
 *     summary: Statistik kas (admin)
 *     tags: [Cash]
 *     security:
 *       - bearerAuth: []
 *     x-permission: cash.manage
 *     responses:
 *       200:
 *         description: Statistik kas
 */