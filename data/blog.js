"use strict";

const developmentActor = Object.freeze({
  id: "user-huy-ba",
  name: "Huy Ba",
  email: "huy@example.com",
  initials: "HB",
  role: "Community contributor",
  description:
    "Writing about Vietnamese traditional crafts, cultural preservation, community support, and responsible digital platforms.",
});

const posts = [
  {
    id: "developer-mission",
    title:
      "Our Developer Mission: Building Digital Bridges to Living Craft",
    category: "Mission",
    author: {
      id: "team-lang-co",
      name: "Làng & Co. Development Team",
      initials: "LC",
      role:
        "Product · Engineering · Cultural stewardship",
    },
    createdAt:
      "2026-07-06T09:00:00.000Z",
    publishedAt:
      "2026-07-06T09:00:00.000Z",
    updatedAt:
      "2026-07-06T09:00:00.000Z",
    readTime: 8,
    summary:
      "A platform can flatten culture into inventory, or it can preserve context. We are choosing the second path, one product decision at a time.",
    archiveSummary:
      "Why our product decisions begin with provenance, maker dignity, and the long-term visibility of Vietnamese craft knowledge.",
    image: {
      url:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=88",
      alt:
        "A development team collaborating around a table",
      caption:
        "Building the platform begins with a question: what information should never disappear when a craft object moves online?",
      listCaption:
        "Development · Product · Cultural stewardship",
    },
    tags: [
      "Mission",
      "Development",
      "Vietnamese Craft",
      "Social Impact",
    ],
    status: "published",
    isLead: true,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "Làng & Co. began with a simple frustration: beautifully made objects were often presented online without the knowledge that made them meaningful.",
      },
      {
        type: "paragraph",
        text:
          "A ceramic vase became a decorative product. A woven surface became a passing trend. A craft village name became a marketing label. Important information about the maker, material, production process, and cultural context was often separated from the object itself.",
      },
      {
        type: "heading",
        text:
          "Building for context, not only conversion",
      },
      {
        type: "paragraph",
        text:
          "Our development mission is to make cultural context part of the platform’s structure. Information about the artisan, place of origin, material, technique, and production process should not be treated as optional content hidden at the bottom of a product page.",
      },
      {
        type: "paragraph",
        text:
          "These details should remain visible throughout the user journey, from the first product preview to the final purchase decision.",
      },
      {
        type: "quote",
        text:
          "Technology should help a craft object carry more of its story forward, not remove that story for the sake of a simpler product page.",
      },
      {
        type: "paragraph",
        text:
          "In practical terms, Làng & Co. will organise information into structured sections for maker identity, craft village, materials, production methods, care instructions, and cultural background.",
      },
      {
        type: "paragraph",
        text:
          "When information cannot be verified, the platform should communicate that uncertainty clearly instead of replacing it with unsupported marketing claims.",
      },
      {
        type: "heading",
        text:
          "Connecting traditional craft and charitable giving",
      },
      {
        type: "paragraph",
        text:
          "Làng & Co. is not designed only as an online marketplace. The platform connects product discovery with charitable support. Profits generated through product sales contribute to donation initiatives, allowing customers to support others while discovering Vietnamese traditional crafts.",
      },
      {
        type: "paragraph",
        text:
          "The Impact Gift feature provides a more direct pathway. Users can create a meaningful gift, select a supported organisation or cause, choose an amount, and personalise the gift for a recipient.",
      },
      {
        type: "heading",
        text:
          "A marketplace is also an editorial platform",
      },
      {
        type: "paragraph",
        text:
          "The Journal, Forum, Shop, Reviews, Wishlist, and Account features form a connected system. A user may first discover a craft technique through a Journal story, ask questions in the Forum, examine related products, read customer reviews, save an item, and later complete a purchase.",
      },
      {
        type: "paragraph",
        text:
          "This journey is intentionally more informative than a standard product catalogue. Traditional craft products often require explanation because their value is connected to process, knowledge, place, and the people who make them.",
      },
      {
        type: "image",
        url:
          "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1500&q=88",
        alt:
          "Team reviewing research and product information",
        caption:
          "Product design, cultural research, and technical development work together to determine how craft information should be presented.",
      },
      {
        type: "heading",
        text:
          "Designing for makers and communities",
      },
      {
        type: "paragraph",
        text:
          "The platform must work for artisans as well as customers. Makers should have clear control over how their names, images, products, and production processes are represented.",
      },
      {
        type: "paragraph",
        text:
          "Product information should also be manageable without requiring artisans to become full-time digital content creators. Editorial support should strengthen the maker’s voice rather than replace it.",
      },
      {
        type: "heading",
        text: "What comes next",
      },
      {
        type: "paragraph",
        text:
          "The final full-stack platform will use HTML, CSS, and JavaScript on the client side, Node.js on the server side, and MongoDB Atlas for data storage.",
      },
      {
        type: "paragraph",
        text:
          "Future development priorities include dynamic product and Blog content, authenticated user contributions, stronger provenance records, moderation tools, donation tracking, and accessible maker profiles.",
      },
    ],
  },
  {
    id: "bat-trang",
    title:
      "Bát Tràng Beyond Blue and White",
    category: "Guide",
    author: {
      id: "user-mai-an",
      name: "Mai An",
      initials: "MA",
      role: "Field editor",
    },
    createdAt:
      "2026-06-28T09:00:00.000Z",
    publishedAt:
      "2026-06-28T09:00:00.000Z",
    updatedAt:
      "2026-06-28T09:00:00.000Z",
    readTime: 6,
    summary:
      "A village is not a style preset. It is a living network of kilns, families, experiments, failures, and changing markets.",
    archiveSummary:
      "A closer look at how generations of ceramic knowledge continue to evolve through new forms, glazes, and audiences.",
    image: {
      url:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1100&q=88",
      alt:
        "Vietnamese ceramic vessels displayed in a workshop",
      caption:
        "Variation is not a defect when material, glaze, and firing are allowed to remain visible.",
      listCaption:
        "Ceramic traditions in Bát Tràng",
    },
    tags: [
      "Guide",
      "Ceramics",
      "Bát Tràng",
    ],
    status: "published",
    isLead: false,
    isFeatured: true,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "Bát Tràng is often reduced to a familiar visual shorthand. But the village contains many different workshops, firing practices, family histories, and contemporary directions.",
      },
      {
        type: "paragraph",
        text:
          "Walking from one kiln to another reveals a wider vocabulary: ash glazes, carved surfaces, revived forms, experimental firing, commissioned tableware, and objects made for everyday use.",
      },
      {
        type: "heading",
        text:
          "Looking beyond the motif",
      },
      {
        type: "paragraph",
        text:
          "To understand a piece, ask not only what it depicts, but who made it, which clay body was used, how the glaze behaves, and what kind of firing produced the surface.",
      },
    ],
  },
  {
    id: "lacquer-artist",
    title:
      "The Patience of a Lacquer Artist",
    category: "Guide",
    author: {
      id: "user-minh-khoi",
      name: "Minh Khôi",
      initials: "MK",
      role: "Contributor",
    },
    createdAt:
      "2026-06-19T09:00:00.000Z",
    publishedAt:
      "2026-06-19T09:00:00.000Z",
    updatedAt:
      "2026-06-19T09:00:00.000Z",
    readTime: 5,
    summary:
      "A conversation about waiting, polishing, and the discipline of surfaces that cannot be rushed.",
    archiveSummary:
      "Studio notes on time, repetition, and the quiet discipline behind a finish that appears effortless.",
    image: {
      url:
        "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1100&q=88",
      alt:
        "Artisan hands carefully painting a detailed surface",
      caption:
        "The visible finish is only the final trace of repeated hidden stages.",
      listCaption:
        "The patience behind lacquer work",
    },
    tags: [
      "Guide",
      "Lacquer",
      "Artisan",
    ],
    status: "published",
    isLead: false,
    isFeatured: true,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "The artist speaks most often about time. Layers are applied, left alone, returned to, polished, reconsidered, and sometimes removed.",
      },
      {
        type: "paragraph",
        text:
          "What appears smooth is not simple. It is the result of many decisions that disappear into the finished surface.",
      },
    ],
  },
  {
    id: "hoi-an",
    title:
      "A Slow Morning in Hội An",
    category: "Places",
    author: {
      id: "user-linh-tran",
      name: "Linh Trần",
      initials: "LT",
      role: "Travel editor",
    },
    createdAt:
      "2026-06-11T09:00:00.000Z",
    publishedAt:
      "2026-06-11T09:00:00.000Z",
    updatedAt:
      "2026-06-11T09:00:00.000Z",
    readTime: 4,
    summary:
      "Before the crowds arrive, work resumes at a scale that is easier to miss later in the day.",
    archiveSummary:
      "Walking the old town before opening hours reveals a different relationship between tourism, work, and everyday memory.",
    image: {
      url:
        "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1100&q=88",
      alt:
        "Warm lanterns in a historic Vietnamese street",
      caption:
        "The old town before opening hours.",
      listCaption:
        "Hội An before opening hours",
    },
    tags: [
      "Places",
      "Hội An",
      "Heritage",
    ],
    status: "published",
    isLead: false,
    isFeatured: true,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "At first light, Hội An is less a backdrop and more a working town. Shutters lift. Deliveries arrive. Tea appears at small tables.",
      },
      {
        type: "paragraph",
        text:
          "The morning offers a reminder that heritage places contain ordinary routines, not only visitor experiences.",
      },
    ],
  },
  {
    id: "care-guide",
    title:
      "How to Live with Handmade Ceramics",
    category: "Guide",
    author: {
      id: "user-thu-ha",
      name: "Thu Hà",
      initials: "TH",
      role: "Care editor",
    },
    createdAt:
      "2026-05-30T09:00:00.000Z",
    publishedAt:
      "2026-05-30T09:00:00.000Z",
    updatedAt:
      "2026-05-30T09:00:00.000Z",
    readTime: 4,
    summary:
      "Care is less about perfection than understanding material behaviour.",
    archiveSummary:
      "A practical guide to washing, storing, using, and appreciating irregular handmade ceramic pieces over time.",
    image: {
      url:
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=86",
      alt:
        "Ceramic cup on a table",
      caption:
        "Daily use is part of the life of an object.",
      listCaption:
        "Living with handmade ceramics",
    },
    tags: [
      "Guide",
      "Ceramics",
      "Care",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "Start with the maker's guidance whenever it is available. Different clay bodies, glazes, decorations, and firing temperatures behave differently.",
      },
      {
        type: "paragraph",
        text:
          "Avoid sudden thermal shock, store pieces where rims are not forced against hard edges, and do not assume every handmade surface is dishwasher-safe.",
      },
    ],
  },
  {
    id: "provenance",
    title:
      "Why Provenance Belongs on the Product Page",
    category: "Guide",
    author: {
      id: "team-lang-co-research",
      name: "Làng & Co. Research Team",
      initials: "LR",
      role: "Research",
    },
    createdAt:
      "2026-05-22T09:00:00.000Z",
    publishedAt:
      "2026-05-22T09:00:00.000Z",
    updatedAt:
      "2026-05-22T09:00:00.000Z",
    readTime: 5,
    summary:
      "The information around an object should be designed with the same care as the purchase path.",
    archiveSummary:
      "Our approach to documenting who made an object, where it came from, and which claims we choose not to make.",
    image: {
      url:
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=86",
      alt:
        "Team discussing documents and research",
      caption:
        "Claims need traceable sources and visible uncertainty.",
      listCaption:
        "Researching product provenance",
    },
    tags: [
      "Guide",
      "Provenance",
      "Research",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "A product page should do more than persuade. It should tell a reader what is known, how it is known, and which details remain uncertain.",
      },
      {
        type: "paragraph",
        text:
          "That requires structured provenance, editorial review, and a refusal to turn every gap into a confident origin story.",
      },
    ],
  },
  {
    id: "silk",
    title:
      "Silk, Light, and the Memory of Touch",
    category: "Guide",
    author: {
      id: "user-ngoc-vy",
      name: "Ngọc Vy",
      initials: "NV",
      role: "Textile contributor",
    },
    createdAt:
      "2026-05-14T09:00:00.000Z",
    publishedAt:
      "2026-05-14T09:00:00.000Z",
    updatedAt:
      "2026-05-14T09:00:00.000Z",
    readTime: 4,
    summary:
      "Textile knowledge is carried through fibre, tension, dye, weather, and hand.",
    archiveSummary:
      "What changes when cloth is understood not as decoration, but as a record of fibre, tension, dye, weather, and hand.",
    image: {
      url:
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=86",
      alt:
        "Textile details and folded fabric",
      caption:
        "Cloth changes with light, movement, and use.",
      listCaption:
        "Silk, light, and movement",
    },
    tags: [
      "Guide",
      "Silk",
      "Textile",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "A woven surface is never only visual. Its character comes from how fibres resist, bend, catch light, and respond to the body.",
      },
      {
        type: "paragraph",
        text:
          "Learning to read silk means paying attention to density, weave, finishing, dye, and the differences that become more visible through use.",
      },
    ],
  },
  {
    id: "community-platform",
    title:
      "What a Craft Community Needs from a Platform",
    category: "Donation",
    author: {
      id: "user-huy-ba",
      name: "Huy Ba",
      initials: "HB",
      role: "Community contributor",
    },
    createdAt:
      "2026-05-02T09:00:00.000Z",
    publishedAt:
      "2026-05-02T09:00:00.000Z",
    updatedAt:
      "2026-05-02T09:00:00.000Z",
    readTime: 5,
    summary:
      "Visibility is useful only when it arrives with context, control, and practical value.",
    archiveSummary:
      "Notes from conversations with makers about visibility, pricing, context, and the difference between exposure and useful support.",
    image: {
      url:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=86",
      alt:
        "Small community gathering outdoors",
      caption:
        "Platform design begins by listening to the people expected to use it.",
      listCaption:
        "Listening to craft communities",
    },
    tags: [
      "Donation",
      "Community",
      "Support",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "In conversations with makers, the same concerns return: pricing pressure, loss of context, copied images, and the burden of maintaining another digital profile.",
      },
      {
        type: "paragraph",
        text:
          "A useful platform should reduce those burdens rather than move them around. That means clear ownership controls, realistic moderation, transparent fees, and editorial support that does not erase the maker's voice.",
      },
    ],
  },
  {
    id: "future-draft-example",
    title:
      "A Draft Story for My Blog",
    category: "Guide",
    author: {
      id: "user-huy-ba",
      name: "Huy Ba",
      initials: "HB",
      role: "Community contributor",
    },
    createdAt:
      "2026-07-08T09:00:00.000Z",
    publishedAt: null,
    updatedAt:
      "2026-07-08T09:00:00.000Z",
    readTime: 3,
    summary:
      "This draft demonstrates that an owner can save an unfinished post without publishing it to the public Journal.",
    archiveSummary:
      "A private draft that will appear later in My Blog, but never on the public listing until published.",
    image: {
      url:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=86",
      alt:
        "Notebook and pen on a desk",
      caption:
        "Drafts remain private until their owner publishes them.",
      listCaption:
        "Work in progress",
    },
    tags: [
      "Guide",
      "Draft",
    ],
    status: "draft",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "This post is still being written.",
      },
    ],
  },
  {
    id:
      "bamboo-weaving-geometry",
    title:
      "The Quiet Geometry of Bamboo Weaving",
    category: "Guide",
    author: {
      id: "user-thao-nguyen",
      name: "Thảo Nguyễn",
      initials: "TN",
      role: "Craft contributor",
    },
    createdAt:
      "2026-08-05T09:00:00.000Z",
    publishedAt:
      "2026-08-05T09:00:00.000Z",
    updatedAt:
      "2026-08-05T09:00:00.000Z",
    readTime: 5,
    summary:
      "Bamboo weaving begins with repeated lines, but its strength comes from how those lines cross, bend, and share pressure.",
    archiveSummary:
      "A practical introduction to the patterns, preparation, and structural thinking behind Vietnamese bamboo weaving.",
    image: {
      url:
        "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1000&q=86",
      alt:
        "Hands weaving thin bamboo strips into a repeated pattern",
      caption:
        "Each crossing distributes tension across the surface.",
      listCaption:
        "The structure of bamboo weaving",
    },
    tags: [
      "Guide",
      "Bamboo",
      "Weaving",
      "Technique",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "A woven bamboo object may appear simple because its pattern repeats. In practice, every strip must be prepared to a consistent thickness and placed with controlled tension.",
      },
      {
        type: "heading",
        text:
          "Pattern is also structure",
      },
      {
        type: "paragraph",
        text:
          "The crossing pattern does more than decorate the surface. It spreads force across many points, allowing a light material to become stable, flexible, and durable.",
      },
      {
        type: "paragraph",
        text:
          "Small changes in spacing, moisture, or strip width can alter the shape of the entire object. Skilled weaving depends on seeing the pattern and the structure at the same time.",
      },
    ],
  },
  {
    id: "van-phuc-morning",
    title:
      "A Morning with the Weavers of Vạn Phúc",
    category: "Places",
    author: {
      id: "user-linh-tran",
      name: "Linh Trần",
      initials: "LT",
      role: "Travel editor",
    },
    createdAt:
      "2026-08-02T09:00:00.000Z",
    publishedAt:
      "2026-08-02T09:00:00.000Z",
    updatedAt:
      "2026-08-02T09:00:00.000Z",
    readTime: 5,
    summary:
      "Before the shops fill with visitors, the sound of looms reveals Vạn Phúc as a working textile village.",
    archiveSummary:
      "An early walk through Vạn Phúc, where production, family knowledge, and tourism meet in the same streets.",
    image: {
      url:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=86",
      alt:
        "Traditional textile loom with threads arranged for weaving",
      caption:
        "The village is heard before it is fully seen.",
      listCaption:
        "Morning work in Vạn Phúc",
    },
    tags: [
      "Places",
      "Vạn Phúc",
      "Silk",
      "Textiles",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "Early in the morning, Vạn Phúc is defined less by shop displays than by work beginning behind open doors.",
      },
      {
        type: "paragraph",
        text:
          "Threads are checked, machines are prepared, and fabric moves steadily through spaces that are both workshops and family homes.",
      },
      {
        type: "heading",
        text:
          "A living production landscape",
      },
      {
        type: "paragraph",
        text:
          "Tourism has changed the village, but the continuing presence of production matters. It keeps textile knowledge visible as a working practice rather than only a historical image.",
      },
    ],
  },
  {
    id: "natural-dyes",
    title:
      "Why Natural Dyes Never Look Exactly the Same",
    category: "Guide",
    author: {
      id: "user-ngoc-vy",
      name: "Ngọc Vy",
      initials: "NV",
      role: "Textile contributor",
    },
    createdAt:
      "2026-07-30T09:00:00.000Z",
    publishedAt:
      "2026-07-30T09:00:00.000Z",
    updatedAt:
      "2026-07-30T09:00:00.000Z",
    readTime: 6,
    summary:
      "Plant material, water, fibre, temperature, and time all leave visible differences in naturally dyed cloth.",
    archiveSummary:
      "Why variation in natural colour is evidence of material process rather than a production mistake.",
    image: {
      url:
        "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=86",
      alt:
        "Fabric samples in several muted natural colours",
      caption:
        "Natural colour records the conditions of its making.",
      listCaption:
        "Variation in naturally dyed cloth",
    },
    tags: [
      "Guide",
      "Natural Dye",
      "Textile",
      "Materials",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "Natural dyeing is a relationship between fibre, plant material, water, heat, and time. None of those elements behaves with perfect consistency.",
      },
      {
        type: "paragraph",
        text:
          "Leaves gathered in a different season may release a different concentration of colour. Water chemistry and fibre preparation can also change how a dye is absorbed.",
      },
      {
        type: "quote",
        text:
          "Variation is not the absence of control; it is evidence that living materials were part of the process.",
      },
      {
        type: "paragraph",
        text:
          "For buyers, this means two pieces from the same dye bath may remain related without being identical.",
      },
    ],
  },
  {
    id: "repair-as-care",
    title:
      "Repairing Objects as an Act of Care",
    category: "Guide",
    author: {
      id: "user-thu-ha",
      name: "Thu Hà",
      initials: "TH",
      role: "Care editor",
    },
    createdAt:
      "2026-07-27T09:00:00.000Z",
    publishedAt:
      "2026-07-27T09:00:00.000Z",
    updatedAt:
      "2026-07-27T09:00:00.000Z",
    readTime: 4,
    summary:
      "Repair extends the useful life of an object and preserves the relationship built through everyday use.",
    archiveSummary:
      "A guide to deciding when handmade objects can be repaired, repurposed, or safely retired.",
    image: {
      url:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=86",
      alt:
        "Hands repairing a small handmade object on a work table",
      caption:
        "Repair begins by understanding how an object was made.",
      listCaption:
        "Care through repair",
    },
    tags: [
      "Guide",
      "Repair",
      "Care",
      "Sustainability",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "A crack, loose joint, worn edge, or faded surface does not always mean that a handmade object has reached the end of its useful life.",
      },
      {
        type: "heading",
        text:
          "Start with the material",
      },
      {
        type: "paragraph",
        text:
          "Ceramic, wood, textile, lacquer, and woven bamboo require different repair decisions. The safest first step is to identify the material and ask whether the maker provides care guidance.",
      },
      {
        type: "paragraph",
        text:
          "A visible repair can become part of the object's history, provided that it does not create a safety risk.",
      },
    ],
  },
  {
    id:
      "craft-education-donations",
    title:
      "How Donations Support Craft Education",
    category: "Donation",
    author: {
      id:
        "team-lang-co-impact",
      name:
        "Làng & Co. Impact Team",
      initials: "LI",
      role:
        "Community partnerships",
    },
    createdAt:
      "2026-07-24T09:00:00.000Z",
    publishedAt:
      "2026-07-24T09:00:00.000Z",
    updatedAt:
      "2026-07-24T09:00:00.000Z",
    readTime: 5,
    summary:
      "Targeted support can help workshops provide materials, teaching time, and safer learning spaces for younger makers.",
    archiveSummary:
      "Where craft-education donations go and why transparent reporting matters to communities and supporters.",
    image: {
      url:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=86",
      alt:
        "A small group learning together around a work table",
      caption:
        "Teaching requires time, tools, materials, and a safe place to practise.",
      listCaption:
        "Supporting craft education",
    },
    tags: [
      "Donation",
      "Education",
      "Community",
      "Impact",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "Craft knowledge is often transferred through long periods of observation and guided practice. That learning takes resources that are easy to overlook.",
      },
      {
        type: "paragraph",
        text:
          "Donations can support raw materials, protective equipment, workshop maintenance, teaching time, and transport for learners who live farther away.",
      },
      {
        type: "heading",
        text:
          "Transparency creates trust",
      },
      {
        type: "paragraph",
        text:
          "Support should be connected to clear goals and visible reporting. Communities should help define what is useful rather than receiving programmes designed without them.",
      },
    ],
  },
  {
    id: "bronze-village-sound",
    title:
      "The Sound of a Working Bronze Village",
    category: "Places",
    author: {
      id: "user-minh-khoi",
      name: "Minh Khôi",
      initials: "MK",
      role: "Contributor",
    },
    createdAt:
      "2026-07-21T09:00:00.000Z",
    publishedAt:
      "2026-07-21T09:00:00.000Z",
    updatedAt:
      "2026-07-21T09:00:00.000Z",
    readTime: 5,
    summary:
      "Metalwork announces itself through rhythm: cutting, shaping, hammering, polishing, and the pauses between each stage.",
    archiveSummary:
      "Listening to a bronze-working village reveals how production shapes the daily life of a place.",
    image: {
      url:
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=86",
      alt:
        "Metalworker shaping a bronze object in a workshop",
      caption:
        "The rhythm of tools makes production audible across the village.",
      listCaption:
        "Bronze work in motion",
    },
    tags: [
      "Places",
      "Bronze",
      "Metalwork",
      "Village",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "A working bronze village is experienced through sound as much as sight. Hammering carries across courtyards, followed by quieter periods of filing, checking, and polishing.",
      },
      {
        type: "paragraph",
        text:
          "These rhythms reveal that each finished object moves through many hands and stages.",
      },
      {
        type: "heading",
        text:
          "Production shapes place",
      },
      {
        type: "paragraph",
        text:
          "Workshops influence how streets are used, when deliveries arrive, and how knowledge moves between generations.",
      },
    ],
  },
  {
    id:
      "fair-pricing-handmade",
    title:
      "What Fair Pricing Means for Handmade Work",
    category: "Mission",
    author: {
      id:
        "team-lang-co-research",
      name:
        "Làng & Co. Research Team",
      initials: "LR",
      role: "Research",
    },
    createdAt:
      "2026-07-18T09:00:00.000Z",
    publishedAt:
      "2026-07-18T09:00:00.000Z",
    updatedAt:
      "2026-07-18T09:00:00.000Z",
    readTime: 6,
    summary:
      "A fair price must account for skilled labour, material loss, preparation, finishing, and the cost of sustaining a workshop.",
    archiveSummary:
      "Why handmade pricing cannot be understood by comparing only the final object with mass-produced alternatives.",
    image: {
      url:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=86",
      alt:
        "People reviewing costs and notes around a table",
      caption:
        "Pricing reflects the full process, not only the visible finishing stage.",
      listCaption:
        "Understanding fair pricing",
    },
    tags: [
      "Mission",
      "Fair Pricing",
      "Makers",
      "Labour",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "Handmade objects are often compared with mass-produced goods that hide labour and material costs through scale.",
      },
      {
        type: "paragraph",
        text:
          "A fair price must include preparation, failed pieces, tool maintenance, finishing, packaging, platform fees, and the time required to maintain specialist knowledge.",
      },
      {
        type: "quote",
        text:
          "Lower prices are not automatically more accessible when they depend on invisible or underpaid labour.",
      },
      {
        type: "paragraph",
        text:
          "Transparent pricing helps customers understand what their purchase supports and helps makers plan beyond the next sale.",
      },
    ],
  },
  {
    id: "kiln-marks",
    title:
      "Reading the Marks Left by the Kiln",
    category: "Guide",
    author: {
      id: "user-mai-an",
      name: "Mai An",
      initials: "MA",
      role: "Field editor",
    },
    createdAt:
      "2026-07-15T09:00:00.000Z",
    publishedAt:
      "2026-07-15T09:00:00.000Z",
    updatedAt:
      "2026-07-15T09:00:00.000Z",
    readTime: 5,
    summary:
      "Colour shifts, small runs, pinholes, and flame marks can reveal how a ceramic piece met heat inside the kiln.",
    archiveSummary:
      "A beginner's guide to interpreting firing variation without confusing every irregularity with damage.",
    image: {
      url:
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=86",
      alt:
        "Glazed ceramic vessels showing varied fired surfaces",
      caption:
        "The kiln leaves evidence of heat, atmosphere, and position.",
      listCaption:
        "Reading fired ceramic surfaces",
    },
    tags: [
      "Guide",
      "Ceramics",
      "Kiln",
      "Glaze",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "No kiln is perfectly uniform. Temperature and atmosphere shift across the chamber, affecting glaze colour, texture, and movement.",
      },
      {
        type: "heading",
        text:
          "Variation versus damage",
      },
      {
        type: "paragraph",
        text:
          "A colour change or small glaze run may be part of the firing process. A sharp crack, unstable surface, or exposed edge requires a different assessment.",
      },
      {
        type: "paragraph",
        text:
          "Learning to read these marks helps buyers appreciate process while still asking practical questions about safety and use.",
      },
    ],
  },
  {
    id:
      "young-makers-old-techniques",
    title:
      "Young Makers and Old Techniques",
    category: "Mission",
    author: {
      id: "user-huy-ba",
      name: "Huy Ba",
      initials: "HB",
      role:
        "Community contributor",
    },
    createdAt:
      "2026-07-12T09:00:00.000Z",
    publishedAt:
      "2026-07-12T09:00:00.000Z",
    updatedAt:
      "2026-07-12T09:00:00.000Z",
    readTime: 6,
    summary:
      "Continuity does not require copying the past unchanged; it requires enough knowledge to adapt techniques responsibly.",
    archiveSummary:
      "How younger makers combine inherited methods with new forms, audiences, and working conditions.",
    image: {
      url:
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1800&q=90",
      listUrl:
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=86",
      alt:
        "Young makers learning together in a workshop",
      caption:
        "Tradition continues through practice, questioning, and adaptation.",
      listCaption:
        "A new generation of makers",
    },
    tags: [
      "Mission",
      "Young Makers",
      "Tradition",
      "Education",
    ],
    status: "published",
    isLead: false,
    isFeatured: false,
    content: [
      {
        type: "paragraph",
        introduction: true,
        text:
          "Younger makers often inherit techniques alongside a different economic and digital environment.",
      },
      {
        type: "paragraph",
        text:
          "They may sell through social media, collaborate across disciplines, or adapt traditional processes to new forms and smaller urban workspaces.",
      },
      {
        type: "heading",
        text:
          "Adaptation requires knowledge",
      },
      {
        type: "paragraph",
        text:
          "Responsible innovation begins with understanding materials, tools, cultural context, and the reasons behind established methods.",
      },
      {
        type: "paragraph",
        text:
          "The goal is not to freeze tradition, but to make change visible, informed, and connected to the people who carry the knowledge.",
      },
    ],
  },
];

