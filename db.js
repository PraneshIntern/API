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


  app.get('/branchtest', (req, res) => {
    const city = req.query.city;
    const state = req.query.state;
    const country = req.query.country;
  
    let query = 'SELECT id FROM master_branches WHERE 1';
  
    if (city) {
      query += ` AND branch_city = ?`;
    }
  
    if (state) {
      query += ` AND branch_state = ?`;
    }
  
    if (country) {
      query += ` AND branch_country = ?`;
    }
  
    const queryParams = [];
    if (city) queryParams.push(city);
    if (state) queryParams.push(state);
    if (country) queryParams.push(country);
  
    pool.query(query, queryParams, (err, results) => {
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

app.get('/branchmainfetch', (req, res) => {
    const city = req.query.city;
    const state = req.query.state;
    const country = req.query.country;
    const branchName = req.query.branch_name;

  
    let query = 'SELECT id FROM master_branches WHERE 1';
  
    if (city) {
      query += ` AND branch_city = ?`;
    }
  
    if (state) {
      query += ` AND branch_state = ?`;
    }
  
    if (country) {
      query += ` AND branch_country = ?`;
    }

    if (branchName) {
      query += ` AND branch_name = ?`;
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




  app.get('/gender', (req, res) => {
    const gen = req.query.gen;
    const start = req.query.start;
    const end = req.query.end;
  
    if (!gen || !start || !end) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    const query = `
      SELECT COUNT(*)
      FROM patients
      WHERE gender = ? 
      AND created_at >= ? 
      AND updated_at <= ?;`;
  
    pool.query(query, [gen, start, end], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
  
      const count = results[0]['COUNT(*)'];
      res.json(count);
    });
  });
  
  


  app.get('/leads', (req, res) => {
    const gen = req.query.branch;
    const start = req.query.start;
    const end = req.query.end;
  
    if (!gen && !start && !end) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    const query = `
      SELECT COUNT(*) AS lead_count
      FROM leads
      WHERE branch_id = ?
      AND created_at >= ?
      AND updated_at <= ?;`;
  
    pool.query(query, [gen, start, end], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      const leadCount = results[0].lead_count;
      console.log(results);
      res.json({ leadCount });
    });
  });
  


  app.get('/bill', (req, res) => {
    const con = req.query.con;
  
    if (!con) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    const query = `
      SELECT bill_invoice_items.patient_id, bill_invoice_items.lead_id, bill_invoice_items.category, membership, count(membership), rate, patient_schedules.tax_rate, total_amount
      FROM patient_schedules
      JOIN master_membership ON patient_schedules.membership_id = master_membership.id
      JOIN bill_invoice_items ON bill_invoice_items.item_id = patient_schedules.id
      WHERE bill_invoice_items.invoice_id = (SELECT id FROM bill_invoices WHERE consolidated_bill_no = ?)
      AND category = 'Schedule';`;
  
    pool.query(query, [con], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
  
      res.json(results);
    });
  });
  
  app.get('/extraservices', (req, res) => {
    const conid = req.query.conid;
  
    if (!conid) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    const query = `
      SELECT category, master_extra_services.extra_service_name, COUNT(duration) AS count_duration, rate, bill_invoice_items.tax_rate, SUM(bill_invoice_items.total_amount * COUNT(duration)) AS total
      FROM bill_invoice_items
      JOIN patient_activity_staff_extra_service ON patient_activity_staff_extra_service.id = bill_invoice_items.item_id
      JOIN master_extra_services ON patient_activity_staff_extra_service.extra_service_id = master_extra_services.id
      WHERE bill_invoice_items.category = 'Staff Extra Service'
      AND bill_invoice_items.invoice_id = (SELECT id FROM bill_invoices WHERE consolidated_bill_no = ?)
      AND bill_invoice_items.category != 'Schedule'
      GROUP BY patient_activity_staff_extra_service.extra_service_id, rate;`;
  
    pool.query(query, [conid], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  });

  app.get('/extraservicesall', (req, res) => {
    const query = `
    SELECT
    category,
    master_extra_services.extra_service_name,
    COUNT(duration) AS count_duration,
    rate,
    bill_invoice_items.tax_rate,
    SUM(bill_invoice_items.total_amount) AS total
  FROM
    bill_invoice_items
  JOIN
    patient_activity_staff_extra_service
    ON patient_activity_staff_extra_service.id = bill_invoice_items.item_id
  JOIN
    master_extra_services
    ON patient_activity_staff_extra_service.extra_service_id = master_extra_services.id
  WHERE
    bill_invoice_items.category = 'Staff Extra Service'
    AND bill_invoice_items.invoice_id IN (SELECT id FROM bill_invoices)
    AND bill_invoice_items.category != 'Schedule'
  GROUP BY
    patient_activity_staff_extra_service.extra_service_id, rate;
  `;
  
        pool.query(query, (err, results) => {
          if (err) {
            console.error("Database error:", err.message);
            console.error("Error code:", err.code);
            console.error("SQL query:", query);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json(results);
        });        
  });
  


  // app.get('/addon', (req, res) => {
  //   const addon = req.query.addon;  
    
  //   if (!addon) {
  //     return res.status(400).json({ error: 'Missing parameters' });
  //   }
  
  //   const query = `
  // SELECT bill_invoice_items.patient_id, bill_invoice_items.lead_id, bill_invoice_items.category, duration, bill_invoice_items.rate, bill_invoice_items.total_amount, bill_invoice_items.invoice_id
  // FROM bill_invoice_items
  // WHERE bill_invoice_items.category != 'Schedule'
  // AND bill_invoice_items.invoice_id = (SELECT id FROM bill_invoices WHERE consolidated_bill_no = ${addon})
  // AND bill_invoice_items.item_id IS NULL
  // ORDER BY bill_invoice_items.patient_id DESC;`;

  // console.log(addon);

  //   pool.query(query, [addon], (err, results) => {
  //     if (err) {
  //       return res.status(500).json({ error: 'Database error' });
  //     }
  //     res.json(results);
  //     console.log(results);
  //   });
  // });


  app.get('/advanced', (req, res) => {
    const conid = req.query.conid;  
    
    if (!conid) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    const query = `
    SELECT bill_invoice_items.patient_id,bill_invoice_items.lead_id,bill_invoice_items.category,activity_name,duration,bill_invoice_items.rate,bill_invoice_items.total_amount FROM bill_invoice_items join patient_activity_advance on bill_invoice_items.item_id=patient_activity_advance.id where bill_invoice_items.invoice_id= (select id from bill_invoices where consolidated_bill_no= ?) and bill_invoice_items.category!='Schedule' and bill_invoice_items.category='Advance Activity';`;

  console.log(conid);

    pool.query(query, [conid], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
      console.log(results);
    });
  });

  app.get('/advanced', (req, res) => {
    const conid = req.query.conid;  
    
    if (!conid) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    const query = `
    SELECT bill_invoice_items.patient_id,bill_invoice_items.lead_id,bill_invoice_items.category,activity_name,duration,bill_invoice_items.rate,bill_invoice_items.total_amount FROM bill_invoice_items join patient_activity_advance on bill_invoice_items.item_id=patient_activity_advance.id where bill_invoice_items.invoice_id= (select id from bill_invoices where consolidated_bill_no= ?) and bill_invoice_items.category!='Schedule' and bill_invoice_items.category='Advance Activity';`;

  console.log(conid);

    pool.query(query, [conid], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
      console.log(results);
    });
  });
  
  app.get('/serviceall', (req, res) => {
    const query = `
    SELECT
    category,
    master_extra_services.extra_service_name,
    COUNT(duration) AS count_duration,
    rate,
    bill_invoice_items.tax_rate,
    SUM(bill_invoice_items.total_amount) AS total_amount
  FROM
    bill_invoice_items
  JOIN
    patient_activity_staff_extra_service
    ON patient_activity_staff_extra_service.id = bill_invoice_items.item_id
  JOIN
    master_extra_services
    ON patient_activity_staff_extra_service.extra_service_id = master_extra_services.id
  WHERE
    bill_invoice_items.category = 'Staff Extra Service'
    AND bill_invoice_items.invoice_id IN (SELECT id FROM bill_invoices)
    AND bill_invoice_items.category != 'Schedule'
  GROUP BY
    patient_activity_staff_extra_service.extra_service_id, rate;
  `;
  
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error',err });
      }
      res.json(results);
    });
  });
  
  
  app.get('/advancedall', (req, res) => {
    const query = `
      SELECT
        bill_invoice_items.patient_id,
        bill_invoice_items.lead_id,
        bill_invoice_items.category,
        activity_name,
        duration,
        bill_invoice_items.rate,
        bill_invoice_items.total_amount
      FROM
        bill_invoice_items
      JOIN
        patient_activity_advance
        ON bill_invoice_items.item_id = patient_activity_advance.id
      WHERE
        bill_invoice_items.category != 'Schedule'
        AND bill_invoice_items.category = 'Advance Activity';`;
  
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  });
  
  // app.get('/addonall', (req, res) => {
  //   const query = `
  //     SELECT
  //       bill_invoice_items.patient_id,
  //       bill_invoice_items.lead_id,
  //       bill_invoice_items.category,
  //       duration,
  //       bill_invoice_items.rate,
  //       bill_invoice_items.total_amount,
  //       bill_invoice_items.invoice_id
  //     FROM
  //       bill_invoice_items
  //     WHERE
  //       bill_invoice_items.category != 'Schedule'
  //       AND bill_invoice_items.item_id IS NULL
  //     ORDER BY
  //       bill_invoice_items.patient_id DESC;`;
  
  //   pool.query(query, (err, results) => {
  //     if (err) {
  //       return res.status(500).json({ error: 'Database error' });
  //     }
  //     res.json(results);
  //   });
  // });



  app.get('/invoices', (req, res) => {
    const branchId = req.query.branch_id;
    const start = req.query.start;
    const end = req.query.end;
  
   
    let query = `
  SELECT
    m.id AS branch_id,
    m.branch_name,
    b.invoice_id,
    b.created_at,
    b.updated_at
  FROM
    bill_invoice_items AS b
  JOIN
    leads AS l
    ON b.lead_id = l.id
  JOIN
    master_branches AS m
    ON l.branch_id = m.id
  WHERE
`;

  
    
    if (branchId) {
      query += `m.id = ? AND `;
    }
  
    if (start && end) {
      query += `b.created_at >= ? AND b.updated_at <= ?`;
    } else {
      query = query.slice(0, -5);
    }
    pool.query(query, [branchId, start, end], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
    
      res.json(results);
    });
  });
  


  app.get('/allInvoices', (req, res) => {
    const limit = req.query.list ? parseInt(req.query.list) : 10;
  

    const query = 'SELECT DISTINCT invoice_id FROM bill_invoice_items';
  
    pool.query(query, (err, invoiceIds) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
  
      if (invoiceIds.length === 0) {
        return res.status(404).json({ error: 'No invoices found' });
      }
  
      const invoices = [];
  
      invoiceIds.slice(0, limit).forEach((invoice) => {
        const invoiceId = invoice.invoice_id;
  
        const invoiceQuery = 'SELECT lead_id FROM bill_invoices WHERE id = ?';
  
        pool.query(invoiceQuery, [invoiceId], (err, invoiceData) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
          }
  
          if (invoiceData.length > 0) {
            const leadId = invoiceData[0].lead_id;
  
            const leadQuery = 'SELECT branch_id FROM leads WHERE id = ?';
  
            pool.query(leadQuery, [leadId], (err, leadData) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
              }
  
              if (leadData.length > 0) {
                const branchId = leadData[0].branch_id;
  
                const billInvoiceQuery = 'SELECT total_amount, patient_id FROM bill_invoices WHERE id = ?';
  
                pool.query(billInvoiceQuery, [invoiceId], (err, billInvoiceData) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database error' });
                  }
  
                  if (billInvoiceData.length > 0) {
                    const totalAmount = billInvoiceData[0].total_amount;
                    const patientId = billInvoiceData[0].patient_id;
  
                    const patientQuery = 'SELECT first_name, last_name FROM patients WHERE id = ?';
  
                    pool.query(patientQuery, [patientId], (err, patientData) => {
                      if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Database error' });
                      }
  
                      if (patientData.length > 0) {
                        const firstName = patientData[0].first_name;
                        const lastName = patientData[0].last_name;
  
                        invoices.push({
                          invoice_id: invoiceId,
                          branch_id: branchId,
                          total_amount: totalAmount,
                          patient_id: patientId,
                          first_name: firstName,
                          last_name: lastName,
                        });
  
                        if (invoices.length === invoiceIds.slice(0, limit).length) {
                          const groupedInvoices = groupInvoicesByBranch(invoices);
  
                          res.json(groupedInvoices);
                        }
                      }
                    });
                  }
                });
              }
            });
          }
        });
      });
    });
  });
  
  function groupInvoicesByBranch(invoices) {
    const groupedInvoices = {};
  
    invoices.forEach((invoice) => {
      const branchId = invoice.branch_id;
  
      if (!groupedInvoices[branchId]) {
        groupedInvoices[branchId] = {
          branch_id: branchId,
          invoices: [],
        };
      }
  
      groupedInvoices[branchId].invoices.push(invoice);
    });
  
    return Object.values(groupedInvoices);
  }
  
  app.get('/testing', (req, res) => {
    const limit = req.query.list ? parseInt(req.query.list) : 10;

    const query = 'SELECT DISTINCT invoice_id FROM bill_invoice_items';

    pool.query(query, (err, invoiceIds) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (invoiceIds.length === 0) {
            return res.status(404).json({ error: 'No invoices found' });
        }

        const invoices = [];

        invoiceIds.slice(0, limit).forEach((invoice) => {
            const invoiceId = invoice.invoice_id;

            const invoiceQuery = 'SELECT lead_id FROM bill_invoices WHERE id = ?';

            pool.query(invoiceQuery, [invoiceId], (err, invoiceData) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database error' });
                }

                if (invoiceData.length > 0) {
                    const leadId = invoiceData[0].lead_id;

                    const leadQuery = 'SELECT branch_id FROM leads WHERE id = ?';

                    pool.query(leadQuery, [leadId], (err, leadData) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: 'Database error' });
                        }

                        if (leadData.length > 0) {
                            const branchId = leadData[0].branch_id;

                            const billInvoiceQuery = 'SELECT total_amount, patient_id FROM bill_invoices WHERE id = ?';

                            pool.query(billInvoiceQuery, [invoiceId], (err, billInvoiceData) => {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).json({ error: 'Database error' });
                                }

                                if (billInvoiceData.length > 0) {
                                    const totalAmount = billInvoiceData[0].total_amount;
                                    const patientId = billInvoiceData[0].patient_id;

                                    const patientQuery = 'SELECT first_name, last_name FROM patients WHERE id = ?';

                                    pool.query(patientQuery, [patientId], (err, patientData) => {
                                        if (err) {
                                            console.error(err);
                                            return res.status(500).json({ error: 'Database error' });
                                        }

                                        if (patientData.length > 0) {
                                            const firstName = patientData[0].first_name;
                                            const lastName = patientData[0].last_name;

                                            const patientActivityQuery = 'SELECT lead_id, schedule_id FROM patient_activity_alike_services WHERE patient_id = ?';

                                            pool.query(patientActivityQuery, [patientId], (err, activityData) => {
                                                if (err) {
                                                    console.error(err);
                                                    return res.status(500).json({ error: 'Database error' });
                                                }

                                                if (activityData.length > 0) {
                                                    const leadIdFromActivity = activityData[0].lead_id;
                                                    const scheduleId = activityData[0].schedule_id;

                                                    const scheduleQuery = 'SELECT bed_id, amount, membership_type FROM patient_schedules WHERE id = ?';

                                                    pool.query(scheduleQuery, [scheduleId], (err, scheduleData) => {
                                                        if (err) {
                                                            console.error(err);
                                                            return res.status(500).json({ error: 'Database error' });
                                                        }

                                                        if (scheduleData.length > 0) {
                                                            const bedId = scheduleData[0].bed_id;
                                                            const amount = scheduleData[0].amount;
                                                            const membershipType = scheduleData[0].membership_type;

                                                            const bedQuery = 'SELECT room_id FROM master_beds WHERE id = ?';

                                                            pool.query(bedQuery, [bedId], (err, bedData) => {
                                                                if (err) {
                                                                    console.error(err);
                                                                    return res.status(500).json({ error: 'Database error' });
                                                                }

                                                                if (bedData.length > 0) {
                                                                    const roomId = bedData[0].room_id;

                                                                    invoices.push({
                                                                        invoice_id: invoiceId,
                                                                        branch_id: branchId,
                                                                        total_amount: totalAmount,
                                                                        patient_id: patientId,
                                                                        first_name: firstName,
                                                                        last_name: lastName,
                                                                        bed_id: bedId,
                                                                        amount: amount,
                                                                        membership_type: membershipType,
                                                                        room_id: roomId,
                                                                    });

                                                                    if (invoices.length === invoiceIds.slice(0, limit).length) {
                                                                        const groupedInvoices = groupInvoicesByBranch(invoices);

                                                                        res.json(groupedInvoices);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });
});

function groupInvoicesByBranch(invoices) {
    const groupedInvoices = {};

    invoices.forEach((invoice) => {
        const branchId = invoice.branch_id;

        if (!groupedInvoices[branchId]) {
            groupedInvoices[branchId] = {
                branch_id: branchId,
                invoices: [],
            };
        }

        groupedInvoices[branchId].invoices.push(invoice);
    });

    return Object.values(groupedInvoices);
}

  
app.get('/pew', (req, res) => {
  const limit = req.query.list ? parseInt(req.query.list) : 10;
  const branchId = req.query.branch_id ? parseInt(req.query.branch_id) : null;
  const start = req.query.start;
  const end = req.query.end;
  const membershipType = req.query.membership;

  let query = `
      SELECT
          l.branch_id,
          bii.invoice_id,
          bi.total_amount,
          bi.patient_id,
          p.first_name,
          p.last_name,
          ps.bed_id,
          ps.amount,
          ps.membership_type,
          mb.room_id
      FROM
          bill_invoice_items AS bii
      JOIN
          bill_invoices AS bi
          ON bii.invoice_id = bi.id
      JOIN
          leads AS l
          ON bi.lead_id = l.id
      JOIN
          patients AS p
          ON bi.patient_id = p.id
      JOIN
          patient_activity_alike_services AS paas
          ON bi.patient_id = paas.patient_id
      JOIN
          patient_schedules AS ps
          ON paas.schedule_id = ps.id
      JOIN
          master_beds AS mb
          ON ps.bed_id = mb.id
  `;

  const filters = [];
  if (start) {
      filters.push(`bi.created_at >= '${start}'`);
  }
  if (end) {
      filters.push(`bi.updated_at <= '${end}'`);
  }
  if (membershipType) {
      filters.push(`ps.membership_type = '${membershipType}'`);
  }

  if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
  }

  if (branchId !== null) {
      query += ` AND l.branch_id = ${branchId}`;
  }

  query += ` LIMIT ?;`;

  pool.query(query, [limit], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
          return res.status(404).json({ error: 'No invoices found' });
      }

      const groupedInvoices = groupInvoicesByBranch(results);

      res.json(groupedInvoices);
  });
});

function groupInvoicesByBranch(invoices) {
  const groupedInvoices = {};

  invoices.forEach((invoice) => {
      const branchId = invoice.branch_id;

      if (!groupedInvoices[branchId]) {
          groupedInvoices[branchId] = {
              branch_id: branchId,
              invoices: [],
          };
      }

      groupedInvoices[branchId].invoices.push(invoice);
  });

  return Object.values(groupedInvoices);
}


function groupInvoicesByBranch(invoices) {
  const groupedInvoices = {};

  invoices.forEach((invoice) => {
      const branchId = invoice.branch_id;

      if (!groupedInvoices[branchId]) {
          groupedInvoices[branchId] = {
              branch_id: branchId,
              invoices: [],
          };
      }

      groupedInvoices[branchId].invoices.push(invoice);
  });

  return Object.values(groupedInvoices);
}


function groupInvoicesByBranch(invoices) {
  const groupedInvoices = {};

  invoices.forEach((invoice) => {
      const branchId = invoice.branch_id;

      if (!groupedInvoices[branchId]) {
          groupedInvoices[branchId] = {
              branch_id: branchId,
              invoices: [],
          };
      }

      groupedInvoices[branchId].invoices.push(invoice);
  });

  return Object.values(groupedInvoices);
}


  app.get('/test', (req, res) => {
    const start = req.query.start;
    const end = req.query.end;   
  
    if (!start || !end) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    console.log('Start timestamp:', start);
    console.log('End timestamp:', end);
  
    const query = `
      SELECT
        patient_schedules.schedule_date,
        master_membership.membership,
        patient_schedules.rate,
        patient_schedules.tax_rate,
        patient_schedules.total_amount
      FROM
        patient_schedules
      JOIN
        master_membership
        ON patient_schedules.membership_id = master_membership.id
      JOIN
        bill_invoice_items
        ON bill_invoice_items.item_id = patient_schedules.id
      WHERE
        bill_invoice_items.invoice_id = (
          SELECT id FROM bill_invoices WHERE consolidated_bill_no = 2050
        )
        AND category = 'Schedule'
        AND created_at >= ?
        AND updated_at <= ?`;
  
    pool.query(query, [start, end], (err, results) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  });
  

  app.get('/patientData', (req, res) => {
    const patientId = req.query.patientId;
  
    if (!patientId) {
      return res.status(400).json({ error: 'Missing patientId parameter' });
    }
  
    const query = `
      SELECT
        psa.patient_id AS patientId,
        psa.schedule_id AS scheduleId,
        ps.amount AS amount,
        p.first_name AS firstName,
        p.last_name AS lastName,
        p.advance_amount AS advanceAmount
      FROM
        patient_activity_alike_services AS psa
      JOIN
        patient_schedules AS ps
        ON psa.schedule_id = ps.id
      JOIN
        patients AS ps
        ON ps.patient_id = p.id
      WHERE
        psa.patient_id = ?;`;
  
    pool.query(query, [patientId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Patient data not found' });
      }
  
     res.json(results[0]);
      console.log(results[0])
    });
  });



  app.get('/procedureServiceTotals', (req, res) => {
    const branchId = req.query.branch_id;
    const start = req.query.start;
    const end = req.query.end;

    let query = `
        SELECT
            l.branch_id,
            paas.patient_id,
            SUM(paas.procedure_service_amount) AS procedural_service_total
        FROM
            patient_activity_procedure_service AS paas
        JOIN
            leads AS l
            ON paas.lead_id = l.id
    `;

    if (branchId) {
        query += `WHERE l.branch_id = ? `;
    }

    if (start && end) {
        if (branchId) {
            query += `AND `;
        } else {
            query += `WHERE `;
        }
        query += `paas.created_at >= ? AND paas.created_at <= ? `;
    }

    query += `GROUP BY l.branch_id, paas.patient_id;`;

    const queryParams = branchId ? [branchId, start, end] : [start, end];

    pool.query(query, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No procedural service data found' });
        }

        const groupedData = groupProceduralServiceByBranch(results);

        res.json(groupedData);
    });
});

function groupProceduralServiceByBranch(data) {
    const groupedData = {};

    data.forEach((record) => {
        const branchId = record.branch_id;

        if (!groupedData[branchId]) {
            groupedData[branchId] = {
                branch_id: branchId,
                procedural_service_data: [],
            };
        }

        groupedData[branchId].procedural_service_data.push({
            patient_id: record.patient_id,
            procedural_service_total: record.procedural_service_total,
        });
    });

    return Object.values(groupedData);
}

function groupProceduralServiceByBranch(data) {
    const groupedData = {};

    data.forEach((record) => {
        const branchId = record.branch_id;

        if (!groupedData[branchId]) {
            groupedData[branchId] = {
                branch_id: branchId,
                procedural_service_data: [],
            };
        }

        groupedData[branchId].procedural_service_data.push({
            patient_id: record.patient_id,
            schedule_id: record.schedule_id,
            procedural_service_total: record.procedural_service_total,
        });
    });

    return Object.values(groupedData);
}

app.get('/kek', (req, res) => {
  const bedNumber = req.query.bed_number;

  const query = `
    SELECT branch.id AS branch_id, branch.branch_name, branch.branch_city, branch.branch_state, branch.branch_country,
    room.id AS room_id, room.room_number AS room_number, bed.id AS bed_id, bed.bed_number AS bed_number
    FROM master_branches AS branch
    LEFT JOIN master_rooms AS room ON branch.id = room.branch_id
    LEFT JOIN master_beds AS bed ON room.id = bed.room_id
    WHERE bed.bed_number = ?`;

  if (!bedNumber) {
    return res.status(400).json({ error: 'Missing bed_number parameter' });
  }

  pool.query(query, [bedNumber], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});

app.get('/master', (req, res) => {
  const patientId = req.query.patient_id;
  const start = req.query.start;
  const end = req.query.end;

  if (!patientId || !start || !end) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const patientQuery = `
    SELECT
      branch_id,
      name_prefix,
      first_name,
      middle_name,
      last_name,
      email,
      age,
      marital_status,
      gender,
      enquirer_address
    FROM
      patients
    WHERE
      id = ?;
  `;

  const schedulesQuery = `
    SELECT
      membership_type
    FROM
      patient_schedules
    WHERE
      patient_id = ?
      AND created_at >= ? AND created_at <= ?;
  `;

  const procedureServiceQuery = `
    SELECT
      SUM(procedure_service_amount) AS procedure_service_total
    FROM
      patient_activity_procedure_service
    WHERE
      patient_id = ?
      AND created_at >= ? AND created_at <= ?;
  `;

  const fbAmountQuery = `
    SELECT
      SUM(fb_amount) AS fb_amount_total
    FROM
      patient_activity_fb
    WHERE
      patient_id = ?
      AND created_at >= ? AND created_at <= ?;
  `;

  const extraServiceQuery = `
    SELECT
      SUM(extra_service_amount) AS extra_service_total
    FROM
      patient_activity_staff_extra_service
    WHERE
      patient_id = ?
      AND created_at >= ? AND created_at <= ?;
  `;

  const alikeServiceQuery = `
    SELECT
      paas.schedule_id,
      SUM(ps.amount) AS alike_service_total
    FROM
      patient_activity_alike_services AS paas
    JOIN
      patient_schedules AS ps
      ON paas.schedule_id = ps.id
    WHERE
      paas.patient_id = ?
      AND ps.created_at >= ? AND ps.created_at <= ?
    GROUP BY
      paas.schedule_id;
  `;

  const advanceLogQuery = `
    SELECT
      SUM(debit_amount) AS debit_amount_total,
      SUM(advance_amount) AS advance_amount_total
    FROM
      bill_patient_advance_log
    WHERE
      patient_id = ?
      AND created_at >= ? AND created_at <= ?;
  `;

  const consolidatedBillQuery = `
    SELECT
      total_amount,
      amount_paid
    FROM
      consolidated_bill
    WHERE
      patient_id = ?
      AND created_at >= ? AND created_at <= ?;
  `;

  pool.query(patientQuery, [patientId], (err, patientData) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    pool.query(
      schedulesQuery,
      [patientId, start, end],
      (err, schedulesData) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error' });
        }

        pool.query(
          procedureServiceQuery,
          [patientId, start, end],
          (err, procedureServiceData) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Database error' });
            }

            pool.query(
              fbAmountQuery,
              [patientId, start, end],
              (err, fbAmountData) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ error: 'Database error' });
                }

                pool.query(
                  extraServiceQuery,
                  [patientId, start, end],
                  (err, extraServiceData) => {
                    if (err) {
                      console.error(err);
                      return res.status(500).json({ error: 'Database error' });
                    }

                    pool.query(
                      alikeServiceQuery,
                      [patientId, start, end],
                      (err, alikeServiceData) => {
                        if (err) {
                          console.error(err);
                          return res.status(500).json({ error: 'Database error' });
                        }

                        pool.query(
                          advanceLogQuery,
                          [patientId, start, end],
                          (err, advanceLogData) => {
                            if (err) {
                              console.error(err);
                              return res.status(500).json({ error: 'Database error' });
                            }

                            pool.query(
                              consolidatedBillQuery,
                              [patientId, start, end],
                              (err, consolidatedBillData) => {
                                if (err) {
                                  console.error(err);
                                  return res.status(500).json({ error: 'Database error' });
                                }

                                const response = {
                                  patientData: patientData[0],
                                  schedulesData: schedulesData[0],
                                  procedureServiceData: procedureServiceData[0],
                                  fbAmountData: fbAmountData[0],
                                  extraServiceData: extraServiceData[0],
                                  alikeServiceData: alikeServiceData[0],
                                  advanceLogData: advanceLogData[0],
                                  consolidatedBillData: consolidatedBillData[0],
                                };

                                res.json(response);
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});


app.get('/branchSummary', (req, res) => {
  const branchId = req.query.branch_id;
  const start = req.query.start;
  const end = req.query.end;

  if (!branchId) {
    return res.status(400).json({ error: 'Missing required branch_id parameter' });
  }

  const patientBranchQuery = `
    SELECT
      id AS patient_id,
      branch_id
    FROM
      patients
    WHERE
      branch_id = ?
      AND created_at >= ?
      AND created_at <= ?;
  `;


  pool.query(
    patientBranchQuery,
    [branchId, start, end], // Pass start and end dates as parameters
    (err, patientBranchData) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }

      const patientIds = patientBranchData.map(patient => patient.patient_id);

    

    const billInvoicesQuery = `
      SELECT
        SUM(total_amount) AS total_amount_paid
      FROM
        bill_invoices
      WHERE
        patient_id IN (?)
        AND status = 'Paid';
    `;

    const consolidatedBillQuery = `
      SELECT
        SUM(amount_paid) AS total_amount_paid
      FROM
        consolidated_bill
      WHERE
        patient_id IN (?)
        AND payment_status = 'Paid';
    `;

    const procedureServiceQuery = `
      SELECT
        SUM(procedure_service_amount) AS procedure_service_total
      FROM
        patient_activity_procedure_service
      WHERE
        patient_id IN (?)
        AND invoice_status = 'Billed';
    `;

    const billInvoiceItemsQuery = `
      SELECT
        SUM(total_amount) AS billed_total_amount
      FROM
        bill_invoice_items
      WHERE
        patient_id IN (?)
        AND type = 'billed';
    `;

    const alikeServicesQuery = `
      SELECT
        paas.patient_id,
        SUM(ps.amount) AS alike_service_total
      FROM
        patient_activity_alike_services AS paas
      JOIN
        patient_schedules AS ps
        ON paas.schedule_id = ps.id
      WHERE
        paas.patient_id IN (?)
      GROUP BY
        paas.patient_id;
    `;

    const fbAmountQuery = `
      SELECT
        SUM(fb_amount) AS fb_amount_total
      FROM
        patient_activity_fb
      WHERE
        patient_id IN (?)
        AND invoice_status = 'billed';
    `;

    pool.query(
      billInvoicesQuery,
      [patientIds],
      (err, billInvoicesData) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error' });
        }

        pool.query(
          consolidatedBillQuery,
          [patientIds],
          (err, consolidatedBillData) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Database error' });
            }

            pool.query(
              procedureServiceQuery,
              [patientIds],
              (err, procedureServiceData) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ error: 'Database error' });
                }

                pool.query(
                  billInvoiceItemsQuery,
                  [patientIds],
                  (err, billInvoiceItemsData) => {
                    if (err) {
                      console.error(err);
                      return res.status(500).json({ error: 'Database error' });
                    }

                    pool.query(
                      alikeServicesQuery,
                      [patientIds],
                      (err, alikeServicesData) => {
                        if (err) {
                          console.error(err);
                          return res.status(500).json({ error: 'Database error' });
                        }

                        pool.query(
                          fbAmountQuery,
                          [patientIds],
                          (err, fbAmountData) => {
                            if (err) {
                              console.error(err);
                              return res.status(500).json({ error: 'Database error' });
                            }

                            const response = {
                              total_amount_paid: billInvoicesData[0].total_amount_paid || 0,
                              consolidated_total_amount_paid: consolidatedBillData[0].total_amount_paid || 0,
                              procedure_service_total: procedureServiceData[0].procedure_service_total || 0,
                              billed_total_amount: billInvoiceItemsData[0].billed_total_amount || 0,
                              alike_service_data: alikeServicesData,
                              fb_amount_total: fbAmountData[0].fb_amount_total || 0,
                            };

                            res.json(response);
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});



app.get('/branchSummaryPending', (req, res) => {
  const branchId = req.query.branch_id;
  const start = req.query.start;
  const end = req.query.end;

  if (!start || !end) {
    return res.status(400).json({ error: 'Missing required start and end date parameters' });
  }

  let branchFilter = '';
  let branchGrouping = '';

  if (branchId) {
    branchFilter = ' AND branch_id = ?';
    branchGrouping = ' GROUP BY branch_id, branch_name';
  }

  const patientBranchQuery = `
    SELECT
      p.id AS patient_id,
      p.branch_id
    FROM
      patients p
    WHERE
      p.created_at >= ? AND p.created_at <= ?${branchFilter};
  `;

  pool.query(patientBranchQuery, [start, end, branchId], (err, patientBranchData) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    const patientIds = patientBranchData.map(patient => patient.patient_id);

    const billInvoicesQuery = `
      SELECT
        SUM(total_amount) AS total_amount_pending
      FROM
        bill_invoices
      WHERE
        patient_id IN (?)
        AND status != 'Pending';
    `;

    const consolidatedBillQuery = `
      SELECT
        SUM(amount_paid) AS total_amount_pending
      FROM
        consolidated_bill
      WHERE
        patient_id IN (?)
        AND payment_status = 'Pending';
    `;

    const procedureServiceQuery = `
      SELECT
        SUM(procedure_service_amount) AS procedure_service_total
      FROM
        patient_activity_procedure_service
      WHERE
        patient_id IN (?)
        AND invoice_status = 'Raised';
    `;

    const billInvoiceItemsQuery = `
      SELECT
        SUM(total_amount) AS billed_total_amount
      FROM
        bill_invoice_items
      WHERE
        patient_id IN (?)
        AND type = 'pending';
    `;

    const fbAmountQuery = `
      SELECT
        SUM(fb_amount) AS fb_amount_total
      FROM
        patient_activity_fb
      WHERE
        patient_id IN (?)
        AND invoice_status = 'pending';
    `;

    pool.query(
      billInvoicesQuery,
      [patientIds],
      (err, billInvoicesData) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error' });
        }

        pool.query(
          consolidatedBillQuery,
          [patientIds],
          (err, consolidatedBillData) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Database error' });
            }

            pool.query(
              procedureServiceQuery,
              [patientIds],
              (err, procedureServiceData) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ error: 'Database error' });
                }

                pool.query(
                  billInvoiceItemsQuery,
                  [patientIds],
                  (err, billInvoiceItemsData) => {
                    if (err) {
                      console.error(err);
                      return res.status(500).json({ error: 'Database error' });
                    }

                    pool.query(
                      fbAmountQuery,
                      [patientIds],
                      (err, fbAmountData) => {
                        if (err) {
                          console.error(err);
                          return res.status(500).json({ error: 'Database error' });
                        }

                        const response = {
                          total_cancelled_service: billInvoicesData[0].total_amount_pending || 0,
                          consolidated_total_amount_pending: consolidatedBillData[0].total_amount_pending || 0,
                          procedure_service_total: procedureServiceData[0].procedure_service_total || 0,
                          billed_total_amount: billInvoiceItemsData[0].billed_total_amount || 0,
                          fb_amount_total: fbAmountData[0].fb_amount_total || 0,
                        };

                        res.json(response);
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});



  app.get('/patientDischargeSummary', (req, res) => {
    const start = req.query.start;
    const end = req.query.end;
  
    if (!start || !end) {
      return res.status(400).json({ error: 'Missing required start and end dates' });
    }
  
    const dischargeQuery = `
      SELECT
        pd.id AS discharge_id,
        pd.lead_id,
        pd.discharge_date,
        pd.discharge_type,
        l.branch_id
      FROM
        patient_discharge pd
      JOIN
        leads l ON pd.lead_id = l.id
      WHERE
        pd.discharge_date >= ?
        AND pd.discharge_date <= ?
      ORDER BY
        pd.discharge_date;
    `;
  
    pool.query(dischargeQuery, [start, end], (err, dischargeData) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
  
      const dischargeGroups = {};
      dischargeData.forEach(discharge => {
        const dischargeType = discharge.discharge_type;
        if (!dischargeGroups[dischargeType]) {
          dischargeGroups[dischargeType] = [];
        }
        dischargeGroups[dischargeType].push(discharge);
      });
  
      const branchDischargeCounts = {};
      dischargeData.forEach(discharge => {
        const branchId = discharge.branch_id;
        if (branchId) {
          branchDischargeCounts[branchId] = (branchDischargeCounts[branchId] || 0) + 1;
        }
      });
  
      const branchIds = Object.keys(branchDischargeCounts);
      const branchesQuery = `
        SELECT
          id AS branch_id,
          branch_name
        FROM
          master_branches
        WHERE
          id IN (?);
      `;
  
      pool.query(branchesQuery, [branchIds], (err, branchData) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error' });
        }
  
        const branchNameGroups = {};
        branchData.forEach(branch => {
          const branchId = branch.branch_id;
          const branchName = branch.branch_name;
          branchNameGroups[branchName] = {
            branch_id: branchId,
            total_discharge: branchDischargeCounts[branchId] || 0,
          };
        });
  
        const totalDischarge = dischargeData.length;
  
        const response = {
          total_discharge: totalDischarge,
          discharge_groups: dischargeGroups,
          branch_name_groups: branchNameGroups,
        };
  
        res.json(response);
      });
    });
  });
  
  
  


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
