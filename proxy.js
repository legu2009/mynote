var proxy = require("anyproxy");
//!proxy.isRootCAFileExists() && proxy.generateRootCA();
console.log(require("./proxyRule.js"));
new proxy.proxyServer({
    type          : "http",
    port          : 9001,
    hostname      : "localhost",
    rule          : require("./proxyRule.js"),
    dbFile        : null,  // optional, save request data to a specified file, will use in-memory db if not specified
    webPort       : 8002,  // optional, port for web interface
    socketPort    : 8003,  // optional, internal port for web socket, replace this when it is conflict with your own service
    disableWebInterface : true, //optional, set it when you don't want to use the web interface
    setAsGlobalProxy : false, //set anyproxy as your system proxy
    silent        : false //optional, do not print anything into terminal. do not set it when you are still debugging.
});