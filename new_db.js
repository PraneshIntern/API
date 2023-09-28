const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

const dbConfig = {
  host: '162.241.85.121',
  user: 'athulslv_muthukumar',
  password: 'Athulya@123',
  database: 'athulslv_sal_subscriber102'
};

const pool = mysql.createPool(dbConfig);


/*  Fetch the pending schedules 3 input vangurom  */

app.get('/sch', (req, res) => {
  const branchId = req.query.branch_id;
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;

  if (!branchId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const query = `
    SELECT p.id AS patient_id, SUM(pa.amount) AS total_amount
    FROM patients AS p
    INNER JOIN patient_schedules AS pa
    ON p.id = pa.patient_id
    WHERE p.branch_id = ${branchId}
    AND pa.invoice_status = "Pending"
    AND pa.schedule_date >= '${startDate}'
    AND pa.schedule_date <= '${endDate}'
    GROUP BY p.id;
  `;

  pool.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});


/* Total fb paid and pending */

app.get('/fb', (req, res) => {
  const branchId = req.query.branch_id;
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;

  if (!branchId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const query = `
    SELECT
        'Total' AS patient_id,
        '' AS branch_id,
        SUM(CASE WHEN pafb.invoice_status = 'Pending' THEN pafb.fb_amount ELSE 0 END) AS pending_invoice_fb,
        SUM(CASE WHEN pafb.invoice_status = 'Billed' THEN pafb.fb_amount ELSE 0 END) AS invoice_billed_amount,
        lead_id,
       first_name,
       last_name
    FROM patient_activity_fb AS pafb
    INNER JOIN patients AS p ON pafb.patient_id = p.id
    INNER JOIN master_branches AS mb ON p.branch_id = mb.id
    WHERE p.branch_id = ? AND pafb.schedule_date >= ? AND pafb.schedule_date <= ?
    GROUP BY p.branch_id

    UNION

    SELECT
        p.id AS patient_id,
        p.branch_id,
        SUM(CASE WHEN pafb.invoice_status = 'Pending' THEN pafb.fb_amount ELSE 0 END) AS pending_invoice_fb,
        SUM(CASE WHEN pafb.invoice_status = 'Billed' THEN pafb.fb_amount ELSE 0 END) AS invoice_billed_amount,
        lead_id,
        first_name,
        last_name
    FROM patient_activity_fb AS pafb
    INNER JOIN patients AS p ON pafb.patient_id = p.id
    INNER JOIN master_branches AS mb ON p.branch_id = mb.id
    WHERE p.branch_id = ? AND pafb.schedule_date >= ? AND pafb.schedule_date <= ?
    GROUP BY p.id, p.branch_id

    UNION

    SELECT
        p.id AS patient_id,
        p.branch_id,
        NULL AS pending_invoice_fb,
        NULL AS invoice_billed_amount,
        bi.lead_id,
        pa.first_name,
        pa.last_name
    FROM patient_activity_fb AS pafb
    INNER JOIN patients AS p ON pafb.patient_id = p.id
    INNER JOIN bill_invoices AS bi ON p.id = bi.patient_id
    INNER JOIN patients AS pa ON p.id = pa.id
    WHERE p.branch_id = ? AND pafb.schedule_date >= ? AND pafb.schedule_date <= ?;
  `;

  pool.query(query, [branchId, startDate, endDate, branchId, startDate, endDate, branchId, startDate, endDate], (error, results) => {
    if (error) {
      console.error('Error executing the query:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});


/* Procedural service and its pending and paid  */

app.get('/pd', (req, res) => {
  const branchId = req.query.branch_id;
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;

  const query = `
    SELECT 
    'Total' AS patient_id,
    '' AS branch_id,
    SUM(CASE WHEN pas.invoice_status = 'Pending' THEN pas.procedure_service_amount ELSE 0 END) AS pending_procedure_service_amount,
    SUM(CASE WHEN pas.invoice_status = 'Billed' THEN pas.procedure_service_amount ELSE 0 END) AS billed_procedure_service_amount,
    first_name,
   last_name,
    lead_id,
    schedule_id,
   invoice_status,
   schedule_date
FROM patient_activity_procedure_service AS pas
INNER JOIN patients AS p ON pas.patient_id = p.id
INNER JOIN master_branches AS mb ON p.branch_id = mb.id
WHERE p.branch_id = ?
AND pas.schedule_date >= ?
AND pas.schedule_date <= ?
GROUP BY p.branch_id

UNION

SELECT
    p.id AS patient_id,
    p.branch_id,
    SUM(CASE WHEN pas.invoice_status = 'Pending' THEN pas.procedure_service_amount ELSE 0 END) AS pending_procedure_service_amount,
    SUM(CASE WHEN pas.invoice_status = 'Billed' THEN pas.procedure_service_amount ELSE 0 END) AS billed_procedure_service_amount,
    first_name,
    last_name,
    lead_id,
    pas.schedule_id AS schedule_id,
    pas.invoice_status AS invoice_status,
    pas.schedule_date AS schedule_date
FROM patient_activity_procedure_service AS pas
INNER JOIN patients AS p ON pas.patient_id = p.id
INNER JOIN master_branches AS mb ON p.branch_id = mb.id
WHERE p.branch_id = ?
AND pas.schedule_date >= ?
AND pas.schedule_date <= ?
GROUP BY p.id, p.branch_id;
  `;

  pool.query(query, [branchId, startDate, endDate, branchId, startDate, endDate], (err, results) => {
    if (err) {
      console.error('Error executing the query:', err);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(results);
    }
  });
});

/* emgergency pending and billed */

app.get('/emergency_care_data', (req, res) => {
  const branchId = req.query.branch_id;
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;

  if (!branchId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const query = `
    SELECT 
        'Total' AS patient_id,
        p.branch_id,
        SUM(CASE WHEN pa.invoice_status = 'Pending' THEN pa.emergency_care_amount ELSE 0 END) AS Pending_Emergency_Amt,
        SUM(CASE WHEN pa.invoice_status = 'Billed' THEN pa.emergency_care_amount ELSE 0 END) AS Billed_Emergency_Amt,
        lead_id,
        schedule_id,
        schedule_date,
        first_name,
       last_name
    FROM patient_activity_medical_emergency_care AS pa
    INNER JOIN patients AS p ON pa.patient_id = p.id
    WHERE p.branch_id = ?
    AND pa.created_at >= ?
    AND pa.created_at <= ?
    GROUP BY p.branch_id

    UNION

    SELECT
        p.id AS patient_id,
        p.branch_id,
        SUM(CASE WHEN pa.invoice_status = 'Pending' THEN pa.emergency_care_amount ELSE 0 END) AS Pending_Emergency_Amt,
        SUM(CASE WHEN pa.invoice_status = 'Billed' THEN pa.emergency_care_amount ELSE 0 END) AS Billed_Emergency_Amt,
        pa.lead_id,
        pa.schedule_id,
        pa.schedule_date,
        p.first_name,
        p.last_name
    FROM patient_activity_medical_emergency_care AS pa
    INNER JOIN patients AS p ON pa.patient_id = p.id
    WHERE p.branch_id = ?
    AND pa.created_at >= ?
    AND pa.created_at <= ?
    GROUP BY p.id, p.branch_id;
  `;

  pool.query(query, [branchId, startDate, endDate, branchId, startDate, endDate], (error, results) => {
    if (error) {
      console.error('Error executing the query:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});



/* Fetch Branch id with any data */

app.get('/branchmainfetch', (req, res) => {
  const city = req.query.city;
  const state = req.query.state;
  const country = req.query.country;
  const branchName = req.query.branch_name;


  let query = 'SELECT id,branch_name FROM master_branches WHERE 1';

  if (city) {
    query += ` AND branch_city_id = ?`;
  }

  if (state) {
    query += ` AND branch_state_id = ?`;
  }

  if (country) {
    query += ` AND branch_country_id = ?`;
  }

  if (branchName) {
    query += ` AND id = ?`;
  }

  const queryParams = [];
  if (city) queryParams.push(city);
  if (state) queryParams.push(state);
  if (country) queryParams.push(country);
  if (branchName) queryParams.push(branchName);

  pool.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});

/* Revenue Generated from Memberships*/

app.get('/membership_Revenue', (req, res) => {
  const branchId = req.query.branch_id;
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;

  if (!branchId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const query = `SELECT
    
  `;

  pool.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });

});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
