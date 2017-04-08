import * as http from "http";
import { URLSearchParams, URL } from "url";
import * as cardinal from "card-inal";
import fetch from "node-fetch";

http.createServer(async (request, response) => {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    
    const target = new URL(request.url, "http://localhost").searchParams.get("target");
    if (!target) {
        response.end(JSON.stringify({
            message: "`target` parameter is required.",
            errorType: "request"
        }));
        return;
    }

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

    try {
        const fetchResponse = await fetch(target);
        if (!fetchResponse.ok) {
            response.end(JSON.stringify({
                message: `Failed to fetch ${target}, ${fetchResponse.statusText}`,
                errorType: "network",
                httpCode: fetchResponse.status
            }));
            return;
        }

        let card
        try {
            card = cardinal.parse(await fetchResponse.text(), url.hostname);
        }
        catch (e) {
            response.end(JSON.stringify({
                message: e.message,
                errorType: "card"
            }));
            return;
        }
        if (!card) {
            response.end(JSON.stringify({
                message: "No Twitter Card exists",
                errorType: "normal",
            }))
        }
        response.end(JSON.stringify({
            data: card,
            errorType: "normal"
        }));
    }
    catch (e) {
        response.end(JSON.stringify({
            error: `Failed to fetch ${target} because of network issue`,
            errorType: "network"
        }))
    }
}).listen(process.env.PORT);