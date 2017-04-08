import * as http from "http";
import { URLSearchParams, URL } from "url";
import * as cardinal from "card-inal";
import fetch from "node-fetch";


import robots = require("robots-txt");
import level = require("level");

const bot = robots({
    db: level('./robots-txt-cache'),
    ttl: 1000 * 60 * 60 * 24 // one day
});

http.createServer(async (request, response) => {
    console.log("Getting target...")
    const target = new URL(request.url, "http://localhost").searchParams.get("target");
    if (!target) {
        response.writeHead(302, { "Location": "https://github.com/saschanaz/mikine" });
        response.end();
        return;
    }

    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });

    let url;
    try {
        url = new URL(target);
    }
    catch (e) {
        response.end(JSON.stringify({
            message: "Incorrect `target` URL.",
            errorType: "request"
        }));
        return;
    }

    let allowed;
    try {
        allowed = await bot.isAllowed("Twitterbot", target);
    }
    catch (e) {
        if (e.status >= 500) {
            response.end(JSON.stringify({
                message: "Couldn't access robots.txt info to be allowed",
                errorType: "network"
            }));
            return;
        }
        else {
            allowed = true;
        }
    }
    if (!allowed) {
        response.end(JSON.stringify({
            message: "Blocked by robots.txt",
            errorType: "normal"
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
        console.log(`Fetching success for ${target}`);

        let card
        try {
            console.log(`Parsing...`);
            card = cardinal.parse(await fetchResponse.text(), url.hostname);
        }
        catch (e) {
            console.log(`Parser failed for ${target}`);
            response.end(JSON.stringify({
                message: e.message,
                errorType: "card"
            }));
            return;
        }
        if (!card) {
            console.log(`Parser didn't find any cards for ${target}`);
            response.end(JSON.stringify({
                message: "No Twitter Card exists",
                errorType: "normal",
            }))
        }
        console.log(`Parser found a card for ${target}`);
        response.end(JSON.stringify({
            data: card,
            errorType: "normal"
        }));
    }
    catch (e) {
        console.log(`Fetching failed for ${target}\nFailure message: ${e.message}`);
        response.end(JSON.stringify({
            error: `Failed to fetch ${target} because of network issue`,
            errorType: "network"
        }))
    }
}).listen(process.env.PORT);