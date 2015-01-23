var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.calendar;
handle["/mail"] = requestHandlers.mail;
handle["/calendar"] = requestHandlers.calendar;
handle["/contacts"] = requestHandlers.contacts;
handle["/authorize"] = requestHandlers.authorize;

server.start(router.route, handle);