# Sorting and Grouping Capabilities
For additional features you can enhance your table with Sorting and Grouping. This requires the `SortController` and `GroupController` as well as their proper registration. Furthermore you need a `sap.ui.model.Sorter`, so that the actual sorting can be applied to the binding.

## Enhance the custom control with new controllers

To start using the controllers, you need to add the modules to our `P13nTable` control:
````js
sap.ui.define([
    "sap/m/Table",
    "sap/m/p13n/Engine",
    "sap/m/p13n/SelectionController",
    "sap/m/p13n/SortController",
    "sap/m/p13n/GroupController",
    "sap/m/p13n/MetadataHelper",
    "sap/m/p13n/modification/ModificationHandler",
    "sap/ui/model/Sorter"
], function (
    Table, Engine, SelectionController, SortController, GroupController, MetadataHelper, ModificationHandler, Sorter
) {
````

The [`sap.m.p13n.SortController`](https://openui5nightly.hana.ondemand.com/api/sap.m.p13n.SortController) and
the [`sap.m.p13n.GroupController`](https://openui5nightly.hana.ondemand.com/api/sap.m.p13n.GroupController) offer specific personalization UIs using the [`Engine#show`](https://openui5nightly.hana.ondemand.com/api/sap.m.p13n.Engine#methods/show) method. In addition the processed state includes sorting and grouping specific information, as soon as they are registered.

Once the modules have been required, you can extend the registration by the new controllers. Chose `Sorter` and `Groups` as names in the `P13nTable#_initP13n` method, equivalent to `Columns` for the `SelectionController`.

````js
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
            }),
            Sorter: new SortController({
                control: this
            }),
            Groups: new GroupController({
                control: this
            })
        }
    });

    Engine.attachStateChange(function (oEvt) {
        if (oEvt.getParameter("control") === this) {
            this.onStateChange(oEvt.getParameter("state"));
        }
    }.bind(this));
};
````

Once you restart the application and open the personalization again, you notice that the personalization dialog does not yet include any additional functionality compared to before. To change this, add the new controllers to the `P13nTable#openP13n` method (**Note:** You could also consider to add seperate buttons for the different functionalities and call the method individually with the corresponding arguments)

````js
P13nTable.prototype.openP13n = function (oEvent) {
    Engine.show(this, ["Columns", "Sorter", "Groups"], {
        title: "Table Settings",
        source: oEvent.getSource()
    });
};
````

Once you added the according entries `Sorter` and `Groups` to the panel key configuration, you can see that the dialog displays additional tabs:

![`Dialog changes`](screenshots/ex05_1.png)

## Implement the Behaviour
The state handling event includes two more entries for `Sorter` and `Groups` whenever changes occur to these personalization controllers. In order to react on grouping and sorting, you need to enhance the state change event handling. This time, create a `sap.ui.model.Sorter` whenever there are entries in the `Sorter` and `Groups` arrays of the `state` parameter:

````js
P13nTable.prototype.onStateChange = function(oState) {

    this.getColumns().forEach(function(oColumn) {
        // if the column is not in the state, it is not visible
        oColumn.setVisible(!!oState.Columns.find(function(oStateItem) {
            return oColumn.getId() === oStateItem.key;
        }));
    });

    oState.Columns.forEach(this._moveColum, this);

    var aSorter = [];

    oState.Sorter.forEach(function(oSorter) {
        aSorter.push(new Sorter(this.oHelper.getPath(oSorter.key), oSorter.descending));
    }.bind(this));

    oState.Groups.forEach(function(oGroup) {
        aSorter.push(new Sorter(this.oHelper.getPath(oGroup.key), oGroup.descending, true));
    }.bind(this));

    this.getBinding("items").sort(aSorter);
};
````

Now open the personalization Dialog again and trigger a grouping for `Countries`:
![`Grouping demo`](screenshots/ex05_2.png)

## Summary
Hooray! Now you can not only add and remove columns from the table, but also sort or group the displayed data. Please proceed with [Exercise 6](../ex06/).
