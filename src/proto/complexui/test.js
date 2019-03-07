function rawVisitsInOrder(rawVisits) {
  const erroneous = [];
  for (let i=1; i<rawVisits.length; i++) {
    if (rawVisits[i].visitTime > rawVisits[i-1].visitTime) {
      erroneous.push([rawVisits[i], rawVisits[i-1]]);
    }
  }
  return erroneous;
}

function visitsInOrder(visits) {
  const erroneous = [];
  for (let i=1; i<visits.length; i++) {
    if (visits[i].visitTime.getTime() > visits[i-1].visitTime.getTime()) {
      erroneous.push([visits[i], visits[i-1]]);
    }
  }
  return erroneous;
}