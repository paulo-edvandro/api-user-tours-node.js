const express = require('express');
const viewsController = require('../controllers/viewsController');
//armazenará a nossa rota para colocarmos no app.use no app.js
const router = express.Router();

// app.get("/tour", (req, res) => {
//   res.status(200).render("tour", { title: "tour" });
// });

router.route('/').get(viewsController.getOverview);
router.route('/tour/:slug').get(viewsController.getTour);

module.exports = router;
