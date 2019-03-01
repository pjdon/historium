const finder = new HistoryVisitFinder();
const list = document.getElementById('list');
const catalog = new CatalogManager(list, finder);

catalog.setup();

