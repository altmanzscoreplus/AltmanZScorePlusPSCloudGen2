import type { Analyzer, AnalyzerEmail, AnalyzerInvoice, AnalyzerLog } from 'src/types/analyzer';
import { applyPagination } from 'src/utils/apply-pagination';
import { applySort } from 'src/utils/apply-sort';
import { deepCopy } from 'src/utils/deep-copy';

import { analyzer, analyzers, emails, invoices, logs } from './data';

type GetAnalyzersRequest = {
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

type GetAnalyzersResponse = Promise<{
  data: Analyzer[];
  count: number;
}>;

type GetAnalyzerRequest = object;

type GetAnalyzerResponse = Promise<Analyzer>;

type GetAnalyzerEmailsRequest = object;

type GetAnalyzerEmailsResponse = Promise<AnalyzerEmail[]>;

type GetAnalyzerInvoicesRequest = object;

type GetAnalyzerInvoicesResponse = Promise<AnalyzerInvoice[]>;

type GetAnalyzerLogsRequest = object;

type GetAnalyzerLogsResponse = Promise<AnalyzerLog[]>;

class AnalyzersApi {
  getAnalyzers(request: GetAnalyzersRequest = {}): GetAnalyzersResponse {
    const { filters, page, rowsPerPage, sortBy, sortDir } = request;

    let data = deepCopy(analyzers) as Analyzer[];
    let count = data.length;

    if (typeof filters !== 'undefined') {
      data = data.filter((analyzer) => {
        if (typeof filters.query !== 'undefined' && filters.query !== '') {
          let queryMatched = false;
          const properties: ('email' | 'name')[] = ['email', 'name'];

          properties.forEach((property) => {
            if (analyzer[property].toLowerCase().includes(filters.query!.toLowerCase())) {
              queryMatched = true;
            }
          });

          if (!queryMatched) {
            return false;
          }
        }

        if (typeof filters.hasAcceptedMarketing !== 'undefined') {
          if (analyzer.hasAcceptedMarketing !== filters.hasAcceptedMarketing) {
            return false;
          }
        }

        if (typeof filters.isProspect !== 'undefined') {
          if (analyzer.isProspect !== filters.isProspect) {
            return false;
          }
        }

        if (typeof filters.isReturning !== 'undefined') {
          if (analyzer.isReturning !== filters.isReturning) {
            return false;
          }
        }

        return true;
      });
      count = data.length;
    }

    if (typeof sortBy !== 'undefined' && typeof sortDir !== 'undefined') {
      data = applySort(data, sortBy, sortDir);
    }

    if (typeof page !== 'undefined' && typeof rowsPerPage !== 'undefined') {
      data = applyPagination(data, page, rowsPerPage);
    }

    return Promise.resolve({
      data,
      count,
    });
  }

  getAnalyzer(request?: GetAnalyzerRequest): GetAnalyzerResponse {
    return Promise.resolve(deepCopy(analyzer));
  }

  getEmails(request?: GetAnalyzerEmailsRequest): GetAnalyzerEmailsResponse {
    return Promise.resolve(deepCopy(emails));
  }

  getInvoices(request?: GetAnalyzerInvoicesRequest): GetAnalyzerInvoicesResponse {
    return Promise.resolve(deepCopy(invoices));
  }

  getLogs(request?: GetAnalyzerLogsRequest): GetAnalyzerLogsResponse {
    return Promise.resolve(deepCopy(logs));
  }
}

export const analyzersApi = new AnalyzersApi();
