// Gen 2 GraphQL queries - these will be auto-generated after deployment
// For now, this provides a simplified set of common queries

export const getCustomer = /* GraphQL */ `
  query GetCustomer($id: ID!) {
    getCustomer(id: $id) {
      id
      ps_customer_id
      gateway_timeout
      analyzer_timeout
      name
      nameLowerCase
      status
      access_status
      user_name
      company
      companyLowerCase
      owner
      enable_or_disable_alarm
      createdAt
      updatedAt
    }
  }
`;

export const listCustomers = /* GraphQL */ `
  query ListCustomers(
    $limit: Int
    $nextToken: String
  ) {
    listCustomers(limit: $limit, nextToken: $nextToken) {
      items {
        id
        ps_customer_id
        gateway_timeout
        analyzer_timeout
        name
        nameLowerCase
        status
        access_status
        user_name
        company
        companyLowerCase
        owner
        enable_or_disable_alarm
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getContact = /* GraphQL */ `
  query GetContact($id: ID!) {
    getContact(id: $id) {
      id
      customer_id
      client_id
      name
      nameLowerCase
      title
      access_status
      email
      phone
      sms
      alarm_level_phone
      alarm_level_email
      alarm_level_sms
      contact_type
      owner
      contact_order
      createdAt
      updatedAt
    }
  }
`;

export const listContacts = /* GraphQL */ `
  query ListContacts(
    $limit: Int
    $nextToken: String
  ) {
    listContacts(limit: $limit, nextToken: $nextToken) {
      items {
        id
        customer_id
        client_id
        name
        nameLowerCase
        title
        access_status
        email
        phone
        sms
        alarm_level_phone
        alarm_level_email
        alarm_level_sms
        contact_type
        owner
        contact_order
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getGateway = /* GraphQL */ `
  query GetGateway($id: ID!) {
    getGateway(id: $id) {
      id
      ps_gateway_id
      model
      serial_number
      hw_ver
      fw_ver
      fw_status
      fw_status_updated
      options
      site_location
      room_location
      gps_location
      alarm_interval
      alarm_level
      crsm
      customer_id
      client_id
      owner
      active_inactive_status
      assigned_unassigned_status
      allocated_unallocated_status
      communication_status
      enable_or_disable_alarm
      createdAt
      updatedAt
    }
  }
`;

export const listGateways = /* GraphQL */ `
  query ListGateways(
    $limit: Int
    $nextToken: String
  ) {
    listGateways(limit: $limit, nextToken: $nextToken) {
      items {
        id
        ps_gateway_id
        model
        serial_number
        hw_ver
        fw_ver
        fw_status
        fw_status_updated
        options
        site_location
        room_location
        gps_location
        alarm_interval
        alarm_level
        crsm
        customer_id
        client_id
        owner
        active_inactive_status
        assigned_unassigned_status
        allocated_unallocated_status
        communication_status
        enable_or_disable_alarm
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getAnalyzer = /* GraphQL */ `
  query GetAnalyzer($id: ID!) {
    getAnalyzer(id: $id) {
      id
      ps_analyzer_id
      device_id
      serial_number
      device_type
      model
      hw_ver
      fw_ver
      fw_status
      fw_status_updated
      options
      crsm
      gateway_id
      active_inactive_status
      assigned_unassigned_status
      allocated_unallocated_status
      communication_status
      site_location
      room_location
      circuit
      gps_location
      customer_id
      client_id
      calibration
      warranty
      owner
      enable_or_disable_alarm
      createdAt
      updatedAt
    }
  }
`;

export const listAnalyzers = /* GraphQL */ `
  query ListAnalyzers(
    $limit: Int
    $nextToken: String
  ) {
    listAnalyzers(limit: $limit, nextToken: $nextToken) {
      items {
        id
        ps_analyzer_id
        device_id
        serial_number
        device_type
        model
        hw_ver
        fw_ver
        fw_status
        fw_status_updated
        options
        crsm
        gateway_id
        active_inactive_status
        assigned_unassigned_status
        allocated_unallocated_status
        communication_status
        site_location
        room_location
        circuit
        gps_location
        customer_id
        client_id
        calibration
        warranty
        owner
        enable_or_disable_alarm
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getReading = /* GraphQL */ `
  query GetReading($id: ID!) {
    getReading(id: $id) {
      id
      customer_id
      client_id
      gateway_id
      gateway_rental_id
      analyzer_id
      analyzer_rental_id
      sample_server_datetime
      sample_server_epoch_time
      sample_device_datetime
      sample_device_epoch_time
      data
      owner
      createdAt
      updatedAt
    }
  }
`;

export const listReadings = /* GraphQL */ `
  query ListReadings(
    $limit: Int
    $nextToken: String
  ) {
    listReadings(limit: $limit, nextToken: $nextToken) {
      items {
        id
        customer_id
        client_id
        gateway_id
        gateway_rental_id
        analyzer_id
        analyzer_rental_id
        sample_server_datetime
        sample_server_epoch_time
        sample_device_datetime
        sample_device_epoch_time
        data
        owner
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;