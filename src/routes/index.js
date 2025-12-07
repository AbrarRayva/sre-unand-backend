const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const divisionRoutes = require('./divisionRoutes');
const workProgramRoutes = require('./workProgramRoutes');
const documentRoutes = require('./documentRoutes');
const articleRoutes = require('./articleRoutes');
const cashRoutes = require('./cashRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin/users', userRoutes);
router.use('/divisions', divisionRoutes);
router.use('/work-programs', workProgramRoutes);
router.use('/documents', documentRoutes);
router.use('/articles', articleRoutes);
router.use('/cash', cashRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date()
  });
});

module.exports = router;