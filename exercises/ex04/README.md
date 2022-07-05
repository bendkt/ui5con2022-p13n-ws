# Column Selection Controller and Popover
As the Table is now registered to the `Engine` and the `SelectionController` is assigned, you can start to enable the selection by adding the required state handling so that the `SelectionController` can show the proper state to the user.

## React to Personalization Changes
To be able to implement the desired behavior for personalization changes, the `Engine` provides the [`stateChange`](https://openui5nightly.hana.ondemand.com/api/sap.m.p13n.Engine#methods/attachStateChange) event. The event has the target control and the personalization state as parameters. To reflect the personalization changes on registered control instances, you need to attach to the according event in the `P13nTable#_initP13n` method as follows:


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

Afterwards add the `P13nTable#onStateChange` method. For now, just use a console log using `JSON#stringify` to take a look at the state object and how it is retrieved by the `Engine`.

````js
P13nTable.prototype.onStateChange = function(oState) {
    console.log(JSON.stringify(oState, null, 2));
};
````

Once you restart the application, use `F12` to open the debugger. Switch to the `console` tab of your browser. The state handling has been executed once and when you open the dialog and make changes, you can see how the `SelectionController` reports the state. You can also try to open the dialog, deselect an entry, and reselect it again. If you now close the Popup, you notice that no state change event has been fired. One of the central functionalties of the `SelectionController` is the state handling and detection of changes. This way, the `Engine` and `SelectionController` ensure, that events are only triggered when necessary changes have occured. The object looks similar to the following:

````json
{
  "Columns": [
    {
      "key": "container-ui5con.p13nApp---Mountains--countries"
    },
    {
      "key": "container-ui5con.p13nApp---Mountains--coordinates"
    },
    {
      "key": "container-ui5con.p13nApp---Mountains--name"
    },
    {
      "key": "container-ui5con.p13nApp---Mountains--height"
    },
    {
      "key": "container-ui5con.p13nApp---Mountains--first_ascent"
    }
  ]
}
````

On the root level of the object you can again find the name you chose for the registration of the `SelectionController`.
It refers to an array, containing objects for each entry of the registered `SelectionController`, using the keys you defined in the `MetadataHelper`. The order in the array reflects the same position as in the dialog and only selected entries are returned in this state.

## Implement the Table-Specific Handling

Now that you understand the `stateChange` event, add some customized handling for toggling the visibility of the columns. In addition, you want to reorder the columns and table items according to the selection state. Therefore replace the log method in the `P13nTable#onStateChange`:

````js
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
````

>**Note:** This is just an example implementation of how this event may be used. You can decide, depending on the requirements, how you would like to react on the state changes done.

## Summary
The user is now able to add, remove and reorder columns using the button in the upper right corner of the application. Check out the example and adapt some personalization settings. You can observe, that the changes in the dialog are automatically reflected on the UI. If you are happy with the result, please proceed with [Exercise 5](../ex05/).
