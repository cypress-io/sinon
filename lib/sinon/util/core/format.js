"use strict";

var formatio = require("formatio");

var formatter = formatio.configure({
    quoteStrings: false,
    limitChildrenCount: 250
});

module.exports = function format() {
    var sinon = require("../../../sinon")
    if (typeof sinon._format === "function") {
      return sinon._format.apply(null, arguments);
    }

    return formatter.ascii.apply(formatter, arguments);
};
