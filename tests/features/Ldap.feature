Feature: LDAP steps

  Scenario: Add, search and delete entries
    Given I setup ldap with url "{{ env.LDAP_URL }}" bind dn "{{ env.LDAP_BIND_DN }}" and password "{{ env.LDAP_PASSWORD }}"
    When I add a ldap entry with dn "cn=john,{{ env.LDAP_BASE_DN }}" and with attributes:
      """
      {"cn": "john", "sn": "e2e", "objectClass": ["person"]}
      """
    And I add a ldap entry with dn "cn=jane,{{ env.LDAP_BASE_DN }}" and with attributes "{\"cn\": \"jane\", \"sn\": \"e2e\", \"objectClass\": [\"person\"]}"
    And I search ldap results on base dn "{{ env.LDAP_BASE_DN }}" with filter "(sn=e2e)" and attributes "cn sn"
    Then I expect 2 ldap results
    When I delete all ldap results
    And I search ldap results on base dn "{{ env.LDAP_BASE_DN }}" with filter "(sn=e2e)" and attributes "cn"
    Then I expect 0 ldap results
