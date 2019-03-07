'use strict';

/* Working sorted */

function HistoryVisitStreamer() {
  const maxResultsCeiling = Math.pow(2, 52);
  const defaultStartDatetime = new Date(0);

  this.getVisits = async function ({
    text = '', startDatetime = defaultStartDatetime, endDatetime = new Date(),
    maxVisits
  } = {}) {
    const query = {
      text,
      startTime: startDatetime.getTime(),
      endTime: endDatetime.getTime()
    };

    if (maxVisits == null) {
      query.maxResults = maxResultsCeiling;
    }

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

      const mapVisitsCallback = function (visit) {
        return {
          url, title, datetime: visit.visitTime,
          transition: visit.transi
        }
      }

      duePromises.push(browser.history.getVisits({ url })
        .then(visitItemArray => {
          visitArray.push(...(
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

    return await Promise.all(duePromises).then(() => {
      visitArray.sort((a, b) => b.datetime - a.datetime);
      if (maxVisits != null) {
        return visitArray.slice(0,maxVisits);
      } else {
        return visitArray;
      }
    });
  }
}