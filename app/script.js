const neo4j = require('neo4j-driver')
const fs = require('fs')
let articleNames = [];

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

    var sys = arbor.ParticleSystem(1000, 400,1);
    sys.parameters({gravity:true});
    sys.renderer = Renderer("#viewport") ;
    var data = {
        nodes:{
            animals:{'color':'red','shape':'dot','label':'Animals'},
            dog:{'color':'green','shape':'dot','label':'dog'},
            cat:{'color':'blue','shape':'dot','label':'cat'}
        },
        edges:{
            animals:{ dog:{}, cat:{} }
        }
    };
    sys.graft(data);
}, false);


$( "#pathQ" ).click(async function () {
    const driver = neo4j.driver('bolt://54.208.199.182:7687',
        neo4j.auth.basic("neo4j", "turbines-sentry-screen"))
    const session = driver.session()
    let res;
    try {
        const result = await session.run(
            'MATCH (nodo1:Article {name: \'' + $('#firstArticle').val() + '\'}),\n' +
            '      (nodo2:Article {name: \'' + $('#secondArticle').val() + '\'}),\n' +
            '      p = shortestPath((nodo1)-[:RELTYPE*]-(nodo2))\n' +
            'RETURN p'
        )

        var sys = arbor.ParticleSystem(1000, 400,1);
        sys.parameters({gravity:true});
        sys.renderer = Renderer("#viewport") ;

        for (let el of result.records) {
            let seg = el.get(0).segments;
            console.log(seg[0])
            for (let i = 0; i < seg.length; i+=3) {
                name1 = seg[i].start.properties.name;
                name2 = seg[i+2].end.properties.name;
                var n1 = sys.addNode(name1,{'color':'green','shape':'dot','label':name1});
                var n2 = sys.addNode(name2,{'color':'blue','shape':'dot','label':name2});
                sys.addEdge(n1, n2);
            }
        }

        sys.graft(data);
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

[
    {
        "keys": [
            "p"
        ],
        "length": 1,
        "_fields": [
            {
                "start": {
                    "identity": {
                        "low": 3,
                        "high": 0
                    },
                    "labels": [
                        "Article"
                    ],
                    "properties": {
                        "name": "South_America"
                    },
                    "elementId": "3"
                },
                "end": {
                    "identity": {
                        "low": 4,
                        "high": 0
                    },
                    "labels": [
                        "Article"
                    ],
                    "properties": {
                        "name": "Gold"
                    },
                    "elementId": "4"
                },
                "segments": [
                    {
                        "start": {
                            "identity": {
                                "low": 3,
                                "high": 0
                            },
                            "labels": [
                                "Article"
                            ],
                            "properties": {
                                "name": "South_America"
                            },
                            "elementId": "3"
                        },
                        "relationship": {
                            "identity": {
                                "low": 0,
                                "high": 0
                            },
                            "start": {
                                "low": 3,
                                "high": 0
                            },
                            "end": {
                                "low": 1,
                                "high": 0
                            },
                            "type": "RELTYPE",
                            "properties": {},
                            "elementId": "0",
                            "startNodeElementId": "3",
                            "endNodeElementId": "1"
                        },
                        "end": {
                            "identity": {
                                "low": 1,
                                "high": 0
                            },
                            "labels": [
                                "Article"
                            ],
                            "properties": {
                                "name": "Brazil"
                            },
                            "elementId": "1"
                        }
                    },
                    {
                        "start": {
                            "identity": {
                                "low": 1,
                                "high": 0
                            },
                            "labels": [
                                "Article"
                            ],
                            "properties": {
                                "name": "Brazil"
                            },
                            "elementId": "1"
                        },
                        "relationship": {
                            "identity": {
                                "low": 2,
                                "high": 0
                            },
                            "start": {
                                "low": 1,
                                "high": 0
                            },
                            "end": {
                                "low": 2,
                                "high": 0
                            },
                            "type": "RELTYPE",
                            "properties": {},
                            "elementId": "2",
                            "startNodeElementId": "1",
                            "endNodeElementId": "2"
                        },
                        "end": {
                            "identity": {
                                "low": 2,
                                "high": 0
                            },
                            "labels": [
                                "Article"
                            ],
                            "properties": {
                                "name": "Africa"
                            },
                            "elementId": "2"
                        }
                    },
                    {
                        "start": {
                            "identity": {
                                "low": 2,
                                "high": 0
                            },
                            "labels": [
                                "Article"
                            ],
                            "properties": {
                                "name": "Africa"
                            },
                            "elementId": "2"
                        },
                        "relationship": {
                            "identity": {
                                "low": 4,
                                "high": 0
                            },
                            "start": {
                                "low": 2,
                                "high": 0
                            },
                            "end": {
                                "low": 4,
                                "high": 0
                            },
                            "type": "RELTYPE",
                            "properties": {},
                            "elementId": "4",
                            "startNodeElementId": "2",
                            "endNodeElementId": "4"
                        },
                        "end": {
                            "identity": {
                                "low": 4,
                                "high": 0
                            },
                            "labels": [
                                "Article"
                            ],
                            "properties": {
                                "name": "Gold"
                            },
                            "elementId": "4"
                        }
                    }
                ],
                "length": 3
            }
        ],
        "_fieldLookup": {
            "p": 0
        }
    }
]