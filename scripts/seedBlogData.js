"use strict";

require("dotenv").config();

const mongoose=require("mongoose");
const {connectDB}=require("../config/db");
const BlogPost=require("../models/schemas/BlogPost");
const BlogComment=require("../models/schemas/BlogComment");
const {posts,comments}=require("../data/blog");

const toDate=(value)=>{
  const date=new Date(value);
  return Number.isNaN(date.getTime())
    ?new Date()
    :date;
};

const toPost=(post)=>({
  _id:String(post.id),
  title:post.title,
  category:post.category,
  author:post.author,
  publishedAt:post.publishedAt
    ?toDate(post.publishedAt)
    :null,
  readTime:Number(post.readTime)||1,
  summary:post.summary||"",
  archiveSummary:post.archiveSummary||"",
  image:post.image||{},
  tags:Array.isArray(post.tags)
    ?post.tags
    :[],
  status:post.status||"draft",
  isLead:Boolean(post.isLead),
  isFeatured:Boolean(post.isFeatured),
  content:Array.isArray(post.content)
    ?post.content
    :[],
  createdAt:toDate(
    post.createdAt||
    post.publishedAt
  ),
  updatedAt:toDate(
    post.updatedAt||
    post.createdAt||
    post.publishedAt
  )
});

const toComment=(comment)=>({
  _id:String(comment.id),
  postId:String(comment.postId),
  parentCommentId:comment.parentCommentId
    ?String(comment.parentCommentId)
    :null,
  author:comment.author,
  content:comment.content,
  likedBy:Array.isArray(comment.likedBy)
    ?comment.likedBy
    :[],
  status:comment.status||"active",
  createdAt:toDate(comment.createdAt),
  updatedAt:toDate(
    comment.updatedAt||
    comment.createdAt
  )
});

const seed=async()=>{
  await connectDB();

  if(posts.length){
    await BlogPost.bulkWrite(
      posts.map((post)=>({
        updateOne:{
          filter:{_id:String(post.id)},
          update:{
            $setOnInsert:toPost(post)
          },
          upsert:true,
          timestamps:false
        }
      }))
    );
  }

  if(comments.length){
    await BlogComment.bulkWrite(
      comments.map((comment)=>({
        updateOne:{
          filter:{_id:String(comment.id)},
          update:{
            $setOnInsert:toComment(comment)
          },
          upsert:true,
          timestamps:false
        }
      }))
    );
  }

  console.log(
    `[Blog] Seed checked ${posts.length} posts`
  );
  console.log(
    `[Blog] Seed checked ${comments.length} comments`
  );

  await mongoose.disconnect();
};

seed().catch(async(error)=>{
  console.error("[Blog] Seed failed:",error);
  await mongoose.disconnect();
  process.exit(1);
});