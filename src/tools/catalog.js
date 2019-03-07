function HistoryCatalog(table) {
  const template = document.createElement('template');
  template.innerHTML = `
  <tr>
    <td></td>
    <td><a></a></td>
    <td></td>
  </tr>
  `;

  const domainFromURL = new RegExp(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im);

  function urlToDomain(url) {
    const result = url.match(domainFromURL);
    if (result instanceof Array) return result[1];
  }

  this.addRow = function (config) {
    const node = template.content.cloneNode(true);
    const row = node.children[0];
    const cells = row.getElementsByTagName('td');
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      switch (i) {
        case 0:
          cell.innerText = (new Date(config.datetime)).toLocaleString();
          break;
        case 1:
          const link = cell.getElementsByTagName('a')[0];
          link.innerText = config.title || config.url;
          link.href = config.url;
          break;
        case 2:
          cell.innerText = urlToDomain(config.url);
          break;
      }
    }
    table.append(row);
  }
}