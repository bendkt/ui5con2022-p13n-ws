sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/p13n/Engine",
    "sap/m/p13n/modification/ModificationHandler",
    "sap/m/p13n/SelectionController",
    "sap/m/p13n/MetadataHelper",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/m/Text",
    "sap/m/Label",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Engine, ModificationHandler, SelectionController, Helper, JSONModel, Filter, Text, Label, MessageToast) {
        "use strict";

        var RANGE_ID = 'container-ui5con.p13nApp---Mountains--range';
        
        return Controller.extend("ui5con.p13nApp.controller.Mountains", {
            
            onInit: function () {
                this._initGridFilter();
            },
            
            _initGridFilter: function() {
                var oGridFilter = this.byId("gridFilter");
                var oFilterModel = oGridFilter.getModel("filters");
            
                var aFilterMetadata = [];
                oGridFilter.getItems().forEach(function (oItem, i) {
                    aFilterMetadata.push({
                        key: oItem.getId(),
                        label: oFilterModel.getData().filters[i].label,
                        expression: oFilterModel.getData().filters[i].expression
                    });
                });
            
                var oFilterHelper = new Helper(aFilterMetadata);
            
               
                Engine.register(oGridFilter, {
                    modification: new ModificationHandler(),
                    helper: oFilterHelper,
                    controller: {
                        Items: new SelectionController({
                            control: oGridFilter,
                            targetAggregation: "items",
                            selector: function(oProperty) {
                                return sap.ui.getCore().byId(oProperty.key).getSelected();
                            }
                        })
                    }
                });
                
                Engine.attachStateChange(this._onP13nStateChange.bind(this));
            },

            _onP13nStateChange: function(oEvt){
                var oState = oEvt.getParameter("state");
                var oGridFilter = this.byId("gridFilter");
                    
                if(oEvt.getParameter("control") === oGridFilter) {
            
                    oGridFilter.getItems().forEach(function(oItem){
                        oItem.setSelected(!!oState.Items.find(function(oStateItem) {
                            return oItem.getId() === oStateItem.key;
                        }));
                    });
                }
            },

            onP13nPress: function(oEvent) {
                this.byId("table").openP13n(oEvent);
            },

            onGridFilterPress: function(oEvt) {
                Engine.show(this.byId("gridFilter"), ["Items"], {
                    title: "Filter Selection",
                    source: oEvt.getSource()
                });
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
