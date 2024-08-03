// Constants for the grid
const gridWidth = 20;
const gridHeight = 20;
const nodeSize = 40;
let mode = 'setStart'; // Default mode
let start, end;

// Create the grid data structure
const grid = Array.from({ length: gridHeight }, (_, y) =>
    Array.from({ length: gridWidth }, (_, x) => ({
        x, y,
        f: 0, g: 0, h: 0,
        neighbors: [],
        previous: undefined,
        wall: false,
        inOpenSet: false,
        inClosedSet: false
    }))
);

// Initialize grid and neighbors
const initializeGrid = () => {
    grid.forEach(row => row.forEach(node => {
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.previous = undefined;
        node.wall = false;
        node.inOpenSet = false;
        node.inClosedSet = false;
        node.path = false;
    }));
    start = undefined;
    end = undefined;
    update();
};

// Add neighbors function
grid.forEach(row => row.forEach(node => {
    const { x, y } = node;
    if (x > 0) node.neighbors.push(grid[y][x - 1]); // Left
    if (x < gridWidth - 1) node.neighbors.push(grid[y][x + 1]); // Right
    if (y > 0) node.neighbors.push(grid[y - 1][x]); // Up
    if (y < gridHeight - 1) node.neighbors.push(grid[y + 1][x]); // Down
}));

// Heuristic function: Manhattan distance
const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// Update all button states to reflect current mode
function updateButtonStates() {
    document.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('active');
    });
    if (mode === 'setStart') {
        document.getElementById('setStart').classList.add('active');
    } else if (mode === 'setEnd') {
        document.getElementById('setEnd').classList.add('active');
    } else if (mode === 'addWalls') {
        document.getElementById('addWalls').classList.add('active');
    }
}

// Event listeners for buttons
document.getElementById('setStart').addEventListener('click', () => {
    mode = 'setStart';
    updateButtonStates();
});
document.getElementById('setEnd').addEventListener('click', () => {
    mode = 'setEnd';
    updateButtonStates();
});
document.getElementById('addWalls').addEventListener('click', () => {
    mode = 'addWalls';
    updateButtonStates();
});
document.getElementById('startAstar').addEventListener('click', () => {
    if (start && end) {
        start.inOpenSet = true;
        astar(start, end);
    }
});
document.getElementById('reset').addEventListener('click', () => {
    initializeGrid();
    mode = 'setStart';
    updateButtonStates(); // Remove active class when reset
});

// D3 visualization setup
const svg = d3.select("svg");
const update = () => {
    svg.selectAll("rect")
        .data(grid.flat(), d => `${d.x}-${d.y}`)
        .join("rect")
        .attr("x", d => d.x * nodeSize)
        .attr("y", d => d.y * nodeSize)
        .attr("width", nodeSize - 1)
        .attr("height", nodeSize - 1)
        .attr("class", d => d.wall ? "blocked" : d === start ? "start" : d === end ? "end" : "node")
        .classed("open", d => d.inOpenSet)
        .classed("closed", d => d.inClosedSet)
        .classed("path", d => d.path)
        .on("click", (event, d) => handleNodeClick(d));
};

// Handle node click based on mode
function handleNodeClick(d) {
    if (mode === 'setStart') {
        if (start) start.inOpenSet = false;
        start = d;
        d.wall = false;
        d.inOpenSet = true;
    } else if (mode === 'setEnd') {
        if (end) end.inOpenSet = false;
        end = d;
        d.wall = false;
    } else if (mode === 'addWalls') {
        d.wall = !d.wall;
        if (d === start || d === end) d.wall = false;
    }
    update();
}

// A* Algorithm with visualization updates
function astar(start, end) {
    let openSet = [start];
    let closedSet = [];

    function step() {
        if (openSet.length > 0) {
            let lowestIndex = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[lowestIndex].f) {
                    lowestIndex = i;
                }
            }
            let current = openSet[lowestIndex];

            if (current === end) {
                let temp = current;
                while (temp.previous) {
                    temp.path = true;
                    temp = temp.previous;
                }
                update();
                console.log("Path found");
                return;
            }

            openSet = openSet.filter(elt => {
                if (elt !== current) return true;
                elt.inOpenSet = false;
                return false;
            });
            closedSet.push(current);
            current.inClosedSet = true;

            current.neighbors.forEach(neighbor => {
                if (!closedSet.includes(neighbor) && !neighbor.wall) {
                    let tempG = current.g + 1;
                    let isNewPath = false;
                    if (openSet.includes(neighbor)) {
                        if (tempG < neighbor.g) {
                            neighbor.g = tempG;
                            isNewPath = true;
                        }
                    } else {
                        neighbor.g = tempG;
                        neighbor.h = heuristic(neighbor, end);
                        neighbor.f = neighbor.g + neighbor.h;
                        neighbor.previous = current;
                        openSet.push(neighbor);
                        neighbor.inOpenSet = true;
                        isNewPath = true;
                    }
                    if (isNewPath) {
                        neighbor.previous = current;
                    }
                }
            });
            update();
            setTimeout(step, 1);
        } else {
            alert("No path found!!");
            initializeGrid();
            mode = 'setStart';
            updateButtonStates();
            return;
        }
    }
    step();
}

initializeGrid(); // Initialize the visualization
updateButtonStates();