const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'theatgg6_sal_subscriber102'
};

const pool = mysql.createPool(dbConfig);

app.get('/branch', (req, res) => {
  const branchName = req.query.branch_name;

  if (!branchName) {
    return res.status(400).json({ error: 'Missing branch_name parameter' });
  }

  pool.query('SELECT * FROM master_branches WHERE branch_name = ?', [branchName], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});


app.get('/city', (req, res) => {
    const cityname = req.query.cityname;
  
    if (!cityname) {
      return res.status(400).json({ error: 'Missing City parameter' });
    }
  
    pool.query('SELECT * FROM master_branches WHERE branch_city = ?', [cityname], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
  
      res.json(results);
    });
  });



  app.get('/main', (req, res) => {
    const branch = req.query.branch;

    const query = `
      SELECT branch.id AS branch_id, branch.branch_name, branch.branch_city, branch.branch_state, branch.branch_country,
      room.id AS room_id, room.room_number AS room_number, bed.id AS bed_id, bed.bed_number AS bed_number
      FROM master_branches AS branch
      LEFT JOIN master_rooms AS room ON branch.id = room.branch_id
      LEFT JOIN master_beds AS bed ON room.id = bed.room_id
      WHERE branch.branch_name = ?`;

    if (!branch) {
      return res.status(400).json({ error: 'Missing branch parameter' });
    }

    pool.query(query, [branch], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(results);
    });
  });



  app.get('/bed', (req, res) => {
    const bed = req.query.bed;

    const query = `
    SELECT patient_id, lead_id, membership_type, amount, updated_at FROM patient_schedules WHERE bed_id = ?`;

    if (!bed) {
      return res.status(400).json({ error: 'Missing bed parameter' });
    }

    pool.query(query, [bed], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(results);
    });
  });



app.get('/inv', (req, res) => {
  const patientId = req.query.patient_id;
  const invoiceId = req.query.invoice_id;

  if (!patientId || !invoiceId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const query = "select * from bill_invoice_items where patient_id= (select id from patients where patient_id= ?)  and invoice_id=? and category!='Schedule' ORDER BY `schedule_date` DESC;";

  pool.query(query, [patientId, invoiceId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});


app.get('/branch', (req, res) => {
    const branchName = req.query.branch_name;
  
    if (!branchName) {
      return res.status(400).json({ error: 'Missing branch_name parameter' });
    }
  
    pool.query('SELECT * FROM master_branches WHERE branch_name = ?', [branchName], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
  
      res.json(results);
    });
  });









app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
