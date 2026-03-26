import express from 'express';
import cors from 'cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

let db;

async function setupDB() {
  db = await open({
    filename: './examseat.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS allocations (
      reg_no TEXT PRIMARY KEY,
      name TEXT,
      dept TEXT,
      year INTEGER,
      hall INTEGER,
      seat INTEGER,
      row INTEGER,
      col INTEGER
    );
  `);
  console.log('SQLite Database Connected.');
}

setupDB();

app.post('/api/save-allocation', async (req, res) => {
  const { allocations } = req.body;
  if (!allocations || !Array.isArray(allocations)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  try {
    // Clear old allocations (replacing previous exam layout)
    await db.exec('DELETE FROM allocations');
    
    // Insert new allocations
    // Using a transaction drastically improves bulk insert speed
    await db.exec('BEGIN TRANSACTION');
    const stmt = await db.prepare('INSERT INTO allocations (reg_no, name, dept, year, hall, seat, row, col) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    
    for (const a of allocations) {
      await stmt.run(a.id, a.name, a.dept, a.year, a.hall, a.seat, a.row, a.col);
    }
    
    await stmt.finalize();
    await db.exec('COMMIT');

    res.json({ success: true, message: `Successfully saved ${allocations.length} allocations to SQL database.` });
  } catch (err) {
    if (db) await db.exec('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/allocation/:reg_no', async (req, res) => {
  const regNo = req.params.reg_no;
  try {
    const student = await db.get('SELECT * FROM allocations WHERE reg_no = ?', regNo);
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ error: 'Not allocated' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend API Server running on http://localhost:${PORT}`);
});
