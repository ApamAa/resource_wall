
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
    console.log(userID)
    let query = `SELECT * FROM (SELECT x.id,title,description,url,user_id,category_id,name,category_photo_url,y.res_id,y.avg_rating FROM resources x
      JOIN categories ON categories.id = category_id
      JOIN (SELECT resources.id as res_id, round(avg(comment_likes.rating),1) as avg_rating FROM resources
            JOIN comment_likes ON resource_id = resources.id
            GROUP BY resources.id) y
            ON x.id = y.res_id) t1
      LEFT OUTER JOIN (SELECT rating, like_this, user_id, resource_id FROM comment_likes  WHERE user_id = $1) t2 ON t1.id = t2.resource_id`;

   // console.log(query);
    db.query(query,[userID])
      .then(data => {
        const queryResult = data.rows;
        //console.log(queryResult);
        res.render("index",{allResources : queryResult, userID : userID});
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.get("/:id", (req, res) => {
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


// needs fix
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
        res.render("review",{ allResources : resource });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

//needs fix
  router.post("/review/:id", (req, res) => {
    let resourceID = req.params.id;
    let comment = req.body.comment;
    let Like = req.body.liked;
    let rate = req.body.rate;
    let userID = req.session.userId;
    let query = `INSERT INTO comment_likes (rating, description, like_this, user_id, resource_id)
                 VALUES($1, $2, $3, $4, $5);`;
    console.log(query);
    db.query(query,[rate,comment,Like,userID,resourceID])
      .then(data => {
        const reviewResource = data.rows;
        console.log({reviewResource});
        res.redirect("index");
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
//needs fix
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
        res.render("review",{ allResources : resource });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

// needs fix
  router.post("/review/:id", (req, res) => {
    let resourceID = req.params.id;
    let comment = req.body.comment;
    let Like = req.body.liked;
    let rate = req.body.rate;
    let userID = req.session.userId;
    let query = `INSERT INTO comment_likes (rating, description, like_this, user_id, resource_id)
                 VALUES($1, $2, $3, $4, $5);`;
    console.log(query);
    db.query(query,[rate,comment,Like,userID,resourceID])
      .then(data => {
        const reviewResource = data.rows;
        console.log({reviewResource});
        res.redirect("/");
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  // have problems - needs to be removed and fixed back into review page
  router.get("/liked/:id", (req, res) => {
    console.log(req.params.id);
    let userID = req.session.userId;
    let query = `UPDATE comment_likes SET like_this = NOT like_this WHERE user_id = $1 AND resource_id = $2`;
    db.query(query,[userID,req.params.id]).then(data => {
      res.redirect("/");
    })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

    /*let query = `IF EXIST(SELECT * FROM comment_likes WHERE WHERE user_id = $1 AND resource_id = $2)
                   UPDATE comment_likes SET like_this = NOT like_this WHERE user_id = $1 AND resource_id = $2
                    ELSE INSERT INTO (id,rating,);`;
     let userID = 1;
     db.query(query,[userID,req.params.id])
       .then(data => {
         const reviewResource = data.rows;

         res.redirect("/");
       })
       .catch(err => {
         res
           .status(500)
           .json({ error: err.message });
       });*/

  });
  return router;
};

