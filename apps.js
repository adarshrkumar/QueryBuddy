var appsList = [
  'weather', 
  'webPageContent', 
  'openLink'
]

var appsData = {
  weather: function(params) {
    var zip = params[0]
    var country = ''

    var countryReq = new XMLHttpRequest()
    countryReq.open('GET', '/getCountry')
    countryReq.addEventListener('load', function() {
        country = this.responseText
    })
    countryReq.send()
    
    var unit = 'C'
    if (country === 'United States of America') unit = 'F'

    var weatherRequest = new XMLHttpRequest()
    weatherRequest.open('GET', `/getWeather?zip=${zip}&unit=${unit}`)
    weatherRequest.addEventListener('load', function() {
      var weather = this.responseText
      newMessage('app', weather, {appName: 'weather'})
    })
    weatherRequest.send()
  },
  webPageContent: function(params) {
    var links = params[0]
    if (typeof links !== 'object') links = [links]

    links.forEach(function(link, i) {
      var req = new XMLHttpRequest()
      req.open('GET', `/getWebpageContent?url=${link}`)
      req.addEventListener('load', function() {
        var res = this.responseText

        if (res.includes('&lt;')) res = res.split('&lt;').join('<')
        if (res.includes('&gt;')) res = res.split('&gt;').join('>')

        var styles = res.match(/<style>.+<\/style>/)
        if (styles) {
          styles.forEach(s => {
            res = res.replace(s, '')
          })
        }
        var links = res.match(/<link.+>/)
        if (links) {
          links.forEach(l => {
            res = res.replace(l, '')
          })
        }
        var metas = res.match(/<meta.+>/)
        if (metas) {
          metas.forEach(m => {
            res = res.replace(m, '')
          })
        }
        var scripts = res.match(/<script.+>.+<\/script>/)
        if (scripts) {
          scripts.forEach(s => {
            res = res.replace(s, '')
          })
        }

        newMessage('app', res, {appName: 'webPageContent'})
      })
      req.send()
    })
  },
  openLink: function(params) {
    var links = params[0]
    links = JSON.parse(links)

    links.forEach(function(link, i) {
      open(link)
      newMessage('app', `Opened "${link}".`, {appName: 'openLink'})
    })
  },
  createImage: function(params) {
    var prompt = params[0]
    newRequest('create-image', prompt)
  }, 
  transcribeAudio: function(params) {
    if (!fnames) {
      var params = new URLSearchParams(window.location.search)
      var names = params.get('name')
      if (!!names) {
        if (names.includes(',')) names = names.split(',')
        else names = [names]
      }
    }

    fnames.forEach(function(n, i) {
      newRequest('transcribe-audio', n)
    })
  },
  liveImage: function(params) {
    this.takeLiveImage()
  },
  takeLiveImage: function(params) {
    var dialog = document.querySelector('.live-photo')

    var iframe = dialog.querySelector('iframe')
    iframe.src = iframe.getAttribute('data-src')
    iframe.removeAttribute('data-src')

    dialog.showModal()
  },
  sendLiveImage: function(params) {
    var dialog = document.querySelector('.live-photo')
    dialog.close()

    var iframe = dialog.querySelector('iframe')
    iframe.setAttribute('data-src', iframe.src)
    iframe.src = ''


    var json = params[0]
    var lastMessage = document.querySelectorAll('.messages > .message.user')
    lastMessage = lastMessage[lastMessage.length-1]
    var lastTextSpan = lastMessage.querySelector('.text__span')
    var lastMessageContent = lastTextSpan.innerHTML

    fnames = json.name
    filelocation = json.filelocation

    handleFiles()

    type = 'live-image-send'
    sendMessage(lastMessageContent)
  }
}

// appsData.takeLiveImage()