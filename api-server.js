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

app.delete("/api/user/skill", jsonParser, checkJwt, (req, res)=>{
  const body = req.body;
  console.log('body body', body);
  const auth0Id = req.user.sub.split('|')[1];
  console.log('auth0Id', auth0Id, body);
 
       isUserExist(auth0Id)
       .then( async (result) =>{
         console.log('result ', result);
         const deleteSkill = await deleteSkill(body.skillId);
       }).catch(e=>{
          console.log('exception ');
       })
});
app.post("/api/user/skill", jsonParser, checkJwt, (req,res)=>{
      
  const body = req.body;
  console.log('body body', body);
  const auth0Id = req.user.sub.split('|')[1];
  console.log('auth0Id', auth0Id, body);
 
       isUserExist(auth0Id, body.email)
       .then( async (result) =>{
          console.log('result result ', result);
          if(result.length >0){
            //add new skill
            console.log('body.newSkill ', body.newSkill && body.newSkill.length);
            const cond = (body.newSkill && body.newSkill.length >0);
            console.log(' cond ', cond);
            if( cond ){
              console.log('in if if if if ');
              const skill =  await insertSkill(body.newSkill, result[0].userId);
              console.log('skill ', skill);
              const newlyUser =  await isUserExist(auth0Id, body.email);
              const skills = await getSkills( newlyUser[0].userId);
              res.status(200).json({
                newlyUser: newlyUser,
                skills: skills,
              })
            }else{
              console.log(' else else else ')
              const newlyUser =  await isUserExist(auth0Id, body.email);
              const skills = await getSkills( newlyUser[0].userId);
              res.status(200).json({
                newlyUser: newlyUser,
                skills: skills,
              })
            }
            
          }else{
            // create new user 
            let newUser = await insertUser( body.name, auth0Id, 
              body.profileDescription, body.email,body.city);
            console.log('newUser ', newUser);
            const newlyUser =  await isUserExist(auth0Id, body.email);
            
            res.status(200).json({
              newlyUser: newlyUser,
            })
          }
       }).catch(e=>{
          console.log(' exception occur ', e);
       });
})

function insertSkill(name, userId) {
  console.log('userId userId', userId);
    const sql = `INSERT into Skill ( userId, skillName) VALUES (${userId},${ mysql.escape(name) })`;
    console.log('sql sql', sql);
    return new Promise( (resolve, reject)=>{
    connection.query(sql,function (err, result, fields) {
      if (err) {
        reject(err);
      }
      resolve(result);
   });
  });
}

function getSkills(userId){

  var sql = `SELECT * FROM Skill where userId = ${ userId}`;
  console.log('getSkills sql ', sql);
  return new Promise( (resolve, reject)=>{
      connection.query(sql, function (err, result, fields){
        if (err) {
          reject(err);
        }
        resolve(result);
      });
  });
}

function isUserExist (auth0Id, email){

  const sql = `Select * from User where auth0Id = ${ mysql.escape(auth0Id) } and email = ${ mysql.escape(email) }`
  console.log('isUserExist sql ', sql);
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
  console.log( '>>>>>>>>', name, email, auth0Id, profileDescription, email, city)
  const sql = `INSERT into User ( name, auth0Id,
    profileDescription, email, city ) VALUES 
  (${mysql.escape(name)},${ mysql.escape(auth0Id)},
  ${ mysql.escape(profileDescription)},${ mysql.escape(email)},
  ${ mysql.escape(city)})`;
  console.log('insert user sql ', sql);
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
