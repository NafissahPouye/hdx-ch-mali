function generateringComponent(vardata, vargeodata){

  var lookup = genLookup(vargeodata) ;

  var trends = dc.compositeChart('#phasesChart');
  var chMap = dc.leafletChoroplethChart('#Map');

  var cf = crossfilter(vardata) ;
  var all = cf.groupAll();
  var chartDimension = cf.dimension(function(d) { return d.date}) ;
  var mapDimension = cf.dimension(function(d) { return d.adm2_pcode});
  var phase1Group = chartDimension.group().reduceSum(function(d){ return d.phase1/1000000});
  var phase2Group = chartDimension.group().reduceSum(function(d){return d.phase2/1000000});
  var phase3Group = chartDimension.group().reduceSum(function(d){return d.phase3/1000000});
  var phase4Group = chartDimension.group().reduceSum(function(d){return d.phase4/1000000});
  var phase5Group = chartDimension.group().reduceSum(function(d){return d.phase5/1000000});
  var mapGroup = mapDimension.group().reduceSum(function(d){ return d.classif});
    var colors = ['#A7C1D3',' #008080'];
  var numberFormat = d3.format('.2f');
  var numberFormat2 = d3.format('.1f')
  var dataMax = 11957.59;
  var axis = d3.svg.axis().ticks(dataMax).tickFormat(d3.format(".0f"))
   var colors = ['#58FAAC','#FAE61E','#E67800','#C80000','#640000', '#023858', '#a6bddb','#3690c0'] ;


  trends.width(560)
               .height(535)
               .dimension(chartDimension)
               .x(d3.scale.linear().domain([1996, 2017]))
               .legend(dc.legend().x($('#phasesChart').width()-80).y(0).gap(3))
               .shareTitle(false)
               .valueAccessor(function(p) {
                return p.value;
            })
               .compose([
                 dc.lineChart(trends).group(phase1Group, "Phase 1").colors(colors[0]).title(function (p) {
                   return ["Année      : " + p.key , "Phase 1 : " + numberFormat(p.value) + "M" ].join('\n'); }).renderDataPoints({radius: 2, fillOpacity: 0.8, strokeOpacity: 0.8}),
                  dc.lineChart(trends).group(phase2Group, "Phase 2").colors(colors[1]).title(function (p) {
                   return ["Année         : " + p.key , "Phase 2 : " + numberFormat(p.value) + "M"].join('\n'); }).renderDataPoints({radius: 2, fillOpacity: 0.8, stroke: 0.8}),
                  dc.lineChart(trends).group(phase3Group, "Phase 3").colors(colors[2]).title(function (p) {
                   return ["Année         : " + p.key , "Phase 3 : " + numberFormat(p.value) + "M"].join('\n'); }).renderDataPoints({radius: 2, fillOpacity: 0.8, stroke: 0.8}),
                   dc.lineChart(trends).group(phase4Group, "Phase 4").colors(colors[3]).title(function (p) {
                   return ["Année         : " + p.key , "Phase 4 : " + numberFormat(p.value) + "M"].join('\n'); }).renderDataPoints({radius: 2, fillOpacity: 0.8, stroke: 0.8}),
                    dc.lineChart(trends).group(phase5Group, "Phase 5").colors(colors[4]).title(function (p) {
                   return ["Année         : " + p.key , "Phase 5 : " + numberFormat(p.value) + "M"].join('\n'); }).renderDataPoints({radius: 2, fillOpacity: 0.8, stroke: 0.8}),
                ])
               .label(function (p) { return p.key; })
              /* .title(function (d) {
                   return ["Année      : " + d.key , "Phase 1  : " + d.value + " k" ].join('\n'); })*/
               .margins({top: 10, right: 13, bottom: 80, left: 30})
               .brushOn(false)
               .renderTitle(true)
               .elasticX(true)
               .elasticY(true)
               .colorAccessor(function(d,i){ return 0;})
               /*.renderlet(function (chart) {
                    chart.selectAll("g.x text")
                      .attr('dx', '-12')
                      .attr('transform', "rotate(-60)");
                })
*/
               //.yAxis.orient(right)

               .xAxis().tickFormat(d3.format("d"));
  trends.yAxis().tickFormat(function (v) {
            return v ;}).ticks(6);

dc.dataCount('#count-info')
  .dimension(cf)
  .group(all);


 chMap.width(567)
             .height(500)
             .dimension(mapDimension)
             .group(mapGroup)
             .center([27.85,85.1])
             .zoom(8)
             .label(function (p) { return p.key; })
             .renderTitle(true)
             .geojson(vargeodata)
             .colors(['#DDDDDD','#58FAAC','#FAE61E','#E67800','#C80000','#640000', '#023858'])

             .colorDomain([0,5])

             .colorAccessor(function (d){
               var c = 0
                if(d>=1){
                    c=  1;
                } else if (d>=2) {
                    c = 2;
                } else  if (d>=3){
                    c = 3;
                 } else if (d>=4) {
                    c=4;}
                return c
             
            })         
             .featureKeyAccessor(function (feature){
               return feature.properties['adm2_pcode'];
             })
            .popup(function (d){
               return d.properties['adm2'];
              })
             .renderPopup(true)
             .featureOptions({
                'fillColor': 'gray',
                'color': 'gray',
                'opacity':0.8,
                'fillOpacity': 0.1,
                'weight': 1
            });
    //begin test
    /* var legend = L.control({position: 'topright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            labels = ['75 - 90','90 - 110','110 - 150 ','150+'];
            colors =['#31a354','#addd8e','#f7fcb9','#ffeda0'];

        div.innerHTML = '<br />Légende<br />';
        for (var i = 0; i < labels.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' + labels[3-i] +'<br />';

        }

        return div;
    };*/


    //end test


      dc.renderAll();

      var map = chMap.map();

      zoomToGeom(vargeodata);
      legend.addTo(map);

      function zoomToGeom(geodata){
        var bounds = d3.geo.bounds(geodata) ;
        map.fitBounds([[bounds[0][1],bounds[0][0]],[bounds[1][1],bounds[1][0]]]);
      }

      function genLookup(geojson) {
        var lookup = {} ;
        geojson.features.forEach(function (e) {
          lookup[e.properties['adm2_pcode']] = String(e.properties['adm2']);
        });
        return lookup ;
      }
}

var dataCall = $.ajax({
    type: 'GET',
    url: 'data/chdata.json',
    dataType: 'json',
});

var geomCall = $.ajax({
    type: 'GET',
    url: 'data/mali.geojson',
    dataType: 'json',
});


$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var geom = geomArgs[0];
    geom.features.forEach(function(e){
        e.properties['adm2_pcode'] = String(e.properties['adm2_pcode']);
    });
    generateringComponent(dataArgs[0],geom);
});