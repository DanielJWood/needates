// $(function() {
//   $('form').submit(function(){
//     console.log('test')
//     $.post('http://localhost:4000/', function() {
//       window.location = 'http://google.com';
//     });
//     return false;
//   });
// });

// $("#submit").click(function(e){
//     e.preventDefault();
//     window.location="article/";
// });


// Initiate pym
var pymChild = new pym.Child();


  window.onload = function(){
    pymChild.sendHeight();
  };

  $(window).load(function(){
    pymChild.sendHeight();    
  });      

// inital data
var datesdata = [
  {
    "id": "Northeast",
    "short_id": "NE",
    "available": 0,
    "datesAvail": []
  },
  {
    "id": "Midwest",
    "short_id": "MW",
    "available": 0,
    "datesAvail": []
  },
  {
    "id": "Southeast",
    "short_id": "SE",
    "available": 0,
    "datesAvail": []
  },
  {
    "id": "Southwest",
    "short_id": "SW",
    "available": 0,
    "datesAvail": []
  },
  {
    "id": "West",
    "short_id": "WC",
    "available": 0,
    "datesAvail": []
  }
];


function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}
// Insert your scripts here

var width = parseInt(d3.select("#map").style("width")),
  height = width / 2;

var boxWidth = 0,
    boxHeight = 0;

var iconWidth = 20,
    iconHeight = 20;

var centered = [];

// main projection
var projection = d3.geo.albers()
    .scale(width)
    .translate([width / 2, ((height / 2))])  ;

var path = d3.geo.path()
    .projection(projection);

// projection for the drop shadow, coastline
var offset = 1;

var projection2 = d3.geo.albers()
    .scale(width)
    .translate([((width / 2) + (offset)), ((height / 2) + (offset))])  ;

var path2 = d3.geo.path()
    .projection(projection2);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

var rect = svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g");

