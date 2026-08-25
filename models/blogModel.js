"use strict";

const BlogPost=require("./schemas/BlogPost");

const allowedStatuses=new Set([
  "draft",
  "published"
]);

const normaliseId=(value)=>
  String(value||"").trim();

const toRuntimePost=(post)=>{
  if(!post)return null;

  const data=post.toObject
    ?post.toObject()
    :post;

  return{
    ...data,
    id:String(data._id),
    _id:String(data._id)
  };
};

const sortNewestFirst=(postA,postB)=>{
  const dateA=new Date(
    postA.publishedAt||
    postA.updatedAt||
    postA.createdAt||
    0
  ).getTime();

  const dateB=new Date(
    postB.publishedAt||
    postB.updatedAt||
    postB.createdAt||
    0
  ).getTime();

  return dateB-dateA;
};

const createSlug=async(title)=>{
  const baseSlug=
    String(title||"post")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-+|-+$/g,"")||
    "post";

  let slug=baseSlug;
  let counter=2;

  while(await BlogPost.exists({_id:slug})){
    slug=`${baseSlug}-${counter}`;
    counter+=1;
  }

  return slug;
};

const getInitials=(name)=>
  String(name||"User")
    .split(/\s+/)
    .filter(Boolean)
    .map((part)=>part[0])
    .join("")
    .slice(0,2)
    .toUpperCase();

const getPublishedPosts=async()=>{
  const posts=await BlogPost.find({
    status:"published"
  }).lean();

  return posts
    .map(toRuntimePost)
    .sort(sortNewestFirst);
};

const getPostById=async(postId)=>{
  const post=await BlogPost.findById(
    normaliseId(postId)
  ).lean();

  return toRuntimePost(post);
};

const getVisiblePostById=async(
  postId,
  viewerId=null
)=>{
  const post=await getPostById(postId);

  if(!post)return null;

  const canViewDraft=
    post.status==="draft"&&
    normaliseId(viewerId)&&
    normaliseId(viewerId)===
      normaliseId(post.author?.id);

  if(
    post.status!=="published"&&
    !canViewDraft
  ){
    return null;
  }

  return post;
};

const getLeadStory=async()=>{
  const post=await BlogPost.findOne({
    status:"published",
    isLead:true
  }).lean();

  return toRuntimePost(post);
};

const getFeaturedPosts=async()=>{
  const posts=await BlogPost.find({
    status:"published",
    isFeatured:true
  }).lean();

  return posts
    .map(toRuntimePost)
    .sort(sortNewestFirst);
};

const getRelatedPosts=async(
  postId,
  limit=3
)=>{
  const sourcePost=await getPostById(postId);

  if(!sourcePost)return[];

  const posts=await BlogPost.find({
    status:"published",
    _id:{$ne:sourcePost.id}
  }).lean();

  const runtimePosts=
    posts.map(toRuntimePost);

  const sameCategory=
    runtimePosts.filter(
      (post)=>
        post.category===sourcePost.category
    );

  const otherCategories=
    runtimePosts.filter(
      (post)=>
        post.category!==sourcePost.category
    );

  return[
    ...sameCategory,
    ...otherCategories
  ]
    .sort(sortNewestFirst)
    .slice(0,Number(limit)||3);
};

const getPostsByAuthorId=async(authorId)=>{
  const posts=await BlogPost.find({
    "author.id":normaliseId(authorId)
  }).lean();

  return posts
    .map(toRuntimePost)
    .sort(sortNewestFirst);
};

const countPostsByAuthorId=async(authorId)=>
  BlogPost.countDocuments({
    "author.id":normaliseId(authorId)
  });

const getCategories=async()=>{
  const categories=await BlogPost.distinct(
    "category"
  );

  return categories
    .map((category)=>
      String(category||"").trim()
    )
    .filter(Boolean)
    .sort((a,b)=>a.localeCompare(b));
};

