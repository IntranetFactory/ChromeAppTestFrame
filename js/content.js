(function() {
  'use strict';
  var href = window.location.href;
  var hash = CryptoJS.SHA1(href);
  var hashStr = hash.toString();

  var EXTENSION_ID = 'ghmdepaiobfijajcpfifgmcjpimmiocf';
  var connectionInfo = {
    name: hashStr
  };

  var storage = chrome.storage.local;
  var opened = false;
  var embedScript = false;
  var sidePanelDiv = false;

  var port = chrome.runtime.connect(EXTENSION_ID, connectionInfo);

  port.onDisconnect.addListener(onDisconnected);

  port.onMessage.addListener(onMessageReceived);

  function onDisconnected(port) {
    // debugger;
    // return true;
    console.log('Port' + port.name + ' disconnected');
  }

  function onMessageReceived(message, sender, sendResponseCallback) {
    // debugger;
    console.log('Message received ' + JSON.stringify(message));

    if (opened) {
      closeSidePanel();
    } else {
      openSidePanel();
    }
  }

  // use port.disconnect to break connection

  // use port.postMessage to send a message

  function openSidePanel() {
    storage.get('frameUrl', function(data) {
      if (data && data.frameUrl) {
        embedScript = document.createElement(script);
        embedScript.setAttribute('async', true);
        document.body.appendChild(embedScript);

        sidePanelDiv = document.createElement('div');
        sidePanelDiv.classList.add('at-app-embed');
        sidePanelDiv.setAttribute('app', 'at-now/start-now');
        document.body.appendChild(sidePanelDiv);

        var src = data.frameUrl + '/components/at-app-embed/at-app-embed.js';
        embedScript.setAttribute('src', src);

        opened = true;
      }
    });
  }

  function closeSidePanel() {
    document.body.removeChild(embedScript);
    document.body.removeChild(sidePanelDiv);
    opened = false;
  }


}());
