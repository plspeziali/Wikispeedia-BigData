const neo4j = require('neo4j-driver')
const fs = require('fs')
let articleNames = [];
let nodes = [];
let edges = [];
var sys;

document.addEventListener('DOMContentLoaded', async e => {
    const driver = neo4j.driver('bolt://54.208.199.182:7687',
        neo4j.auth.basic("neo4j", "turbines-sentry-screen"))
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
    const driver = neo4j.driver('bolt://54.208.199.182:7687',
        neo4j.auth.basic("neo4j", "turbines-sentry-screen"))
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
            '      p = shortestPath((nodo1)-[:RELTYPE*]-(nodo2))\n' +
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
            console.log(seg)
            for (let i = 0; i < seg.length; i++) {
                name1 = seg[i].start.properties.name;
                name2 = seg[i].end.properties.name;
                var n1 = sys.addNode(name1,{'color':'green','shape':'dot','label':name1});
                var n2 = sys.addNode(name2,{'color':'blue','shape':'dot','label':name2});
                var e = sys.addEdge(n1, n2);
                nodes.push(n1);
                nodes.push(n2);
                edges.push(e);
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