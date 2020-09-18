(function(jsGrid, $, undefined) {

    var Field = jsGrid.Field;

    function CheckboxField(config) {
        Field.call(this, config);
    }

    CheckboxField.prototype = new Field({

        sorter: "number",
        align: "center",
        autosearch: true,

        itemTemplate: function(value) {
            return this._createCheckbox().prop({
                checked: value,
                disabled: true
            });
        },

        filterTemplate: function() {
            if(!this.filtering)
                return "";

            var grid = this._grid,
                $result = this.filterControl = this._createCheckbox();

            $result.prop({
                readOnly: true,
                indeterminate: true
            });

            $result.on("click", function() {
                var $cb = $(this);

                if($cb.prop("readOnly")) {
                    $cb.prop({
                        checked: false,
                        readOnly: false
                    });
                }
                else if(!$cb.prop("checked")) {
                    $cb.prop({
                        readOnly: true,
                        indeterminate: true
                    });
                }
            });

            if(this.autosearch) {
                $result.on("click", function() {
                    grid.search();
                });
            }

            return $result;
        },

        insertTemplate: function() {
            if(!this.inserting)
                return "";

            return this.insertControl = this._createCheckbox();
        },

        editTemplate: function(value) {
            if(!this.editing)
                return this.itemTemplate.apply(this, arguments);

            var $result = this.editControl = this._createCheckbox();
            $result.prop("checked", value);
            return $result;
        },

        filterValue: function() {
            return this.filterControl.get(0).indeterminate
                ? undefined
                : this.filterControl.is(":checked");
        },

        insertValue: function() {
            return this.insertControl.is(":checked");
        },

        editValue: function() {
            return this.editControl.is(":checked");
        },

        _createCheckbox: function() {
            return $("<input>").attr("type", "checkbox");
        }
    });

    jsGrid.fields.checkbox = jsGrid.CheckboxField = CheckboxField;

}(jsGrid, jQuery));



(function(jsGrid, $, undefined) {

    var Field = jsGrid.Field;

    function ControlField(config) {
        Field.call(this, config);
        this._configInitialized = false;
    }

    ControlField.prototype = new Field({
        css: "jsgrid-control-field",
        align: "center",
        width: 50,
        filtering: false,
        inserting: false,
        editing: false,
        sorting: false,

        buttonClass: "jsgrid-button",
        modeButtonClass: "jsgrid-mode-button",

        modeOnButtonClass: "jsgrid-mode-on-button",
        searchModeButtonClass: "jsgrid-search-mode-button",
        insertModeButtonClass: "jsgrid-insert-mode-button",
        editButtonClass: "jsgrid-edit-button",
        deleteButtonClass: "jsgrid-delete-button",
        searchButtonClass: "jsgrid-search-button",
        clearFilterButtonClass: "jsgrid-clear-filter-button",
        insertButtonClass: "jsgrid-insert-button",
        updateButtonClass: "jsgrid-update-button",
        cancelEditButtonClass: "jsgrid-cancel-edit-button",

        searchModeButtonTooltip: "Switch to searching",
        insertModeButtonTooltip: "Switch to inserting",
        editButtonTooltip: "Edit",
        deleteButtonTooltip: "Delete",
        searchButtonTooltip: "Search",
        clearFilterButtonTooltip: "Clear filter",
        insertButtonTooltip: "Insert",
        updateButtonTooltip: "Update",
        cancelEditButtonTooltip: "Cancel edit",

        editButton: true,
        deleteButton: true,
        clearFilterButton: true,
        modeSwitchButton: true,

        _initConfig: function() {
            this._hasFiltering = this._grid.filtering;
            this._hasInserting = this._grid.inserting;

            if(this._hasInserting && this.modeSwitchButton) {
                this._grid.inserting = false;
            }

            this._configInitialized = true;
        },

        headerTemplate: function() {
            if(!this._configInitialized) {
                this._initConfig();
            }

            var hasFiltering = this._hasFiltering;
            var hasInserting = this._hasInserting;

            if(!this.modeSwitchButton || (!hasFiltering && !hasInserting))
                return "";

            if(hasFiltering && !hasInserting)
                return this._createFilterSwitchButton();

            if(hasInserting && !hasFiltering)
                return this._createInsertSwitchButton();

            return this._createModeSwitchButton();
        },

        itemTemplate: function(value, item) {
            var $result = $([]);

            if(this.editButton) {
                $result = $result.add(this._createEditButton(item));
            }

            if(this.deleteButton) {
                $result = $result.add(this._createDeleteButton(item));
            }

            return $result;
        },

        filterTemplate: function() {
            var $result = this._createSearchButton();
            return this.clearFilterButton ? $result.add(this._createClearFilterButton()) : $result;
        },

        insertTemplate: function() {
            return this._createInsertButton();
        },

        editTemplate: function() {
            return this._createUpdateButton().add(this._createCancelEditButton());
        },

        _createFilterSwitchButton: function() {
            return this._createOnOffSwitchButton("filtering", this.searchModeButtonClass, true);
        },

        _createInsertSwitchButton: function() {
            return this._createOnOffSwitchButton("inserting", this.insertModeButtonClass, false);
        },

        _createOnOffSwitchButton: function(option, cssClass, isOnInitially) {
            var isOn = isOnInitially;

            var updateButtonState = $.proxy(function() {
                $button.toggleClass(this.modeOnButtonClass, isOn);
            }, this);

            var $button = this._createGridButton(this.modeButtonClass + " " + cssClass, "", function(grid) {
                isOn = !isOn;
                grid.option(option, isOn);
                updateButtonState();
            });

            updateButtonState();

            return $button;
        },

        _createModeSwitchButton: function() {
            var isInserting = false;

            var updateButtonState = $.proxy(function() {
                $button.attr("title", isInserting ? this.searchModeButtonTooltip : this.insertModeButtonTooltip)
                    .toggleClass(this.insertModeButtonClass, !isInserting)
                    .toggleClass(this.searchModeButtonClass, isInserting);
            }, this);

            var $button = this._createGridButton(this.modeButtonClass, "", function(grid) {
                isInserting = !isInserting;
                grid.option("inserting", isInserting);
                grid.option("filtering", !isInserting);
                updateButtonState();
            });

            updateButtonState();

            return $button;
        },

        _createEditButton: function(item) {
            return this._createGridButton(this.editButtonClass, this.editButtonTooltip, function(grid, e) {
                grid.editItem(item);
                e.stopPropagation();
            });
        },

        _createDeleteButton: function(item) {
            return this._createGridButton(this.deleteButtonClass, this.deleteButtonTooltip, function(grid, e) {
                grid.deleteItem(item);
                e.stopPropagation();
            });
        },

        _createSearchButton: function() {
            return this._createGridButton(this.searchButtonClass, this.searchButtonTooltip, function(grid) {
                grid.search();
            });
        },

        _createClearFilterButton: function() {
            return this._createGridButton(this.clearFilterButtonClass, this.clearFilterButtonTooltip, function(grid) {
                grid.clearFilter();
            });
        },

        _createInsertButton: function() {
            return this._createGridButton(this.insertButtonClass, this.insertButtonTooltip, function(grid) {
                grid.insertItem().done(function() {
                    grid.clearInsert();
                });
            });
        },

        _createUpdateButton: function() {
            return this._createGridButton(this.updateButtonClass, this.updateButtonTooltip, function(grid, e) {
                grid.updateItem();
                e.stopPropagation();
            });
        },

        _createCancelEditButton: function() {
            return this._createGridButton(this.cancelEditButtonClass, this.cancelEditButtonTooltip, function(grid, e) {
                grid.cancelEdit();
                e.stopPropagation();
            });
        },

        _createGridButton: function(cls, tooltip, clickHandler) {
            var grid = this._grid;

            return $("<input>").addClass(this.buttonClass)
                .addClass(cls)
                .attr({
                    type: "button",
                    title: tooltip
                })
                .on("click", function(e) {
                    clickHandler(grid, e);
                });
        },

        editValue: function() {
            return "";
        }

    });

    jsGrid.fields.control = jsGrid.ControlField = ControlField;

}(jsGrid, jQuery));




