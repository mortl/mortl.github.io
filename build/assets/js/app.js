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
     // console.log(parsed_json);
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
    var sunriseStart =  times.sunrise.start.getTime();
    var sunriseEnd = times.sunrise.end.getTime();
    var nightStart = nightInfo.astronomical.start.getTime();

    var sunset = times.sunset.end.getHours();
    var dusk = times.dusk.getHours() + 2;
    var midnight = 24;


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
    var currentTime =  currentDate.getHours();

    if (noon > currentTime && currentTime <= sunset) {

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
    if (0 <= currentTime && currentTime < morningStart) {
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


    //Check what the current time is and change background color.

    if (0 <= currentTime && currentTime < morningStart) {
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

            phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
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
            h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
            h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;

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