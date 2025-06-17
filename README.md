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

## 🚀 Running Tests

### 🔧 Required Environment Variable

The test runner **requires** the environment variable `CYPRESS_FEATURES_PATH`.

* It must point to the directory containing your `.feature` files.
* The path should be **relative to the current working directory** (i.e., where `npm run start` is executed).
* For example, in a Java project structure, if the test runner is executed from the `e2e` folder, the correct value
  would typically be:

```env
CYPRESS_FEATURES_PATH=../src/test/resources/features
```

You must define this variable in a `.env` file or inject it at runtime.

### 📦 Local Execution (with `dotenv`)

To run the test runner locally and load environment variables from a `.env` file:

1. Install [`dotenv-cli`](https://www.npmjs.com/package/dotenv-cli) globally:

```bash
npm install -g dotenv-cli
```

2. Run the test runner:

```bash
dotenv -e ../.env -- npm run start
```

### 🐳 Run via Docker

To run the test runner in a Docker container, make sure to:

* Mount the project directory.
* Provide access to the `.env` file.
* Connect the container to the appropriate Docker network (e.g., to communicate with your application under test).

Example:

```bash
docker build e2e -t e2e-test-runner
docker run --rm \
  --env-file .env \
  --network my-app-network \
  -v "$(pwd)/src/test/resources/features":/app/src/test/resources/features \
  e2e-test-runner

# or one line command:
docker run --rm --env-file .env --network my-app-network -v "$(pwd)/src/test/resources/features":/app/src/test/resources/features e2e-test-runner
```

> Replace `my-app-network` with the name of the Docker network your application is running on.

## Usage

The test runner supports writing tests in Gherkin using `.feature` files.

### Example Feature

```gherkin
Feature: Basic HTTP check

  Scenario: GET Google homepage
    When I request "https://www.google.com" with method "GET"
    Then I expect status code is 200
```

### Using Nunjucks in Step Values

You can use [Nunjucks](https://mozilla.github.io/nunjucks/) templating syntax inside step values. This allows dynamic
content, especially useful when injecting data from environment variables or shared context.

#### Example with environment variable

```gherkin
Given I set http header "Authorization" with "Bearer {{ ctx.AUTH_TOKEN }}"
```

#### JSON formatting support

A custom `json` filter has been added to Nunjucks to properly serialize objects into formatted JSON strings.

```gherkin
Then I log "{{ response.body | json }}"
```

This is useful for debugging or displaying formatted JSON output directly from the response.

### Context System

This test runner provides a built-in context system to share data between steps.
It is designed to simplify dynamic value handling, templating, and state tracking during test execution.

| Key           | Description                                                                                                      |
|---------------|------------------------------------------------------------------------------------------------------------------|
| `env`         | Contains all environment variables. Useful for configuration and templating.                                     |
| `ctx`         | A customizable object used to store any custom data needed during the test flow. **Reset before each scenario.** |
| `response`    | Stores the last HTTP response. **Reset before each scenario.**                                                   |
| `httpHeaders` | Stores all HTTP headers set via step definitions. **Reset before each scenario.**                                |

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

---

5. Store a raw value in context

```gherkin
Then I store as "<value>":
"""
My data
"""

# Example:
Then I store as "data":
"""
My data
"""
```

---

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

4. Set HTTP header

```gherkin
Given I set http header "<key>" with "<value>"

# Example:
Given I set http header "Authorization" with "Bearer abc123"
```

---

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

---

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

---

### 🔐 Manipulate localStorage

1. Set a value in LocalStorage

```gherkin
Given I set in localstorage field "<key>" with "<value>"

# Example:
Given I set in localstorage field "token" with "abc123"
```

2. Assert a value in LocalStorage

```gherkin
Then I expect localstorage field "<key>" is "<expected>"

# Example:
Then I expect localstorage field "token" is "abc123"
```

3. Delete a value from LocalStorage

```gherkin
Then I delete "<key>" in localstorage

# Example:
Then I delete "token" in localstorage
```

4. Copy LocalStorage field to context

```gherkin
Then I set localstorage field "<localStorageField>" to context field "<contextField>"

# Example:
Then I set localstorage field "token" to context field "userToken"
```

5. Copy LocalStorage field to context with type conversion

```gherkin
Then I set localstorage field "<localStorageField>" to context field "<contextField>" as "<type>"

# Example:
Then I set localstorage field "isAdmin" to context field "adminFlag" as "boolean"
```

---

### 🌐 URL Navigation & Assertions

1. Visit a URL

```gherkin
Given I visit "<url>"

# Example:
Given I visit "{{ env.baseUrl }}/login"
```

2. Reload a specific URL

```gherkin
Given I reload to "<url>"

# Example:
Given I reload to "{{ env.baseUrl }}/dashboard"
```

3. Expect current URL is exactly

```gherkin
Then I expect current url is "<url>"

# Example:
Then I expect current url is "{{ env.baseUrl }}/home"
```

4. Expect current URL contains a string

```gherkin
Then I expect current url contains "<url>"

# Example:
Then I expect current url contains "/home"
```

5. Expect current URL matches a pattern

```gherkin
Then I expect current url matches "<regex>"

# Example:
Then I expect current url matches ".*\\/profile\\/\\d+$"
```

6. Expect current URL is no longer a specific URL

```gherkin
Then I expect the current URL no longer is "<url>"

# Example:
Then I expect the current URL no longer is "{{ env.baseUrl }}/splash"
```

7. Expect current URL no longer contains a string

```gherkin
Then I expect the current URL no longer contains "<text>"

# Example:
Then I expect the current URL no longer contains "/splash"
```

8. Expect current URL no longer matches a pattern

```gherkin
Then I expect the current URL no longer matches "<regex>"

# Example:
Then I expect the current URL no longer matches ".*\\/splash$"
```

---

### 🖱️ HTML Element Interactions

1. Click on an element

```gherkin
When I click on "<selector>"

# Example:
When I click on "#submit-button"
```

2. Force click on an element (ignores visibility)

```gherkin
When I force click on "<selector>"

# Example:
When I force click on ".dropdown-toggle"
```

3. Double-click on an element

```gherkin
When I double click on "<selector>"

# Example:
When I double click on "#editable-cell"
```

4. Scroll to a position inside an element

```gherkin
When I scroll to "<position>" into "<selector>"

# Example:
When I scroll to "bottom" into ".scrollable-container"
```

5. Hover an element to make it visible

```gherkin
When I hover "<selector>" to make it visible

# Example:
When I hover ".tooltip-trigger" to make it visible
```

6. Drag an element onto another

```gherkin
When I drag "<originSelector>" onto "<destinationSelector>"

# Example:
When I drag "#item" onto "#dropzone"
```

7. Drag an element by a specific offset

```gherkin
When I drag "<selector>" of <x>,<y>

# Example:
When I drag "#slider" of 50,0
```

8. Move an element by offset

```gherkin
When I move "<selector>" of <x>,<y>

# Example:
When I move "#box" of 20,30
```

9. Select an option inside a dropdown or menu

```gherkin
When I select "<option>" in "<selector>"

# Example:
When I select ".option-2" in ".dropdown-menu"
```

---

### 👁️ HTML Element Assertions

1. Expect element to exist

```gherkin
Then I expect the HTML element "<selector>" exists
```

2. Expect element to not exist

```gherkin
Then I expect the HTML element "<selector>" not exists
```

3. Expect element to be visible

```gherkin
Then I expect the HTML element "<selector>" to be visible
```

4. Expect element to be hidden

```gherkin
Then I expect the HTML element "<selector>" to be hidden
```

5. Expect element to be disabled

```gherkin
Then I expect the HTML element "<selector>" to be disabled
```

6. Expect element to be enabled

```gherkin
Then I expect the HTML element "<selector>" to be enabled
```

7. Expect element to have exact width

```gherkin
Then I expect the HTML element "<selector>" width is <width>

# Example:
Then I expect the HTML element "#image" width is 200
```

8. Expect element to have exact height

```gherkin
Then I expect the HTML element "<selector>" height is <height>

# Example:
Then I expect the HTML element "#container" height is 400
```

9. Expect element to be at a specific position

```gherkin
Then I expect the HTML element "<selector>" to be at position <x>,<y>

# Example:
Then I expect the HTML element "#popup" to be at position 100,200
```

10. Expect element to have a specific attribute and value

```gherkin
Then I expect the HTML element "<selector>" to have attribute "<attribute>" with value "<value>"

# Example:
Then I expect the HTML element "#logo" to have attribute "alt" with value "Company Logo"
```

11. Expect element to contain specific text

```gherkin
Then I expect the HTML element "<selector>" contains "<text>"

# Example:
Then I expect the HTML element "#message" contains "Welcome!"
```

12. Expect element to have a specific value

```gherkin
Then I expect the HTML element "<selector>" to have value "<value>"

# Example:
Then I expect the HTML element "#username" to have value "john.doe"
```

13. Expect element to appear a certain number of times

```gherkin
Then I expect the HTML element "<selector>" appear <count> time(s) on screen

# Example:
Then I expect the HTML element ".card" appear 3 time(s) on screen
```

---

### ✏️ HTML Element Text Manipulation

1. Clear the text inside an element

```gherkin
Then I clear the text in the HTML element "<selector>"

# Example:
Then I clear the text in the HTML element "#search-box"
```

2. Set a specific text inside an element

```gherkin
Then I set the text "<text>" in the HTML element "<selector>"

# Example:
Then I set the text "admin" in the HTML element "#username"
```

---

### 📐 Viewport Configuration

1. Set viewport size (useful for responsive tests)

```gherkin
Given I set the viewport size to <width> px by <height> px

# Example:
Given I set the viewport size to 1280 px by 720 px
```

---

### ☕ Kafka Messaging Steps

1. Setup Kafka client with clientId and broker

```gherkin
Given I setup kafka with clientId "<clientId>" and broker "<broker>"

# Example:
Given I setup kafka with clientId "my-client" and broker "localhost:9092"
```

2. Setup Kafka producer

```gherkin
Given I setup kafka producer

# Example:
Given I setup kafka producer
```

3. Setup Kafka consumer with groupId

```gherkin
Given I setup kafka consumer with groupId "<groupId>"

# Example:
Given I setup kafka consumer with groupId "test-group"
```

4. Listen for Kafka messages on a topic

```gherkin
Given I listen for Kafka messages on the topic "<topic>"

# Example:
Given I listen for Kafka messages on the topic "orders"
```

5. Send kafka message

```gherkin
When I send a Kafka message on the topic "<topic>" with body "<body>"

# Example:
When I send a Kafka message on the topic "orders" with body "my data"
```

6. Send kafka message with raw value

```gherkin
When I send a Kafka message on the topic "<topic>" with body:
"""
{ "name": "John" }
"""

# Example:
When I send a Kafka message on the topic "orders" with body:
"""
{ "name": "John" }
"""
```

7. Expect a number of messages received on a Kafka topic

```gherkin
Then I expect {int} message(s) received on Kafka topic "<topic>"

# Example:
Then I expect 3 message(s) received on Kafka topic "orders"
```

8. Expect a message on a Kafka topic to be equal to a string

```gherkin
Then I expect a message on Kafka topic "<topic>" equals to "<value>"

# Example:
Then I expect a message on Kafka topic "orders" equals to "{\"orderId\":123}"
```

9. Expect a message on a Kafka topic to be equal to a provided type

```gherkin
Then I expect a message on Kafka topic "<topic>" equals to "<value>" as "<type>"

# Example:
Then I expect a message on Kafka topic "orders" equals to "{\"orderId\":123}" as "json"
```

10. Expect a message on a Kafka topic to be equal to a multi-line string

```gherkin
Then I expect a message on Kafka topic "<topic>" equals to:
"""
{
  "orderId": 123,
  "status": "shipped"
}
"""

# Example:
Then I expect a message on Kafka topic "orders" equals to:
"""
{
  "orderId": 123,
  "status": "shipped"
}
"""
```

11. Expect a message on a Kafka topic contains a substring

```gherkin
Then I expect a message on Kafka topic "<topic>" contains "<value>"

# Example:
Then I expect a message on Kafka topic "orders" contains "shipped"
```

12. Expect a message on a Kafka topic contains a multi-line string

```gherkin
Then I expect a message on Kafka topic "<topic>" contains:
"""
{
  "status": "shipped"
}
"""

# Example:
Then I expect a message on Kafka topic "orders" contains:
"""
{
  "status": "shipped"
}
"""
```

13. Expect a message on a Kafka topic matches a regex

```gherkin
Then I expect a message on Kafka topic "<topic>" matches regex "<regex>"

# Example:
Then I expect a message on Kafka topic "orders" matches regex "^\\{.*\"status\":\\s*\"shipped\".*\\}$"
```

14. Log kafka messages

```gherkin
Then I log kafka messages
```

---

### 🔡 Ldap directory

1. Setup ldap client with url, bind dn and password

```gherkin
Given I setup Ldap with url "<url>" bind dn "<bindDn>" and password "<password>"

# Example:
Given I setup Ldap with url "ldap://localhost:389" bind dn "cn=admin,dc=company,dc=com" and password "my_password"
```

2. Search ldap results with base Dn, filter and attributes

```gherkin
Given I search ldap results on base dn "<baseDn>" with filter "<filter>" and attributes "<attributes>"

# Example:
Given I search ldap results on base dn "ou=users,dc=company,dc=com" with filter "mail=john.doe@example.com" and attributes "cn sn mail"
```

3. Expect search results to a given length

```gherkin
Given I expect "<expectedLength>" ldap results
# Example:
Given I expect 2 ldap results
```

4. Delete all search results previously found

```gherkin
Given I delete all ldap results
# Example:
Given I delete all ldap results
```

5. Add a new ldap entry with dn and with raw attributes

```gherkin
Given I add a ldap entry with dn "<dn>" and with attributes:
# Example:
Given I add a ldap entry with dn "uid=c1aa97e9-fdff-4b81-b468-0cb41be3e550,dc=company,dc=com" and with attributes:
"""
{
    "objectClass": "top",
    "objectClass": "person",
    "objectClass": "organizationalPerson",
    "objectClass": "inetOrgPerson",
    "uid": "c1aa97e9-fdff-4b81-b468-0cb41be3e550",
    "cn": "John Doe",
    "sn": "Doe",
    "mail": "john.doe@example.com",
    "givenName": "John"
}
"""
```

6. Add a new ldap entry with dn and with attributes

```gherkin
Given I add a ldap entry with dn "<dn>" and with attributes <attributes>
# Example:
Given I add a ldap entry with dn "uid=c1aa97e9-fdff-4b81-b468-0cb41be3e550,dc=company,dc=com" and with attributes "{ ... }"
```

---

### ✅ Step Summary

```gherkin
# 🔧 Context Utilities
Then I log "<value>"
Then I wait <seconds>s
Then I store "<key>" as "<value>" in context
Then I store as "<value>":
"""
My data
"""

# 🌐 HTTP Requests
Given I set http header "<key>" with "<value>"
When I request "<url>" with method "<method>"
When I request "<url>" with method "<method>" with query parameters
| key     | value      | type    |
| userId  | 123        | integer |
When I request "<url>" with method "<method>" with body:
"""
{ "name": "John" }
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

# 🔐 Manipulate localStorage
Given I set in localstorage field "<key>" with "<value>"
Then I expect localstorage field "<key>" is "<expected>"
Then I delete "<key>" in localstorage
Then I set localstorage field "<localStorageField>" to context field "<contextField>"
Then I set localstorage field "<localStorageField>" to context field "<contextField>" as "<type>"

# 🌐 URL Navigation & Assertions
Given I visit "<url>"
Given I reload to "<url>"
Then I expect current url is "<url>"
Then I expect current url contains "<url>"
Then I expect current url matches "<regex>"
Then I expect the current URL no longer is "<url>"
Then I expect the current URL no longer contains "<text>"
Then I expect the current URL no longer matches "<regex>"

# 🖱️ HTML Element Interactions
When I click on "<selector>"
When I force click on "<selector>"
When I double click on "<selector>"
When I scroll to "<position>" into "<selector>"
When I hover "<selector>" to make it visible
When I drag "<originSelector>" onto "<destinationSelector>"
When I drag "<selector>" of <x>,<y>
When I move "<selector>" of <x>,<y>
When I select "<option>" in "<selector>"

# 👁️ HTML Element Assertions
Then I expect the HTML element "<selector>" exists
Then I expect the HTML element "<selector>" not exists
Then I expect the HTML element "<selector>" to be visible
Then I expect the HTML element "<selector>" to be hidde
Then I expect the HTML element "<selector>" to be disabled
Then I expect the HTML element "<selector>" to be enabled
Then I expect the HTML element "<selector>" width is <width>
Then I expect the HTML element "<selector>" height is <height>
Then I expect the HTML element "<selector>" to be at position <x>,<y>
Then I expect the HTML element "<selector>" to have attribute "<attribute>" with value "<value>"
Then I expect the HTML element "<selector>" contains "<text>"
Then I expect the HTML element "<selector>" to have value "<value>"
Then I expect the HTML element "<selector>" appear <count> time(s) on screen

# ✏️ HTML Element Text Manipulation
Then I clear the text in the HTML element "<selector>"
Then I set the text "<text>" in the HTML element "<selector>"

# 📐 Viewport Configuration
Given I set the viewport size to <width> px by <height> px

# ☕ Kafka Messaging Steps
Given I setup kafka with clientId "<clientId>" and broker "<broker>"
Given I setup kafka producer
Given I setup kafka consumer with groupId "<groupId>"
Given I listen for Kafka messages on the topic "<topic>"
When I send a Kafka message on the topic "<topic>" with body "<body>"
When I send a Kafka message on the topic "<topic>" with body:
"""
{ "name": "John" }
"""
Then I expect <count> message(s) received on Kafka topic "<topic>"
Then I expect a message on Kafka topic "<topic>" equals to "<value>"
Then I expect a message on Kafka topic "<topic>" equals to "<value>" as "<type>"
Then I expect a message on Kafka topic "<topic>" equals to:
"""
{
  "orderId": 123,
  "status": "shipped"
}
"""
Then I expect a message on Kafka topic "<topic>" contains "<value>"
Then I expect a message on Kafka topic "<topic>" contains:
"""
{
  "status": "shipped"
}
"""
Then I expect a message on Kafka topic "<topic>" matches regex "<regex>"
Then I log kafka messages
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
