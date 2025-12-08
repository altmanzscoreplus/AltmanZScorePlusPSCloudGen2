import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
    },
  },
  groups: [
    'Admin',
    'Client', 
    'Customer',
    'AdminMaster',
    'ClientMaster',
    'CustomerMaster'
  ],


  
// access: (allow) => [
//   allow.resource(auth).to(['listUsers', 'getUser'])
//     .amplifyGenerated()
// ]


});