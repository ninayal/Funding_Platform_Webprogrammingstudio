"use strict";

const {
    randomUUID,
} = require("node:crypto");

const Product = require(
    "./schemas/Product"
);

const CATEGORIES = [
    {
        value: "ceramics",
        label: "Ceramics",
    },
    {
        value: "painting",
        label: "Painting",
    },
    {
        value: "brocade",
        label: "Brocade",
    },
    {
        value: "bamboo",
        label: "Bamboo",
    },
    {
        value: "wood",
        label: "Wood",
    },
    {
        value: "incense",
        label: "Incense",
    },
    {
        value: "stone",
        label: "Fengshui Stone",
    },
    {
        value: "waterpuppet",
        label: "Water Puppets",
    },
];

const CATEGORY_MATERIAL_DEFAULTS = {
    ceramics: "Glazed ceramic",
    painting: "Hand-painted lacquer",
    brocade: "Woven brocade",
    bamboo: "Woven bamboo",
    wood: "Carved wood",
    incense: "Natural incense",
    stone: "Fengshui Stone",
    waterpuppet: "Lacquered wood",
};

const CRAFT_VILLAGES = [
    "Bát Tràng",
    "Vạn Phúc",
    "Quảng Phú Cầu",
    "Đông Hồ",
    "Non Nước",
    "Đào Thục",
    "Đồng Kỵ",
    "Làng & Co. Workshop",
];

const MATERIALS = [
    "Glazed ceramic",
    "Painted ceramic",
    "Woven brocade",
    "Brocade textile",
    "Cinnamon incense",
    "Natural incense",
    "Printed paper",
    "Natural stone",
    "Jade-coloured stone",
    "Painted wood",
    "Carved wood",
];

const slugify = (value) =>
    String(value || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );

const buildDefaultThumbnails = (
    product
) => {
    const labels = [
        "front view",
        "detail view",
        "side view",
        "styled view",
    ];

    return labels.map(
        (label) => ({
            image: product.image,
            alt: `${product.name}, ${label}`,
        })
    );
};

const buildStorefrontProduct = (
    input
) => {
    const product = {
        ...input,

        slug:
            input.slug ||
            slugify(input.name),

        makerDisplay:
            `${input.maker} · ${input.makerLocation}`,

        thumbnails:
            Array.isArray(
                input.thumbnails
            ) &&
                input.thumbnails.length
                ? input.thumbnails
                : buildDefaultThumbnails(
                    input
                ),

        meta:
            Array.isArray(input.meta) &&
                input.meta.length
                ? input.meta
                : [
                    `Stock available: ${input.stock}`,
                    "Prepared and shipped from Việt Nam",
                    "Packed with protective reused materials",
                ],
    };

    if (
        !Array.isArray(
            product.sizes
        ) ||
        !product.sizes.length
    ) {
        product.sizes = [
            {
                id: "standard",
                label:
                    product.variant ||
                    "Standard",
                isDefault: true,
            },
        ];
    }

    return Object.freeze(
        product
    );
};

const toRuntimeProduct = (
    product
) => {
    if (!product) return null;

    return {
        ...product,
        id: String(product._id),
        _id: String(product._id),
    };
};

const getAllProducts = async () => {
    const products =
        await Product.find()
            .sort({
                createdAt: -1,
            })
            .lean();

    return products.map(
        toRuntimeProduct
    );
};

const findProductById = async (
    id
) => {
    const product =
        await Product.findById(
            String(id)
        ).lean();

    return toRuntimeProduct(
        product
    );
};

const createProduct = async (
    data
) => {
    const product =
        await Product.create({
            ...data,
            _id: randomUUID(),
        });

    return toRuntimeProduct(
        product.toObject()
    );
};

const updateProduct = async (
    id,
    updates
) => {
    const product =
        await Product.findByIdAndUpdate(
            String(id),
            {
                $set: updates,
            },
            {
                new: true,
                runValidators: true,
            }
        ).lean();

    return toRuntimeProduct(
        product
    );
};

