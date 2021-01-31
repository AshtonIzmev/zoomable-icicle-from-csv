function launchDC(dataCsv, chosenDimensions, libForAll) {
    
    var zChart = new ZoomableChart()
    var ndx = crossfilter(dataCsv),
        randDimension = ndx.dimension(function (d) { return Math.random(); }),
        randGroup = randDimension.group();

    zChart
        .setNdx(ndx)
        .setChosenCategories(chosenDimensions)
        .setLibForAll(libForAll)
        .render();

    $("#pies").html("");
    breakCategories.forEach( k => {
        $("#pies").append('<div id="pie'+k[0]+'" class="fl">'+k[1]+'</div>');
        var pieChart = new dc.PieChart("#pie"+k[0]);
        var dim = ndx.dimension(function (d) { return d[k[0]]; })
        var grp = dim.group()
        pieChart
            .width(180)
            .height(180)
            .radius(80)
            .dimension(dim)
            .group(grp)
            .render();
    });
    
}

function run(categChoices, allLib) {
    d3.csv(csvFile).then(function (data_csv) {
        launchDC(data_csv, categChoices, allLib);
    });
}

run(initialOrder, initialLib);
