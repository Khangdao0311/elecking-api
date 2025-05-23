var express = require('express');
var router = express.Router();

const proptypeController = require('../controllers/proptype')
const proptypeService = require('../services/proptype')
const { authentication, authorization } = require('../middleware/auth')

router.get("/", async function (req, res, next) {
  try {
    const result = await proptypeController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await proptypeController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.post('/', authorization, async function (req, res, next) {
  try {
    const result = await proptypeService.insert(req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put('/:id', authorization, async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await proptypeService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch('/:id', authorization, async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await proptypeService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

module.exports = router;