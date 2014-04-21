/* UMRUM client library */

(function(win, doc, undefined){
    var _server_api = 'http://umrum.frontendbahia.com/api',
        _server_ping = _server_api+'/ping',
        _server_ping_timeout = 30 * 1000,
        lib = win._mrm = win._mrm || {},
        _1rumCkn = '__1rum',
        addEvent = function(){},
        ping_fn;

    // cross addEvent method
    if(doc.addEventListener) {
        addEvent = function (elem, type, handler, useCapture){
            elem.addEventListener(type, handler, !!useCapture);
        }
    }
    else if (doc.attachEvent) {
        addEvent = function (elem, type, handler) {
            type = "on" + type;
            elem.attachEvent(type, function(){ handler.apply(elem, arguments) });
        }
    }

    doc.cookie.split(';').forEach(function(cookie){
        if (cookie.indexOf(_1rumCkn) == 0) {
            lib.uid = cookie.replace(_1rumCkn+'=', '');
        }
    });

    if (!lib.uid) {
        var domain = '.'+win.location.host.replace('www.','');
        // http://stackoverflow.com/q/105034/1197796#answer-2117523
        lib.uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        var weekAhead = new Date((+new Date)+7*24*60*60*1000).toUTCString();
        doc.cookie = _1rumCkn + '=' + lib.uid + ';expires=' + weekAhead;
    }

    ping_fn = function() {
        if ( lib.interaction ) {
            lib.interaction = false;
            lib.url = encodeURIComponent(win.location.href);
            lib.title = encodeURIComponent(doc.title);

            var imgId = "umrum_ping",
                img = doc.getElementById(imgId),
                _exists = img != null;

            if ( !_exists ) {
                img = doc.createElement('img');
                img.id = imgId;
                img.style.position = 'absolute';
                img.style.top = img.style.left = '-1px';
                img.height = img.width = 1;
                doc.body.appendChild(img);
            }
            img.src = [
                _server_ping,
                "?uid=", lib.uid,
                "&hostId=", lib.hostId,
                "&url=", lib.url,
                "&title=", lib.title,
                "&t=", (+new Date)
            ].join('');
        }
        lib.ping_timeout = setTimeout(ping_fn, _server_ping_timeout);
    };
    lib.interaction = true;
    ping_fn();

    // adding page interaction interaction listeners
    addEvent(win, 'scroll', function(){ lib.interaction = true; });
    addEvent(doc.body, 'click', function(){ lib.interaction = true; });
    var bodyChildren = Array.prototype.slice.call(doc.body.children, childIdx);
    var childIdx = bodyChildren.length;
    while (childIdx) {
        addEvent(
            bodyChildren[--childIdx],
            'mouseover',
            function(){ lib.interaction = true; }
        );
    }

    // adding leave page listeners
    win.onblur = function() { lib.interaction = false; };
    win.onbeforeunload = function(){
        lib.interaction = false;
        // must clear timeout when changing page
        clearTimeout(lib.ping_timeout);
    }
})(window, document);
