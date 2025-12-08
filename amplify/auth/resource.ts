import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  name: 'ps-cloud-gen2',
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