let mapToken = MapTok;
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: "mapbox://styles/mapbox/standard-satellite",
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
    });

const marker = new mapboxgl.Marker({color: "red"})
.setLngLat(listing.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset:15}).setHTML(
        `<h5>${listing.title}</h5><p>Yaha aoge bhaiyu log!</p>`
    )
)
.addTo(map);