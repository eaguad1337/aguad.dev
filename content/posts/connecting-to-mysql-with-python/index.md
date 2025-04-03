---
title: "Connecting to MySQL with Python: A Complete Guide"
date: 2025-04-02
draft: false
description: "Learn how to connect to MySQL databases in Python using various methods including direct connector and ORM approaches."
tags: ["python", "mysql", "masoniteorm"]
showTableOfContents: true
---
# Connecting to MySQL with Python: A Complete Guide

MySQL is one of the most popular relational database systems, and Python offers several ways to connect to and interact with MySQL databases. In this guide, I'll show you how to set up MySQL connections in Python, with examples from a real project.

## Prerequisites

Before we begin, make sure you have:

- Python 3.9+ installed
- MySQL server installed and running
- Basic understanding of SQL

## Technologies We'll Use

- **Python** - Our programming language
- **MySQL** - Database server
- **mysql-connector-python** - Official MySQL driver for Python
- **python-dotenv** - For managing environment variables
- **MasoniteORM** - An elegant ORM for Python (similar to Laravel's Eloquent)

## Installation

First, let's install the required packages:

```bash
pip install mysql-connector-python==8.3.0
pip install python-dotenv==1.0.1
pip install masoniteorm
```

Or create a `requirements.txt` file:

```txt
mysql-connector-python==8.3.0
python-dotenv==1.0.1
masoniteorm
```

And install with:

```bash
pip install -r requirements.txt
```

## Setting Up Environment Variables

It's best practice to keep database credentials in environment variables, not hardcoded in your application. Create a `.env` file in your project root:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=your_database_name
DB_PORT=3306
```

## Method 1: Direct Connection with mysql-connector

Let's start with the simplest approach using the official MySQL connector:

```python
import mysql.connector
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get database credentials from environment
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'root'),
    'database': os.getenv('DB_NAME', 'your_database_name'),
    'port': int(os.getenv('DB_PORT', '3306')),
}

# Create connection
connection = mysql.connector.connect(**db_config)

# Create cursor
cursor = connection.cursor(dictionary=True)  # Returns results as dictionaries

# Execute query
cursor.execute("SELECT * FROM your_table LIMIT 5")

# Fetch results
results = cursor.fetchall()

# Process results
for row in results:
    print(row)

# Close cursor and connection
cursor.close()
connection.close()
```

This approach is straightforward but requires you to manage connections and write raw SQL.

## Method 2: Using an ORM (MasoniteORM)

For more complex applications, an Object-Relational Mapper (ORM) can simplify database interactions. In our project, we use MasoniteORM:

### Database Configuration

Create a `config/database.py` file:

```python
from masoniteorm.connections import ConnectionResolver

DATABASES = {
    "default": "mysql",
    "mysql": {
        "host": "127.0.0.1",
        "driver": "mysql",
        "database": "ollama-test",
        "user": "root",
        "password": "root",
        "port": 3306,
        "log_queries": False,
        "options": {
            #
        },
    },
}

DB = ConnectionResolver().set_connection_details(DATABASES)
```

For a more environment-variable driven approach, you could do:

```python
from masoniteorm.connections import ConnectionResolver
import os
from dotenv import load_dotenv

load_dotenv()

DATABASES = {
    "default": "mysql",
    "mysql": {
        "host": os.getenv('DB_HOST', '127.0.0.1'),
        "driver": "mysql",
        "database": os.getenv('DB_NAME', 'your_database_name'),
        "user": os.getenv('DB_USER', 'root'),
        "password": os.getenv('DB_PASSWORD', 'root'),
        "port": int(os.getenv('DB_PORT', '3306')),
        "log_queries": False,
    },
}

DB = ConnectionResolver().set_connection_details(DATABASES)
```

### Creating a Model

With MasoniteORM, you can define models that represent your database tables:

```python
from masoniteorm.models import Model

class Product(Model):
    """Product Model"""
    __table__ = 'products'
    __fillable__ = ['name', 'price', 'stock', 'brand']
```

### Making Queries

Now you can use the model or query builder to interact with the database:

```python
# Using the model
products = Product.all()
apple_products = Product.where('brand', 'Apple').get()

# Or using the query builder directly
from config.database import DB

products = DB.table('products').all()
apple_products = DB.table('products').where('brand', 'Apple').get()
```

## Common Issues and Solutions

### Connection Errors

If you see errors like "Can't connect to MySQL server", check:
- Is MySQL running?
- Are you using the correct host and port?
- Is your user/password correct?
- Does the database exist?

### Security Considerations

Never commit your `.env` file or hardcode credentials. Always use environment variables or a secure secrets manager.

## Conclusion

Connecting Python to MySQL opens up powerful possibilities for data-driven applications. Whether you choose a direct connection approach or use an ORM depends on your project's complexity and requirements.

The examples in this guide are based on real-world usage and should help you get started with MySQL and Python integration. The combination of database access with AI capabilities (as shown in our final example) demonstrates how these technologies can work together in modern applications.

Happy coding!