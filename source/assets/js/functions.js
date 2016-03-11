$(document).ready(function() {

  var debug = true;
  var date = new Date();

  setInterval(updateBackground(debug, date), 100);
 
  //displayMoonPhase(date);
  getWeather();

 
               
           
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

    var noon =  epochTime(times.transit.getTime());
    var sunriseStart =  times.sunrise.start.getTime();
    var sunriseEnd = times.sunrise.end.getTime();
    var nightStart = nightInfo.astronomical.start.getTime();

    var sunset = epochTime(times.sunset.end.getTime());
    var dusk = epochTime(times.dusk.getTime());
    var midnight = epochTime(nightInfo.astronomical.end.getTime());
    midnight = midnight + 14636;
    log("Midnight " +  midnight);

    //display debugging information.
    if (debug === true) {

      log("times dusk " + epochTime(times.dusk.getTime()));
      log("times sunset start " + epochTime(times.sunset.start.getTime()));
      log("times sunset end " + epochTime(times.sunset.end.getTime()));
      log("times sunrise start " + epochTime(times.sunrise.start.getTime()));
      log("times sunrise end " + epochTime(times.sunrise.end.getTime()));
      log("times dawn " + epochTime(times.dawn.getTime()));
      log("times noon " + epochTime(times.transit.getTime()));
      log("night start " + epochTime(nightStart));      

      log("morning start " + epochTime(morningInfo.astronomical.start.getTime()));
      log("morning end " + epochTime(morningInfo.civil.end.getTime()));
      
     
      

    }

    var dayAssets = ['74wingold-day.png'];
    var nightAssets = ['74wingold-night.png'];
    var html = "";
    var bodyTag = $("body");
    var showStars = $("#showStars");
    var imgTag = $("#bgImg");
    var cloudDiv = $("#cloudDiv");


    var epoch =  epochTime(currentDate.getTime());
    log("current time in epoch: " +epoch);

   

    var currentTime = epoch;

   //Changes bg image based on time of day 
   //
    /*if (noon > currentTime && currentTime <= sunset) {

      $('#main-banner').prepend($('<img>', {
        id: 'bgImg',
        src: './assets/img/'+dayAssets[0]
      }));
    }

    if (noon <= currentTime && currentTime < sunset) {

      $('#main-banner').prepend($('<img>', {
        id: 'bgImg',
        src: './assets/img/'+dayAssets[0]
      }));

    }
    if (sunset <= currentTime && currentTime < dusk) {

      $('#main-banner').prepend($('<img>', {
        id: 'bgImg',
        src: './assets/img/'+dayAssets[0]
      }));

    }
    if (midnight <= currentTime && currentTime < morningStart) {
      $('#main-banner').prepend($('<img>', {
        id: 'bgImg',
        src: './assets/img/'+nightAssets[0]
      }));
    }

    
    if (dusk <= currentTime && currentTime <= midnight) {
      $('#main-banner').prepend($('<img>', {
        id: 'bgImg',
        src: './assets/img/'+nightAssets[0]
      }));
    }
*/

    //Check what the current time is and change background color.

    if (midnight <= currentTime && currentTime < morningStart) {
      bodyTag.toggleClass("dawn");
      showStars.addClass("stars");
      cloudDiv.toggleClass("clouds-night");


    }
    if (morningStart <= currentTime && currentTime < noon) {

      bodyTag.toggleClass("sunrise");
      cloudDiv.addClass("clouds-day");
    }
    if (noon <= currentTime && currentTime < sunset) {
      bodyTag.toggleClass("day ");
      cloudDiv.addClass("clouds-day");

    }
    if (sunset <= currentTime && currentTime < dusk) {

      bodyTag.toggleClass("sunset");
      cloudDiv.addClass("clouds-day");

    }
    if (dusk <= currentTime && currentTime <= midnight) {

      bodyTag.toggleClass("night");
      showStars.addClass("stars");
      cloudDiv.addClass("clouds-night");
      cloudDiv.removeClass("clouds-day");

    }

  });

}


function log(val){
  console.log(val);
}
function epochTime(time){
   
   return Math.floor(time/ 1000);
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