// d3.json("js/statesregionspr.json", function(error, regions) {
d3.json("data/usa2.json", function(error, regions) {
  if (error) throw error;
  d3.csv("data/cities.csv", function(error, cities){
	 if (error) throw error;
    d3.csv("data/dates/dates_9_12_16.csv", function(error, dates){
      if (error) throw error;

    //populate the array that will fill the bubbles with the number of dates  
    for (var x = datesdata.length - 1; x >= 0; x--) {
      for (var z = dates.length - 1; z >= 0; z--) {    
        if (datesdata[x].id === dates[z].region) {
          datesdata[x].available += 1;
          datesdata[x].datesAvail.push(dates[z])
        } 
      };  
    };    

    window.onload = function(){
      var dataLoad = topojson.feature(regions, regions.objects.regions3).features;
      var hash = (window.location.hash).replace('#', '');
      if (hash.length != 0) {
        for (var i = 0; i < dataLoad.length; i++) {
          dhash = dataLoad[i].properties.name.replace(/\s+/g, '-').toLowerCase();
          if (dhash == hash) {
            clicked(dataLoad[i])
            break
          };
        };      
      }

      // Make sure its big enough on the parent!
      pymChild.sendHeight();
    }

  // The background coastal boundary goes first cuz its underneath
    g.append("path")
      .datum(topojson.mesh(regions, regions.objects.regions3, function(a, b) { 
        return a === b }))
      .attr("d", function(d){      
        return path(d)
      })
      .attr("d", path2)
      .attr("class", "coast-boundary");  

  // next the regions color
  	var regionContainers = g.selectAll(".region")
        .data(topojson.feature(regions, regions.objects.regions3).features);

    var regionContainers2 = regionContainers.enter().append("g")
        .on("mouseenter",function(d){
          d3.select(this).selectAll("path")
            .style("fill","rgb(180,49,60)")
        })
        .on("mouseleave",function(d){
          d3.select(this).selectAll("path")
            .style("fill","#E7BBBF")
        });;

    var regionContainersGeo = regionContainers2.append("path")
        .attr("class", function(d) { return "region " + d.id; })
        .attr("d", path)
        .on("click", clicked)      

  // states boundary
  	g.append("path")
      .datum(topojson.mesh(regions, regions.objects.states1, function(a, b) { return a !== b}))
      .attr("d", path)
      .attr("cursor","pointer")
      .attr("class", "subunit-boundary");	    

  // Regions boundary
   g.append("path")
      .datum(topojson.mesh(regions, regions.objects.regions3, function(a, b) { 
        return a !== b }))
      .attr("d", path)
      .attr("class", "main-boundary");

    var BigBubbles = regionContainers2.append("circle")
          .attr("class", "bubble")
          .attr("transform", function(d) {           
            var center = path.centroid(d)
            return "translate(" + center + ")"; })          
          .attr("r", function(d) { 
            return width / 25;            
          })
          .on("click", clicked)
           // .attr("text", function(d){ return d.properties.name})          
    
      // Add titles to regions
    var regionTitles = g.selectAll(".region-title")
      .data(topojson.feature(regions, regions.objects.regions3).features.filter(function(d){return d.id !== "Null"}))
      .enter()
      .append("svg:text")
      .attr("class","region-title")
      .attr("id", function(d){
        return d.id + "-title"
      })
      .attr("transform", function(d) { 
        var center = path.centroid(d)
        return "translate(" + center + ")"; 
      })          
      .attr("text-anchor","middle")
      .on("click", clicked);

    // Append Sum of Dates 
      regionTitles.append("tspan")
      .attr("y",function(d){
        for (var i = datesdata.length - 1; i >= 0; i--) {
          if (datesdata[i].id === d.id) {
            if (datesdata[i].available !== 0) {
              needates = datesdata[i].available;  
              return "0"
            } else {
              return "-5"
            }            
            break;
          };
        };
      })
      .text(function(d){
        var needates;
        for (var i = datesdata.length - 1; i >= 0; i--) {
          if (datesdata[i].id === d.id) {
            if (datesdata[i].available !== 0) {
              needates = datesdata[i].available;  
              return needates;
            } else {
              return "Coming"              
            }            
            break;
          };
        };        
      })
      .attr("class",function(d){
        for (var i = datesdata.length - 1; i >= 0; i--) {
          if (datesdata[i].id === d.id) {
            if (datesdata[i].available !== 0) {              
              return "large-bubble";
            } else {
              return "small-bubble"              
            }            
            break;
          };
        };        
      })

      regionTitles.append("tspan")
      .text(function(d){
        for (var i = datesdata.length - 1; i >= 0; i--) {
          if (datesdata[i].id === d.id) {
            if (datesdata[i].available !== 0) {
              return "Dates"
            } else {
              return "Soon"
            }            
            break;
          };
        };
      })
      .attr("class","dates")
      .attr("x",0)
      .attr("y",function(d){
        for (var i = datesdata.length - 1; i >= 0; i--) {
          if (datesdata[i].id === d.id) {
            if (datesdata[i].available !== 0) {
              needates = datesdata[i].available;  
              return "20"
            } else {
              return "15"
            }            
            break;
          };
        };
      });

      // Add city points
    var citys = g.selectAll(".bubblecontainer")
      .data(cities)
      .enter().append("g").attr("class","bubblecontainer")

    var citysinner = citys.append("circle")
      .attr("r",3)
      .attr("text",function(d){
        return d.name;
      })
      .attr("transform", function(d) {
        var latlong = projection([d.longitude,d.latitude])
        return "translate(" + latlong + ")";
      })
      .attr("class", "city")
    
      var citytext = citys.on("mouseover",function(d){
          d3.select(this).append("svg:text")
            .text(function(d){
              return d.name;
            })
            .attr("transform", function(d) {      
              var latlong = projection([d.longitude,d.latitude])
              latlong[0] = latlong[0] + 10;
              latlong[1] = latlong[1] + 4;
              return "translate(" + latlong + ")";
            })
            .attr("opacity","0")
            .attr("text-anchor","start")
            .attr("class", "citytext")
            .attr("id",function(d){
              return d.id;
            })

          var now = d.id;
          g.select("#"+now)
            .transition().duration(750)      
            .attr("opacity","1")
        })
        .on("mouseout",function(d){
          g.selectAll(".citytext")
            .transition().duration(750)        
            .attr("opacity","0")
            .remove()
        })


    });
  });
});

// Bind things that happen on first click 
(function ($) { 
  $(document).ready(function() { 
    $("#link-below").click(ReadMore)
    $("#clickstate").click(ReadMore)
  });  
}(jQuery));  

