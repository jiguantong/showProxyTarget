
chrome.devtools.panels.create('ProxyTarget', 'img/icon.png', 'mypanel.html', null);
chrome.devtools.network.onRequestFinished.addListener(
  function (request) {
        request.getContent((body)=> {
              //continue with custom code
              if(body){
                    request.responseBody = JSON.parse(body);
              }
              // chrome.devtools.inspectedWindow.eval(
              //   'console.log('+
              //   JSON.stringify(request) + ')'
              //   // 'console.log(document.getElementsByClass("content"))'
              // );
        });
        for(var i=0;i<request.request.headers.length;i++){
              if(request.request.headers[i].name=='routeUrl'){
                    request.request.url = request.request.headers[i].value;
              }
        }
        // chrome.devtools.inspectedWindow.eval(
        //   'console.log('+
        //   JSON.stringify(request) + ')'
        //   // 'console.log(document.getElementsByClass("content"))'
        // );
        appendRequest(request);
  }
);
var requestArray = [];
var index=0;
function appendRequest(request) {
      var data = {};
      data.headers = request.response.headers;
      data.type = request.response.content.mimeType;
      data.size = (request.response.content.size/1000).toFixed(1);
      data.status = request.response.status;
      data.time = request.time.toFixed(0);
      data.name = request.request.url.substr(request.request.url.lastIndexOf("/")+1);
      $("#requestTable tr:last").after("<tr class=\"data\">" +
        "<td class='clickName' index='"+index+"'>"+data.name+"</td>" +
        "<td class='canHide'>"+data.status+"</td>" +
        "<td class='canHide'>"+data.type+"</td>" +
        "<td class='canHide'>"+data.size+" kB</td>" +
        "<td class='canHide'>"+data.time+" ms</td>" +
        "</tr>");
      requestArray.push(request);
      index++;
      var $tableContainer = $("#tableContainer");
      $tableContainer.animate({
            scrollTop: $tableContainer.get(0).scrollHeight
      }, 1);
}

function renderJson(request) {
      var $info = $("#info");
      var _html = "";
      // General
      _html += "<span class='subtitle'>▼ General</span><br>" +
        "<span class='subtitle indent'>Request URL: </span>" +
        request.request.url +
        "<br>" +
        "<span class='subtitle indent'>Request Method: </span>" +
        request.request.method +
        "<br>" +
        "<span class='subtitle indent'>Status Code: </span>" +
        request.response.status +
        "<hr>";
      // Response Headers
      var responseHeaders = request.response.headers;
      _html += "<span class='subtitle'>▼ Response Headers</span><br>";
      for(var i=0;i<responseHeaders.length;i++) {
            _html+="<span class='subtitle indent'>"+responseHeaders[i].name+": </span>" +
            responseHeaders[i].value +
            "<br>"
      }
      _html += "<hr>";
      // Request Headers
      var requestHeaders = request.request.headers;
      _html += "<span class='subtitle'>▼ Request Headers</span><br>";
      for(var i=0;i<requestHeaders.length;i++) {
            _html+="<span class='subtitle indent'>"+requestHeaders[i].name+": </span>" +
              requestHeaders[i].value +
              "<br>"
      }
      _html += "<hr>";
      $info.html(_html);
      if(request.request.queryString.length>0) {
            const queryString = new JSONFormatter(request.request.queryString);
            $("#queryString").html(queryString.render())
      }
      if(request.request.postData){
            const postData = new JSONFormatter(request.request.postData, 2, {});
            $("#postData").html(postData.render());
      }
      if(request.responseBody) {
            const responseBody = new JSONFormatter(request.responseBody);
            $("#preview").html(responseBody.render());
      }
}


$(function(){
      $("#clearBtn").on("click", function(){
            $("#requestTable .data").remove();
      });
      $("#requestTable").on("click", ".clickName", function(){
            $(".clickName.active").removeClass("active");
            $(this).addClass("active");
            var $right = $("#right");
            $("#requestTable").addClass("onlyName");
            $("#left").width("25%");
            $right.show();
            var _index = Number($(this).attr("index"));
            // const responseBody = new JSONFormatter({"a":{'b':"c"}});
            // $("#info").append(responseBody.render());
            renderJson(requestArray[_index])
      });
      $("#right").on("click", ".tabBtn", function() {
            var _attr = $(this).attr("attr");
            $(".tabBtn.active").removeClass("active");
            $(this).addClass("active");
            $(".tab").addClass("hide");
            $("#"+_attr).removeClass("hide");
      })
      // var box = document.querySelector(".footer");
      // var content = document.querySelector(".content");
      // var text = document.querySelector(".text");
      //
      // var textWidth = text.offsetWidth;
      // var boxWidth = box.offsetWidth;
      // window.onload=function checkScrollLeft(){
      //       // 判断文字长度是否大于盒子长度
      //       if(boxWidth > textWidth){ return false}
      //       content.innerHTML += content.innerHTML;
      //       document.querySelector('.text').classList.add('padding');
      //       // 更新
      //       textWidth = document.querySelector('.text').offsetWidth;
      //       toScrollLeft()
      // };
      // function toScrollLeft(){
      //       //  如果文字长度大于滚动条距离，则递归拖动
      //       if(textWidth > box.scrollLeft){
      //             box.scrollLeft++;
      //             setTimeout(function(){
      //                   toScrollLeft();
      //             }, 18);
      //       }
      //       else{
      //             box.scrollLeft = 0;
      //             toScrollLeft()
      //       }
      // }
});

