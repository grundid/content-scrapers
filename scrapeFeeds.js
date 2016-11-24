var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var moment = require('moment');
var feed = require('feed-read');
var electrek = require('./electrek.js');
var heise = require('./heise.js');
var golem = require('./golem.js');

var scrapeSources = [
    {
        channelId: "5831f3fae4b0e74dd7323b5b",
        scraper: electrek,
        feedUrl: "https://electrek.co/feed/"
    }
    , {
        channelId: "5831f411e4b0e74dd7323b5c",
        scraper: heise,
        feedUrl: "https://www.heise.de/newsticker/heise-atom.xml"
    },
    {
        channelId: "583721e0e4b0aa10aea90f87",
        scraper: golem,
        feedUrl: "http://rss.golem.de/rss.php?feed=ATOM1.0"
    }

];


scrapeSources.forEach(function (source) {

    feed(source.feedUrl, function (err, articles) {
        if (err) throw err;

        articles.forEach(function (elem) {
            var isAd = elem.link.indexOf("green-deals") != -1;
            if (!isAd) {
                console.log("Url: " + elem.link);

                source.scraper.scrapeArticle(elem.link, function (error, content) {
                    if (error) {
                        console.log(error);
                    } else {
                        content.channelId = source.channelId;
                        request.put({'url': 'https://api.grundid.de/rss/item', 'json': content},
                            function (error, response, body) {
                                if (error) {
                                    console.log(body);
                                }
                            }
                        );
                    }
                });
            }
        });
    });
});