// What happens when clicked
function clicked(d) {

// D3 stuff on click
  var x, y, k, id, name, hash, green, summary, properties, boxWidth, title1, numIcon, IW, TW, halfBox, url, order, propinter;
  var p = [[],[],[],[],[]];
  var boxHeight = 0;

  //click on a region and define dates and populate options
  if (d && centered.id !== d.id && d.id !== "Null") {     
    
    // Scroll bottom into view after newly clicked is zoomed
    setTimeout(
    function() 
    {
      (function ($) {   
        $('#summary').scrollView();
      }(jQuery));  
    }, 1000);  

    var centroid = path.centroid(d);
    // the x and y are from the json and its how it knows where to zoom to 
    x = centroid[0];
    y = centroid[1];
    k = 2 ;
    centered = d;
    id = d.id;
    name = d.id;
    hash = "#" + name.replace(/\s+/g, '-').toLowerCase();        
    green = d.id;         
  } else {
      //outclick
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = [];
    id = "";
    name = "Click on a region to learn more"
    hash = "#"
    green = "green-text"    
    summary = "";
  }

  (function ($) {   
    $('#linkbutton').attr("href",url)
  }(jQuery));  

// Sets the active topography so that it highlights the states MAY NOT BE WORKING?
  g.selectAll(".region")
    .classed("active", centered && function(d) { return d.id === centered.id; });

// k===2 is when it is clicked
  if (k === 2) {
    g.selectAll(".bubble")
      .transition()
      .duration(750)
      .attr("r","0")    
    g.selectAll(".region-title")
      .transition()
      .attr("fill-opacity","0")
    //transitions the map.
  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + 1.4 + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");    

      var nowData;
      // build the table (function defined below)
      for (var s = datesdata.length - 1; s >= 0; s--) {
        if (datesdata[s].id === id) {
          nowData = datesdata[s];
          break;
        };        
      };

      var regionspan = document.getElementById("regionspan")
      regionspan.innerHTML = d.id;
      
      BuildTable(nowData);
  } 
  // below is the clickout
  else if (k === 1){
    g.selectAll(".bubble")
      .transition()
      .duration(750)
      .attr("r", function(d) { 
          return width / 25;            
        })    
    g.selectAll(".region-title")
      .transition()
      .attr("fill-opacity","1")
      .duration(100)
      .delay(1000)
        //transitions the map.
  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + 1 + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");

      var regionspan = document.getElementById("regionspan");
      regionspan.innerHTML = "";

  ClearTable();
  };

    // Add the dom elements. HTML, basically no D3

      //change bottom tab/button
      var below = document.getElementById("below")
      if (id=="") {  below.className = below.className.replace( /(?:^|\s)active(?!\S)/g , '' );
      } else {  below.className = "active " + id
      };

      window.location = hash;

      var linkBelow = document.getElementById("link-below")
      linkBelow.href =  hash;
      
      var greenTextchange = document.getElementsByClassName("change-text")
      for (var i = greenTextchange.length - 1; i >= 0; i--) {
        greenTextchange[i].className = "change-text " + green;    
      };

  pymChild.sendHeight();

}


function BuildTable(d) { 
  (function ($) { 
    var data = d.datesAvail;

    var datesTable = document.getElementById("dates-list")
    datesTable.innerHTML = "";

    var first = "<div class='large-12 columns'><div class='row'>";
    var main = "<div class='small-4 columns'>"
    var closer = "</div>"
    var last = "</div></div>"  
    for (var z = data.length - 1; z >= 0; z--) {    
      // Build the FORM!!!

      var location = data[z].city + ", " + data[z].state;
      var startend = data[z].start + "-" + data[z].finish;
      var checkbox = "<div class='checkbox-container'><input name=" + data[z].post_id + " id='"+ data[z].post_id +"' type='checkbox'></div>";

      var complete = first + main + location + closer + main + startend + closer + main + checkbox + closer + last;

      datesTable.innerHTML = datesTable.innerHTML + complete;
    };  
  }(jQuery));  
}

function ClearTable(d) {
  var datesTable = document.getElementById("dates-list")
  datesTable.innerHTML = "";
}

$( "#formsubmit" ).click(function() {

// put ids here, capture values, make into a json, send to the INTERNET!!!!!
  var firstname = $('#firstname').val();
  var lastname = $('#lastname').val();
  var email = $('#email').val();
  var company = $('#company').val();
  // var ischecked = [];
  var senddata = {
    "firstname": firstname,
    "lastname": lastname,
    "email": email,
    "company": company,
    "dates": []
  }

  $("input:checkbox").each(function(){
      var $this = $(this);

      if($this.is(":checked")){
        senddata.dates.push($this.attr("id"));
      }
  });
});



function ReadMore() { 
  (function ($) {   
    $('#summary').scrollView();
  }(jQuery));  
}

(function ($) { 
  $(document).ready(function() {     
    $.fn.scrollView = function () {
      return this.each(function () {
        $('html, body').animate({
            scrollTop: $(this).offset().top
        }, 1000);
      });
    }
  });  
}(jQuery));  

// d3.select("#execid").on("mouseover",function(){pymChild.sendHeight();})    
// d3.select("#execid").on("mouseleave",function(){
//   pymChild.sendHeight();
// })    
