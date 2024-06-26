const express = require('express');
const router = express.Router();
const variationsController = require('../controllers/variationsController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/:productId', variationsController.getVariations);
router.post('/:productId', authenticateToken, authorizeAdmin, upload.single('image'), variationsController.createVariation);
router.put('/:id', authenticateToken, authorizeAdmin, upload.single('image'), variationsController.updateVariation);
router.delete('/:id', authenticateToken, authorizeAdmin, variationsController.deleteVariation);

module.exports = router;
