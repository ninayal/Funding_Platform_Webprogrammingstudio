const getBlogPage = (req, res) => {
  res.render("blog/blog");
};

const getLeadStoryPage = (req, res) => {
  res.render("blog/blog_lead_story");
};

const getMyPostsPage = (req, res) => {
  res.render("blog/my_posts");
};

const getPostEditPage = (req, res) => {
  res.render("blog/post_edit");
};

module.exports = {
  getBlogPage,
  getLeadStoryPage,
  getMyPostsPage,
  getPostEditPage,
};