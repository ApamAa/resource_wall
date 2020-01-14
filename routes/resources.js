
/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
//resources.*, categories.*, avg(comment_likes.rating) as avg_rating
module.exports = (db) => {
  router.get("/", (req, res) => {
    let query = `SELECT * FROM resources x
                  JOIN categories ON categories.id = category_id
                  JOIN (SELECT resources.id, round(avg(comment_likes.rating),1) as avg_rating FROM resources
                        JOIN comment_likes ON resource_id = resources.id
                        GROUP BY resources.id) y
                        ON x.id = y.id;`;
    console.log(query);
    db.query(query)
      .then(data => {
        const queryResult = data.rows;
        console.log(queryResult[0]);
        res.render("index",{allResources : queryResult});
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.get("/:id", (req, res) => {
    let resourceID = req.params.id;
    console.log(resourceID);
    let query = `SELECT * FROM resources
                  JOIN categories ON categories.id = category_id
                  WHERE categories.name = $1;`;

    console.log(query);
    db.query(query,[resourceID])
      .then(data => {
        const resource = data.rows;
        res.render("index",{ allResources : resource });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/search", (req, res) => {
    let searchItem = req.body.searchItem;
    console.log(searchItem);

    let query = `SELECT * FROM resources
                JOIN categories ON categories.id = category_id
                WHERE description ILIKE $1
                OR name ILIKE $1
                OR title ILIKE $1
                OR url ILIKE $1;`;
    console.log(query);
    db.query(query,['%' + searchItem + '%'])
      .then(data => {
        const searchedResource = data.rows;
        console.log({searchedResource});
        res.render("index", {allResources :searchedResource});
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  router.get("/reviews/:id", (req, res) => {
    let resourceID = req.params.id;
    console.log(resourceID);
    let query = `SELECT * FROM resources
                  JOIN categories ON categories.id = category_id
                  WHERE resources.id = $1;`;

    console.log(query);
    db.query(query,[resourceID])
      .then(data => {
        const resource = data.rows;
        res.render("index",{ allResources : resource });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  return router;
};

