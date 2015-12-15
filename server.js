
var express    = require('express');        
var app        = express();                 
var bodyParser = require('body-parser');

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/remixjobsdb'); 

var Job     = require('./app/models/job');



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        


var router = express.Router();              

router.route('/jobs')

    
    .post(function(req, res) {
        
        var job = new Job();     
        job.title = req.body.title;  
		job.company = req.body.company;
		job.localization = req.body.localization;
		job.category = req.body.category;
		job.description = req.body.description;
		job.contract = req.body.contract;
		job.date = req.body.date; 
		job.tags = req.body.tags;
        
        job.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Job created!' });
        });
        
    })
	
	.get(function(req, res) {
        Job.find(function(err, jobs) {
            if (err)
                res.send(err);

            res.json(jobs);
        });
    });
	
router.route('/jobs/:job_id')

    
    .get(function(req, res) {
        Job.findById(req.params.job_id, function(err, job) {
            if (err)
                res.send(err);
            res.json(job);
        });
    })

    
    .put(function(req, res) {

        
        Job.findById(req.params.job_id, function(err, job) {

            if (err)
                res.send(err);

            job.title = req.body.title;  
			job.company = req.body.company;
			job.localization = req.body.localization;
			job.category = req.body.category;
			job.description = req.body.description;
			job.contract = req.body.contract;
			job.date = req.body.date;
			job.tags = req.body.tags;
            
            job.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Job updated!' });
            });

        });
    });
	
router.route('/companies')	

	.get(function(req, res) {
        Job.find(function(err, jobs) {
            if (err)
                res.send(err);
			
            res.json(jobs);
        });
    });

app.get('/scrape', function(req, res){

Job.remove({},function(err){
	
});

for(i=1;i<50;i++){
url = "https://remixjobs.com/?page="+i+"&in=all";

request(url, function(error, response, html){
    if(!error){
        var $ = cheerio.load(html);
		$('.jobs-list').children().each(
			function(){
				var data =$(this);
				var job = new Job();
				job.title = data.find('.job-link').text();
				job.company = data.find('.company').text();
				job.localization = data.find('.workplace').text();
				job.category = data.find('.job-link').attr("href").split("/")[2];
				job.description = " ";
				job.contract = data.find('.contract').attr("data-contract-type");
				job.date = data.find('.job-details-right').text();
				data.find('.tag').each(function(){
					var tag=$(this).attr("data-tag-name");
					job.tags.push(tag);
				})
				
				job.save(function(err) {
					if (err)
						res.send(err);
					});
			});
}})
}
});	
	
router.use(function(req, res, next) {
    
    console.log('Something is happening.');
    next(); 
});


router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});


app.use('/api', router);


app.listen(port);
console.log('Magic happens on port ' + port);