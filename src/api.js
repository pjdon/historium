'use strict';

function HistoryApi() {
  /* Wrapper over browser.history.search that allows for retrieval of individual visitItem objects. */

  /* Currently no good method to stream history items by time period
  so this is the largest number (2^52) of results that the search will accept
  TODO: replace with a recursive search function
  */
  const maxSearchResults = Math.pow(2, 52);
  const msPerDay = 86400000;
  const domainFromURL = new RegExp(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im);

  function getDateStartMs(date) {
    /* Get the milliseconds-since-epoch at 12:00 AM (0:00) from `date` */
    return (new Date(date.getFullYear(), date.getMonth(), date.getDate())).getTime();
  }

  function dfcToMs(dfc = 0, end = false, base) {
    /* Days-from-current-day to milliseconds-since-epoch */
    if (!(base instanceof Number)) base = new Date();
    const start = getDateStartMs(new Date()) - (msPerDay * dfc);
    if (end) {
      return start + msPerDay - 1;
    } else {
      return start;
    }
  }

  function urlToDomain(url) {
    const result = url.match(domainFromURL);
    if (result instanceof Array) {
      return result[1];
    }
  }

  function sortByDateDesc(a, b) {
    return b.datetime - a.datetime;
  }

  this.searchVisits = async function (text, startTime, endTime, sortFunction = sortByDateDesc) {
    /* Returns array of visit objects { url, title, domain, time } */
    const query = {
      text, startTime, endTime,
      maxResults: maxSearchResults
    }

    const results = [];
    for (let item of (await browser.history.search(query))) {

      const url = item.url;
      const title = item.title || item.url;
      const domain = urlToDomain(item.url);


      if (item.visitCount == 1) {
        results.push(
          { url, title, domain, datetime: new Date(item.lastVisitTime) }
        );
      }
      else if (item.visitCount > 1) {
        results.push(...(
          /* Find all visits for the `result` within the time range and save them to `results` as visit objects */
          (await browser.history.getVisits({ url: item.url }))
            .filter(visit => {
              return visit.visitTime >= startTime && visit.visitTime <= endTime;
            }
            )
            .map(visit =>
              ({ url, title, domain, datetime: new Date(visit.visitTime) })
            )
        ));
      }
    }
    if (sortFunction) results.sort(sortFunction);
    return results;
  }

  function groupVisits(visits) {
    const groups = [];
    let prevDay = -1;
    let group;
    visits.forEach(visit => {
      const date = visit.datetime = new Date(visit.datetime);
      const day = date.getDate();

      if (day != prevDay) {
        if (group) groups.push(group);
        group = [visit];
        prevDay = day;
      } else {
        group.push(visit);
      }
    });
    groups.push(group);
    return groups;
  }

  this.visitsByDay = async function (text = '', dfcStart = 1, dfcEnd = 0) {
    const startTime = dfcToMs(dfcStart, false);
    const endTime = dfcToMs(dfcEnd, true);

    const visits = await this.searchVisits(text, startTime, endTime, false);
    visits.sort(sortByDateDesc);
    return groupVisits(visits);
  }
}