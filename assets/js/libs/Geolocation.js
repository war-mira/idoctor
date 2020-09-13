class Geolocation {
  init () {
    return false;
    const options = {
      enableHighAccuracy: true,
      timeout: 1000 * 60,
      maximumAge: 0
    }
    if (!hasGeo) {
      if (navigator.geolocation) {
         navigator.geolocation.watchPosition(this.updatePosition,this.error,options);
      }
    }
  }

  updatePosition (position) {
    axios.post('/set-geo', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    })
  }

  error (err) {
    console.warn(err)
  }
}

const geolocation = (new Geolocation()).init()
