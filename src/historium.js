const table = document.getElementById('history');
const finder = new HistoryVisitFinder();
const streamer = new HistoryVisitStreamer();
const display = new HistoryCatalog(table);

const RateLimited = function (callback, msRateLimit, limitedCallback, startLimited = false) {
  let limited = startLimited;
  const reset = () => limited = false;
  return function () {
    if (!limited) {
      limited = true;
      setTimeout(reset, msRateLimit);
      return callback();
    }
    else if (typeof limitedCallback === "function") {
      return limitedCallback();
    }
  }
}

const bufferDist = 200;

function addBlock(historyStreamer, historyDisplay) {
  historyStreamer.getNext().then(visits => {
    visits.forEach(row => historyDisplay.addRow(row));
  });
}

addBlock(streamer, display);

const loadOnReachedEnd = RateLimited(
  addBlock.bind(this, streamer, display), 500
);

window.addEventListener('scroll', event => {
  if (window.scrollMaxY - event.pageY < bufferDist) {
    loadOnReachedEnd();
  }
});
