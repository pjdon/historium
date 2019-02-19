(function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      #item {
        height: 50px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-size-adjust: 0.43;
      
        background-color: white;
      }
      #content {
        align-items: center;
        display: flex;
        margin: 0 20px;
      }
      #content input {
        transform: translateY(-1px);
      }
      #datetime {
        color: grey;
        margin-left: 20px;
      }
      #info {
        align-items: center;
        display: flex;
        flex: 1;
        overflow: hidden;
      }
      #title {
        color: black;
        margin-left: 16px;
        overflow: hidden;
        text-decoration: none;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
      }
      #domain {
        color: grey;
        flex-shrink: 0;
        margin-left: 16px;
      }
    </style>
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


        const dateString = new Date(this.config.datetime).toLocaleTimeString();
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