const comments = [
  {
    id: "comment-dev-1",
    postId: "developer-mission",
    parentCommentId: null,
    author: {
      id: "user-mai-nguyen",
      name: "Mai Nguyễn",
      initials: "MN",
    },
    content:
      "I appreciate the distinction between documenting uncertainty and filling information gaps with marketing language.",
    likedBy: [
      "user-huy-ba",
    ],
    createdAt:
      "2026-07-06T11:15:00.000Z",
    updatedAt:
      "2026-07-06T11:15:00.000Z",
    status: "active",
  },
  {
    id: "reply-dev-1",
    postId: "developer-mission",
    parentCommentId:
      "comment-dev-1",
    author: {
      id: "user-huy-ba",
      name: "Huy Ba",
      initials: "HB",
    },
    content:
      "That distinction was one of the main design priorities.",
    likedBy: [],
    createdAt:
      "2026-07-06T12:00:00.000Z",
    updatedAt:
      "2026-07-06T12:00:00.000Z",
    status: "active",
  },
  {
    id: "comment-dev-2",
    postId: "developer-mission",
    parentCommentId: null,
    author: {
      id:
        "user-trung-kien",
      name: "Trung Kiên",
      initials: "TK",
    },
    content:
      "Maker-controlled profiles with editorial support could help preserve accurate information.",
    likedBy: [],
    createdAt:
      "2026-07-06T15:30:00.000Z",
    updatedAt:
      "2026-07-06T15:30:00.000Z",
    status: "active",
  },
  {
    id: "comment-dev-3",
    postId: "developer-mission",
    parentCommentId: null,
    author: {
      id: "user-an-vy",
      name: "An Vy",
      initials: "AV",
    },
    content:
      "The relationship between traditional products and charitable support makes the platform more meaningful.",
    likedBy: [],
    createdAt:
      "2026-07-07T08:20:00.000Z",
    updatedAt:
      "2026-07-07T08:20:00.000Z",
    status: "active",
  },
  {
    id:
      "comment-bat-trang-1",
    postId: "bat-trang",
    parentCommentId: null,
    author: {
      id:
        "user-phuong-linh",
      name: "Phương Linh",
      initials: "PL",
    },
    content:
      "This is why village names should not be treated as a single aesthetic category.",
    likedBy: [],
    createdAt:
      "2026-06-29T10:00:00.000Z",
    updatedAt:
      "2026-06-29T10:00:00.000Z",
    status: "active",
  },
];

module.exports = {
  developmentActor,
  posts,
  comments,
};