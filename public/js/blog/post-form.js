"use strict";

document.addEventListener("DOMContentLoaded",()=>{

const form=document.querySelector("[data-post-form]");
if(!form)return;

const feedback=form.querySelector("[data-post-feedback]");
const draftStorageKey="langco.blog.post.draft";

const getField=name=>
form.querySelector(`[data-post-field="${name}"]`);

const getError=name=>
form.querySelector(`[data-post-error="${name}"]`);


/* DRAFT STORAGE */

const saveDraft=()=>{

const data={};

form.querySelectorAll("[data-post-field]")
.forEach(field=>{
data[field.dataset.postField]=field.value;
});

localStorage.setItem(
draftStorageKey,
JSON.stringify(data)
);

};


const restoreDraft=()=>{

const saved=
localStorage.getItem(draftStorageKey);

if(!saved)return;

try{

const data=JSON.parse(saved);

Object.entries(data)
.forEach(([key,value])=>{

const field=getField(key);

if(field&&!field.value)
field.value=value;

});

}catch{

localStorage.removeItem(
draftStorageKey
);

}

};



/* VALIDATION */

const setError=(name,message)=>{

const field=getField(name);
const error=getError(name);

field?.setAttribute(
"aria-invalid",
message?"true":"false"
);

if(error)
error.textContent=message;

return !message;

};


const validateField=(name,publishing)=>{

const field=getField(name);

if(!field)return true;

const value=field.value.trim();

let message="";


if(name==="title"){

if(!value)
message="Enter a post title.";

else if(value.length>150)
message="Title must not exceed 150 characters.";

else if(
publishing&&
value.length<5
)
message="Published titles require at least 5 characters.";

}


if(name==="category"){

if(!value)
message="Select a category.";

}


if(name==="summary"&&publishing){

if(
value.length<20||
value.length>400
)
message=
"Summary must contain between 20 and 400 characters.";

}


if(name==="content"&&publishing){

if(
value.length<50||
value.length>20000
)
message=
"Content must contain between 50 and 20,000 characters.";

}


if(name==="tags"){

const tags=
value
.split(",")
.map(tag=>tag.trim())
.filter(Boolean);


if(tags.length>12)
message=
"Use no more than 12 tags.";

}


return setError(
name,
message
);

};



const updateCount=(name,max)=>{

const field=getField(name);

const output=
form.querySelector(
`[data-post-count="${name}"]`
);


if(field&&output)
output.textContent=
`${field.value.length} / ${max}`;

};




/* IMAGE UPLOAD */

const dropZone=
document.querySelector(
"[data-image-drop-zone]"
);


const imageInput=
document.querySelector(
"[data-image-input]"
);


const uploadPreview=
document.querySelector(
"[data-image-preview]"
);


const previewImage=
document.querySelector(
"[data-preview-image]"
);


const previewPlaceholder=
document.querySelector(
"[data-preview-placeholder]"
);



const imageMessage=
document.querySelector(
"[data-drop-message]"
);


const uploadSuccess=
document.querySelector(
"[data-upload-success]"
);


const fileName=
document.querySelector(
"[data-file-name]"
);



const showImagePreview=(file)=>{


if(
!file||
!file.type.startsWith("image/")
)
return;


const reader=
new FileReader();


reader.onload=(event)=>{


const image=
event.target.result;



if(uploadPreview){

uploadPreview.src=image;
uploadPreview.hidden=false;

}



if(previewImage){

previewImage.src=image;
previewImage.hidden=false;

}



if(previewPlaceholder)
previewPlaceholder.hidden=true;



if(imageMessage)
imageMessage.hidden=true;



if(uploadSuccess)
uploadSuccess.hidden=false;



if(fileName)
fileName.textContent=
`✓ ${file.name}`;



if(dropZone)
dropZone.classList.add(
"has-image"
);



};



reader.readAsDataURL(file);


};



if(dropZone&&imageInput){


dropZone.addEventListener(
"click",
()=>{
imageInput.click();
}
);



imageInput.addEventListener(
"change",
()=>{

showImagePreview(
imageInput.files[0]
);

}
);



dropZone.addEventListener(
"dragover",
(event)=>{

event.preventDefault();

dropZone.classList.add(
"drag-over"
);

}
);



dropZone.addEventListener(
"dragleave",
()=>{

dropZone.classList.remove(
"drag-over"
);

}
);



dropZone.addEventListener(
"drop",
(event)=>{

event.preventDefault();


dropZone.classList.remove(
"drag-over"
);



const file=
event.dataTransfer.files[0];


if(!file)return;


imageInput.files=
event.dataTransfer.files;


showImagePreview(file);


}
);


}

/* REMOVE IMAGE */

const removeImage=
document.querySelector(
"[data-remove-image]"
);


removeImage?.addEventListener(
"click",
(event)=>{

event.preventDefault();


if(imageInput)
imageInput.value="";


if(uploadPreview){

uploadPreview.src="";
uploadPreview.hidden=true;

}


if(previewImage){

previewImage.src="";
previewImage.hidden=true;

}


if(previewPlaceholder)
previewPlaceholder.hidden=false;


if(imageMessage)
imageMessage.hidden=false;


if(uploadSuccess)
uploadSuccess.hidden=true;


if(fileName)
fileName.textContent="";


if(dropZone)
dropZone.classList.remove(
"has-image"
);

}
);



/* IMAGE VALIDATION */

const validateImage=(publishing)=>{

if(!publishing)
return true;


if(
!imageInput||
imageInput.files.length===0
){

const error=
getError("imageUrl");


if(error)
error.textContent=
"Published posts require an image.";


return false;

}


return true;

};




/* LIVE PREVIEW */

const previewTitle=
document.querySelector(
"[data-preview-title]"
);


const previewSummary=
document.querySelector(
"[data-preview-summary]"
);


const previewCategory=
document.querySelector(
"[data-preview-category]"
);



const updatePreview=()=>{


const title=
getField("title")
?.value
.trim()
||
"Your story title";


const summary=
getField("summary")
?.value
.trim()
||
"Your summary will appear here as you type.";


const category=
getField("category")
?.value
||
"Guide";



if(previewTitle)
previewTitle.textContent=title;


if(previewSummary)
previewSummary.textContent=summary;


if(previewCategory)
previewCategory.textContent=category;


};




/* EVENTS */


form.addEventListener(
"input",
(event)=>{

saveDraft();


const name=
event.target.dataset.postField;


if(name)
validateField(
name,
false
);



updateCount(
"title",
150
);


updateCount(
"summary",
400
);


updateCount(
"content",
20000
);


updatePreview();


}
);



form.addEventListener(
"change",
updatePreview
);



form.addEventListener(
"submit",
(event)=>{


const status=
event.submitter?.value
||
"draft";


const publishing=
status==="published";



const valid=[

validateField(
"title",
publishing
),

validateField(
"category",
publishing
),

validateField(
"tags",
publishing
),

validateField(
"summary",
publishing
),

validateField(
"content",
publishing
),

validateImage(
publishing
)

].every(Boolean);



if(!valid){

event.preventDefault();


if(feedback)
feedback.textContent=
"Correct the highlighted fields before continuing.";


form.querySelector(
'[aria-invalid="true"]'
)?.focus();


return;

}



localStorage.removeItem(
draftStorageKey
);



if(feedback)
feedback.textContent=
publishing
?
"Publishing post..."
:
"Saving draft...";


}
);



/* INITIAL LOAD */

restoreDraft();


updateCount(
"title",
150
);


updateCount(
"summary",
400
);


updateCount(
"content",
20000
);


updatePreview();


});