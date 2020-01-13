/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    let query = `SELECT * FROM categories`;
    console.log(query);
    db.query(query)
      .then(data => {
        const categories = data.rows;
        console.log({});
        res.render("index",{categories});
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get("/:id", (req, res) => {
    let category = req.params.id;
    let query = `SELECT * FROM resources
                  JOIN categories
                  ON categories.id = category_id
                  WHERE name = $1;`;
    console.log(query);
    db.query(query,[category])
      .then(data => {
        const resource = data.rows;
        res.json({ resource });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  return router;
};