const deleteProduct = async (
    id
) => {
    const product =
        await Product.findByIdAndDelete(
            String(id)
        ).lean();

    return toRuntimeProduct(
        product
    );
};

const getCategoryLabel = (
    value
) =>
    CATEGORIES.find(
        (category) =>
            category.value === value
    )?.label || "Handmade";

const buildThumbnailsFromImages = (
    images,
    name
) => {
    const gallery =
        images.filter(Boolean);

    if (!gallery.length) {
        return undefined;
    }

    return gallery.map(
        (image, index) => ({
            image,
            alt:
                `${name}, photo ` +
                `${index + 1}`,
        })
    );
};

const splitIntoParagraphs = (
    description
) => {
    const paragraphs =
        String(description || "")
            .split(/\n\s*\n/)
            .map(
                (part) => part.trim()
            )
            .filter(Boolean);

    return paragraphs.length
        ? paragraphs
        : [
            String(
                description || ""
            ),
        ];
};

const toStorefrontProduct = (
    product,
    index
) => {
    const images =
        Array.isArray(
            product.images
        )
            ? product.images.filter(
                Boolean
            )
            : [];

    const categoryLabel =
        getCategoryLabel(
            product.category
        );

    const material =
        product.material ||
        CATEGORY_MATERIAL_DEFAULTS[
        product.category
        ] ||
        "Handmade";

    const maker =
        product.maker ||
        "Làng & Co. Workshop";

    const makerLocation =
        product.makerLocation ||
        "Việt Nam";

    const description =
        String(
            product.description || ""
        );

    const shortDescription =
        description.length > 200
            ? `${description
                .slice(0, 200)
                .trim()}…`
            : description;

    const longDescription =
        splitIntoParagraphs(
            description
        );

    const specifications =
        Array.isArray(
            product.specifications
        ) &&
            product.specifications.length
            ? product.specifications
            : [
                {
                    label: "Category",
                    value: categoryLabel,
                },
                {
                    label: "Material",
                    value: material,
                },
                {
                    label:
                        "Packed weight",
                    value:
                        `${product.weightGram} g`,
                },
                {
                    label: "Stock",
                    value:
                        `${product.stock} available`,
                },
            ];

    const makerNote =
        product.makerNote || {
            seal: "Làng & Co.",
            quote:
                "Every piece we add to the shop is chosen and checked by our team before it reaches you.",
            cite:
                "— Làng & Co. team",
        };

    return buildStorefrontProduct({
        id: product.id,
        category: product.category,
        categoryLabel,
        maker,
        makerLocation,
        material,

        name: product.title,
        price:
            Number(product.price),

        oldPrice:
            product.oldPrice != null
                ? Number(
                    product.oldPrice
                )
                : null,

        tag: product.tag || "",

        variant:
            product.variant ||
            "Standard",

        availability:
            product.stock > 5
                ? "in-stock"
                : product.stock > 0
                    ? "low-stock"
                    : "out-of-stock",

        stock:
            Number(product.stock),

        image:
            images[0] ||
            "/images/logo.png",

        alt:
            product.alt ||
            `${product.title} product photo`,

        featuredOrder:
            product.featuredOrder ??
            500 + index,

        shortDescription,
        longDescription,

        thumbnails:
            buildThumbnailsFromImages(
                images,
                product.title
            ),

        sizes: product.sizes,
        makerNote,
        specifications,
    });
};

const getAvailableStorefrontProducts =
    async () => {
        const products =
            await Product.find({
                status: "published",
                stock: {
                    $gt: 0,
                },
            })
                .sort({
                    featuredOrder: 1,
                })
                .lean();

        return products
            .map(toRuntimeProduct)
            .map(
                toStorefrontProduct
            );
    };

module.exports = {
    CATEGORIES,
    CRAFT_VILLAGES,
    MATERIALS,
    getAllProducts,
    findProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAvailableStorefrontProducts,
};