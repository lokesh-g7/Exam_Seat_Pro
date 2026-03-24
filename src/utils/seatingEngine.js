// ─── seatingEngine.js ─── Core seating arrangement engine ───

const ROWS = 8;
const COLS = 4;
const SEATS_PER_HALL = 28;
const TOTAL_SEATS = ROWS * COLS; // 32
const DEPTS_PER_HALL = 5;

// ─── Utility helpers ───

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function snakeOrder(rows, cols) {
  const order = [];
  for (let r = 0; r < rows; r++) {
    if (r % 2 === 0) {
      for (let c = 0; c < cols; c++) order.push({ row: r, col: c });
    } else {
      for (let c = cols - 1; c >= 0; c--) order.push({ row: r, col: c });
    }
  }
  return order;
}

function getAdjacentPositions(row, col, rows, cols) {
  const adj = [];
  if (row > 0) adj.push({ row: row - 1, col });
  if (row < rows - 1) adj.push({ row: row + 1, col });
  if (col > 0) adj.push({ row, col: col - 1 });
  if (col < cols - 1) adj.push({ row, col: col + 1 });
  return adj;
}

function splitIntoHalls(students) {
  const halls = [];
  for (let i = 0; i < students.length; i += SEATS_PER_HALL) {
    halls.push(students.slice(i, i + SEATS_PER_HALL));
  }
  return halls;
}

function groupByDept(students) {
  const groups = {};
  students.forEach(s => {
    if (!groups[s.dept]) groups[s.dept] = [];
    groups[s.dept].push(s);
  });
  return groups;
}

function roundRobinInterleave(deptGroups) {
  const depts = Object.keys(deptGroups);
  const queues = depts.map(d => [...deptGroups[d]]);
  const result = [];
  let idx = 0;
  while (result.length < queues.reduce((s, q) => s + q.length, 0) + result.length ? queues.some(q => q.length > 0) : false) {
    if (queues.every(q => q.length === 0)) break;
    if (queues[idx % depts.length].length > 0) {
      result.push(queues[idx % depts.length].shift());
    }
    idx++;
    if (idx > 10000) break; // safety
  }
  return result;
}

function hasConflict(grid, r, c, student) {
  const adjacents = getAdjacentPositions(r, c, ROWS, COLS);
  for (let { row: ar, col: ac } of adjacents) {
    const neighbor = grid[ar][ac];
    if (neighbor && neighbor.dept === student.dept) return true;
  }
  return false;
}

function assignToGrid(students, hallIndex) {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  const order = snakeOrder(ROWS, COLS);
  let unassigned = [...students];

  for (let i = 0; i < order.length; i++) {
    if (unassigned.length === 0) break;
    const { row, col } = order[i];
    
    // Find first student with no conflict
    let bestIndex = -1;
    for (let j = 0; j < unassigned.length; j++) {
      if (!hasConflict(grid, row, col, unassigned[j])) {
        bestIndex = j;
        break;
      }
    }
    
    // If all conflict, just pick the first one
    if (bestIndex === -1) bestIndex = 0;
    
    const student = unassigned.splice(bestIndex, 1)[0];
    
    grid[row][col] = {
      ...student,
      hall: hallIndex + 1,
      seat: i + 1,
      row: row + 1,
      col: col + 1,
    };
  }

  return grid;
}

// ─── Conflict scoring ───

export function calculateConflicts(grid) {
  const conflicts = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const student = grid[r][c];
      if (!student) continue;
      const adjacents = getAdjacentPositions(r, c, ROWS, COLS);
      adjacents.forEach(({ row: ar, col: ac }) => {
        const neighbor = grid[ar][ac];
        if (!neighbor) return;
        if (student.dept === neighbor.dept) {
          const key = [student.seat, neighbor.seat].sort().join('-');
          const existing = conflicts.find(cf => cf.key === key);
          if (!existing) {
            let score = 1;
            if (student.year !== neighbor.year) score = 2;
            conflicts.push({
              key,
              student1: student,
              student2: neighbor,
              score,
              type: student.year !== neighbor.year ? 'same-dept-diff-year' : 'same-dept',
            });
          }
        }
      });
    }
  }
  return conflicts;
}

export function calculateSQI(conflicts) {
  const totalPenalty = conflicts.reduce((sum, c) => sum + c.score, 0);
  const sqi = Math.max(0, 100 - totalPenalty * 10);
  let rating = 'Poor';
  if (sqi >= 90) rating = 'Excellent';
  else if (sqi >= 70) rating = 'Good';
  else if (sqi >= 50) rating = 'Fair';
  return { sqi, rating, totalPenalty };
}

