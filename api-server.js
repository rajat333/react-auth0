const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const authConfig = require("./src/auth_config.json");
const mysql = require('mysql');
const bodyParser = require('body-parser')

const app = express();

const connection = mysql.createConnection({
  connectionLimit: 5,
  host: 'sql12.freemysqlhosting.net',
  user: 'sql12378623',
  password: 'PBQp9vimSp',
  database: 'sql12378623'
});
connection.connect((err) => {
  console.log('db connection');
  if (err) throw err;
  console.log('Connected!');
});
const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

if (!authConfig.domain || !authConfig.audience) {
  throw new Error(
    "Please make sure that auth_config.json is in place and populated"
  );
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));
app.use(bodyParser.json({ type: 'application/*+json' }));
const jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"]
});

app.get("/api/external", checkJwt, (req, res) => {
  console.log('req req',req.user);
  res.send({
    msg: "Your access token was successfully validated!"
  });
});

app.post("/api/profileUpdate", jsonParser, checkJwt, (req, res) => {
  const body = req.body;
  const auth0Id = req.user.sub.split('|')[1];
  console.log('auth0Id', auth0Id, body);
  isUserExist( auth0Id)
  .then( result=>{  
      console.log(' result >>>>>>>>>>>>', result);
      if( result.length === 0){
        console.log(' new user ');
        // new user 
          return insertUser(body.name,auth0Id, body.profileDescription,body.email, body.city);
      }else{
        // update user 
        console.log(' existing user update ')
        return updateUser(body, auth0Id);
      }    
  }).then( userDetails =>{
      // insert skills based on user
      console.log(' user details ', userDetails);
      if( body.skills) {
          return updateSkills(body.skills);
      }

  }).catch(e=>{
    console.log('Exception occur', e);
  })
  
});
app.post("/api/user/skill", jsonParser, checkJwt, (req,res)=>{
      
  const body = req.body;
  console.log('body body', body);
  const auth0Id = req.user.sub.split('|')[1];
  console.log('auth0Id', auth0Id, body);
 
       isUserExist(auth0Id)
       .then( async (result) =>{
          console.log('result result ', result);
          if(result.length >0){
            //add new skill
            const skill =  await insertSkill(body.skillName);
            console.log('skill ', skill);
            res.status(200).json({
              success: true,
            })
          }else{
            res.status(401).json({
              error:'Unauthorised'
            });
          }
       }).catch(e=>{
          console.log(' exception occur ', e);
       });
})

function insertSkill(name) {
    const sql = `Insert into Skill( skillName ) Values (${ mysql.escape(name) })`;
    return new Promise( (resolve, reject)=>{
    connection.query(sql,function (err, result, fields) {
      if (err) {
        reject(err);
      }
      resolve(result);
   });
  });
}
function isUserExist (auth0Id){
  const sql = `Select * from User where auth0Id = ${ mysql.escape(auth0Id) }`
  return new Promise( function(resolve, reject) {
    connection.query(sql,function (err, result, fields) {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  })
};

function insertUser (name, auth0Id, profileDescription, email, city){
  const sql = `Insert Into User (name, auth0Id, profileDescription, email, city) 
   Values = ${ mysql.escape(name),mysql.escape(auth0Id),
     mysql.escape(profileDescription), mysql.escape(email), mysql.escape(city) }`
  return new Promise( function(resolve, reject) {
    connection.query(sql,function (err, result, fields) {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  })
};

function updateUser (body, auth0Id ){
  const sql = `UPDATE customers SET name = ${  mysql.escape(name) }, 
   profileDescription = ${ mysql.escape(profileDescription) }, 
   city = ${  mysql.escape(city) }, 
   WHERE auth0Id = ${  mysql.escape(auth0Id) }`;

  return new Promise( function(resolve, reject) {
    connection.query(sql,function (err, result, fields) {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  })
};

function updateSkills (skills ){

  let removeSkill = skills.filter( e => (e.removed === true));
  // let newSkill = 
  const sql = `UPDATE customers SET name = ${  mysql.escape(name) }, 
   profileDescription = ${ mysql.escape(profileDescription) }, 
   city = ${  mysql.escape(city) }, 
   WHERE auth0Id = ${  mysql.escape(auth0Id) }`;

  return new Promise( function(resolve, reject) {
    connection.query(sql,function (err, result, fields) {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  })
};




app.listen(port, () => console.log(`API Server listening on port ${port}`));
