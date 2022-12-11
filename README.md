# Wikispeedia Big Data

### Authors: Gianluca Coletta & Paolo Speziali

A PySpark-based application to populate a Neo4j database with WikiSpeedia game data and
an Electron-based application to query and visualise that database. 

---
## Introduction 

The WikiSpeedia game consists of, given a starting and ending Wikipedia article to the player,
seeing how long it takes to reach the final article using only the hyperlinks within the articles.
Using the [datasets provided by Standford University](https://snap.stanford.edu/data/wikispeedia.html)[^1][^2],
we constructed a graph structure, where the nodes represented the articles while the direct arcs
represented either a hyperlink or a challenge performed by a user to go from the source
node to the destination node. 

[^1]: Robert West and Jure Leskovec:
Human Wayfinding in Information Networks.
21st International World Wide Web Conference (WWW), 2012.
[^2]: Robert West, Joelle Pineau, and Doina Precup:
Wikispeedia: An Online Game for Inferring Semantic Distances between Concepts.
21st International Joint Conference on Artificial Intelligence (IJCAI), 2009.


