import { apiRequest } from './api.ts';

export async function getWorkflows() {
  return apiRequest('/workflows');
}

export async function createWorkflow(data) {
  return apiRequest('/workflows', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getWorkflow(id) {
  return apiRequest(`/workflows/${id}`);
}

export async function updateWorkflow(id, data) {
  return apiRequest(`/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteWorkflow(id) {
  return apiRequest(`/workflows/${id}`, {
    method: 'DELETE',
  });
}

export async function deployWorkflow(id) {
  return apiRequest(`/workflows/${id}/deploy`, {
    method: 'POST',
  });
}
