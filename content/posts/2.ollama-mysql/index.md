---
title: "Using an AI model to ask questions to your database"
date: 2025-04-01
draft: false
description: "Ollama and MySQL"
tags: ["python", "mysql", "database", "orm", "ai"]
categories: ["programming", "ai"]
showTableOfContents: true
slug: "using-ai-model-to-ask-questions-to-database"
---

In this guide, we'll explore how to use AI models to interact with your database using natural language, allowing you to query your data without writing SQL.

## Basic Implementation

Here's a simple implementation that connects an AI model to a database:

```python
# MY FIRST AI PROGRAM

from openai import OpenAI
from masoniteorm.query import QueryBuilder

question = input("Enter your question: ")

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ANYTHING",  # If using OpenAI, use your API key
)

prompt = """
You are an AI assistant that answers questions in a friendly and clear manner.
Your goal is to answer questions about a database with the following structure:

table: products
fields:
- id: int
- name: varchar, product name
- price: int, product price
- stock: int, product stock
- brand: varchar, product brand

To solve user questions, you have the following tools:

1. get_data:
- Description: Gets data from the products table based on provided filters.
- Parameters:
    - filters: json, filters for the query. Example: {"name": "product1"}
    - Returns: list of dictionaries, each dictionary represents a product

Responses should be in JSON format and if you need to use a tool, return a response with this format:

{
    "tool": "get_data",
    "parameters": {
        "filters": {
            "brand": "Apple"
        },
    }
}
"""

response = client.chat.completions.create(
    model="mistral",
    messages=[
        {"role": "system", "content": prompt},
        {"role": "user", "content": question},
    ],
)

ai_response = response.choices[0].message.content

print(ai_response)
```

## Enhanced Implementation

Here's an expanded version with more tools and better functionality:

```python
# AI DATABASE ASSISTANT

import json
import os
from openai import OpenAI
from masoniteorm.query import QueryBuilder
from masoniteorm.query.grammars import MySQLGrammar
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize database connection
QueryBuilder.set_connection_details({
    "default": "mysql",
    "mysql": {
        "host": "localhost",
        "driver": "mysql",
        "database": "product_db",
        "user": os.environ.get("DB_USER", "root"),
        "password": os.environ.get("DB_PASSWORD", ""),
        "port": 3306
    }
})

# Tool functions
def get_data(filters=None, limit=10, columns=None, order_by=None):
    query = QueryBuilder().table("products")

    if filters:
        for key, value in filters.items():
            if isinstance(value, dict) and "operator" in value:
                query.where(key, value["operator"], value["value"])
            else:
                query.where(key, "=", value)

    if columns:
        query.select(columns)

    if order_by:
        query.order_by(order_by["column"], order_by.get("direction", "asc"))

    return query.limit(limit).get()

def aggregate_data(operation, column, filters=None):
    query = QueryBuilder().table("products")

    if filters:
        for key, value in filters.items():
            query.where(key, "=", value)

    if operation == "sum":
        return query.sum(column)
    elif operation == "avg":
        return query.avg(column)
    elif operation == "min":
        return query.min(column)
    elif operation == "max":
        return query.max(column)
    elif operation == "count":
        return query.count()

    return None

# Process AI response and handle tool requests
def process_ai_response(ai_response, question):
    try:
        # Check if the response is a tool call
        tool_request = json.loads(ai_response)
        if "tool" in tool_request:
            # Execute the requested tool
            if tool_request["tool"] == "get_data":
                data = get_data(**tool_request["parameters"])

                # Send the data back to the AI for final formatting
                final_response = client.chat.completions.create(
                    model="mistral",
                    messages=[
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": question},
                        {"role": "assistant", "content": ai_response},
                        {"role": "system", "content": f"Tool result: {json.dumps(data)}"}
                    ],
                )
                return final_response.choices[0].message.content

            elif tool_request["tool"] == "aggregate_data":
                result = aggregate_data(**tool_request["parameters"])

                # Send the result back to the AI for final formatting
                final_response = client.chat.completions.create(
                    model="mistral",
                    messages=[
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": question},
                        {"role": "assistant", "content": ai_response},
                        {"role": "system", "content": f"Tool result: {result}"}
                    ],
                )
                return final_response.choices[0].message.content
    except json.JSONDecodeError:
        # If not a tool call, return the original response
        pass
    except Exception as e:
        return f"Error processing request: {str(e)}"

    return ai_response

# Main function
def ask_database(question):
    client = OpenAI(
        base_url="http://localhost:11434/v1",
        api_key="ANYTHING",
    )

    prompt = """
    You are an AI assistant that answers questions about product inventory in a friendly and clear manner.
    Your goal is to answer questions about a database with the following structure:

    table: products
    fields:
    - id: int
    - name: varchar, product name
    - price: int, product price in dollars
    - stock: int, current inventory count
    - brand: varchar, product manufacturer
    - category: varchar, product category
    - created_at: datetime, when the product was added

    To solve user questions, you have the following tools:

    1. get_data:
    - Description: Gets data from the products table based on provided filters.
    - Parameters:
        - filters: json, filters for the query. Example: {"name": "product1", "price": {"operator": ">", "value": 100}}
        - limit: int, maximum number of results to return (default 10)
        - columns: list, specific columns to return (default all)
        - order_by: json, ordering specification. Example: {"column": "price", "direction": "desc"}
    - Returns: list of dictionaries, each dictionary represents a product

    2. aggregate_data:
    - Description: Performs aggregate operations on the products table.
    - Parameters:
        - operation: string, one of ["sum", "avg", "min", "max", "count"]
        - column: string, the column to perform the operation on
        - filters: json, filters for the query (optional)
    - Returns: numeric result of the aggregate operation

    When answering:
    1. Determine if you need data from the database to answer the question
    2. Select the appropriate tool and parameters
    3. Format your tool request using exact JSON format
    4. When responding with data to the user, format it in a friendly, readable way

    If you need to use a tool, return ONLY a response with this format:
    {
        "tool": "tool_name",
        "parameters": {
            "param1": value1,
            "param2": value2
        }
    }
    """

    response = client.chat.completions.create(
        model="mistral",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": question},
        ],
    )

    ai_response = response.choices[0].message.content
    return process_ai_response(ai_response, question)

if __name__ == "__main__":
    question = input("Enter your question about the product inventory: ")
    response = ask_database(question)
    print(response)
```

