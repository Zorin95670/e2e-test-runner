Feature: HTTP steps

  Scenario: Request a resource
    When I request "{{ env.API_URL }}/users" with method "GET"
    Then I expect status code is 200
    And I expect "{{ response.body | json }}" as "json" to have length 3
    And I expect one resource of "{{ response.body | json }}" contains "name" equals to "Jane"

  Scenario: Request a missing resource
    When I request "{{ env.API_URL }}/users/99" with method "GET"
    Then I expect status code is 404
    And I expect "{{ response.body.error }}" is "User not found"

  Scenario: Request with query parameters
    Given I store "page" as "2" in context
    When I request "{{ env.API_URL }}/echo" with method "GET" with query parameters
      | key    | value        |
      | page   | {{ ctx.page }} |
      | filter | name         |
    Then I expect status code is 200
    And I expect "{{ response.body.query.page }}" is "2"
    And I expect "{{ response.body.query.filter }}" is "name"

  Scenario: Request with body
    Given I set http header "Content-Type" with "application/json"
    When I request "{{ env.API_URL }}/users" with method "POST" with body:
      """
      {"name": "Alice", "age": 28}
      """
    Then I expect status code is 201
    And I expect "{{ response.body.id }}" is "4"
    And I expect "{{ response.body.name }}" is "Alice"

  Scenario: Send and check headers
    Given I set http header "Authorization" with "Bearer e2e-token"
    When I request "{{ env.API_URL }}/secured" with method "GET"
    Then I expect status code is 200
    And I expect http header "x-api-version" is "1.0.0"
    And I expect http header "Content-Type" contains "application/json"

  Scenario: Use URL with special characters
    When I request "{{ env.API_URL }}/echo?first=1&second=2" with method "GET"
    Then I expect "{{ response.body.query.second }}" is "2"
    And I expect http header "x-request-id" is "e2e-request-id"
