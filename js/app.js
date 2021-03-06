// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';

  var apiURL = 'https://developer.mozilla.org/search.json?q=';
  var errorMsg = document.getElementById('error');
  var searchInput = document.getElementById('term');
  var results = document.getElementById('results');
  var request = null;
  var translate = navigator.mozL10n.get;
  var form = document.querySelector('form');

  // Forms will take the values in the input fields they contain
  // and send them to a server for further processing,
  // but since we want to stay in this page AND make a request to another server,
  // we will listen to the 'submit' event, and prevent the form from doing what
  // it would usually do, using preventDefault.
  // Read more about it here:
  // https://developer.mozilla.org/Web/API/event.preventDefault
  //
  // Then we search without leaving this page, just as we wanted.
  form.addEventListener('submit', function(e) {
      e.preventDefault();
      search();
  }, false);

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  navigator.mozL10n.once(search);

  // ---

  function search() {

    // Are we searching already? Then stop that search
    if(request && request.abort) {
      request.abort();
    }


    results.textContent = translate('searching');

    // We will be using the 'hidden' attribute throughout the app rather than a
    // 'hidden' CSS class because it enhances accessibility.
    // See: http://www.whatwg.org/specs/web-apps/current-work/multipage/editing.html#the-hidden-attribute
    results.hidden = false;
    errorMsg.hidden = true;


    var term = searchInput.value;
    if(term.length === 0) {
      term = searchInput.placeholder;
    }

    var url = apiURL + term;

    // If you don't set the mozSystem option, you'll get CORS errors (Cross Origin Resource Sharing)
    // You can read more about CORS here: https://developer.mozilla.org/docs/HTTP/Access_control_CORS
    request = new XMLHttpRequest({ mozSystem: true });

    request.open('get', url, true);
    request.responseType = 'json';

    // We're setting some handlers here for dealing with both error and
    // data received. We could just declare the functions here, but they are in
    // separate functions so that search() is shorter, and more readable.
    request.addEventListener('error', onRequestError);
    request.addEventListener('load', onRequestLoad);

    request.send();

  }


  function onRequestError() {

    var errorMessage = request.error;
      if(!errorMessage) {
        errorMessage = translate('searching_error');
      }
      showError(errorMessage);

  }


  function onRequestLoad() {

    var response = request.response;

    if(response === null) {
      showError(translate('searching_error'));
      return;
    }

    results.textContent = '';

    var documents = response.documents;

    if(documents.length === 0) {

      var p = document.createElement('p');
      p.textContent = translate('search_no_results');
      results.appendChild(p);

    } else {

      documents.forEach(function(doc) {

        // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
        // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
        var docLink = document.createElement('a');
        docLink.textContent = doc.title;
        docLink.href = doc.url;

        // We want the links to open in a pop up window with a 'close'
        // button, so that the user can consult the result and then close it and
        // be brought back to our app.
        // If we did nothing, these external links would take over the entirety
        // our app and there would be no way for a user to go back to the app.
        // But Firefox OS allows us to open ONE new window per app; these new
        // windows will have a close button, so the user can close the overlay
        // when they're happy with what they've read.
        // Therefore we will capture click events on links, stop them from
        // doing their usual thing using preventDefault(),
        // and then open the link but in a new window.
        docLink.addEventListener('click', function(evt) {
          evt.preventDefault();
          window.open(evt.target.href, 'overlay');
        });

        var h2 = document.createElement('h2');
        h2.appendChild(docLink);
        results.appendChild(h2);

      });

    }

    // And once we have all the content in place, we can show it.
    results.hidden = false;

  }


  function showError(text) {
    errorMsg.textContent = text;
    errorMsg.hidden = false;
    results.hidden = true;
  }
  
       
});

 /*An example of using the MQA.EventUtil to hook into the window load event and execute defined function
      passed in as the last parameter. You could alternatively create a plain function here and have it
      executed whenever you like (e.g. <body onload="yourfunction">).*/

      MQA.EventUtil.observe(window, 'load', function() {

        /*Create an object for options*/
        var options={
          elt:document.getElementById('map'),        /*ID of element on the page where you want the map added*/
          zoom:13,                                   /*initial zoom level of map*/
          latLng:{lat:40.735383, lng:-73.984655},    /*center of map in latitude/longitude*/
          mtype:'osm'                                /*map type (osm)*/
        };

        /*Construct an instance of MQA.TileMap with the options object*/
        window.map = new MQA.TileMap(options);

        MQA.withModule('directions', function() {
          map.addRoute([
            {latLng: {lat:40.735383, lng:-73.984655}},
            {latLng: {lat:40.765416, lng:-73.985386}}],

            /*Add options.*/
            {ribbonOptions:{draggable:true}},

            /*Add the callback function to the route call.*/
            displayNarrative
          );
        });
      });

      /*Example function inspecting the route data and generating a narrative for display.*/
      function displayNarrative(data){
        if(data.route){
          var legs = data.route.legs, html = '', i = 0, j = 0, trek, maneuver;
          html += '<table><tbody>';

          for (; i < legs.length; i++) {
            for (j = 0; j < legs[i].maneuvers.length; j++) {
              maneuver = legs[i].maneuvers[j];
              html += '<tr>';
              html += '<td>';

              if (maneuver.iconUrl) {
                html += '<img src="' + maneuver.iconUrl + '">  ';
              }

              for (k = 0; k < maneuver.signs.length; k++) {
                var sign = maneuver.signs[k];
                if (sign && sign.url) {
                  html += '<img src="' + sign.url + '">  ';
                }
              }
              html += '</td><td>' + maneuver.narrative + '</td>';
              html += '</tr>';
            }
          }
          html += '</tbody></table>';
          document.getElementById('narrative').innerHTML = html;
        }
      }
