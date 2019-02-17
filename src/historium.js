const list = document.getElementsByClassName('group')[0];

for (let i=0; i<10; i++) {
  const item = document.createElement('h-item');
  item.config = data[i];
  list.appendChild(item);
}