sap.ui.define([
    "sap/m/Table"
], function (
    Table
) {
    "use strict";
    var P13nTable = Table.extend("ui5con.p13nApp.control.P13nTable", {
        constructor: function () {
            Table.apply(this, arguments);
        },
        renderer: "sap.m.TableRenderer"
    });

    return P13nTable;
});