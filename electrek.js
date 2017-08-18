var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

var demoUrl = "https://electrek.co/2016/11/19/watch-tesla-self-driving-demo-video-real-time/";

function absoluteLink(link) {
    var href = link.attr('href');
    if (href) {
        if (href.charAt(0) === "/" && href.charAt(1) !== "/") {
            link.attr('href', "https://electrek.co" + href);
        }
    }
}

exports.scrapeArticle = function (url, db, callback) {

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var $ = cheerio.load(body);
            var article = $('article');
            var title = article.find('h1.post-title a').text();
            var text = article.find('.post-body');

            var titleImage = article.find('.feat-image-wrapper meta[itemprop="url"]').attr("content");
            text.prepend($("<div/>").append($("<img/>").attr("src",titleImage)));
            var header = article.find('.post-meta');

            var timestamp = header.find('meta[itemprop="datePublished"]').attr('content');
            var uhrzeit = moment(timestamp, "YYYY-MM-DD HH:mm:ss").format();
            var author = header.find('p.byline a span').text();

            //Links absolut machen
            text.find('a').each(function () {
                absoluteLink($(this));
            });
            text.find('a').each(function () {
                absoluteLink($(this));
            });
            // remove Ads
            text.find('.fallback-unit').remove();
            text.find('img').each(function () {
                var img = $(this);
                var url = img.attr('href');
                if (url && url.indexOf("solar") !== -1 && url.indexOf("-300.jpg") !== -1) {
                    img.remove();
                }
            });

            var result = {
                "title": title,
                "link": url,
                "pubDate": uhrzeit,
                "author": author,
                "content": text.html()
            };
            callback(null, result);

        } else {
            console.log("could not connect to the host " + error);
            callback(error, null);
        }
    });
};


