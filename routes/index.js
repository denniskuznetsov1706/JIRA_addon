const fs = require("fs")
const fetch = require('node-fetch');

const mongoose  = require ('mongoose');
const { json } = require("body-parser");


module.exports = function (app, addon) {

    //fires after addon installation
    app.all('/installed', async function (req, res, next) {
        console.log("installation...")
        global.database.collection(global.JiraAccountInfoStore).findOne({"installed.clientKey": req.body.clientKey}, function (err, result) {
            if (err) console.log(err);
            if (!result) {
                global.database.collection(global.JiraAccountInfoStore).insertOne(req.body, async (err, res) => {
                    if (err) throw err;
                    next();
                });
            } else {
                global.database.collection(global.JiraAccountInfoStore).updateOne({"installed.clientKey": req.body.clientKey}, {$set: req.body}, function (err, res) {
                    next();
                });
            }
        });
    });

    //--------------DB requirements-------------------------
    mongoose.connect('mongodb+srv://bigxman:bigxman2021@cluster0.n8nbs.mongodb.net/DB',{
        useNewUrlParser:true,
        useFindAndModify:false
    })
    .then(()=>console.log('Connected'))
    .catch(err => console.log(err));

    
 const filterSchema = new mongoose.Schema({
     name:{
         type:String,
         required:true,
     },
     url:{
         type:String,
         required:true
     }
 });

 const users = mongoose.model('Filters',filterSchema);

 users.collection.drop();

//-------------------------------------------------------------




    

    app.get('/', function (req, res) {
        res.format({
            'text/html': function () {
                res.redirect('/atlassian-connect.json');
            },
            'application/json': function () {
                res.redirect('/atlassian-connect.json');
            }
        });
    });

   

//--------------------------------------------------
var ja;
console.log("try to fetch data....");
fetch('https://denyskuz.atlassian.net/rest/api/3/filter', { //get all filters from JIRA cloud
  method: 'GET',
  headers: {
    'Authorization': `Basic ${Buffer.from(
      'kuznetsov.dennis.1706@gmail.com:NUg54ZqoeTw3rqjIiaN946D8'
    ).toString('base64')}`,
    'Accept': 'application/json'    
}
})
.then(response => {
  console.log(
    `Response: ${response.status} ${response.statusText}`
  );
  return response.text();
})
  .then(text => {
      ja=JSON.parse(text);
         for (const t of ja)
     users.create({
        name: t.name,
        url: t.searchUrl
    });
   

    })
  
  .catch(err => console.error(err));

//-----------------Add data to DB----------------------------------




 

 












//-----------------------------------------------



    app.get('/main-page', addon.authenticate(), async function (req, res) {
        res.render("main-page",{
            ja,
            isit : 'true'
        })
    });

    app.post('/main-page', addon.checkValidToken(), async function (req, res) {
       
    });


    app.get('/filter-authenticate', addon.authenticate(), function (req, res) {
        //res.json({"title": "protected using authenticate"});
    }
);

app.get('/filter-check-valid-token', addon.checkValidToken(), function (req, res) {
        //res.json({"title": "protected using checkValidToken"});
    }
);

app.post('/filter', async function (req, res) {
     let info=req.body.filter;
     console.log("filter -"+info);

//---------------------------------------

var filterData;
fetch(info, {
  method: 'GET',
  headers: {
    'Authorization': `Basic ${Buffer.from(
      'kuznetsov.dennis.1706@gmail.com:NUg54ZqoeTw3rqjIiaN946D8'
    ).toString('base64')}`,
    'Accept': 'application/json'    
}
})
.then(response => {
  console.log(
    `Response: ${response.status} ${response.statusText}`
  );
  return response.text();
})
  .then(text => {
      filterData=JSON.parse(text);
      console.log(filterData.total.toString());


      //------------------sort data------------------------
      let statusDone = new Map();
      let statusIn = new Map();
      let statusDev = new Map();
      let statusB = new Map();
      let listAss = [];
      let f = [];
      for (let i=0; i<filterData.issues.length; i++)
    {
        //----------------------for status Done--------------------------
        if (filterData.issues[i].fields.status.name=="Done")
        {
                if (!statusDone.has(filterData.issues[i].fields.assignee.displayName))
                {
                        statusDone.set(filterData.issues[i].fields.assignee.displayName,1);
                        if(!(listAss.indexOf(filterData.issues[i].fields.assignee.displayName)!=-1))
                          listAss.push(filterData.issues[i].fields.assignee.displayName);
                }
                else {
                    statusDone.set(listAss[listAss.indexOf(filterData.issues[i].fields.assignee.displayName)],statusDone.get((listAss[listAss.indexOf(filterData.issues[i].fields.assignee.displayName)]))+1);
                }
        }
        //----------------------------end Done-------------------------------------------------------------

        //----------------------for status In progress--------------------------
        if (filterData.issues[i].fields.status.name=="In Progress")
        {
                if (!statusIn.has(filterData.issues[i].fields.assignee.displayName))
                {
                        statusIn.set(filterData.issues[i].fields.assignee.displayName,1);
                     if(!(listAss.indexOf(filterData.issues[i].fields.assignee.displayName)!=-1))
                          listAss.push(filterData.issues[i].fields.assignee.displayName);
                }
                else {
                    statusIn.set(listAss[listAss.indexOf(filterData.issues[i].fields.assignee.displayName)],statusIn.get((listAss[listAss.indexOf(filterData.issues[i].fields.assignee.displayName)]))+1);
                }
        }
        //----------------------------end In progress-------------------------------------------------------------

        //----------------------for status Dev--------------------------
        if (filterData.issues[i].fields.status.name=="Selected for Development")
        {
                if (!statusDev.has(filterData.issues[i].fields.assignee.displayName))
                {
                        statusDev.set(filterData.issues[i].fields.assignee.displayName,1);
                        if(!(listAss.indexOf(filterData.issues[i].fields.assignee.displayName)!=-1))
                          listAss.push(filterData.issues[i].fields.assignee.displayName);
                }
                else {
                    statusDev.set(listAss[listAss.indexOf(filterData.issues[i].fields.assignee.displayName)],statusDev.get((listAss[listAss.indexOf(filterData.issues[i].fields.assignee.displayName)]))+1);
                }
        }
        //----------------------------end Dev-------------------------------------------------------------
        //----------------------for status Log--------------------------
        if (filterData.issues[i].fields.status.name=="Backlog")
        {
                if (!statusB.has(filterData.issues[i].fields.assignee.displayName))
                {
                        statusB.set(filterData.issues[i].fields.assignee.displayName,1);
                        if(!(listAss.indexOf(filterData.issues[i].fields.assignee.displayName)!=-1))
                          listAss.push(filterData.issues[i].fields.assignee.displayName);
                }
                else {
                    statusB.set(listAss[listAss.indexOf(filterData.issues[i].fields.assignee.displayName)],statusB.get((listAss[listAss.indexOf(filterData.issues[i].fields.assignee.displayName)]))+1);
                }
        }
        //----------------------------end Log-------------------------------------------------------------

    }
      for (let i=0; i<listAss.length; i++)
         f.push({
             'done':statusDone.has(listAss[i]) ? statusDone.get(listAss[i]) : '0',
             'in':statusIn.has(listAss[i]) ? statusIn.get(listAss[i]) : '0',
             'dev':statusDev.has(listAss[i])? statusDev.get(listAss[i]) : '0',
             'b':statusDev.has(listAss[i])? statusDev.get(listAss[i]) : '0',
             'ass':listAss[i]
         })

         let listDone = Object.fromEntries(f);

       //  console.log(f[0].bugs);
        // console.log(statusDone.get(listAss[0]));
     //-----------------------------------------------------

    
   res.render('filter',{
       filterData,
       statusDone,
       listAss,
       f

   })


     

    })
  
  .catch(err => console.error(err));
//----------------------------
});

  














   

    // load any additional files you have in routes and apply those to the app
    {
        var path = require('path');
        var files = fs.readdirSync("routes");
        for (var index in files) {
            var file = files[index];
            if (file === "index.js") continue;
            // skip non-javascript files
            if (path.extname(file) != ".js") continue;

            var routes = require("./" + path.basename(file));

            if (typeof routes === "function") {
                routes(app, addon);
            }
        }
    }
};

