export const paths = {
  index: '/',
  checkout: '/checkout',
  contact: '/contact',
  pricing: '/pricing',
  auth: {
    auth0: {
      callback: '/auth/auth0/callback',
      login: '/auth/auth0/login',
    },
    jwt: {
      login: '/auth/jwt/login',
      register: '/auth/jwt/register',
    },
    firebase: {
      login: '/auth/firebase/login',
      register: '/auth/firebase/register',
    },
    amplify: {
      confirmRegister: '/auth/power-sight/confirm-register',
      forgotPassword: '/auth/power-sight/forgot-password',
      login: '/auth/power-sight/login',
      register: '/auth/power-sight/register',
      resetPassword: '/auth/power-sight/reset-password',
      completeNewPassword: '/auth/power-sight/change-password',
      forgotPasswordSubmit: '/auth/power-sight/otp-verification',
    },
  },
  authDemo: {
    forgotPassword: {
      classic: '/auth-demo/forgot-password/classic',
      modern: '/auth-demo/forgot-password/modern',
    },
    login: {
      classic: '/auth-demo/login/classic',
      modern: '/auth-demo/login/modern',
    },
    register: {
      classic: '/auth-demo/register/classic',
      modern: '/auth-demo/register/modern',
    },
    resetPassword: {
      classic: '/auth-demo/reset-password/classic',
      modern: '/auth-demo/reset-password/modern',
    },
    verifyCode: {
      classic: '/auth-demo/verify-code/classic',
      modern: '/auth-demo/verify-code/modern',
    },
  },
  dashboard: {
    index: '/dashboard',
    gatewayresources : {
      index: '/dashboard/gatewayresources'
    },
    deviceresources:{
      index: '/dashboard/deviceresources'
    },
    dataview:{
      index: '/dashboard/dataview'
    },
		datamanagement:{ // VINCENT_NOTE: this is from src/pages/dashboard, and referenced by src/layouts/dashboard/config.tsx
      index: '/dashboard/datamanagement'
    },
		firmwaremanagement:{
      index: '/dashboard/firmwaremanagement'
    },
		firmwareupgrade:{
      index: '/dashboard/firmwareupgrade'
    },
    academy: {
      index: '/dashboard/academy',
      courseDetails: '/dashboard/academy/courses/:courseId',
    },
    account: '/dashboard/account',
    customerlanding: '/dashboard/customerlanding',
    analytics: '/dashboard/analytics',
    blank: '/dashboard/blank',
    blog: {
      index: '/dashboard/blog',
      postDetails: '/dashboard/blog/:postId',
      postCreate: '/dashboard/blog/create',
    },
    calendar: '/dashboard/calendar',
    chat: '/dashboard/chat',
    crypto: '/dashboard/crypto',
    admincontrol: {
      index: '/dashboard/admincontrol',
      details: '/dashboard/admincontrol/:admincontrolId',
      edit: '/dashboard/admincontrol/:admincontrolId/edit',
    },
    customercontrol: {
      index: '/dashboard/customercontrol',
      details: '/dashboard/customercontrol/:customercontrolId',
      edit: '/dashboard/customercontrol/:customercontrolId/edit',
    },
    networktopology:{
      index: '/dashboard/networktopology'
    },
    clientcontrol: {
      index: '/dashboard/clientcontrol',
      details: '/dashboard/clientcontrol/:clientcontrolId',
      edit: '/dashboard/clientcontrol/:clientcontrolId/edit',
    },
    customerinformation: {
      index: '/dashboard/customerinformation',
      details: '/dashboard/customerinformation/:customerinformationId',
      edit: '/dashboard/customerinformation/:customerinformationId/edit',
      create: '/dashboard/customerinformation/create',
    },
    clientinformation: {
      index: '/dashboard/clientinformation',
      details: '/dashboard/clientinformation/:clientinformationlId',
      edit: '/dashboard/clientinformation/:clientinformationId/edit',
    },
    admingatewayallocation: {
      index: '/dashboard/admingatewayallocation',
      details: '/dashboard/admingatewayallocation/:admingatewayallocationId',
      edit: '/dashboard/admingatewayallocation/:admingatewayallocationId/edit',
    },
    admingatewayassignment: {
      index: '/dashboard/admingatewayassignment',
      details: '/dashboard/admingatewayassignment/:admingatewayassignmentId',
      edit: '/dashboard/admingatewayassignment/:admingatewayassignmentId/edit',
    },
    gatewaycontrol: {
      index: '/dashboard/gatewaycontrol',
      details: '/dashboard/gatewaycontrol/:gatewaycontrolId',
      edit: '/dashboard/gatewaycontrol/:gatewaycontrolId/edit',
      create: '/dashboard/gatewaycontrol/information',
    },
    gatewayinformation: {
      index: '/dashboard/gatewayinformation',
      details: '/dashboard/gatewayinformation/:gatewayinformationId',
      edit: '/dashboard/gatewayinformation/:gatewayinformationId/edit',
      create: '/dashboard/gatewayinformation/create',
    },
    gatewayassignment: {
      index: '/dashboard/gatewayassignment',
      details: '/dashboard/gatewayassignment/:gatewayassignmentId',
      edit: '/dashboard/gatewayassignment/:gatewayassignmentId/edit',
      create: '/dashboard/gatewayassignment/create',
    },
    datadevicecontrol: {
      index: '/dashboard/datadevicecontrol',
      details: '/dashboard/datadevicecontrol/:datadevicecontrolId',
      edit: '/dashboard/datadevicecontrol/:datadevicecontrolId/edit',
    },
    customerdatadevicecontrol: {
      index: '/dashboard/customerdatadevicecontrol',
      details: '/dashboard/customerdatadevicecontrol/:customerdatadevicecontrolId',
      edit: '/dashboard/customerdatadevicecontrol/:customerdatadevicecontrolId/edit',
    },
    admindatadeviceinformation: {
      index: '/dashboard/admindatadeviceinformation',
      details: '/dashboard/admindatadeviceinformation/:admindatadeviceinformationId',
      edit: '/dashboard/admindatadeviceinformation/:admindatadeviceinformationId/edit',
    },
    customerdatadeviceinformation: {
      index: '/dashboard/customerdatadeviceinformation',
      details: '/dashboard/customerdatadeviceinformation/:customerdatadeviceinformationId',
      edit: '/dashboard/customerdatadeviceinformation/:customerdatadeviceinformationId/edit',
    },

    customerviewdeviceassignment: {
      index: '/dashboard/customerviewdeviceassignment',
      details: '/dashboard/customerviewdeviceassignment/:customerviewdeviceassignmentId',
      edit: '/dashboard/customerviewdeviceassignment/:customerviewdeviceassignmentId/edit',
    },
    adminviewdeviceassignment: {
      index: '/dashboard/adminviewdeviceassignment',
      details: '/dashboard/adminviewdeviceassignment/:adminviewdeviceassignmentId',
      edit: '/dashboard/adminviewdeviceassignment/:adminviewdeviceassignmentId/edit',
    },
    admindeviceallocation: {
      index: '/dashboard/admindeviceallocation',
      details: '/dashboard/admindeviceallocation/:admindeviceallocationId',
      edit: '/dashboard/admindeviceallocation/:admindeviceallocationId/edit',
    },
    ecommerce: '/dashboard/ecommerce',
    fileManager: '/dashboard/file-manager',
    invoices: {
      index: '/dashboard/invoices',
      details: '/dashboard/invoices/:orderId',
    },
    jobs: {
      index: '/dashboard/jobs',
      create: '/dashboard/jobs/create',
      companies: {
        details: '/dashboard/jobs/companies/:companyId',
      },
    },
    kanban: '/dashboard/kanban',
    logistics: {
      index: '/dashboard/logistics',
      fleet: '/dashboard/logistics/fleet',
    },
    mail: '/dashboard/mail',
    orders: {
      index: '/dashboard/orders',
      details: '/dashboard/orders/:orderId',
    },
    products: {
      index: '/dashboard/products',
      create: '/dashboard/products/create',
    },
    social: {
      index: '/dashboard/social',
      profile: '/dashboard/social/profile',
      feed: '/dashboard/social/feed',
    },
  },
  components: {
    index: '/components',
    dataDisplay: {
      detailLists: '/components/data-display/detail-lists',
      tables: '/components/data-display/tables',
      quickStats: '/components/data-display/quick-stats',
    },
    lists: {
      groupedLists: '/components/lists/grouped-lists',
      gridLists: '/components/lists/grid-lists',
    },
    forms: '/components/forms',
    modals: '/components/modals',
    charts: '/components/charts',
    buttons: '/components/buttons',
    typography: '/components/typography',
    colors: '/components/colors',
    inputs: '/components/inputs',
  },
  docs: 'https://powersight.com/support/',
  notAuthorized: '/401',
  notFound: '/404',
  serverError: '/500',
};
