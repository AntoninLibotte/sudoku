(function () {

    /////
    // Defaults
    /////

    const DEFAULT_VALUES = [
        { column: 1, row: 1, value: 5 },
        { column: 2, row: 1, value: 3 },
        { column: 5, row: 1, value: 7 },
        { column: 1, row: 2, value: 6 },
        { column: 4, row: 2, value: 1 },
        { column: 5, row: 2, value: 9 },
        { column: 6, row: 2, value: 5 },
        { column: 2, row: 3, value: 9 },
        { column: 3, row: 3, value: 8 },
        { column: 8, row: 3, value: 6 },
        { column: 1, row: 4, value: 8 },
        { column: 5, row: 4, value: 6 },
        { column: 9, row: 4, value: 3 },
        { column: 1, row: 5, value: 4 },
        { column: 4, row: 5, value: 8 },
        { column: 6, row: 5, value: 3 },
        { column: 9, row: 5, value: 1 },
        { column: 1, row: 6, value: 7 },
        { column: 5, row: 6, value: 2 },
        { column: 9, row: 6, value: 6 },
        { column: 2, row: 7, value: 6 },
        { column: 7, row: 7, value: 2 },
        { column: 8, row: 7, value: 8 },
        { column: 4, row: 8, value: 4 },
        { column: 5, row: 8, value: 1 },
        { column: 6, row: 8, value: 9 },
        { column: 9, row: 8, value: 5 },
        { column: 5, row: 9, value: 8 },
        { column: 8, row: 9, value: 7 },
        { column: 9, row: 9, value: 9 },
    ];



    /////
    // Globals
    /////

    const SUDOKU = document.querySelector('[data-sudoku]');
    const SUDOKU_TABLE = SUDOKU.querySelector('[data-sudoku-table]');
    const SUDOKU_TEMPLATE_ROW = SUDOKU.querySelector('[data-sudoku-template="row"]');
    const SUDOKU_TEMPLATE_CELL = SUDOKU.querySelector('[data-sudoku-template="cell"]');

    const SUDOKU_COLUMNS = 9;
    const SUDOKU_ROWS = 9;
    const SUDOKU_MAX_VALUE = 9;



    /////
    // Init
    /////

    function init() {
        buildTable();
        styleTableAreasEdges();

        fillTable(DEFAULT_VALUES);

        createEventsListeners();
    }

    init();



    /////
    // Setup
    /////

    function buildTable() {
        for (let rowIndex = 1; rowIndex <= SUDOKU_ROWS; rowIndex++) {
            const rowClone = document.importNode(SUDOKU_TEMPLATE_ROW.content, true);
            SUDOKU_TABLE.appendChild(rowClone);
            const newRow = SUDOKU_TABLE.lastElementChild;

            for (let columnIndex = 1; columnIndex <= SUDOKU_COLUMNS; columnIndex++) {
                const cellClone = document.importNode(SUDOKU_TEMPLATE_CELL.content, true);

                newRow.appendChild(cellClone);
                const newCell = newRow.lastElementChild;

                const sudokuCell = newCell.querySelector('[data-sudoku-cell]');
                setCellRow(sudokuCell, rowIndex);
                setCellColumn(sudokuCell, columnIndex);

                //Create areas as 3x3 squares, would need to replace this logic for other kinds of sudokus
                sudokuCell.dataset.sudokuCellArea = Math.ceil(columnIndex / 3) + ((Math.ceil(rowIndex / 3) - 1) * 3);
            }
        }
    }

    function styleTableAreasEdges() {
        SUDOKU_TABLE.querySelectorAll('[data-sudoku-cell]').forEach(cell => {
            //Automatically detect areas' edges and style them, thus will work with any type of areas
            let cellColumn = Number(getCellColumn(cell));
            let cellRow = Number(getCellRow(cell));
            let cellArea = getCellArea(cell);

            //Check left
            if (getCellFromCoordinates({ column: cellColumn - 1, row: cellRow })?.dataset.sudokuCellArea !== cellArea) {
                cell.classList.add('edge-left');
            }
            //Check right
            if (getCellFromCoordinates({ column: cellColumn + 1, row: cellRow })?.dataset.sudokuCellArea !== cellArea) {
                cell.classList.add('edge-right');
            }
            //Check top
            if (getCellFromCoordinates({ column: cellColumn, row: cellRow - 1 })?.dataset.sudokuCellArea !== cellArea) {
                cell.classList.add('edge-top');
            }
            //Check bottom
            if (getCellFromCoordinates({ column: cellColumn, row: cellRow + 1 })?.dataset.sudokuCellArea !== cellArea) {
                cell.classList.add('edge-bottom');
            }
        });
    }

    function fillTable(entries) {
        entries.forEach(entry => {
            const cell = getCellFromCoordinates({ column: entry.column, row: entry.row });
            cell.value = entry.value;
            cell.setAttribute('readonly', true);
            cell.classList.add('prefilled');
        });
    }

    function createEventsListeners() {
        SUDOKU.addEventListener('focusin', handleFocusin);
        SUDOKU.addEventListener('focusout', handleFocusout);
        SUDOKU.addEventListener('input', handleInput);
        SUDOKU.addEventListener('keydown', handleKeydown);
        SUDOKU.addEventListener('click', handleClick);
    }



    /////
    // Destroy
    /////

    function destroy() {
        destroyTable();
        destroyEventsListeners();
    }

    function destroyTable() {
        SUDOKU_TABLE.innerHTML = '';
    }

    function destroyEventsListeners() {
        SUDOKU.removeEventListener('focusin', handleFocusin);
        SUDOKU.removeEventListener('focusout', handleFocusout);
        SUDOKU.removeEventListener('input', handleInput);
        SUDOKU.removeEventListener('keydown', handleKeydown);
        SUDOKU.removeEventListener('click', handleClick);
    }

    

    /////
    // Events
    /////

    function handleFocusin(event) {
        const element = event.target;

        if (element.matches('[data-sudoku-cell]')) {
            handleConflictsFromCell(element);
            highlightCellsFromCellCoordinates('focus', element);
        }
    }

    function handleFocusout(event) {
        const element = event.target;

        if (element.matches('[data-sudoku-cell]')) {
            clearConflicts();
            clearHighlightedCells('focus');
        }
    }

    function handleInput(event) {
        const element = event.target;

        if (element.matches('[data-sudoku-cell]')) {
            formatCell(element);

            handleGuessing(element);

            clearConflicts();
            handleConflictsFromCell(element);
        }
    }

    function handleKeydown(event) {
        const element = event.target;
        const key = event.key;

        if (element.matches('[data-sudoku-cell]')) {
            if (key === 'Enter') {
                const cellColumn = getCellColumn(element);
                const cellRow = getCellRow(element);

                let nextFocus;
                //If shift key is also pressed, go backward
                if (event.shiftKey) {
                    nextFocus = getCellFromCoordinates({ column: cellColumn, row: Number(cellRow) - 1 }) || getCellFromCoordinates({ column: Number(cellColumn) - 1, row: SUDOKU_ROWS });
                } else {
                    nextFocus = getCellFromCoordinates({ column: cellColumn, row: Number(cellRow) + 1 }) || getCellFromCoordinates({ column: Number(cellColumn) + 1, row: 1 });
                }
                nextFocus?.focus();
            }
        }
    }

    function handleClick(event) {
        const element = event.target;

        if (element.dataset.sudokuButton === 'refresh') {
            refresh();
        } else if (element.dataset.sudokuButton === 'verify') {
            verify();
        }
    }



    /////
    // CELLS
    /////

    /* Properties setters */
    
    function setCellCoordinate(cell, coordinate, value) {
        cell.setAttribute(`data-sudoku-cell-${coordinate}`, value);
    }

    function setCellRow(cell, value) {
        setCellCoordinate(cell, 'row', value);
    }

    function setCellColumn(cell, value) {
        setCellCoordinate(cell, 'column', value);
    }

    function setCellArea(cell, value) {
        setCellCoordinate(cell, 'area', value);
    }

    /* Properties getters */

    function getCellCoordinate(cell, coordinate) {
        return cell.getAttribute(`data-sudoku-cell-${coordinate}`);
    }

    function getCellRow(cell) {
        return getCellCoordinate(cell, 'row');
    }

    function getCellColumn(cell) {
        return getCellCoordinate(cell, 'column');
    }

    function getCellArea(cell) {
        return getCellCoordinate(cell, 'area');
    }

    /* Getters */

    function getCellsFromCoordinate(coordinate, value) {
        return SUDOKU_TABLE.querySelectorAll(`[data-sudoku-cell-${coordinate}="${value}"]`)
    }

    function getCellsFromCoordinates(coordinates = { row, column, area }, isCrossSearch = false) {
        const queryStringArray = [];
        coordinates.column !== undefined && queryStringArray.push(`[data-sudoku-cell-column="${coordinates.column}"]`);
        coordinates.row !== undefined && queryStringArray.push(`[data-sudoku-cell-row="${coordinates.row}"]`);
        coordinates.area !== undefined && queryStringArray.push(`[data-sudoku-cell-area="${coordinates.area}"]`);
        return SUDOKU_TABLE.querySelectorAll(queryStringArray.join(isCrossSearch ? '' : ','));
    }

    function getCellFromCoordinates(coordinates = { row, column }) {
        return getCellsFromCoordinates(coordinates, true)[0];
    }

    /* Getters from other cell */

    function getCellsFromCellCoordinate(cell, coordinate) {
        return getCellsFromCoordinate(coordinate, getCellCoordinate(cell, coordinate));
    }

    function getCellsFromCellCoordinates(cell) {
        return getCellsFromCoordinates({ row: getCellRow(cell), column: getCellColumn(cell), area: getCellArea(cell) });
    }

    /* Helpers */

    function formatCell(cell) {
        cell.value = cell.value.replace(/[\D]/g, '');
    }



    /////
    // Highlights
    /////

    function highlightCellsFromCoordinate(highlightType, coordinate, value) {
        getCellsFromCoordinate(coordinate, value).forEach(cell => {
            cell.classList.add(`js-highlighted-${highlightType}-${coordinate}`);
            cell.classList.add(`js-highlighted-${highlightType}`);
        });
    }

    function highlightCellsFromCellCoordinates(highlightType, cell) {
        highlightCellsFromCoordinate(highlightType, 'row', getCellRow(cell));
        highlightCellsFromCoordinate(highlightType, 'column', getCellColumn(cell));
        highlightCellsFromCoordinate(highlightType, 'area', getCellArea(cell));
    }

    function clearHighlightedCells(highlightType) {
        SUDOKU_TABLE.querySelectorAll(`.js-highlighted-${highlightType}`).forEach(cell => {
            cell.classList.remove(`js-highlighted-${highlightType}-row`);
            cell.classList.remove(`js-highlighted-${highlightType}-column`);
            cell.classList.remove(`js-highlighted-${highlightType}-area`);
            cell.classList.remove(`js-highlighted-${highlightType}`);
        })
    }



    /////
    // Conflicts
    /////

    function getConflictCellsFromCell(cell) {
        return [...getCellsFromCellCoordinates(cell)].filter(relatedCell => {
            if (relatedCell === cell) return false;
            if (!relatedCell.value) return false;
            if (checkGuessing(relatedCell.value)) return false;
            if (relatedCell.value === cell.value) return true;
            return false;
        });
    }

    function handleConflictsFromCell(cell) {
        const conflictCells = getConflictCellsFromCell(cell);
        conflictCells.forEach(conflictCell => {
            conflictCell.classList.add('js-conflict');
        });

        if (conflictCells.length > 0) cell.classList.add('js-conflict');
    }

    function hasCellConflicts(cell) {
        return getConflictCellsFromCell(cell).length > 0;
    }

    function clearConflicts() {
        SUDOKU_TABLE.querySelectorAll('.js-conflict').forEach(cell => {
            cell.classList.remove('js-conflict');
        })
    }



    /////
    // Guessing
    /////

    function checkGuessing(value) {
        const numberValue = value ? Number(value) : null;
        return !(numberValue !== null && numberValue >= 1 && numberValue <= SUDOKU_MAX_VALUE);
    }

    function handleGuessing(cell) {
        const value = cell.value;

        //Detect if should be considered as answer (1-9 for basic sudoku) or guess
        if (!checkGuessing(value)) {
            cell.classList.remove('js-guessing');
        } else {
            cell.classList.add('js-guessing');
        }
    }
    
    

    /////
    // Sudoku actions
    /////

    function refresh() {
        destroy();
        init();
    }

    function verify() {
        let emptiesNumber = 0;
        let guessingsNumber = 0;
        let conflictsNumber = 0;
        SUDOKU_TABLE.querySelectorAll('[data-sudoku-cell]').forEach(cell => {
            if (!cell.value) emptiesNumber++;
            if (cell.value && checkGuessing(cell.value)) guessingsNumber++;
            if (hasCellConflicts(cell)) conflictsNumber++;
        });

        if (emptiesNumber || guessingsNumber || conflictsNumber) {
            alert(
                'Sudoku verification failed with:'
                + `\n- ${emptiesNumber} empty cells`
                + `\n- ${guessingsNumber} 'guessing' cells`
                + `\n- ${conflictsNumber} conflicts.`
            )
        } else {
            alert('Sudoku completed!');
        }
    }
})();