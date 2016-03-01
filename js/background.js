/**
* Chrome extensions have background page available to them for use
* Basically, browser creates a html document with window and document objects, loads html, css and javascript but doesn't display that document
* The purpose of the background page is to exist in memory in the background
* It is important to know that background page state is shared between extention popup window and any tab(s) opened in the browser
*
* To learn more about background pages read https://developer.chrome.com/extensions/background_pages
*
* Popup page can communicate with background page in two ways
* 1. chrome.extension.getBackgroundPage()
* 2. extension.runtime
*
* chrome.extension.getBackgroundPage() function returns window object of the background page. Any and all global variables set on window object of the background page
* are available for use in popup page
*
* extension.runtime offers infrastructure for client-server message passing communication between popup page and background page via concept of ports
* port is a two-way communication channel between holders of the handle to the port object
*
* To use this infrastructure do the following:
* 1. in the background page attach a listener to the chrome.extension.onConnect event. This event will be triggered each time a connection is requested with the extension
* 2. in the popup page call chrome.extension.connect() function. This function will return the handle to the port object. Also, the same handle will be passed to the onConnect event handler in 1.
* 3. now background page and popup page have a handle to the same port and can pass messages to each other
*
* To learn more about chrome.runtime read https://developer.chrome.com/extensions/runtime
*
* Port has onMessage event. This event is triggered each time a message is sent via port
* Port has postMessage function. This function is used to send a message via port
*
* To learn more about ports read https://developer.chrome.com/extensions/runtime#type-Port
*
* To communicate with the background page from a page displayed in a tab specify content_scripts property in the extension manifest.
* Content script is a js file which is loaded on a page which is opened in a tab.
* Now, please switch to content.js file and read comments there.
*
* To learn more about the manifest read https://developer.chrome.com/extensions/manifest
* To learn more about the content scripts read https://developer.chrome.com/extensions/content_scripts
*/

(function() {
  'use strict';
  // if appController object is already created return
  if (window.appController !== undefined) {
    return;
  }
  console.log("Extension.Background-Page: Loading background page.");
  // create appController object
  window.appController = AppController();

  function AppController() {
    // appController is a shared object between all open tabs
    // we need to maintain port mapping so we know to which tab we should send the message
    var portMapping = {};

    // listen to onConnect event
    chrome.extension.onConnect.addListener(function(incommingPort) {
      // get the name of the port and add the port to the portMapping
      var portName = incommingPort.name;
      console.log("Extension.Background-Page: We have an incoming connection from " + portName);
      if (portMapping[portName] === undefined) {
        portMapping[portName] = incommingPort;
        console.log("Extension.Background-Page: port mapping didn't exist. Saved.");
        // listen to onDisconnect event on port so we can remove it from the mapping
        incommingPort.onDisconnect.addListener(onPortDisconnected);
        console.log("Extension.Background-Page: Attached to port.onDisconnect event.");
      } else {
        console.log("Extension.Background-Page: Connection already exists. Skipping...");
      }
    });

    function onPortDisconnected(incommingPort) {
      // when port disconnects (ie. tab is closed) we remove the port from the port mapping
      var portName = incommingPort.name;
      console.log("Extension.Background-Page: " + portName + " has disconnected.");
      if (portMapping[portName] !== undefined) {
        portMapping[portName] = undefined;
        console.log("Extension.Background-Page: Port mapping for " + portName + " removed.");
      }
    }

    return {
      // this function is used to send the message to toggle the side panel on the page
      // the url of the page is passed as parameter
      toggleSidePanel: function(url) {
        console.log("Extension.Background-Page: toggleSidePanel called for " + url + " url.");
        // calculate SHA1 hash of the url
        var hash = CryptoJS.SHA1(url);
        var hashStr = hash.toString();
        console.log("Extension.Background-Page: Hash for " + url + " url is " + hashStr);
        var port;
        // use calculated hash to get the port from port mapping
        if (portMapping[hashStr] !== undefined) {
          port = portMapping[hashStr];
          console.log("Extension.Background-Page: Port mapping for " + hashStr + " exists.");
          // send the message to the content script to toggle the side panel
          port.postMessage({
            signal: "ToggleSidePanel"
          });
          console.log("Extension.Background-Page: ToggleSidePanel message sent.");
        } else {
          console.log("Extension.Background-Page: Port mapping for " + hashStr + " doesn't exist. Injecting scripts ...");
          // the content script is not loaded for the current tab
          // so we inject the content script on the page
          // we also "pipe" the script loading so we know when we finished loading the scripts
          chrome.tabs.executeScript(null, {file: "js/core-min.js"}, function(args1){
            chrome.tabs.executeScript(null, {file: "js/sha1-min.js"}, function(args2){
              chrome.tabs.executeScript(null, {file: "js/content.js"}, function (args3) {
                console.log("Extension.Background-Page: Injecting complete ...");
                // when all scripts finish loading send the message to open the side panel
                if (portMapping[hashStr] !== undefined) {
                  port = portMapping[hashStr];
                  console.log("Extension.Background-Page: Port mapping for " + hashStr + " exists.");
                  // send the message to the content script to toggle the side panel
                  port.postMessage({
                    signal: "ToggleSidePanel"
                  });
                  console.log("Extension.Background-Page: ToggleSidePanel message sent.");
                }
              });
            });
          });
        }
      }
    };
  }
  // browserAction is the extension button in chrome browser
  // we attach to onClicked event of the button because we want to toggle the side panel when this button is clicked
  chrome.browserAction.onClicked.addListener(function(tab) {
    console.log("Extension.Background-Page: Extension action button clicked.");
    // get the url of the tab
    var url = tab.url;
    // toggle the side panel
    appController.toggleSidePanel(url);
  });

  console.log("Extension.Background-Page: Background page loaded.");
}());
