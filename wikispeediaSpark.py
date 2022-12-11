#!/usr/bin/env python
# coding: utf-8

# In[1]:


# Import main packages
from pyspark import SparkContext, SparkConf
from pyspark.sql import SparkSession
from pyspark.sql import functions as F


# In[2]:


# Create Spark context
sparkConf = SparkConf()
sparkConf.setAppName("wiki")
spark = SparkSession.builder.config(conf=sparkConf).getOrCreate()
sc = spark.sparkContext


# In[3]:


# Read dataframe categories.tsv
df_cat = spark.read \
    .format("csv") \
    .option("header", "true") \
    .option("delimiter", "\t") \
    .option("mode", "DROPMALFORMED") \
    .load("hdfs://localhost:9000/user/bigdata2022/datasets/wiki/categories.tsv")
df_cat.show(5)


# In[4]:


# Unquote article and category
from urllib.parse import unquote
rdd_cat = df_cat.rdd
rdd_cat  = rdd_cat.map(lambda x: (unquote(x.article),unquote(x.category)))
#rdd_cat.collect()


# In[5]:


# Group the categories per article in an array 
rdd_cat = rdd_cat.map(lambda x: (x[0],[x[1]])) \
            .reduceByKey(lambda a, b: a+b)
#rdd_cat.collect()


# In[6]:


# Read dataframe links.tsv
df_link = spark.read \
    .format("csv") \
    .option("header", "true") \
    .option("delimiter", "\t") \
    .option("mode", "DROPMALFORMED") \
    .load("hdfs://localhost:9000/user/bigdata2022/datasets/wiki/links.tsv")
df_link.show(5)


# In[7]:


# Unquote source and destination article
from urllib.parse import unquote
rdd_link = df_link.rdd
rdd_link  = rdd_link.map(lambda x: (unquote(x.source),unquote(x.destination)))
#rdd_link.collect()


# In[8]:


# Read dataframe path_finished.tsv
df_path = spark.read \
    .format("csv") \
    .option("header", "true") \
    .option("delimiter", "\t") \
    .option("mode", "DROPMALFORMED") \
    .load("hdfs://localhost:9000/user/bigdata2022/datasets/wiki/paths_finished.tsv")
df_path.show(5)


# In[9]:


# Constructed a new rdd with the source and destination of the path, 
# the duration in seconds of the path, the rating of the path, 
# a variable (worth 0 if the rating is unknown or worth 1 if it is known) 
# and the length of the path.
def formatRow(x):
    values = unquote(x.path).split(";")
    length = len(values)
    if(x.rating == "NULL"):
        rating = 0
        ratingNum = 0
    else:
        rating = int(x.rating)
        ratingNum = 1
    return (values[0]+"::"+values[-1],int(x.durationInSec),rating,ratingNum,length)

rdd_path = df_path.rdd
rdd_path  = rdd_path.map(lambda x: formatRow(x))
#rdd_path.collect()


# In[10]:


# Summed up the values of the rating variable for each distinct path
rdd_rating  = rdd_path.map(lambda x: (x[0],x[2])) \
                .reduceByKey(lambda a, b: a+b)
#rdd_rating.collect()


# In[11]:


# Summed up the number of user rating for each separate path
rdd_ratingsNum  = rdd_path.map(lambda x: (x[0],x[3])) \
                    .reduceByKey(lambda a, b: a+b)
#rdd_ratingsNum.collect()


# In[12]:


# Average rating of each individual path
def divide(x,y):
    return round(x/y) if y else 0 
    
rdd_rating2 = rdd_rating.union(rdd_ratingsNum).reduceByKey(lambda x,y : divide(x,y))
#rdd_rating2.collect()


# In[13]:


# Average duration in seconds of a single path
import math

rdd_duration = rdd_path \
    .map(lambda x: (x[0], x[1])) \
    .mapValues(lambda v: (v, 1)) \
    .reduceByKey(lambda a,b: (a[0]+b[0], a[1]+b[1])) \
    .mapValues(lambda v: math.ceil(v[0]/v[1]))
#rdd_duration.collect()


# In[14]:


