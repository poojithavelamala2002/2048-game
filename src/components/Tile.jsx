import React from "react";
import "./Tile.css"; // We'll create this file next for tile colors

/**
 * Tile Component
 * ----------------
 * This component is responsible for displaying a single tile
 * in the 2048 grid. Each tile has:
 *  - A number (value)
 *  - A background color based on the value
 *  - An empty space if the value is 0
 */
function Tile({ value }) {
  // We’ll assign a class like 'tile-2', 'tile-4', 'tile-8' etc.
  // If the tile is 0, we’ll show an empty tile (no number)
  return (
    <div className={`tile tile-${value}`}>
      {value !== 0 ? value : ""}
    </div>
  );
}

export default Tile;
