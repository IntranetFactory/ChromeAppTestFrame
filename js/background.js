(function() {
  'use strict';
  if (window.appController !== undefined) {
    return;
  }

  window.appController = AppController();

  function AppController() {
    var portMapping = {};
    var currentPort = false;

    chrome.extension.onConnect.addListener(function(incommingPort) {
      var portName = incommingPort.name;
      if (portMapping[portName] === undefined) {
        portMapping[portName] = incommingPort;

        incommingPort.onDisconnect.addListener(onPortDisconnected);
      }
    });

    function onPortDisconnected(incommingPort) {
      var portName = incommingPort.name;
      if (portMapping[portName] !== undefined) {
        portMapping[portName] = undefined;
      }
    }

    return {
      toggleSidePanel: function(url) {
        var hash = CryptoJS.SHA1(url);
        var hashStr = hash.toString();
        var port;
        if (portMapping[hashStr] !== undefined) {
          port = portMapping[hashStr];
          port.postMessage({
            signal: "ToggleSidePanel"
          });
        }
      }
    };
  }

  chrome.browserAction.onClicked.addListener(function(tab) {
    var url = tab.url;
    appController.toggleSidePanel(url);
  });
}());