## Step-by-Step Guide

### What Is This?

This is a Python application that allows users to query a database using natural language. Instead of writing complex SQL queries, users can ask questions in plain English, and an AI model interprets these questions, generates the appropriate database queries, and returns human-readable answers.

### Why Is It Useful?

1. **Accessibility**: Non-technical team members can query data without SQL knowledge
2. **Efficiency**: Get insights quickly without writing complex queries
3. **Flexibility**: Ask complex questions in natural language
4. **Democratization of Data**: Makes data accessible to everyone in the organization

### How It Works

1. **User Input**: A user asks a question in natural language (e.g., "What Apple products do we have in stock?")
2. **AI Processing**: The question is sent to an AI model (Mistral via Ollama)
3. **Intent Recognition**: The AI determines what database query is needed
4. **Tool Selection**: The AI formats a request for the appropriate tool (get_data, aggregate_data)
5. **Query Execution**: The Python application executes the database query
6. **Result Formatting**: Results are sent back to the AI for formatting
7. **User Response**: A human-readable answer is provided to the user

### Prerequisites

1. **Python 3.8+**
2. **MySQL database**
3. **Ollama** (local AI model runner)
4. **Python packages**: openai, masoniteorm, python-dotenv

### Installation Steps

#### 1. Set Up Python Environment

Create a virtual environment and install required packages:

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install openai masoniteorm python-dotenv
```

#### 2. Install Ollama

Ollama is a local AI model runner that allows you to run models like Mistral on your machine without sending data to external APIs.

Visit [ollama.ai](https://ollama.ai) and download the appropriate version for your operating system:
- MacOS: Download the .dmg file and follow the installation instructions
- Linux: Follow the installation instructions for your distribution
- Windows: Download the installer and follow the setup process

#### 3. Download the Mistral Model

After installing Ollama, open a terminal and run:

```bash
ollama pull mistral
```

This will download the Mistral language model (~4GB).

#### 4. Set Up Your Database

Create a MySQL database and table for products:

```sql
CREATE DATABASE product_db;

USE product_db;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  stock INT NOT NULL,
  brand VARCHAR(255),
  category VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample data
INSERT INTO products (name, price, stock, brand, category) VALUES
  ('Laptop Pro', 1299, 45, 'Apple', 'Electronics'),
  ('Smartphone X', 899, 120, 'Samsung', 'Electronics'),
  ('Wireless Earbuds', 149, 200, 'Apple', 'Audio'),
  ('Smart Watch', 249, 75, 'Fitbit', 'Wearables');
```

#### 5. Configure Environment Variables

Create a `.env` file in your project directory to securely store database credentials:

```
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
```

### Usage

#### 1. Start the Ollama Server

Open a terminal and run:

```bash
ollama serve
```

This starts the Ollama server, which will listen on port 11434 by default.

#### 2. Run Your AI Database Assistant

Start your Python script:

```bash
python db_assistant.py
```

#### 3. Ask Questions

You can now ask questions about your product database in natural language:

- "What Apple products do we have in stock?"
- "Show me all products with price above $500"
- "What's the average price of Samsung products?"
- "Which product has the lowest stock level?"
- "How many electronics products do we have?"

The AI will interpret your question, generate the appropriate database query, and return a human-readable answer.

### Security Considerations

#### 1. Local Model Security

Using Ollama means your queries stay on your local machine and aren't sent to external APIs. This provides several benefits:
- Data privacy: Your database schema and data never leave your environment
- No API costs: You're not paying per query to OpenAI or other providers
- Offline capability: Works without internet access

#### 2. Database Security

The connection between your application and database presents security considerations:

- **Use environment variables** for database credentials
- **Create a dedicated database user** with read-only permissions to the specific tables
- **Never commit .env files** to version control
- **Use parameter binding** to prevent SQL injection (the MasoniteORM handles this)

#### 3. Input Validation

While the AI helps interpret user questions, careful handling is needed:

- **Validate and sanitize** any parameter passed to database queries
- **Limit query complexity** to prevent resource-intensive operations
- **Implement rate limiting** to prevent abuse

#### 4. Access Control

Consider who can use this system:

- **User authentication**: Require login before allowing database queries
- **Role-based access**: Restrict which tables/fields different users can query
- **Query auditing**: Log all queries for security review

### Limitations and Future Improvements

1. **Context Awareness**: The current implementation handles single questions. Adding conversation history would allow follow-up questions.

2. **Error Handling**: Add robust error handling for malformed AI responses or database errors.

3. **Schema Updates**: As your database schema evolves, you'll need to update the AI prompt.

4. **Multiple Tables**: Extend the tools to handle joins and relationships between tables.

5. **Performance Optimizations**: Add caching for common queries and results.

6. **Domain-Specific Knowledge**: Fine-tune the model on your specific database schema for better performance.

### Conclusion

By combining the power of AI with database access, you've created a powerful tool that democratizes data access in your organization. Non-technical users can now get insights from your database without writing SQL queries, while technical users can save time on routine data retrieval tasks.

This implementation demonstrates the potential of AI-powered interfaces for databases, making data more accessible and useful throughout your organization.