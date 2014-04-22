$(function(){
   $("#loading").hide();
   localStorage['read'] = 0;
   init();
});


// 清屏按钮的单击事件
// 将localStorage中的记录全部设为已读。
$('#icon_tasks').click(function(){
    var datafeed_json = JSON.parse(localStorage['datafeed']);
    var index;
    for (var i=0;i<datafeed_json.length;i++) {
        index = 'aid'
        index += datafeed_json[i].aid;
        localStorage[index] = 1;
    }
    updateMSGNUM();
    $('#icon_reload').trigger("click");
});


// 指定AJAX发送的目标URL
// ajax_remote_url 为远程的开源服务器上的脚本
// ajax_local_url 为开发者脚本
function ajax_url() {
    var ajax_remote_url = "http://www.shuosc.org/ext/ajax.php?";
    var ajax_local_url = "http://localhost/open_source_extension/server/ajax.php?"
    return ajax_remote_url;
}



// 刷新按钮单击事件
// 通过 getWebInfo() 来获得最新的状态信息。
// clearMSGBOX();作为刷新效果，更新数字状态。
$('#icon_reload').click(function(){
    $('#container_inner').html('<!---->');
    getWebInfo();
    clearMSGBOX();
});

// 初始化按钮单击事件
// 清空缓存，重新网络加载信息
$('#icon_init').click(function() {
   $('#container_inner').html('<!-- -->');
   localStorage.clear();
   init();
});

//'TIME_RULE','Y-m-d H:i'
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

// AJAX XHR
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
    xhr = getXHR();
    var rand = Math.random();
    var aid_str = '0'
    if (!localStorage['datafeed']){
        var date = dateFormat('2012-05-20 13:23');
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

// init() 初始化
// 从 localStorage 获得初始化状态,已经初始化则调用getWebInfo()
// 否则清除所有当前状态，重新获得服务器的最新的十条状态
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


// domAppendFeed
// 将一条json状态信息添加到 #contain_inner中
function domAppendFeed(json) {
    var index = 'aid' + json.aid
    if (localStorage[index] && localStorage[index] ==1)
        return
    var container_inner = $('#container_inner');
    var messagebox = $('<div></div>');
    messagebox.attr('class','messagebox');
        var quit_ = $('<div></div>');
        quit_.attr('class','quit');
        messagebox.append(quit_)
            var icon_cross = $('<div></div>');
            icon_cross.attr('class','icon_cross');
            quit_.append(icon_cross)
        var msgbox_container = $('<div></div>');
        msgbox_container.attr('class','msgbox_container');
        messagebox.append(msgbox_container)
            var a_feed = $('<article></article>');
            a_feed.attr('dataid',json.aid);
            a_feed.attr('class','a-feed');
            msgbox_container.append(a_feed);
                var img_feed = $('<aside></aside>');
                img_feed.attr('class','img-feed');
                a_feed.append(img_feed)
                    var img = $('<img />');
                    img.attr('src','img/opensource.jpg');
                    img_feed.append(img);

                var feed_data = $('<div></div>');
                feed_data.attr('class','feed_data');
                a_feed.append(feed_data);
                    var p = $('<p></p>');
                    p.html(json.content);
                    feed_data.append(p);

                var details = $('<div></div>');
                details.attr('class','details');
                details.text(json.date);
                a_feed.append(details);
    container_inner.append(messagebox);
    messagebox.hide();
    messagebox.fadeIn(1000)
}


// displayFeed()
// 将json状态信息显示出来，调用 domAppendFeed 迭代添加
function displayFeed() {
    var feed_json = JSON.parse(localStorage['datafeed']);
    for (var i=0;i<feed_json.length;i++) {
        domAppendFeed(feed_json[i]);
    }
    $(".icon_cross").click(function(){
        var aid = $(this).parent('div').siblings('div.msgbox_container').children('article')
        var index = 'aid' + aid.attr('dataid');
        localStorage[index] = 1;
        updateMSGNUM();
        $(this).parent('div').parent('div').fadeOut();
    });
    updateMSGNUM();
}


// JSON的Util函数 ： updateJSON
// 将获得的json信息更新到localStorage中
function updateJSON(json) {
    if (localStorage['datafeed']) {
        var datafeed_json = JSON.parse(localStorage['datafeed']);
        for (var i=json.length-1;i>=0;i--) {
            datafeed_json.unshift(json[i]);
        }
        localStorage['datafeed'] = JSON.stringify(datafeed_json);
    } else {
        localStorage['datafeed'] = JSON.stringify(json);
    }
}

// updateMSGNUM();
// 获取状态信息的数量，并显示在状态方格中
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
    var num = $("#numbox");
    num.html(localStorage['msgnum']);
    statenum();
}

// Ajax 的响应函数
function readyStateChange() {
    if (xhr.readyState == 4) {
        $('#longing').hide()
        if (xhr.status == 200) {
            if (xhr.responseText) {
                var json_str = xhr.responseText;
                var json = JSON.parse(json_str);
                updateJSON(json);
                displayFeed();
            } else {
                displayFeed();
            }
        } else {
            alert('Error 01: 网络异常，请稍后重试。');
            displayFeed();
        }
    } else {
        $('#loading').show();
    }
}

// 刷新消息盒子、状态栏。
function clearMSGBOX() {
    localStorage['msgnum'] = 0;
    updateMSGNUM();
    $('#container_inner').fadeOut();
    $('#container_inner').fadeIn();
}

// 在POPUP按钮前显示
function statenum() {
    chrome.browserAction.setBadgeText({text: localStorage['msgnum']});
}
