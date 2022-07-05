sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/p13n/Engine",
    "sap/m/p13n/modification/FlexModificationHandler",
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
    function (Controller, Engine, FlexModificationHandler, SelectionController, Helper, JSONModel, Filter, Text, Label, MessageToast) {
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
                    modification: new FlexModificationHandler(),
                    helper: oFilterHelper,
                    controller: {
                        Items: new SelectionController({
                            control: oGridFilter,
                            targetAggregation: "items",
                            selector: function(oProperty) {
                                return !!this.byId("table").getBinding("items").aFilters.find(function(oFilter){
                                    var oMetaData = oFilterHelper.getProperty(oProperty.key);
                                    return oFilter.getPath() === oMetaData.expression[0] && oFilter.getValue1() === oMetaData.expression[2];
                                });
                            }.bind(this)
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
            
                    var aFilters = [], sFilter;
                    oState.Items.forEach(function(oStateItem) {
                        var oItemContext = sap.ui.getCore().byId(oStateItem.key).getBindingContext("filters");
                        var aParts = oItemContext.getProperty("expression");
                        var sLabel = oItemContext.getProperty("description");
                        aFilters.push(new Filter(aParts[0], aParts[1], aParts[2]));
                        sFilter = sFilter ? sFilter + ", " + sLabel : sLabel;
                    }.bind(this));
            
                    this.byId("table").getBinding("items").filter(aFilters);
                    this._setFilterInfoText(sFilter);
                }
            },

            onGridFilterPress: function(oEvt) {
                Engine.show(this.byId("gridFilter"), ["Items"], {
                    title: "Filter Selection",
                    contentWidth: "25rem",
                    contentHeight: "30rem",
                    source: oEvt.getSource()
                });
            },

            onP13nPress: function(oEvent) {
                this.byId("table").openP13n(oEvent);
            },

            _setFilterInfoText(sFilter) {
                var oTbl = this.byId("table");
                var oInfoToolbar = oTbl.getInfoToolbar()
                if (sFilter && !oInfoToolbar) {
                    oTbl.setInfoToolbar(new sap.m.OverflowToolbar({
                        design: "Info",
                        active: true,
                        content: [
                            new Text({ text: "Filtered by:" }),
                            new Label({ text: sFilter })
                        ]
                    }));
                } else if (sFilter) {
                    oInfoToolbar.getContent()[1].setText(sFilter);
                } else {
                    oTbl.getInfoToolbar() && oTbl.getInfoToolbar().destroy();
                }
            },

            onGridFilterSelect: function(oEvent) {
                var oGridFilter = this.byId("gridFilter");
                var oItem = oEvent.getParameter("listItem");
                Engine.retrieveState(oGridFilter).then(function(oState) {
                    var sItemId = oItem.getId()
            
                    var oStateItem = oState.Items.find(function(oStateItem) {
                        return oStateItem.key == sItemId
                    });
            
                    if (oItem.getSelected()) {
                        oState.Items.push({key: sItemId});
                    } else {
                        oStateItem.visible = false;
                    }
            
                    Engine.applyState(oGridFilter, oState)
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
            },

            onClearFilterPress: function() {
                this.byId("gridFilter").removeSelections();
                var oGridFilter = this.byId("gridFilter");
                Engine.retrieveState(oGridFilter).then(function(oState) {
                    oState.Items.forEach(function(oStateItem) {
                        oStateItem.visible = false;
                    });
            
                    Engine.applyState(oGridFilter, oState);
                });
            
                this._setFilterInfoText();
            }

        });
    });
