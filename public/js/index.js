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
  getTime()

  $('.removeAll').click(function () {
    if(confirm('确定要清空成绩列表吗？')){
      $.get('/removeAll', function (res) {
        console.log(res);
        getTime()
      })
    }

  })

  $('html').keydown(function (event) {

    if(event.key===' '){
      event.preventDefault()
      $('.showTime').addClass('once')
      if(willStop){
        clearInterval(timer)
        isTiming = false

        if(willAdd){
          var serial = $('.resultList').children().length + 1
          var time = $('.showTime>span').text()


          var disorganize = $('.disorganize').text()
          var generatedTime = moment().format('YYYY-MM-DD hh:mm:ss')
          console.log(generatedTime)
          $.get('/addTime', {
            time: time,
            serial: serial,
            disorganize: disorganize,
            generatedTime: generatedTime
          }, function () {
            console.log('成功');
          })

          getTime()
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

  var $resultListControl = $('.resultListControl');
  var $right = $('.right')
  var flag = true;
  $resultListControl.click(function () {
    $('.resultList .disorganizeText').hide()
    if(flag){
      $right.width('0')
      $resultListControl.children('.text').text('显示列表')
      $resultListControl.children('.icon').css('transform', 'rotate(180deg)')
    }else{
      $right.width('300px')
      $resultListControl.children('.text').text('隐藏列表')
      $resultListControl.children('.icon').css('transform', 'rotate(0deg)')
    }
    flag = !flag
  })

  $('.resultList').delegate('li', 'click', function (event) {
    var c = $(this).children().eq(1).css('display')
    var $disorganizeText = $('.resultList .disorganizeText')
    $disorganizeText.hide()
    if(c==='none'){
      $(this).children().eq(1).show()
    }else{
      $(this).children().eq(1).hide()
    }

  })
    .delegate('.disorganizeText', 'click', function (event) {
      event.stopPropagation()
    })
    .delegate('.delete', 'click', function (event) {
      console.log('delete');
      event.stopPropagation()
      $.get('/deleteOne', {
        id: $(this).attr('id')
      }, function (res) {
        getTime()
        console.log(res);
      })
      $(this).attr('id')
    })

  function getTime () {
    $.get('/getTime', function (res) {
      // console.log(res);
      var $generatedTime = $('.generatedTime')


      var amount = res.length
      $('.resultList').empty()
      var avg5 = []
      var avg5Sum = 0
      var avg12 = []
      var avg12Sum = 0

      var $tip = $('.tip')
      if(res.length){
        $tip.hide()
      }else{
        $tip.show()
      }

      res.map(function (item, index) {






        
        // var temp = time.split('.')
        // time = temp[0].split(':')
        // time.push(temp[1])
        //
        // console.log(time)






        if(avg5.length>3){
          if(avg5.length===5){
            avg5.shift()
          }

          avg5.push((item.time)*1)
          // console.log(avg5);
          avg5Sum = 0
          for(var i=0; i<avg5.length; i++){
            // console.log(avg5[i]);
            // console.log(avg5[i] * 100)
            // console.log(parseInt(avg5[i]*100));
            avg5Sum += parseInt(avg5[i]*100)
          }
          avg5Sum = parseInt(avg5Sum/5)/100
        }else{
          avg5.push((item.time)*1)
          avg5Sum = 'N/A'
        }
        if(avg12.length>10) {
          if(avg12.length===12){
            avg12.shift()
          }

          avg12.push((item.time)*1)
          avg12Sum = 0
          for(var i=0; i<avg12.length; i++){
            avg12Sum += parseInt(avg12[i]*100)
          }
          avg12Sum = parseInt(avg12Sum/12)/100
        }else{
          avg12.push((item.time)*1)
          avg12Sum = 'N/A'
        }


        $('<li/>',{
          html: '<div class="itemMain">'+
          '<div class="serial">'+(index+1)+'</div>'+
          '<div class="time">'+item.time+'</div>'+
          '<div class="avg5">'+avg5Sum+'</div>'+
          '<div class="avg12">'+avg12Sum+'</div>'+
          '</div>'+
          '<div class="disorganizeText hide">'+item.disorganize+'<div class="deleteOne"><div class="delete" id="' +item._id+ '">删除此条记录</div></div></div>',
          class: 'resultItem'
        }).appendTo('.resultList')
      })
      $('.listContent').scrollTop($('.resultList').height())

      var generatedTime = amount ? res[amount-1].generatedTime : 'N/A' ;
      $generatedTime.text(generatedTime)


      getInfo(res, amount)

    })

  }

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

  function getInfo (res, amount) {
    var grandAvg = 0;
    var all = [];
    var onAverage = null;
    var avg5 = null;
    var avg12 = null;
    // var fastest = null;
    // var slowest = null;
    var $cAndT = $('.cAndT')


    res.map(function (item, index) {
      all.push(parseFloat(item.time));
      grandAvg += Math.round(parseFloat(item.time)*100)
    })
    var allBackup = [].concat(all)
    // console.log(grandAvg);

    if(all.length){
      grandAvg = parseInt(grandAvg/amount)/100;


      $cAndT.html('<span class="complete"></span> / <span class="try"></span>')

      var $complete = $('.complete')
      var $try = $('.try')
      $complete.text(all.length)
      $try.text(all.length)

      var allResult = deal(all)
      console.log(all);
      console.log(allResult);
      allResult.data.map(function (item, index) {
        // console.log(item, index);
        onAverage += Math.round(parseFloat(item)*100)
      })
      onAverage = parseInt(onAverage/allResult.data.length)/100;

      console.log(onAverage);
      //
      // if(all.length>=3 && all.length<10){
      //
      //
      //
      //
      //
      // }else if(all.length>=10){
      //
      // }

    }else{
      $cAndT.text('N/A')
    }

    var $allAvg5 = $('.right .avg5')
    var $allAvg12 = $('.right .avg12')
    var allAvg5 = []
    var allAvg12 = []
    for(var i=0; i<$allAvg5.length; i++){
      if(!($allAvg5.eq(i).text() === 'N/A')){
        allAvg5.push($allAvg5.eq(i).text()*1)
      }
      if(!($allAvg12.eq(i).text() === 'N/A')){
        allAvg12.push($allAvg12.eq(i).text()*1)
      }
    }
    // console.log(allAvg5)
    // console.log(Math.min.apply(null, allAvg5))
    // console.log(Math.min.apply(null, allAvg12))
    // console.log($allAvg5);

    $('.grandAvg').text(grandAvg ? grandAvg.toFixed(2) : 'N/A')
    $('.onAverage').text(onAverage ? onAverage.toFixed(2) : 'N/A')
    $('.fastestAvg5').text(allAvg5.length ? Math.min.apply(null, allAvg5) : 'N/A')
    $('.fastestAvg12').text(allAvg12.length ? Math.min.apply(null, allAvg12) : 'N/A')
    $('.fastest').text(allBackup.length ? allResult.fast.toFixed(2) : 'N/A')
    $('.slowest').text(allBackup.length ? allResult.slow.toFixed(2) : 'N/A')
  }

  function deal (a) {
    console.log(a);
    var fastest = Math.min.apply(null, a)
    var slowest = Math.max.apply(null, a)
    console.log(fastest)
    console.log(a);
    var fIndex = a.indexOf(fastest)
    a.splice(fIndex, 1)
    console.log(fIndex);
    var sIndex = a.indexOf(slowest)
    a.splice(sIndex, 1)
    console.log(a);
    return {
      data: a,
      fast: fastest,
      slow: slowest
    }
  }

})