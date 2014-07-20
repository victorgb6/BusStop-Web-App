/*******Bus Stop App Javacript*******/
var MAPS = (function (){
	'use strict';
	/* Vars definition */
	var LatLngBounds;
	var busStopIcon = '/images/busIcon.png';
	var markersArr = [];
	var mapOptions = {zoom: 16,
			center: new google.maps.LatLng(51.508738, -0.127906),
			};
	/* Creation of the map object */
	var map = new google.maps.Map(document.getElementById('main-map'), mapOptions);
	/* Creation of the events listeners */
	google.maps.event.addListener(map, 'dragend', function() {
		refreshMarkers();
	});
	google.maps.event.addListener(map, 'bounds_changed', function() {
		updateBounds();
	});
	google.maps.event.addListener(map, 'zoom_changed', function() {
		updateBounds();
		refreshMarkers();
	});
	/* I used here 'addListenerOnce' to refresh the map once it's loaded, just the first time */
	google.maps.event.addListenerOnce(map, 'idle', function(){
		refreshMarkers();
	});
	/* This function refresh the markers sending the Ajax request */
	var refreshMarkers = function(){
		var ne = LatLngBounds.getNorthEast().toUrlValue();
		var sw = LatLngBounds.getSouthWest().toUrlValue();
		removeAllMarkers();
		$.ajax({
			url: 'http://digitaslbi-id-test.herokuapp.com/bus-stops',
			data: {northEast: ne, southWest: sw},
			dataType: 'jsonp',
			success: function(response){
				setMarkers(response.markers);
			}
		});
	};
	/* This function gets the data for a specific bus stop, takes as param the data from the bus stop */
	var getArrivals = function(busStopDetails){
		$.ajax({
			url: 'http://digitaslbi-id-test.herokuapp.com/bus-stops/'+busStopDetails.id,
			dataType: 'jsonp',
			success: function(response){
				drawArrivals(response.arrivals, busStopDetails);
			}
		});
	};
	/* This function draw the arrivals for a specific bus stop, takes as param the an array of arrivals and the bus stop details*/
	var drawArrivals = function(arrivals, busStopDetails){
		var arrivalsHTML = '';
		var busStomName = '';
		/* These classes make a transition when the arrivals appears */
		$("#arrivals-container").removeClass('endAnimate').addClass('beginAnimate');
		/* I check first if the bus stop has indicator or not*/
		if ( busStopDetails.stopIndicator !== null){
			busStomName = busStopDetails.name+' ('+busStopDetails.stopIndicator+')';
		}else{
			busStomName = busStopDetails.name;
		}
		$('#bus-stop-name').empty().append(busStomName);
		/* I read the arrivals array and prepare an ul to contain the info */
		for (var i in arrivals){
			arrivalsHTML += '<li><span class="first-item">'+arrivals[i].routeName+'</span><span class="second-item">to '+arrivals[i].destination+'</span><span class="third-item">'+arrivals[i].estimatedWait+'</span></li>';
		}
		if ( arrivalsHTML === ''){
			arrivalsHTML = '<li><span class="no-arrivals">There are no upcoming arrivals</span></li>'
		}
		$('#bus-arrivals').empty().append(arrivalsHTML);
		/* These classes make a transition when the arrivals appears */
		$("#arrivals-container").removeClass('beginAnimate').addClass('endAnimate');
	};
	/* This function set and draw the markers on the map, takes as param an array of bus stops */
	var setMarkers = function(markers){
		/* I take a markers array to draw them into the map in for loop */
		for (var i in markers){
			var marker = new google.maps.Marker({
			      position: {lat: markers[i].lat, lng: markers[i].lng},
			      map: map,
			      details: markers[i],
			      icon: busStopIcon,
			      animation: google.maps.Animation.DROP
			});
			/* I prepore the content for the info box to be shown when the user clicks the marker */
			var infoContent = '';
			if ( markers[i].stopIndicator !== null ){
				infoContent = '<h4>'+markers[i].name+' ('+markers[i].stopIndicator+')</h4>';
			}else{
				infoContent = '<h4>'+markers[i].name+'</h4>';
			}
			marker.info = new google.maps.InfoWindow({
			  content: infoContent
			});
			/* I remove the marker animation when the user clicks on the close icon corner */
			google.maps.event.addListener(marker.info,'closeclick',function(){
				removeMarkerAnimation();
			});
			/* I update and draw the arrivals when the user clicks on a marker */
			google.maps.event.addListener(marker, 'click', function () {
				getArrivals(this.details);
				removeMarkerAnimation();
				this.info.open(map, this);
				if (this.getAnimation() !== null) {
					this.setAnimation(null);
				}else{
					this.setAnimation(google.maps.Animation.BOUNCE);
				}
			});
			/* I save the markers in a markers array to be able to remove them later */
			markersArr.push(marker);
		}
	};
	/* This function remove the markers animation by setting the animation as null */
	var removeMarkerAnimation = function(){
		for (var i in markersArr) {
			if (markersArr[i].getAnimation() !== null) {
				markersArr[i].setAnimation(null);
			}
			markersArr[i].info.close();
		}
	};
	/* This function cleans all the markers from the map by setting the map as null */
	var removeAllMarkers = function(){
		for (var i in markersArr) {
		    markersArr[i].setMap(null);
		}
		markersArr = [];
	};
	/* This function update the actual bounds */
	var updateBounds = function(){
		LatLngBounds = map.getBounds();
	};
})();