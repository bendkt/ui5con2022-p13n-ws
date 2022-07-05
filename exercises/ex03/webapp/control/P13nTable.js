sap.ui.define([
    "sap/m/Table",
    "sap/m/p13n/Engine",
    "sap/m/p13n/SelectionController",
    "sap/m/p13n/MetadataHelper",
    "sap/m/p13n/modification/ModificationHandler"
], function (
    Table, Engine, SelectionController, MetadataHelper, ModificationHandler
) {
    "use strict";
    var P13nTable = Table.extend("ui5con.p13nApp.control.P13nTable", {
        constructor: function () {
            Table.apply(this, arguments);

                //on updateFinished the p13n can be initialized and the Promise is stored for later usage
                this._pInitialized = new Promise(function(resolve, reject){
                    this.attachEventOnce("updateFinished", function() {
                        this._initP13n();
                        resolve();
                    }, this);
                }.bind(this));
        },
        renderer: "sap.m.TableRenderer"
    });

    P13nTable.prototype._initP13n = function () {
        var aColumnsMetadata = [];
    
        this.getColumns().forEach(function (oColumn, iIndex) {
            aColumnsMetadata.push({
                key: oColumn.getId(),
                label: oColumn.getHeader().getText(), 
                path: this.getItems()[0].getCells()[iIndex].getBinding("text").getPath()
            });
        }.bind(this))
    
        this.oHelper = new MetadataHelper(aColumnsMetadata)
    
        Engine.register(this, {
            helper: this.oHelper,
            modification: new ModificationHandler(),
            controller: {
                Columns: new SelectionController({
                    control: this,
                    targetAggregation: "columns"
                })
            }
        });
    };

    P13nTable.prototype.openP13n = function (oEvent) {
        Engine.show(this, ["Columns"], {
            title: "Table Settings",
            source: oEvent.getSource()
        });
    };

    return P13nTable;
});