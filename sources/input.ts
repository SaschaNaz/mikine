import * as http from "http";

http.createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Hoshii Miki, Chuu-san nano!\n");
}).listen(process.env.PORT);