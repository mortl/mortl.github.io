$(document).ready(function() {

  var debug = true;
  var date = new Date();

  var t = setTimeout(updateBackground(debug, date), 1000);
  displayMoonPhase(date);
  //getWeather();


});

//-----------------------------------------------------//

function getWeather() {

  var urlToWU =
    "http://api.wunderground.com/api/c67e9d8da41867a4/geolookup/conditions/q/Canada/Toronto.json";



  $.ajax({
    url: urlToWU,
    dataType: "jsonp",
    success: function(parsed_json) {
      console.log(parsed_json);
      var location = parsed_json.location.city; //['location']['city'];
      var temp_c = parsed_json.current_observation.temp_c; //['current_observation']['temp_c'];



    }
  });

}

function updateBackground(debug, currentDate) {

  //Pull in the ip-api to retrieve the latitude and longitude of the current location of the user.
  $.getJSON("http://ip-api.com/json/?callback=?", function(data) {
    latitude = data.lat;
    longitude = data.lon;

    /*This is the modified Suncalc which I found on Suncalc.net
                I used this version to determine the times of the sun
                because it was better optimized then the original version.*/

    var times = SunCalc2.getDayInfo(currentDate, latitude, longitude, true);

    //Get the morningTwilight object to retrieve data on the various morning hours.
    var morningInfo = times.morningTwilight;

    //Get the nightTwilight object to retreive data on various night hours.
    var nightInfo = times.nightTwilight;

    var morningStart = morningInfo.astronomical.start.getHours();
    var morningEnd = morningInfo.civil.end.getHours();
    var noon = times.transit.getHours();
    var sunriseStart = times.sunrise.start.getHours();
    var sunriseEnd = times.sunrise.end.getHours();
    var nightStart = nightInfo.astronomical.start.getHours();

    var sunset = times.sunset.end.getHours();
    var dusk = times.dusk.getHours() + 2;
    var midnight = 0;


    //display debugging information.
    if (debug === true) {

      console.log("times dusk " + formatTime(times.dusk, true));
      console.log("sunset start " + formatTime(times.sunset.start, true));
      console.log("sunset " + formatTime(times.sunset.end, true));
      console.log("sunrise " + formatTime(times.sunrise.start, true));
      console.log("sunrise end " + formatTime(times.sunrise.end, true));
      console.log("dawn " + formatTime(times.dawn));
      console.log("noon " + formatTime(times.transit, true));
      console.log("dusk " + formatTime(times.dusk, true));


      console.log("sunrise start: " + sunriseStart);
      console.log("sunrise end " + sunriseEnd);
      console.log("night start " + nightStart);
      console.log("morningStart: " + morningStart);
      console.log("morning end " + morningEnd);

    }



    var bodyTag = $("body");
    var showStars = $("#showStars");
    var imgTag = $("#bgImg");
    var cloudDiv = $("#cloudDiv");

    var currentTime = currentDate.getHours();

    if (currentTime <= noon || currentTime <= sunset) {
      console.log("Current Time: " + currentTime);

      $('#main-banner').prepend($('<img>', {
        id: 'bgImg',
        src: './assets/images/74wingold-day.png'
      }));
    } else {
      $('#main-banner').prepend($('<img>', {
        id: 'bgImg',
        src: './assets/images74wingold-night.png'
      }));
    }

    if (midnight <= currentTime && currentTime <= morningStart) {
      bodyTag.toggleClass("dawn sunset");

      showStars.addClass("stars");
      cloudDiv.addClass("clouds-night");
      cloudDiv.removeClass("clouds-day");



    }
    if (currentTime > morningStart && currentTime < noon) {


      bodyTag.toggleClass("sunrise sunset");

      cloudDiv.addClass("clouds-day");
    }
    if (noon <= currentTime && currentTime < sunset) {

      bodyTag.toggleClass("day sunset");

      cloudDiv.addClass("clouds-day");


    }
    if (currentTime <= sunset || currentTime < dusk) {

      bodyTag.toggleClass("sunset");

      cloudDiv.addClass("clouds-day");

    }
    if (currentTime >= dusk || currentTime <= midnight) {

      bodyTag.toggleClass("night");

      showStars.addClass("stars");
      cloudDiv.addClass("clouds-night");

      cloudDiv.removeClass("clouds-day");

    }

  });

}



function displayMoonPhase(currentDate) {

  var moonInfo = SunCalc.getMoonIllumination(currentDate);
  var moonPhase = moonInfo.phase;
  var moonText = findMoonPhase(moonPhase);

  $('.moonPhase').append(moonText);
}

function findMoonPhase(moonPhs) {
  var moonPhStr = "";
  if (moonPhs === 0) {
    moonPhStr = "New Moon";

  } else if (moonPhs > 0 && moonPhs < 0.25) {
    moonPhStr = "Waxing Crescent";
  } else if (moonPhs == 0.25) {
    moonPhStr = "First Quarter";
  } else if (moonPhs > 0.25 && moonPhs < 0.50) {
    moonPhStr = "Waxing Gibbous";
  } else if (moonPhs == 0.50) {
    moonPhStr = "Full Moon";
  } else if (moonPhs > 0.50 && moonPhs < 0.75) {
    moonPhStr = "Last Quarter";
  } else if (moonPhs >= 0.75 && moonPhs <= 1.00) {
    moonPhStr = "Waning Crescent";
  }

  return moonPhStr;
}


function formatTime(date, postfix) {
  if (isNaN(date)) {
    return '&nbsp;&nbsp;n/a&nbsp;&nbsp;';
  }

  var hours = date.getHours(),
    minutes = date.getMinutes(),
    ap;

  if (postfix) {
    ap = (hours < 12 ? 'am' : 'pm');
    if (hours === 0) {
      hours = 12;
    }
    if (hours > 12) {
      hours -= 12;
    }
  } else {
    hours = (hours < 10 ? '0' + hours : '' + hours);
  }

  minutes = (minutes < 10 ? '0' + minutes : '' + minutes);

  return hours + ':' + minutes + (postfix ? ' ' + ap : '');
}
