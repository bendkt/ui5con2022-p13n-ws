sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast) {
        "use strict";

        var RANGE_ID = 'container-ui5con.p13nApp---Mountains--range';
        
        return Controller.extend("ui5con.p13nApp.controller.Mountains", {

            onInit: function () {
                // initialization
            },

            onP13nPress: function(oEvent) {
                this.byId("table").openP13n(oEvent);
            },

            onToggleRange: function(oEvent) {
                var oTable = this.byId("table");
                var bPressed = oEvent.getSource().getPressed();
                oTable.retrieveState().then(function(oState) {
                    var oRangeColumn = oState.Columns.find(function(oColumn) {
                        return oColumn.key == RANGE_ID;
                    });
                    if (bPressed && oRangeColumn) {
                        oRangeColumn.visible = false;
                        MessageToast.show("Range hidden");
                    } else {
                        oState.Columns.push({key: RANGE_ID, position: 0});
                        MessageToast.show("Range shown");
                    }
                    oTable.applyState(oState);
                });
            }

        });
    });
