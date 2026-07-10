// Thread content page — "Comment as user" form handles both new comments and edits.
document.addEventListener('DOMContentLoaded', () => {
  const commentList = document.getElementById('commentList');
  const commentForm = document.getElementById('commentForm');
  const commentInput = document.getElementById('commentInput');
  const commentEditId = document.getElementById('commentEditId');
  const commentSubmit = document.getElementById('commentSubmit');
  const commentCount = document.getElementById('commentCount');

  if (!commentForm) return;

  let nextId = commentList.querySelectorAll('.comment-item').length;

  const updateCommentCount = () => {
    const count = commentList.querySelectorAll('.comment-item').length;
    commentCount.textContent = `${count} comment${count === 1 ? '' : 's'}`;
  };

  const exitEditMode = () => {
    commentEditId.value = '';
    commentSubmit.textContent = 'Send';
    commentList.querySelectorAll('.comment-item--editing')
      .forEach(item => item.classList.remove('comment-item--editing'));
  };

  const buildCommentItem = (id, text) => {
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.dataset.id = id;
    item.innerHTML = `
      <div class="comment-item__body">
        <span class="comment-item__author">YOU</span>
        <p class="comment-item__text"></p>
      </div>
      <button type="button" class="comment-item__edit">Edit</button>
    `;
    item.querySelector('.comment-item__text').textContent = text;
    return item;
  };

  commentList.addEventListener('click', (event) => {
    const editBtn = event.target.closest('.comment-item__edit');
    if (!editBtn) return;

    const item = editBtn.closest('.comment-item');
    commentList.querySelectorAll('.comment-item--editing')
      .forEach(el => el.classList.remove('comment-item--editing'));
    item.classList.add('comment-item--editing');

    commentEditId.value = item.dataset.id || '';
    commentInput.value = item.querySelector('.comment-item__text').textContent;
    commentSubmit.textContent = 'Update';
    commentInput.focus();
  });

  commentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const text = commentInput.value.trim();
    if (!text) return;

    const editId = commentEditId.value;
    if (editId) {
      const item = commentList.querySelector(`.comment-item[data-id="${editId}"]`);
      if (item) item.querySelector('.comment-item__text').textContent = text;
    } else {
      nextId += 1;
      commentList.appendChild(buildCommentItem(String(nextId), text));
    }

    commentForm.reset();
    exitEditMode();
    updateCommentCount();
  });

  updateCommentCount();
});
