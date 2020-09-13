onmessage = function (data) {
  // console.log('Worker: Message received from script')
  if (data.data[0].length < 0) {
    // postMessage('Please write two numbers')
  } else {
    // console.log('Worker: Posting message back to main script')
    const sortedPoints = data.data[0]

    sortedPoints.sort(function (a, b) {
      var r = calcCrow(
        a.geo.latitude,
        a.geo.longitude,
        data.data[1][0],
        data.data[1][1]
      )
      var k = calcCrow(
        b.geo.latitude,
        b.geo.longitude,
        data.data[1][0],
        data.data[1][1]
      )
      return r - k
    })
    postMessage(sortedPoints)
  }
}
// This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow (lat1, lon1, lat2, lon2) {
  var R = 6371 // km
  var dLat = toRad(lat2 - lat1)
  var dLon = toRad(lon2 - lon1)
  var lat1 = toRad(lat1)
  var lat2 = toRad(lat2)

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var d = R * c
  return d
}

// Converts numeric degrees to radians
function toRad (Value) {
  return Value * Math.PI / 180
}
