'use strict';


(function () {
  /* Web component custom element for displaying HistoryItem as a card */
  const styleTemplate = document.createElement('template');
  styleTemplate.innerHTML = (() => {
    return `
    <style>
    :host {
      --color-scene: #F2F2F2;
      --color-card: #FFF;
      --color-minor: #808080;
      --color-button: #5f6368;
      --color-tint-subtle: #00000025;
      --edge-exterior: 20px;
      --border-radius-edge: 3px 3px;
      --box-shadow: #3c40434d 0 1px 2px 0, #3c404326 0 1px 3px 1px;
      --section-height: 50px;
      --header-border-width: 1px;
      --content-font-size: 0.43;
      --favicon-size: 16px;
      --button-font-size: 0.6;
      --button-width: 12px;
      display: block;
    }
    :host([group-end]) {
      padding-bottom: 20px;
    }

    /*
    :host *::-moz-focus-inner {
      border: 0;
    }
    :host * {
      outline: none;
    }
    #title, #menu {
      transition: background 0.2s;
    }
    #title:focus, #menu:focus {
      background-color: #00000030;
    }
    #check {
      transition: outline 0.2s;
    }
    #check:focus {
      outline: 6px solid #00000030;
    }
    #check:checked {
      outline-color: red;
    } */

    #header {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: calc(var(--section-height) - var(--header-border-width));
      background-color: var(--color-card);
      border-bottom: var(--header-border-width) solid var(--color-tint-subtle);
      padding: 0 var(--edge-exterior);
      box-shadow: var(--box-shadow);
      border-radius: var(--border-radius-edge) 0 0;
      clip-path: inset(-100vw -100vw 0);
      overflow: hidden;
    }
    #header-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :host([group-end]) #content {
      border-radius: 0 0 var(--border-radius-edge);
      clip-path: inset(0 -100vw -100vw);
    }
    #content {
      height: var(--section-height);
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      background-color: var(--color-card);
      clip-path: inset(0 -100vw -100vw);
      box-shadow: var(--box-shadow);
      white-space: nowrap;
      font-size-adjust: var(--content-font-size);
    }
    #check {
      margin-left: var(--edge-exterior);
      transform: translateY(-1px);
    }
    #timestamp {
      color: var(--color-minor);
      margin-left: var(--edge-exterior);
    }
    #favicon {
      width: var(--favicon-size);
      height: var(--favicon-size);
      margin-left: calc(2*var(--edge-exterior));
    }
    #info {
      align-items: center;
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    #title {
      color: black;
      margin-left: calc(var(--edge-exterior)*0.8);
      overflow: hidden;
      text-decoration: none;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
    }
    #domain {
      color: var(--color-minor);
      flex-shrink: 0;
      margin: 0 var(--edge-exterior);
    }
    #menu {
      color: var(--color-button);
      -moz-user-select: none;
      user-select: none;
      padding: 3px calc(var(--edge-exterior)/2);
      font-size-adjust: var(--button-font-size);
      font-weight: bolder;
      margin-right: var(--edge-exterior);
      transform: translateY(-2px);
      cursor: pointer;
      border-radius: 50%;
      border: none;
      background: none;
      outline: 0;
    }
    </style>
  `
  })();

  const headerTemplate = document.createElement('template');
  headerTemplate.innerHTML = `
  <div id='header'>
 		<span id='header-title'></span>
	</div>
  `;

  const contentTemplate = document.createElement('template');
  contentTemplate.innerHTML = `
  <div id='content'>
    <input id='check' type='checkbox'>
    <span id='timestamp'></span>
    <img id='favicon'></img>
    <div id='info'>
      <a id='title'></a>
      <span id='domain'></span>
    </div>
    <button id='menu'>⋮</button>
    </div>
  </div>
  `;

  const tempFaviconPath = "favicon.png";

  /* Used to format header title */
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const startAttrName = 'group-start';
  const domainFromURL = new RegExp(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im);

  customElements.define('h-entry', class extends HTMLElement {

    urlToDomain(url) {
      const result = url.match(domainFromURL);
      if (result instanceof Array) {
        return result[1];
      }
    }

    timestampFromDate(date) {
      const string = date.toLocaleTimeString();
      return string.slice(0, -6) + string.slice(-3);
    }

    headerTitleFromDate(date) {
      return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    constructor() {
      super();
      this.attachShadow({
        mode: 'open'
      });
      this.shadowRoot.append(
        styleTemplate.content.cloneNode(true)
      );
      this.shadowRoot.append(
        contentTemplate.content.cloneNode(true)
      );
    }

    connectedCallback() {

      if (this.config) {
        console.log(this.config);
        const timestamp = this.shadowRoot.getElementById('timestamp');
        const title = this.shadowRoot.getElementById('title');
        const domain = this.shadowRoot.getElementById('domain');
        const favicon = this.shadowRoot.getElementById('favicon');

        timestamp.textContent = this.timestampFromDate(this.config.visitTime);

        if (this.config.title) {
          title.textContent = this.config.title;
        } else {
          title.textContent = this.config.url;
        }
        title.href = this.config.url;
        domain.textContent = this.urlToDomain(this.config.url);

        if (this.hasAttribute(startAttrName)) {
          /* Add a header if this entry is at the top of a group/day */
          this.shadowRoot.prepend(
            headerTemplate.content.cloneNode(true)
          );
          const headerTitle = this.shadowRoot.getElementById('header-title');
          headerTitle.textContent = this.headerTitleFromDate(
            this.config.visitTime);
        }

        // TODO: get favicon from db using domain
        favicon.src = tempFaviconPath;

      } else {
        console.error('Missing `config` property')
      }
    }
  });

})();
















