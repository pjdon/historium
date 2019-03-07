'use strict';

function HistoryVisitFinder() {
  /* Largest value of `maxResults` property that is accepted by the `query` argument of browser.history.search().
  Workaround for inability to ensure that all results are provided for a date range search without the significant overhead of multiple overlapping searches */
  const maxResultsCeiling = Math.pow(2, 52);
  const defaultStartDatetime = new Date(0);

  this.getVisitsData = async function ({
    text = '', startDatetime = defaultStartDatetime, endDatetime = new Date(),
    maxVisits
  } = {}) {
    /*
    Find objects representing webpage history visits whose domain and/or url
    contain `text` and whose visit datetimes are within the inclusive range of
    `startDatetimeMs` to `endDatetimeMs`.

    Returns an array of objects with the associated HistoryItem and VisitItem
    properties:
      { url:String, title:String, datetime:Number, id:String, referringVisitId:String, transition:TransitionType, }

    Returned array will be of length `maxVisits` at most, with fewer visits returned when fewer are provided by the API based on the query.

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
      text,
      startTime: startDatetime.getTime(),
      endTime: endDatetime.getTime(),
      maxResults: maxVisits || maxResultsCeiling
    };

    const visitArray = [];
    const historyItemArray = await browser.history.search(query);
    const duePromises = [];

    const visitInDateRange = visit =>
      visit.visitTime <= query.endTime && visit.visitTime >= query.startTime;

    /* Store the visits of each HistoryItem that fall between `startTime` and
    `endTime` */
    for (let historyItem of historyItemArray) {
      const url = historyItem.url;
      const title = historyItem.title;

      const combineVisitProperties = function (visit) {
        return {
          url, title,
          datetime: visit.visitTime,
          id: visit.visitId,
          referringVisitId: visit.referringVisitId,
          transition: visit.transition,
        }
      }

      duePromises.push(browser.history.getVisits({ url })
        .then(visitItemArray => {
          visitArray.push(...(
            visitItemArray
              .filter(visitInDateRange)
              .map(combineVisitProperties)
          ))
        })
        .catch(reason => {
          console.warn('Could not get visits for HistoryItem', historyItem,
            'Reason:', reason);
        })
      );
    }

    return await Promise.all(duePromises).then(() => {
      visitArray.sort((a, b) => b.datetime - a.datetime);
      /* If we are not expecting all (at most 2^52) results within a date range then only the first `maxVisits` visits are guaranteed to be sequential, since visits for HistoryItems can be outside of the specified date range */
      if (maxVisits != maxResultsCeiling) {
        return visitArray.slice(0, maxVisits);
      } else {
        return visitArray;
      }
    });
  }
}


function HistoryVisitStreamer({
  text = "", baseDatetime = (new Date()), defaultMaxVisits = 100
} = {}) {

  const finder = new HistoryVisitFinder();
  let reachedEnd = false;
  /* TODO: is penalty for using Date vs int type cursor too high? */
  let currentDatetime = baseDatetime;

  function getVisitsLastDatetime(visits) {
    /* Get the last visit datetime from an array of HistoryVisitFinder visits objects */
    /*
    temp while using getvisitsdata
    return new Date(visits[visits.length - 1].datetime.getTime() - 1);
    */
    return new Date(visits[visits.length - 1].datetime - 1);
  }

  this.getNext = async function (maxVisits = defaultMaxVisits) {
    if (reachedEnd) return null;

    const query = { text, maxVisits, endDatetime: currentDatetime };
    const visitItems = await finder.getVisitsData(query);

    if (visitItems.length > 0) {
      currentDatetime = getVisitsLastDatetime(visitItems);
      return visitItems;
    } else {
      reachedEnd = true;
      return null;
    }

  };
}