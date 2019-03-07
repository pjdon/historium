const table = document.getElementById('history');
const finder = new HistoryVisitFinder();
const streamer = new HistoryVisitStreamer();
const display = new HistoryCatalog(table);

function addBlock(historyStreamer, historyDisplay) {
  historyStreamer.getNext().then(visits => {
    visits.forEach(row => historyDisplay.addRow(row));
  });
}

setInterval(() => addBlock(streamer, display), 100);
