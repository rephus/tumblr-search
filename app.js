var express = require("express"),
app = express(),
http = require('http'),
cheerio = require('cheerio'), //html scrapping
config = require('./config.json');

app.use(express.static(__dirname + '/public'));

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

var domain = config.domain;

app.get('/', function(req, res){
  fs.readFile('./index.html',function (err, data){
    res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
    res.write(data);
    res.end();
  });
});

app.get("/search", function(req,res){

  var search = req.query.s,
  time = req.query.t;

  console.log("Filtering search " + search);
  searchTumblr(domain, search,time, function(err, result){
    res.json(result);
  });
});

var searchTumblr = function(domain, search,time, callback){
  if (!time) time = new Date().getTime();

  beforeTumblr(domain, time, function(err, html){
    if (err) console.log(err);
    processHtml(html, function(err, posts){
      var filtered = posts.filter(function (post) {
        //console.log(post);
        return post.title && post.img &&  post.title.contains(search);

      });
      console.log("Filtered " +filtered.length + " of " + posts.length);

      var lastDate = posts[posts.length-1].date;
      console.log("Last date " +lastDate);

      var lastTime = new Date(lastDate).getTime();
      var result = { time: time, results: filtered, count: filtered.length, total: posts.length, last_time: lastTime };
      callback(err, result);
    });
  });

}

var processHtml = function(html, callback){
  $ = cheerio.load(html);

  $posts = $('.post');
  var titles = [];
  $posts.each(function(i, elem){
    var img = $(elem).find(".tmblr-full img").attr("src"),
    title = $(elem).find(".post_title").html(),
    date = $(elem).find(".post_date").html(),
    url = $(elem).find("a").attr("href");
    titles.push({img: img, title: title, date: date, url: url});
  });

  callback(false, titles);
}
var beforeTumblr = function(domain, time, callback) {

  var timeSeconds = parseInt(time) / 1000;
  var startTime = Date.now(),
  path = encodeURI("/archive?before_time="+timeSeconds),
  uri = domain+path,
  data = "";

  console.log("Requesting " +uri);
  http.get(uri, function(resp){
    resp.on('data', function(chunk){
      data += chunk;
    });
    resp.on('end', function(){
      console.log("Request "+uri+" ended in "+(Date.now() - startTime )+" ms" );
      callback(false, data);
    });
  }).on("error", function(e){
    console.log("Request "+uri+" returned an error: "+e);
    callback("Request "+uri+" returned an error: "+e);
  });

}

var port = config.port;
app.listen(port);
console.log("Server started in http://localhost:"+port);
