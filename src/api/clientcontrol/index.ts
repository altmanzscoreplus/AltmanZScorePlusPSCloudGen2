import { applyPagination } from 'src/utils/apply-pagination';
import { applySort } from 'src/utils/apply-sort';
import { deepCopy } from 'src/utils/deep-copy';
// Import your GraphQL function to fetch clientcontrol data
import { API, graphqlOperation } from 'aws-amplify';
import * as queries from '../../graphql/queries';

type GetClientcontrolRequest = {
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

type GetClientcontrolResponse = Promise<{
  data: Clientcontrol[];
  count: number;
}>;

class ClientcontrolApi {
  async getClientcontrol(request: GetClientcontrolRequest = {}): GetClientcontrolResponse {
    const { filters, page, rowsPerPage, sortBy, sortDir } = request;

    try {
      // Fetch clientcontrol data from GraphQL endpoint
      const response = await API.graphql(graphqlOperation(queries.listClients));
      const clientcontrolData = response.data.listClients.items;

      // Adapt the structure of clientcontrolData to fit Clientcontrol[]

      let data: Clientcontrol[] = clientcontrolData;
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

export const clientcontrolApi = new ClientcontrolApi();
