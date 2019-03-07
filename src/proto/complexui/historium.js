const finder = new HistoryVisitFinder();
const list = document.getElementById('list');
const catalog = new CatalogManager(list, finder);

// catalog.setup();

const streamer = new HistoryVisitStreamer();

async function test() {
  const query = {text:'', maxResults:100, startTime:0};
  query.endTime = Date.now();

  const visits = await finder.searchVisitsbyQuery(query);
  console.log(visits);
}