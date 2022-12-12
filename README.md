# Wikispeedia Big Data

### Authors: Gianluca Coletta & Paolo Speziali

A PySpark-based application to populate a Neo4j database with Wikispeedia game data and
an Electron-based application to query and visualise that database. 

---
## Introduction 

The Wikispeedia game consists of, given a starting and ending Wikipedia article to the player,
seeing how long it takes to reach the final article using only the hyperlinks within the articles.

Using the [datasets provided by Standford University](https://snap.stanford.edu/data/wikispeedia.html)[^1][^2],
we constructed a graph structure with Apache Spark, where the nodes represented the
articles while the direct arcs
represented either a hyperlink or a challenge performed by a user to go from the source
node to the destination node.
In addition, we have assigned properties to nodes and edges to this graph structure, which
we are going to discuss later on.

This graph structure is stored in a Neo4J database and an Electron application is provided
where certain queries can be
performed and the result displayed within the application's user interface.

The dataset we used is store in the [`dataset/`](https://github.com/plspeziali/Wikispeedia-BigData/tree/main/dataset)
directory and is composed of three `.tsv` files with the following structure:

The first one is `categories.tsv` and represents the categories associated with each article:

| **article**       | **category**                           |
|-------------------|----------------------------------------|
| A_Christmas_Carol | subject.Language_and_literature.Novels |
| A_Tale_of_a_Tub   | subject.Language_and_literature.Novels |
| Abacus            | subject.Everyday_life.Everyday_life    |
| Abacus            | subject.Mathematics                    |

The second one is `links.tsv` and represents the various hyperlinks in each article:

| **source**   | **destination** |
|--------------|-----------------|
| 19th_century | Zionism         |
| 19th_century | Zulu            |
| 1_Ceres      | 3_Juno          |
| 1_Ceres      | 4_Vesta         |

The third one is `paths_finished.tsv`:

| **hashedIpAddress** | **timestamp** | **durationInSec** | **path**                                                                   | **rating** |
|---------------------|---------------|-------------------|----------------------------------------------------------------------------|------------|
| 321e4b101c5b58ff    | 1233269042    | 46                | Achilles;World_War_II;Winston_Churchill                                    | 1          |
| 4dc8af51482ebb5a    | 1336876538    | 221               | Achilles;Ethiopia;United_Kingdom;World_War_II;Winston_Churchill            | 3          |
| 7a9183f72e699f33    | 1342494087    | 51                | Achilles;World_War_II;Winston_Churchill                                    | 1          |
| 612c8d256427c35a    | 1249457582    | 73                | Acceleration;Sea;North_Sea;<;Ocean;Atlantic_Ocean;Iceland;Surtsey          | NULL       |
| 02c024aa1458f9c8    | 1325764001    | 73                | Acceleration;Albert_Einstein;Germany;European_Union;Europe;Iceland;Surtsey | NULL       |

where each row represents a game of Wikispeedia.
The columns that matter to us are:
* **durationInSec**: how long (in seconds) the game lasted.
* **path**: the path the player created in order to get to the end, if a `<` appears
it means that the player went a page back from where they originally were.
* **rating**: the rating that the player gave to the path they just finished, if a `NULL`
value appears it means that the player did not leave any rating.

---
## Used Technologies
* **Apache Spark** and **PySpark** (running on an **Apache Hadoop** cluster with **YARN**)
to load the datasets, to extract the property graph and to insert it into the neo4j database
via **Cypher** queries (using the **py2neo** library).
* **Neo4J** to store the property graph.
* **Node.js** to create the desktop application (you may need to install it through `sudo apt install node npm`)
* **Electron** (**NodeJS** module) to create the graphical application to 
interact and visualize the property graph.
* **arbor.js** to visualize the queries result in HTML5 via a force-directed graph

---
## Data Flow
### PySpark
First, after starting the Hadoop daemons,
you need to load the three dataset files into HDFS, moving with `cd` to the folder
[`dataset/`](https://github.com/plspeziali/Wikispeedia-BigData/tree/main/dataset)
you can do this through these commands:
```bash
$HADOOP_DIR/bin/hdfs dfs -mkdir hdfs://localhost:9000/user/bigdata2022/datasets/wiki/
$HADOOP_DIR/bin/hdfs dfs -put ./categories.tsv hdfs://localhost:9000/user/bigdata2022/datasets/wiki/
$HADOOP_DIR/bin/hdfs dfs -put ./links.tsv hdfs://localhost:9000/user/bigdata2022/datasets/wiki/
$HADOOP_DIR/bin/hdfs dfs -put ./paths_finished.tsv hdfs://localhost:9000/user/bigdata2022/datasets/wiki/
```
where `$HADOOP_DIR/bin/hdfs` must be changed with the directory path where
the script of the dfs is located and 
`hdfs://localhost:9000/user/bigdata2022/datasets/` with the path where
you want the dataset to be placed in HDFS, in this last case you must
change this path also inside the Python Notebook.

By launching the Jupyter Notebook `wikispeediaSpark.ipynb` inside a Spark environment
you can make the Spark program execute.
1.  `categories.tsv`:

    1. Through a map operation, the URL format of each article and each category is decoded.

    2. Through a map reduce operation the categories of each article are grouped.

   2. `links.tsv`: Through a map operation, the URL format of each source and destination article is decoded.

   3. `paths_finished.tsv`:

      1. By defining a function and using a map operation, a new RDD is constructed containing the source
      and destination of the path, the duration in seconds, the rating assigned by the user, a variable
      (`ratingNum`, value `0` if the rating has not been assigned, otherwise value `1`)
      and the length of the path.
   
      2. Through a map and reduce operation, all rating values for each individual path are added together.
   
      3. Through a map and reduce operation, all values of the ratingNum variable of each
      individual path are added together.
   
      4. The two preceding operations are used to calculate the average rating of each
      path through the use of a function and a reduce operation. 

      5. Through the use of map, mapValues and reduce operations, the average duration in
      seconds of each path is calculated.

      6. The same as above is performed for the average length of each individual path.

      7. Finally, a new RDD is constructed containing the source and destination of the path,
      the average duration in seconds, the average length and the average rating.

After that, the three RDDs are converted into three dataframes, which are used to insert
into the Neo4j database the nodes relating to articles with a category-related property,
the edges of to hyperlinks and the edges of to challenges with the following properties:
* average duration;
* average rating;
* average length.

The queries used to create the property graph are:
```cypher
CREATE (n:Article {name: "ARTICLE_NAME", category: "[CATEGORY_NAME,...,CATEGORY_NAME]"})
```
```cypher
MATCH (a:Article), (b:Article)
WHERE a.name = "ARTICLE_1_NAME" AND b.name = "ARTICLE_2_NAME"
CREATE (a)-[r:HYPERLINK]->(b) RETURN type(r)
```
```cypher
MATCH (a:Article), (b:Article)
WHERE a.name = "ARTICLE_1_NAME" AND b.name = "ARTICLE_2_NAME"
CREATE (a)-[r:CHALLENGE]->(b)
SET r.duration = "AVG_DURATION"
r.pathLength = "AVG_LENGTH"
r.rating = "AVG_RATING"
```

You only need to run this script once per local Neo4J database.

----

### Electron Application (with use cases)

The Electron application allows the user to make five queries on the database and display
the results via an interactive HMTL5 Canvas.

You can launch the application via the shell script `start.sh`.

The canvas over HTML uses the **arbor.js** library for creating force directed graphs; these graphs are not, however, directed.
To overcome this problem, the nodes of the graph have been appropriately colored so
that the direction of the path can be easily interpreted.

The five queries made are:
1. **Categories**: by entering the name of two articles, a graph containing the categories of each
article is displayed.
```cypher
MATCH (nodo1:Article {name: "ARTICLE_1_NAME"}), (nodo2:Article {name: "ARTICLE_2_NAME"}),
RETURN nodo1, nodo2
```
![Categories query](https://raw.githubusercontent.com/plspeziali/Wikispeedia-BigData/main/images/wn3.png)
*  *  *  *  *
2. **Shortest Path**: by entering the name of a source article (green node) and a destination article
(destination node), a graph is displayed corresponding to the shortest path between the two articles.
```cypher
MATCH (nodo1:Article {name: "ARTICLE_1_NAME"}), (nodo2:Article {name: "ARTICLE_2_NAME"}),
p = shortestPath((nodo1)-[:HYPERLINK*]-(nodo2))
RETURN p
```
![Categories query](https://raw.githubusercontent.com/plspeziali/Wikispeedia-BigData/main/images/wn2.png)
*  *  *  *  *
3. **All neighbours of the 1st node**: by entering the name of an article, its neighbouring
articles are displayed.
```cypher
MATCH (nodo1:Article {name: "ARTICLE_1_NAME"}), (nodo2:Article {name: "ARTICLE_2_NAME"}),
p = (nodo1)-[*]-(nodo2) RETURN p, length(p) ORDER BY length(p) DESC LIMIT 1
```
![Categories query](https://raw.githubusercontent.com/plspeziali/Wikispeedia-BigData/main/images/wn1.png)
*  *  *  *  *
4. **The Hardest Challenge**: the hardest challenge (the one with an average rating of 5 and
the longest average duration) is displayed on a graph.
```cypher
MATCH (a:Article) -[r:CHALLENGE {rating: "5"}]-> (b:Article)
RETURN a,b,r.duration,r.pathLength ORDER BY r.duration DESC LIMIT 1
```
![Categories query](https://raw.githubusercontent.com/plspeziali/Wikispeedia-BigData/main/images/wn4.png)
*  *  *  *  *
5. **The Easiest Challenge**: the easiest challenge (the one with an average rating of 1 and
the shortest average duration) is displayed on a graph.
```cypher
MATCH (a:Article) -[r:CHALLENGE {rating: "1"}]-> (b:Article)
RETURN a,b,r.duration,r.pathLength ORDER BY r.duration ASC LIMIT 1
```
![Categories query](https://raw.githubusercontent.com/plspeziali/Wikispeedia-BigData/main/images/wn5.png)

## Limitations and future developments
Initially, it was thought that we could integrate a small estimator (with **MLlib**) that,
with a linear regression algorithm, would estimate null ratings from existing
ratings using path length and match duration as features.

However, despite having tuned the hyperparameters appropriately,
the indicators returned an accuracy of about 20%,
so we preferred to avoid and leave the null ratings at value `0`.


[^1]: Robert West and Jure Leskovec:
Human Wayfinding in Information Networks.
21st International World Wide Web Conference (WWW), 2012.
[^2]: Robert West, Joelle Pineau, and Doina Precup:
Wikispeedia: An Online Game for Inferring Semantic Distances between Concepts.
21st International Joint Conference on Artificial Intelligence (IJCAI), 2009.


