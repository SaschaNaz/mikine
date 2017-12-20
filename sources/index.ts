import * as http from "http";
import { URLSearchParams, URL } from "url";
import * as cardinal from "card-inal";
import { Response, default as fetch } from "node-fetch";
import sniff = require("html-encoding-sniffer");
import { TextDecoder } from "text-encoding"

import robots = require("robots-txt");
import level = require("level");

const bot = robots({
    db: level('./robots-txt-cache'),
    ttl: 1000 * 60 * 60 * 24 // one day
});

const textHtml = /^text\/html(?:;)?/

http.createServer(async (request, response) => {
    console.log("Getting target...")
    const target = new URL(request.url, "http://localhost").searchParams.get("target");
    if (!target) {
        response.writeHead(302, { "Location": "https://github.com/saschanaz/mikine" });
        response.end();
        return;
    }

    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });

    try {
        // url check
        new URL(target);
    }
    catch (e) {
        response.end(JSON.stringify({
            message: "Incorrect `target` URL.",
            errorType: "request"
        }));
        return;
    }

    try {
        console.log(`Fetching ${target}`);
        const fetchResponse = await fetch(target, {
            "headers": {
                "User-Agent": "Twitterbot/1.0 Mikine"
            }
        });
        if (!fetchResponse.ok) {
            console.log(`Fetching got non-ok sign`);
            response.end(JSON.stringify({
                message: `Failed to fetch ${target}, ${fetchResponse.statusText}`,
                errorType: "network",
                httpCode: fetchResponse.status
            }));
            return;
        }
        const contentType = fetchResponse.headers.get("content-type");
        if (contentType && !contentType.match(textHtml)) {
            closeConnectionWithoutCard(target, response, "Got a non-html file", "header");
            closeFetch(fetchResponse);
            return;
        }
        console.log(`Fetching ok sign for ${target}`);

        let allowed;
        try {
            allowed = await bot.isAllowed("Twitterbot", fetchResponse.url);
        }
        catch (e) {
            if (e.status >= 500) {
                closeConnectionWithoutCard(target, response, "Couldn't access robots.txt info to be allowed", "network");
                closeFetch(fetchResponse);
                return;
            }
            else {
                allowed = true;
            }
        }
        if (!allowed) {
            closeConnectionWithoutCard(target, response, "Blocked by robots.txt", "normal");
            closeFetch(fetchResponse);
            return;
        }

        let card;
        try {
            console.log("Parsing...");
            const buffer = await fetchResponse.buffer();
            const encoding = sniff(buffer, { defaultEncoding: "utf-8" });
            card = cardinal.parse(new TextDecoder(encoding).decode(buffer), new URL(fetchResponse.url).hostname);
        }
        catch (e) {
            closeConnectionWithoutCard(target, response, "Parser failed", "card", e)
            return;
        }
        if (!card) {
            closeConnectionWithoutCard(target, response, "No Twitter Card exists", "normal")
            return;
        }
        console.log(`Parser found a card for ${target}`);
        response.end(JSON.stringify({
            data: card,
            errorType: "normal"
        }));
    }
    catch (e) {
        closeConnectionWithoutCard(target, response, "Fetching failed by network disruption", "network", e);
    }
}).listen(process.env.PORT || 8080);

function closeConnectionWithoutCard(target: string, serverResponse: http.ServerResponse, message: string, errorType: string, errorEvent?: Error) {
    console.log(`Target "${target}": ${message}\n${errorEvent ? `Failure message: ${errorEvent.message}` : ""}`);
    serverResponse.end(JSON.stringify({
        error: message,
        errorType
    }));
}

function closeFetch(fetchResponse: Response) {
    fetchResponse.timeout = 1; // close;
}
