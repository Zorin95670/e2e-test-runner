Feature: Database steps

  Scenario: Execute sql requests with a connection string
    Given I setup database with "postgres://{{ env.DB_USER }}:{{ env.DB_PASSWORD }}@{{ env.DB_HOST }}:55432/{{ env.DB_NAME }}"
    When I execute sql request "CREATE TABLE IF NOT EXISTS e2e_users (name TEXT, age INTEGER)"
    And I execute sql request "DELETE FROM e2e_users"
    And I execute sql request "INSERT INTO e2e_users (name, age) VALUES ($1, $2)" with values:
      """
      ["John", 30]
      """
    And I execute sql request "INSERT INTO e2e_users (name, age) VALUES ($1, $2)" with values:
      """
      ["Jane", 25]
      """
    And I execute sql request "SELECT name, age FROM e2e_users ORDER BY name"
    Then I expect 2 database results
    And I expect "{{ ctx.dbResults[0].name }}" is "Jane"
    And I expect one resource of "{{ ctx.dbResults | json }}" contains "age" equals to "30" as "integer"

  Scenario: Execute sql requests with connection parameters
    Given I setup database with driver "postgres" host "{{ env.DB_HOST }}" port 55432 user "{{ env.DB_USER }}" password "{{ env.DB_PASSWORD }}" database "{{ env.DB_NAME }}"
    When I execute sql request "SELECT 1 AS one"
    Then I expect 1 database results
    And I expect "{{ ctx.dbResults[0].one }}" is "1"
