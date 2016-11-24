var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

var url = "http://www.golem.de/news/spionage-malware-kann-kopfhoerer-als-mikrofon-nutzen-1611-124691.html";

exports.scrapeArticle = function (url, callback) {
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var $ = cheerio.load(body);
            var article = $('article');
            var text = article.find('.formatted');

            var header = article.find("header");

            var title = header.find('h1').first().text();
            var titleImage = header.find('figure img').first();

            var intro = header.find("p");
            text.prepend(intro);
            text.prepend(titleImage);



            var infoBox = $("aside"); // header.find('.publish-info');
            var uhrzeit = moment(infoBox.find('time').text(), "DD.MM.YYYY, HH:mm").format();
            var author = $(infoBox.find("li").get(1)).text().trim();

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
