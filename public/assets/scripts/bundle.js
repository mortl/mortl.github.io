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

    var currentTime = 1; //currentDate.getHours();

    if (currentTime <= noon || currentTime <= sunset) {
      console.log("Current Time: " + currentTime);

      $('#main-banner').prepend($('<img>', {
        id: 'bgImg',
        src: './assets/images/74wingold-day.png'
      }));
    } else {
      $('#main-banner').prepend($('<img>', {
        id: 'bgImg',
        src: './assets/images/74wingold-night.png'
      }));
    }

    if (midnight <= currentTime && currentTime <= morningStart) {
      bodyTag.toggleClass("dawn sunset");

      showStars.addClass("stars");
      cloudDiv.removeClass("clouds-day");
      cloudDiv.addClass("clouds-night");



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

SunCalc2 = (function() {
  var J1970 = 2440588,
    J2000 = 2451545,
    deg2rad = Math.PI / 180,
    M0 = 357.5291 * deg2rad,
    M1 = 0.98560028 * deg2rad,
    J0 = 0.0009,
    J1 = 0.0053,
    J2 = -0.0069,
    C1 = 1.9148 * deg2rad,
    C2 = 0.0200 * deg2rad,
    C3 = 0.0003 * deg2rad,
    P = 102.9372 * deg2rad,
    e = 23.45 * deg2rad,
    th0 = 280.1600 * deg2rad,
    th1 = 360.9856235 * deg2rad,
    h0 = -0.83 * deg2rad, //sunset angle
    d0 = 0.53 * deg2rad, //sun diameter
    h1 = -6 * deg2rad, //nautical twilight angle
    h2 = -12 * deg2rad, //astronomical twilight angle
    h3 = -18 * deg2rad, //darkness angle
    msInDay = 1000 * 60 * 60 * 24;

  function dateToJulianDate(date) {
    return date.valueOf() / msInDay - 0.5 + J1970;
  }

  function julianDateToDate(j) {
    return new Date((j + 0.5 - J1970) * msInDay);
  }

  function getJulianCycle(J, lw) {
    return Math.round(J - J2000 - J0 - lw / (2 * Math.PI));
  }

  function getApproxSolarTransit(Ht, lw, n) {
    return J2000 + J0 + (Ht + lw) / (2 * Math.PI) + n;
  }

  function getSolarMeanAnomaly(Js) {
    return M0 + M1 * (Js - J2000);
  }

  function getEquationOfCenter(M) {
    return C1 * Math.sin(M) + C2 * Math.sin(2 * M) + C3 * Math.sin(3 * M);
  }

  function getEclipticLongitude(M, C) {
    return M + P + C + Math.PI;
  }

  function getSolarTransit(Js, M, Lsun) {
    return Js + (J1 * Math.sin(M)) + (J2 * Math.sin(2 * Lsun));
  }

  function getSunDeclination(Lsun) {
    return Math.asin(Math.sin(Lsun) * Math.sin(e));
  }

  function getRightAscension(Lsun) {
    return Math.atan2(Math.sin(Lsun) * Math.cos(e), Math.cos(Lsun));
  }

  function getSiderealTime(J, lw) {
    return th0 + th1 * (J - J2000) - lw;
  }

  function getAzimuth(th, a, phi, d) {
    var H = th - a;
    return Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) -
      Math.tan(d) * Math.cos(phi));
  }

  function getAltitude(th, a, phi, d) {
    var H = th - a;
    return Math.asin(Math.sin(phi) * Math.sin(d) +
      Math.cos(phi) * Math.cos(d) * Math.cos(H));
  }

  function getHourAngle(h, phi, d) {
    return Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(d)) /
      (Math.cos(phi) * Math.cos(d)));
  }

  function getSunsetJulianDate(w0, M, Lsun, lw, n) {
    return getSolarTransit(getApproxSolarTransit(w0, lw, n), M, Lsun);
  }

  function getSunriseJulianDate(Jtransit, Jset) {
    return Jtransit - (Jset - Jtransit);
  }

  function getSunPosition(J, lw, phi) {
    var M = getSolarMeanAnomaly(J),
      C = getEquationOfCenter(M),
      Lsun = getEclipticLongitude(M, C),
      d = getSunDeclination(Lsun),
      a = getRightAscension(Lsun),
      th = getSiderealTime(J, lw);

    return {
      azimuth: getAzimuth(th, a, phi, d),
      altitude: getAltitude(th, a, phi, d)
    };
  }

  return {
    getDayInfo: function(date, lat, lng, detailed) {
      var lw = -lng * deg2rad,
        phi = lat * deg2rad,
        J = dateToJulianDate(date);

      var n = getJulianCycle(J, lw),
        Js = getApproxSolarTransit(0, lw, n),
        M = getSolarMeanAnomaly(Js),
        C = getEquationOfCenter(M),
        Lsun = getEclipticLongitude(M, C),
        d = getSunDeclination(Lsun),
        Jtransit = getSolarTransit(Js, M, Lsun),
        w0 = getHourAngle(h0, phi, d),
        w1 = getHourAngle(h0 + d0, phi, d),
        Jset = getSunsetJulianDate(w0, M, Lsun, lw, n),
        Jsetstart = getSunsetJulianDate(w1, M, Lsun, lw, n),
        Jrise = getSunriseJulianDate(Jtransit, Jset),
        Jriseend = getSunriseJulianDate(Jtransit, Jsetstart),
        w2 = getHourAngle(h1, phi, d),
        Jnau = getSunsetJulianDate(w2, M, Lsun, lw, n),
        Jciv2 = getSunriseJulianDate(Jtransit, Jnau);

      var info = {
        dawn: julianDateToDate(Jciv2),
        sunrise: {
          start: julianDateToDate(Jrise),
          end: julianDateToDate(Jriseend)
        },
        transit: julianDateToDate(Jtransit),
        sunset: {
          start: julianDateToDate(Jsetstart),
          end: julianDateToDate(Jset)
        },
        dusk: julianDateToDate(Jnau)
      };

      if (detailed) {
        var w3 = getHourAngle(h2, phi, d),
          w4 = getHourAngle(h3, phi, d),
          Jastro = getSunsetJulianDate(w3, M, Lsun, lw, n),
          Jdark = getSunsetJulianDate(w4, M, Lsun, lw, n),
          Jnau2 = getSunriseJulianDate(Jtransit, Jastro),
          Jastro2 = getSunriseJulianDate(Jtransit, Jdark);

        info.morningTwilight = {
          astronomical: {
            start: julianDateToDate(Jastro2),
            end: julianDateToDate(Jnau2)
          },
          nautical: {
            start: julianDateToDate(Jnau2),
            end: julianDateToDate(Jciv2)
          },
          civil: {
            start: julianDateToDate(Jciv2),
            end: julianDateToDate(Jrise)
          }
        };
        info.nightTwilight = {
          civil: {
            start: julianDateToDate(Jset),
            end: julianDateToDate(Jnau)
          },
          nautical: {
            start: julianDateToDate(Jnau),
            end: julianDateToDate(Jastro)
          },
          astronomical: {
            start: julianDateToDate(Jastro),
            end: julianDateToDate(Jdark)
          }
        };
      }

      return info;
    },

    getSunPosition: function(date, lat, lng) {
      return getSunPosition(dateToJulianDate(date), -lng * deg2rad, lat *
        deg2rad);
    }
  };



})();

/*
var di = SunCalc.getDayInfo(data, lat, lng);
var sunrisePos = SunCalc.getSunPosition(di.sunrise.start, lat, lng);
var sunsetPos = SunCalc.getSunPosition(di.sunset.end, lat, lng);
*/

/* (c) 2011-2015, Vladimir Agafonkin
 SunCalc is a JavaScript library for calculating sun/moon position and light phases.
 https://github.com/mourner/suncalc
*/

