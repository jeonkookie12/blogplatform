const API_BASE_URL = 'http://localhost:3000';

const getToken = () => localStorage.getItem('token');

async function apiFetch(endpoint, method = 'GET', body = null, auth = false) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (auth) {
    const token = getToken();
    if (!token) throw new Error('No token found, please log in');
    headers['Authorization'] = `Bearer ${token}`;
  }
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'API request failed');
  return data;
}

export const register = (username, password) =>
  apiFetch('/auth/register', 'POST', { username, password });

export const login = (username, password) =>
  apiFetch('/auth/login', 'POST', { username, password });

export const getPosts = () => apiFetch('/posts');

export const getProfile = () => apiFetch('/auth/profile', 'GET', null, true);

export const createPost = (postData) =>
  apiFetch('/posts', 'POST', postData, true);

export const updatePost = (id, postData) =>
  apiFetch(`/posts/${id}`, 'PUT', postData, true);

export const deletePost = (id) => apiFetch(`/posts/${id}`, 'DELETE', null, true);

export const createComment = (postId, commentData) =>
  apiFetch(`/comments/${postId}`, 'POST', commentData, true);

export const updateComment = (id, commentData) =>
  apiFetch(`/comments/${id}`, 'PUT', commentData, true);

export const deleteComment = (id) =>
  apiFetch(`/comments/${id}`, 'DELETE', null, true);