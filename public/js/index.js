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

  var type

  var $cubeSelect = $('select')

  changeType()
  getTime()

  $cubeSelect.change(function () {
    changeType()
  })

  $('.newDisorganize').click(function () {
    disorganize()
  })

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
  var $right = $('.rightWrap')
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


//todo 获取魔方类型
  function changeType () {
    var $cubeType = $('.cubeType')

    type = !isNaN($cubeSelect.val()) ? Number($cubeSelect.val()) : $cubeSelect.val()
    $cubeType.text($cubeSelect.children().filter(':selected').text())
    disorganize()
  }

//todo 打乱公式生成
  function disorganize () {
    var direction = ['U', 'D', 'F', 'B', 'L', 'R']
    var rotationType = ['', '\'', '2']
    var disorganizeContent = ''

    var arr = []
    
    for(var i=0; i<20; i++){
      do {
        var dirIndex = Math.floor(Math.random()*6)
      }while(checkMove(dirIndex))
      arr.push(dirIndex)
    }
    for(var i=0; i<arr.length; i++){
      var tier = '',
        double = '',
        random

      if(type===4 || type===5){
        random = Math.floor(Math.random()*2)
        if(random===1){
          double = 'w'
        }
      }else if(type>5){
        random = Math.floor(Math.random()*3)
        if(random===2){
          double = 'w'
          tier = '3'
        }else if(random===1){
          double = 'w'
        }
      }
      random = Math.floor(Math.random()*5)
      var move = ''
      if(random===4){
        move += tier + direction[arr[i]] + double + '2'
      }else if(random===2 || random===3){
        move += tier + direction[arr[i]] + double + '\''
      }else{
        move += tier + direction[arr[i]] + double
      }

      if(i<arr.length-1){
        move += ' '
      }
      disorganizeContent += move
    }
    //todo 检查移动合理性
    function checkMove (dirIndex) {
      if(dirIndex==arr[arr.length-1]){
        return true
      }else if(dirIndex==arr[arr.length-2] && Math.floor(dirIndex/2)==Math.floor(arr[arr.length-1]/2)){
        return true
      }else{
        return false
      }
    }

    $('.disorganize').html(disorganizeContent)
    // console.log(disorganizeContent.split(' '));
    disorganizePic(disorganizeContent)
  }

