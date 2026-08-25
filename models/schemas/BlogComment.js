"use strict";

const mongoose=require("mongoose");

const authorSchema=new mongoose.Schema({
  id:{type:String,ref:"Users",required:true},
  name:{type:String,required:true,trim:true},
  initials:{type:String,default:"",trim:true}
},{_id:false});

const blogCommentSchema=new mongoose.Schema({
  _id:{type:String,required:true},
  postId:{type:String,ref:"BlogPosts",required:true,index:true},
  parentCommentId:{
    type:String,
    ref:"BlogComments",
    default:null,
    index:true
  },
  author:{type:authorSchema,required:true},
  content:{type:String,required:true,trim:true},
  likedBy:[{
    type:String,
    ref:"Users"
  }],
  status:{type:String,default:"active",index:true}
},{
  timestamps:true,
  collection:"blogcomments"
});

blogCommentSchema.index({
  postId:1,
  parentCommentId:1,
  createdAt:1
});

blogCommentSchema.index({
  "author.id":1,
  createdAt:-1
});

module.exports=
  mongoose.models.BlogComments||
  mongoose.model("BlogComments",blogCommentSchema);