# sudoku
A basic sudoku demo in JavaScript.

## About personal projects...
*I put my old personal projects on GitHub for archiving and memories. I like to see what I did in the past, how I did it, and how much I learned since then. Sometimes, I can also learn new things by looking back at old stuff and thinking about it.*

## About this project
This is a newer version of an old project I made when learning web development. The old project was written in jQuery, so I rewrote it in plain JavaScript, 'for the fun'. I also improved it a bit.

Keep in mind that this is still a very basic demo. It has no specific purpose, and I don't plan to make anything out of it. It's just something I made when I was bored!

**The old jQuery project can be found [here](https://github.com/AntoninLibotte/sudoku-jquery).**

## Features
- Highlights the column, row and area (slightly) of the selected cell;
- Displays the conflicts of the selected cell;
- Allows to write 'guesses' (multiple digits) in a cell:
  - They are displayed in a smaller font size;
  - They are not used when checking for conflicts;
- 'Verify' button which starts an automatic validation of the grid (it would work with any grid, the results are not encoded);
- **Improvements over old project:**
  - Initialization:
    - The grid is not hardcoded, but generated from templates;
    - There is a grid loader in the code (the default grid is loaded with it);
  - There is a function to destroy the sudoku, and the 'Reset' button does a real reset (no more page reload);
  - Validation system:
    - It doesn't simulate user interactions anymore;
    - When a grid is invalid, it tells the number of empty cells, 'guesses' cells, and conflicts;
  - `Enter` key (and `Shift + Enter` combination) can be pressed for vertical navigation (horizontal navigation was already handled with `Tab` by the browser);
  - Non-9x9 grids could theoretically be supported with 'minimal' effort;
  - Non-square (even non-rectangle) areas are theoretically supported, they would just need their own code in the builder to define them (after that, the styling of the grid would display the areas properly, and they would work as intended). 

## Limitations
- No UI to import a different grid;
- Non-9x9 grids and non-square areas are still not 'fully' implemented ('full' implementation would mean having the ability to specify those properties when importing a grid).
