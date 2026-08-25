"use strict";

const blogModel=require("../models/blogModel");
const blogCommentModel=require("../models/blogCommentModel");
const {
  CATEGORY_ORDER,
  contentToText,
  normalisePostInput,
  validateCommentContent,
  validatePost
}=require("../validators/blogValidators");

const requestWantsJson=(req)=>{
  const accept=req.get("accept")||"";
  return req.xhr||accept.includes("application/json");
};

const formatDate=(value)=>{
  if(!value)return"Unpublished draft";

  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return"";

  return new Intl.DateTimeFormat("en-US",{
    month:"long",
    day:"numeric",
    year:"numeric"
  }).format(date);
};

const toCategorySlug=(category)=>
  String(category||"")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"");

const getCurrentUser=(req)=>
  req.currentUser||
  req.session?.user||
  null;

const redirectToLogin=(req,res)=>{
  const redirect=encodeURIComponent(
    req.originalUrl||"/blog"
  );

  return res.redirect(
    `/shared/login?redirect=${redirect}`
  );
};

const preparePostForView=(req,post)=>{
  if(!post)return null;

  const url=
    `/blog/${encodeURIComponent(post.id)}`;

  const absoluteUrl=
    `${req.protocol}://${req.get("host")}${url}`;

  const searchableText=[
    post.title,
    post.category,
    post.author?.name,
    post.summary,
    post.archiveSummary,
    ...(post.tags||[])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return{
    ...post,
    categorySlug:toCategorySlug(post.category),
    displayDate:formatDate(
      post.publishedAt||
      post.updatedAt
    ),
    url,
    absoluteUrl,
    searchableText,
    shareEmailUrl:
      `mailto:?subject=${encodeURIComponent(
        `${post.title} — Làng & Co.`
      )}&body=${encodeURIComponent(
        `${post.summary}\n\n${absoluteUrl}`
      )}`
  };
};

const toDateInputValue=(value)=>{
  const date=value
    ?new Date(value)
    :new Date();

  if(Number.isNaN(date.getTime()))return"";

  return date
    .toISOString()
    .slice(0,10);
};

const getPostFormValues=(post={})=>({
  title:post.title||"",
  category:post.category||"Guide",
  tags:Array.isArray(post.tags)
    ?post.tags.join(", ")
    :"",
  imageUrl:post.image?.url||"",
  imageAlt:post.image?.alt||"",
  imageCaption:post.image?.caption||"",
  summary:post.summary||"",
  archiveSummary:post.archiveSummary||"",
  content:contentToText(post.content||[]),
  readTime:post.readTime||5,
  status:post.status||"draft",
  dateAdded:toDateInputValue(
    post.createdAt||
    post.publishedAt||
    post.updatedAt
  ),
  displayDate:
    post.publishedAt||post.updatedAt
      ?formatDate(
        post.publishedAt||
        post.updatedAt
      )
      :"Not published"
});

const calculateDraftCompletion=(post)=>{
  const requiredSections=[
    Boolean(String(post.title||"").trim()),
    Boolean(String(post.summary||"").trim()),
    Boolean(post.image?.url),
    Boolean(
      Array.isArray(post.content)&&
      post.content.some((block)=>
        String(block.text||"").trim()
      )
    ),
    Boolean(
      Array.isArray(post.tags)&&
      post.tags.length>0
    )
  ];

  const completed=
    requiredSections.filter(Boolean).length;

  return Math.round(
    (completed/requiredSections.length)*100
  );
};

const prepareMyPostForView=async(req,post)=>{
  const preparedPost=
    preparePostForView(req,post);

  const status=
    post.status==="published"
      ?"published"
      :"draft";

  const commentCount=
    await blogCommentModel
      .countCommentsByPostId(post.id);

  return{
    ...preparedPost,
    status,
    statusLabel:
      status==="published"
        ?"Published"
        :"Draft",
    dateText:
      status==="draft"
        ?`Last edited ${preparedPost.displayDate}`
        :preparedPost.displayDate,
    dateTime:
      post.publishedAt||
      post.updatedAt||
      "",
    editUrl:
      `/blog/${encodeURIComponent(post.id)}/edit`,
    imageUrl:
      post.image?.listUrl||
      post.image?.url||
      "/images/blog-placeholder.jpg",
    imageAlt:
      post.image?.alt||
      post.title||
      "Blog post image",
    summary:
      post.archiveSummary||
      post.summary||
      "No summary has been added.",
    commentCount,
    draftCompletion:
      status==="draft"
        ?calculateDraftCompletion(post)
        :100
  };
};

const prepareCommentsForView=async(
  post,
  currentUser
)=>{
  const comments=
    await blogCommentModel
      .getCommentsByPostId(
        post.id,
        currentUser?.id||null
      );

  return comments.map((comment)=>({
    ...comment,
    displayDate:formatDate(comment.createdAt),
    canDelete:Boolean(
      currentUser&&
      (
        String(comment.author.id)===
          String(currentUser.id)||
        String(post.author.id)===
          String(currentUser.id)
      )
    ),
    replies:comment.replies.map((reply)=>({
      ...reply,
      displayDate:formatDate(reply.createdAt),
      canDelete:Boolean(
        currentUser&&
        (
          String(reply.author.id)===
            String(currentUser.id)||
          String(post.author.id)===
            String(currentUser.id)
        )
      )
    }))
  }));
};

const getSharedViewData=async(req)=>{
  const currentUser=getCurrentUser(req);

  return{
    myPostCount:currentUser
      ?await blogModel
        .countPostsByAuthorId(currentUser.id)
      :0,
    blogActor:currentUser
  };
};

const getCategoriesForView=async()=>{
  const categories=
    await blogModel.getCategories();

  const available=new Set(categories);

  const ordered=CATEGORY_ORDER.filter(
    (category)=>available.has(category)
  );

  const remaining=[
    ...available
  ].filter(
    (category)=>!ordered.includes(category)
  );

  return[
    ...ordered,
    ...remaining
  ].map((name)=>({
    name,
    slug:toCategorySlug(name)
  }));
};

const getNotice=(query)=>{
  if(query.reply==="added"){
    return"Your reply was posted.";
  }

  if(query.comment==="deleted"){
    return"The comment was deleted.";
  }

  return"";
};

const buildBlogViewData=async(
  req,
  post,
  options={}
)=>{
  const currentUser=getCurrentUser(req);
  const preparedPost=preparePostForView(req,post);

  const [
    commentCount,
    comments,
    relatedPosts,
    sharedData
  ]=await Promise.all([
    blogCommentModel.countCommentsByPostId(
      post.id
    ),
    prepareCommentsForView(
      post,
      currentUser
    ),
    blogModel.getRelatedPosts(
      post.id,
      3
    ),
    getSharedViewData(req)
  ]);

  preparedPost.commentCount=commentCount;

  return{
    ...sharedData,
    pageTitle:preparedPost.title,
    post:preparedPost,
    comments,
    relatedPosts:relatedPosts.map(
      (relatedPost)=>
        preparePostForView(req,relatedPost)
    ),
    commentErrors:options.commentErrors||{},
    commentValues:options.commentValues||{},
    replyErrors:options.replyErrors||{},
    replyValues:options.replyValues||{},
    openReplyId:options.openReplyId||"",
    notice:options.notice||""
  };
};

const getBlogPage=async(req,res,next)=>{
  try{
    const [
      rawPosts,
      categories,
      leadStory,
      featuredPosts,
      sharedData
    ]=await Promise.all([
      blogModel.getPublishedPosts(),
      getCategoriesForView(),
      blogModel.getLeadStory(),
      blogModel.getFeaturedPosts(),
      getSharedViewData(req)
    ]);

    return res.render("blog/blog",{
      ...sharedData,
      pageTitle:"Journal",
      pageSubtitle:"Stories, thoughts and ideas.",
      categories,
      posts:rawPosts.map(
        (post)=>preparePostForView(req,post)
      ),
      leadStory:preparePostForView(
        req,
        leadStory
      ),
      featuredPosts:featuredPosts.map(
        (post)=>preparePostForView(req,post)
      )
    });
  }catch(error){
    return next(error);
  }
};

const getBlogViewPage=async(req,res,next)=>{
  try{
    const currentUser=getCurrentUser(req);

    const post=
      await blogModel.getVisiblePostById(
        req.params.id,
        currentUser?.id||null
      );

    if(!post){
      return res
        .status(404)
        .send("Blog post not found.");
    }

    const viewData=
      await buildBlogViewData(
        req,
        post,
        {
          notice:getNotice(req.query),
          openReplyId:
            req.query.openReply||""
        }
      );

    return res.render(
      "blog/blogview",
      viewData
    );
  }catch(error){
    return next(error);
  }
};

const addComment=async(req,res,next)=>{
  try{
    const currentUser=getCurrentUser(req);

    if(!currentUser){
      return redirectToLogin(req,res);
    }

    const post=
      await blogModel.getVisiblePostById(
        req.params.id,
        currentUser.id
      );

    if(
      !post||
      post.status!=="published"
    ){
      return res
        .status(404)
        .send("Blog post not found.");
    }

    const {content,errors}=
      validateCommentContent(
        req.body.comment,
        "Comment"
      );

    if(Object.keys(errors).length){
      const viewData=
        await buildBlogViewData(
          req,
          post,
          {
            commentErrors:{
              comment:errors.content
            },
            commentValues:{
              comment:content
            }
          }
        );

      return res
        .status(422)
        .render(
          "blog/blogview",
          viewData
        );
    }

    const result=
      await blogCommentModel.addComment(
        post.id,
        currentUser,
        content
      );

    if(result?.ok===false){
      return res
        .status(400)
        .send(
          "Comment could not be posted."
        );
    }

    return res.redirect(
      `/blog/${encodeURIComponent(
        post.id
      )}#comments`
    );
  }catch(error){
    return next(error);
  }
};

const addReply=async(req,res,next)=>{
  try{
    const currentUser=getCurrentUser(req);

    if(!currentUser){
      return redirectToLogin(req,res);
    }

    const post=
      await blogModel.getVisiblePostById(
        req.params.id,
        currentUser.id
      );

    if(
      !post||
      post.status!=="published"
    ){
      return res
        .status(404)
        .send("Blog post not found.");
    }

    const {content,errors}=
      validateCommentContent(
        req.body.reply,
        "Reply"
      );

    if(Object.keys(errors).length){
      const commentId=
        req.params.commentId;

      const viewData=
        await buildBlogViewData(
          req,
          post,
          {
            replyErrors:{
              [commentId]:errors.content
            },
            replyValues:{
              [commentId]:content
            },
            openReplyId:commentId
          }
        );

      return res
        .status(422)
        .render(
          "blog/blogview",
          viewData
        );
    }

    const result=
      await blogCommentModel.addReply(
        post.id,
        req.params.commentId,
        currentUser,
        content
      );

    if(result?.ok===false){
      return res
        .status(404)
        .send(
          "Parent comment not found."
        );
    }

    return res.redirect(
      `/blog/${encodeURIComponent(post.id)}`+
      `?reply=added`+
      `&openReply=${encodeURIComponent(
        req.params.commentId
      )}`+
      `#comment-${encodeURIComponent(
        req.params.commentId
      )}`
    );
  }catch(error){
    return next(error);
  }
};

const toggleCommentLike=async(
  req,
  res,
  next
)=>{
  try{
    const currentUser=getCurrentUser(req);

    if(!currentUser){
      if(requestWantsJson(req)){
        return res.status(401).json({
          ok:false,
          message:"Login required."
        });
      }

      return redirectToLogin(req,res);
    }

    const post=
      await blogModel.getVisiblePostById(
        req.params.id,
        currentUser.id
      );

    if(!post){
      if(requestWantsJson(req)){
        return res.status(404).json({
          ok:false,
          message:"Blog post not found."
        });
      }

      return res
        .status(404)
        .send("Blog post not found.");
    }

    const result=
      await blogCommentModel.toggleLike(
        post.id,
        req.params.commentId,
        currentUser.id
      );

    if(
      !result||
      result.ok===false
    ){
      if(requestWantsJson(req)){
        return res.status(404).json({
          ok:false,
          message:"Comment not found."
        });
      }

      return res
        .status(404)
        .send("Comment not found.");
    }

    if(requestWantsJson(req)){
      return res.json(result);
    }

    return res.redirect(
      `/blog/${encodeURIComponent(post.id)}`+
      `#comment-${encodeURIComponent(
        req.params.commentId
      )}`
    );
  }catch(error){
    return next(error);
  }
};

const deleteComment=async(req,res,next)=>{
  try{
    const currentUser=getCurrentUser(req);

    if(!currentUser){
      return redirectToLogin(req,res);
    }

    const post=
      await blogModel.getPostById(
        req.params.id
      );

    if(!post){
      return res
        .status(404)
        .send("Blog post not found.");
    }

    const result=
      await blogCommentModel.deleteComment(
        post.id,
        req.params.commentId,
        currentUser.id,
        post.author.id
      );

    if(
      !result||
      result.ok===false
    ){
      return res
        .status(
          result?.reason==="forbidden"
            ?403
            :404
        )
        .send(
          "Comment could not be deleted."
        );
    }

    return res.redirect(
      `/blog/${encodeURIComponent(
        post.id
      )}?comment=deleted#comments`
    );
  }catch(error){
    return next(error);
  }
};

const getMyPostsPage=async(req,res,next)=>{
  try{
    const currentUser=getCurrentUser(req);

    if(!currentUser){
      return redirectToLogin(req,res);
    }

    const rawPosts=
      await blogModel.getPostsByAuthorId(
        currentUser.id
      );

    const [
      posts,
      sharedData
    ]=await Promise.all([
      Promise.all(
        rawPosts.map((post)=>
          prepareMyPostForView(req,post)
        )
      ),
      getSharedViewData(req)
    ]);

    const statistics={
      total:posts.length,
      published:posts.filter(
        (post)=>post.status==="published"
      ).length,
      drafts:posts.filter(
        (post)=>post.status==="draft"
      ).length
    };

    const author={
      ...currentUser,
      description:
        currentUser.description||
        currentUser.about||
        ""
    };

    return res.render("blog/my_posts",{
      ...sharedData,
      pageTitle:"My Blog Posts",
      author,
      statistics,
      posts
    });
  }catch(error){
    return next(error);
  }
};

const renderPostForm=async(
  req,
  res,
  {
    mode,
    post=null,
    values={},
    errors={},
    status=200
  }
)=>{
  const currentUser=getCurrentUser(req);

  if(!currentUser){
    return redirectToLogin(req,res);
  }

  const preparedPost=post
    ?preparePostForView(req,post)
    :null;

  const formValues={
    ...getPostFormValues(post||{}),
    ...values
  };

  const author={
    ...(post?.author||currentUser)
  };

  const [
    commentCount,
    sharedData
  ]=await Promise.all([
    post
      ?blogCommentModel
        .countCommentsByPostId(post.id)
      :0,
    getSharedViewData(req)
  ]);

  const previewStats={
    commentCount,
    viewCount:Number(
      post?.viewCount||0
    ),
    lastEdited:post?.updatedAt
      ?formatDate(post.updatedAt)
      :"Not saved yet"
  };

  return res
    .status(status)
    .render("blog/post_edit",{
      ...sharedData,
      pageTitle:
        mode==="create"
          ?"Create Blog Post"
          :"Edit Blog Post",
      mode,
      post:preparedPost,
      author,
      values:formValues,
      errors,
      categories:CATEGORY_ORDER,
      previewStats
    });
};

const getCreatePostPage=async(
  req,
  res,
  next
)=>{
  try{
    return await renderPostForm(
      req,
      res,
      {
        mode:"create",
        values:{
          dateAdded:toDateInputValue(
            new Date()
          ),
          status:"draft",
          category:"Guide",
          readTime:5
        }
      }
    );
  }catch(error){
    return next(error);
  }
};

const getPostEditPage=async(
  req,
  res,
  next
)=>{
  try{
    const currentUser=getCurrentUser(req);

    if(!currentUser){
      return redirectToLogin(req,res);
    }

    const post=
      await blogModel.getPostById(
        req.params.id
      );

    if(!post){
      return res
        .status(404)
        .send("Blog post not found.");
    }

    if(
      String(post.author?.id)!==
      String(currentUser.id)
    ){
      return res
        .status(403)
        .send(
          "You cannot edit this post."
        );
    }

    return await renderPostForm(
      req,
      res,
      {
        mode:"edit",
        post
      }
    );
  }catch(error){
    return next(error);
  }
};

const createPost=async(req,res,next)=>{
  try{
    const currentUser=getCurrentUser(req);

    if(!currentUser){
      return redirectToLogin(req,res);
    }

    const values=
      normalisePostInput(req.body);

    const errors=
      validatePost(values,{
        draft:values.status==="draft"
      });

    if(Object.keys(errors).length){
      return await renderPostForm(
        req,
        res,
        {
          mode:"create",
          values:{
            ...req.body,
            status:values.status
          },
          errors,
          status:422
        }
      );
    }

    const post=
      await blogModel.createPost(
        values,
        currentUser
      );

    return res.redirect(
      `/blog/${encodeURIComponent(
        post.id
      )}`
    );
  }catch(error){
    return next(error);
  }
};

const updatePost=async(req,res,next)=>{
  try{
    const currentUser=getCurrentUser(req);

    if(!currentUser){
      return redirectToLogin(req,res);
    }

    const existing=
      await blogModel.getPostById(
        req.params.id
      );

    if(!existing){
      return res
        .status(404)
        .send("Blog post not found.");
    }

    if(
      String(existing.author?.id)!==
      String(currentUser.id)
    ){
      return res
        .status(403)
        .send(
          "You cannot edit this post."
        );
    }

    const status=
      req.body.status||
      existing.status;

    const values=
      normalisePostInput(
        req.body,
        status
      );

    const errors=
      validatePost(values,{
        draft:status==="draft"
      });

    if(Object.keys(errors).length){
      return await renderPostForm(
        req,
        res,
        {
          mode:"edit",
          post:existing,
          values:{
            ...req.body,
            status
          },
          errors,
          status:422
        }
      );
    }

    const result=
      await blogModel.updatePost(
        existing.id,
        currentUser.id,
        {
          ...values,
          image:{
            url:values.imageUrl,
            listUrl:values.imageUrl,
            alt:values.imageAlt,
            caption:values.imageCaption,
            listCaption:
              values.imageCaption
          }
        }
      );

    if(
      !result||
      result.ok===false
    ){
      return res
        .status(
          result?.reason==="forbidden"
            ?403
            :404
        )
        .send(
          "Blog post could not be updated."
        );
    }

    return res.redirect(
      `/blog/${encodeURIComponent(
        result.post.id
      )}`
    );
  }catch(error){
    return next(error);
  }
};

const deletePost=async(req,res,next)=>{
  try{
    const currentUser=getCurrentUser(req);

    if(!currentUser){
      return redirectToLogin(req,res);
    }

    const result=
      await blogModel.deletePost(
        req.params.id,
        currentUser.id
      );

    if(
      !result||
      result.ok===false
    ){
      return res
        .status(
          result?.reason==="forbidden"
            ?403
            :404
        )
        .send(
          "Blog post could not be deleted."
        );
    }

    await blogCommentModel
      .deleteCommentsByPostId(
        req.params.id
      );

    return res.redirect(
      "/blog/my-posts"
    );
  }catch(error){
    return next(error);
  }
};

module.exports={
  addComment,
  addReply,
  createPost,
  deleteComment,
  deletePost,
  getBlogPage,
  getBlogViewPage,
  getCreatePostPage,
  getMyPostsPage,
  getPostEditPage,
  toggleCommentLike,
  updatePost
};