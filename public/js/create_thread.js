// Create thread page — "+ Topic" opens an inline input; Enter adds a removable topic pill.
document.addEventListener('DOMContentLoaded', () => {
  const addTopicBtn = document.getElementById('addTopicBtn');
  const topicList = document.getElementById('topicList');

  if (!addTopicBtn) return;

  const addTopicPill = (label) => {
    const pill = document.createElement('span');
    pill.className = 'topic-pill';
    pill.innerHTML = `<span></span><button type="button" class="topic-pill__remove" aria-label="Remove topic">&times;</button>`;
    pill.querySelector('span').textContent = label;
    pill.querySelector('.topic-pill__remove').addEventListener('click', () => pill.remove());
    topicList.appendChild(pill);
  };

  const openTopicInput = () => {
    if (topicList.querySelector('.topic-input')) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'topic-input';
    input.placeholder = 'Topic name';

    const commit = () => {
      const label = input.value.trim();
      if (label) addTopicPill(label);
      input.remove();
    };

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commit();
      } else if (event.key === 'Escape') {
        input.remove();
      }
    });
    input.addEventListener('blur', commit);

    topicList.appendChild(input);
    input.focus();
  };

  addTopicBtn.addEventListener('click', openTopicInput);
});
