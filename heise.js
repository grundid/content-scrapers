var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

var url = "https://www.heise.de/newsticker/meldung/Spielkonsolenklassiker-in-4K-3488926.html";

exports.scrapeArticle = function (url, db, callback) {
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var $ = cheerio.load(body);
            var article = $('article');
            var header = article.find('.article-header');
            var text = article.find('.meldung_wrapper');

            var title = header.find('.article__heading').text();
            var publish = header.find('.publish-info');
            var uhrzeit = moment(publish.find('time').text().replace(' Uhr', ''), "DD.MM.YYYY HH:mm").format();
            var author = publish.find('.author').text();

            //Links absolut machen
            text.find('a').each(function () {
                var link = $(this);
                if (link.attr('href').charAt(0) == "/" && link.attr('href').charAt(1) != "/") {
                    link.attr('href', "https://heise.de" + link.attr('href'));
                }
            });
            text.find('a').each(function () {
                var img = $(this);
                if (img.attr('href').charAt(0) == "/" && img.attr('href').charAt(1) != "/") {
                    img.attr('href', "https://heise.de" + img.attr('href'));
                }
            });

            var result = {
                "title": title,
                "link": url,
                "pubDate": uhrzeit,
                "content": text.html(),
                "author" : author
            };
            callback(null, result);

        } else {
            console.log("could not connect to the host " + error);
            callback(error, null);
        }
    });
};