(function() {
  'use strict';

  // shortcuts for easier to read formulas
  var PI = Math.PI,
    sin = Math.sin,
    cos = Math.cos,
    tan = Math.tan,
    asin = Math.asin,
    atan = Math.atan2,
    acos = Math.acos,
    rad = PI / 180;

  // sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas


  // date/time constants and conversions
  var dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545;

  function toJulian(date) {
    return date.valueOf() / dayMs - 0.5 + J1970;
  }

  function fromJulian(j) {
    return new Date((j + 0.5 - J1970) * dayMs);
  }

  function toDays(date) {
    return toJulian(date) - J2000;
  }


  // general calculations for position
  var e = rad * 23.4397; // obliquity of the Earth

  function rightAscension(l, b) {
    return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l));
  }

  function declination(l, b) {
    return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l));
  }

  function azimuth(H, phi, dec) {
    return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi));
  }

  function altitude(H, phi, dec) {
    return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H));
  }

  function siderealTime(d, lw) {
    return rad * (280.16 + 360.9856235 * d) - lw;
  }


  // general sun calculations
  function solarMeanAnomaly(d) {
    return rad * (357.5291 + 0.98560028 * d);
  }

  function eclipticLongitude(M) {

    var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
      P = rad * 102.9372; // perihelion of the Earth

    return M + C + P + PI;
  }

  function sunCoords(d) {
    var M = solarMeanAnomaly(d),
      L = eclipticLongitude(M);

    return {
      dec: declination(L, 0),
      ra: rightAscension(L, 0)
    };
  }

  var SunCalc = {};


  // calculates sun position for a given date and latitude/longitude
  SunCalc.getPosition = function(date, lat, lng) {
    var lw = rad * -lng,
      phi = rad * lat,
      d = toDays(date),

      c = sunCoords(d),
      H = siderealTime(d, lw) - c.ra;

    return {
      azimuth: azimuth(H, phi, c.dec),
      altitude: altitude(H, phi, c.dec)
    };
  };


  // sun times configuration (angle, morning name, evening name)
  var times = SunCalc.times = [
    [-0.833, 'sunrise', 'sunset'],
    [-0.3, 'sunriseEnd', 'sunsetStart'],
    [-6, 'dawn', 'dusk'],
    [-12, 'nauticalDawn', 'nauticalDusk'],
    [-18, 'nightEnd', 'night'],
    [6, 'goldenHourEnd', 'goldenHour']
  ];

  // adds a custom time to the times config
  SunCalc.addTime = function(angle, riseName, setName) {
    times.push([angle, riseName, setName]);
  };


  // calculations for sun times
  var J0 = 0.0009;

  function julianCycle(d, lw) {
    return Math.round(d - J0 - lw / (2 * PI));
  }

  function approxTransit(Ht, lw, n) {
    return J0 + (Ht + lw) / (2 * PI) + n;
  }

  function solarTransitJ(ds, M, L) {
    return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L);
  }

  function hourAngle(h, phi, d) {
    return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)));
  }

  // returns set time for the given sun altitude
  function getSetJ(h, lw, phi, dec, n, M, L) {

    var w = hourAngle(h, phi, dec),
      a = approxTransit(w, lw, n);
    return solarTransitJ(a, M, L);
  }


  // calculates sun times for a given date and latitude/longitude
  SunCalc.getTimes = function(date, lat, lng) {
    var lw = rad * -lng,
      phi = rad * lat,

      d = toDays(date),
      n = julianCycle(d, lw),
      ds = approxTransit(0, lw, n),

      M = solarMeanAnomaly(ds),
      L = eclipticLongitude(M),
      dec = declination(L, 0),

      Jnoon = solarTransitJ(ds, M, L),

      i, len, time, Jset, Jrise;


    var result = {
      solarNoon: fromJulian(Jnoon),
      nadir: fromJulian(Jnoon - 0.5)
    };

    for (i = 0, len = times.length; i < len; i += 1) {
      time = times[i];

      Jset = getSetJ(time[0] * rad, lw, phi, dec, n, M, L);
      Jrise = Jnoon - (Jset - Jnoon);

      result[time[1]] = fromJulian(Jrise);
      result[time[2]] = fromJulian(Jset);
    }

    return result;
  };


  // moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas

  function moonCoords(d) { // geocentric ecliptic coordinates of the moon

    var L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
      M = rad * (134.963 + 13.064993 * d), // mean anomaly
      F = rad * (93.272 + 13.229350 * d), // mean distance

      l = L + rad * 6.289 * sin(M), // longitude
      b = rad * 5.128 * sin(F), // latitude
      dt = 385001 - 20905 * cos(M); // distance to the moon in km

    return {
      ra: rightAscension(l, b),
      dec: declination(l, b),
      dist: dt
    };
  }

  SunCalc.getMoonPosition = function(date, lat, lng) {

    var lw = rad * -lng,
      phi = rad * lat,
      d = toDays(date),

      c = moonCoords(d),
      H = siderealTime(d, lw) - c.ra,
      h = altitude(H, phi, c.dec);

    // altitude correction for refraction
    h = h + rad * 0.017 / tan(h + rad * 10.26 / (h + rad * 5.10));

    return {
      azimuth: azimuth(H, phi, c.dec),
      altitude: h,
      distance: c.dist
    };
  };


  // calculations for illumination parameters of the moon,
  // based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
  // Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.

  SunCalc.getMoonIllumination = function(date) {

    var d = toDays(date),
      s = sunCoords(d),
      m = moonCoords(d),

      sdist = 149598000, // distance from Earth to Sun in km

      phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra -
        m.ra)),
      inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
      angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) -
        cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));

    return {
      fraction: (1 + cos(inc)) / 2,
      phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
      angle: angle
    };
  };


  function hoursLater(date, h) {
    return new Date(date.valueOf() + h * dayMs / 24);
  }

  // calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article
  SunCalc.getMoonTimes = function(date, lat, lng, inUTC) {
    var t = new Date(date);
    if (inUTC) t.setUTCHours(0, 0, 0, 0);
    else t.setHours(0, 0, 0, 0);

    var hc = 0.133 * rad,
      h0 = SunCalc.getMoonPosition(t, lat, lng).altitude - hc,
      h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;

    // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
    for (var i = 1; i <= 24; i += 2) {
      h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude -
        hc;
      h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude -
        hc;

      a = (h0 + h2) / 2 - h1;
      b = (h2 - h0) / 2;
      xe = -b / (2 * a);
      ye = (a * xe + b) * xe + h1;
      d = b * b - 4 * a * h1;
      roots = 0;

      if (d >= 0) {
        dx = Math.sqrt(d) / (Math.abs(a) * 2);
        x1 = xe - dx;
        x2 = xe + dx;
        if (Math.abs(x1) <= 1) roots++;
        if (Math.abs(x2) <= 1) roots++;
        if (x1 < -1) x1 = x2;
      }

      if (roots === 1) {
        if (h0 < 0) rise = i + x1;
        else set = i + x1;

      } else if (roots === 2) {
        rise = i + (ye < 0 ? x2 : x1);
        set = i + (ye < 0 ? x1 : x2);
      }

      if (rise && set) break;

      h0 = h2;
    }

    var result = {};

    if (rise) result.rise = hoursLater(t, rise);
    if (set) result.set = hoursLater(t, set);

    if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;

    return result;
  };


  // export as AMD module / Node module / browser variable
  if (typeof define === 'function' && define.amd) define(SunCalc);
  else if (typeof module !== 'undefined') module.exports = SunCalc;
  else window.SunCalc = SunCalc;

}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCJzdW5jYWxjLTItMC5qcyIsInN1bmNhbGMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIGRlYnVnID0gdHJ1ZTtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuXG4gIHZhciB0ID0gc2V0VGltZW91dCh1cGRhdGVCYWNrZ3JvdW5kKGRlYnVnLCBkYXRlKSwgMTAwMCk7XG4gIGRpc3BsYXlNb29uUGhhc2UoZGF0ZSk7XG4gIC8vZ2V0V2VhdGhlcigpO1xuXG5cbn0pO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblxuZnVuY3Rpb24gZ2V0V2VhdGhlcigpIHtcblxuICB2YXIgdXJsVG9XVSA9XG4gICAgXCJodHRwOi8vYXBpLnd1bmRlcmdyb3VuZC5jb20vYXBpL2M2N2U5ZDhkYTQxODY3YTQvZ2VvbG9va3VwL2NvbmRpdGlvbnMvcS9DYW5hZGEvVG9yb250by5qc29uXCI7XG5cblxuXG4gICQuYWpheCh7XG4gICAgdXJsOiB1cmxUb1dVLFxuICAgIGRhdGFUeXBlOiBcImpzb25wXCIsXG4gICAgc3VjY2VzczogZnVuY3Rpb24ocGFyc2VkX2pzb24pIHtcbiAgICAgIGNvbnNvbGUubG9nKHBhcnNlZF9qc29uKTtcbiAgICAgIHZhciBsb2NhdGlvbiA9IHBhcnNlZF9qc29uLmxvY2F0aW9uLmNpdHk7IC8vWydsb2NhdGlvbiddWydjaXR5J107XG4gICAgICB2YXIgdGVtcF9jID0gcGFyc2VkX2pzb24uY3VycmVudF9vYnNlcnZhdGlvbi50ZW1wX2M7IC8vWydjdXJyZW50X29ic2VydmF0aW9uJ11bJ3RlbXBfYyddO1xuXG5cblxuICAgIH1cbiAgfSk7XG5cbn1cblxuZnVuY3Rpb24gdXBkYXRlQmFja2dyb3VuZChkZWJ1ZywgY3VycmVudERhdGUpIHtcblxuICAvL1B1bGwgaW4gdGhlIGlwLWFwaSB0byByZXRyaWV2ZSB0aGUgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSBvZiB0aGUgY3VycmVudCBsb2NhdGlvbiBvZiB0aGUgdXNlci5cbiAgJC5nZXRKU09OKFwiaHR0cDovL2lwLWFwaS5jb20vanNvbi8/Y2FsbGJhY2s9P1wiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgbGF0aXR1ZGUgPSBkYXRhLmxhdDtcbiAgICBsb25naXR1ZGUgPSBkYXRhLmxvbjtcblxuICAgIC8qVGhpcyBpcyB0aGUgbW9kaWZpZWQgU3VuY2FsYyB3aGljaCBJIGZvdW5kIG9uIFN1bmNhbGMubmV0XG4gICAgICAgICAgICAgICAgSSB1c2VkIHRoaXMgdmVyc2lvbiB0byBkZXRlcm1pbmUgdGhlIHRpbWVzIG9mIHRoZSBzdW5cbiAgICAgICAgICAgICAgICBiZWNhdXNlIGl0IHdhcyBiZXR0ZXIgb3B0aW1pemVkIHRoZW4gdGhlIG9yaWdpbmFsIHZlcnNpb24uKi9cblxuICAgIHZhciB0aW1lcyA9IFN1bkNhbGMyLmdldERheUluZm8oY3VycmVudERhdGUsIGxhdGl0dWRlLCBsb25naXR1ZGUsIHRydWUpO1xuXG4gICAgLy9HZXQgdGhlIG1vcm5pbmdUd2lsaWdodCBvYmplY3QgdG8gcmV0cmlldmUgZGF0YSBvbiB0aGUgdmFyaW91cyBtb3JuaW5nIGhvdXJzLlxuICAgIHZhciBtb3JuaW5nSW5mbyA9IHRpbWVzLm1vcm5pbmdUd2lsaWdodDtcblxuICAgIC8vR2V0IHRoZSBuaWdodFR3aWxpZ2h0IG9iamVjdCB0byByZXRyZWl2ZSBkYXRhIG9uIHZhcmlvdXMgbmlnaHQgaG91cnMuXG4gICAgdmFyIG5pZ2h0SW5mbyA9IHRpbWVzLm5pZ2h0VHdpbGlnaHQ7XG5cbiAgICB2YXIgbW9ybmluZ1N0YXJ0ID0gbW9ybmluZ0luZm8uYXN0cm9ub21pY2FsLnN0YXJ0LmdldEhvdXJzKCk7XG4gICAgdmFyIG1vcm5pbmdFbmQgPSBtb3JuaW5nSW5mby5jaXZpbC5lbmQuZ2V0SG91cnMoKTtcbiAgICB2YXIgbm9vbiA9IHRpbWVzLnRyYW5zaXQuZ2V0SG91cnMoKTtcbiAgICB2YXIgc3VucmlzZVN0YXJ0ID0gdGltZXMuc3VucmlzZS5zdGFydC5nZXRIb3VycygpO1xuICAgIHZhciBzdW5yaXNlRW5kID0gdGltZXMuc3VucmlzZS5lbmQuZ2V0SG91cnMoKTtcbiAgICB2YXIgbmlnaHRTdGFydCA9IG5pZ2h0SW5mby5hc3Ryb25vbWljYWwuc3RhcnQuZ2V0SG91cnMoKTtcblxuICAgIHZhciBzdW5zZXQgPSB0aW1lcy5zdW5zZXQuZW5kLmdldEhvdXJzKCk7XG4gICAgdmFyIGR1c2sgPSB0aW1lcy5kdXNrLmdldEhvdXJzKCkgKyAyO1xuICAgIHZhciBtaWRuaWdodCA9IDA7XG5cblxuICAgIC8vZGlzcGxheSBkZWJ1Z2dpbmcgaW5mb3JtYXRpb24uXG4gICAgaWYgKGRlYnVnID09PSB0cnVlKSB7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwidGltZXMgZHVzayBcIiArIGZvcm1hdFRpbWUodGltZXMuZHVzaywgdHJ1ZSkpO1xuICAgICAgY29uc29sZS5sb2coXCJzdW5zZXQgc3RhcnQgXCIgKyBmb3JtYXRUaW1lKHRpbWVzLnN1bnNldC5zdGFydCwgdHJ1ZSkpO1xuICAgICAgY29uc29sZS5sb2coXCJzdW5zZXQgXCIgKyBmb3JtYXRUaW1lKHRpbWVzLnN1bnNldC5lbmQsIHRydWUpKTtcbiAgICAgIGNvbnNvbGUubG9nKFwic3VucmlzZSBcIiArIGZvcm1hdFRpbWUodGltZXMuc3VucmlzZS5zdGFydCwgdHJ1ZSkpO1xuICAgICAgY29uc29sZS5sb2coXCJzdW5yaXNlIGVuZCBcIiArIGZvcm1hdFRpbWUodGltZXMuc3VucmlzZS5lbmQsIHRydWUpKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGF3biBcIiArIGZvcm1hdFRpbWUodGltZXMuZGF3bikpO1xuICAgICAgY29uc29sZS5sb2coXCJub29uIFwiICsgZm9ybWF0VGltZSh0aW1lcy50cmFuc2l0LCB0cnVlKSk7XG4gICAgICBjb25zb2xlLmxvZyhcImR1c2sgXCIgKyBmb3JtYXRUaW1lKHRpbWVzLmR1c2ssIHRydWUpKTtcblxuXG4gICAgICBjb25zb2xlLmxvZyhcInN1bnJpc2Ugc3RhcnQ6IFwiICsgc3VucmlzZVN0YXJ0KTtcbiAgICAgIGNvbnNvbGUubG9nKFwic3VucmlzZSBlbmQgXCIgKyBzdW5yaXNlRW5kKTtcbiAgICAgIGNvbnNvbGUubG9nKFwibmlnaHQgc3RhcnQgXCIgKyBuaWdodFN0YXJ0KTtcbiAgICAgIGNvbnNvbGUubG9nKFwibW9ybmluZ1N0YXJ0OiBcIiArIG1vcm5pbmdTdGFydCk7XG4gICAgICBjb25zb2xlLmxvZyhcIm1vcm5pbmcgZW5kIFwiICsgbW9ybmluZ0VuZCk7XG5cbiAgICB9XG5cblxuXG4gICAgdmFyIGJvZHlUYWcgPSAkKFwiYm9keVwiKTtcbiAgICB2YXIgc2hvd1N0YXJzID0gJChcIiNzaG93U3RhcnNcIik7XG4gICAgdmFyIGltZ1RhZyA9ICQoXCIjYmdJbWdcIik7XG4gICAgdmFyIGNsb3VkRGl2ID0gJChcIiNjbG91ZERpdlwiKTtcblxuICAgIHZhciBjdXJyZW50VGltZSA9IGN1cnJlbnREYXRlLmdldEhvdXJzKCk7XG5cbiAgICBpZiAoY3VycmVudFRpbWUgPD0gbm9vbiB8fCBjdXJyZW50VGltZSA8PSBzdW5zZXQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQ3VycmVudCBUaW1lOiBcIiArIGN1cnJlbnRUaW1lKTtcblxuICAgICAgJCgnI21haW4tYmFubmVyJykucHJlcGVuZCgkKCc8aW1nPicsIHtcbiAgICAgICAgaWQ6ICdiZ0ltZycsXG4gICAgICAgIHNyYzogJy4vYXNzZXRzL2ltYWdlcy83NHdpbmdvbGQtZGF5LnBuZydcbiAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCgnI21haW4tYmFubmVyJykucHJlcGVuZCgkKCc8aW1nPicsIHtcbiAgICAgICAgaWQ6ICdiZ0ltZycsXG4gICAgICAgIHNyYzogJy4vYXNzZXRzL2ltYWdlczc0d2luZ29sZC1uaWdodC5wbmcnXG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgaWYgKG1pZG5pZ2h0IDw9IGN1cnJlbnRUaW1lICYmIGN1cnJlbnRUaW1lIDw9IG1vcm5pbmdTdGFydCkge1xuICAgICAgYm9keVRhZy50b2dnbGVDbGFzcyhcImRhd24gc3Vuc2V0XCIpO1xuXG4gICAgICBzaG93U3RhcnMuYWRkQ2xhc3MoXCJzdGFyc1wiKTtcbiAgICAgIGNsb3VkRGl2LmFkZENsYXNzKFwiY2xvdWRzLW5pZ2h0XCIpO1xuICAgICAgY2xvdWREaXYucmVtb3ZlQ2xhc3MoXCJjbG91ZHMtZGF5XCIpO1xuXG5cblxuICAgIH1cbiAgICBpZiAoY3VycmVudFRpbWUgPiBtb3JuaW5nU3RhcnQgJiYgY3VycmVudFRpbWUgPCBub29uKSB7XG5cblxuICAgICAgYm9keVRhZy50b2dnbGVDbGFzcyhcInN1bnJpc2Ugc3Vuc2V0XCIpO1xuXG4gICAgICBjbG91ZERpdi5hZGRDbGFzcyhcImNsb3Vkcy1kYXlcIik7XG4gICAgfVxuICAgIGlmIChub29uIDw9IGN1cnJlbnRUaW1lICYmIGN1cnJlbnRUaW1lIDwgc3Vuc2V0KSB7XG5cbiAgICAgIGJvZHlUYWcudG9nZ2xlQ2xhc3MoXCJkYXkgc3Vuc2V0XCIpO1xuXG4gICAgICBjbG91ZERpdi5hZGRDbGFzcyhcImNsb3Vkcy1kYXlcIik7XG5cblxuICAgIH1cbiAgICBpZiAoY3VycmVudFRpbWUgPD0gc3Vuc2V0IHx8IGN1cnJlbnRUaW1lIDwgZHVzaykge1xuXG4gICAgICBib2R5VGFnLnRvZ2dsZUNsYXNzKFwic3Vuc2V0XCIpO1xuXG4gICAgICBjbG91ZERpdi5hZGRDbGFzcyhcImNsb3Vkcy1kYXlcIik7XG5cbiAgICB9XG4gICAgaWYgKGN1cnJlbnRUaW1lID49IGR1c2sgfHwgY3VycmVudFRpbWUgPD0gbWlkbmlnaHQpIHtcblxuICAgICAgYm9keVRhZy50b2dnbGVDbGFzcyhcIm5pZ2h0XCIpO1xuXG4gICAgICBzaG93U3RhcnMuYWRkQ2xhc3MoXCJzdGFyc1wiKTtcbiAgICAgIGNsb3VkRGl2LmFkZENsYXNzKFwiY2xvdWRzLW5pZ2h0XCIpO1xuXG4gICAgICBjbG91ZERpdi5yZW1vdmVDbGFzcyhcImNsb3Vkcy1kYXlcIik7XG5cbiAgICB9XG5cbiAgfSk7XG5cbn1cblxuXG5cbmZ1bmN0aW9uIGRpc3BsYXlNb29uUGhhc2UoY3VycmVudERhdGUpIHtcblxuICB2YXIgbW9vbkluZm8gPSBTdW5DYWxjLmdldE1vb25JbGx1bWluYXRpb24oY3VycmVudERhdGUpO1xuICB2YXIgbW9vblBoYXNlID0gbW9vbkluZm8ucGhhc2U7XG4gIHZhciBtb29uVGV4dCA9IGZpbmRNb29uUGhhc2UobW9vblBoYXNlKTtcblxuICAkKCcubW9vblBoYXNlJykuYXBwZW5kKG1vb25UZXh0KTtcbn1cblxuZnVuY3Rpb24gZmluZE1vb25QaGFzZShtb29uUGhzKSB7XG4gIHZhciBtb29uUGhTdHIgPSBcIlwiO1xuICBpZiAobW9vblBocyA9PT0gMCkge1xuICAgIG1vb25QaFN0ciA9IFwiTmV3IE1vb25cIjtcblxuICB9IGVsc2UgaWYgKG1vb25QaHMgPiAwICYmIG1vb25QaHMgPCAwLjI1KSB7XG4gICAgbW9vblBoU3RyID0gXCJXYXhpbmcgQ3Jlc2NlbnRcIjtcbiAgfSBlbHNlIGlmIChtb29uUGhzID09IDAuMjUpIHtcbiAgICBtb29uUGhTdHIgPSBcIkZpcnN0IFF1YXJ0ZXJcIjtcbiAgfSBlbHNlIGlmIChtb29uUGhzID4gMC4yNSAmJiBtb29uUGhzIDwgMC41MCkge1xuICAgIG1vb25QaFN0ciA9IFwiV2F4aW5nIEdpYmJvdXNcIjtcbiAgfSBlbHNlIGlmIChtb29uUGhzID09IDAuNTApIHtcbiAgICBtb29uUGhTdHIgPSBcIkZ1bGwgTW9vblwiO1xuICB9IGVsc2UgaWYgKG1vb25QaHMgPiAwLjUwICYmIG1vb25QaHMgPCAwLjc1KSB7XG4gICAgbW9vblBoU3RyID0gXCJMYXN0IFF1YXJ0ZXJcIjtcbiAgfSBlbHNlIGlmIChtb29uUGhzID49IDAuNzUgJiYgbW9vblBocyA8PSAxLjAwKSB7XG4gICAgbW9vblBoU3RyID0gXCJXYW5pbmcgQ3Jlc2NlbnRcIjtcbiAgfVxuXG4gIHJldHVybiBtb29uUGhTdHI7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VGltZShkYXRlLCBwb3N0Zml4KSB7XG4gIGlmIChpc05hTihkYXRlKSkge1xuICAgIHJldHVybiAnJm5ic3A7Jm5ic3A7bi9hJm5ic3A7Jm5ic3A7JztcbiAgfVxuXG4gIHZhciBob3VycyA9IGRhdGUuZ2V0SG91cnMoKSxcbiAgICBtaW51dGVzID0gZGF0ZS5nZXRNaW51dGVzKCksXG4gICAgYXA7XG5cbiAgaWYgKHBvc3RmaXgpIHtcbiAgICBhcCA9IChob3VycyA8IDEyID8gJ2FtJyA6ICdwbScpO1xuICAgIGlmIChob3VycyA9PT0gMCkge1xuICAgICAgaG91cnMgPSAxMjtcbiAgICB9XG4gICAgaWYgKGhvdXJzID4gMTIpIHtcbiAgICAgIGhvdXJzIC09IDEyO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBob3VycyA9IChob3VycyA8IDEwID8gJzAnICsgaG91cnMgOiAnJyArIGhvdXJzKTtcbiAgfVxuXG4gIG1pbnV0ZXMgPSAobWludXRlcyA8IDEwID8gJzAnICsgbWludXRlcyA6ICcnICsgbWludXRlcyk7XG5cbiAgcmV0dXJuIGhvdXJzICsgJzonICsgbWludXRlcyArIChwb3N0Zml4ID8gJyAnICsgYXAgOiAnJyk7XG59XG4iLCJTdW5DYWxjMiA9IChmdW5jdGlvbigpIHtcblx0dmFyIEoxOTcwID0gMjQ0MDU4OCxcblx0XHRKMjAwMCA9IDI0NTE1NDUsXG5cdFx0ZGVnMnJhZCA9IE1hdGguUEkgLyAxODAsXG5cdFx0TTAgPSAzNTcuNTI5MSAqIGRlZzJyYWQsXG5cdFx0TTEgPSAwLjk4NTYwMDI4ICogZGVnMnJhZCxcblx0XHRKMCA9IDAuMDAwOSxcblx0XHRKMSA9IDAuMDA1Myxcblx0XHRKMiA9IC0wLjAwNjksXG5cdFx0QzEgPSAxLjkxNDggKiBkZWcycmFkLFxuXHRcdEMyID0gMC4wMjAwICogZGVnMnJhZCxcblx0XHRDMyA9IDAuMDAwMyAqIGRlZzJyYWQsXG5cdFx0UCA9IDEwMi45MzcyICogZGVnMnJhZCxcblx0XHRlID0gMjMuNDUgKiBkZWcycmFkLFxuXHRcdHRoMCA9IDI4MC4xNjAwICogZGVnMnJhZCxcblx0XHR0aDEgPSAzNjAuOTg1NjIzNSAqIGRlZzJyYWQsXG5cdFx0aDAgPSAtMC44MyAqIGRlZzJyYWQsIC8vc3Vuc2V0IGFuZ2xlXG5cdFx0ZDAgPSAwLjUzICogZGVnMnJhZCwgLy9zdW4gZGlhbWV0ZXJcblx0XHRoMSA9IC02ICogZGVnMnJhZCwgLy9uYXV0aWNhbCB0d2lsaWdodCBhbmdsZVxuXHRcdGgyID0gLTEyICogZGVnMnJhZCwgLy9hc3Ryb25vbWljYWwgdHdpbGlnaHQgYW5nbGVcblx0XHRoMyA9IC0xOCAqIGRlZzJyYWQsIC8vZGFya25lc3MgYW5nbGVcblx0XHRtc0luRGF5ID0gMTAwMCAqIDYwICogNjAgKiAyNDtcblxuXHRmdW5jdGlvbiBkYXRlVG9KdWxpYW5EYXRlKGRhdGUpIHtcblx0XHRyZXR1cm4gZGF0ZS52YWx1ZU9mKCkgLyBtc0luRGF5IC0gMC41ICsgSjE5NzA7XG5cdH1cblxuXHRmdW5jdGlvbiBqdWxpYW5EYXRlVG9EYXRlKGopIHtcblx0XHRyZXR1cm4gbmV3IERhdGUoKGogKyAwLjUgLSBKMTk3MCkgKiBtc0luRGF5KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldEp1bGlhbkN5Y2xlKEosIGx3KSB7XG5cdFx0cmV0dXJuIE1hdGgucm91bmQoSiAtIEoyMDAwIC0gSjAgLSBsdyAvICgyICogTWF0aC5QSSkpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0QXBwcm94U29sYXJUcmFuc2l0KEh0LCBsdywgbikge1xuXHRcdHJldHVybiBKMjAwMCArIEowICsgKEh0ICsgbHcpIC8gKDIgKiBNYXRoLlBJKSArIG47XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRTb2xhck1lYW5Bbm9tYWx5KEpzKSB7XG5cdFx0cmV0dXJuIE0wICsgTTEgKiAoSnMgLSBKMjAwMCk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRFcXVhdGlvbk9mQ2VudGVyKE0pIHtcblx0XHRyZXR1cm4gQzEgKiBNYXRoLnNpbihNKSArIEMyICogTWF0aC5zaW4oMiAqIE0pICsgQzMgKiBNYXRoLnNpbigzICogTSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRFY2xpcHRpY0xvbmdpdHVkZShNLCBDKSB7XG5cdFx0cmV0dXJuIE0gKyBQICsgQyArIE1hdGguUEk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRTb2xhclRyYW5zaXQoSnMsIE0sIExzdW4pIHtcblx0XHRyZXR1cm4gSnMgKyAoSjEgKiBNYXRoLnNpbihNKSkgKyAoSjIgKiBNYXRoLnNpbigyICogTHN1bikpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0U3VuRGVjbGluYXRpb24oTHN1bikge1xuXHRcdHJldHVybiBNYXRoLmFzaW4oTWF0aC5zaW4oTHN1bikgKiBNYXRoLnNpbihlKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRSaWdodEFzY2Vuc2lvbihMc3VuKSB7XG5cdFx0cmV0dXJuIE1hdGguYXRhbjIoTWF0aC5zaW4oTHN1bikgKiBNYXRoLmNvcyhlKSwgTWF0aC5jb3MoTHN1bikpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0U2lkZXJlYWxUaW1lKEosIGx3KSB7XG5cdFx0cmV0dXJuIHRoMCArIHRoMSAqIChKIC0gSjIwMDApIC0gbHc7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRBemltdXRoKHRoLCBhLCBwaGksIGQpIHtcblx0XHR2YXIgSCA9IHRoIC0gYTtcblx0XHRyZXR1cm4gTWF0aC5hdGFuMihNYXRoLnNpbihIKSwgTWF0aC5jb3MoSCkgKiBNYXRoLnNpbihwaGkpIC1cblx0XHRcdE1hdGgudGFuKGQpICogTWF0aC5jb3MocGhpKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRBbHRpdHVkZSh0aCwgYSwgcGhpLCBkKSB7XG5cdFx0dmFyIEggPSB0aCAtIGE7XG5cdFx0cmV0dXJuIE1hdGguYXNpbihNYXRoLnNpbihwaGkpICogTWF0aC5zaW4oZCkgK1xuXHRcdFx0TWF0aC5jb3MocGhpKSAqIE1hdGguY29zKGQpICogTWF0aC5jb3MoSCkpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0SG91ckFuZ2xlKGgsIHBoaSwgZCkge1xuXHRcdHJldHVybiBNYXRoLmFjb3MoKE1hdGguc2luKGgpIC0gTWF0aC5zaW4ocGhpKSAqIE1hdGguc2luKGQpKSAvXG5cdFx0XHQoTWF0aC5jb3MocGhpKSAqIE1hdGguY29zKGQpKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRTdW5zZXRKdWxpYW5EYXRlKHcwLCBNLCBMc3VuLCBsdywgbikge1xuXHRcdHJldHVybiBnZXRTb2xhclRyYW5zaXQoZ2V0QXBwcm94U29sYXJUcmFuc2l0KHcwLCBsdywgbiksIE0sIExzdW4pO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0U3VucmlzZUp1bGlhbkRhdGUoSnRyYW5zaXQsIEpzZXQpIHtcblx0XHRyZXR1cm4gSnRyYW5zaXQgLSAoSnNldCAtIEp0cmFuc2l0KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldFN1blBvc2l0aW9uKEosIGx3LCBwaGkpIHtcblx0XHR2YXIgTSA9IGdldFNvbGFyTWVhbkFub21hbHkoSiksXG5cdFx0XHRDID0gZ2V0RXF1YXRpb25PZkNlbnRlcihNKSxcblx0XHRcdExzdW4gPSBnZXRFY2xpcHRpY0xvbmdpdHVkZShNLCBDKSxcblx0XHRcdGQgPSBnZXRTdW5EZWNsaW5hdGlvbihMc3VuKSxcblx0XHRcdGEgPSBnZXRSaWdodEFzY2Vuc2lvbihMc3VuKSxcblx0XHRcdHRoID0gZ2V0U2lkZXJlYWxUaW1lKEosIGx3KTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRhemltdXRoOiBnZXRBemltdXRoKHRoLCBhLCBwaGksIGQpLFxuXHRcdFx0YWx0aXR1ZGU6IGdldEFsdGl0dWRlKHRoLCBhLCBwaGksIGQpXG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Z2V0RGF5SW5mbzogZnVuY3Rpb24oZGF0ZSwgbGF0LCBsbmcsIGRldGFpbGVkKSB7XG5cdFx0XHR2YXIgbHcgPSAtbG5nICogZGVnMnJhZCxcblx0XHRcdFx0cGhpID0gbGF0ICogZGVnMnJhZCxcblx0XHRcdFx0SiA9IGRhdGVUb0p1bGlhbkRhdGUoZGF0ZSk7XG5cblx0XHRcdHZhciBuID0gZ2V0SnVsaWFuQ3ljbGUoSiwgbHcpLFxuXHRcdFx0XHRKcyA9IGdldEFwcHJveFNvbGFyVHJhbnNpdCgwLCBsdywgbiksXG5cdFx0XHRcdE0gPSBnZXRTb2xhck1lYW5Bbm9tYWx5KEpzKSxcblx0XHRcdFx0QyA9IGdldEVxdWF0aW9uT2ZDZW50ZXIoTSksXG5cdFx0XHRcdExzdW4gPSBnZXRFY2xpcHRpY0xvbmdpdHVkZShNLCBDKSxcblx0XHRcdFx0ZCA9IGdldFN1bkRlY2xpbmF0aW9uKExzdW4pLFxuXHRcdFx0XHRKdHJhbnNpdCA9IGdldFNvbGFyVHJhbnNpdChKcywgTSwgTHN1biksXG5cdFx0XHRcdHcwID0gZ2V0SG91ckFuZ2xlKGgwLCBwaGksIGQpLFxuXHRcdFx0XHR3MSA9IGdldEhvdXJBbmdsZShoMCArIGQwLCBwaGksIGQpLFxuXHRcdFx0XHRKc2V0ID0gZ2V0U3Vuc2V0SnVsaWFuRGF0ZSh3MCwgTSwgTHN1biwgbHcsIG4pLFxuXHRcdFx0XHRKc2V0c3RhcnQgPSBnZXRTdW5zZXRKdWxpYW5EYXRlKHcxLCBNLCBMc3VuLCBsdywgbiksXG5cdFx0XHRcdEpyaXNlID0gZ2V0U3VucmlzZUp1bGlhbkRhdGUoSnRyYW5zaXQsIEpzZXQpLFxuXHRcdFx0XHRKcmlzZWVuZCA9IGdldFN1bnJpc2VKdWxpYW5EYXRlKEp0cmFuc2l0LCBKc2V0c3RhcnQpLFxuXHRcdFx0XHR3MiA9IGdldEhvdXJBbmdsZShoMSwgcGhpLCBkKSxcblx0XHRcdFx0Sm5hdSA9IGdldFN1bnNldEp1bGlhbkRhdGUodzIsIE0sIExzdW4sIGx3LCBuKSxcblx0XHRcdFx0SmNpdjIgPSBnZXRTdW5yaXNlSnVsaWFuRGF0ZShKdHJhbnNpdCwgSm5hdSk7XG5cblx0XHRcdHZhciBpbmZvID0ge1xuXHRcdFx0XHRkYXduOiBqdWxpYW5EYXRlVG9EYXRlKEpjaXYyKSxcblx0XHRcdFx0c3VucmlzZToge1xuXHRcdFx0XHRcdHN0YXJ0OiBqdWxpYW5EYXRlVG9EYXRlKEpyaXNlKSxcblx0XHRcdFx0XHRlbmQ6IGp1bGlhbkRhdGVUb0RhdGUoSnJpc2VlbmQpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRyYW5zaXQ6IGp1bGlhbkRhdGVUb0RhdGUoSnRyYW5zaXQpLFxuXHRcdFx0XHRzdW5zZXQ6IHtcblx0XHRcdFx0XHRzdGFydDoganVsaWFuRGF0ZVRvRGF0ZShKc2V0c3RhcnQpLFxuXHRcdFx0XHRcdGVuZDoganVsaWFuRGF0ZVRvRGF0ZShKc2V0KVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkdXNrOiBqdWxpYW5EYXRlVG9EYXRlKEpuYXUpXG5cdFx0XHR9O1xuXG5cdFx0XHRpZiAoZGV0YWlsZWQpIHtcblx0XHRcdFx0dmFyIHczID0gZ2V0SG91ckFuZ2xlKGgyLCBwaGksIGQpLFxuXHRcdFx0XHRcdHc0ID0gZ2V0SG91ckFuZ2xlKGgzLCBwaGksIGQpLFxuXHRcdFx0XHRcdEphc3RybyA9IGdldFN1bnNldEp1bGlhbkRhdGUodzMsIE0sIExzdW4sIGx3LCBuKSxcblx0XHRcdFx0XHRKZGFyayA9IGdldFN1bnNldEp1bGlhbkRhdGUodzQsIE0sIExzdW4sIGx3LCBuKSxcblx0XHRcdFx0XHRKbmF1MiA9IGdldFN1bnJpc2VKdWxpYW5EYXRlKEp0cmFuc2l0LCBKYXN0cm8pLFxuXHRcdFx0XHRcdEphc3RybzIgPSBnZXRTdW5yaXNlSnVsaWFuRGF0ZShKdHJhbnNpdCwgSmRhcmspO1xuXG5cdFx0XHRcdGluZm8ubW9ybmluZ1R3aWxpZ2h0ID0ge1xuXHRcdFx0XHRcdGFzdHJvbm9taWNhbDoge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IGp1bGlhbkRhdGVUb0RhdGUoSmFzdHJvMiksXG5cdFx0XHRcdFx0XHRlbmQ6IGp1bGlhbkRhdGVUb0RhdGUoSm5hdTIpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRuYXV0aWNhbDoge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IGp1bGlhbkRhdGVUb0RhdGUoSm5hdTIpLFxuXHRcdFx0XHRcdFx0ZW5kOiBqdWxpYW5EYXRlVG9EYXRlKEpjaXYyKVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Y2l2aWw6IHtcblx0XHRcdFx0XHRcdHN0YXJ0OiBqdWxpYW5EYXRlVG9EYXRlKEpjaXYyKSxcblx0XHRcdFx0XHRcdGVuZDoganVsaWFuRGF0ZVRvRGF0ZShKcmlzZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHRcdGluZm8ubmlnaHRUd2lsaWdodCA9IHtcblx0XHRcdFx0XHRjaXZpbDoge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IGp1bGlhbkRhdGVUb0RhdGUoSnNldCksXG5cdFx0XHRcdFx0XHRlbmQ6IGp1bGlhbkRhdGVUb0RhdGUoSm5hdSlcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG5hdXRpY2FsOiB7XG5cdFx0XHRcdFx0XHRzdGFydDoganVsaWFuRGF0ZVRvRGF0ZShKbmF1KSxcblx0XHRcdFx0XHRcdGVuZDoganVsaWFuRGF0ZVRvRGF0ZShKYXN0cm8pXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRhc3Ryb25vbWljYWw6IHtcblx0XHRcdFx0XHRcdHN0YXJ0OiBqdWxpYW5EYXRlVG9EYXRlKEphc3RybyksXG5cdFx0XHRcdFx0XHRlbmQ6IGp1bGlhbkRhdGVUb0RhdGUoSmRhcmspXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gaW5mbztcblx0XHR9LFxuXG5cdFx0Z2V0U3VuUG9zaXRpb246IGZ1bmN0aW9uKGRhdGUsIGxhdCwgbG5nKSB7XG5cdFx0XHRyZXR1cm4gZ2V0U3VuUG9zaXRpb24oZGF0ZVRvSnVsaWFuRGF0ZShkYXRlKSwgLWxuZyAqIGRlZzJyYWQsIGxhdCAqXG5cdFx0XHRcdGRlZzJyYWQpO1xuXHRcdH1cblx0fTtcblxuXG5cbn0pKCk7XG5cbi8qXG52YXIgZGkgPSBTdW5DYWxjLmdldERheUluZm8oZGF0YSwgbGF0LCBsbmcpO1xudmFyIHN1bnJpc2VQb3MgPSBTdW5DYWxjLmdldFN1blBvc2l0aW9uKGRpLnN1bnJpc2Uuc3RhcnQsIGxhdCwgbG5nKTtcbnZhciBzdW5zZXRQb3MgPSBTdW5DYWxjLmdldFN1blBvc2l0aW9uKGRpLnN1bnNldC5lbmQsIGxhdCwgbG5nKTtcbiovXG4iLCIvKiAoYykgMjAxMS0yMDE1LCBWbGFkaW1pciBBZ2Fmb25raW5cbiBTdW5DYWxjIGlzIGEgSmF2YVNjcmlwdCBsaWJyYXJ5IGZvciBjYWxjdWxhdGluZyBzdW4vbW9vbiBwb3NpdGlvbiBhbmQgbGlnaHQgcGhhc2VzLlxuIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3VybmVyL3N1bmNhbGNcbiovXG5cbihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBzaG9ydGN1dHMgZm9yIGVhc2llciB0byByZWFkIGZvcm11bGFzXG4gICAgdmFyIFBJID0gTWF0aC5QSSxcbiAgICAgICAgc2luID0gTWF0aC5zaW4sXG4gICAgICAgIGNvcyA9IE1hdGguY29zLFxuICAgICAgICB0YW4gPSBNYXRoLnRhbixcbiAgICAgICAgYXNpbiA9IE1hdGguYXNpbixcbiAgICAgICAgYXRhbiA9IE1hdGguYXRhbjIsXG4gICAgICAgIGFjb3MgPSBNYXRoLmFjb3MsXG4gICAgICAgIHJhZCA9IFBJIC8gMTgwO1xuXG4gICAgLy8gc3VuIGNhbGN1bGF0aW9ucyBhcmUgYmFzZWQgb24gaHR0cDovL2FhLnF1YWUubmwvZW4vcmVrZW4vem9ucG9zaXRpZS5odG1sIGZvcm11bGFzXG5cblxuICAgIC8vIGRhdGUvdGltZSBjb25zdGFudHMgYW5kIGNvbnZlcnNpb25zXG4gICAgdmFyIGRheU1zID0gMTAwMCAqIDYwICogNjAgKiAyNCxcbiAgICAgICAgSjE5NzAgPSAyNDQwNTg4LFxuICAgICAgICBKMjAwMCA9IDI0NTE1NDU7XG5cbiAgICBmdW5jdGlvbiB0b0p1bGlhbihkYXRlKSB7XG4gICAgICAgIHJldHVybiBkYXRlLnZhbHVlT2YoKSAvIGRheU1zIC0gMC41ICsgSjE5NzA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZnJvbUp1bGlhbihqKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSgoaiArIDAuNSAtIEoxOTcwKSAqIGRheU1zKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b0RheXMoZGF0ZSkge1xuICAgICAgICByZXR1cm4gdG9KdWxpYW4oZGF0ZSkgLSBKMjAwMDtcbiAgICB9XG5cblxuICAgIC8vIGdlbmVyYWwgY2FsY3VsYXRpb25zIGZvciBwb3NpdGlvblxuICAgIHZhciBlID0gcmFkICogMjMuNDM5NzsgLy8gb2JsaXF1aXR5IG9mIHRoZSBFYXJ0aFxuXG4gICAgZnVuY3Rpb24gcmlnaHRBc2NlbnNpb24obCwgYikge1xuICAgICAgICByZXR1cm4gYXRhbihzaW4obCkgKiBjb3MoZSkgLSB0YW4oYikgKiBzaW4oZSksIGNvcyhsKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVjbGluYXRpb24obCwgYikge1xuICAgICAgICByZXR1cm4gYXNpbihzaW4oYikgKiBjb3MoZSkgKyBjb3MoYikgKiBzaW4oZSkgKiBzaW4obCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGF6aW11dGgoSCwgcGhpLCBkZWMpIHtcbiAgICAgICAgcmV0dXJuIGF0YW4oc2luKEgpLCBjb3MoSCkgKiBzaW4ocGhpKSAtIHRhbihkZWMpICogY29zKHBoaSkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFsdGl0dWRlKEgsIHBoaSwgZGVjKSB7XG4gICAgICAgIHJldHVybiBhc2luKHNpbihwaGkpICogc2luKGRlYykgKyBjb3MocGhpKSAqIGNvcyhkZWMpICogY29zKEgpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzaWRlcmVhbFRpbWUoZCwgbHcpIHtcbiAgICAgICAgcmV0dXJuIHJhZCAqICgyODAuMTYgKyAzNjAuOTg1NjIzNSAqIGQpIC0gbHc7XG4gICAgfVxuXG5cbiAgICAvLyBnZW5lcmFsIHN1biBjYWxjdWxhdGlvbnNcbiAgICBmdW5jdGlvbiBzb2xhck1lYW5Bbm9tYWx5KGQpIHtcbiAgICAgICAgcmV0dXJuIHJhZCAqICgzNTcuNTI5MSArIDAuOTg1NjAwMjggKiBkKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlY2xpcHRpY0xvbmdpdHVkZShNKSB7XG5cbiAgICAgICAgdmFyIEMgPSByYWQgKiAoMS45MTQ4ICogc2luKE0pICsgMC4wMiAqIHNpbigyICogTSkgKyAwLjAwMDMgKiBzaW4oMyAqIE0pKSwgLy8gZXF1YXRpb24gb2YgY2VudGVyXG4gICAgICAgICAgICBQID0gcmFkICogMTAyLjkzNzI7IC8vIHBlcmloZWxpb24gb2YgdGhlIEVhcnRoXG5cbiAgICAgICAgcmV0dXJuIE0gKyBDICsgUCArIFBJO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN1bkNvb3JkcyhkKSB7XG4gICAgICAgIHZhciBNID0gc29sYXJNZWFuQW5vbWFseShkKSxcbiAgICAgICAgICAgIEwgPSBlY2xpcHRpY0xvbmdpdHVkZShNKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVjOiBkZWNsaW5hdGlvbihMLCAwKSxcbiAgICAgICAgICAgIHJhOiByaWdodEFzY2Vuc2lvbihMLCAwKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHZhciBTdW5DYWxjID0ge307XG5cblxuICAgIC8vIGNhbGN1bGF0ZXMgc3VuIHBvc2l0aW9uIGZvciBhIGdpdmVuIGRhdGUgYW5kIGxhdGl0dWRlL2xvbmdpdHVkZVxuICAgIFN1bkNhbGMuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbihkYXRlLCBsYXQsIGxuZykge1xuICAgICAgICB2YXIgbHcgPSByYWQgKiAtbG5nLFxuICAgICAgICAgICAgcGhpID0gcmFkICogbGF0LFxuICAgICAgICAgICAgZCA9IHRvRGF5cyhkYXRlKSxcblxuICAgICAgICAgICAgYyA9IHN1bkNvb3JkcyhkKSxcbiAgICAgICAgICAgIEggPSBzaWRlcmVhbFRpbWUoZCwgbHcpIC0gYy5yYTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYXppbXV0aDogYXppbXV0aChILCBwaGksIGMuZGVjKSxcbiAgICAgICAgICAgIGFsdGl0dWRlOiBhbHRpdHVkZShILCBwaGksIGMuZGVjKVxuICAgICAgICB9O1xuICAgIH07XG5cblxuICAgIC8vIHN1biB0aW1lcyBjb25maWd1cmF0aW9uIChhbmdsZSwgbW9ybmluZyBuYW1lLCBldmVuaW5nIG5hbWUpXG4gICAgdmFyIHRpbWVzID0gU3VuQ2FsYy50aW1lcyA9IFtcbiAgICAgICAgWy0wLjgzMywgJ3N1bnJpc2UnLCAnc3Vuc2V0J10sXG4gICAgICAgIFstMC4zLCAnc3VucmlzZUVuZCcsICdzdW5zZXRTdGFydCddLFxuICAgICAgICBbLTYsICdkYXduJywgJ2R1c2snXSxcbiAgICAgICAgWy0xMiwgJ25hdXRpY2FsRGF3bicsICduYXV0aWNhbER1c2snXSxcbiAgICAgICAgWy0xOCwgJ25pZ2h0RW5kJywgJ25pZ2h0J10sXG4gICAgICAgIFs2LCAnZ29sZGVuSG91ckVuZCcsICdnb2xkZW5Ib3VyJ11cbiAgICBdO1xuXG4gICAgLy8gYWRkcyBhIGN1c3RvbSB0aW1lIHRvIHRoZSB0aW1lcyBjb25maWdcbiAgICBTdW5DYWxjLmFkZFRpbWUgPSBmdW5jdGlvbihhbmdsZSwgcmlzZU5hbWUsIHNldE5hbWUpIHtcbiAgICAgICAgdGltZXMucHVzaChbYW5nbGUsIHJpc2VOYW1lLCBzZXROYW1lXSk7XG4gICAgfTtcblxuXG4gICAgLy8gY2FsY3VsYXRpb25zIGZvciBzdW4gdGltZXNcbiAgICB2YXIgSjAgPSAwLjAwMDk7XG5cbiAgICBmdW5jdGlvbiBqdWxpYW5DeWNsZShkLCBsdykge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChkIC0gSjAgLSBsdyAvICgyICogUEkpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcHByb3hUcmFuc2l0KEh0LCBsdywgbikge1xuICAgICAgICByZXR1cm4gSjAgKyAoSHQgKyBsdykgLyAoMiAqIFBJKSArIG47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc29sYXJUcmFuc2l0SihkcywgTSwgTCkge1xuICAgICAgICByZXR1cm4gSjIwMDAgKyBkcyArIDAuMDA1MyAqIHNpbihNKSAtIDAuMDA2OSAqIHNpbigyICogTCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaG91ckFuZ2xlKGgsIHBoaSwgZCkge1xuICAgICAgICByZXR1cm4gYWNvcygoc2luKGgpIC0gc2luKHBoaSkgKiBzaW4oZCkpIC8gKGNvcyhwaGkpICogY29zKGQpKSk7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyBzZXQgdGltZSBmb3IgdGhlIGdpdmVuIHN1biBhbHRpdHVkZVxuICAgIGZ1bmN0aW9uIGdldFNldEooaCwgbHcsIHBoaSwgZGVjLCBuLCBNLCBMKSB7XG5cbiAgICAgICAgdmFyIHcgPSBob3VyQW5nbGUoaCwgcGhpLCBkZWMpLFxuICAgICAgICAgICAgYSA9IGFwcHJveFRyYW5zaXQodywgbHcsIG4pO1xuICAgICAgICByZXR1cm4gc29sYXJUcmFuc2l0SihhLCBNLCBMKTtcbiAgICB9XG5cblxuICAgIC8vIGNhbGN1bGF0ZXMgc3VuIHRpbWVzIGZvciBhIGdpdmVuIGRhdGUgYW5kIGxhdGl0dWRlL2xvbmdpdHVkZVxuICAgIFN1bkNhbGMuZ2V0VGltZXMgPSBmdW5jdGlvbihkYXRlLCBsYXQsIGxuZykge1xuICAgICAgICB2YXIgbHcgPSByYWQgKiAtbG5nLFxuICAgICAgICAgICAgcGhpID0gcmFkICogbGF0LFxuXG4gICAgICAgICAgICBkID0gdG9EYXlzKGRhdGUpLFxuICAgICAgICAgICAgbiA9IGp1bGlhbkN5Y2xlKGQsIGx3KSxcbiAgICAgICAgICAgIGRzID0gYXBwcm94VHJhbnNpdCgwLCBsdywgbiksXG5cbiAgICAgICAgICAgIE0gPSBzb2xhck1lYW5Bbm9tYWx5KGRzKSxcbiAgICAgICAgICAgIEwgPSBlY2xpcHRpY0xvbmdpdHVkZShNKSxcbiAgICAgICAgICAgIGRlYyA9IGRlY2xpbmF0aW9uKEwsIDApLFxuXG4gICAgICAgICAgICBKbm9vbiA9IHNvbGFyVHJhbnNpdEooZHMsIE0sIEwpLFxuXG4gICAgICAgICAgICBpLCBsZW4sIHRpbWUsIEpzZXQsIEpyaXNlO1xuXG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHNvbGFyTm9vbjogZnJvbUp1bGlhbihKbm9vbiksXG4gICAgICAgICAgICBuYWRpcjogZnJvbUp1bGlhbihKbm9vbiAtIDAuNSlcbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSB0aW1lcy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICAgICAgdGltZSA9IHRpbWVzW2ldO1xuXG4gICAgICAgICAgICBKc2V0ID0gZ2V0U2V0Sih0aW1lWzBdICogcmFkLCBsdywgcGhpLCBkZWMsIG4sIE0sIEwpO1xuICAgICAgICAgICAgSnJpc2UgPSBKbm9vbiAtIChKc2V0IC0gSm5vb24pO1xuXG4gICAgICAgICAgICByZXN1bHRbdGltZVsxXV0gPSBmcm9tSnVsaWFuKEpyaXNlKTtcbiAgICAgICAgICAgIHJlc3VsdFt0aW1lWzJdXSA9IGZyb21KdWxpYW4oSnNldCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cblxuICAgIC8vIG1vb24gY2FsY3VsYXRpb25zLCBiYXNlZCBvbiBodHRwOi8vYWEucXVhZS5ubC9lbi9yZWtlbi9oZW1lbHBvc2l0aWUuaHRtbCBmb3JtdWxhc1xuXG4gICAgZnVuY3Rpb24gbW9vbkNvb3JkcyhkKSB7IC8vIGdlb2NlbnRyaWMgZWNsaXB0aWMgY29vcmRpbmF0ZXMgb2YgdGhlIG1vb25cblxuICAgICAgICB2YXIgTCA9IHJhZCAqICgyMTguMzE2ICsgMTMuMTc2Mzk2ICogZCksIC8vIGVjbGlwdGljIGxvbmdpdHVkZVxuICAgICAgICAgICAgTSA9IHJhZCAqICgxMzQuOTYzICsgMTMuMDY0OTkzICogZCksIC8vIG1lYW4gYW5vbWFseVxuICAgICAgICAgICAgRiA9IHJhZCAqICg5My4yNzIgKyAxMy4yMjkzNTAgKiBkKSwgLy8gbWVhbiBkaXN0YW5jZVxuXG4gICAgICAgICAgICBsID0gTCArIHJhZCAqIDYuMjg5ICogc2luKE0pLCAvLyBsb25naXR1ZGVcbiAgICAgICAgICAgIGIgPSByYWQgKiA1LjEyOCAqIHNpbihGKSwgLy8gbGF0aXR1ZGVcbiAgICAgICAgICAgIGR0ID0gMzg1MDAxIC0gMjA5MDUgKiBjb3MoTSk7IC8vIGRpc3RhbmNlIHRvIHRoZSBtb29uIGluIGttXG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJhOiByaWdodEFzY2Vuc2lvbihsLCBiKSxcbiAgICAgICAgICAgIGRlYzogZGVjbGluYXRpb24obCwgYiksXG4gICAgICAgICAgICBkaXN0OiBkdFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIFN1bkNhbGMuZ2V0TW9vblBvc2l0aW9uID0gZnVuY3Rpb24oZGF0ZSwgbGF0LCBsbmcpIHtcblxuICAgICAgICB2YXIgbHcgPSByYWQgKiAtbG5nLFxuICAgICAgICAgICAgcGhpID0gcmFkICogbGF0LFxuICAgICAgICAgICAgZCA9IHRvRGF5cyhkYXRlKSxcblxuICAgICAgICAgICAgYyA9IG1vb25Db29yZHMoZCksXG4gICAgICAgICAgICBIID0gc2lkZXJlYWxUaW1lKGQsIGx3KSAtIGMucmEsXG4gICAgICAgICAgICBoID0gYWx0aXR1ZGUoSCwgcGhpLCBjLmRlYyk7XG5cbiAgICAgICAgLy8gYWx0aXR1ZGUgY29ycmVjdGlvbiBmb3IgcmVmcmFjdGlvblxuICAgICAgICBoID0gaCArIHJhZCAqIDAuMDE3IC8gdGFuKGggKyByYWQgKiAxMC4yNiAvIChoICsgcmFkICogNS4xMCkpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhemltdXRoOiBhemltdXRoKEgsIHBoaSwgYy5kZWMpLFxuICAgICAgICAgICAgYWx0aXR1ZGU6IGgsXG4gICAgICAgICAgICBkaXN0YW5jZTogYy5kaXN0XG4gICAgICAgIH07XG4gICAgfTtcblxuXG4gICAgLy8gY2FsY3VsYXRpb25zIGZvciBpbGx1bWluYXRpb24gcGFyYW1ldGVycyBvZiB0aGUgbW9vbixcbiAgICAvLyBiYXNlZCBvbiBodHRwOi8vaWRsYXN0cm8uZ3NmYy5uYXNhLmdvdi9mdHAvcHJvL2FzdHJvL21waGFzZS5wcm8gZm9ybXVsYXMgYW5kXG4gICAgLy8gQ2hhcHRlciA0OCBvZiBcIkFzdHJvbm9taWNhbCBBbGdvcml0aG1zXCIgMm5kIGVkaXRpb24gYnkgSmVhbiBNZWV1cyAoV2lsbG1hbm4tQmVsbCwgUmljaG1vbmQpIDE5OTguXG5cbiAgICBTdW5DYWxjLmdldE1vb25JbGx1bWluYXRpb24gPSBmdW5jdGlvbihkYXRlKSB7XG5cbiAgICAgICAgdmFyIGQgPSB0b0RheXMoZGF0ZSksXG4gICAgICAgICAgICBzID0gc3VuQ29vcmRzKGQpLFxuICAgICAgICAgICAgbSA9IG1vb25Db29yZHMoZCksXG5cbiAgICAgICAgICAgIHNkaXN0ID0gMTQ5NTk4MDAwLCAvLyBkaXN0YW5jZSBmcm9tIEVhcnRoIHRvIFN1biBpbiBrbVxuXG4gICAgICAgICAgICBwaGkgPSBhY29zKHNpbihzLmRlYykgKiBzaW4obS5kZWMpICsgY29zKHMuZGVjKSAqIGNvcyhtLmRlYykgKiBjb3Mocy5yYSAtIG0ucmEpKSxcbiAgICAgICAgICAgIGluYyA9IGF0YW4oc2Rpc3QgKiBzaW4ocGhpKSwgbS5kaXN0IC0gc2Rpc3QgKiBjb3MocGhpKSksXG4gICAgICAgICAgICBhbmdsZSA9IGF0YW4oY29zKHMuZGVjKSAqIHNpbihzLnJhIC0gbS5yYSksIHNpbihzLmRlYykgKiBjb3MobS5kZWMpIC1cbiAgICAgICAgICAgICAgICBjb3Mocy5kZWMpICogc2luKG0uZGVjKSAqIGNvcyhzLnJhIC0gbS5yYSkpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmcmFjdGlvbjogKDEgKyBjb3MoaW5jKSkgLyAyLFxuICAgICAgICAgICAgcGhhc2U6IDAuNSArIDAuNSAqIGluYyAqIChhbmdsZSA8IDAgPyAtMSA6IDEpIC8gTWF0aC5QSSxcbiAgICAgICAgICAgIGFuZ2xlOiBhbmdsZVxuICAgICAgICB9O1xuICAgIH07XG5cblxuICAgIGZ1bmN0aW9uIGhvdXJzTGF0ZXIoZGF0ZSwgaCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS52YWx1ZU9mKCkgKyBoICogZGF5TXMgLyAyNCk7XG4gICAgfVxuXG4gICAgLy8gY2FsY3VsYXRpb25zIGZvciBtb29uIHJpc2Uvc2V0IHRpbWVzIGFyZSBiYXNlZCBvbiBodHRwOi8vd3d3LnN0YXJnYXppbmcubmV0L2tlcGxlci9tb29ucmlzZS5odG1sIGFydGljbGVcbiAgICBTdW5DYWxjLmdldE1vb25UaW1lcyA9IGZ1bmN0aW9uKGRhdGUsIGxhdCwgbG5nLCBpblVUQykge1xuICAgICAgICB2YXIgdCA9IG5ldyBEYXRlKGRhdGUpO1xuICAgICAgICBpZiAoaW5VVEMpIHQuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG4gICAgICAgIGVsc2UgdC5zZXRIb3VycygwLCAwLCAwLCAwKTtcblxuICAgICAgICB2YXIgaGMgPSAwLjEzMyAqIHJhZCxcbiAgICAgICAgICAgIGgwID0gU3VuQ2FsYy5nZXRNb29uUG9zaXRpb24odCwgbGF0LCBsbmcpLmFsdGl0dWRlIC0gaGMsXG4gICAgICAgICAgICBoMSwgaDIsIHJpc2UsIHNldCwgYSwgYiwgeGUsIHllLCBkLCByb290cywgeDEsIHgyLCBkeDtcblxuICAgICAgICAvLyBnbyBpbiAyLWhvdXIgY2h1bmtzLCBlYWNoIHRpbWUgc2VlaW5nIGlmIGEgMy1wb2ludCBxdWFkcmF0aWMgY3VydmUgY3Jvc3NlcyB6ZXJvICh3aGljaCBtZWFucyByaXNlIG9yIHNldClcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gMjQ7IGkgKz0gMikge1xuICAgICAgICAgICAgaDEgPSBTdW5DYWxjLmdldE1vb25Qb3NpdGlvbihob3Vyc0xhdGVyKHQsIGkpLCBsYXQsIGxuZykuYWx0aXR1ZGUgLSBoYztcbiAgICAgICAgICAgIGgyID0gU3VuQ2FsYy5nZXRNb29uUG9zaXRpb24oaG91cnNMYXRlcih0LCBpICsgMSksIGxhdCwgbG5nKS5hbHRpdHVkZSAtIGhjO1xuXG4gICAgICAgICAgICBhID0gKGgwICsgaDIpIC8gMiAtIGgxO1xuICAgICAgICAgICAgYiA9IChoMiAtIGgwKSAvIDI7XG4gICAgICAgICAgICB4ZSA9IC1iIC8gKDIgKiBhKTtcbiAgICAgICAgICAgIHllID0gKGEgKiB4ZSArIGIpICogeGUgKyBoMTtcbiAgICAgICAgICAgIGQgPSBiICogYiAtIDQgKiBhICogaDE7XG4gICAgICAgICAgICByb290cyA9IDA7XG5cbiAgICAgICAgICAgIGlmIChkID49IDApIHtcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGguc3FydChkKSAvIChNYXRoLmFicyhhKSAqIDIpO1xuICAgICAgICAgICAgICAgIHgxID0geGUgLSBkeDtcbiAgICAgICAgICAgICAgICB4MiA9IHhlICsgZHg7XG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHgxKSA8PSAxKSByb290cysrO1xuICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyh4MikgPD0gMSkgcm9vdHMrKztcbiAgICAgICAgICAgICAgICBpZiAoeDEgPCAtMSkgeDEgPSB4MjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJvb3RzID09PSAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKGgwIDwgMCkgcmlzZSA9IGkgKyB4MTtcbiAgICAgICAgICAgICAgICBlbHNlIHNldCA9IGkgKyB4MTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChyb290cyA9PT0gMikge1xuICAgICAgICAgICAgICAgIHJpc2UgPSBpICsgKHllIDwgMCA/IHgyIDogeDEpO1xuICAgICAgICAgICAgICAgIHNldCA9IGkgKyAoeWUgPCAwID8geDEgOiB4Mik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyaXNlICYmIHNldCkgYnJlYWs7XG5cbiAgICAgICAgICAgIGgwID0gaDI7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG5cbiAgICAgICAgaWYgKHJpc2UpIHJlc3VsdC5yaXNlID0gaG91cnNMYXRlcih0LCByaXNlKTtcbiAgICAgICAgaWYgKHNldCkgcmVzdWx0LnNldCA9IGhvdXJzTGF0ZXIodCwgc2V0KTtcblxuICAgICAgICBpZiAoIXJpc2UgJiYgIXNldCkgcmVzdWx0W3llID4gMCA/ICdhbHdheXNVcCcgOiAnYWx3YXlzRG93biddID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cblxuICAgIC8vIGV4cG9ydCBhcyBBTUQgbW9kdWxlIC8gTm9kZSBtb2R1bGUgLyBicm93c2VyIHZhcmlhYmxlXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKFN1bkNhbGMpO1xuICAgIGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSBtb2R1bGUuZXhwb3J0cyA9IFN1bkNhbGM7XG4gICAgZWxzZSB3aW5kb3cuU3VuQ2FsYyA9IFN1bkNhbGM7XG5cbn0oKSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
