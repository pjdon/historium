(function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      #group {
        max-width: 1200px;
        min-width: 500px;
        border-radius: 10px;
        box-shadow: 0px 3px 7px #00000050;
        overflow: hidden;
        background-color: white;
        margin: 20px auto;
      }

      #header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 49px;
        background-color: white;
        border-bottom: 1px solid #00000030;
      }

      #title {
        margin: 0 20px;
      }
    </style>
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
          this.shadowRoot.getElementById('title').textContent = this.headerNameFromDate(this.items[0].datetime);
        }


      }
    }
  });
})();