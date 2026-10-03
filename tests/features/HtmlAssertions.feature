Feature: HTML assertion steps

  Scenario: Check element states
    Given I visit the "/index.html"
    Then I expect the HTML element "#title" exists
    And I expect the HTML element "#missing-element" not exists
    And I expect the HTML element "#visible-element" to be visible
    And I expect the HTML element "#hidden-element" to be hidden
    And I expect the HTML element "#disabled-button" to be disabled
    And I expect the HTML element "#enabled-button" to be enabled
    And I expect the HTML element "#checked-checkbox" is checked
    And I expect the HTML element "#unchecked-checkbox" is not checked

  Scenario: Check element content
    Given I visit the "/index.html"
    Then I expect the HTML element "#attribute-element" to have attribute "data-role" with value "tester"
    And I expect the HTML element "#title" contains "test runner"
    And I expect the HTML element "#title" not contains "other"
    And I expect the HTML element "#text-input" to have value "Initial value"
    And I expect the HTML element ".item" appear 3 times on screen

  Scenario: Check element geometry
    Given I visit the "/index.html"
    Then I expect the HTML element "#box" width is 100
    And I expect the HTML element "#box" height is 50
    And I expect the HTML element "#box" to be at position 20,10
