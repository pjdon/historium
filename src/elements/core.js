(function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <link rel='stylesheet' href='elements/item.css' />
    <div id='item'>
      <div id='content'>
        <input type='checkbox'>
        <span id='datetime'>--:-- --</span>
        <div id='info'>
          <a id='title'></a>
          <span id='domain'></span>
        </div>
      </div>
    </div>
  `;

  customElements.define('h-item', class extends HTMLElement {
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
      if (this.config) {
        const datetime = this.shadowRoot.getElementById('datetime');
        const title = this.shadowRoot.getElementById('title');
        const domain = this.shadowRoot.getElementById('domain');


        const dateString = new Date(this.config.time).toLocaleTimeString();
        datetime.textContent = dateString.slice(0, -6) + dateString.slice(-3);

        if (this.config.title) {
          title.textContent = this.config.title;
        }
        else {
          title.textContent = this.config.url;
        }
        title.href = this.config.url;
        domain.textContent = this.config.domain;
      }

    }
  });

})();
