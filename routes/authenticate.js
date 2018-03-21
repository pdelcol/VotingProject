var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('authenticate');

});

router.post('/add', function(req, res){
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var ssn = req.body.ssn;
    var street = req.body.street;
    var city = req.body.city;
    var state = req.body.state;
    var county = req.body.county;
    var results = db.query('SELECT UserID FROM Users WHERE FName=' + db.escape(firstname) + ' AND LName='+db.escape(lastname)+' AND ' +
        'SSN='+db.escape(ssn)+' AND Street='+db.escape(street)+' AND City=' + db.escape(city)+' AND ' +
        'StateCode='+db.escape(state)+' AND County='+db.escape(county)+';', function(error,results,field){
        if(error) throw error;
        if(results.length === 1) {
            //Authentication successful

            res.redirect('/votingbooth/')
        }else{
            //Authentication Unsuccessful
        }
    });
    console.log(results);
});

function serialize(data)
{

}

module.exports = router;