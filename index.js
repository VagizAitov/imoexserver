const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "stonks",
});

const PORT = process.env.PORT || 8082;
const SECRET = process.env.SECRET || "TOKENJWT";
const jt = jwt.sign(
  { id: 1730975872883, name: "Vagiz", pass: "qwerty12345" },
  "TOKENJWT"
);
console.log(jt);

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.get("/jwtCheck", (req, res) => {
  let token;
  try {
    token = jwt.verify(req.query.token, SECRET);
  } catch (err) {
    token = { id: 0, login: "0", pass: "0" };
  }

  console.log(token);

  db.query(`SELECT * FROM users WHERE id=${token.id}`, (err, data) => {
    if (err) return res.json(err);
    if (
      data.length != 0 &&
      data[0].pass == token.pass &&
      data[0].login == token.login
    ) {
      return res.json(true);
    }
    return res.json(false);
  });
});
app.get("/getToken", (req, res) => {
  const token = jwt.sign(
    {
      id: req.query.id,
      pass: req.query.pass,
      login: req.query.login,
    },
    SECRET
  );
  console.log(token);
  return res.json(token);
});

app.use(express.json());

app.get("/users", (req, res) => {
  const sql = `SELECT * FROM users`;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/shares-count", (req, res) => {
  const sql = `SELECT COUNT(*) AS count FROM shares`;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/shares", (req, res) => {
  const sql = `SELECT * FROM shares ORDER BY ${
    req.query.by == "diff" ? "diffPercent" : "LAST"
  } ${req.query.d == 1 ? "DESC" : ""} LIMIT ${
    req.query.limit * req.query.page
  },${req.query.limit}`;

  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/bonds-count", (req, res) => {
  const sql = `SELECT COUNT(*) AS count FROM bonds`;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/bonds", (req, res) => {
  const sql = `SELECT * FROM bonds ORDER BY ${
    req.query.by == "diff" ? "diffPercent" : "LAST"
  } ${req.query.d == 1 ? "DESC" : ""} LIMIT ${
    req.query.limit * req.query.page
  },${req.query.limit}`;

  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/users", (req, res) => {
  const sql = "INSERT INTO users (`id`, `pass`, `login`, `token`) VALUES (?)";
  const values = [req.body.id, req.body.pass, req.body.login, req.body.token];

  db.query(sql, [values], (err, data) => {
    if (err) return res.json({ Message: "Err" });
    return res.json(data);
  });
});

app.post("/posts", (req, res) => {
  const sql = "INSERT INTO posts (`id`, `iduser`, `title`, `text`) VALUES (?)";
  const values = [req.body.id, req.body.iduser, req.body.title, req.body.text];
  db.query(sql, [values], (err, data) => {
    if (err) return res.json({ Message: "Err" });
    return res.json;
  });
});

app.get(`/posts`, (req, res) => {
  const sql = `SELECT * FROM posts`;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/empty", (req, res) => {
  const sql = `SELECT * FROM empty`;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get(`/posts/:id`, (req, res) => {
  const sql = `SELECT * FROM posts WHERE id = ${req.params.id}`;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get(`/posts/:uid/:id`, (req, res) => {
  const sql = `SELECT * FROM posts WHERE iduser = ${req.params.uid} AND id = ${req.params.id}`;

  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get(`/users/:login`, (req, res) => {
  const sql = `SELECT * FROM users WHERE login = '${req.params.login}'`;
  var token;
  db.query(sql, (err, data) => {
    if (data.length == 0) {
      token = "";
    } else {
      token = jwt.sign(
        { id: data[0].id, pass: data[0].pass, login: data[0].login },
        SECRET
      );
    }
    data.push(token);
    console.log(data);
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get(`/usersById`, (req, res) => {
  const sql = `SELECT * FROM users WHERE id = '${req.query.id}'`;

  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/likedSharesById", (req, res) => {
  const sql = `INSERT INTO likedshares (${`iduser`}, ${`idshare`}, ${`price`}) VALUES (${
    req.body.iduser
  }, ${req.body.idshare}, ${req.body.price})`; // сюда
  db.query(sql, (err, data) => {
    if (err) return res.json({ Message: `${err}` });
    return res.json(data);
  });
});
app.post("/likedBondsById", (req, res) => {
  const sql = "INSERT INTO likedbonds (`iduser`, `idbond`, `price`) VALUES (?)";
  const values = [req.body.iduser, req.body.idbond, req.body.price]; // сюда
  db.query(sql, [values], (err, data) => {
    if (err) return res.json({ Message: `${err}` });
    return res.json(data);
  });
});

app.get("/likedSharesById", (req, res) => {
  const sql = `SELECT * FROM likedshares WHERE iduser=${req.query.iduser}`;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/likedBondsById", (req, res) => {
  const sql = `SELECT * FROM likedbonds WHERE iduser=${req.query.iduser}`;
  console.log(sql);
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/likedSharesByIdShare", (req, res) => {
  const sql = `SELECT * FROM likedshares WHERE idshare=${req.query.idshare}`;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.delete("/likedSharesByIdShare", (req, res) => {
  const sql = `DELETE FROM likedshares WHERE idshare=${req.query.idshare}`;
  console.log(sql);
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.delete("/likedBondsByIdBond", (req, res) => {
  const sql = `DELETE FROM likedbonds WHERE idbond=${req.query.idbond}`;
  console.log(sql);
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/search", (req, res) => {
  const sql = `SELECT id, SHORTNAME, SECID, ISIN, OPEN, LAST, PRICEMONTHAGO, diffRubles, diffPercent, LOW, HIGH FROM shares WHERE SHORTNAME LIKE '%${req.query.search}%' UNION SELECT id, SHORTNAME, SECID, ISIN, OPEN, LAST, PRICEMONTHAGO, diffRubles, diffPercent, LOW, HIGH FROM bonds WHERE SHORTNAME LIKE '%${req.query.search}%'`;
  console.log(sql);
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/likedBondsAndShares", (req, res) => {
  const sql = `SELECT * FROM likedshares UNION SELECT * FROM likedbonds`;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/bondsById", (req, res) => {
  const sql = `SELECT * FROM bonds WHERE id=${req.query.id}`;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/sharesById", (req, res) => {
  const sql = `SELECT * FROM shares WHERE id=${req.query.id}`;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.listen(PORT, (err) => {
  console.log(`${PORT}`, err);
  setInterval(() => axios.get("http://localhost:8082/empty"), 2500);
});
