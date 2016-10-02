import * as http from "http";
import * as url from "url";

const pixivRegex = /^https?:\/\/(?:www\.)?pixiv\.net\/member_illust.php/;
const pixivShortRegex = /^https?:\/\/(?:www\.)?pixiv\.net\/i\//;

http.createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    const parsed = url.parse(request.url, true);
    if (!parsed.query || !parsed.query.target) {
        response.end("`target` parameter is required.\n");
        return;
    }
    const target = parsed.query.target as string;
    let output: string;
    if (target.match(pixivRegex)) {
        output = "pixiv";
    }
    else if (target.match(pixivShortRegex)) {
        output = "pixivshort"
    }
    else {
        response.end("Miki, kore shiranaino!");
        return;
    }
    response.end(`Hoshii Miki, Chuu-san nano! Ah, ato ${output}`);
}).listen(process.env.PORT);