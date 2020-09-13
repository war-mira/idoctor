class DoctorApplications {
  constructor (instance = null, ids) {
    this.ids = ids
    this.applications = {
      appointment: MakeAppointment
    }
  }

  getClients (ids = null) {
    if (ids == null) {
      ids = this.ids
    }
    axios.get('https://', { params: { ids: ids } })
      .then((response) => {
        const data = response.data
        for (const id in data) {
          const clients = data[id]
          this.initClients(id, clients)
        }
      }).catch((err) => {
        console.log(err)
      })
  }

  initClients (id, clients) {
    for (const client in clients) {
      if (this.applications.hasOwnProperty(client)) {
        clients[client].forEach(item => {
          const instances = document.querySelectorAll(`.search--card .profile[data-id="${id}"], .search--card .profile--additional[data-id="${id}"], .view--profile__doctor .profile[data-id="${id}"]`)
          instances.forEach(instance => {
            let app = this.applications[client]
            app = new app(id, instance, item)
            app.init()
          })
        })
      }
    }
  }

  init () {
    this.getClients()
  }
}

if (document.querySelector('.doctors--search,.view--profile__doctor')) {
  const ids = []
  document.querySelectorAll('.doctors--search .card .profile,.doctors--search .card .profile--additional,.view--profile__doctor .profile').forEach((i) => {
    ids.push(i.getAttribute('data-id'))
  })
  const doctor_applications = new DoctorApplications(null, ids)
  doctor_applications.init()
}
