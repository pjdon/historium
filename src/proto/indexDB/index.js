if (!window.indexedDB) {
  window.alert("This browser doesn't support core features. Please update Firefox to the latest version.");
}

const dbname = "historiumData"
const dbversion = 1;

let request = window.indexedDB.open(dbname);
request.onerror = event => {
  console.error(`failed to open ${dbname}`,event);
};
request.onsuccess = event => {
  let db = event.target.result;

}