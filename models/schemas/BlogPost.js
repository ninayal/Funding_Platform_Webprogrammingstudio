"use strict";

const mongoose=require("mongoose");

const authorSchema=new mongoose.Schema({
  id:{type:String,ref:"Users",required:true},
  name:{type:String,required:true,trim:true},
  initials:{type:String,default:"",trim:true},
  role:{type:String,default:"Author",trim:true}
},{_id:false});

const imageSchema=new mongoose.Schema({
  url:{type:String,default:""},
  listUrl:{type:String,default:""},
  alt:{type:String,default:""},
  caption:{type:String,default:""},
  listCaption:{type:String,default:""}
},{_id:false});

const blogPostSchema=new mongoose.Schema({
  _id:{type:String,required:true},
  title:{type:String,required:true,trim:true},
  category:{type:String,required:true,index:true},
  author:{type:authorSchema,required:true},
  publishedAt:{type:Date,default:null,index:true},
  readTime:{type:Number,default:1,min:1},
  summary:{type:String,default:""},
  archiveSummary:{type:String,default:""},
  image:{type:imageSchema,default:()=>({})},
  tags:{type:[String],default:[]},
  status:{
    type:String,
    enum:["draft","published"],
    default:"draft",
    index:true
  },
  isLead:{type:Boolean,default:false},
  isFeatured:{type:Boolean,default:false},
  content:{type:[mongoose.Schema.Types.Mixed],default:[]}
},{
  timestamps:true,
  collection:"blogposts"
});

blogPostSchema.index({"author.id":1,updatedAt:-1});
blogPostSchema.index({status:1,category:1,publishedAt:-1});
blogPostSchema.index({
  title:"text",
  summary:"text",
  tags:"text"
});

module.exports=
  mongoose.models.BlogPosts||
  mongoose.model("BlogPosts",blogPostSchema);