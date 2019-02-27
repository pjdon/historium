'use strict';

function HistoryVisitFinder() {

  /* Largest value of `maxResults` property that is accepted by the `query`
  argument of browser.history.search().
  This is a temporary workaround to the lack of a method for streaming large
  number of results. */
  const maxResultsCeiling = Math.pow(2, 52);
  const msPerDay = 86400000;

  function getLocalDateMsBounds(date) {
    /* Get the start and end time in milliseconds-since-epoch for the local day
    of `date` */

    const localDateStart = (new Date(date.getFullYear(), date.getMonth(),
      date.getDate())).getTime();
    return [localDateStart, localDateStart + msPerDay - 1];
  }

  this.searchVisits = async function (text, startTime, endTime) {
    /*
    Find objects representing webpage history visits whose domain and/or url
    contain `text` and whose visit times are within the inclusive range of
    `startTime` to `endTime`.

    Returns an array of objects with the associated HistoryItem and VisitItem
    attributes:
      { url, title, id, referringVisitId, transition, visitTime }
    */
    const results = [];
    const query = { text, startTime, endTime, maxResults: maxResultsCeiling };
    const historyItemArray = await browser.history.search(query);
    const expected = [];

    const filterVisitsCallback = function (visit) {
      return visit.visitTime <= endTime && visit.visitTime >= startTime;
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
      results.sort((a, b) => b.visitTime - a.visitTime);
      return results;
    });
  }

  this.getVisitsOnDate = async function (text, date) {
    /*
    Find objects representing webpage history visits whose domain and/or url
    contain `text` and whose visit times are on the same day as `date`.

    Returns an array of objects with the associated HistoryItem and VisitItem
    attributes:
      { url, title, id, referringVisitId, transition, visitTime }
    */
    const [startTime, endTime] = getLocalDateMsBounds(date);

    return await this.searchVisits(text, startTime, endTime);

  }
}