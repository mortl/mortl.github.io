$(document).ready(getLocation);


function getLocation(){
	if(navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(function(pos){
			var displayData = $('#displayData');
			var crd = pos.coords;
			var times = SunCalc.getTimes(new Date(),crd.latitude,crd.longitude);
			
			console.log("times dusk " + (times.dusk.getHours() % 12 || 12) +":" + times.dusk.getMinutes() + " pm");
			

			//displayData.html("times dusk " + (times.sunset.getHours() % 12 || 12 )+ " pm");
			console.log("Formated time: " + formatTime(times.sunrise,true));
      console.log("\n");

			var sunriseStr =  times.sunrise.getHours() + ':' + times.sunrise.getMinutes();
			console.log("Sunrise time for : " + crd.latitude + " " + crd.longitude + " " + sunriseStr);
			
			var moonInfo= SunCalc.getMoonIllumination(new Date());
			var moonPhase = moonInfo.phase;
			var moonText = findMoonPhase(moonPhase);

			console.log("Current Moon Phase (as text): " + moonText);
			console.log("Test for above 0.26 :" + findMoonPhase(0.26));
			console.log("Test for above 0.40 :" + findMoonPhase(0.50));
			console.log("Test for above 0.75 :" + findMoonPhase(1.00));
			console.log("Current Moon Phase:(between 0 - 1): " + moonPhase );

		});
	}


}

function findMoonPhase(moonPhs){
	  var moonPhStr = "";
		if(moonPhs == 0){
			moonPhs = "New Moon";

		}else if(moonPhs > 0 && moonPhs < 0.25){
			moonPhStr = "Waxing Crescent";
		}else if(moonPhs == 0.25){
			moonPhStr = "First Quarter";
		}else if(moonPhs > 0.25 && moonPhs < 0.50 ){
			moonPhStr = "Waxing Gibbous";
		}else if(moonPhs == 0.50){
			moonPhStr="Full Moon";
		}else if(moonPhs > 0.50 && moonPhs < 0.75){
			moonPhStr="Last Quarter";
		}else if( moonPhs >= 0.75 && moonPhs <= 1.00){
			moonPhStr ="Waning Crescent";
		}

		return moonPhStr;
}


function formatTime(date, postfix) {
		if (isNaN(date)) { return '&nbsp;&nbsp;n/a&nbsp;&nbsp;'; }
	
		var hours = date.getHours(),
			minutes = date.getMinutes(),
			ap;
			
		if (postfix) {
			ap = (hours < 12 ? 'am' : 'pm');
			if (hours == 0) { hours = 12; }
			if (hours > 12) { hours -= 12; }
		} else {
			hours = (hours < 10 ? '0' + hours : '' + hours);
		}
		
		minutes = (minutes < 10 ? '0' + minutes : '' + minutes);
		
		return hours + ':' + minutes + (postfix ? ' ' + ap : '');
	}