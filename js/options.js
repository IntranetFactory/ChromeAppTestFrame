(function() {
  'use strict';
  var saveButton = document.getElementById('saveBtn');
  var urlInput = document.getElementById('urlInput');
  var urlEcho = document.getElementById('urlEcho');
  var localStorage = chrome.storage.local;

  if (saveButton) {
    saveButton.addEventListener('click', function(event) {
      var frameUrl = urlInput.value;

      localStorage.set({
        frameUrl: frameUrl
      });
      urlEcho.innerHTML = frameUrl;
    });
  }

  localStorage.get('frameUrl', function (data) {
    if (data && data.frameUrl) {
      urlEcho.innerHTML = data.frameUrl;
      urlInput.value = data.frameUrl;
    }
  });

}());