(function(jsGrid, $, undefined) {

    var TextField = jsGrid.TextField;

    function NumberField(config) {
        TextField.call(this, config);
    }

    NumberField.prototype = new TextField({

        sorter: "number",
        align: "right",
		readOnly: false,

        filterValue: function() {
            return this.filterControl.val()
                ? parseInt(this.filterControl.val() || 0, 10)
                : undefined;
        },

        insertValue: function() {
            return this.insertControl.val()
                ? parseInt(this.insertControl.val() || 0, 10)
                : undefined;
        },

        editValue: function() {
            return this.editControl.val()
                ? parseInt(this.editControl.val() || 0, 10)
                : undefined;
        },

        _createTextBox: function() {
			return $("<input>").attr("type", "number")
                .prop("readonly", !!this.readOnly);
        }
    });

    jsGrid.fields.number = jsGrid.NumberField = NumberField;

}(jsGrid, jQuery));




(function(jsGrid, $, undefined) {

    var NumberField = jsGrid.NumberField;
    var numberValueType = "number";
    var stringValueType = "string";

    function SelectField(config) {
        this.items = [];
        this.selectedIndex = -1;
        this.valueField = "";
        this.textField = "";

        if(config.valueField && config.items.length) {
            var firstItemValue = config.items[0][config.valueField];
            this.valueType = (typeof firstItemValue) === numberValueType ? numberValueType : stringValueType;
        }

        this.sorter = this.valueType;

        NumberField.call(this, config);
    }

    SelectField.prototype = new NumberField({

        align: "center",
        valueType: numberValueType,

        itemTemplate: function(value) {
            var items = this.items,
                valueField = this.valueField,
                textField = this.textField,
                resultItem;

            if(valueField) {
                resultItem = $.grep(items, function(item, index) {
                    return item[valueField] === value;
                })[0] || {};
            }
            else {
                resultItem = items[value];
            }

            var result = (textField ? resultItem[textField] : resultItem);

            return (result === undefined || result === null) ? "" : result;
        },

        filterTemplate: function() {
            if(!this.filtering)
                return "";

            var grid = this._grid,
                $result = this.filterControl = this._createSelect();

            if(this.autosearch) {
                $result.on("change", function(e) {
                    grid.search();
                });
            }

            return $result;
        },

        insertTemplate: function() {
            if(!this.inserting)
                return "";

            return this.insertControl = this._createSelect();
        },

        editTemplate: function(value) {
            if(!this.editing)
                return this.itemTemplate.apply(this, arguments);

            var $result = this.editControl = this._createSelect();
            (value !== undefined) && $result.val(value);
            return $result;
        },

        filterValue: function() {
            var val = this.filterControl.val();
            return this.valueType === numberValueType ? parseInt(val || 0, 10) : val;
        },

        insertValue: function() {
            var val = this.insertControl.val();
            return this.valueType === numberValueType ? parseInt(val || 0, 10) : val;
        },

        editValue: function() {
            var val = this.editControl.val();
            return this.valueType === numberValueType ? parseInt(val || 0, 10) : val;
        },

        _createSelect: function() {
            var $result = $("<select>"),
                valueField = this.valueField,
                textField = this.textField,
                selectedIndex = this.selectedIndex;

            $.each(this.items, function(index, item) {
                var value = valueField ? item[valueField] : index,
                    text = textField ? item[textField] : item;

                var $option = $("<option>")
                    .attr("value", value)
                    .text(text)
                    .appendTo($result);

                $option.prop("selected", (selectedIndex === index));
            });

            $result.prop("disabled", !!this.readOnly);

            return $result;
        }
    });

    jsGrid.fields.select = jsGrid.SelectField = SelectField;

}(jsGrid, jQuery));



