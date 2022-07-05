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

        Engine.attachStateChange(function (oEvt) {
            if (oEvt.getParameter("control") === this) {
                this.onStateChange(oEvt.getParameter("state"));
            }
        }.bind(this));
    };

    P13nTable.prototype.onStateChange = function(oState) {

        this.getColumns().forEach(function(oColumn) {
            // if the column is not in the state, it is not visible
            oColumn.setVisible(!!oState.Columns.find(function(oStateItem) {
                return oColumn.getId() === oStateItem.key;
            }));
        });
    
        oState.Columns.forEach(this._moveColum, this);
    };

    P13nTable.prototype._moveColum = function(oStateColumn, iIndex) {
        var oCol = sap.ui.getCore().byId(oStateColumn.key);
        var iOldIndex = this.getColumns().indexOf(oCol);
    
        if(iIndex != iOldIndex) {
            this.removeColumn(oCol);
            this.insertColumn(oCol, iIndex);

            var fnMoveCells = function(oItem) {
                if (oItem.isA("sap.m.ColumnListItem")) {
                   var oCell = oItem.removeCell(iOldIndex);
                   oItem.insertCell(oCell, iIndex);
               }
            };

            fnMoveCells(this.getBindingInfo("items").template)
            this.getItems().forEach(fnMoveCells);
        }
    };

    P13nTable.prototype.openP13n = function (oEvent) {
        Engine.show(this, ["Columns"], {
            title: "Table Settings",
            source: oEvent.getSource()
        });
    };

    return P13nTable;
});