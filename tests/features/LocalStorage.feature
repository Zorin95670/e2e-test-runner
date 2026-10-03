Feature: Local storage steps

  Scenario: Manage local storage
    Given I visit the "/index.html"
    And I set in localstorage field "token" with "e2e-token"
    And I set in localstorage field "user" with "{\"name\": \"John\"}"
    Then I expect localstorage field "token" is "e2e-token"
    When I click on "#read-storage-button"
    Then I expect the HTML element "#storage-result" contains "token: e2e-token"
    When I set localstorage field "token" to context field "token"
    And I set localstorage field "user" to context field "user" as "json"
    Then I expect "{{ ctx.token }}" is "e2e-token"
    And I expect "{{ ctx.user.name }}" is "John"
    When I delete "token" in localstorage
    And I click on "#read-storage-button"
    Then I expect the HTML element "#storage-result" contains "token: null"
