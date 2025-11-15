const express = require('express');
const viewsController = require('../controllers/viewsController');
//armazenará a nossa rota para colocarmos no app.use no app.js
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');

// app.get("/tour", (req, res) => {
//   res.status(200).render("tour", { title: "tour" });
// });
router.get('/login', viewsController.getLogin);

router.use(authenticationController.isLoginIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
module.exports = router;