const createPost=async(
  postData={},
  owner
)=>{
  if(!owner||!normaliseId(owner.id)){
    throw new Error(
      "An owner is required to create a post."
    );
  }

  const status=allowedStatuses.has(
    postData.status
  )
    ?postData.status
    :"draft";

  const title=
    String(
      postData.title||
      "Untitled draft"
    ).trim()||
    "Untitled draft";

  const imageUrl=
    String(postData.imageUrl||"").trim();

  const imageCaption=
    String(
      postData.imageCaption||""
    ).trim();

  const post=await BlogPost.create({
    _id:await createSlug(title),
    title,
    category:String(
      postData.category||"Guide"
    ).trim(),
    author:{
      id:normaliseId(owner.id),
      name:String(
        owner.name||"Current user"
      ).trim(),
      initials:String(
        owner.initials||
        getInitials(owner.name)
      ).trim(),
      role:String(
        owner.role||"Author"
      ).trim()
    },
    publishedAt:
      status==="published"
        ?new Date()
        :null,
    readTime:
      Number(postData.readTime)||1,
    summary:String(
      postData.summary||""
    ).trim(),
    archiveSummary:String(
      postData.archiveSummary||
      postData.summary||
      ""
    ).trim(),
    image:{
      url:imageUrl,
      listUrl:imageUrl,
      alt:String(
        postData.imageAlt||
        title||
        "Blog image"
      ).trim(),
      caption:imageCaption,
      listCaption:imageCaption
    },
    tags:Array.isArray(postData.tags)
      ?postData.tags
      :[],
    status,
    isLead:Boolean(postData.isLead),
    isFeatured:Boolean(
      postData.isFeatured
    ),
    content:Array.isArray(postData.content)
      ?postData.content
      :[]
  });

  return toRuntimePost(post);
};

const updatePost=async(
  postId,
  ownerId,
  updates={}
)=>{
  const post=await BlogPost.findById(
    normaliseId(postId)
  );

  if(!post){
    return{
      ok:false,
      reason:"not-found"
    };
  }

  if(
    normaliseId(post.author?.id)!==
    normaliseId(ownerId)
  ){
    return{
      ok:false,
      reason:"forbidden"
    };
  }

  const editableFields=[
    "title",
    "category",
    "summary",
    "archiveSummary",
    "readTime",
    "tags",
    "content",
    "isLead",
    "isFeatured"
  ];

  editableFields.forEach((field)=>{
    if(
      Object.prototype
        .hasOwnProperty
        .call(updates,field)
    ){
      post[field]=updates[field];
    }
  });

  if(
    updates.image&&
    typeof updates.image==="object"
  ){
    const currentImage=
      post.image?.toObject
        ?post.image.toObject()
        :post.image||{};

    post.image={
      ...currentImage,
      ...updates.image
    };
  }

  if(allowedStatuses.has(updates.status)){
    const wasDraft=post.status==="draft";

    post.status=updates.status;

    if(
      wasDraft&&
      updates.status==="published"&&
      !post.publishedAt
    ){
      post.publishedAt=new Date();
    }
  }

  await post.save();

  return{
    ok:true,
    post:toRuntimePost(post)
  };
};

const deletePost=async(
  postId,
  ownerId
)=>{
  const post=await BlogPost.findById(
    normaliseId(postId)
  );

  if(!post){
    return{
      ok:false,
      reason:"not-found"
    };
  }

  if(
    normaliseId(post.author?.id)!==
    normaliseId(ownerId)
  ){
    return{
      ok:false,
      reason:"forbidden"
    };
  }

  const deletedPost=toRuntimePost(post);

  await post.deleteOne();

  return{
    ok:true,
    post:deletedPost
  };
};

module.exports={
  getPublishedPosts,
  getPostById,
  getVisiblePostById,
  getLeadStory,
  getFeaturedPosts,
  getRelatedPosts,
  getPostsByAuthorId,
  countPostsByAuthorId,
  getCategories,
  createPost,
  updatePost,
  deletePost
};