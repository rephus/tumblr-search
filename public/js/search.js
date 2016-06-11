 var lastTime,
statusTimeout ;
 
 $( document ).ready(function() {
   
    $("#search-input").keyup(function (e) {
        if (e.keyCode == 13)  newSearch();
    });
    $("#search-button").click(function(){
	newSearch();
    });
    $("#search-more").click(function(){
      search();
    });
});
 

var newSearch = function(){
  lastTime = new Date().getTime();
  $("#results").empty();
  search();
}
var search = function(){
  var s= $("#search-input").val();
      url= "/search?s="+s+"&t="+lastTime;
      
  log("Requesting " + url);
  
  $.ajax({
    url: url,
    success: function(json){
      log("Loading "+json.count + " results of " + json.total);
      
      var $table =$("#results");
      for (var i=0;i<json.results.length;i++){
	var j= json.results[i];
	console.log(j);
	var rowTemplate = 
	"<tr>"+
	  "<td><a target='_blank' href='"+j.url+"'><img src='"+j.img+"'/></a></td>"+
	  "<td>"+j.title+"</td>"+
	  "<td>"+j.date+"</td>"+
	"</tr>";
	$table.append(rowTemplate);
      }
      lastTime = json.last_time;
    }
  });
}

var log = function(status){
  clearTimeout(statusTimeout);
  $("#status").html(status);
  console.log(status);
  statusTimeout = setTimeout(function(){ $("#status").empty()}, 3000);
}