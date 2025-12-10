import { applyPagination } from 'src/utils/apply-pagination';
import { applySort } from 'src/utils/apply-sort';
import { deepCopy } from 'src/utils/deep-copy';
// Import your GraphQL function to fetch clientcontrol data
import { API, graphqlOperation } from 'aws-amplify';
import * as queries from '../../graphql/queries';

type GetCustomercontrolRequest = {
  filters?: {
    query?: string;
    hasAcceptedMarketing?: boolean;
    isProspect?: boolean;
    isReturning?: boolean;
  };
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

type GetCustomercontrolResponse = Promise<{
  data: Customercontrol[];
  count: number;
}>;

class CustomercontrolApi {
  async getCustomercontrol(request: GetCustomercontrolRequest = {}): GetCustomercontrolResponse {
    const { filters, page, rowsPerPage, sortBy, sortDir } = request;

    try {
      // Fetch clientcontrol data from GraphQL endpoint
      const response = await API.graphql(graphqlOperation(queries.listCustomers));
      const customercontrolData = response.data.listCustomers.items;
      console.log(customercontrolData, 'rrm877777777777777777777777777777777');
      // Adapt the structure of clientcontrolData to fit Clientcontrol[]

      let data: Customercontrol[] = customercontrolData;
      // Apply filters if provided
      if (filters) {
        data = data.filter((analyzer) => {
          // Apply filtering logic here
        });
      }

      // Apply sorting if provided
      if (sortBy && sortDir) {
        data = applySort(data, sortBy, sortDir);
      }

      // Apply pagination if provided
      if (page !== undefined && rowsPerPage !== undefined) {
        data = applyPagination(data, page, rowsPerPage);
      }

      return {
        data,
        count: data.length,
      };
    } catch (error) {
      console.error('Error fetching clientcontrol data:', error);
      // Handle error appropriately
      throw error;
    }
  }
}

export const customercontrolApi = new CustomercontrolApi();
