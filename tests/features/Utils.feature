Feature: Utils steps

  Scenario: Log and wait
    Given I store "name" as "e2e" in context
    Then I log "Hello {{ ctx.name }}"
    When I wait 1s
