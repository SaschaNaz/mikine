"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const url_1 = require("url");
const cardinal = require("card-inal");
const node_fetch_1 = require("node-fetch");
http.createServer((request, response) => __awaiter(this, void 0, void 0, function* () {
    console.log("Getting target...");
    const target = new url_1.URL(request.url, "http://localhost").searchParams.get("target");
    if (!target) {
        response.writeHead(302, { "Location": "https://github.com/saschanaz/mikine" });
        response.end();
        return;
    }
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    let url;
    try {
        url = new url_1.URL(target);
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
        const fetchResponse = yield node_fetch_1.default(target, {
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
        let card;
        try {
            console.log(`Parsing...`);
            card = cardinal.parse(yield fetchResponse.text(), url.hostname);
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
            }));
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
        }));
    }
})).listen(process.env.PORT);
//# sourceMappingURL=index.js.map