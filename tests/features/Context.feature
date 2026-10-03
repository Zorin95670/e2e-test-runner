Feature: Context steps

  Scenario: Compare values
    Then I expect "value" is "value"
    And I expect "value" is not "other"
    And I expect "" is empty
    And I expect "value" is not empty
    And I expect "full value" contains "value"
    And I expect "full value" not contains "other"
    And I expect "value" to have length 5

  Scenario: Compare typed values
    Then I expect "42" is "42" as "integer"
    And I expect "4.2" is "4.20" as "float"
    And I expect "true" is "true" as "boolean"
    And I expect "{\"a\": 1, \"b\": [1, 2]}" is "{\"b\": [1, 2], \"a\": 1}" as "json"
    And I expect "[1, 2, 3]" as "json" to have length 3
    And I expect "{\"a\": 1, \"b\": 2}" as "json" to have length 2
    And I expect "value" as "string" to have length 5

  Scenario: Store values in context
    Given I store "name" as "John" in context
    And I store as "user":
      """
      {"name": "{{ ctx.name }}", "age": 30}
      """
    Then I expect "{{ ctx.name }}" is "John"
    And I expect "{{ ctx.user }}" is "{\"name\": \"John\", \"age\": 30}" as "json"

  Scenario: Use environment variables
    Then I expect "{{ env.E2E_TEST_VARIABLE }}" is "e2e"

  Scenario: Check resources
    Given I store as "names":
      """
      ["John", "Jane"]
      """
    And I store as "ages":
      """
      [30, 25]
      """
    And I store as "users":
      """
      [{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]
      """
    Then I expect one resource of "{{ ctx.names }}" equals to "Jane"
    And I expect one resource of "{{ ctx.ages }}" equals to "25" as "integer"
    And I expect one resource of "{{ ctx.users }}" contains "name" equals to "John"
    And I expect one resource of "{{ ctx.users }}" contains "age" equals to "25" as "integer"

  Scenario: Store HTML element text in context
    Given I visit the "/index.html"
    When I store the text of the HTML element "#title" as "title" in context
    Then I expect "{{ ctx.title }}" is "E2E test runner"
