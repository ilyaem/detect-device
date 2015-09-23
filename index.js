(function() {
    
    var path = require("path"),
        fs = require("fs");
    
    var _specials = {
        "FlipboardProxy": "bot",
        "Applebot": "bot"
    };
    
    var _rules = {
        "tv": [
            "{GoogleTV|SmartTV|Internet TV|NetCast|NETTV|AppleTV|boxee|Kylo|Roku|DLNADOC|hbbtv|CE\\-HTML}", // smart TV
            "{Xbox|PLAYSTATION 3|Wii}" // TV Based Gaming Console
        ],
        "tablet": [
            "{iP(a|ro)d} || ({tablet} && !{RX-34}) || {FOLIO} || {tablet}", // tablet
            "{Linux} && {Android} && !{Fennec|mobi|HTC Magic|HTCX06HT|Nexus One|SC-02B|fone 945}", // Android Tablet
            "{Kindle} || ({Mac OS} && {Silk}) || ({AppleWebKit} && {Silk} && !{Playstation Vita})", // Kindle / Kindle Fire
            "{GT-P10|SC-01C|SHW-M180S|SGH-T849|SCH-I800|SHW-M180L|SPH-P100|SGH-I987|zt180|HTC( Flyer|_Flyer)|Sprint ATP51|ViewPad7|pandigital(sprnova|nova)|Ideos S7|Dell Streak 7|Advent Vega|A101IT|A70BHT|MID7015|Next2|nook} || ({MB511} && {RUTEM})", // pre Android 3.0 Tablet
        ],
        "phone": [
            "{BOLT|Fennec|Iris|Maemo|Minimo|Mobi|mowser|NetFront|Novarra|Prism|RX-34|Skyfire|Tear|XV6875|XV6975|Google Wireless Transcoder}", // unique phone User Agent
            "{Opera} && {Windows NT 5} && {HTC|Xda|Mini|Vario|SAMSUNG\\-GT\\-i8000|SAMSUNG\\-SGH\\-i9}", // odd Opera User Agent
            "{iPhone|mobile}" // other
        ],
        "desktop": [
            "({Windows (NT|XP|ME|9)} && !{Phone}) && !{Bot|Spider|ia_archiver|NewsGator} || {Win( ?9|NT)}", // Windows Desktop
            "{Macintosh|PowerPC} && !{Silk}", // Mac Desktop
            "{Linux} && {X11} && !{Charlotte}", // Linux Desktop
            "{CrOS}", // Chrome Book
            "{Solaris|SunOS|BSD}" // Solaris, SunOS, BSD Desktop
        ],
        "bot": [
            "{Mozilla\\/5\\.0 \\(\\)|jack|Applebot|FlipboardProxy|Go 1.1 package|HTMLParser|simplereach|python-requests|ShowyouBot|MetaURI|nineconnections|(^Java\\/[0-9._]*)|Commons-HttpClient|InAGist|HTTP-Java-Client|curl|Bot|B-O-T|Crawler|Spider|Spyder|Yahoo|ia_archiver|Covario-IDS|findlinks|DataparkSearch|larbin|Mediapartners-Google|NG-Search|Snappy|Teoma|Jeeves|Charlotte|NewsGator|TinEye|Cerberian|SearchSight|Zao|Scrubby|Qseero|PycURL|Pompos|oegp|SBIder|yoogliFetchAgent|yacy|webcollage|VYU2|voyager|updated|truwoGPS|StackRambler|Sqworm|silk|semanticdiscovery|ScoutJet|Nymesis|NetResearchServer|MVAClient|mogimogi|Mnogosearch|Arachmo|Accoona|holmes|htdig|ichiro|webis|LinkWalker|lwp-trivial|facebookexternalhit} && !{phone|Playstation}" // BOT / Crawler / Spider
        ]
    };
    
    var _options = {
        defaultType: 'desktop',
        viewRouting: false,
        defaultRoute: [],
        lookupRouteExistence: false
    };
    
    var _types = Object.keys(_rules);
    var root = path.join(process.cwd(), 'views');
    
    exports.bind = function(options) {
        for(var key in options) _options[key] = options[key];
        
        for(var type of _types) {
            // checking if route folders exist at least
            if(_options.viewRouting) {
                var viewType = path.join(root, type);
                if(_options.defaultRoute.indexOf(type) === -1) {
                    try {
                        fs.accessSync(path.join(root, type), fs.R_OK);
                    } catch(e) {
                        _options.defaultRoute.push(type);
                    }
                }
            }
            // compile regexps
            for(var i = 0; i < _rules[type].length; i++) {
                var rule = _rules[type][i];
                rule = rule.replace(/\{/g, "source.match(/").replace(/\}/g, "/i)");
                _rules[type][i] = new Function("source", "return " + rule);
            }
        }
        
        return function(req, res, next) {
            var useragent = req.headers['user-agent'];
            
            var useragentType = null;
            for(var special in _specials) {
                if(useragent.match(special)) {
                    useragentType = _specials[special];
                    break;
                }
            }
            
            if(!useragentType) {
                for(var type in _types) {
                    for(var i = 0; i < _rules[type]; i++) {
                        if(_rules[type][i](useragent)) {
                            useragentType = type;
                        }
                    }
                    if(useragentType) break;
                }
            }
            if(!useragentType) useragentType = _options.defaultType;
            
            req.device = useragentType;
            
            if(_options.viewRouting) {
                var _render = res.render.bind(res); // original render
                res.render = function(name, options, fn) {
                    var type = (_options.defaultRoute.indexOf(useragentType) === -1 ? useragentType : _options.defaultType);
                    var viewExist = true;
                    if(_options.lookupRouteExistence) {
                        try {
                            fs.accessSync(path.join(root, type, name), fs.R_OK);
                        } catch(e) {
                            viewExist = false;
                        }
                    }
                    if(!_options.lookupRouteExistence || viewExist) {
                        name = path.join(type, name);
                    }
                    
                    if(options.layout === true || options.layout === undefined) {
                        options.layout = path.join(type, 'layout');
                    } else if(typeof layout === "string") {
                        options.layout = path.join(type, options.layout);
                    }
                    
                    _render(name, options, fn);
                };
            }
            next();
        };
    };
    
})();
