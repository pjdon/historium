function CatalogManager(targetElement, historyVisitFinder) {
  const entryTag = 'h-entry';

  const startAttrName = 'group-start';
  const endAttrName = 'group-end';

  this.targetElement = targetElement;
  this.historyVisitFinder = historyVisitFinder;

  this.addEntry = function(config) {
    const entryElement = document.createElement(entryTag);
    entryElement.config = config;
    if (config.groupStart) entryElement.setAttribute(startAttrName, '');
    if (config.groupEnd) entryElement.setAttribute(endAttrName, '');
    targetElement.appendChild(entryElement);
  }

  this.setup = async function() {
    const array = await historyVisitFinder.searchVisits(
      {startTime:0, endTime:Date.now(), maxResults:50}
    )

    array.forEach(this.addEntry);
  }

}