# Average length of each individual path
rdd_length = rdd_path \
    .map(lambda x: (x[0], x[4])) \
    .mapValues(lambda v: (v, 1)) \
    .reduceByKey(lambda a,b: (a[0]+b[0], a[1]+b[1])) \
    .mapValues(lambda v: math.ceil(v[0]/v[1]))
#rdd_length.collect()


# In[15]:


# RDD containing the path, average rating and average duration in seconds  
rdd_final1 = rdd_rating2.join(rdd_duration)
#rdd_final1.collect()


# In[16]:


# RDD containing the path, average duration in seconds, average length and average rating
rdd_final2 = rdd_final1.join(rdd_length).map(lambda x: (x[0],x[1][0][1],x[1][1],x[1][0][0]))
#rdd_final2.collect()


# In[17]:


# RDD containing the source path, the destination path, 
# average duration in seconds, average length and average rating
def splitRow(x):
    source, target = x[0].split("::")
    return (source, target, x[1], x[2], x[3])

rdd_final3  = rdd_final2.map(lambda x: splitRow(x))
#rdd_final3.collect()


# In[18]:


# Convert RDD to DF

df_path = rdd_final3.toDF(["source","target","duration","pathLength","rating"])
#df_path.printSchema()
#df_path.show(truncate=False)

df_cat = rdd_cat.toDF(["source","category"])
#df_cat.printSchema()
#df_cat.show(truncate=False)

df_link = rdd_link.toDF(["source","target"])
#df_link.printSchema()
#df_link.show(truncate=False)


# In[19]:


#df_path.write.option("header",True) \
# .csv("hdfs://localhost:9000/user/bigdata2022/output/wiki/paths.csv")

#df_cat.write.option("header",True) \
# .csv("hdfs://localhost:9000/user/bigdata2022/output/wiki/categories.csv")

#df_link.write.option("header",True) \
# .csv("hdfs://localhost:9000/user/bigdata2022/output/wiki/links.csv")


# In[20]:


# Inserted article nodes, with their respective categories, into the neo4j database
from pyspark.sql.functions import col
from py2neo import Graph
graph = Graph("bolt://localhost:7687", auth=("neo4j", "bigdata"))

source = df_cat.select('source').rdd.flatMap(lambda x: x).collect()
category = df_cat.select('category').rdd.flatMap(lambda x: x).collect()

length = len(source)

for i in range(length):
    #print(str(i) +" on "+str(length))
    graph.run('CREATE (n:Article {name: "'+source[i]+'", category: "'+str(category[i])+'"})')


# In[21]:


# Inserted direct edges between two different articles (hyperlink) into the Neo4j database
source = df_link.select('source').rdd.flatMap(lambda x: x).collect()
target = df_link.select('target').rdd.flatMap(lambda x: x).collect()

length = len(source)

for i in range(length):
    #print(str(i) +" on "+str(length))
    graph.run('MATCH (a:Article), (b:Article) WHERE a.name = "'+source[i]+'" AND b.name = "'+target[i]+'"'+
              'CREATE (a)-[r:HYPERLINK]->(b) RETURN type(r)')


# In[22]:


# Inserted direct edges between two different articles of a path (challenge), 
# with the respective average rating, average duration in seconds and 
# average length in seconds, into the Neo4j database
source = df_path.select('source').rdd.flatMap(lambda x: x).collect()
target = df_path.select('target').rdd.flatMap(lambda x: x).collect()
duration = df_path.select('duration').rdd.flatMap(lambda x: x).collect()
pathLength = df_path.select('pathLength').rdd.flatMap(lambda x: x).collect()
rating = df_path.select('rating').rdd.flatMap(lambda x: x).collect()

length = len(source)

for i in range(length):
    #print(str(i) +" on "+str(length))
    graph.run('MATCH (a:Article), (b:Article) WHERE a.name = "'+source[i]+'" AND b.name = "'+target[i]+'"'+
              'CREATE (a)-[r:CHALLENGE]->(b) '+
              'SET r.duration = "'+str(duration[i])+'", '+
              'r.pathLength = "'+str(pathLength[i])+'", '+
              'r.rating = "'+str(rating[i])+'"')


# In[23]:


# Stop context
spark.stop()

