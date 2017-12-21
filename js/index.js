$(function () {
  var ms, sec, min;
  ms = sec = min = 0
  var holdTimer = 0
  var timer = 0
  var isTiming = false
  var canStart = false
  var isHold = false
  var willStart = false
  var willStop = false
  var willAdd = true
  var willDisorganize = false
  var showDis = false
  disorganize()

  $('html').keydown(function (event) {
    if(event.key===' '){
      $('.showTime').addClass('once')
      if(willStop){
        clearInterval(timer)
        isTiming = false

        if(willAdd){
          var serial = $('.resultList').children().length + 1
          var time = $('.showTime>span').text()
          var disorganize = $('.disorganize').text()
          var avg5 = parseFloat(time)*100
          var avg12 = parseFloat(time)*100
          if($('.resultItem .time').length>3){
            $('.resultItem .time').slice(-4).map(function () {
              avg5 += parseFloat($(this).text())*100
            })
            avg5 = parseInt(avg5/5)/100
          }else{
            avg5 = 'N/A'
          }
          if($('.resultItem .time').length>10) {
            $('.resultItem .time').slice(-11).map(function () {
              avg12 += parseFloat($(this).text()) * 100
            })
            avg12 = parseInt(avg12 / 12) / 100
          }else{
            avg12 = 'N/A'
          }

          $('<li/>',{
            html: '<div class="itemMain">'+
            '<div class="serial">'+serial+'</div>'+
            '<div class="time">'+time+'</div>'+
            '<div class="avg5">'+avg5+'</div>'+
            '<div class="avg12">'+avg12+'</div>'+
            '</div>'+
            '<div class="disorganizeText hide">'+disorganize+'</div>',
            class: 'resultItem'
          }).appendTo('.resultList')

          willAdd = false
        }



        return
      }
      if(!holdTimer){
        holdTimer = setTimeout(function () {
          ms = sec = min = 0
          $('.second').text('0')
          $('.millisecond').text('00')
          $('.showTime').addClass('hold')
          canStart = true
          willStart = true
          willDisorganize = true
        },300)
      }
    }
  })
    .keyup(function (event) {
    clearTimeout(holdTimer)
    holdTimer = 0
      willAdd = true
    $('.showTime').removeClass('once hold')
    if(willStart){
      start()
    }else{
      willStop = false
      if(willDisorganize){
        disorganize()
        willDisorganize = false
      }

    }
  })

  $('.resultList').delegate('li', 'click', function () {
    var c = $(this).children().eq(1).css('display')
    if(c==='none'){
      $(this).children().eq(1).css('display', 'block')
    }else{
      $(this).children().eq(1).css('display', 'none')
    }
    console.log(123123213213);
  })

  function start () {
    willStart = false
    willStop = true
    if(event.key===' '){
      if(canStart){
        timer = setInterval(function () {
          isTiming = true
          ms++
          if(ms>=100){
            ms = 0;
            sec++
            $('.second').text(sec)
          }
          if(min>0){
            if(sec<10){
              $('.second').text('0' + sec)
            }else{
              $('.second').text(sec)
            }
          }
          if(sec>=60){
            sec = 0;
            if(sec<10){
              $('.second').text('0' + sec)
            }else{
              $('.second').text(sec)
            }
            min++
            if($('.showTime').children().length===3){
              $('.showTime').prepend('<span class="minute"></span><span>:</span>')
            }
            $('.minute').text(min)

          }
          if(ms<10){
            $('.millisecond').text('0' + ms)
          }else{
            $('.millisecond').text(ms)
          }
          isHold = false
        },10)
        canStart = false

      }

    }
  }

  function disorganize () {
    var direction = ['U', 'D', 'F', 'B', 'L', 'R']
    var rotationType = ['', '\'', '2']
    var disorganizeContent = ''
    var d
    for(var i=0; i<20; i++){
      var a = Math.floor((Math.random())*6)
      while(a===d){
        a = Math.floor((Math.random())*6)
      }
      d = a
      var b = Math.floor((Math.random())*3)
      var text = direction[a] + rotationType[b] + "&nbsp;";
      disorganizeContent += text

    }
    $('.disorganize').html(disorganizeContent)
  }

})