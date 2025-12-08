// Examples of how to use Amplify Gen 2 APIs
import { generateClient } from 'aws-amplify/data';
import { signUp, signIn, signOut, getCurrentUser } from 'aws-amplify/auth';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../amplify/data/resource';

// Create the GraphQL client
const client = generateClient<Schema>();

// Authentication Examples
export const authExamples = {
  // Sign up a new user
  signUp: async (email: string, password: string) => {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      return { isSignUpComplete, userId, nextStep };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      });
      return { isSignedIn, nextStep };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign out user
  signOut: async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const currentUser = await getCurrentUser();
      return currentUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }
};

// Data API Examples
export const dataExamples = {
  // Create a customer
  createCustomer: async (customerData: {
    name: string;
    company: string;
    user_name: string;
    email?: string;
  }) => {
    try {
      const { data: customer, errors } = await client.models.Customer.create({
        name: customerData.name,
        nameLowerCase: customerData.name.toLowerCase(),
        company: customerData.company,
        companyLowerCase: customerData.company.toLowerCase(),
        user_name: customerData.user_name,
        status: 'Active',
        access_status: 'Enabled',
        enable_or_disable_alarm: true,
      });
      
      if (errors) {
        console.error('Errors creating customer:', errors);
      }
      
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // List customers
  listCustomers: async () => {
    try {
      const { data: customers, errors } = await client.models.Customer.list();
      
      if (errors) {
        console.error('Errors listing customers:', errors);
      }
      
      return customers;
    } catch (error) {
      console.error('Error listing customers:', error);
      throw error;
    }
  },

  // Get customer by ID
  getCustomer: async (customerId: string) => {
    try {
      const { data: customer, errors } = await client.models.Customer.get({
        id: customerId
      });
      
      if (errors) {
        console.error('Errors getting customer:', errors);
      }
      
      return customer;
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (customerId: string, updates: any) => {
    try {
      const { data: customer, errors } = await client.models.Customer.update({
        id: customerId,
        ...updates
      });
      
      if (errors) {
        console.error('Errors updating customer:', errors);
      }
      
      return customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Delete customer
  deleteCustomer: async (customerId: string) => {
    try {
      const { data, errors } = await client.models.Customer.delete({
        id: customerId
      });
      
      if (errors) {
        console.error('Errors deleting customer:', errors);
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Create gateway
  createGateway: async (gatewayData: {
    ps_gateway_id: string;
    model: string;
    serial_number: string;
    customer_id: string;
  }) => {
    try {
      const { data: gateway, errors } = await client.models.Gateway.create({
        ps_gateway_id: gatewayData.ps_gateway_id,
        model: gatewayData.model,
        serial_number: gatewayData.serial_number,
        customer_id: gatewayData.customer_id,
        active_inactive_status: 'Active',
        assigned_unassigned_status: 'Unassigned',
        allocated_unallocated_status: 'Unallocated',
        communication_status: 'Not_Detected',
        enable_or_disable_alarm: true,
      });
      
      if (errors) {
        console.error('Errors creating gateway:', errors);
      }
      
      return gateway;
    } catch (error) {
      console.error('Error creating gateway:', error);
      throw error;
    }
  },

  // Create analyzer
  createAnalyzer: async (analyzerData: {
    ps_analyzer_id: string;
    device_id: string;
    serial_number: string;
    gateway_id: string;
    customer_id: string;
  }) => {
    try {
      const { data: analyzer, errors } = await client.models.Analyzer.create({
        ps_analyzer_id: analyzerData.ps_analyzer_id,
        device_id: analyzerData.device_id,
        serial_number: analyzerData.serial_number,
        gateway_id: analyzerData.gateway_id,
        customer_id: analyzerData.customer_id,
        active_inactive_status: 'Active',
        assigned_unassigned_status: 'Unassigned',
        allocated_unallocated_status: 'Unallocated',
        communication_status: 'Not_Detected',
        enable_or_disable_alarm: true,
      });
      
      if (errors) {
        console.error('Errors creating analyzer:', errors);
      }
      
      return analyzer;
    } catch (error) {
      console.error('Error creating analyzer:', error);
      throw error;
    }
  },

  // Create reading
  createReading: async (readingData: {
    customer_id: string;
    gateway_id: string;
    analyzer_id: string;
    data: any;
  }) => {
    try {
      const now = new Date();
      const { data: reading, errors } = await client.models.Reading.create({
        customer_id: readingData.customer_id,
        gateway_id: readingData.gateway_id,
        analyzer_id: readingData.analyzer_id,
        sample_server_datetime: now.toISOString(),
        sample_server_epoch_time: Math.floor(now.getTime() / 1000),
        data: readingData.data,
      });
      
      if (errors) {
        console.error('Errors creating reading:', errors);
      }
      
      return reading;
    } catch (error) {
      console.error('Error creating reading:', error);
      throw error;
    }
  },
};

// Storage Examples
export const storageExamples = {
  // Upload file
  uploadFile: async (file: File, key: string) => {
    try {
      const result = await uploadData({
        key: key,
        data: file,
      }).result;
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Get file URL
  getFileUrl: async (key: string) => {
    try {
      const linkToStorageFile = await getUrl({
        key: key,
      });
      return linkToStorageFile.url;
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  },

  // Delete file
  deleteFile: async (key: string) => {
    try {
      await remove({
        key: key,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
};

// Subscription Examples
export const subscriptionExamples = {
  // Subscribe to customer creation
  subscribeToCustomerCreation: () => {
    const subscription = client.models.Customer.onCreate().subscribe({
      next: (data) => {
        console.log('New customer created:', data);
      },
      error: (error) => {
        console.error('Subscription error:', error);
      }
    });
    
    return subscription;
  },

  // Subscribe to reading creation
  subscribeToReadingCreation: () => {
    const subscription = client.models.Reading.onCreate().subscribe({
      next: (data) => {
        console.log('New reading created:', data);
      },
      error: (error) => {
        console.error('Subscription error:', error);
      }
    });
    
    return subscription;
  }
};