//todo 打乱图生成
  function disorganizePic (str) {
    // var type = 3
    // var str = 'B L B2 R\' L U2 R\' U2 D R2 F R\' D2 L2 U2 L2 D\' B2 D2 B\''
// var str = 'R U L B F D'
//     str = 'R2 B\' F R2 D2 U\' F2 U\' R\' D\' L2 D\' F\' B\' L\' D B2 F D\' R'
//     str = 'U L2 F Uw Lw D R F Rw U2 R\' U\' Lw\' R Bw R\' Uw\' B D2 Fw2'
    console.log(str);
    var temp = str.split(' ')
    console.log(temp);

    var arr = ['up', 'left', 'front', 'right', 'back', 'down']
    var color = ['w', 'o', 'g', 'r', 'b', 'y']

    var $wrap = $('.disorganizePic')
    $wrap.empty()
    var $newInner, $newUl, $newP;
    var initColor = {}

    for(var i=0; i<6; i++){
      $newInner = $('<div class="inner">')
      $newUl = $('<ul class="cube '+ arr[i] +'">')
      $newP = $('<p>')
      for(var j=0, k=type*type, l=0; j<k; j++){
        initColor[arr[i]] || (initColor[arr[i]]=[])
        initColor[arr[i]].push(color[i])
        $('<li class="block">').appendTo($newUl)
      }
      $newUl.appendTo($newInner)
      $newP.appendTo($newInner)
      $newInner.appendTo($wrap)
    }$('.cube li').css('width', 100/type +'%').css('height', 100/type +'%')
    // console.log($newInner, initColor);

    var $up = $('.up .block');
    var $down = $('.down .block');
    var $front = $('.front .block');
    var $back = $('.back .block');
    var $left = $('.left .block');
    var $right = $('.right .block');


// initColor = {
//   up: ['w', 'w', 'y', 'w', 'w', 'w', 'w', 'w', 'w'],
//   down: ['y', 'y', 'y', 'y', 'y', 'y', 'y', 'y'],
//   front: ['g', 'g', 'g', 'g', 'g', 'g', 'g', 'g'],
//   back: ['b', 'b', 'b', 'b', 'b', 'b', 'b', 'b'],
//   left: ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'],
//   right: ['r', 'r', 'r', 'r', 'r', 'r', 'r', 'r']
// }

    // var upSide, downSide, leftSide, rightSide;
    var dirTemp = []
    var leftArr = [],
        rightArr = [],
        reverseArr = []
    temp.map(function (item, index) {
      var itemTemp = item[0]
      var tier = 1
      leftArr = [],
        rightArr = []
      
      
      // console.log(item.indexOf('w'));
      // console.log(item, item.length);
      if(item.indexOf('3')===0){
        tier = 3
      }else if($.inArray('w', item)!==-1){
        tier = 2
      }
      if(item.length===4){
        itemTemp = item[1]
      }else if(item.length===3 && item[2]==='w'){
        itemTemp = item[1]
      }
      //todo 获取色块的index
      for(var i=0; i<type; i++){
        for(var j=0; j<type; j++){
          leftArr.push(type*j+i)
          rightArr.push(type*(j+1)-1-i)
        }
      }
      // console.log(leftArr,rightArr,reverseArr);

      var upTemp, frontTemp, backTemp, leftTemp, rightTemp, downTemp;
      // upSide = []
      // downSide = []
      // leftSide = []
      // rightSide = []
      // console.log(itemTemp);
      switch (itemTemp) {
        case 'U':
          dirTemp = initColor.up.slice(0)
          frontTemp = initColor.front.slice(0, type*tier);
          backTemp = initColor.back.slice(0, type*tier);
          leftTemp = initColor.left.slice(0, type*tier);
          rightTemp = initColor.right.slice(0, type*tier);
       // console.log(upTemp,frontTemp,backTemp,leftTemp,rightTemp);
          if(item.endsWith('\'')){
            rotate(item, initColor.up)
            for(var i=0; i<type*tier; i++){
              initColor.front[i] = leftTemp[i];
              initColor.right[i] = frontTemp[i];
              initColor.back[i] = rightTemp[i];
              initColor.left[i] = backTemp[i];
            }
          }else if (item.endsWith('2')) {
            rotate(item, initColor.up)
            for(var i=0; i<type*tier; i++){
              initColor.front[i] = backTemp[i];
              initColor.right[i] = leftTemp[i];
              initColor.back[i] = frontTemp[i];
              initColor.left[i] = rightTemp[i];
            }
          }else{
            rotate(item, initColor.up)
            for(var i=0; i<type*tier; i++){
              initColor.front[i] = rightTemp[i];
              initColor.right[i] = backTemp[i];
              initColor.back[i] = leftTemp[i];
              initColor.left[i] = frontTemp[i];
            }
          }
          break;
        case 'D':
          dirTemp = initColor.down.slice(0)

          frontTemp = initColor.front.slice(-type*tier);
          backTemp = initColor.back.slice(-type*tier);
          leftTemp = initColor.left.slice(-type*tier);
          rightTemp = initColor.right.slice(-type*tier);
          if(item.endsWith('\'')){
            rotate(item, initColor.down)
            for(var i=0; i<type*tier; i++){
              initColor.front[type*(type-tier)+i] = rightTemp[i];
              initColor.right[type*(type-tier)+i] = backTemp[i];
              initColor.back[type*(type-tier)+i] = leftTemp[i];
              initColor.left[type*(type-tier)+i] = frontTemp[i];
            }
          }else if (item.endsWith('2')) {
            rotate(item, initColor.down)
            for(var i=0; i<type*tier; i++){
              initColor.front[type*(type-tier)+i] = backTemp[i];
              initColor.right[type*(type-tier)+i] = leftTemp[i];
              initColor.back[type*(type-tier)+i] = frontTemp[i];
              initColor.left[type*(type-tier)+i] = rightTemp[i];
            }
          }else{
            rotate(item, initColor.down)
            for(var i=0; i<type*tier; i++){
              initColor.front[type*(type-tier)+i] = leftTemp[i];
              initColor.right[type*(type-tier)+i] = frontTemp[i];
              initColor.back[type*(type-tier)+i] = rightTemp[i];
              initColor.left[type*(type-tier)+i] = backTemp[i];
            }
          }
          break;
        case 'F':
          dirTemp = initColor.front.slice(0)
          console.log(tier);
          upTemp = initColor.up.slice(-type*tier).reverse();
          downTemp = initColor.down.slice(0, type*tier);
          for(var i=0; i<type*tier; i++){
            leftTemp || (leftTemp=[])
            leftTemp.push(initColor.left[rightArr[i]])
            rightTemp || (rightTemp=[])
            rightTemp.unshift(initColor.right[rightArr[type*(type-tier)+i]])
          }
          if(item.endsWith('\'')){
            rotate(item, initColor.front)
            for(var i=0; i<type*tier; i++){
              initColor.up[type*type-1-i] = rightTemp[i];
              initColor.right[rightArr[type*type-1-i]] = downTemp[i];
              initColor.down[i] = leftTemp[i];
              initColor.left[rightArr[i]] = upTemp[i];
            }
          }else if (item.endsWith('2')) {
            rotate(item, initColor.front)
            for(var i=0; i<type*tier; i++){
              initColor.up[type*type-1-i] = downTemp[i];
              initColor.right[rightArr[type*type-1-i]] = leftTemp[i];
              initColor.down[i] = upTemp[i];
              // console.log(rightTemp);
              initColor.left[rightArr[i]] = rightTemp[i];
            }
          }else{
            rotate(item, initColor.front)
            for(var i=0; i<type*tier; i++){
              initColor.up[type*type-1-i] = leftTemp[i];
              initColor.left[rightArr[i]] = downTemp[i];
              initColor.down[i] = rightTemp[i];
              initColor.right[rightArr[type*type-1-i]] = upTemp[i];
            }
          }
          break;
        case 'B':
          dirTemp = initColor.back.slice(0)

          upTemp = initColor.up.slice(0, type*tier);
          downTemp = initColor.down.slice(-type*tier).reverse();
          for(var i=0; i<type*tier; i++){
            leftTemp || (leftTemp=[])
            leftTemp.unshift(initColor.left[rightArr[type*(type-tier)+i]])

            rightTemp || (rightTemp=[])
            rightTemp.push(initColor.right[rightArr[i]])
          }
          if(item.endsWith('\'')){
            rotate(item, initColor.back)
            for(var i=0; i<type*tier; i++){
              initColor.up[i] = leftTemp[i];
              initColor.left[rightArr[type*type-1-i]] = downTemp[i];
              initColor.down[type*type-1-i] = rightTemp[i];
              initColor.right[rightArr[i]] = upTemp[i];
            }
          }else if (item.endsWith('2')) {
            rotate(item, initColor.back)
            for(var i=0; i<type*tier; i++){
              initColor.up[i] = downTemp[i];
              initColor.right[rightArr[i]] = leftTemp[i];
              initColor.down[type*type-1-i] = upTemp[i];
              initColor.left[rightArr[type*type-1-i]] = rightTemp[i];
            }
          }else{
            rotate(item, initColor.back)
            for(var i=0; i<type*tier; i++){
              initColor.up[i] = rightTemp[i];
              initColor.right[rightArr[i]] = downTemp[i];
              initColor.down[type*type-1-i] = leftTemp[i];
              initColor.left[rightArr[type*type-1-i]] = upTemp[i];
            }
          }
          break;
        case 'L':
          dirTemp = initColor.left.slice(0)

          for(var i=0; i<type*tier; i++){
            upTemp || (upTemp=[])
            frontTemp || (frontTemp=[])
            downTemp || (downTemp=[])
            backTemp || (backTemp=[])

            upTemp.push(initColor.up[leftArr[i]])
            frontTemp.push(initColor.front[leftArr[i]])
            downTemp.push(initColor.down[leftArr[i]])
            backTemp.unshift(initColor.back[leftArr[type*(type-tier)+i]])
          }

//        console.log(upTemp,frontTemp,backTemp,leftTemp,rightTemp);
          if(item.endsWith('\'')){
            rotate(item, initColor.left)
            for(var i=0; i<type*tier; i++){
              initColor.up[leftArr[i]] = frontTemp[i];
              initColor.front[leftArr[i]] = downTemp[i];
              initColor.down[leftArr[i]] = backTemp[i];
              initColor.back[leftArr[type*type-1-i]] = upTemp[i];
            }
          }else if (item.endsWith('2')) {
            rotate(item, initColor.left)
            for(var i=0; i<type*tier; i++){
              initColor.up[leftArr[i]] = downTemp[i];
              initColor.front[leftArr[i]] = backTemp[i];
              initColor.down[leftArr[i]] = upTemp[i];
              initColor.back[leftArr[type*type-1-i]] = frontTemp[i];
            }
          }else{
            rotate(item, initColor.left)
            for(var i=0; i<type*tier; i++){
              initColor.up[leftArr[i]] = backTemp[i];
              initColor.front[leftArr[i]] = upTemp[i];
              initColor.down[leftArr[i]] = frontTemp[i];
              initColor.back[leftArr[type*type-1-i]] = downTemp[i];
            }
          }
          break;
        case 'R':
          dirTemp = initColor.right.slice(0)
          for(var i=0; i<type*tier; i++){
            upTemp || (upTemp=[])
            frontTemp || (frontTemp=[])
            downTemp || (downTemp=[])
            backTemp || (backTemp=[])

            upTemp.push(initColor.up[rightArr[i]])
            frontTemp.push(initColor.front[rightArr[i]])
            downTemp.push(initColor.down[rightArr[i]])
            backTemp.unshift(initColor.back[rightArr[type*(type-tier)+i]])
          }
       // console.log(upTemp,frontTemp,backTemp,leftTemp,rightTemp);
          if(item.endsWith('\'')){
            rotate(item, initColor.right)
            for(var i=0; i<type*tier; i++){
              initColor.up[rightArr[i]] = backTemp[i];
              initColor.back[rightArr[type*type-1-i]] = downTemp[i];
              initColor.down[rightArr[i]] = frontTemp[i];
              initColor.front[rightArr[i]] = upTemp[i];
            }
          }else if (item.endsWith('2')) {
            rotate(item, initColor.right)
            for(var i=0; i<type*tier; i++){
              initColor.up[rightArr[i]] = downTemp[i];
              initColor.back[rightArr[type*type-1-i]] = frontTemp[i];
              initColor.down[rightArr[i]] = upTemp[i];
              initColor.front[rightArr[i]] = backTemp[i];
            }
          }else{
            rotate(item, initColor.right)
            for(var i=0; i<type*tier; i++){
              initColor.up[rightArr[i]] = frontTemp[i];
              initColor.front[rightArr[i]] = downTemp[i];
              initColor.down[rightArr[i]] = backTemp[i];
              initColor.back[rightArr[type*type-1-i]] = upTemp[i];
            }
          }
          break;
      }

    })

    console.log(initColor);


    for (var i in initColor){
      switch (i) {
        case 'up':
          initColor[i].map(function (colorItem, colorIndex) {
            $up.eq(colorIndex).addClass(colorItem)
          })
          break;
        case 'down':
          initColor[i].map(function (colorItem, colorIndex) {
            $down.eq(colorIndex).addClass(colorItem)
          })
          break;
        case 'front':
          initColor[i].map(function (colorItem, colorIndex) {
            $front.eq(colorIndex).addClass(colorItem)
          })
          break;
        case 'back':
          initColor[i].map(function (colorItem, colorIndex) {
            $back.eq(colorIndex).addClass(colorItem)
          })
          break;
        case 'left':
          initColor[i].map(function (colorItem, colorIndex) {
            $left.eq(colorIndex).addClass(colorItem)
          })
          break;
        case 'right':
          initColor[i].map(function (colorItem, colorIndex) {
            $right.eq(colorIndex).addClass(colorItem)
          })
          break;
      }
    }


//todo 整面旋转处理
    function rotate (item, dir) {
      // console.log(rightSide);
      if(item.endsWith('\'')){
        for(var i=0; i<type*type; i++){
          dir[rightArr[type*type-1-i]] = dirTemp[i]
          // dir[i] = rightSide[i]
          // dir[type*(type-1-i)] = upSide[i]
          // dir[type*type-i-1] = leftSide[i]
          // dir[type*(i+1)-1] = downSide[i]
        }
      }else if (item.endsWith('2')) {
        for(var i=0; i<type*type; i++){
          dir[type*type-1-i] = dirTemp[i]
          // dir[i] = downSide[i]
          // dir[type*(type-1-i)] = rightSide[i]
          // dir[type*type-i-1] = upSide[i]
          // dir[type*(i+1)-1] = leftSide[i]
        }
      }else{
        for(var i=0; i<type*type; i++){
          dir[rightArr[i]] = dirTemp[i]
          // console.log(rightSide);
          // dir[i] = leftSide[i]
          // dir[type*(type-1-i)] = downSide[i]
          // dir[type*type-i-1] = rightSide[i]
          // dir[type*(i+1)-1] = upSide[i]
        }
      }
    }
  }

//todo 获取信息
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
      // console.log(all);
      // console.log(allResult);
      allResult.data.map(function (item, index) {
        // console.log(item, index);
        onAverage += Math.round(parseFloat(item)*100)
      })
      onAverage = parseInt(onAverage/allResult.data.length)/100;

      // console.log(onAverage);
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

    var $allAvg5 = $('.rightWrap .avg5')
    var $allAvg12 = $('.rightWrap .avg12')
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
    // console.log(a);
    var fastest = Math.min.apply(null, a)
    var slowest = Math.max.apply(null, a)
    // console.log(fastest)
    // console.log(a);
    var fIndex = a.indexOf(fastest)
    a.splice(fIndex, 1)
    // console.log(fIndex);
    var sIndex = a.indexOf(slowest)
    a.splice(sIndex, 1)
    // console.log(a);
    return {
      data: a,
      fast: fastest,
      slow: slowest
    }
  }

})