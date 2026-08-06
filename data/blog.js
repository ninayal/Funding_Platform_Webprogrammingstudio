"use strict";

const developmentActor = Object.freeze({
    "id": "user-huy-ba",
    "name": "Huy Ba",
    "email": "huy@example.com",
    "initials": "HB",
    "role": "Community contributor",
    "description": "Writing about Vietnamese traditional crafts, cultural preservation, community support, and responsible digital platforms."
});

const posts = [
    {
        "id": "developer-mission",
        "title": "Our Developer Mission: Building Digital Bridges to Living Craft",
        "category": "Mission",
        "author": {
            "id": "team-lang-co",
            "name": "Làng & Co. Development Team",
            "initials": "LC",
            "role": "Product · Engineering · Cultural stewardship"
        },
        "createdAt": "2026-07-06T09:00:00.000Z",
        "publishedAt": "2026-07-06T09:00:00.000Z",
        "updatedAt": "2026-07-06T09:00:00.000Z",
        "readTime": 8,
        "summary": "A platform can flatten culture into inventory, or it can preserve context. We are choosing the second path, one product decision at a time.",
        "archiveSummary": "Why our product decisions begin with provenance, maker dignity, and the long-term visibility of Vietnamese craft knowledge.",
        "image": {
            "url": "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=90",
            "listUrl": "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=88",
            "alt": "A development team collaborating around a table",
            "caption": "Building the platform begins with a question: what information should never disappear when a craft object moves online?",
            "listCaption": "Development · Product · Cultural stewardship"
        },
        "tags": [
            "Mission",
            "Development",
            "Vietnamese Craft",
            "Social Impact"
        ],
        "status": "published",
        "isLead": true,
        "isFeatured": false,
        "content": [
            {
                "type": "paragraph",
                "introduction": true,
                "text": "Làng & Co. began with a simple frustration: beautifully made objects were often presented online without the knowledge that made them meaningful."
            },
            {
                "type": "paragraph",
                "text": "A ceramic vase became a decorative product. A woven surface became a passing trend. A craft village name became a marketing label. Important information about the maker, material, production process, and cultural context was often separated from the object itself."
            },
            {
                "type": "heading",
                "text": "Building for context, not only conversion"
            },
            {
                "type": "paragraph",
                "text": "Our development mission is to make cultural context part of the platform’s structure. Information about the artisan, place of origin, material, technique, and production process should not be treated as optional content hidden at the bottom of a product page."
            },
            {
                "type": "paragraph",
                "text": "These details should remain visible throughout the user journey, from the first product preview to the final purchase decision."
            },
            {
                "type": "quote",
                "text": "Technology should help a craft object carry more of its story forward, not remove that story for the sake of a simpler product page."
            },
            {
                "type": "paragraph",
                "text": "In practical terms, Làng & Co. will organise information into structured sections for maker identity, craft village, materials, production methods, care instructions, and cultural background."
            },
            {
                "type": "paragraph",
                "text": "When information cannot be verified, the platform should communicate that uncertainty clearly instead of replacing it with unsupported marketing claims."
            },
            {
                "type": "heading",
                "text": "Connecting traditional craft and charitable giving"
            },
            {
                "type": "paragraph",
                "text": "Làng & Co. is not designed only as an online marketplace. The platform connects product discovery with charitable support. Profits generated through product sales contribute to donation initiatives, allowing customers to support others while discovering Vietnamese traditional crafts."
            },
            {
                "type": "paragraph",
                "text": "The Impact Gift feature provides a more direct pathway. Users can create a meaningful gift, select a supported organisation or cause, choose an amount, and personalise the gift for a recipient."
            },
            {
                "type": "heading",
                "text": "A marketplace is also an editorial platform"
            },
            {
                "type": "paragraph",
                "text": "The Journal, Forum, Shop, Reviews, Wishlist, and Account features form a connected system. A user may first discover a craft technique through a Journal story, ask questions in the Forum, examine related products, read customer reviews, save an item, and later complete a purchase."
            },
            {
                "type": "paragraph",
                "text": "This journey is intentionally more informative than a standard product catalogue. Traditional craft products often require explanation because their value is connected to process, knowledge, place, and the people who make them."
            },
            {
                "type": "image",
                "url": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1500&q=88",
                "alt": "Team reviewing research and product information",
                "caption": "Product design, cultural research, and technical development work together to determine how craft information should be presented."
            },
            {
                "type": "heading",
                "text": "Designing for makers and communities"
            },
            {
                "type": "paragraph",
                "text": "The platform must work for artisans as well as customers. Makers should have clear control over how their names, images, products, and production processes are represented."
            },
            {
                "type": "paragraph",
                "text": "Product information should also be manageable without requiring artisans to become full-time digital content creators. Editorial support should strengthen the maker’s voice rather than replace it."
            },
            {
                "type": "heading",
                "text": "What comes next"
            },
            {
                "type": "paragraph",
                "text": "The final full-stack platform will use HTML, CSS, and JavaScript on the client side, Node.js on the server side, and MongoDB Atlas for data storage."
            },
            {
                "type": "paragraph",
                "text": "Future development priorities include dynamic product and Blog content, authenticated user contributions, stronger provenance records, moderation tools, donation tracking, and accessible maker profiles."
            }
        ]
    },
    {
        "id": "bat-trang",
        "title": "Bát Tràng Beyond Blue and White",
        "category": "Guide",
        "author": {
            "id": "user-mai-an",
            "name": "Mai An",
            "initials": "MA",
            "role": "Field editor"
        },
        "createdAt": "2026-06-28T09:00:00.000Z",
        "publishedAt": "2026-06-28T09:00:00.000Z",
        "updatedAt": "2026-06-28T09:00:00.000Z",
        "readTime": 6,
        "summary": "A village is not a style preset. It is a living network of kilns, families, experiments, failures, and changing markets.",
        "archiveSummary": "A closer look at how generations of ceramic knowledge continue to evolve through new forms, glazes, and audiences.",
        "image": {
            "url": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1800&q=90",
            "listUrl": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1100&q=88",
            "alt": "Vietnamese ceramic vessels displayed in a workshop",
            "caption": "Variation is not a defect when material, glaze, and firing are allowed to remain visible.",
            "listCaption": "Ceramic traditions in Bát Tràng"
        },
        "tags": [
            "Guide",
            "Ceramics",
            "Bát Tràng"
        ],
        "status": "published",
        "isLead": false,
        "isFeatured": true,
        "content": [
            {
                "type": "paragraph",
                "introduction": true,
                "text": "Bát Tràng is often reduced to a familiar visual shorthand. But the village contains many different workshops, firing practices, family histories, and contemporary directions."
            },
            {
                "type": "paragraph",
                "text": "Walking from one kiln to another reveals a wider vocabulary: ash glazes, carved surfaces, revived forms, experimental firing, commissioned tableware, and objects made for everyday use."
            },
            {
                "type": "heading",
                "text": "Looking beyond the motif"
            },
            {
                "type": "paragraph",
                "text": "To understand a piece, ask not only what it depicts, but who made it, which clay body was used, how the glaze behaves, and what kind of firing produced the surface."
            }
        ]
    },
    {
        "id": "lacquer-artist",
        "title": "The Patience of a Lacquer Artist",
        "category": "Guide",
        "author": {
            "id": "user-minh-khoi",
            "name": "Minh Khôi",
            "initials": "MK",
            "role": "Contributor"
        },
        "createdAt": "2026-06-19T09:00:00.000Z",
        "publishedAt": "2026-06-19T09:00:00.000Z",
        "updatedAt": "2026-06-19T09:00:00.000Z",
        "readTime": 5,
        "summary": "A conversation about waiting, polishing, and the discipline of surfaces that cannot be rushed.",
        "archiveSummary": "Studio notes on time, repetition, and the quiet discipline behind a finish that appears effortless.",
        "image": {
            "url": "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1800&q=90",
            "listUrl": "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1100&q=88",
            "alt": "Artisan hands carefully painting a detailed surface",
            "caption": "The visible finish is only the final trace of repeated hidden stages.",
            "listCaption": "The patience behind lacquer work"
        },
        "tags": [
            "Guide",
            "Lacquer",
            "Artisan"
        ],
        "status": "published",
        "isLead": false,
        "isFeatured": true,
        "content": [
            {
                "type": "paragraph",
                "introduction": true,
                "text": "The artist speaks most often about time. Layers are applied, left alone, returned to, polished, reconsidered, and sometimes removed."
            },
            {
                "type": "paragraph",
                "text": "What appears smooth is not simple. It is the result of many decisions that disappear into the finished surface."
            }
        ]
    },
    {
        "id": "hoi-an",
        "title": "A Slow Morning in Hội An",
        "category": "Places",
        "author": {
            "id": "user-linh-tran",
            "name": "Linh Trần",
            "initials": "LT",
            "role": "Travel editor"
        },
        "createdAt": "2026-06-11T09:00:00.000Z",
        "publishedAt": "2026-06-11T09:00:00.000Z",
        "updatedAt": "2026-06-11T09:00:00.000Z",
        "readTime": 4,
        "summary": "Before the crowds arrive, work resumes at a scale that is easier to miss later in the day.",
        "archiveSummary": "Walking the old town before opening hours reveals a different relationship between tourism, work, and everyday memory.",
        "image": {
            "url": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1800&q=90",
            "listUrl": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1100&q=88",
            "alt": "Warm lanterns in a historic Vietnamese street",
            "caption": "The old town before opening hours.",
            "listCaption": "Hội An before opening hours"
        },
        "tags": [
            "Places",
            "Hội An",
            "Heritage"
        ],
        "status": "published",
        "isLead": false,
        "isFeatured": true,
        "content": [
            {
                "type": "paragraph",
                "introduction": true,
                "text": "At first light, Hội An is less a backdrop and more a working town. Shutters lift. Deliveries arrive. Tea appears at small tables."
            },
            {
                "type": "paragraph",
                "text": "The morning offers a reminder that heritage places contain ordinary routines, not only visitor experiences."
            }
        ]
    },
    {
        "id": "care-guide",
        "title": "How to Live with Handmade Ceramics",
        "category": "Guide",
        "author": {
            "id": "user-thu-ha",
            "name": "Thu Hà",
            "initials": "TH",
            "role": "Care editor"
        },
        "createdAt": "2026-05-30T09:00:00.000Z",
        "publishedAt": "2026-05-30T09:00:00.000Z",
        "updatedAt": "2026-05-30T09:00:00.000Z",
        "readTime": 4,
        "summary": "Care is less about perfection than understanding material behaviour.",
        "archiveSummary": "A practical guide to washing, storing, using, and appreciating irregular handmade ceramic pieces over time.",
        "image": {
            "url": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1800&q=90",
            "listUrl": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=86",
            "alt": "Ceramic cup on a table",
            "caption": "Daily use is part of the life of an object.",
            "listCaption": "Living with handmade ceramics"
        },
        "tags": [
            "Guide",
            "Ceramics",
            "Care"
        ],
        "status": "published",
        "isLead": false,
        "isFeatured": false,
        "content": [
            {
                "type": "paragraph",
                "introduction": true,
                "text": "Start with the maker's guidance whenever it is available. Different clay bodies, glazes, decorations, and firing temperatures behave differently."
            },
            {
                "type": "paragraph",
                "text": "Avoid sudden thermal shock, store pieces where rims are not forced against hard edges, and do not assume every handmade surface is dishwasher-safe."
            }
        ]
    },
    {
        "id": "provenance",
        "title": "Why Provenance Belongs on the Product Page",
        "category": "Guide",
        "author": {
            "id": "team-lang-co-research",
            "name": "Làng & Co. Research Team",
            "initials": "LR",
            "role": "Research"
        },
        "createdAt": "2026-05-22T09:00:00.000Z",
        "publishedAt": "2026-05-22T09:00:00.000Z",
        "updatedAt": "2026-05-22T09:00:00.000Z",
        "readTime": 5,
        "summary": "The information around an object should be designed with the same care as the purchase path.",
        "archiveSummary": "Our approach to documenting who made an object, where it came from, and which claims we choose not to make.",
        "image": {
            "url": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=90",
            "listUrl": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=86",
            "alt": "Team discussing documents and research",
            "caption": "Claims need traceable sources and visible uncertainty.",
            "listCaption": "Researching product provenance"
        },
        "tags": [
            "Guide",
            "Provenance",
            "Research"
        ],
        "status": "published",
        "isLead": false,
        "isFeatured": false,
        "content": [
            {
                "type": "paragraph",
                "introduction": true,
                "text": "A product page should do more than persuade. It should tell a reader what is known, how it is known, and which details remain uncertain."
            },
            {
                "type": "paragraph",
                "text": "That requires structured provenance, editorial review, and a refusal to turn every gap into a confident origin story."
            }
        ]
    },
    {
        "id": "silk",
        "title": "Silk, Light, and the Memory of Touch",
        "category": "Guide",
        "author": {
            "id": "user-ngoc-vy",
            "name": "Ngọc Vy",
            "initials": "NV",
            "role": "Textile contributor"
        },
        "createdAt": "2026-05-14T09:00:00.000Z",
        "publishedAt": "2026-05-14T09:00:00.000Z",
        "updatedAt": "2026-05-14T09:00:00.000Z",
        "readTime": 4,
        "summary": "Textile knowledge is carried through fibre, tension, dye, weather, and hand.",
        "archiveSummary": "What changes when cloth is understood not as decoration, but as a record of fibre, tension, dye, weather, and hand.",
        "image": {
            "url": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1800&q=90",
            "listUrl": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=86",
            "alt": "Textile details and folded fabric",
            "caption": "Cloth changes with light, movement, and use.",
            "listCaption": "Silk, light, and movement"
        },
        "tags": [
            "Guide",
            "Silk",
            "Textile"
        ],
        "status": "published",
        "isLead": false,
        "isFeatured": false,
        "content": [
            {
                "type": "paragraph",
                "introduction": true,
                "text": "A woven surface is never only visual. Its character comes from how fibres resist, bend, catch light, and respond to the body."
            },
            {
                "type": "paragraph",
                "text": "Learning to read silk means paying attention to density, weave, finishing, dye, and the differences that become more visible through use."
            }
        ]
    },
    {
        "id": "community-platform",
        "title": "What a Craft Community Needs from a Platform",
        "category": "Donation",
        "author": {
            "id": "user-huy-ba",
            "name": "Huy Ba",
            "initials": "HB",
            "role": "Community contributor"
        },
        "createdAt": "2026-05-02T09:00:00.000Z",
        "publishedAt": "2026-05-02T09:00:00.000Z",
        "updatedAt": "2026-05-02T09:00:00.000Z",
        "readTime": 5,
        "summary": "Visibility is useful only when it arrives with context, control, and practical value.",
        "archiveSummary": "Notes from conversations with makers about visibility, pricing, context, and the difference between exposure and useful support.",
        "image": {
            "url": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=90",
            "listUrl": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=86",
            "alt": "Small community gathering outdoors",
            "caption": "Platform design begins by listening to the people expected to use it.",
            "listCaption": "Listening to craft communities"
        },
        "tags": [
            "Donation",
            "Community",
            "Support"
        ],
        "status": "published",
        "isLead": false,
        "isFeatured": false,
        "content": [
            {
                "type": "paragraph",
                "introduction": true,
                "text": "In conversations with makers, the same concerns return: pricing pressure, loss of context, copied images, and the burden of maintaining another digital profile."
            },
            {
                "type": "paragraph",
                "text": "A useful platform should reduce those burdens rather than move them around. That means clear ownership controls, realistic moderation, transparent fees, and editorial support that does not erase the maker's voice."
            }
        ]
    },
    {
        "id": "future-draft-example",
        "title": "A Draft Story for My Blog",
        "category": "Guide",
        "author": {
            "id": "user-huy-ba",
            "name": "Huy Ba",
            "initials": "HB",
            "role": "Community contributor"
        },
        "createdAt": "2026-07-08T09:00:00.000Z",
        "publishedAt": null,
        "updatedAt": "2026-07-08T09:00:00.000Z",
        "readTime": 3,
        "summary": "This draft demonstrates that an owner can save an unfinished post without publishing it to the public Journal.",
        "archiveSummary": "A private draft that will appear later in My Blog, but never on the public listing until published.",
        "image": {
            "url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1800&q=90",
            "listUrl": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=86",
            "alt": "Notebook and pen on a desk",
            "caption": "Drafts remain private until their owner publishes them.",
            "listCaption": "Work in progress"
        },
        "tags": [
            "Guide",
            "Draft"
        ],
        "status": "draft",
        "isLead": false,
        "isFeatured": false,
        "content": [
            {
                "type": "paragraph",
                "introduction": true,
                "text": "This post is still being written."
            }
        ]
    }
];

