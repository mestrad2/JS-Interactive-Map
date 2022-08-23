// creates a map object
const myMap = {
	coordinates: [],
	businesses: [],
	map: {},
	markers: {},

	//Method to create map on index.html
	createMap() {
		this.map = L.map('map', {
		center: this.coordinates,
		zoom: 12,
		});
		// Use tileLayer to add Openstreetmap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		minZoom: '15',
		}).addTo(this.map)
		// creates a geolocation marker and adds it to the map
		const marker = L.marker(this.coordinates)
		marker
		.addTo(this.map)
		.bindPopup('<p1><b>You are here</b><br></p1>')
		.openPopup()
	},

	// Method to add markers to the map using business coordinates
	addMarkers() {
		for (var i = 0; i < this.businesses.length; i++) {
		this.markers = L.marker([
			this.businesses[i].lat,
			this.businesses[i].long,
		])
			.bindPopup(`<p1>${this.businesses[i].name}</p1>`)
			.addTo(this.map)
		}
	},
}

// Gets coordinates of the user's current location using geolocation api
async function getCoordinates(){
	const pos = await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject)
	});
	return [pos.coords.latitude, pos.coords.longitude]
}

// Uses Foursquare to retrieve nearby businesses using the type selected from the user
async function getFoursquare(business) {
	const options = {
		method: 'GET',
		headers: {
		Accept: 'application/json',
		Authorization: 'fsq3ivN1VLCmFMYhc0i+T3k2Gh6F2FcWdRMSRGn4w808O4s='
		}
	}
	let limit = 5
	let lat = myMap.coordinates[0]
	let lon = myMap.coordinates[1]
	let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${lon}`, options)
	let data = await response.text()
	let parsedData = JSON.parse(data)
	let businesses = parsedData.results
	return businesses
}
// Creates an array of businesses and their geolocations that will be placed on the map using markers
function loadBusinesses(data) {
	let businesses = data.map((element) => {
		let location = {
			name: element.name,
			lat: element.geocodes.main.latitude,
			long: element.geocodes.main.longitude
		};
		return location
	})
	return businesses
}


// event handlers
// Loads current location of user at on window startup
window.onload = async () => {
	const coords = await getCoordinates()
	myMap.coordinates = coords
	myMap.createMap()
}

// Allows the submit button to send the business type the user selected and create markers on the map for each
document.getElementById('submit').addEventListener('click', async (event) => {
	event.preventDefault()
	let business = document.getElementById('business').value
	let data = await getFoursquare(business)
	myMap.businesses = loadBusinesses(data)
	myMap.addMarkers()
})