// ─── Heatmap calculation ───

export function calculateHeatmap(grid) {
  const deptCounts = {};
  let total = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const s = grid[r][c];
      if (s) {
        deptCounts[s.dept] = (deptCounts[s.dept] || 0) + 1;
        total++;
      }
    }
  }
  const heatmap = {};
  Object.keys(deptCounts).forEach(dept => {
    heatmap[dept] = {
      count: deptCounts[dept],
      percentage: total > 0 ? ((deptCounts[dept] / total) * 100).toFixed(1) : 0,
    };
  });
  return heatmap;
}

// ─── ALGORITHM 1: Standard ───

export function standardSeating(students) {
  const deptGroups = groupByDept(students);
  const depts = Object.keys(deptGroups);

  // Split depts into groups of DEPTS_PER_HALL
  const hallDeptGroups = [];
  for (let i = 0; i < depts.length; i += DEPTS_PER_HALL) {
    hallDeptGroups.push(depts.slice(i, i + DEPTS_PER_HALL));
  }

  // If only one group, just use all depts together
  if (hallDeptGroups.length === 0) hallDeptGroups.push(depts);

  const allHallStudents = [];
  hallDeptGroups.forEach(deptGroup => {
    const subGroups = {};
    deptGroup.forEach(d => { subGroups[d] = deptGroups[d]; });
    const interleaved = roundRobinInterleave(subGroups);
    allHallStudents.push(...interleaved);
  });

  const halls = splitIntoHalls(allHallStudents);
  return halls.map((hallStudents, i) => assignToGrid(hallStudents, i));
}

// ─── ALGORITHM 2: Marks Based ───

export function marksBasedSeating(students) {
  const sorted = [...students].sort((a, b) => (b.marks || 0) - (a.marks || 0));
  const halls = splitIntoHalls(sorted);

  return halls.map((hallStudents, i) => {
    const deptGroups = groupByDept(hallStudents);
    const interleaved = roundRobinInterleave(deptGroups);
    return assignToGrid(interleaved, i);
  });
}

// ─── ALGORITHM 3: Random ───

export function randomSeating(students) {
  const shuffled = shuffle(students);
  const deptGroups = groupByDept(shuffled);
  const depts = Object.keys(deptGroups);

  const hallDeptGroups = [];
  for (let i = 0; i < depts.length; i += DEPTS_PER_HALL) {
    hallDeptGroups.push(depts.slice(i, i + DEPTS_PER_HALL));
  }
  if (hallDeptGroups.length === 0) hallDeptGroups.push(depts);

  const allHallStudents = [];
  hallDeptGroups.forEach(deptGroup => {
    const subGroups = {};
    deptGroup.forEach(d => {
      subGroups[d] = shuffle(deptGroups[d]);
    });
    const interleaved = roundRobinInterleave(subGroups);
    allHallStudents.push(...interleaved);
  });

  const halls = splitIntoHalls(allHallStudents);
  return halls.map((hallStudents, i) => assignToGrid(hallStudents, i));
}

// ─── ALGORITHM 4: Optimized (AI-Style) ───

function scoreGrid(grid) {
  let score = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const student = grid[r][c];
      if (!student) continue;
      const adjacents = getAdjacentPositions(r, c, ROWS, COLS);
      adjacents.forEach(({ row: ar, col: ac }) => {
        const neighbor = grid[ar][ac];
        if (!neighbor) return;
        if (student.dept === neighbor.dept) {
          score += 1;
          if (student.year !== neighbor.year) score += 2;
        }
      });
    }
  }
  return score / 2; // each pair counted twice
}

