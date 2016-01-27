$(document).ready(function() {

    var debug = true;
    var currTime = $(".currentTime");
    var date = new Date();

    currTime.append(formatTime(date,true));
    updateBackground(debug,date);
    displayMoonPhase(date);


});






//-----------------------------------------------------//


function updateBackground(debug,currentDate) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {

            var crd = pos.coords;

            //This is the modified Suncalc which I found on Suncalc.net
            //I used this version to determine the times of the sun because it was better optimized then the original version.

            var times = SunCalc2.getDayInfo(currentDate, crd.latitude, crd.longitude, true);

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
            var dusk = times.dusk.getHours() + 1;
           

            //display debugging information.
            if(debug == true){
        
            console.log("times dusk " + formatTime(times.dusk, true));
            console.log("sunset start " + formatTime(times.sunset.start, true))
            console.log("sunset " + formatTime(times.sunset.end, true));
            console.log("sunrise " + formatTime(times.sunrise.start, true));
            console.log("sunrise end " + formatTime(times.sunrise.end, true));
            console.log("dawn " + formatTime(times.dawn));
            console.log("noon " + formatTime(times.transit, true));
            console.log("dusk " + formatTime(times.dusk));

            console.log("Dusk: " + dusk);
            console.log("Sunset : " + sunset);

            console.log("sunrise start: " + sunriseStart);
            console.log("sunrise end " + sunriseEnd);
            console.log("night start " + nightStart);
            console.log("morningStart: " + morningStart);
            console.log("morning end " + morningEnd);
        }
            
           

            var bodyTag = $("body");
            
            var currentTime =  currentDate.getHours();
            
            
            if (0 <= currentTime && currentTime < morningStart) {
                bodyTag.toggleClass("dawn sunset");
            }
            if (currentTime > morningStart  && currentTime < noon) {
                
                bodyTag.toggleClass("sunrise sunset")
            }
            if (noon <= currentTime && currentTime < sunset) {
                bodyTag.toggleClass("day sunset");

            }
            if (currentTime <= sunset && currentTime < dusk) {
               
                bodyTag.toggleClass("sunset");
            }
            if (currentTime >= dusk || currentTime <= 0){

                bodyTag.toggleClass("night");
                
            }



        });
    }

}

function displayMoonPhase(currentDate) {

    var moonInfo = SunCalc.getMoonIllumination(currentDate);
    var moonPhase = moonInfo.phase;
    var moonText = findMoonPhase(moonPhase);
   
    $('.moonPhase').append(moonText);
}

function findMoonPhase(moonPhs) {
    var moonPhStr = "";
    if (moonPhs == 0) {
        moonPhs = "New Moon";

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
        if (hours == 0) {
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



