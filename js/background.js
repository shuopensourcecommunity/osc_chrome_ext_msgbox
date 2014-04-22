// 指定AJAX发送的目标URL
// ajax_remote_url 为远程的开源服务器上的脚本
// ajax_local_url 为开发者脚本
function ajax_url() {
    var ajax_remote_url = "http://www.shuosc.org/ext/ajax.php?";
    var ajax_local_url = "http://localhost/open_source_extension/server/ajax.php?"
    return ajax_remote_url;
}


function show() {
    var title ='开源社区发布了新的消息';
    var content = 'SHU开源社区消息盒子接受到新的消息，请打开消息盒子查收:)';
    var debug = localStorage['init'];
    var notification = webkitNotifications.createNotification(
        'http://www.shuosc.org/css/images/logo.png',
        title,
        content
    );
    notification.show();
}

function init() {

    if (localStorage['init'] && localStorage['init'] == '1') {
        getWebInfo();
    } else {
        localStorage.clear();
        xhr = getXHR();
        var rand = Math.random()
        localStorage['datafeed'] = '';
        var url = ajax_url()
            +"entry="
            +rand
            +"&num=10";
        xhr.open("GET",url,false);
        xhr.onreadystatechange = readyStateChange;
        xhr.send();
        localStorage['init'] = '1';
    }
}


// dateFormat(date_str)
// 根据日期字符串返回js的日期类
function dateFormat(date_str) {
    var date_arr = date_str.split(' ');
    var month_str = date_arr[0].split('-')[1];
    var day_str = date_arr[0].split('-')[2];
    var hour_str = date_arr[1].split(':')[0];
    var minute_str = date_arr[1].split(':')[1];
    var year_str = date_arr[0].split('-')[0];
    var date = new Date();
    date.setMonth(parseInt(month_str)-1);
    date.setDate(parseInt(day_str));
    date.setHours(parseInt(hour_str));
    date.setMinutes(parseInt(minute_str));
    date.setYear(parseInt(year_str));
    return date
}

function getXHR() {
    var req;
    if (window.XMLHttpRequest) {
        req = new XMLHttpRequest();
    }
    return req;
}


// getWebInfo();
// 根据当前最新状态的日期来从服务器获得更新
function getWebInfo() {
    setBadgeText();
    xhr = getXHR();
    var rand = Math.random();
    var aid_str = '0'
    if (!localStorage['datafeed']){
        var date = dateFormat('05-20 13:23 2011');
    } else {
        var datafeed_json = JSON.parse(localStorage['datafeed'])
        date = dateFormat(datafeed_json[0].date);
        aid_str = datafeed_json[0].aid;
    }
    var date_int = date.getTime()
    date_int = Math.round(date_int/1000);
    var date_str = date_int.toString();
    var url = ajax_url()
        +"entry="
        +rand
        +"&date="
        +date_str
        +"&aid="
        +aid_str;
    xhr.open("GET",url, false);
    xhr.onreadystatechange = readyStateChange;
    xhr.send();
}

function updateJSON(json) {
    if (localStorage['datafeed']) {
        var datafeed_json = JSON.parse(localStorage['datafeed']);
        for (i=json.length-1;i>=0;i--) {
            datafeed_json.unshift(json[i]);
        }
        localStorage['datafeed'] = JSON.stringify(datafeed_json);
    } else {
        localStorage['datafeed'] = JSON.stringify(json);
    }
}

function readyStateChange() {
    if (xhr.readyState == 4) {
        if (xhr.responseText && xhr.status == 200) {
            var json_str = xhr.responseText;
            var json = JSON.parse(json_str);
            updateJSON(json);
            show();
            localStorage['read'] = 1;
            setBadgeText();
        }
    }
}

function updateMSGNUM(){
    localStorage['msgnum'] = 0;
    var feed_json = JSON.parse(localStorage['datafeed']);
    var index;
    for (var i=0;i<feed_json.length;i++){
        index = 'aid' + feed_json[i].aid
        if (localStorage[index] && localStorage[index]=='1') {
            continue;
        } else {
            localStorage['msgnum'] = parseInt(localStorage['msgnum']) +1;
        }
    }
}

function setBadgeText() {
    updateMSGNUM();
    if (localStorage['msgnum'])
        chrome.browserAction.setBadgeText({text: localStorage['msgnum']});
    else
        chrome.browserAction.setBadgeText({text: '0'});
}


setInterval(function() {
    init();
}, 5000);

// setInterval(function(){
//     show();
// }, 3000);
