function DisplayManager(table) {
  const template = document.createElement('template');
  template.innerHTML = `
  <tr>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  `;

  this.addRow = function (config) {
    const node = template.content.cloneNode(true);
    const row = node.children[0];
    const cells = row.getElementsByTagName('td');
    const values = [
      (new Date(config.datetime)).toLocaleString(),
      config.title,
      config.url
    ];
    for (let i = 0; i < cells.length; i++) {
      cells[i].innerText = values[i];
    }
    table.append(row);
  }
}