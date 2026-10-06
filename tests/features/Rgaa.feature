Feature: RGAA steps

  Scenario: Analyse an accessible page
    Given I visit the "/page.html"
    When I run an RGAA accessibility analysis on the current page
    Then I expect the page to have no accessibility violations
    And I expect the page to have no accessibility violations above "minor"
    And I expect "{{ ctx.rgaa | length }}" is "0"

  Scenario: Analyse an inaccessible page
    Given I visit the "/rgaa.html"
    When I run an RGAA accessibility analysis on the current page
    Then I expect the page to have no accessibility violations above "critical"
    And I expect the page to have at most 6 accessibility violations
    And I expect "{{ ctx.rgaa | length }}" is not "0"
