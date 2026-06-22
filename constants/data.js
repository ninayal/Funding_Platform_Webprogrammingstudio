const threads = [
    { id: 1, title: 'Best laptops for students in 2026?', content: 'What are the best budget laptops?', authorId: 1, createdAt: new Date('2026-06-20'), isArchived: false, replies: [] },
    { id: 2, title: 'How do I set up a home server?', content: 'Thinking about running my own file server.', authorId: 2, createdAt: new Date('2026-06-18'), isArchived: false, replies: [] },
  ];
  
  const blogPosts = [
    { id: 1, title: 'Getting Started with Web Development', content: 'Web development is one of the most in-demand skills today.', authorId: 1, category: 'Technology', tags: ['webdev','html'], createdAt: new Date('2026-06-20') },
    { id: 2, title: '10 Tips for Better CSS', content: 'Practical techniques to write cleaner CSS.', authorId: 2, category: 'Technology', tags: ['css','tips'], createdAt: new Date('2026-06-18') },
  ];
  
  const users = [
    { id: 1, username: 'alice_w', email: 'alice@example.com', password: '$2b$10$placeholder', role: 'admin', bio: 'Admin user', createdAt: new Date(), isLocked: false },
    { id: 2, username: 'bob_smith', email: 'bob@example.com', password: '$2b$10$placeholder', role: 'user', bio: 'Regular user', createdAt: new Date(), isLocked: false },
  ];
  
  const products = [
    { id: 1, name: 'Wireless Headphones', price: 149.99, category: 'Electronics', description: '30-hour battery life.' },
    { id: 2, name: 'Python Programming Book', price: 39.99, category: 'Books', description: 'Beginner to advanced.' },
    { id: 3, name: 'USB-C Hub 7-in-1', price: 49.99, category: 'Electronics', description: 'HDMI, USB 3.0, SD card.' },
  ];
  
  const reviews = [
    { id: 1, title: 'Headphones – Worth Every Penny', description: 'Amazing noise cancellation.', rating: 5, reviewerId: 2, createdAt: new Date('2026-06-21') },
  ];
  
  const orders = [];
  const carts  = {};
  
  module.exports = { users, products, threads, blogPosts, reviews, orders, carts };