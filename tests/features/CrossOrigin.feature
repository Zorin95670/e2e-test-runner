Feature: Cross origin steps

  Scenario: Interact with a cross origin page
    Given I visit the "/index.html"
    When I click on "#cross-origin-link"
    And I set origin url as "{{ env.FRONT_CROSS_ORIGIN_URL }}"
    Then I expect the HTML element "#title" contains "Cross origin page"
    When I click on "#cross-origin-button"
    Then I expect the HTML element "#cross-origin-result" contains "clicked on cross origin"
    When I click on "#home-link"
    And I reset origin url
    Then I expect the HTML element "#title" contains "Page"
