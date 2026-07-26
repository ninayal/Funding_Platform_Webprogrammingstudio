const getHomePage = (req, res) => {
  res.render("home/index");
};

module.exports = {
  getHomePage,
};