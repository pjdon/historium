const list = document.getElementById('history');

// for (let i=0; i<10; i++) {
//   const item = document.createElement('h-item');
//   item.config = data[i];
//   list.appendChild(item);
// }

let group = document.createElement('h-group')
group.items = data.slice(0,10);
list.appendChild(group);
group = document.createElement('h-group')
group.items = data.slice(10,20);
list.appendChild(group);

const history = new HistoryApi();