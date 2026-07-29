const landingModel = require("../models/landingModel");

const getHomePage = (req, res) => {
    const landingPageData = landingModel.getLandingPageData();

    res.render("home/index", landingPageData);
};

module.exports = {
    getHomePage,
};