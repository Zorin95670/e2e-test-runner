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

  Scenario: Request without client certificate
    When I request "{{ env.MTLS_API_URL }}/certificate" with method "GET"
    Then I expect status code is 401

  Scenario: Request with client certificate
    Given I set client certificate "{{ env.CLIENT_CERTIFICATE }}" and key "{{ env.CLIENT_KEY }}" for "{{ env.MTLS_API_URL }}"
    When I request "{{ env.MTLS_API_URL }}/certificate" with method "GET"
    Then I expect status code is 200
    And I expect "{{ response.body.subject }}" is "e2e-client"
    And I expect http header "x-api-version" is "1.0.0"

  Scenario: Request with client certificate and query parameters
    Given I set client certificate "{{ env.CLIENT_CERTIFICATE }}" and key "{{ env.CLIENT_KEY }}" for "{{ env.MTLS_API_URL }}"
    When I request "{{ env.MTLS_API_URL }}/certificate" with method "GET" with query parameters
      | key  | value |
      | page | 2     |
    Then I expect status code is 200
    And I expect "{{ response.body.query.page }}" is "2"

  Scenario: Request with client certificate and body
    Given I set client certificate "{{ env.CLIENT_CERTIFICATE }}" and key "{{ env.CLIENT_KEY }}" for "{{ env.MTLS_API_URL }}"
    And I set http header "Content-Type" with "application/json"
    When I request "{{ env.MTLS_API_URL }}/certificate" with method "POST" with body:
      """
      {"name": "Alice"}
      """
    Then I expect status code is 200
    And I expect "{{ response.body.method }}" is "POST"
    And I expect '{{ response.body.body }}' is '{"name": "Alice"}'

  Scenario: Request another origin than the one of the client certificate
    Given I set client certificate "{{ env.CLIENT_CERTIFICATE }}" and key "{{ env.CLIENT_KEY }}" for "{{ env.MTLS_API_URL }}"
    When I request "{{ env.API_URL }}/users" with method "GET"
    Then I expect status code is 200

  Scenario: Override the client certificate of an origin
    Given I set client certificate "missing.crt" and key "missing.key" for "{{ env.MTLS_API_URL }}"
    And I set client certificate "{{ env.CLIENT_CERTIFICATE }}" and key "{{ env.CLIENT_KEY }}" for "{{ env.MTLS_API_URL }}"
    When I request "{{ env.MTLS_API_URL }}/certificate" with method "GET"
    Then I expect status code is 200
    And I expect "{{ response.body.subject }}" is "e2e-client"

  Scenario: Follow a redirect with client certificate
    Given I set client certificate "{{ env.CLIENT_CERTIFICATE }}" and key "{{ env.CLIENT_KEY }}" for "{{ env.MTLS_API_URL }}"
    When I request "{{ env.MTLS_API_URL }}/redirect" with method "GET"
    Then I expect status code is 200
    And I expect "{{ response.body.subject }}" is "e2e-client"

  Scenario: Follow a redirect after a POST with client certificate
    Given I set client certificate "{{ env.CLIENT_CERTIFICATE }}" and key "{{ env.CLIENT_KEY }}" for "{{ env.MTLS_API_URL }}"
    When I request "{{ env.MTLS_API_URL }}/redirect" with method "POST" with body:
      """
      {"name": "Alice"}
      """
    Then I expect status code is 200
    And I expect "{{ response.body.method }}" is "GET"
    And I expect "{{ response.body.body }}" is empty

  Scenario: Follow a redirect to another origin with client certificate
    Given I set client certificate "{{ env.CLIENT_CERTIFICATE }}" and key "{{ env.CLIENT_KEY }}" for "{{ env.MTLS_API_URL }}"
    When I request "{{ env.MTLS_API_URL }}/redirect?to={{ env.API_URL }}/users" with method "GET"
    Then I expect status code is 200
    And I expect "{{ response.body | json }}" as "json" to have length 3