(function(jsGrid, $, undefined) {

    var Field = jsGrid.Field;

    function TextField(config) {
        Field.call(this, config);
    }

    TextField.prototype = new Field({

        autosearch: true,
		readOnly: false,

        filterTemplate: function() {
            if(!this.filtering)
                return "";

            var grid = this._grid,
                $result = this.filterControl = this._createTextBox();

            if(this.autosearch) {
                $result.on("keypress", function(e) {
                    if(e.which === 13) {
                        grid.search();
                        e.preventDefault();
                    }
                });
            }

            return $result;
        },

        insertTemplate: function() {
            if(!this.inserting)
                return "";

            return this.insertControl = this._createTextBox();
        },

        editTemplate: function(value) {
            if(!this.editing)
                return this.itemTemplate.apply(this, arguments);

            var $result = this.editControl = this._createTextBox();
            $result.val(value);
            return $result;
        },

        filterValue: function() {
            return this.filterControl.val();
        },

        insertValue: function() {
            return this.insertControl.val();
        },

        editValue: function() {
            return this.editControl.val();
        },

        _createTextBox: function() {
            return $("<input>").attr("type", "text")
                .prop("readonly", !!this.readOnly);
        }
    });

    jsGrid.fields.text = jsGrid.TextField = TextField;

}(jsGrid, jQuery));




(function(jsGrid, $, undefined) {

    var TextField = jsGrid.TextField;

    function TextAreaField(config) {
        TextField.call(this, config);
    }

    TextAreaField.prototype = new TextField({

        insertTemplate: function() {
            if(!this.inserting)
                return "";

            return this.insertControl = this._createTextArea();
        },

        editTemplate: function(value) {
            if(!this.editing)
                return this.itemTemplate.apply(this, arguments);

            var $result = this.editControl = this._createTextArea();
            $result.val(value);
            return $result;
        },

        _createTextArea: function() {
            return $("<textarea>").prop("readonly", !!this.readOnly);
        }
    });

    jsGrid.fields.textarea = jsGrid.TextAreaField = TextAreaField;

}(jsGrid, jQuery));



(function(jsGrid, $, undefined) {

    function Field(config) {
        $.extend(true, this, config);
        this.sortingFunc = this._getSortingFunc();
    }

    Field.prototype = {
        name: "",
        title: null,
        css: "",
        align: "",
        width: 100,

        visible: true,
        filtering: true,
        inserting: true,
        editing: true,
        sorting: true,
        sorter: "string", // name of SortStrategy or function to compare elements

        headerTemplate: function() {
            return (this.title === undefined || this.title === null) ? this.name : this.title;
        },

        itemTemplate: function(value, item) {
            return value;
        },

        filterTemplate: function() {
            return "";
        },

        insertTemplate: function() {
            return "";
        },

        editTemplate: function(value, item) {
            this._value = value;
            return this.itemTemplate(value, item);
        },

        filterValue: function() {
            return "";
        },

        insertValue: function() {
            return "";
        },

        editValue: function() {
            return this._value;
        },

        _getSortingFunc: function() {
            var sorter = this.sorter;

            if($.isFunction(sorter)) {
                return sorter;
            }

            if(typeof sorter === "string") {
                return jsGrid.sortStrategies[sorter];
            }

            throw Error("wrong sorter for the field \"" + this.name + "\"!");
        }
    };

    jsGrid.Field = Field;

}(jsGrid, jQuery));


