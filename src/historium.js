const target = document.getElementById('history');

const history = new HistoryApi();
const list = new ListApi(target, history);

list.addTemp();

