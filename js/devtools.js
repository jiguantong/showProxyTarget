
chrome.devtools.panels.create('ProxyTarget', 'img/icon.png', 'mypanel.html', null);
chrome.devtools.network.onRequestFinished.addListener(
  function (request) {
        log(JSON.stringify(request))
        request.getContent((body)=> {
              if(body){
                    request.responseBody = JSON.parse(body);
              }
        });
        var isXHR = false;
        for(var i=0;i<request.request.headers.length;i++){
              if(request.request.headers[i].name=='routeUrl'){
                    request.request.url = request.request.headers[i].value;
              }
              if(request.request.headers[i].name == 'X-Requested-With' && request.request.headers[i].value == 'XMLHttpRequest') {
                    isXHR = true;
              }
        }
        //todo 解开
        // if(isXHR) {
              appendRequest(request);
        // }
  }
);

function log(info) {
      chrome.devtools.inspectedWindow.eval(
        'console.log('+
        info + ')'
      );
}

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
      var $table = document.querySelector("#requestTable");
      var $tr = document.createElement("tr");
      $tr.className = 'data';
      $tr.innerHTML = "<tr>" +
        "<td class='clickName' index='"+index+"'>"+data.name+"</td>" +
        "<td class='canHide'>"+data.status+"</td>" +
        "<td class='canHide'>"+data.type+"</td>" +
        "<td class='canHide'>"+data.size+" kB</td>" +
        "<td class='canHide'>"+data.time+" ms</td>" +
        "</tr>";
      $table.appendChild($tr)
      requestArray.push(request);
      index++;
      var $tableContainer = document.querySelector("#tableContainer");
      $tableContainer.scrollTop = $tableContainer.scrollHeight;
}

function renderJson(request) {
      var $info = document.querySelector("#info");
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
      $info.innerHTML = _html;
      var $queryString = document.querySelector("#queryString");
      if(request.request.queryString.length>0) {
            const queryString = new JSONFormatter(request.request.queryString, "Infinity");
            $queryString.innerHTML = "";
            $queryString.appendChild(queryString.render())
      }
      var $postData = document.querySelector("#postData");
      if(request.request.postData){
            const postData = new JSONFormatter(request.request.postData, "Infinity", {});
            $postData.innerHTML = "";
            $postData.appendChild(postData.render());
            const postData2 = request.request.postData.text.replace(/\\"/g, '"').replace(/"{/g, "{")
              .replace(/}"/, "}");
            const postData3 = new JSONFormatter(JSON.parse(postData2), "Infinity");
            $postData.appendChild(postData3.render());
      }
      var $responseBody = document.querySelector("#responseBody");
      var $preview = document.querySelector("#preview");
      if(request.responseBody) {
            const responseBody = new JSONFormatter(request.responseBody);
            $preview.innerHTML = "";
            $preview.appendChild(responseBody.render());
            $responseBody.innerHTML = JSON.stringify(request.responseBody, undefined, 4)
      }
}

if(document.readyState !== 'loading') {
      eventHandler();
}else {
      document.addEventListener("DOMContentLoaded", eventHandler);
}

function eventHandler() {
      $("#clearBtn").on("click", function(){
            $("#requestTable .data").remove();
      });
      $("#requestTable").on("click", ".clickName", function(){
            $("#author").hide();
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
}

