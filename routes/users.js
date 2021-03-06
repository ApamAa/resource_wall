/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  //rout for register
  router.get("/register", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.render("register", { users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/register", (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    db.query(`INSERT INTO users(name, email)
              VALUES($1, $2);`, [name, email])
      .then(() => {
        db.query(`SELECT id FROM users WHERE name = $1 AND email = $2`, [name, email])
          .then(data => {
            const id = data.rows[0].id;
            req.session.userId = id;
            res.redirect("/");
          })
          .catch(err => {
            res
              .status(500)
              .json({ error: err.message });
          });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });
  //rout for login
  router.get("/login", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.render("login", { users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.post("/login", (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    db.query(`SELECT id FROM users WHERE name = $1 AND email = $2`, [name, email])
      .then(data => {
        const id = data.rows[0].id;
        req.session.userId = id; // set the cookie for logged in user
        res.redirect("/");
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  //rout for logout
  router.get("/logout", (req, res) => {
    delete req.session.userId;
    res.redirect('/');
  });
  //rout for edit profile

  router.get("/editprofile", (req, res) => {
    let userID = req.session.userId;
    res.render("editprofile", { userID});
  });


  router.post("/editprofile", (req, res) => {
    let userID = req.session.userId;
    let name = req.body.name;
    let email = req.body.email;
    db.query(`UPDATE users SET  name = $1, email = $2 WHERE id = $3;`, [name, email,userID])
      .then(data => {

        res.redirect("/");
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  return router;
};
