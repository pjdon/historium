'use strict';

function HistoryVisitFinder() {

  /* Splits url at the protocol end */
  const urlSplitProtocolRest = new RegExp(/(^[^:\/]+:\/\/)(.+)/i);

  function getUrlAfterProtocol(url) {
    /* Get the part of the URL after the protocol */
    return url.match(urlSplitProtocolRest)[2];
  }

  this.searchVisitData = async function (
    text, maxVisitCount, startDatetimeMs, endDatetimeMs
  ) {
    /*
    Find objects representing webpage history visits whose domain and/or url
    contain `text` and whose visit datetimes are within the inclusive range of
    `startDatetimeMs` to `endDatetimeMs` (in milliseconds-since-epoch).
  
    Returns an array of objects with the associated HistoryItem and VisitItem
    attributes:
      { url:String, title:String, id:String, referringVisitId:String, transition:TransitionType, visitTime:Number }

    Returned array will be of length `maxVisitCount` at most, with fewer visits
    returned when some are filtered out or there are none left to retrieve

    TODO: optimize visit search
      * letting n = maxVisitCount
      * when the visits for each item are being filtered by datetime, only
        collect the visits that later than the nth latest visit
        given that at least n visits have been collected
      * this requires an extra sort when more than n visits have been collected
      * optionally the nth latest visit and the start-datetime threshold can be
        restablished at each HistoryItem iteration by maintaining a sorted structure

    */
    const query = {
      text, startTime: startDatetimeMs, endTime: endDatetimeMs,
      maxResults: maxVisitCount
    };

    const results = [];
    const historyItemArray = await browser.history.search(query);
    const expected = [];

    const visitInDateRange = visit =>
      visit.visitTime <= query.endTime && visit.visitTime >= query.startTime;

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
              .filter(visitInDateRange)
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
      results.sort((a, b) => b.visitTime - a.visitTime);
      return results.slice(0, maxVisitCount);
    });
  };

  function visitFilter(value, index, array) {
    /* Return whether the visit should be rendered as an entry. */
    if (index < array.length - 1) {
      /* Exclude when next item has the same address excluding the protocol
      Also excludes when next item has the same address
      */
      if (getUrlAfterProtocol(value.url)
        == getUrlAfterProtocol(array[index + 1].url)) {
        return false;
      }
    }
    return true;
  }

  function visitMap(value, index, array) {
    /* Convert visit object into an entry configuration
    { url:String, title:String, visitTime:Date }
    */
    return {
      url: value.url, title: value.title, visitTime: new Date(value.visitTime)
    };
  }

  function processVisits(visitArray, ) {
    /* Exclude redundant visits and convert to visit data objects */
    return visitArray.filter(visitFilter).map(visitMap);
  }

  this.searchVisits = async function ({
    text = '', maxVisitResults = 100, startDatetime = new Date(0),
    endDatetime = new Date()
  } = {}) {
    /*
    Find objects representing webpage history visits whose domain and/or url
    contain `text` and whose visit times are within the inclusive range of
    `startTime` to `endTime` attributes in `query`.

    Returns an array of objects used to render the visit as an h-visit element.
    Objects are filtered by `filterFn` and transformed by `mapFn`.
    */

    const visitArray = await this.searchVisitData(
      text, maxVisitResults, startDatetime.getTime(), endDatetime.getTime()
    );

    return processVisits(visitArray);
  };

}

function HistoryVisitStreamer(text = "", baseDatetime = (new Date()),
  defaultVisitCount = 100) {

  const finder = new HistoryVisitFinder();
  let reachedEnd = false;
  let datetimeCursor = baseDatetime;

  function getVisitsLastDatetime(visits) {
    /* Get the last visit datetime from an array of HistoryVisitFinder visits objects */
    return new Date(visits[visits.length - 1].visitTime.getTime() - 1);
  }

  function getNextResultDatetime() {
    const results = finder.searchVisits(
      { text, maxVisitResults: 1, endDatetime: datetimeCursor }
    );
    if (results.length > 0) {
      return results[0].visitTime;
    } else {
      return null;
    }
  }

  this.getNext = async function (count = defaultVisitCount) {
    if (reachedEnd) return null;

    const query = {
      text, maxVisitResults: count, endDatetime: datetimeCursor
    };
    let visitItems = await finder.searchVisits(query);
    if (visitItems.length <= 0) {
      datetimeCursor = getNextResultDatetime();
      if (datetimeCursor == null) {
        reachedEnd = true;
        return null;
      }
      visitItems = await finder.searchVisits(query);
    }
    datetimeCursor = getVisitsLastDatetime(visitItems);
    return visitItems;
  };
}