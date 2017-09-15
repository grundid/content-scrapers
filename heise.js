const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');

const demourl = "https://www.heise.de/newsticker/meldung/Spielkonsolenklassiker-in-4K-3488926.html";

function makeLinksAbsolute(text) {
    //Links absolut machen
    text.find('a').each(function () {
        const link = $(this);
        if (link.attr('href').charAt(0) === "/" && link.attr('href').charAt(1) !== "/") {
            link.attr('href', "https://heise.de" + link.attr('href'));
        }
    });
    text.find('a').each(function () {
        const img = $(this);
        if (img.attr('href').charAt(0) === "/" && img.attr('href').charAt(1) !== "/") {
            img.attr('href', "https://heise.de" + img.attr('href'));
        }
    });

}

function parseBase(body, url) {
    const $ = cheerio.load(body);
    const article = $('article');
    const header = article.find('.article-header');

    const title = header.find('.article__heading').text();
    const publish = header.find('.publish-info');
    const uhrzeit = publish.find('time').attr("datetime");
    const author = publish.find('.author').text();

    const text = article.find('.meldung_wrapper');

    makeLinksAbsolute(text);

    return {
        "title": title,
        "link": url,
        "pubDate": uhrzeit,
        "content": text.html(),
        "author": author
    };
}

function parseIx(body, url) {
    const $ = cheerio.load(body);
    const article = $('article');
    const header = article.find('.article-header');

    const title = header.find('.article__heading').text();
    const publish = header.find('.publish-info');
    const uhrzeit = publish.find('time').attr("datetime");
    const author = publish.find('.author').text();

    const text = article.find('.meldung_wrapper');

    makeLinksAbsolute(text);

    return {
        "title": title,
        "link": url,
        "pubDate": uhrzeit,
        "content": text.html(),
        "author": author
    };
}

function parseCt(body, url) {
    const $ = cheerio.load(body);

    const article = $('.article_page section');
    const intro = article.find('.article_page_intro');

    const title = article.find('.article_page_title').text();

    const uhrzeit = article.find('.article_page_info_date time').attr("datetime");
    const author = article.find('.article_page_info_author a').text();

    const content = article.find('.article_page_text');

    makeLinksAbsolute(content);

    const text = intro.html() + content.html();
    return {
        "title": title,
        "link": url,
        "pubDate": uhrzeit,
        "content": text,
        "author": author
    };
}

exports.scrapeArticle = function (url, db, callback) {
    request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {

            if (url.indexOf("heise.de/ct") !== -1) {
                const result = parseCt(body, url);
                callback(null, result);
            } else if (url.indexOf("heise.de/newsticker")) {
                const result = parseBase(body, url);
                callback(null, result);
            } else if (url.indexOf("heise.de/ix")) {
                const result = parseIx(body, url);
                callback(null, result);
            }
        } else {
            console.log("could not connect to the host " + error);
            callback(error, null);
        }
    });
};
