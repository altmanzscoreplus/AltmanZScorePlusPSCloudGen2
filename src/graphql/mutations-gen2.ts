// Gen 2 GraphQL mutations - these will be auto-generated after deployment
// For now, this provides a simplified set of common mutations

export const createCustomer = /* GraphQL */ `
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
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

export const updateCustomer = /* GraphQL */ `
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
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

export const deleteCustomer = /* GraphQL */ `
  mutation DeleteCustomer($input: DeleteCustomerInput!) {
    deleteCustomer(input: $input) {
      id
    }
  }
`;

export const createContact = /* GraphQL */ `
  mutation CreateContact($input: CreateContactInput!) {
    createContact(input: $input) {
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

export const updateContact = /* GraphQL */ `
  mutation UpdateContact($input: UpdateContactInput!) {
    updateContact(input: $input) {
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

export const deleteContact = /* GraphQL */ `
  mutation DeleteContact($input: DeleteContactInput!) {
    deleteContact(input: $input) {
      id
    }
  }
`;

export const createGateway = /* GraphQL */ `
  mutation CreateGateway($input: CreateGatewayInput!) {
    createGateway(input: $input) {
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

export const updateGateway = /* GraphQL */ `
  mutation UpdateGateway($input: UpdateGatewayInput!) {
    updateGateway(input: $input) {
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

export const deleteGateway = /* GraphQL */ `
  mutation DeleteGateway($input: DeleteGatewayInput!) {
    deleteGateway(input: $input) {
      id
    }
  }
`;

export const createAnalyzer = /* GraphQL */ `
  mutation CreateAnalyzer($input: CreateAnalyzerInput!) {
    createAnalyzer(input: $input) {
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

export const updateAnalyzer = /* GraphQL */ `
  mutation UpdateAnalyzer($input: UpdateAnalyzerInput!) {
    updateAnalyzer(input: $input) {
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

export const deleteAnalyzer = /* GraphQL */ `
  mutation DeleteAnalyzer($input: DeleteAnalyzerInput!) {
    deleteAnalyzer(input: $input) {
      id
    }
  }
`;

export const createReading = /* GraphQL */ `
  mutation CreateReading($input: CreateReadingInput!) {
    createReading(input: $input) {
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

export const updateReading = /* GraphQL */ `
  mutation UpdateReading($input: UpdateReadingInput!) {
    updateReading(input: $input) {
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

export const deleteReading = /* GraphQL */ `
  mutation DeleteReading($input: DeleteReadingInput!) {
    deleteReading(input: $input) {
      id
    }
  }
`;

export const batchCreateContact = /* GraphQL */ `
  mutation BatchCreateContact($batchContactRecords: [BatchCreateContactInput!]!) {
    batchCreateContact(batchContactRecords: $batchContactRecords) {
      id
      customer_id
      client_id
      name
      title
      email
      alarm_level_phone
      alarm_level_email
      alarm_level_sms
      owner
      createdAt
      updatedAt
    }
  }
`;