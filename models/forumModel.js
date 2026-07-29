const categories = [
  { id: "announcement", label: "Announcement", icon: "annouce.png", pillLabel: "Announcement" },
  { id: "feedback", label: "Feedback", icon: "feedback.png", pillLabel: "Feedback" },
  { id: "qa", label: "Q&A", icon: "Question.png", pillLabel: "Q&A" },
  { id: "experience", label: "Experience Sharing", icon: "lightbulb.png", pillLabel: "Sharing" },
];

const threads = [
  {
    slug: "community-guidelines",
    category: "announcement",
    title: "Community Guidelines - Please Read Before Posting",
    views: 24,
    posts: [
      {
        author: "Admin",
        initials: "AV",
        rank: "Member",
        date: "14/07/2026",
        content: `<p>Welcome to the Làng & Co. community! This is a space for people who care about craft villages, traditional products, and the artisans behind them. To keep things friendly and useful for everyone, please follow these simple rules:</p>
                  <ol>
                    <li><b>Be respectful.</b> Disagreements are fine — personal attacks, insults, or harassment are not.</li>
                    <li><b>Stay on topic.</b> Keep posts relevant to craft village products, artisans, culture, or related discussions.</li>
                    <li><b>No spam or self-promotion.</b>Don't use threads to advertise unrelated products or services.</li>
                    <li><b>Give credit where it's due.</b>If you're sharing someone else's photos, stories, or work, credit the source.</li>
                    <li><b>No harmful or misleading content.</b>This includes hate speech, false information, or anything that could damage the reputation of artisans or the community.</li>
                    <li><b>Report, don't retaliate.</b>If you see a post that breaks these rules, use the report function instead of responding in kind.</li>
                  </ol>
                  <p>Violations may result in a warning, post removal, or account suspension depending on severity.
                  Thanks for helping keep this community welcoming and genuine</p>`,
      },
    ],
  },
  {
    slug: "getting-started",
    category: "announcement",
    title: "Getting Started — How to Use This Forum",
    views: 31,
    posts: [
      {
        author: "Admin",
        initials: "AV",
        rank: "Member",
        date: "14/07/2026",
        content: `<p>New here? Here's a quick guide to get you moving:</p>
                <p><b>Creating a Post</b><br>Click "New Thread" at the top of any category. Give your post a clear title and choose the category that best fits your topic.</p>
                <p><b>Replying</b><br>Found a thread you want to join? Scroll to the bottom and use the reply box. You can quote a specific comment by clicking "Quote" under that post.</p>
                <p><b>Formatting Your Post</b><br>Our editor supports:</p>
                <ul>
                  <li>Bold, italics, and lists</li>
                  <li>Inserting images (drag &amp; drop or use the image icon)</li>
                  <li>Adding links to external sources</li>
                </ul>
                <p><b>Categories & Tags</b><br>Use tags to help others find your post (e.g., #bamboo-weaving, #question, #showcase). Browse by category from the sidebar.</p>
                <p><b>Notifications</b><br>Turn on notifications for a thread to get updates when someone replies.</p>
                <p>If you run into any issues, drop a note in the Feedback thread — we're always improving!</p>`,
      },
    ],
  },
  {
    slug: "welcome-introductions",
    category: "announcement",
    title: "Say Hello! Introduce Yourself Here 👋",
    views: 27,
    posts: [
      {
        author: "Admin",
        initials: "AV",
        rank: "Member",
        date: "14/07/2026",
        content: `<p>We're glad you found your way to Làng &amp; Co.! Whether you're an artisan, a collector, or just curious about craft villages, we'd love to know a bit about you.</p>
                <p>Tell us:</p>
                <ul>
                  <li>Where are you from, and what's your connection to craft villages?</li>
                  <li>What products or traditions are you most passionate about?</li>
                  <li>What brought you to this community?</li>
                </ul>
                <p>No need to write an essay — a few sentences is plenty. This is just a friendly way to break the ice and get to know the faces (and stories) behind the posts.</p>
                <p>Looking forward to hearing from you! 🌾</p>`,
      },
    ],
  },
  {
    slug: "qa-handmade-verification",
    category: "qa",
    title: "How do I know if a product is handmade vs. machine-assisted?",
    views: 38,
    posts: [
      {
        author: "newbie_shopper",
        initials: "NS",
        rank: "Member",
        date: "18/07/2026",
        content: `<p>I'm new here and want to make sure I'm buying authentic handmade items. Is there a badge or filter for that, or do I need to check each artisan's profile manually?</p>`,
      },
      {
        author: "artisan_hoa",
        initials: "AH",
        rank: "Verified Artisan",
        date: "19/07/2026",
        content: `<p>Look for the "Handcrafted" badge on the product gallery — every item with that tag has been verified by our artisan verification team. You can also filter by "Production Method" in the Shop sidebar.</p>`,
      },
    ],
  },
  {
    slug: "qa-battrang-chudau",
    category: "qa",
    title: "What's the difference between the Bát Tràng and Chu Đậu ceramic lines?",
    views: 29,
    posts: [
      {
        author: "ceramics_fan_88",
        initials: "CF",
        rank: "Member",
        date: "15/07/2026",
        content: `<p>Both keep showing up in my recommendations and they look similar to me — can someone explain the difference in style/technique?</p>`,
      },
      {
        author: "minh_artisan",
        initials: "MA",
        rank: "Member",
        date: "16/07/2026",
        content: `<p>Bát Tràng tends toward cobalt-blue glazes and thicker stoneware, while Chu Đậu is known for its lighter porcelain and intricate hand-painted florals. Both are centuries-old traditions!</p>`,
      },
    ],
  },
  {
    slug: "experience-bamboo-tea-set",
    category: "experience",
    title: "First-time order review: the bamboo tea set exceeded expectations",
    views: 26,
    posts: [
      {
        author: "teahouse_ken",
        initials: "TK",
        rank: "Member",
        date: "13/07/2026",
        content: `<p>Was a little nervous ordering handmade ceramics online, but the bamboo-handled tea set arrived perfectly packaged and even more beautiful in person. The artisan included a handwritten note about the firing technique used. Highly recommend!</p>`,
      },
      {
        author: "khanh_admin",
        initials: "KA",
        rank: "Moderator",
        date: "14/07/2026",
        content: `<p>So happy to hear this! We'll pass your kind words along to the artisan. 💛</p>`,
      },
    ],
  },
  {
    slug: "experience-dongho-village",
    category: "experience",
    title: "My visit to the Đông Hồ painting village — and why I bought 5 prints",
    views: 33,
    posts: [
      {
        author: "wanderlust_anh",
        initials: "WA",
        rank: "Top Contributor",
        date: "16/07/2026",
        content: `<p>Just got back from visiting the artisans behind the Đông Hồ woodblock prints featured on this site. Watching them carve and hand-print each layer was incredible. Ended up buying way more than I planned — attaching some photos of the workshop!</p>`,
      },
      {
        author: "craft_lover_22",
        initials: "CL",
        rank: "Member",
        date: "17/07/2026",
        content: `<p>This made my day! Adding Đông Hồ village to my travel list now. Thanks for sharing the photos 😍</p>`,
      },
    ],
  },
  {
    slug: "feedback-checkout-mobile",
    category: "feedback",
    title: "Checkout page is a bit confusing on mobile",
    views: 22,
    posts: [
      {
        author: "davidw_collector",
        initials: "DW",
        rank: "Member",
        date: "13/07/2026",
        content: `<p>Tried to check out on my phone yesterday and the shipping address fields overlapped with the payment section. Had to switch to desktop to finish my order. Anyone else run into this?</p>`,
      },
      {
        author: "linh_nguyen",
        initials: "LN",
        rank: "Member",
        date: "14/07/2026",
        content: `<p>Yes! Same issue on my Android. Hoping it gets fixed soon since most of us browse on mobile.</p>`,
      },
    ],
  },
  {
    slug: "feedback-save-for-later",
    category: "feedback",
    title: `Suggestion: Add a "Save for Later" button on the Shop page`,
    views: 35,
    posts: [
      {
        author: "mai.tran92",
        initials: "MT",
        rank: "Member",
        date: "17/07/2026",
        content: `<p>Love browsing the craft village collections, but I keep losing track of items I want to come back to. Could we get a "Save for Later" heart icon next to Add to Cart? Would make it so much easier to compare handwoven baskets from different villages before deciding!</p>`,
      },
      {
        author: "khanh_admin",
        initials: "KA",
        rank: "Moderator",
        date: "18/07/2026",
        content: `<p>Great suggestion! We've passed this along to the product team — a wishlist feature is actually already being scoped for next quarter. 🙌</p>`,
      },
    ],
  },
];

