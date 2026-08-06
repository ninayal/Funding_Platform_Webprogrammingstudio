"use strict";

const ceramics = require("./products/ceramics");
const brocade = require("./products/brocade");
const incense = require("./products/incense");
const painting = require("./products/painting");
const stone = require("./products/stone");
const waterPuppets = require("./products/waterpuppet");
const wood = require("./products/wood");

const products = [
  ...ceramics,
  ...brocade,
  ...incense,
  ...painting,
  ...stone,
  ...waterPuppets,
  ...wood
].sort(
  (first, second) =>
    first.featuredOrder - second.featuredOrder
);

module.exports = products;
