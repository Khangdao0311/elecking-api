var express = require('express');
var router = express.Router();

const brandController = require('../controllers/brand')
const brandService = require('../services/brand')
const { authentication, authorization } = require('../middleware/auth')
const { upload } = require('../services/upload')

router.get("/", async function (req, res, next) {
  try {
    const result = await brandController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await brandController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.post('/', authorization, upload.array('images'), async function (req, res, next) {
  try {
    const result = await brandService.insert(req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put('/:id', authorization, upload.array('images'), async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await brandService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch('/:id', authorization, upload.array('images'), async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await brandService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

module.exports = router;