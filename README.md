# e2e-test-runner

**e2e-test-runner** is a ready-to-use E2E test runner that leverages Cypress and Cucumber.

It provides a collection of pre-implemented reusable steps to simplify writing and maintaining end-to-end tests for your
applications.

## Features

- 🧪 Predefined Cucumber steps for HTTP requests and assertions
- 🧰 Built-in context system with template rendering (via Nunjucks)
- ⚙️ Compatible with Cypress and Cucumber ecosystem
- 🚀 Run tests via Node or Docker

## Technologies

- [Cypress](https://www.cypress.io/)
- [Cucumber](https://cucumber.io/)
- [Node.js](https://nodejs.org/)
- [Nunjucks](https://mozilla.github.io/nunjucks/)

## Installation

### Option 1: Clone into your project

```bash
git clone https://github.com/your-org/e2e-test-runner e2e
```

Make sure to include `e2e` in your `.gitignore` if it's only for local use.

### Option 2: Use as a Git submodule

```bash
git submodule add https://github.com/your-org/e2e-test-runner e2e
```

Then install dependencies:

```bash
cd e2e
npm install
```

## Running Tests

### CLI Options

When launching the test runner, you can customize the test execution with the following options:

| Option       | Description                                       | Example                 |
|--------------|---------------------------------------------------|-------------------------| 
| `--features` | Path to the directory containing `.feature` files | `./tests/features`      |
| `--baseUrl`  | Base URL used for `cy.visit()` or HTTP requests   | `http://localhost:3000` |

### With Node (locally)

```bash
node e2e/index.js --features=./tests/features --baseUrl=http://localhost:3000
```

### With Docker

```bash
docker build e2e -t e2e-test-runner
docker run --rm -e features=./tests/features -e baseUrl=http://localhost:3000 -v e2e-test-runner
```

## Usage

The test runner supports writing tests in Gherkin using `.feature` files.

### Example Feature

```gherkin
Feature: Basic HTTP check

  Scenario: GET Google homepage
    When I request "https://www.google.com" with method "GET"
    Then I expect status code is 200
```

### Context System

This test runner provides a built-in context system to share data between steps.
It is designed to simplify dynamic value handling, templating, and state tracking during test execution.

| Key        | Description                                                                                                      |
|------------|------------------------------------------------------------------------------------------------------------------|
| `env`      | Contains all environment variables. Useful for configuration and templating.                                     |
| `ctx`      | A customizable object used to store any custom data needed during the test flow. **Reset before each scenario.** |
| `response` | Stores the last HTTP response. **Reset before each scenario.**                                                   |

**Example Usage**

You can also use the context in templated strings (via Nunjucks):

```gherkin
When I request "{{ env.API_URL }}/users/{{ ctx.userId }}" with method "GET"
```

### 🔤 Supported `<type>` values

Certain steps allow you to specify a `type` to interpret or convert values properly.
The following types are supported:

| Type      | Description                                                                      |
|-----------|----------------------------------------------------------------------------------|
| `string`  | Default type. Values are kept as-is.                                             |
| `integer` | Converts the value to a JavaScript integer (e.g., `"42"` → `42`).                |
| `float`   | Converts the value to a JavaScript float (e.g., `"3.14"` → `3.14`).              |
| `boolean` | Converts the value to a boolean (`"true"` → `true`, `"false"` → `false`).        |
| `json`    | Parses the value as a JSON object (e.g., `"{ \"foo\": 123 }"` → `{ foo: 123 }`). |

📌 These types are used to ensure that context variables, assertions, and request parameters behave as expected during
test execution.

### 📊 Using `<dataTable>`

In some steps like:

```gherkin
When I request "<url>" with method "<method>" with query parameters
```

You can define a `DataTable` in your Gherkin file to pass query parameters dynamically.

The table must include at least `key` and `value`, and may optionally include a `type` column:

```gherkin
When I request "/api/search" with method "GET" with query parameters
| key       | value      | type     |
| q         | banana     | string   |
| limit     | 10         | integer  |
| exact     | true       | boolean  |
```

| Column  | Required | Description                                                             |
|---------|----------|-------------------------------------------------------------------------|
| `key`   | ✅        | The name of the query parameter.                                        |
| `value` | ✅        | The value to assign to the key.                                         |
| `type`  | ❌        | Optional type conversion (see supported types above). Default: `string` |

✅ The table is evaluated with Nunjucks, so you can dynamically reference values like `{{ ctx.foo }}`.

## 📚 Step Definitions Reference

### 🔧 Context Utilities

1. Log a value

```gherkin
Then I log "<value>"
  
# Example:
Then I log "{{ response.status }}"
```

2. Wait a duration

```gherkin
Then I wait <seconds>s

#Example:
Then I wait 2s
```

4. Store a value in context

```gherkin
Then I store "<key>" as "<value>" in context

# Example:
Then I store "userId" as "{{ response.body.id }}" in context
```

### 🌐 HTTP Requests

1. Basic request

```gherkin
When I request "<url>" with method "<method>"

# Example:
When I request "https://api.example.com/items" with method "GET"
```

2. Request with query parameters

```gherkin
When I request "<url>" with method "<method>" with query parameters
| key     | value      | type    |
| userId  | 123        | integer |

# Example:
When I request "https://api.example.com/users" with method "GET" with query parameters
| key     | value      | type    |
| userId  | 123        | integer |
```

3. Request with raw body

```gherkin
When I request "<url>" with method "<method>" with body:
"""
{ "name": "John" }
"""

# Example:
When I request "https://api.example.com/users" with method "POST" with body:
"""
{ "name": "John" }
"""
```

4. Request with typed body

```gherkin
When I request "<url>" with method "<method>" with body as "<contentType>":
"""
{ "id": 5 }
"""

# Example:
When I request "https://api.example.com/users" with method "POST" with body as "application/json":
"""
{ "id": 5 }
"""
```

### 📥 Response Assertions

1. Check status code

```gherkin
Then I expect status code is <code>

# Example:
Then I expect status code is 200
```

2. Compare templated values

```gherkin
Then I expect "<value>" is "<expected>"

# Example:
Then I expect "{{ response.status }}" is "200"
```

3. Compare templated values with type

```gherkin
Then I expect "<value>" is "<expected>" as "<type>"

# Example:
Then I expect "{{ response.status }}" is "200" as "integer"
```

4. Check length of value

```gherkin
Then I expect "<value>" to have length <number>

# Example:
Then I expect "{{ response.body.users }}" to have length 5
```

5. Check length with type

```gherkin
Then I expect "<value>" as "<type>" to have length <number>

# Example:
Then I expect "{{ response.body.users }}" as "json" to have length 5
```

### 🔍 Resource Assertions

1. One resource equals to a value

```gherkin
Then I expect one resource of "<value>" equals to "<expected>"

# Example:
Then I expect one resource of "{{ response.body.users }}" equals to "John"
```

2. One resource equals with type

```gherkin
Then I expect one resource of "<value>" equals to "<expected>" as "<type>"

# Example:
Then I expect one resource of "{{ response.body.users }}" equals to "123" as "integer"
```

3. Resource field match expected

```gherkin
Then I expect one resource of "<value>" contains "<field>" equals to "<expected>"

# Example:
Then I expect one resource of "{{ response.body.users }}" contains "name" equals to "Alice"
```

4. Resource field match expected with type

```gherkin
Then I expect one resource of "<value>" contains "<field>" equals to "<expected>" as "<type>"

# Example:
Then I expect one resource of "{{ response.body.users }}" contains "age" equals to "30" as "integer"
```

### ✅ Step Summary

```gherkin
# 🔧 Context Utilities
Then I log "<value>"
Then I wait <seconds>s
Then I store "<key>" as "<value>" in context

# 🌐 HTTP Requests
When I request "<url>" with method "<method>"
When I request "<url>" with method "<method>" with query parameters
| key     | value      | type    |
| userId  | 123        | integer |
When I request "<url>" with method "<method>" with body:
"""
{ "name": "John" }
"""
When I request "<url>" with method "<method>" with body as "<contentType>":
"""
{ "id": 5 }
"""

# 📥 Response Assertions
Then I expect status code is <code>
Then I expect "<value>" is "<expected>"
Then I expect "<value>" is "<expected>" as "<type>"
Then I expect "<value>" to have length <number>
Then I expect "<value>" as "<type>" to have length <number>

# 🔍 Resource Assertions
Then I expect one resource of "<value>" equals to "<expected>"
Then I expect one resource of "<value>" equals to "<expected>" as "<type>"
Then I expect one resource of "<value>" contains "<field>" equals to "<expected>"
Then I expect one resource of "<value>" contains "<field>" equals to "<expected>" as "<type>"
```

## 🚧 Missing a Step?
If you need a step that doesn't exist yet, there are two options:

* 💬 Open an issue: Create an issue describing the step you need, including:
  * The Gherkin syntax you’d like to use
  * A short example of the expected behavior
  * Any relevant context or use case

* 🤝 Contribute directly: If you're comfortable with JavaScript and Cypress, feel free to open a Pull Request. Please:
  * Follow the existing step definitions style
  * Add Gherkin usage and examples to the README
  * Keep tests modular and consistent

🙏 Contributions and feedback are welcome! This runner is designed to be extensible and team-friendly.
