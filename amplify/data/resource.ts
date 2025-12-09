import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // Enums
  ContactType: a.enum(['Primary', 'Secondary']),
  CustomerStatusType: a.enum(['Active', 'Inactive']),
  AccessStatusType: a.enum(['Enabled', 'Disabled']),
  ClientStatusType: a.enum(['Active', 'Inactive']),
  DeviceActiveInactiveStatusType: a.enum(['Active', 'Inactive']),
  DeviceAllocationStatusType: a.enum(['Allocated', 'Unallocated']),
  DeviceAssignmentStatusType: a.enum(['Assigned', 'Unassigned']),
  DeviceCommunicationStatusType: a.enum(['Communicating', 'Not_Detected', 'Archive', 'Offline']),
  DeviceType: a.enum(['Hundity_Sensor', 'Camera', 'Video', 'Unknown']),
  PSFileType: a.enum(['Log', 'Waveform']),
  AlarmLevelType: a.enum(['None', 'Level_1', 'Level_2', 'Level_3', 'Level_4', 'Level_5', 'Level_6', 'Level_7', 'Level_8', 'Level_9', 'Level_10']),
  OwnershipType: a.enum(['Owned', 'Rented']),
  TableType: a.enum(['Customer', 'Client', 'Analyzer', 'Gateway']),
  DeliveryMethodType: a.enum(['EMAIL', 'SMS', 'PHONE']),

  // Main Models
  Customer: a
    .model({
      ps_customer_id: a.string(),
      gateway_timeout: a.integer(),
      analyzer_timeout: a.integer(),
      name: a.string(),
      nameLowerCase: a.string(),
      status: a.ref('CustomerStatusType'),
      access_status: a.ref('AccessStatusType'),
      user_name: a.string(),
      company: a.string(),
      companyLowerCase: a.string(),
      enable_or_disable_alarm: a.boolean(),
      owner: a.string(),
    })
    .secondaryIndexes((index) => [
      index('ps_customer_id').name('byCustomerByPSCustomerId').queryField('getCustomerByPSCustomerId'),
      index('name').name('byCustomerByCustomerName').queryField('getCustomerByCustomerName'),
      index('nameLowerCase').name('byCustomerByCustomerNameLowerCase').queryField('getCustomerByCustomerNameLowerCase'),
      index('user_name').name('byCustomerByUserName').queryField('getCustomerByUserName'),
      index('company').name('byCustomerByCompanyName').queryField('getCustomerByCompanyName'),
      index('companyLowerCase').name('byCustomerByCompanyNameLowerCase').queryField('getCustomerByCompanyNameLowerCase'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.authenticated()
    ]),

  Contact: a
    .model({
      customer_id: a.id(),
      client_id: a.id(),
      name: a.string(),
      nameLowerCase: a.string(),
      title: a.string(),
      access_status: a.ref('AccessStatusType'),
      email: a.email(),
      phone: a.phone(),
      sms: a.phone(),
      alarm_level_phone: a.ref('AlarmLevelType'),
      alarm_level_email: a.ref('AlarmLevelType'),
      alarm_level_sms: a.ref('AlarmLevelType'),
      contact_type: a.ref('ContactType'),
      owner: a.string(),
      contact_order: a.integer(),
    })
    .secondaryIndexes((index) => [
      index('customer_id').name('ContactByCustomer').queryField('getContactByCustomerId'),
      index('client_id').name('ContactByClient').queryField('getContactByClient'),
      index('name').name('ContactByCustomerName').queryField('getContactByCustomerName'),
      index('nameLowerCase').name('ContactByCustomerNameLowerCase').queryField('getContactByCustomerNameLowerCase'),
      index('contact_type').name('ContactByContactType').queryField('getContactContactType'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.authenticated()
    ]),

  Gateway: a
    .model({
      ps_gateway_id: a.string(),
      model: a.string(),
      serial_number: a.string(),
      hw_ver: a.string(),
      fw_ver: a.string(),
      fw_status: a.string(),
      fw_status_updated: a.datetime(),
      options: a.string(),
      site_location: a.string(),
      room_location: a.string(),
      gps_location: a.string(),
      alarm_interval: a.integer(),
      alarm_level: a.ref('AlarmLevelType'),
      crsm: a.string(),
      customer_id: a.id(),
      client_id: a.id(),
      owner: a.string(),
      active_inactive_status: a.ref('DeviceActiveInactiveStatusType'),
      assigned_unassigned_status: a.ref('DeviceAssignmentStatusType'),
      allocated_unallocated_status: a.ref('DeviceAllocationStatusType'),
      communication_status: a.ref('DeviceCommunicationStatusType'),
      enable_or_disable_alarm: a.boolean(),
    })
    .secondaryIndexes((index) => [
      index('ps_gateway_id').name('byGatewayByPSGatewayId').queryField('getGatewayByPSGatewayId'),
      index('crsm').name('byGatewayBycrsm').queryField('getGatewayBycrsm'),
      index('customer_id').name('byGatewayByCustomer').queryField('getGatewayByCustomerId'),
      index('client_id').name('byGatewayByClient').queryField('getGatewayByClientId'),
      index('active_inactive_status').name('byGatewayByActiveInactiveStatus').queryField('getGatewayByActiveInactiveStatus'),
      index('assigned_unassigned_status').name('byGatewayByAssignmentStatus').queryField('getGatewayByAssignmentStatus'),
      index('allocated_unallocated_status').name('byGatewayByAllocationStatus').queryField('getGatewayByAllocationStatus'),
      index('communication_status').name('byGatewayByCommunicationStatus').queryField('getGatewayByCommunicationStatus'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  Analyzer: a
    .model({
      ps_analyzer_id: a.string(),
      device_id: a.string(),
      serial_number: a.string(),
      device_type: a.string(),
      model: a.string(),
      hw_ver: a.string(),
      fw_ver: a.string(),
      fw_status: a.string(),
      fw_status_updated: a.datetime(),
      options: a.string(),
      crsm: a.string(),
      gateway_id: a.id(),
      active_inactive_status: a.ref('DeviceActiveInactiveStatusType'),
      assigned_unassigned_status: a.ref('DeviceAssignmentStatusType'),
      allocated_unallocated_status: a.ref('DeviceAllocationStatusType'),
      communication_status: a.ref('DeviceCommunicationStatusType'),
      site_location: a.string(),
      room_location: a.string(),
      circuit: a.string(),
      gps_location: a.string(),
      customer_id: a.id(),
      client_id: a.id(),
      calibration: a.date(),
      warranty: a.date(),
      owner: a.string(),
      enable_or_disable_alarm: a.boolean(),
    })
    .secondaryIndexes((index) => [
      index('ps_analyzer_id').name('byAnalyzerByPSAnalyzerId').queryField('getAnalyzerByPSAnalyzerId'),
      index('crsm').name('byAnalyzerBycrsm').queryField('getAnalyzerBycrsm'),
      index('gateway_id').name('byAnalyzerByGateway').queryField('getAnalyzerByGatewayId'),
      index('active_inactive_status').name('byAnalyzerByActiveInactiveStatus').queryField('getAnalyzerByActiveInactiveStatus'),
      index('assigned_unassigned_status').name('byAnalyzerByAssignmentStatus').queryField('getAnalyzerByAssignmentStatus'),
      index('allocated_unallocated_status').name('byAnalyzerByAllocationStatus').queryField('getAnalyzerByAllocationStatus'),
      index('communication_status').name('byAnalyzerByCommunicationStatus').queryField('getAnalyzerByCommunicationStatus'),
      index('customer_id').name('byAnalyzerByCustomer').queryField('getAnalyzerByCustomerId'),
      index('client_id').name('byAnalyzerByClient').queryField('getAnalyzerByClientId'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  Client: a
    .model({
      ps_client_id: a.string(),
      customer_id: a.id(),
      user_name: a.string(),
      gateway_timeout: a.integer(),
      analyzer_timeout: a.integer(),
      name: a.string(),
      nameLowerCase: a.string(),
      contact_type: a.ref('ContactType'),
      access_status: a.ref('AccessStatusType'),
      status: a.ref('ClientStatusType'),
      alarm_threshold_in_seconds: a.integer(),
      owner: a.string(),
      enable_or_disable_alarm: a.boolean(),
    })
    .secondaryIndexes((index) => [
      index('ps_client_id').name('byClientByPSClientId').queryField('getClientByPSClientId'),
      index('customer_id').name('byClientByCustomer').queryField('getClientByCustomerId'),
      index('user_name').name('byClientNameByUserName').queryField('getClientNameByUserName'),
      index('name').name('byClientNameByClientName').queryField('getClientNameByClientName'),
      index('nameLowerCase').name('byClientByClientNameLowerCase').queryField('getClientByClientNameLowerCase'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin', 'AdminMaster']),
      allow.groups(['Customer']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  Reading: a
    .model({
      customer_id: a.id(),
      client_id: a.id(),
      gateway_id: a.id(),
      gateway_rental_id: a.id(),
      analyzer_id: a.id(),
      analyzer_rental_id: a.id(),
      sample_server_datetime: a.datetime(),
      sample_server_epoch_time: a.integer(),
      sample_device_datetime: a.datetime(),
      sample_device_epoch_time: a.integer(),
      data: a.json(),
      owner: a.string(),
    })
    .secondaryIndexes((index) => [
      index('customer_id').name('byReadingByCustomer').queryField('getReadingByCustomerId'),
      index('client_id').name('byReadingByClient').queryField('getReadingByClientId'),
      index('gateway_id').name('byReadingByGateway').queryField('getReadingByGatewayId'),
      index('gateway_rental_id').name('byReadingByGatewayRental').queryField('getReadingByGatewayRentalId'),
      index('analyzer_id').name('byReadingByAnalyzer').queryField('getReadingByAnalyzerId'),
      index('analyzer_rental_id').name('byReadingByAnalyzerRental').queryField('getReadingByAnalyzerRentalId'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  GatewayRental: a
    .model({
      ownership_type: a.ref('OwnershipType'),
      gateway_id: a.id(),
      customer_id: a.id(),
      client_id: a.id(),
      ref_order: a.string(),
      termination_date: a.date(),
      room: a.string(),
      site: a.string(),
      owner: a.string(),
      end_date: a.date(),
      access_end_date: a.date(),
    })
    .secondaryIndexes((index) => [
      index('gateway_id').name('byGatewayRentalByGateway').queryField('getGatewayrRentalByGateway'),
      index('customer_id').name('byGatewayRentalByCustomer').queryField('getGatewayrRentalByCustomer'),
      index('client_id').name('byGatewayRentalByClient').queryField('getGatewayrRentalByClient'),
      index('room').name('ByGatewayRentalByRoom').queryField('getGatewayRentalByRoom'),
      index('site').name('ByGatewayRentalBySite').queryField('getGatewayRentalBySite'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  AnalyzerRental: a
    .model({
      ownership_type: a.ref('OwnershipType'),
      analyzer_id: a.id(),
      gateway_id: a.id(),
      customer_id: a.id(),
      client_id: a.id(),
      ref_order: a.string(),
      termination_date: a.date(),
      circuit: a.string(),
      room: a.string(),
      site: a.string(),
      owner: a.string(),
      end_date: a.date(),
      access_end_date: a.date(),
    })
    .secondaryIndexes((index) => [
      index('analyzer_id').name('byAnalyzerRentalByAnalyzer').queryField('getAnalyzerRentalByAnalyzerId'),
      index('gateway_id').name('byAnalyzerRentalByGateway').queryField('getAnalyzerRentalByGatewayId'),
      index('customer_id').name('byAnalyzerRentalByCustomer').queryField('getAnalyzerRentalByCustomer'),
      index('client_id').name('byAnalyzerRentalByClient').queryField('getAnalyzerRentalByClient'),
      index('circuit').name('ByAnalyzeRentalByCircuit').queryField('getAnalyzeRentalByCircuit'),
      index('room').name('ByAnalyzeRentalByRoom').queryField('getAnalyzeRentalByRoom'),
      index('site').name('ByAnalyzeRentalBySite').queryField('getAnalyzeRentalBySite'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  PSFile: a
    .model({
      file_type: a.ref('PSFileType'),
      domain_id: a.id(),
      customer_id: a.id(),
      client_id: a.id(),
      gateway_id: a.id(),
      gateway_rental_id: a.id(),
      analyzer_id: a.id(),
      analyzer_rental_id: a.id(),
      sample_server_datetime: a.datetime(),
      sample_server_epoch_time: a.integer(),
      sample_device_datetime: a.datetime(),
      sample_device_epoch_time: a.integer(),
      owner: a.string(),
    })
    .secondaryIndexes((index) => [
      index('domain_id').name('byPSFileByDomain').queryField('getPSFileByDomainId'),
      index('customer_id').name('byPSFileByCustomer').queryField('getPSFileByCustomerId'),
      index('client_id').name('byPSFileByClient').queryField('getPSFileByClientId'),
      index('gateway_id').name('byPSFileByGateway').queryField('getPSFileByGatewayId'),
      index('gateway_rental_id').name('byPSFileByGatewayRental').queryField('getPSFileByGatewayRentalId'),
      index('analyzer_id').name('byPSFileByAnalyzer').queryField('getPSFileByAnalyzerId'),
      index('analyzer_rental_id').name('byPSFileByAnalyzerRental').queryField('getPSFileByAnalyzerRentalId'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin', 'AdminMaster']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  Domain: a
    .model({
      data_from: a.datetime(),
      termination: a.datetime(),
      access: a.datetime(),
      domain_status: a.string(),
      originator: a.string(),
      power_type: a.string(),
      power_source: a.string(),
      load_type: a.string(),
      app_type: a.string(),
      additional_domain_characterstics: a.string(),
      customer_id: a.id(),
      client_id: a.id(),
      gateway_id: a.id(),
      gateway_rental_id: a.id(),
      analyzer_id: a.id(),
      analyzer_rental_id: a.id(),
      owner: a.string(),
    })
    .secondaryIndexes((index) => [
      index('customer_id').name('byDomainByCustomer').queryField('getDomainByCustomerId'),
      index('client_id').name('byDomainByClient').queryField('getDomainByClientId'),
      index('gateway_id').name('byDomainByGateway').queryField('getDomainByGatewayrId'),
      index('gateway_rental_id').name('byDomainByGatewayrRental').queryField('getDomainByGatewayrRentalId'),
      index('analyzer_id').name('byDomainByAnalyzer').queryField('getDomainByAnalyzerId'),
      index('analyzer_rental_id').name('byDomainByAnalyzerRental').queryField('getDomainByAnalyzerRentalId'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin', 'AdminMaster']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

Events: a
  .model({
    eventID: a.string().required(),
    epochTime: a.integer(),
  })

  .authorization((allow) => [
    allow.owner(),
    allow.groups(['Admin', 'AdminMaster']),
    allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
    allow.authenticated()
  ]),


    
  AutoIncrementedId: a
    .model({
      table: a.ref('TableType').required(),
      id: a.integer().required(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin', 'AdminMaster']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  DeviceStatus: a
    .model({
      device_id: a.string().required(),
      last_seen: a.integer(),
      alert_level: a.integer(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin', 'AdminMaster']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  UserLastSelected: a
    .model({
      userId: a.string().required(),
      lastSelected: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin', 'AdminMaster']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  EMailAlertSent: a
    .model({
      device_id: a.string().required(),
      email_sent: a.integer(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin', 'AdminMaster']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  // Alarm Level and Interval Models
  GatewayAlarmLevelAndInterval: a
    .model({
      gateway_id: a.id(),
      alarm_interval: a.integer(),
      alarm_level: a.ref('AlarmLevelType'),
    })
    .secondaryIndexes((index) => [
      index('gateway_id').name('byGatewayAlarmLevelAndIntervalByGatewayId').queryField('getGatewayAlarmLevelAndIntervalByGatewayId'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  AnalyzerAlarmLevelAndInterval: a
    .model({
      analyzer_id: a.id(),
      alarm_interval: a.integer(),
      alarm_level: a.ref('AlarmLevelType'),
    })
    .secondaryIndexes((index) => [
      index('analyzer_id').name('byAnalyzerAlarmLevelAndIntervalByAnalyzerId').queryField('getAnalyzerAlarmLevelAndIntervalByAnalyzerId'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  CustomerAlarmLevelAndInterval: a
    .model({
      customer_id: a.id(),
      device_type: a.ref('TableType'),
      alarm_interval: a.integer(),
      alarm_level: a.ref('AlarmLevelType'),
    })
    .secondaryIndexes((index) => [
      index('customer_id').name('byCustomerAlarmLevelAndIntervalByCustomerId').queryField('getCustomerAlarmLevelAndIntervalByCustomerId'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  ClientAlarmLevelAndInterval: a
    .model({
      client_id: a.id(),
      device_type: a.ref('TableType'),
      alarm_interval: a.integer(),
      alarm_level: a.ref('AlarmLevelType'),
    })

    .secondaryIndexes((index) => [
      index('client_id').name('byClientAlarmLevelAndIntervalByClientId').queryField('getClientAlarmLevelAndIntervalByClientId'),
    ])

    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  GlobalAlarmLevelAndInterval: a
    .model({
      alarm_interval: a.integer(),
      alarm_level: a.ref('AlarmLevelType'),
      device_type: a.ref('TableType'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  AlarmSent: a
    .model({
      device_id: a.string().required(),
      crsm: a.string().required(),
      device_type: a.ref('TableType'),
      alarm_sent_at: a.float().required(),
      alarm_delivery_method: a.ref('DeliveryMethodType'),
      alarm_recipient: a.string().required(),
    })
    .secondaryIndexes((index) => [
      index('device_id').name('byDevice').sortKeys(['alarm_sent_at']),
      index('crsm').name('byCrsm').sortKeys(['alarm_sent_at']),
      index('alarm_recipient').name('byAlarmRecipient').queryField('getAlarmSentByRecipient'),
    ])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin', 'AdminMaster']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  AdminAlarmLevelAndInterval: a
    .model({
      alarm_interval: a.integer(),
      alarm_level: a.ref('AlarmLevelType'),
      device_type: a.ref('TableType'),
    })
    
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  AdminContact: a
    .model({
      name: a.string(),
      email: a.email(),
      phone: a.phone(),
      alarm_level_phone: a.ref('AlarmLevelType'),
      alarm_level_email: a.ref('AlarmLevelType'),
      alarm_level_sms: a.ref('AlarmLevelType'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin']),
      allow.authenticated()
    ]),

  AlarmMessage: a
    .model({
      alarm_level: a.string().required(),
      message: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin'])
    ]),

  ReadingTest: a
    .model({
      analyzer_id: a.string().required(),
      createdAt: a.datetime().required(),
      updatedat: a.datetime(),
      expireAt: a.datetime(),
      expireAtEpochTime: a.integer(),
      gateway_id: a.id(),
      data: a.json(),
      owner: a.string(),
    })
    .identifier(['analyzer_id', 'createdAt'])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin', 'AdminMaster']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  Phone: a
    .model({
      phone: a.phone().required(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin', 'AdminMaster']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  DynamoDBEvents: a
    .model({
      eventid: a.string().required(),
      ttl: a.integer(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['Admin', 'AdminMaster']),
      allow.groups(['Customer', 'Client', 'CustomerMaster', 'ClientMaster']).to(['read', 'create', 'update']),
      allow.authenticated()
    ]),

  // Custom mutations
  batchCreateContact: a
    .mutation()
    .arguments({
      batchContactRecords: a.ref('BatchCreateContactInput').array()
    })
    .returns(a.ref('Contact').array())
    .handler(a.handler.custom({ entry: './batchCreateContact.js' }))
    .authorization((allow) => [
      allow.authenticated()
    ]),

  BatchCreateContactInput: a.customType({
    id: a.id(),
    customer_id: a.id(),
    name: a.string(),
    title: a.string(),
    email: a.email(),
    alarm_level_phone: a.ref('AlarmLevelType'),
    alarm_level_email: a.ref('AlarmLevelType'),
    alarm_level_sms: a.ref('AlarmLevelType'),
    owner: a.string(),
  }),

  // OpenSearch Search Operations (Custom Queries)
  SearchResult: a.customType({
    items: a.json().array(),
    total: a.integer(),
    nextToken: a.string(),
  }),

  searchCustomers: a
    .query()
    .arguments({
      searchTerm: a.string().required(),
      limit: a.integer(),
      nextToken: a.string(),
    })
    .returns(a.ref('SearchResult'))
    .handler(a.handler.custom({ entry: './searchCustomers.js' }))
    .authorization((allow) => [
      allow.authenticated()
    ]),

  searchContacts: a
    .query()
    .arguments({
      searchTerm: a.string().required(),
      limit: a.integer(),
      nextToken: a.string(),
    })
    .returns(a.ref('SearchResult'))
    .handler(a.handler.custom({ entry: './searchContacts.js' }))
    .authorization((allow) => [
      allow.authenticated()
    ]),

  searchGateways: a
    .query()
    .arguments({
      searchTerm: a.string().required(),
      limit: a.integer(),
      nextToken: a.string(),
    })
    .returns(a.ref('SearchResult'))
    .handler(a.handler.custom({ entry: './searchGateways.js' }))
    .authorization((allow) => [
      allow.authenticated()
    ]),

  searchAnalyzers: a
    .query()
    .arguments({
      searchTerm: a.string().required(),
      limit: a.integer(),
      nextToken: a.string(),
    })
    .returns(a.ref('SearchResult'))
    .handler(a.handler.custom({ entry: './searchAnalyzers.js' }))
    .authorization((allow) => [
      allow.authenticated()
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  name: 'ps-cloud-gen2',
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
  // Configure DynamoDB streams for searchable models
  // This will be connected to OpenSearch sync function via CDK
});

// Add TABLE_SUFFIX environment variable
// Set to "NONE" for all environments (no table suffix)
data.resources.cfnResources.amplifyDynamoDbTables.forEach((table) => {
  table.addPropertyOverride('TableName', `${table.tableName}-dev`);
});