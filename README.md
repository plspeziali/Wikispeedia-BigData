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

The third one is `paths_finished`:

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
change this path also inside the Python script and/or the
Python Notebook.

By launching the `create-database.sh` shell script or executing 
the Jupyter Notebook `wikispeediaSpark.ipynb` inside a Spark environment
you can make the Spark program execute.



[^1]: Robert West and Jure Leskovec:
Human Wayfinding in Information Networks.
21st International World Wide Web Conference (WWW), 2012.
[^2]: Robert West, Joelle Pineau, and Doina Precup:
Wikispeedia: An Online Game for Inferring Semantic Distances between Concepts.
21st International Joint Conference on Artificial Intelligence (IJCAI), 2009.


