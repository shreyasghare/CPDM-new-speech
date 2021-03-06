const express = require('express');
const http = require('http');
let path = require('path');
let cors = require('cors');
const { check, validationResult } = require('express-validator');
const expressSanitizer = require('express-sanitizer');
const app = express();
const helmet = require('helmet');


app.use(expressSanitizer());
/*let auth_user;
const port = process.env.PORT || 4200;
app.use(cors());

app.use(express.static(`${__dirname}/dist/cpdm-service`))


app.get('/cecId',(req,res)=>{
    auth_user = req.header('auth_user');
    //console.log(`authenticated user: ${auth_user}`);
    //res.send(`authenticated user: ${auth_user}`);
    res.setHeader("Content-Type", "application/json");
    res.send({"cecId":"santosur"});
});

app.get('/*',(req,res) => res.sendFile(path.join(__dirname)));

// const server = http.createServer(app);

app.listen(port, () => console.log(`Example app listening on  port ${port}!`))
*/

const port = process.env.PORT || 4200;
app.use(cors());
app.options('*', cors())
//Added for Scava fixes, remove if causing issue
app.use(helmet());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods","POST, PUT, GET, OPTIONS,DELETE");
  next();
});

app.get('/cecId', [check('auth_user').not().contains('anony').trim().escape()], (req,res)=>{
  const sanitizeddString=req.header('auth_user');
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    res.setHeader("Content-Type", "application/json");
    if(undefined != sanitizeddString){
    res.send({"cecId":Buffer.from(sanitizeddString).toString('base64')}); //SCAVA fix, encoding the response
  }else{
    res.send({"cecId":""}) //Added empty to not break flow in local
  }
  } else {
    res.status(401).send(`User not authenticated.`);
  }
});



/* Server-side rendering */
function angularRouter(req, res) {

  /* Server-side rendering */
  res.render('index', { req, res });
  
  }

/* Root route before static files, or it will serve a static index.html, without pre-rendering */
app.get('/', angularRouter);

/* Serve the static files generated by the CLI (index.html, CSS? JS, assets...) */
app.use(express.static(`${__dirname}/dist/cpdm-service`))

/* Configure Angular Express engine */
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', 'dist/cpdm-service/');

/* Direct all routes to index.html, where Angular will take care of routing */
app.get('*', angularRouter);


app.listen(port, () => console.log(`Example app listening on  port ${port}!`))
