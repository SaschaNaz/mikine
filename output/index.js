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
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    const target = new url_1.URL(request.url, "http://localhost").searchParams.get("target");
    if (!target) {
        response.end(JSON.stringify({
            message: "`target` parameter is required.",
            errorType: "request"
        }));
        return;
    }
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
        const fetchResponse = yield node_fetch_1.default(target);
        if (!fetchResponse.ok) {
            response.end(JSON.stringify({
                message: `Failed to fetch ${target}, ${fetchResponse.statusText}`,
                errorType: "network",
                httpCode: fetchResponse.status
            }));
            return;
        }
        let card;
        try {
            card = cardinal.parse(yield fetchResponse.text(), url.hostname);
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
            }));
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
        }));
    }
})).listen(process.env.PORT);
//# sourceMappingURL=index.js.map