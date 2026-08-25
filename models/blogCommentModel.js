"use strict";

const crypto=require("crypto");
const BlogComment=require("./schemas/BlogComment");

const clean=(value)=>
  String(value||"").trim();

const toRuntimeComment=(comment)=>{
  if(!comment)return null;

  const data=comment.toObject
    ?comment.toObject()
    :comment;

  return{
    ...data,
    id:String(data._id),
    _id:String(data._id)
  };
};

const buildAuthor=(user={})=>({
  id:clean(user.id),
  name:clean(
    user.name||
    user.username||
    "User"
  ),
  initials:clean(
    user.initials||
    "U"
  )
});

const decorateComment=(
  comment,
  currentUserId
)=>{
  const data=toRuntimeComment(comment);
  const likedBy=Array.isArray(data.likedBy)
    ?data.likedBy
    :[];

  return{
    ...data,
    likedBy,
    likeCount:likedBy.length,
    likedByCurrentUser:Boolean(
      currentUserId&&
      likedBy.includes(clean(currentUserId))
    )
  };
};

const getCommentsByPostId=async(
  postId,
  currentUserId=null
)=>{
  const comments=await BlogComment.find({
    postId:clean(postId),
    status:"active"
  }).lean();

  const activeComments=
    comments.map(toRuntimeComment);

  const roots=activeComments
    .filter((comment)=>
      !comment.parentCommentId
    )
    .sort(
      (a,b)=>
        new Date(b.createdAt)-
        new Date(a.createdAt)
    );

  return roots.map((root)=>{
    const replies=activeComments
      .filter(
        (comment)=>
          comment.parentCommentId===root.id
      )
      .sort(
        (a,b)=>
          new Date(a.createdAt)-
          new Date(b.createdAt)
      )
      .map(
        (reply)=>
          decorateComment(
            reply,
            currentUserId
          )
      );

    return{
      ...decorateComment(
        root,
        currentUserId
      ),
      replyCount:replies.length,
      replies
    };
  });
};

const countCommentsByPostId=async(postId)=>
  BlogComment.countDocuments({
    postId:clean(postId),
    status:"active"
  });

const addComment=async(
  postId,
  user,
  content
)=>{
  const id=clean(postId);
  const author=buildAuthor(user);
  const cleanContent=clean(content);

  if(
    !id||
    !author.id||
    !cleanContent
  ){
    return{
      ok:false,
      reason:"invalid-input"
    };
  }

  const comment=await BlogComment.create({
    _id:crypto.randomUUID(),
    postId:id,
    parentCommentId:null,
    author,
    content:cleanContent,
    likedBy:[],
    status:"active"
  });

  return{
    ok:true,
    comment:toRuntimeComment(comment)
  };
};

const addReply=async(
  postId,
  parentCommentId,
  user,
  content
)=>{
  const id=clean(postId);
  const author=buildAuthor(user);
  const cleanContent=clean(content);

  if(
    !id||
    !author.id||
    !cleanContent
  ){
    return{
      ok:false,
      reason:"invalid-input"
    };
  }

  const parent=await BlogComment.findOne({
    _id:clean(parentCommentId),
    postId:id,
    status:"active"
  }).lean();

  if(!parent){
    return{
      ok:false,
      reason:"parent-not-found"
    };
  }

  const rootId=
    parent.parentCommentId||
    String(parent._id);

  const reply=await BlogComment.create({
    _id:crypto.randomUUID(),
    postId:id,
    parentCommentId:rootId,
    author,
    content:cleanContent,
    likedBy:[],
    status:"active"
  });

  return{
    ok:true,
    reply:toRuntimeComment(reply)
  };
};

const toggleLike=async(
  postId,
  commentId,
  userId
)=>{
  const actorId=clean(userId);

  if(!actorId){
    return{
      ok:false,
      reason:"user-required"
    };
  }

  const comment=await BlogComment.findOne({
    _id:clean(commentId),
    postId:clean(postId),
    status:"active"
  });

  if(!comment){
    return{
      ok:false,
      reason:"comment-not-found"
    };
  }

  const likedBy=Array.isArray(comment.likedBy)
    ?comment.likedBy
    :[];

  const index=likedBy.indexOf(actorId);
  const liked=index===-1;

  if(liked){
    likedBy.push(actorId);
  }else{
    likedBy.splice(index,1);
  }

  comment.likedBy=likedBy;
  await comment.save();

  return{
    ok:true,
    liked,
    likeCount:likedBy.length
  };
};

const deleteComment=async(
  postId,
  commentId,
  actorId,
  postOwnerId
)=>{
  const comment=await BlogComment.findOne({
    _id:clean(commentId),
    postId:clean(postId)
  }).lean();

  if(!comment){
    return{
      ok:false,
      reason:"comment-not-found"
    };
  }

  const actor=clean(actorId);

  const canDelete=
    actor&&
    (
      clean(comment.author?.id)===actor||
      clean(postOwnerId)===actor
    );

  if(!canDelete){
    return{
      ok:false,
      reason:"forbidden"
    };
  }

  if(comment.parentCommentId){
    await BlogComment.deleteOne({
      _id:String(comment._id)
    });
  }else{
    await BlogComment.deleteMany({
      $or:[
        {_id:String(comment._id)},
        {parentCommentId:String(comment._id)}
      ]
    });
  }

  return{ok:true};
};

const deleteCommentsByPostId=async(postId)=>{
  const result=await BlogComment.deleteMany({
    postId:clean(postId)
  });

  return{
    ok:true,
    deletedCount:result.deletedCount||0
  };
};

module.exports={
  addComment,
  addReply,
  countCommentsByPostId,
  deleteComment,
  deleteCommentsByPostId,
  getCommentsByPostId,
  toggleLike
};