function HistoryStreamer() {
  const maxResults = Math.pow(2, 52);

  this.getVisits = async function ({
    text = '', startDatetime = new Date(0), endDatetime = new Date()
  } = {}) {
    const query = {
      text, maxResults,
      startTime: startDatetime.getTime(),
      endTime: endDatetime.getTime()
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

      const mapVisitsCallback = function (visit) {
        return {
          url, title, datetime: visit.visitTime
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
      /* Sort results in reverse chronological order */
      visitArray.sort((a, b) => b.datetime - a.datetime);
      // const errors = [];
      // for (let i=1; i<visitArray.length; i++) {
      //   if (visitArray[i].datetime > visitArray[i-1].datetime) {
      //     errors.push([visitArray[i-1],visitArray[i]]);
      //   }
      // }
      // console.log(errors.length);
      // console.log(errors);
      return visitArray;
    });
  }
}