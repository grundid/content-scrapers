var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

var demoUrl = "https://electrek.co/2016/11/19/watch-tesla-self-driving-demo-video-real-time/";

exports.scrapeArticle = function (url, callback) {
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
                var link = $(this);
                if (link.attr('href').charAt(0) == "/" && link.attr('href').charAt(1) != "/") {
                    link.attr('href', "https://electrek.co" + link.attr('href'));
                }
            });
            text.find('a').each(function () {
                var img = $(this);
                if (img.attr('href').charAt(0) == "/" && img.attr('href').charAt(1) != "/") {
                    img.attr('href', "https://electrek.co" + img.attr('href'));
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


