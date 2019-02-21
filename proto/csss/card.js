const documentSheet = new CSSStyleSheet();
documentSheet.replaceSync(`
div {
  background-color: lavender;
  border: 1px solid #00000010;
  padding: 1em;
  border-radius: 10px;
  box-shadow: 2px 2px 5px #00000040;
  color: blue;
  margin: 1em;
}
`)
document.adoptedStyleSheets = [documentSheet];

(function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <div id='card'></div>
  `;

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`
    #card {
      background-color: lavender;
      border: 1px solid #00000010;
      padding: 1em;
      border-radius: 10px;
      box-shadow: 2px 2px 5px #00000040;
      margin: 1em;
    }
  `);


  customElements.define('x-card', class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({
        mode: 'open'
      });
      this.shadowRoot.appendChild(
        template.content.cloneNode(true)
      );
    }

    connectedCallback() {
      this.shadowRoot.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

      const card = this.shadowRoot.getElementById('card');
      card.textContent = this.textContent;
    }
  });

})();