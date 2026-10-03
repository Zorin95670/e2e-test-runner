Feature: Kafka steps

  Scenario: Send and receive messages
    Given I setup kafka with clientId "e2e-test-runner" and broker "{{ env.KAFKA_BROKER }}"
    And I setup kafka producer
    When I send a Kafka message on the topic "{{ env.KAFKA_TOPIC }}" with body "{\"id\": 1, \"name\": \"John\"}"
    And I send a Kafka message on the topic "{{ env.KAFKA_TOPIC }}" with body:
      """
      {"id": 2, "name": "Jane"}
      """
    Given I setup kafka consumer with groupId "{{ env.KAFKA_TOPIC }}-group"
    And I listen for Kafka messages on the topic "{{ env.KAFKA_TOPIC }}"
    When I wait 10s
    Then I expect 2 messages received on Kafka topic "{{ env.KAFKA_TOPIC }}"
    And I expect a message on Kafka topic "{{ env.KAFKA_TOPIC }}" equals to "{\"id\":1,\"name\":\"John\"}"
    And I expect a message on Kafka topic "{{ env.KAFKA_TOPIC }}" equals to "{\"name\": \"Jane\", \"id\": 2}" as "json"
    And I expect a message on Kafka topic "{{ env.KAFKA_TOPIC }}" equals to:
      """
      {"id":2,"name":"Jane"}
      """
    And I expect a message on Kafka topic "{{ env.KAFKA_TOPIC }}" contains "John"
    And I expect a message on Kafka topic "{{ env.KAFKA_TOPIC }}" contains:
      """
      "name":"Jane"
      """
    And I expect a message on Kafka topic "{{ env.KAFKA_TOPIC }}" matches regex "\"id\":\d"
    And I log kafka messages
