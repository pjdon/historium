'use strict';

function HistoryVisitFinder() {

  /* Largest value of `maxResults` property that is accepted by the `query`
  argument of browser.history.search().
  This is a temporary workaround to the lack of a method for streaming large
  number of results. */
  const maxResultsCeiling = Math.pow(2, 52);
  const defaultQuery = { text: '', maxResults: maxResultsCeiling };
  const urlSplitProtocolRest = new RegExp(/(^[^:\/]+:\/\/)(.+)/i);

  function getUrlAfterProtocol(url) {
    /* Get the part of the URL after the protocol */
    return url.match(urlSplitProtocolRest)[2];
  }

  this.searchVisitsRaw = async function (query) {
    /*
    Find objects representing webpage history visits whose domain and/or url
    contain `text` and whose visit times are within the inclusive range of
    `startTime` to `endTime` attributes in `query`.

    Returns an array of objects with the associated HistoryItem and VisitItem
    attributes:
      { url:String, title:String, id:String, referringVisitId:String, transition:TransitionType, visitTime:Number }
    */

    query = Object.assign(
      defaultQuery,
      {
        startTime: (new Date()).addDay(-1),
        endTime: Date.now()
      },
      query
    );

    const results = [];
    const historyItemArray = await browser.history.search(query);
    const expected = [];

    const filterVisitsCallback = function (visit) {
      return visit.visitTime <= query.endTime
        && visit.visitTime >= query.startTime;
    }

    /* Store the visits of each HistoryItem that fall between `startTime` and
    `endTime` */
    for (let historyItem of historyItemArray) {
      const url = historyItem.url;
      const title = historyItem.title;

      const mapVisitsCallback = function (visit) {
        return {
          url, title,
          id: visit.visitId,
          referringVisitId: visit.referringVisitId,
          transition: visit.transition,
          visitTime: visit.visitTime
        }
      }

      expected.push(browser.history.getVisits({ url })
        .then(visitItemArray => {
          results.push(...(
            visitItemArray
              .filter(filterVisitsCallback)
              .map(mapVisitsCallback)
          ))
        })
        .catch(reason => {
          console.warn('Could not get visits for HistoryItem', historyItem,
            'Reason:', reason);
        })
      );
    }

    return await Promise.all(expected).then(() => {
      /* Sort results in reverse chronological order */
      // results.sort((a, b) => b.visitTime - a.visitTime);
      return results;
    });
  }

  function filterVisit(value, index, array) {
    /* Return whether the visit should be rendered as an entry */
    if (index < array.length - 1) {
      /* Exclude reloads */
      if (value.transition == 'reload') {
        return false;
      }
      /* Exclude when next item has the same address except for the protocol */
      if (getUrlAfterProtocol(value.url)
        == getUrlAfterProtocol(array[index + 1].url)) {
        return false;
      }
    }
    return true;
  }

  function mapVisit(value, index, array) {
    /* Convert visit object into an entry configuration */
    return {
      url: value.url, title: value.title, visitTime: new Date(value.visitTime)
    };
  }

  this.processVisits = function (visitArray) {
    /* Exclude redundant visits and convert them to entry configurations */
    /* Purpose is to reduce the memory footprint of each object since they
    will be stored in memory when the element is removed */
    const processed = visitArray.filter(filterVisit).map(mapVisit);
    processed[0].groupStart = true;
    processed[processed.length - 1].groupEnd = true;
    return processed
  }

  this.searchVisits = async function (query) {
    /*
    Find objects representing webpage history visits whose domain and/or url
    contain `text` and whose visit times are within the inclusive range of
    `startTime` to `endTime` attributes in `query`.

    Returns an array of objects used to render the visit as an h-visit element.
    {
      attributes: [:String,],
      config: {url:String, title:String, visitTime:Date}
    }
    */
    const visitArray = await this.searchVisitsRaw(query);
    return this.processVisits(visitArray);
  }
}