/**
 * To communicate with the background page from a page displayed in a tab do the following
 * 1. setup message passing infrastructure on the background page: listen to onConnect event on extension object and other events if necessary
 * 2. specify content_scripts property in the extension manifest. content_scripts property specifies .js files which are loaded on a page which is opened in a tab.
 * 3. in the content script use chrome.extension.runtime to make a connection with the extension
 * 4. send and receive messages
 *
 * To connect to the background page from a content script
 * 1. find out what is the extension id of the extension you want to connect to. If no id is provided, by default a connection will be established with the extension which holds the content script connection is made from
 * 2. provide a unique name for the connection. Since extension state is shared between all the pages having a unique name is usefull for identifying connections from different pages
 * 3. use chrome.runtime.connect function, pass extension id and unique name as parameters; this will trigger onConnect event in background page and pass the port as event handler parameter
 * 4. a handle to the Port object will be returned as a result
 * 5. Use Port's postMessage function to send messages
 * 6. add a listener to the port's onMessage event to listen to incoming messages
 *
 * Read comments in background.js file for a more complete picture.
 *
 * To learn more about the manifest read https://developer.chrome.com/extensions/manifest
 * To learn more about the content scripts read https://developer.chrome.com/extensions/content_scripts
 */
(function() {
  'use strict';

  if (window.ChromeAppTestFrameClientScriptLoaded !== undefined) {
    return;
  }
  window.ChromeAppTestFrameClientScriptLoaded = true;

  // a unique identifier is needed to identify the tab/page this content.js is loaded into
  // href is a good choice
  // to emphasize uniqueness a SHA1 hash is calculated from href
  var href = window.location.href;
  var hash = CryptoJS.SHA1(href);
  var hashStr = hash.toString();

  // each extension has a unique id; this string is copy/pasted from settings -> extensions page
  var EXTENSION_ID = 'ghmdepaiobfijajcpfifgmcjpimmiocf';
  // populate connectionInfo object with unique hash name created above
  var connectionInfo = {
    name: hashStr
  };

  // we use chrome local storage to hold url that will be displayed in the iFrame
  var storage = chrome.storage.local;
  // we initialize urlFrame to false; this is a convinient initial state for toggling iFrame functionality
  var urlFrame = false;

  // establish the connection with the extension; this connects to the background page (.js) which is what we want
  var port = chrome.runtime.connect(EXTENSION_ID, connectionInfo);
  // listen to onDisconnect event
  port.onDisconnect.addListener(onDisconnected);
  // listen to onMessage event
  port.onMessage.addListener(onMessageReceived);

  function onDisconnected(port) {
    // for now just log the event
    console.log('Port' + port.name + ' disconnected');
    // when tab is closed or when extension is disabled if sidebar is opened it should be closed
    closeSidePanel();
  }

  function onMessageReceived(message, sender, sendResponseCallback) {
    // for now log the event
    console.log('Message received ' + JSON.stringify(message));
    if (urlFrame) {
      // if urlFrame is not false close side panel
      closeSidePanel(urlFrame);
      // set urlFrame to false
      urlFrame = false;
    } else {
      // if urlFrame is false open side panel
      openSidePanel();
    }
  }

  // use port.disconnect to break connection

  // use port.postMessage to send a message

  function openSidePanel() {
    // storage.get function is used to get the frameUrl from local storage
    storage.get('frameUrl', function(data) {
      if (data && data.frameUrl) {
        // we create the iFrame, set attributes
        urlFrame = document.createElement('iframe');
        urlFrame.setAttribute("src", data.frameUrl);
        urlFrame.setAttribute("style", "z-index: 999999999999999; position: fixed; top: 0px; right: 0px; bottom: 0px; width: 300px; height: 100%; border:0; border-left: 1px solid #eee; box-shadow: 0px -1px 7px 0px #aaa; overflow-x: hidden;");
        urlFrame.setAttribute("allowtransparency", "false");
        urlFrame.setAttribute("scrolling", "no");
        // and attach it to the documentElement
        document.documentElement.appendChild(urlFrame);
      }
    });
  }

  function closeSidePanel() {
    // to close side panel we remove the urlFrame from the DOM
    if (urlFrame) {
      document.documentElement.removeChild(urlFrame);
    }
  }

}());
