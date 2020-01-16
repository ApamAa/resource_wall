
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
    let userID = req.session.userId;
    console.log(userID);
    let query = `SELECT * FROM (SELECT x.id,title,description,url,user_id,category_id,name,category_photo_url,y.res_id,y.avg_rating FROM resources x
      JOIN categories ON categories.id = category_id
      JOIN (SELECT resources.id as res_id, round(avg(comment_likes.rating),1) as avg_rating FROM resources
            LEFT JOIN comment_likes ON resource_id = resources.id
            GROUP BY resources.id) y
            ON x.id = y.res_id) t1
      LEFT OUTER JOIN (SELECT rating, like_this, user_id, resource_id FROM comment_likes) t2 ON t1.id = t2.resource_id;`;

    // console.log(query);
    db.query(query)
      .then(data => {
        const queryResult = data.rows;
        console.log(queryResult);
        res.render("index",{allResources : queryResult, userID : userID});
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.get("/cat/:id", (req, res) => {
    let userID = req.session.userId;
    let resourceID = req.params.id;
    console.log(resourceID);
    let query = `SELECT * FROM resources
                  JOIN categories ON categories.id = category_id
                  WHERE categories.name = $1;`;

    console.log(query);
    db.query(query,[resourceID])
      .then(data => {
        const resource = data.rows;
        console.log(resource);
        res.render("index",{ allResources : resource, userID : userID});
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/search", (req, res) => {
    let userID = req.session.userId;
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
        res.render("index", {allResources :searchedResource, userID : userID});
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get("/addResource", (req, res) => {
    let userID = req.session.userId;
    res.render("addResource", {userId : userID});
  });


  router.post("/addResource", (req, res) => {
    let title = req.body.title;
    let description = req.body.description;
    let url = req.body.url;
    let userID = req.session.userId;
    let category = Number(req.body.category_id);

    //res.json([title, description, url, userID, category]);
    db.query(`INSERT INTO resources(title, description, url, user_id, category_id)
              VALUES($1, $2, $3, $4, $5);`, [title, description, url, userID, category])
      .then(() => {
        res.redirect("/");
      })
      .catch(err => {
        res.send(err);
      });
  });

  router.get("/review/:id", (req, res) => {
    let id = Number(req.params.id);
    let userID = req.session.userId;
    db.query(`SELECT resources.id,title, description, url, categories.name as name
    FROM resources
    JOIN categories ON categories.id = category_id
    WHERE resources.id = $1;`, [id])
      .then(data => {
        let resource = data.rows[0];
        db.query(`SELECT * FROM comment_likes WHERE resource_id = $1`,[id]).then((data)=>{
          let allComments = data.rows;
          res.render("review", {resource : resource, userId : userID , allComments : allComments});
          //res.json({resource : resource, userId : userID , allComments : allComments});
        }).catch(err => {
          res.send(err);
        });
      })
      .catch(err => {
        res.send(err);
      });
  });

  router.post("/review/:id",(req, res) => {

    let rating = Number(req.body.rating);
    let like_this = Boolean(req.body.like);
    let description = req.body.comment;
    let userID = req.session.userId;
    let id = Number(req.params.id);
    db.query(`SELECT count(*) FROM comment_likes WHERE user_id = $1 AND resource_id = $2`,[userID,id]).then((data)=> {
      if (Number(data.rows[0].count) === 0) {
        db.query(`INSERT INTO comment_likes (rating, description, like_this, user_id, resource_id) VALUES ($1,$2,$3,$4,$5);`,[rating, description, like_this,userID,id]).then(() => {
          res.redirect(`/resources/review/${id}`);
          //db.query(`SELECT * FROM comment_likes`).then((data)=> res.json(data.rows))
        })
          .catch(err => {
            res.send(err);
          });
      } else {
        db.query(`UPDATE comment_likes SET rating = $1, description = $2, like_this = $3  WHERE user_id = $4 AND resource_id = $5;`,[rating, description, like_this,userID,id]).then(() => {
          res.redirect(`/resources/review/${id}`);
          //db.query(`SELECT * FROM comment_likes`).then((data)=> res.json(data.rows));
        })
          .catch(err => {
            res.send(err);
          });
      }
    })
      .catch(err => {
        res.send(err);
      });
  });


  return router;
};

