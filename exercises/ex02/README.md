# Custom Table for P13n
A standard way of UI5 implementations is the creation of a custom control. In this case there is already a UI5 control, that does its job very well. You can extend the existing `sap.m.Table` and enhance it with the specialized behavior. That way, you are be able to reuse it in different scenarios or applications.

## Create a new Custom Control
Create a new folder named `control` in `webapp/` and a new file called `P13nTable.js` inside. Add the following control definition in `P13nTable.js`:

````js
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
````

>**Remark**: The `sap.m.Table` gets extended, since most of the behavior should be kept. The original `renderer` can be used, as only additional functionality is added that does not affect the control UI.

## Usage in the XMLView
In order to use the new `P13nTable` it needs to be included in the `Mountains.view.xml`. Please open that file and add the custom control namespace of the application:

````xml
<mvc:View
    height="100%"
    displayBlock="true"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:f="sap.f"
    xmlns:core="sap.ui.core"
    xmlns:ctl="ui5con.p13nApp.control"
    controllerName="ui5con.p13nApp.controller.Mountains">
````

Change the existing table definition to be a `P13nTable` by replacing it with name and namespace. Do not forget to set the namespace also for the control's aggregations, e.g. `ctl:columns`:

````xml
<f:content>
    <VBox>
        <ctl:P13nTable id="table"
            inset="false"
            items="{mountains>/mountains}">
            <ctl:columns>
                <Column id="name"
                    width="12em">
                    <Text text="Name" />
                </Column>
                <Column id="height"
                    minScreenWidth="Tablet"
                    demandPopin="true">
                    <Text text="Height" />
                </Column>
                <Column id="prominence"
                    minScreenWidth="Tablet"
                    demandPopin="true">
                    <Text text="Prominence" />
                </Column>
                <Column id="range"
                    minScreenWidth="Tablet"
                    demandPopin="true">
                    <Text text="Range" />
                </Column>
                <Column id="coordinates"
                    minScreenWidth="Tablet"
                    demandPopin="true">
                    <Text text="Coordinates" />
                </Column>
                <Column id="parent_mountain"
                    minScreenWidth="Tablet"
                    demandPopin="true">
                    <Text text="Parent Mountain" />
                </Column>
                <Column id="first_ascent"
                    minScreenWidth="Tablet"
                    demandPopin="true">
                    <Text text="First Ascent" />
                </Column>
                <Column id="countries"
                    minScreenWidth="Tablet"
                    demandPopin="true">
                    <Text text="Countries" />
                </Column>
            </ctl:columns>
            <ctl:items>
                <ColumnListItem vAlign="Middle">
                    <cells>
                        <ObjectIdentifier
                            title="{mountains>name}"
                            text="{mountains>range}"/>
                            <Text text="{mountains>height}" />
                            <Text text="{mountains>prominence}" />
                            <Text text="{mountains>range}" />
                            <Text text="{mountains>coordinates}" />
                            <Text text="{mountains>parent_mountain}" />
                            <Text text="{mountains>first_ascent}" />
                            <Text text="{mountains>countries}" />
                    </cells>
                </ColumnListItem>
            </ctl:items>
        </ctl:P13nTable>
    </VBox>
</f:content>
````
## Summary
Now the table is ready to be enhanced with personalization features. Check the application and when everything is running fine and continue with [Exercise 3](../ex03/)!
