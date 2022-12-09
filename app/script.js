const neo4j = require('neo4j-driver')
const fs = require('fs')
let articleNames = [];
let nodes = [];
let edges = [];
var sys;

document.addEventListener('DOMContentLoaded', async e => {
    const driver = neo4j.driver('bolt://localhost:7687',
        neo4j.auth.basic("neo4j", "bigdata"))
    const session = driver.session()
    try {
        const result = await session.run(
            'MATCH (n) RETURN n'
        )

        console.log(result.records[0].get(0))

        for(let el of result.records){
            articleNames.push(el.get(0).properties.name);
        }
        fs.writeFile('articleNames.json', JSON.stringify(articleNames), (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });

    } finally {
        await session.close()
    }

    // on application exit:
    await driver.close()

    sys = arbor.ParticleSystem(1000, 400,1);
    sys.parameters({gravity:true});
    sys.renderer = Renderer("#viewport") ;
}, false);


$( "#pathQ" ).click(async function () {
    const driver = neo4j.driver('bolt://localhost:7687',
        neo4j.auth.basic("neo4j", "bigdata"))
    const session = driver.session()
    let first = $('#firstArticle').val();
    let second = $('#secondArticle').val()
    if(first === second){
        return;
    }
    let res;
    try {
        const result = await session.run(
            'MATCH (nodo1:Article {name: \'' + first + '\'}),\n' +
            '      (nodo2:Article {name: \'' + second + '\'}),\n' +
            '      p = shortestPath((nodo1)-[:HYPERLINK*]-(nodo2))\n' +
            'RETURN p'
        )

        for(let n of edges){
            sys.pruneEdge(n)
        }

        for(let n of nodes){
            sys.pruneNode(n)
        }
        nodes.splice(0,nodes.length)

        edges.splice(0,edges.length)

        for (let el of result.records) {
            let seg = el.get(0).segments;
            console.log(seg);
            var n1,n2,e;
            for (let i = 0; i < seg.length; i++) {
		    if(i==0){
		    	name1 = seg[i].start.properties.name;
		      	name2 = seg[i].end.properties.name;
		        n1 = sys.addNode(name1,{'color':'green','shape':'dot','label':name1});
		        n2 = sys.addNode(name2,{'color':'blue','shape':'dot','label':name2});
		        e = sys.addEdge(n1, n2);
		        nodes.push(n1);
		        nodes.push(n2);
		        edges.push(e);
		    } else if(i>0 && i<seg.length-1){
		    	n1 = n2
		    	name2 = seg[i].end.properties.name;
		    	var n2 = sys.addNode(name2,{'color':'blue','shape':'dot','label':name2});
		    	e = sys.addEdge(n1, n2);
		    	nodes.push(n2);
		        edges.push(e);
		    } else {
		    	n1 = n2
		    	name2 = seg[i].end.properties.name;
		    	var n2 = sys.addNode(name2,{'color':'red','shape':'dot','label':name2});
		    	e = sys.addEdge(n1, n2);
		    	nodes.push(n2);
		        edges.push(e);
		    }
            }
        }

        console.log(result)


    } finally {
        await session.close()
    }

    // on application exit:
    await driver.close()
});

$( "#catQ" ).click(async function () {
    const driver = neo4j.driver('bolt://localhost:7687',
        neo4j.auth.basic("neo4j", "bigdata"))
    const session = driver.session()
    let first = $('#firstArticle').val();
    let second = $('#secondArticle').val()
    if(first === second){
        return;
    }
    let res;
    try {
        const result = await session.run(
            'MATCH (nodo1:Article {name: \'' + first + '\'}),\n' +
            '      (nodo2:Article {name: \'' + second + '\'})\n' +
            'RETURN nodo1, nodo2'
        )

        for(let n of edges){
            sys.pruneEdge(n)
        }

        for(let n of nodes){
            sys.pruneNode(n)
        }
        nodes.splice(0,nodes.length)

        edges.splice(0,edges.length)

	console.log(result);

        for (let el of result.records) {
            for(let i = 0; i < el.length; i++){
		console.log(el);
		var n1,n2;
		name1 = el.get(i).properties.name;
		cat1 = ((el.get(i).properties.category)).slice(1,-1);
		catList = cat1.split(",");
		var n = sys.addNode(name1,{'color':'green','shape':'dot','label':name1});
		nodes.push(n1);
		for(let cat of catList){
		    let catS = cat.split(".");
		    var c = sys.addNode(catS[1],{'color':'blue','shape':'square','label':catS[1]});
		    nodes.push(c);
		    e = sys.addEdge(n, c);
		    edges.push(e);
		    var c1 = c;
		    for(let i = 2; i < catS.length; i++){
		    	var c2 = sys.addNode(catS[i],{'color':'blue','shape':'square','label':catS[i]});
		    	nodes.push(c);
		    	e = sys.addEdge(c1, c2);
		    	edges.push(e);
		    	var c1 = c2;
		    }
		}
	    }
        }

        console.log(result)


    } finally {
        await session.close()
    }

    // on application exit:
    await driver.close()
});

var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
        var matches, substringRegex;

        // an array that will be populated with substring matches
        matches = [];

        // regex used to determine if a string contains the substring `q`
        substrRegex = new RegExp(q, 'i');

        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
                matches.push(str);
            }
        });

        cb(matches);
    };
};


$('.the-basics .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
},
{
    name: 'states',
    limit:10,
    source: substringMatcher(require('./articleNames.json'))
});