const comments = [
    {
        "id": "comment-dev-1",
        "postId": "developer-mission",
        "parentCommentId": null,
        "author": {
            "id": "user-mai-nguyen",
            "name": "Mai Nguyễn",
            "initials": "MN"
        },
        "content": "I appreciate the distinction between documenting uncertainty and filling information gaps with marketing language.",
        "likedBy": [
            "user-huy-ba"
        ],
        "createdAt": "2026-07-06T11:15:00.000Z",
        "updatedAt": "2026-07-06T11:15:00.000Z",
        "status": "active"
    },
    {
        "id": "reply-dev-1",
        "postId": "developer-mission",
        "parentCommentId": "comment-dev-1",
        "author": {
            "id": "user-huy-ba",
            "name": "Huy Ba",
            "initials": "HB"
        },
        "content": "That distinction was one of the main design priorities.",
        "likedBy": [],
        "createdAt": "2026-07-06T12:00:00.000Z",
        "updatedAt": "2026-07-06T12:00:00.000Z",
        "status": "active"
    },
    {
        "id": "comment-dev-2",
        "postId": "developer-mission",
        "parentCommentId": null,
        "author": {
            "id": "user-trung-kien",
            "name": "Trung Kiên",
            "initials": "TK"
        },
        "content": "Maker-controlled profiles with editorial support could help preserve accurate information.",
        "likedBy": [],
        "createdAt": "2026-07-06T15:30:00.000Z",
        "updatedAt": "2026-07-06T15:30:00.000Z",
        "status": "active"
    },
    {
        "id": "comment-dev-3",
        "postId": "developer-mission",
        "parentCommentId": null,
        "author": {
            "id": "user-an-vy",
            "name": "An Vy",
            "initials": "AV"
        },
        "content": "The relationship between traditional products and charitable support makes the platform more meaningful.",
        "likedBy": [],
        "createdAt": "2026-07-07T08:20:00.000Z",
        "updatedAt": "2026-07-07T08:20:00.000Z",
        "status": "active"
    },
    {
        "id": "comment-bat-trang-1",
        "postId": "bat-trang",
        "parentCommentId": null,
        "author": {
            "id": "user-phuong-linh",
            "name": "Phương Linh",
            "initials": "PL"
        },
        "content": "This is why village names should not be treated as a single aesthetic category.",
        "likedBy": [],
        "createdAt": "2026-06-29T10:00:00.000Z",
        "updatedAt": "2026-06-29T10:00:00.000Z",
        "status": "active"
    }
];

module.exports = {
    developmentActor,
    posts,
    comments,
};