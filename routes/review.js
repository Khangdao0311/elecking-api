var express = require('express');
var router = express.Router();

const reviewController = require('../controllers/review')
const reviewService = require('../services/review')

router.get("/", async function (req, res, next) {
  try {
    const result = await reviewController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

router.get("/total_pages", async function (req, res, next) {
  try {
    const result = await reviewController.getTotalPagesByQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await reviewController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

router.post('/', async function (req, res, next) {
  try {
    const result = await reviewService.insert(req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.put('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await reviewService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.patch('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await reviewService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

module.exports = router;