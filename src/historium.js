const historyFinder = new HistoryVisitFinder();
const targetElement = document.getElementById('history');
const catalogManager = new CatalogManager(targetElement, historyFinder);
catalogManager.setup();