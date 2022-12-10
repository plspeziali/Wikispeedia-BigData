const neo4j = require('neo4j-driver')
const fs = require('fs')
let articleNames = [];
let nodes = [];
let edges = [];
var sys;

/*document.addEventListener('DOMContentLoaded', async e => {
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
}, false);*/


$( "#shortQ" ).click(async function () {
    const driver = neo4j.driver('bolt://localhost:7687',
        neo4j.auth.basic("neo4j", "bigdata"))
    const session = driver.session()
    let first = $('#firstArticle').val();
    let second = $('#secondArticle').val()
    if(first === second){
        return;
    }
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

$( "#longQ" ).click(async function () {
    const driver = neo4j.driver('bolt://localhost:7687',
        neo4j.auth.basic("neo4j", "bigdata"))
    const session = driver.session()
    let first = $('#firstArticle').val();
    let second = $('#secondArticle').val()
    if(first === second){
        return;
    }
    try {
        const result = await session.run(
            'MATCH (a:Article {name: \'' + first + '\'}),\n' +
            '      (b:Article {name: \'' + second + '\'}),\n' +
            '      p = (a)-[*]-(b) RETURN p, length(p) ORDER BY length(p) DESC LIMIT 1'
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
		cat1 = ((el.get(i).properties.category)).slice(1,-2);
		catList = cat1.split(",");
		var n = sys.addNode(name1,{'color':'green','shape':'dot','label':name1});
		nodes.push(n);
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
		    	nodes.push(c2);
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

$( "#hardQ" ).click(async function () {
    const driver = neo4j.driver('bolt://localhost:7687',
        neo4j.auth.basic("neo4j", "bigdata"))
    const session = driver.session()
    try {
        const result = await session.run(
            'MATCH (a:Article) -[r:CHALLENGE {rating: "5"}]-> (b:Article)\n' +
            'RETURN a,b,r.duration,r.pathLength ORDER BY r.duration DESC LIMIT 1'
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
            console.log(el);
    	    name1 = el.get(0).properties.name;
    	    name2 = el.get(1).properties.name;
	    var n1 = sys.addNode(name1,{'color':'green','shape':'dot','label':name1});
	    var n2 = sys.addNode(name2,{'color':'green','shape':'dot','label':name2});
	    e = sys.addEdge(n1, n2);
            nodes.push(n1);
            nodes.push(n2);
            edges.push(e);
            var c = sys.addNode(el.get(2),{'color':'blue','shape':'square','label':'Duration: '+el.get(2)});
	    nodes.push(c);
	    e = sys.addEdge(n1, c);
      	    edges.push(e);
      	    var c = sys.addNode(el.get(3),{'color':'red','shape':'square','label':'Path Length: '+el.get(3)});
	    nodes.push(c);
	    e = sys.addEdge(n2, c);
      	    edges.push(e);
        }


    } finally {
        await session.close()
    }

    // on application exit:
    await driver.close()
});

$( "#easyQ" ).click(async function () {
    const driver = neo4j.driver('bolt://localhost:7687',
        neo4j.auth.basic("neo4j", "bigdata"))
    const session = driver.session()
    try {
        const result = await session.run(
            'MATCH (a:Article) -[r:CHALLENGE {rating: "1"}]-> (b:Article)\n' +
            'RETURN a,b,r.duration,r.pathLength ORDER BY r.duration ASC LIMIT 1'
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
            console.log(el);
    	    name1 = el.get(0).properties.name;
    	    name2 = el.get(1).properties.name;
	    var n1 = sys.addNode(name1,{'color':'green','shape':'dot','label':name1});
	    var n2 = sys.addNode(name2,{'color':'green','shape':'dot','label':name2});
	    e = sys.addEdge(n1, n2);
            nodes.push(n1);
            nodes.push(n2);
            edges.push(e);
            var c = sys.addNode(el.get(2),{'color':'blue','shape':'square','label':'Duration: '+el.get(2)});
	    nodes.push(c);
	    e = sys.addEdge(n1, c);
      	    edges.push(e);
      	    var c = sys.addNode(el.get(3),{'color':'red','shape':'square','label':'Path Length: '+el.get(3)});
	    nodes.push(c);
	    e = sys.addEdge(n2, c);
      	    edges.push(e);
        }


    } finally {
        await session.close()
    }

    // on application exit:
    await driver.close()
});

$( "#neigQ" ).click(async function () {
    const driver = neo4j.driver('bolt://localhost:7687',
        neo4j.auth.basic("neo4j", "bigdata"))
    const session = driver.session()
    let first = $('#firstArticle').val();
    try {
        const result = await session.run(
            'MATCH (node1 {name: "'+first+'"})-[r]->(node2) return node1, node2, r LIMIT 10'
        )

        for(let n of edges){
            sys.pruneEdge(n)
        }

        for(let n of nodes){
            sys.pruneNode(n)
        }
        nodes.splice(0,nodes.length)

        edges.splice(0,edges.length)

        name1 = result.records[0].get(0).properties.name;
        var n1 = sys.addNode(name1,{'color':'green','shape':'dot','label':name1});
        nodes.push(n1);


        for (let el of result.records) {
            console.log(el)
    	    name2 = el.get(1).properties.name;
	    var n2 = sys.addNode(name2,{'color':'green','shape':'dot','label':name2});
	    e = sys.addEdge(n1, n2);
            nodes.push(n2);
            edges.push(e);
            type = el.get(2).type;
	    var t = sys.addNode(type,{'color':'blue','shape':'square','label':type});
	    e = sys.addEdge(t, n2);
            nodes.push(t);
            edges.push(e);
        }


    } finally {
        await session.close()
    }

    // on application exit:
    await driver.close()
});


$( ".form-control" ).autocomplete({
    source: function(request, response) {
        var results = $.ui.autocomplete.filter(require('./articleNames.json'), request.term);

        response(results.slice(0, 20));
    }
});