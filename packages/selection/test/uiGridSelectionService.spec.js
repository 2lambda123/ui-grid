describe('ui.grid.selection uiGridSelectionService', function() {
	var uiGridSelectionService,
		gridClassFactory,
		grid,
		$rootScope,
		$scope;

	beforeEach(module('ui.grid.selection'));

	beforeEach(inject(function(_uiGridSelectionService_, _gridClassFactory_, $templateCache, _uiGridSelectionConstants_,
		_$rootScope_) {
		uiGridSelectionService = _uiGridSelectionService_;
		gridClassFactory = _gridClassFactory_;
		$rootScope = _$rootScope_;
		$scope = $rootScope.$new();

		$templateCache.put('ui-grid/uiGridCell', '<div/>');
		$templateCache.put('ui-grid/editableCell', '<div editable_cell_directive></div>');

		grid = gridClassFactory.createGrid({showGridFooter: true});
		grid.options.columnDefs = [
			{field: 'col1', enableCellEdit: true}
		];

		uiGridSelectionService.initializeGrid(grid);
		var data = [];
		for (var i = 0; i < 10; i++) {
			data.push({col1: 'a_' + i});
		}
		grid.options.data = data;

		grid.buildColumns();
		grid.modifyRows(grid.options.data);
	}));

	describe('selection events', function() {
		var selectionEvents;

		beforeEach(function() {
			spyOn(grid.api, 'registerEventsFromObject').and.callFake(function(events) {
				selectionEvents = events;
			});
			uiGridSelectionService.initializeGrid(grid);
		});
		afterEach(function() {
			grid.api.registerEventsFromObject.calls.reset();
		});
		it('should define a rowFocusChanged event', function() {
			expect(angular.isFunction(selectionEvents.selection.rowFocusChanged)).toBe(true);
			expect(selectionEvents.selection.rowFocusChanged()).toBeUndefined();
		});
		it('should define a rowSelectionChanged event', function() {
			expect(angular.isFunction(selectionEvents.selection.rowSelectionChanged)).toBe(true);
			expect(selectionEvents.selection.rowSelectionChanged()).toBeUndefined();
		});
		it('should define a rowSelectionChangedBatch event', function() {
			expect(angular.isFunction(selectionEvents.selection.rowSelectionChangedBatch)).toBe(true);
			expect(selectionEvents.selection.rowSelectionChangedBatch()).toBeUndefined();
		});
	});

	describe('toggleSelection function', function() {
		it('should toggle selected with multiselect', function() {
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true);
			expect(grid.rows[0].isSelected).toBe(true);

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true);
			expect(grid.rows[0].isSelected).toBe(false);
		});

		it('should toggle selected without multiselect', function() {
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, false);
			expect(grid.rows[0].isSelected).toBe(true);

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, false);
			expect(grid.rows[0].isSelected).toBe(false);
			expect(grid.rows[1].isSelected).toBe(true);
		});

		it('should toggle selected with invisible rows using default', function() {
			grid.rows[0].visible = true;
			grid.rows[1].visible = false;

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true, false);
			expect(grid.rows[0].isSelected).toBe(true);
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, true, false);
			expect(grid.rows[1].isSelected).toBe(true);

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true, false);
			expect(grid.rows[0].isSelected).toBe(false);
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, true, false);
			expect(grid.rows[1].isSelected).toBe(false);
		});

		it('should toggle selected with invisible rows but not using default', function() {
			grid.rows[0].visible = true;
			grid.rows[1].visible = false;

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true, false, true);
			expect(grid.rows[0].isSelected).toBe(true);
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, true, false, true);
			expect(grid.rows[1].isSelected).toBe(true);

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true, false, true);
			expect(grid.rows[0].isSelected).toBe(false);
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, true, false, true);
			expect(grid.rows[1].isSelected).toBe(false);
		});

		it('should toggle selected with visible rows', function() {
			grid.rows[0].visible = true;
			grid.rows[1].visible = false;
			grid.rows[2].visible = false;
			grid.rows[2].isSelected = true;

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true, false, false);
			expect(grid.rows[0].isSelected).toBe(true);
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, true, false, false);
			expect(grid.rows[1].isSelected).toBe(false);

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true, false, false);
			expect(grid.rows[0].isSelected).toBe(false);

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[2], null, true, false, false);
			expect(grid.rows[2].isSelected).toBe(true);
		});

		it('should not toggle selected with enableSelection: false', function() {
			grid.rows[0].enableSelection = false;
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true);
			expect(grid.rows[0].isSelected).toBe(false);
		});

		it('should toggle selected with noUnselect', function() {
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, false, true);
			expect(grid.rows[0].isSelected).toBe(true, 'row should be selected, noUnselect doesn\'t stop rows being selected');

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, false, true);
			expect(grid.rows[0].isSelected).toBe(true, 'row should still be selected, noUnselect prevents unselect');

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, false, true);
			expect(grid.rows[0].isSelected).toBe(false, 'row should not be selected, noUnselect doesn\'t stop other rows being selected');
			expect(grid.rows[1].isSelected).toBe(true, 'new row should be selected');
		});

		it('should remain selected', function() {
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true);
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, true);
			expect(grid.rows[0].isSelected).toBe(true);
			expect(grid.rows[1].isSelected).toBe(true);

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, false);
			expect(grid.rows[0].isSelected).toBe(false, 'row should not be selected, last row selection was not a multiselect selection');
			expect(grid.rows[1].isSelected).toBe(true, 'row should be selected, multiple rows was selected before the selection');
		});

		it('should clear selected', function() {
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0]);
			expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(1);
			uiGridSelectionService.clearSelectedRows(grid);
			expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(0);
		});

		it('should update selectedCount', function() {
			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0]);
			expect(grid.api.selection.getSelectedCount()).toBe(1);
			uiGridSelectionService.clearSelectedRows(grid);
			expect(grid.api.selection.getSelectedCount()).toBe(0);
		});

		it('should utilize public apis', function() {
			grid.api.selection.toggleRowSelection(grid.rows[0].entity);
			expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(1);
			expect(uiGridSelectionService.getUnSelectedRows(grid).length).toBe(9);
			grid.api.selection.clearSelectedRows();
			expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(0);
			expect(uiGridSelectionService.getUnSelectedRows(grid).length).toBe(10);
		});
	});

	describe('shiftSelect function', function() {
		beforeEach(function() {
			grid.setVisibleRows(grid.rows);
		});

		it('should select rows in between using shift key', function() {
			grid.api.selection.toggleRowSelection(grid.rows[2].entity);
			uiGridSelectionService.shiftSelect(grid, grid.rows[5], null, true);
			expect(grid.rows[2].isSelected).toBe(true);
			expect(grid.rows[3].isSelected).toBe(true);
			expect(grid.rows[4].isSelected).toBe(true);
			expect(grid.rows[5].isSelected).toBe(true);
			expect(grid.selection.selectedCount).toBe(4);
		});

		it('should skip non-selectable rows', function() {
			grid.rows[4].enableSelection = false;
			grid.api.selection.toggleRowSelection(grid.rows[2].entity);
			uiGridSelectionService.shiftSelect(grid, grid.rows[5], null, true);
			expect(grid.rows[2].isSelected).toBe(true);
			expect(grid.rows[3].isSelected).toBe(true);
			expect(grid.rows[4].isSelected).toBe(false);
			expect(grid.rows[5].isSelected).toBe(true);
		});

		it('should reverse selection order if from is bigger then to', function() {
			grid.api.selection.toggleRowSelection(grid.rows[5].entity);
			uiGridSelectionService.shiftSelect(grid, grid.rows[2], null, true);
			expect(grid.rows[2].isSelected).toBe(true);
			expect(grid.rows[3].isSelected).toBe(true);
			expect(grid.rows[4].isSelected).toBe(true);
			expect(grid.rows[5].isSelected).toBe(true);
		});

		it('should return if multiSelect is false', function() {
			uiGridSelectionService.shiftSelect(grid, grid.rows[2], null, false);
			expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(0);
		});
	});

	describe('selectRow and unselectRow functions', function() {
		it('select then unselect rows, including selecting rows already selected and unselecting rows not selected', function() {
			grid.api.selection.selectRow(grid.rows[4].entity);
			expect(grid.rows[4].isSelected).toBe(true);

			grid.api.selection.selectRow(grid.rows[6].entity);
			expect(grid.rows[4].isSelected).toBe(true);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.api.selection.selectRow(grid.rows[4].entity);
			expect(grid.rows[4].isSelected).toBe(true);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.api.selection.unSelectRow(grid.rows[4].entity);
			expect(grid.rows[4].isSelected).toBe(false);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.api.selection.unSelectRow(grid.rows[4].entity);
			expect(grid.rows[4].isSelected).toBe(false);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.api.selection.unSelectRow(grid.rows[6].entity);
			expect(grid.rows[4].isSelected).toBe(false);
			expect(grid.rows[6].isSelected).toBe(false);

			grid.rows[4].enableSelection = false;
			grid.api.selection.selectRow(grid.rows[4].entity);
			expect(grid.rows[4].isSelected).toBe(false);
		});

		it('select by key then unselect rows by key in entity, including selecting rows already selected and unselecting rows not selected', function() {
			grid.rows[4].entity = {str: 'abc'};
			grid.rows[6].entity = {str: 'def'};
			grid.api.selection.selectRowByKey(true, "str", "abc");
			expect(grid.rows[4].isSelected).toBe(true);

			grid.api.selection.selectRowByKey(true, "str", "def");
			expect(grid.rows[4].isSelected).toBe(true);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.api.selection.selectRowByKey(true, "str", "abc");
			expect(grid.rows[4].isSelected).toBe(true);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.api.selection.unSelectRowByKey(true, "str", "abc");
			expect(grid.rows[4].isSelected).toBe(false);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.api.selection.unSelectRowByKey(true, "str", "abc");
			expect(grid.rows[4].isSelected).toBe(false);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.api.selection.unSelectRowByKey(true, "str", "def");
			expect(grid.rows[4].isSelected).toBe(false);
			expect(grid.rows[6].isSelected).toBe(false);

			grid.rows[4].enableSelection = false;
			grid.api.selection.selectRowByKey(true, "str", "abc");
			expect(grid.rows[4].isSelected).toBe(false);
		});

		it('select by key then unselect rows by key outside entity, including selecting rows already selected and unselecting rows not selected', function() {
			grid.rows[4].str = 'abc';
			grid.rows[6].str = 'def';

			grid.api.selection.selectRowByKey(false, "str", "abc");
			expect(grid.rows[4].isSelected).toBe(true);

			grid.api.selection.selectRowByKey(false, "str", "def");
			expect(grid.rows[4].isSelected).toBe(true);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.api.selection.selectRowByKey(false, "str", "abc");
			expect(grid.rows[4].isSelected).toBe(true);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.api.selection.unSelectRowByKey(false, "str", "abc");
			expect(grid.rows[4].isSelected).toBe(false);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.api.selection.unSelectRowByKey(false, "str", "abc");
			expect(grid.rows[4].isSelected).toBe(false);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.api.selection.unSelectRowByKey(false, "str", "def");
			expect(grid.rows[4].isSelected).toBe(false);
			expect(grid.rows[6].isSelected).toBe(false);

			grid.rows[4].enableSelection = false;
			grid.api.selection.selectRowByKey(false, "str", "abc");
			expect(grid.rows[4].isSelected).toBe(false);
		});
	});

	describe('setSelected function', function() {
		it('select row and check the selected count is correct', function() {
			expect(grid.selection.selectedCount).toBe(0);

			grid.rows[0].setSelected(true);
			expect(grid.rows[0].isSelected).toBe(true);
			expect(grid.selection.selectedCount).toBe(1);

			// the second setSelected(true) should have no effect
			grid.rows[0].setSelected(true);
			expect(grid.rows[0].isSelected).toBe(true);
			expect(grid.selection.selectedCount).toBe(1);

			grid.rows[0].setSelected(false);
			expect(grid.rows[0].isSelected).toBe(false);
			expect(grid.selection.selectedCount).toBe(0);
		});
	});

	describe('setFocused function', function() {
		beforeEach(function() {
			grid.rows[0].isFocused = false;
		});
		it('should update the focusedRow value of a row to null if it is different than the current one', function() {
			grid.rows[0].isFocused = true;
			grid.rows[0].setFocused(false);

			expect(grid.rows[0].grid.selection.focusedRow).toEqual(null);
			expect(grid.rows[0].isFocused).toBe(false);
		});
		it('should update the isFocused value of a row if it is different than the current one', function() {
			grid.rows[0].setFocused(true);

			expect(grid.rows[0].grid.selection.focusedRow).toEqual(grid.rows[0]);
			expect(grid.rows[0].isFocused).toBe(true);
		});
		it('should do nothing the current isFocused value is the same as the previous', function() {
			grid.rows[0].setFocused(false);

			expect(grid.rows[0].isFocused).toBe(false);
		});
	});

	describe('selectAllRows and clearSelectedRows functions', function() {
		it('should select all rows, and select all rows when already all selected, then unselect again', function() {
			grid.api.selection.selectRow(grid.rows[4].entity);
			expect(grid.rows[4].isSelected).toBe(true);
			expect(grid.selection.selectAll).toBe(false);

			grid.api.selection.selectRow(grid.rows[6].entity);
			expect(grid.rows[4].isSelected).toBe(true);
			expect(grid.rows[6].isSelected).toBe(true);
			expect(grid.selection.selectAll).toBe(false);

			grid.api.selection.selectAllRows();
			for (var i = 0; i < 10; i++) {
				expect(grid.rows[i].isSelected).toBe(true);
			}
			expect(grid.selection.selectAll).toBe(true);

			grid.api.selection.selectAllRows();
			for (i = 0; i < 10; i++) {
				expect(grid.rows[i].isSelected).toBe(true);
			}
			expect(grid.selection.selectAll).toBe(true);

			grid.api.selection.clearSelectedRows();
			for (i = 0; i < 10; i++) {
				expect(grid.rows[i].isSelected).toBe(false);
			}
			expect(grid.selection.selectAll).toBe(false);

			grid.options.isRowSelectable = function(row) {
				return row.isRowSelectable !== false;
			};

			grid.rows[6].isRowSelectable = false;
			grid.rows[8].enableSelection = false;
			grid.api.selection.selectAllRows();
			expect(grid.rows[6].isSelected).toBe(false);
			expect(grid.rows[7].isSelected).toBe(true);
			expect(grid.rows[8].isSelected).toBe(false);
		});
	});

	describe('toggle selected clears selectAll', function() {
		it('should select all rows, toggle selection for one row removes selectAll', function() {
			grid.api.selection.selectAllRows();
			for (var i = 0; i < 10; i++) {
				expect(grid.rows[i].isSelected).toBe(true);
			}
			expect(grid.selection.selectAll).toBe(true);

			uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], false);
			expect(grid.selection.selectAll).toBe(false);
		});
	});

	describe('selectAllVisibleRows function', function() {
		it('should select all visible and selectable rows', function() {
			grid.api.selection.selectRow(grid.rows[4].entity);
			expect(grid.rows[4].isSelected).toBe(true);

			grid.api.selection.selectRow(grid.rows[6].entity);
			expect(grid.rows[4].isSelected).toBe(true);
			expect(grid.rows[6].isSelected).toBe(true);

			grid.options.isRowSelectable = function(row) {
				return row.isRowSelectable !== false;
			};
			grid.rows[3].visible = true;
			grid.rows[4].visible = true;
			grid.rows[6].visible = false;
			grid.rows[7].visible = true;
			grid.rows[7].isRowSelectable = false;
			grid.rows[8].enableSelection = false;
			grid.rows[9].visible = true;
			expect(grid.selection.selectAll).toBe(false);

			grid.api.selection.selectAllVisibleRows();
			expect(grid.rows[3].isSelected).toBe(true);
			expect(grid.rows[4].isSelected).toBe(true);
			expect(grid.rows[6].isSelected).toBe(false);
			expect(grid.rows[7].isSelected).toBe(false);
			expect(grid.rows[8].isSelected).toBe(false);
			expect(grid.rows[9].isSelected).toBe(true);
			expect(grid.selection.selectAll).toBe(true);
			expect(grid.selection.selectedCount).toBe(7);
		});
	});

	describe('selectRowByVisibleIndex function', function() {
		it('should select specified row', function() {
			grid.rows[1].visible = false;
			grid.setVisibleRows(grid.rows);

			grid.api.selection.selectRowByVisibleIndex(0);
			expect(grid.rows[0].isSelected).toBe(true);

			grid.api.selection.selectRowByVisibleIndex(1);
			expect(grid.rows[2].isSelected).toBe(true);

			grid.rows[3].enableSelection = false;
			grid.api.selection.selectRowByVisibleIndex(2);
			expect(grid.rows[3].isSelected).toBe(false);
		});
	});

	describe('unSelectRowByVisibleIndex function', function() {
		it('should unselect specified row', function() {
			grid.rows[1].visible = false;
			grid.setVisibleRows(grid.rows);

			grid.rows[0].isSelected = true;
			grid.api.selection.unSelectRowByVisibleIndex(0);
			expect(grid.rows[0].isSelected).toBe(false);

			grid.rows[2].isSelected = true;
			grid.api.selection.unSelectRowByVisibleIndex(1);
			expect(grid.rows[2].isSelected).toBe(false);

			grid.rows[3].isSelected = false;
			grid.rows[3].enableSelection = false;
			grid.api.selection.unSelectRowByVisibleIndex(2);
			expect(grid.rows[3].isSelected).toBe(false);
		});
	});

	describe('getSelectedRows function', function() {
		it('should retrieve empty array if nothing selected', function() {
			expect(grid.api.selection.getSelectedRows().length).toBe(0);
			expect(grid.api.selection.getSelectedGridRows().length).toBe(0);
		});

		it('should retrieve the selected rows that have a $$hashKey property', function() {
			grid.rows.forEach(function(row) {
				row.isSelected = false;
			});

			grid.rows[0].isSelected = true;
			grid.rows[0].entity = {
				$$hashKey: '1234'
			};

			grid.rows[1].isSelected = true;
			grid.rows[1].entity = {};

			grid.rows[2].isSelected = true;
			grid.rows[2].entity = {
				$$hashKey: '5678'
			};

			expect(grid.api.selection.getSelectedRows().length).toEqual(2);
			expect(grid.api.selection.getSelectedGridRows().length).toEqual(3);
		});

		it('should retrieve correct data', function() {
			grid.rows[0].isSelected = true;
			grid.rows[0].entity = {
				$$hashKey: '1234'
			};

			expect(grid.api.selection.getSelectedRows()[0].$$hashKey).toEqual('1234');
			expect(grid.api.selection.getSelectedGridRows()[0].entity).toEqual({
				$$hashKey: '1234'
			});
		});
	});

	describe('getUnSelectedRows function', function() {
		it('should retrieve every row if nothing selected', function() {
			expect(grid.api.selection.getUnSelectedRows().length).toEqual(10);
			expect(grid.api.selection.getUnSelectedGridRows().length).toEqual(10);
		});

		it('should retrieve the unselected rows that have a $$hashKey property', function() {
			grid.rows.forEach(function(row) {
				row.isSelected = false;
				row.entity = {
					$$hashKey: '1234'
				};
			});

			grid.rows[0].isSelected = true;
			grid.rows[1].isSelected = true;
			grid.rows[2].isSelected = true;
			grid.rows[2].entity = {};
			grid.rows[3].entity = {};

			expect(grid.api.selection.getUnSelectedRows().length).toEqual(6);
			expect(grid.api.selection.getUnSelectedGridRows().length).toEqual(7);
		});

		it('should retrieve correct data', function() {
			grid.rows[0].isSelected = false;
			grid.rows[0].entity = {
				$$hashKey: '1234'
			};

			expect(grid.api.selection.getUnSelectedRows()[0].$$hashKey).toEqual('1234');
			expect(grid.api.selection.getUnSelectedGridRows()[0].entity).toEqual({
				$$hashKey: '1234'
			});
		});
	});

	describe('setMultiSelect function', function() {
		it('should update the value of grid.options.multiSelect', function() {
			grid.options.multiSelect = false;
			grid.api.selection.setMultiSelect(true);

			expect(grid.options.multiSelect).toBe(true);
		});
	});

	describe('setModifierKeysToMultiSelect function', function() {
		it('should update the value of grid.options.modifierKeysToMultiSelect', function() {
			grid.options.modifierKeysToMultiSelect = false;
			grid.api.selection.setModifierKeysToMultiSelect(true);

			expect(grid.options.modifierKeysToMultiSelect).toBe(true);
		});
	});

	describe('getSelectAllState function', function() {
		it('should retrieve the value of grid.selection.selectAll', function() {
			expect(grid.api.selection.getSelectAllState()).toBe(grid.selection.selectAll);
		});
	});

	describe('selectionChanged events', function() {
		var selectionFunctions = {},
			singleCalls,
			batchCalls;

		beforeEach(function() {
			grid.options.multiSelect = true;

			// can't use spy as the callback hits the function directly
			singleCalls = [];
			batchCalls = [];

			// row 5 isn't visible
			// row 6 is already selected
			// row 7 isn't visible and is already selected
			grid.rows[5].visible = false;
			grid.rows[7].visible = false;
			grid.api.selection.toggleRowSelection(grid.rows[6].entity);
			grid.api.selection.toggleRowSelection(grid.rows[7].entity);
			selectionFunctions.single = function(row, evt) {
				singleCalls.push({row: row, evt: evt});
			};
			selectionFunctions.batch = function(rows, evt) {
				batchCalls.push({rows: rows, evt: evt});
			};
			grid.api.selection.on.rowSelectionChanged($scope, selectionFunctions.single);
			grid.api.selection.on.rowSelectionChangedBatch($scope, selectionFunctions.batch);
		});

		it('select all rows, when multiSelect is disabled', function() {
			grid.options.multiSelect = false;
			grid.api.selection.selectAllRows();
			expect(singleCalls.length).toEqual(0);
			expect(batchCalls.length).toEqual(0);
		});

		it('select all rows, batch', function() {
			grid.api.selection.selectAllRows();
			expect(singleCalls.length).toEqual(0);
			expect(batchCalls.length).toEqual(1);
			expect(batchCalls[0].rows.length).toEqual(8, "2 rows already selected");
		});

		it('select all rows, not batch', function() {
			grid.options.enableSelectionBatchEvent = false;
			grid.api.selection.selectAllRows();
			expect(singleCalls.length).toEqual(8, "2 rows already selected");
			expect(batchCalls.length).toEqual(0);
		});

		it('select all visible rows, when multiSelect is disabled', function() {
			grid.options.multiSelect = false;
			grid.api.selection.selectAllVisibleRows();
			expect(singleCalls.length).toEqual(0);
			expect(batchCalls.length).toEqual(0);
		});

		it('select all visible rows, batch', function() {
			grid.api.selection.selectAllVisibleRows();
			expect(singleCalls.length).toEqual(0);
			expect(batchCalls.length).toEqual(1);
			expect(batchCalls[0].rows.length).toEqual(8, "8 visible rows, one already selected, one invisible row deselected");
		});

		it('select all visible rows, not batch', function() {
			grid.options.enableSelectionBatchEvent = false;
			grid.api.selection.selectAllVisibleRows();
			expect(singleCalls.length).toEqual(8, "8 visible rows, one already selected, one invisible row deselected");
			expect(batchCalls.length).toEqual(0);
		});

		// not testing toggle - simple
		// not testing shift select - too messy and same logic as others

		it('clear selected rows, batch', function() {
			grid.api.selection.clearSelectedRows();
			expect(singleCalls.length).toEqual(0);
			expect(batchCalls.length).toEqual(1);
			expect(batchCalls[0].rows.length).toEqual(2, "2 selected rows");
		});

		it('clear selected rows, not batch', function() {
			grid.options.enableSelectionBatchEvent = false;
			grid.api.selection.clearSelectedRows();
			expect(singleCalls.length).toEqual(2, "2 selected rows");
			expect(batchCalls.length).toEqual(0);
		});

		it('should pass event object, batch', function() {
			var mockEvent = {currentTarget: 'test clearSelectedRows'};
			grid.setVisibleRows(grid.rows);
			grid.api.selection.clearSelectedRows(mockEvent);
			expect(batchCalls.length).toEqual(1);
			expect(batchCalls[0].evt.currentTarget).toEqual('test clearSelectedRows');
			mockEvent = {currentTarget: 'test shiftSelect'};
			uiGridSelectionService.shiftSelect(grid, grid.rows[3], mockEvent, true);
			expect(batchCalls.length).toEqual(2);
			expect(batchCalls[1].evt.currentTarget).toEqual('test shiftSelect');
			mockEvent = {currentTarget: 'test selectAllRows'};
			grid.api.selection.selectAllRows(mockEvent);
			expect(batchCalls.length).toEqual(3);
			expect(batchCalls[2].evt.currentTarget).toEqual('test selectAllRows');
		});

		it('should pass event object, not batch', function() {
			grid.options.enableSelectionBatchEvent = false;
			var mockEvent = {currentTarget: 'test'};
			grid.api.selection.selectRow(grid.rows[4].entity, mockEvent);
			expect(singleCalls.length).toEqual(1);
			expect(singleCalls[0].evt.currentTarget).toEqual('test');
		});
	});
});
