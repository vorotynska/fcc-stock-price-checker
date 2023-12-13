'use strict';
const express = require("express");
const mongoose = require('mongoose');
const Stock = require('../models');
const router = express.Router();

const {
  getStock
} = require("../controllers/stock");

router.route("/").get(getStock);

module.exports = router;