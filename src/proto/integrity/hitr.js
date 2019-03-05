const table = document.getElementById('results');
const streamer = new HistoryStreamer();
const display = new DisplayManager(table);

async function showUntil(date) {
  console.log('started');
  const visits = await streamer.getVisits({ startDatetime: date });
  // return visits;
  visits.forEach(row => {
    display.addRow(row);
  });
}