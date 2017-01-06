"use strict";
var yaml = require("js-yaml");
function make(data) {
    return yaml.afeDump(data);
}
exports.make = make;
