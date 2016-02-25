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
  var urlFrame = false;

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

    if (urlFrame) {
      closeSidePanel(urlFrame);
    } else {
      openSidePanel();
    }
  }

  // use port.disconnect to break connection

  // use port.postMessage to send a message

  function openSidePanel() {
    storage.get('frameUrl', function(data) {
      if (data && data.frameUrl) {
        urlFrame = document.createElement('iframe');
        // urlFrame.setAttribute("id", 'catFrame_sidebar');
        urlFrame.setAttribute("src", data.frameUrl);
        urlFrame.setAttribute("style", "z-index: 999999999999999; position: fixed; top: 0px; right: 0px; bottom: 0px; width: 300px; height: 100%; border:0; border-left: 1px solid #eee; box-shadow: 0px -1px 7px 0px #aaa; overflow-x: hidden;");
        urlFrame.setAttribute("allowtransparency", "false");
        urlFrame.setAttribute("scrolling", "no");
        document.documentElement.appendChild(urlFrame);
      }
    });
  }

  function closeSidePanel() {
    document.documentElement.removeChild(urlFrame);
    urlFrame = false;
  }


}());
