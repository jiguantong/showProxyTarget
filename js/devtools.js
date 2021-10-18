chrome.devtools.panels.create('ProxyTarget', null, 'showProxyTarget.html', null);
chrome.devtools.network.onRequestFinished.addListener(
  function (request) {
    var isXHR = false;

    for (var i = 0; i < request.response.headers.length; i++) {
      if (request.response.headers[i].name.toLowerCase() === 'content-type'.toLowerCase() && request.response.headers[i].value.includes("application/json")) {
        isXHR = true;
      }
    }

    for (var i = 0; i < request.request.headers.length; i++) {
      if (request.request.headers[i].name === 'routeUrl') {
        request.request.url = request.request.headers[i].value;
      }
      if (request.request.headers[i].name.toLowerCase() === 'X-Requested-With'.toLowerCase() && request.request.headers[i].value === 'XMLHttpRequest') {
        isXHR = true;
      }
    }

    if (isXHR) {
      request.getContent((body) => {
        if (body) {
          request.responseBody = JSON.parse(body);
        }
      });
      appendRequest(request);
    }
  }
);

var requestArray = [];
var index = 0;
var count = 0;

function appendRequest(request) {
  var data = {};
  data.headers = request.response.headers;
  data.type = request.response.content.mimeType;
  data.size = (request.response.content.size / 1000).toFixed(1);
  data.status = request.response.status;
  data.time = request.time.toFixed(0);
  data.name = request.request.url.substr(request.request.url.lastIndexOf("/") + 1);
  var $table = document.getElementById("requestTbody");
  var $tr = document.createElement("tr");
  $tr.className = 'data';
  $tr.innerHTML = "<tr>" +
    "<td class='clickName' index='" + index + "'>" + data.name + "</td>" +
    "<td class='canHide'>" + data.status + "</td>" +
    "<td class='canHide'>" + data.type + "</td>" +
    "<td class='canHide'>" + data.size + " kB</td>" +
    "<td class='canHide'>" + data.time + " ms</td>" +
    "</tr>";
  if ($table) {
    $table.appendChild($tr);
  }
  $tr.childNodes[0].addEventListener("click", clickName, false);
  requestArray.push(request);
  index++;
  var $tableContainer = document.getElementById("tableContainer");
  if ($tableContainer) {
    $tableContainer.scrollTop = $tableContainer.scrollHeight;
  }
  var $count = document.getElementById("count");
  count++;
  if ($count) {
    $count.innerText = count;
  }
}

function renderJson(request) {
  var $info = document.getElementById("info");
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
  for (var i = 0; i < responseHeaders.length; i++) {
    _html += "<span class='subtitle indent'>" + responseHeaders[i].name + ": </span>" +
      responseHeaders[i].value +
      "<br>"
  }
  _html += "<hr>";
  // Request Headers
  var requestHeaders = request.request.headers;
  _html += "<span class='subtitle'>▼ Request Headers</span><br>";
  for (var i = 0; i < requestHeaders.length; i++) {
    _html += "<span class='subtitle indent'>" + requestHeaders[i].name + ": </span>" +
      requestHeaders[i].value +
      "<br>"
  }
  _html += "<hr>";
  $info.innerHTML = _html;
  var $queryString = document.getElementById("queryString");
  if (request.request.queryString.length > 0) {
    const queryString = new JSONFormatter(request.request.queryString, "Infinity");
    $queryString.innerHTML = "";
    $queryString.appendChild(queryString.render())
  }
  var $postData = document.getElementById("postData");
  if (request.request.postData) {
    const postData = new JSONFormatter(request.request.postData, "Infinity", {});
    $postData.innerHTML = "";
    $postData.appendChild(postData.render());
    const postData2 = request.request.postData.text.replace(/\\"/g, '"').replace(/"{/g, "{")
      .replace(/}"/, "}");
    const postData3 = new JSONFormatter(JSON.parse(postData2), "Infinity");
    $postData.appendChild(postData3.render());
  }
  var $responseBody = document.getElementById("responseBody");
  var $preview = document.getElementById("preview");
  if (request.responseBody) {
    const responseBody = new JSONFormatter(request.responseBody, 2);
    $preview.innerHTML = "";
    $preview.appendChild(responseBody.render());
    $responseBody.innerHTML = JSON.stringify(request.responseBody, undefined, 4)
  }
}

document.addEventListener("DOMContentLoaded", function () {
  eventHandler();
});

function eventHandler() {
  var clearBtnEl = document.getElementById("clearBtn");
  if (clearBtnEl) {
    clearBtnEl.addEventListener("click", clearTable, false);
  }

  var clickTabEls = document.getElementsByClassName("tabBtn");
  if (clickTabEls) {
    for (var i = 0; i < clickTabEls.length; i++) {
      clickTabEls[i].addEventListener("click", clickTabBtn, false);
    }
  }

  var closeBtn = document.getElementById("closeBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeRight, false);
  }
}

function clearTable() {
  var $requestTbody = document.getElementById("requestTbody");
  $requestTbody.innerHTML = "";
  closeRight();
  var $count = document.getElementById("count");
  count = 0;
  if($count) {
      $count.innerText = count;
  }
}

function closeRight() {
  document.getElementById("requestTable").classList.remove("onlyName");
  document.getElementById("left").style.width = "100%";
  document.getElementById("right").style.display = 'none';
}

function clickName(e) {
  document.getElementById("author").style.display = 'none';
  var clickNameEls = document.getElementsByClassName("clickName");
  if (clickNameEls) {
    for (var i = 0; i < clickNameEls.length; i++) {
      clickNameEls[i].classList.remove("active");
    }
  }
  e.target.classList.add("active");

  document.getElementById("requestTable").classList.add("onlyName");
  document.getElementById("left").style.width = "25%";
  document.getElementById("right").style.display = 'block';
  var _index = Number(e.target.getAttribute("index"));
  renderJson(requestArray[_index]);
}

function clickTabBtn(e) {
  var _attr = e.target.getAttribute("attr");
  var tabBtnEls = document.getElementsByClassName("tabBtn");
  if (tabBtnEls) {
    for (var i = 0; i < tabBtnEls.length; i++) {
      tabBtnEls[i].classList.remove("active");
    }
  }
  e.target.classList.add("active");
  var tabEls = document.getElementsByClassName("tab");
  if (tabEls) {
    for (var i = 0; i < tabEls.length; i++) {
      tabEls[i].classList.add("hide");
    }
  }
  document.getElementById(_attr).classList.remove("hide");
}

function log(info) {
  chrome.devtools.inspectedWindow.eval(
    'console.log(' +
    info + ')'
  );
}
