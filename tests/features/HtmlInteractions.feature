Feature: HTML interaction steps

  Scenario: Click on elements
    Given I visit the "/index.html"
    When I click on "#click-button"
    Then I expect the HTML element "#click-result" contains "clicked"
    When I force click on "#force-click-button"
    Then I expect the HTML element "#click-result" contains "force clicked"
    When I double click on "#double-click-button"
    Then I expect the HTML element "#click-result" contains "double clicked"

  Scenario: Manage texts
    Given I visit the "/index.html"
    When I clear the text in the HTML element "#text-input"
    Then I expect the HTML element "#text-input" to have value ""
    When I set the text "Hello" in the HTML element "#text-input"
    Then I expect the HTML element "#text-input" to have value "Hello"
    When I set the text "Submitted text{enter}" in the HTML element "#text-input"
    Then I expect the HTML element "#text-result" contains "submitted: Submitted text"

  Scenario: Scroll into an element
    Given I visit the "/index.html"
    When I scroll to "bottom" into "#scroll-container"
    Then I expect the HTML element "#scroll-result" contains "scrolled to bottom"

  Scenario: Show a hidden element
    Given I visit the "/index.html"
    When I hover "#hidden-element" to make it visible
    Then I expect the HTML element "#hidden-element" to be visible

  Scenario: Select an option
    Given I visit the "/index.html"
    When I select "#option-banana" in "#select-button"
    Then I expect the HTML element "#select-result" contains "selected: Banana"

  Scenario: Drag elements
    Given I visit the "/index.html"
    When I drag "#draggable" onto "#drop-zone"
    Then I expect the HTML element "#drop-result" contains "dropped"
    And I expect the HTML element "#drop-zone #draggable" exists

  Scenario: Drag an element of an offset
    Given I visit the "/index.html"
    When I drag "#movable" of 50,20
    Then I expect the HTML element "#move-result" contains "moved"

  Scenario: Move an element of an offset
    Given I visit the "/index.html"
    When I move "#movable" of 50,20
    Then I expect the HTML element "#move-result" contains "moved"

  Scenario: Change the viewport size
    Given I set the viewport size to 800 px by 600 px
    And I visit the "/index.html"
    Then I expect the HTML element "#viewport-size" contains "800x600"

  Scenario: Upload files
    Given I visit the "/index.html"
    When I set file input "#file-input" with file "tests/features/fixtures/sample.txt"
    Then I expect the HTML element "#file-result" contains "sample.txt"
