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
    const visitConfigArray = await historyVisitFinder.getVisitsOnDate(new Date());
    console.log(visitConfigArray);
    visitConfigArray.forEach(this.addEntry);
  }

}