function deepCopyGrid(grid) {
  return grid.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

export function optimizedSeating(students) {
  // Start with random seating
  const initialHalls = randomSeating(students);

  return initialHalls.map((grid) => {
    let bestGrid = deepCopyGrid(grid);
    let bestScore = scoreGrid(bestGrid);
    const MAX_ITERATIONS = 500;
    let noImprovement = 0;

    for (let iter = 0; iter < MAX_ITERATIONS && noImprovement < 80; iter++) {
      const newGrid = deepCopyGrid(bestGrid);

      // Find occupied positions
      const occupied = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newGrid[r][c]) occupied.push({ r, c });
        }
      }

      // Random swap
      if (occupied.length >= 2) {
        const i1 = Math.floor(Math.random() * occupied.length);
        let i2 = Math.floor(Math.random() * occupied.length);
        while (i2 === i1) i2 = Math.floor(Math.random() * occupied.length);

        const p1 = occupied[i1];
        const p2 = occupied[i2];

        const temp = newGrid[p1.r][p1.c];
        newGrid[p1.r][p1.c] = newGrid[p2.r][p2.c];
        newGrid[p2.r][p2.c] = temp;

        // Update seat info
        if (newGrid[p1.r][p1.c]) {
          newGrid[p1.r][p1.c].row = p1.r + 1;
          newGrid[p1.r][p1.c].col = p1.c + 1;
        }
        if (newGrid[p2.r][p2.c]) {
          newGrid[p2.r][p2.c].row = p2.r + 1;
          newGrid[p2.r][p2.c].col = p2.c + 1;
        }
      }

      const newScore = scoreGrid(newGrid);
      if (newScore < bestScore) {
        bestGrid = newGrid;
        bestScore = newScore;
        noImprovement = 0;
      } else {
        noImprovement++;
      }
    }

    // Re-assign seat numbers in snake order
    const order = snakeOrder(ROWS, COLS);
    let seatNum = 1;
    order.forEach(({ row, col }) => {
      if (bestGrid[row][col]) {
        bestGrid[row][col].seat = seatNum++;
        bestGrid[row][col].row = row + 1;
        bestGrid[row][col].col = col + 1;
      }
    });

    return bestGrid;
  });
}

// ─── CSV Parser ───

export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  const snoIdx = headers.findIndex(h => h.includes('sno') || h.includes('serial'));
  const rollIdx = headers.findIndex(h => h.includes('reg') || h.includes('roll') || h === 'id');
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('student'));
  const deptIdx = headers.findIndex(h => h.includes('dept') || h.includes('branch'));
  const yearIdx = headers.findIndex(h => h === 'year' || h === 'yr');
  const marksIdx = headers.findIndex(h => h.includes('mark') || h.includes('score'));

  if (snoIdx === -1 || rollIdx === -1 || nameIdx === -1 || deptIdx === -1 || yearIdx === -1) {
    throw new Error('CSV must have "S. No.", "Reg. no.", "Name", "Dept", and "Year" columns');
  }

  return lines.slice(1).filter(l => l.trim()).map((line, i) => {
    const cols = line.split(',').map(c => c.trim());
    return {
      sno: cols[snoIdx],
      id: cols[rollIdx], // Register number
      name: cols[nameIdx] || `Student ${i + 1}`,
      dept: cols[deptIdx] || 'Unknown',
      year: parseInt(cols[yearIdx]) || 1,
      marks: marksIdx !== -1 ? parseFloat(cols[marksIdx]) || 0 : 0,
    };
  });
}

// ─── Generate sample data ───

export function generateSampleData(count = 112) {
  const depts = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS'];
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh',
    'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Saanvi', 'Aanya',
    'Aadhya', 'Isha', 'Myra', 'Navya', 'Priya', 'Riya', 'Karthik',
    'Rahul', 'Sneha', 'Deepa', 'Meera', 'Lakshmi', 'Pooja', 'Nisha',
    'Rohan', 'Vikram', 'Suresh', 'Ramesh', 'Ganesh', 'Harish', 'Manoj'];
  const lastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Nair', 'Menon',
    'Gupta', 'Iyer', 'Pillai', 'Das', 'Roy', 'Verma', 'Joshi', 'Rao'];

  const students = [];
  for (let i = 0; i < count; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    students.push({
      id: `S${String(i + 1).padStart(3, '0')}`,
      name: `${fn} ${ln}`,
      dept: depts[i % depts.length],
      year: Math.floor(Math.random() * 4) + 1,
      marks: Math.floor(Math.random() * 60) + 40,
    });
  }
  return students;
}

// ─── Export flat table ───

export function flattenHalls(halls) {
  const rows = [];
  halls.forEach((grid, hallIdx) => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const s = grid[r][c];
        if (s) {
          rows.push({
            hall: hallIdx + 1,
            seat: s.seat,
            row: r + 1,
            col: c + 1,
            name: s.name,
            dept: s.dept,
            year: s.year,
            marks: s.marks,
            id: s.id,
          });
        }
      }
    }
  });
  return rows;
}

export { ROWS, COLS, SEATS_PER_HALL, DEPTS_PER_HALL };
