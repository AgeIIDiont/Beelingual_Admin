// topicApi.js - API service for Topics

const BASE_URL = 'http://localhost:3000'; // Thay đổi theo base URL của bạn

class TopicAPI {
  /**
   * Get all topics with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {string} params.level - Filter by level
   * @returns {Promise<Object>} - Topics data
   */
  static async getAllTopics(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.level) queryParams.append('level', params.level);

      const response = await fetch(`${BASE_URL}/api/topics?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  }

  /**
   * Get a single topic by ID
   * @param {string} id - Topic ID
   * @returns {Promise<Object>} - Topic data
   */
  static async getTopicById(id) {
    try {
      const response = await fetch(`${BASE_URL}/api/topics/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching topic:', error);
      throw error;
    }
  }

  /**
   * Create a new topic
   * @param {Object} topicData - Topic data
   * @returns {Promise<Object>} - Created topic
   */
  static async createTopic(topicData) {
    try {
      const response = await fetch(`${BASE_URL}/api/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  }

  /**
   * Update a topic
   * @param {string} id - Topic ID
   * @param {Object} topicData - Updated topic data
   * @returns {Promise<Object>} - Updated topic
   */
  static async updateTopic(id, topicData) {
    try {
      const response = await fetch(`${BASE_URL}/api/topics/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating topic:', error);
      throw error;
    }
  }

  /**
   * Delete a topic
   * @param {string} id - Topic ID
   * @returns {Promise<Object>} - Delete response
   */
  static async deleteTopic(id) {
    try {
      const response = await fetch(`${BASE_URL}/api/topics/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  }
}

export default TopicAPI;