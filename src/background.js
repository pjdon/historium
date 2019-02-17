browser.browserAction.onClicked.addListener((tab) => {
  browser.tabs.create({
      url: "historium.html"
  });
});
