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

(function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <link rel='stylesheet' href='elements/group.css' />
    <div id='group'>
      <div id='header'>
        <span id='title'>Sunday, February 10, 2018</span>
      </div>
      <div id='list'>
      </div>
    </div>
  `;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  customElements.define('h-group', class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({
        mode: 'open'
      });
      this.shadowRoot.appendChild(
        template.content.cloneNode(true)
      );
    }

    headerNameFromDate(date) {
      date = new Date(date);
      return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    connectedCallback() {
      this.count;

      if (this.items) {
        this.count = this.items.length;

        this.list = this.shadowRoot.getElementById('list');
        this.catalog = [];
        this.items.forEach( config => {
          const element = document.createElement('h-item');
          element.config = config;

          this.list.appendChild(element);
          this.catalog.push(element);

        });

        if (this.count > 0) {
          this.shadowRoot.getElementById('title').textContent = this.headerNameFromDate(this.items[0].time);
        }


      }


    }
  });
})();