const parseDate = (ddmmyyyy) => {
  const [day, month, year] = ddmmyyyy.split("/").map(Number);
  return new Date(year, month - 1, day);
};

const getCategoryMeta = (categoryId) => categories.find((c) => c.id === categoryId);

const getThreadsByCategory = (categoryId) =>
  categoryId === "all" ? threads : threads.filter((t) => t.category === categoryId);

const getThreadBySlug = (slug) => threads.find((t) => t.slug === slug);

const getRepliesCount = (thread) => thread.posts.length - 1;

const getLatestPost = (thread) => thread.posts[thread.posts.length - 1];

const getForumSummary = () =>
  categories.map((cat) => {
    const catThreads = getThreadsByCategory(cat.id);
    const totalViews = catThreads.reduce((sum, t) => sum + t.views, 0);
    const latestThread = catThreads.reduce((best, t) => {
      if (!best) return t;
      return parseDate(getLatestPost(t).date) >= parseDate(getLatestPost(best).date) ? t : best;
    }, null);
    return {
      ...cat,
      threadCount: catThreads.length,
      totalViews,
      latestThread,
    };
  });

const getForumTotals = () => ({
  posts: threads.length,
  views: threads.reduce((sum, t) => sum + t.views, 0),
});

module.exports = {
  categories,
  threads,
  getCategoryMeta,
  getThreadsByCategory,
  getThreadBySlug,
  getRepliesCount,
  getLatestPost,
  getForumSummary,
  getForumTotals,
};
