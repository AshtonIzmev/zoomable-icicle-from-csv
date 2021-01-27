function run(categChoices, allLib) {

    $("#chart").html("");

    function generateChildren(node, categ_lib, categ_list, i) {
        if (i == maxDepth) {
            var summation = node.reduce(function(acc, val) { return acc + parseFloat(val[aggKey]); }, 0);
            return {[aggKey]: summation};
        }

        var grouped = _.groupBy(node, function (mvt) {
            return mvt[categ_list[i]];
        });

        var result = {};
        result['name'] = categ_lib;
        result['children'] = [];
        Object.keys(grouped).forEach(k => {
            result['children'].push(generateChildren(grouped[k], k, categ_list, i + 1))
        });
        return result;
    }

    function csvToZoomableJson(data) {
        var result = generateChildren(data, allLib, categChoices, 0);
        return result;
    }

    d3.csv(csvFile).then(function (data_csv) {

        let data = csvToZoomableJson(data_csv);

        color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

        function chart() {

            const height = 400;
            const width = 975;
            const format = d3.format(",d");

            function partition(d) {
                const root = d3.hierarchy(d)
                    .sum(d => d[aggKey])
                    .sort((a, b) => b.height - a.height || b.value - a.value);
                return d3.partition()
                    .size([height, (root.height + 1) * width / 3])
                    (root);
            }

            const root = partition(data);
            let focus = root;

            const svg = d3.select('#chart')
                .attr("viewBox", [0, 0, width, height])
                .style("font", "10px sans-serif");

            const cell = svg
                .selectAll("g")
                .data(root.descendants())
                .join("g")
                .attr("transform", d => `translate(${d.y0},${d.x0})`);

            const rect = cell.append("rect")
                .attr("width", d => d.y1 - d.y0 - 1)
                .attr("height", d => rectHeight(d))
                .attr("fill-opacity", 0.6)
                .attr("fill", d => {
                    if (!d.depth) return "#ccc";
                    while (d.depth > 1) d = d.parent;
                    return color(d.data.name);
                })
                .style("cursor", "pointer")
                .on("click", clicked);

            const text = cell.append("text")
                .style("user-select", "none")
                .attr("pointer-events", "none")
                .attr("x", 4)
                .attr("y", 13)
                .attr("fill-opacity", d => +labelVisible(d));

            text.append("tspan")
                .text(d => d.data.name);

            const tspan = text.append("tspan")
                .attr("fill-opacity", d => labelVisible(d) * 0.7)
                .text(d => ` ${format(d.value)}`);

            cell.append("title")
                .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

            function clicked(event, p) {
                focus = focus === p ? p = p.parent : p;

                root.each(d => d.target = {
                    x0: (d.x0 - p.x0) / (p.x1 - p.x0) * height,
                    x1: (d.x1 - p.x0) / (p.x1 - p.x0) * height,
                    y0: d.y0 - p.y0,
                    y1: d.y1 - p.y0
                });

                const t = cell.transition().duration(750)
                    .attr("transform", d => `translate(
                    ${d.target.y0},${d.target.x0}
                    )`);

                rect.transition(t).attr("height", d => rectHeight(d.target));
                text.transition(t).attr("fill-opacity", d => +labelVisible(d.target));
                tspan.transition(t).attr("fill-opacity", d => labelVisible(d.target) * 0.7);
            }

            function rectHeight(d) {
                return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
            }

            function labelVisible(d) {
                return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
            }
        }
        chart();
    });
}

run(initialOrder, initialLib);
