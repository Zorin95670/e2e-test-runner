Feature: URL steps

  Scenario: Visit and check the current URL
    Given I visit the "{{ env.FRONT_URL }}/index.html"
    Then I expect current url is "{{ env.FRONT_URL }}/index.html"
    And I expect current url contains "/index.html"
    And I expect current url matches "index\.html$"

  Scenario: Navigate to another page
    Given I visit the "/index.html"
    When I click on "#page-link"
    Then I expect the current URL no longer is "{{ env.FRONT_URL }}/index.html"
    And I expect the current URL no longer contains "/index.html"
    And I expect the current URL no longer matches "index\.html$"
    And I expect current url contains "/page.html?id=42"

  Scenario: Reload a page
    Given I reload to "/page.html"
    Then I expect the HTML element "#title" contains "Page"
