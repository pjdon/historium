const table = document.getElementById('results');
const streamer = new HistoryVisitStreamer();
const display = new HistoryCatalog(table);

async function showUntil(date) {
  console.log('started');
  const visits = await streamer.getVisits(
    { startDatetime: date , maxVisits: 50});
  visits.forEach(row => {
    display.addRow(row);
  });
}

showUntil(new Date(Date.now()-864e5));